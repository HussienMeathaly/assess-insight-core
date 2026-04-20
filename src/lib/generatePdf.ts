// PDF generation via single-pass HTML rasterization (html2canvas + jsPDF).
// Each top-level [data-pdf-page] element starts on its own PDF page.
// Inside a page group, [data-pdf-block] children are kept together when
// possible. If a page group is taller than one A4 page, it overflows
// across multiple pages while still trying to break at block boundaries.

export interface GeneratePdfOptions {
  element: HTMLElement;
  fileName: string;
  scale?: number;
  blockSelector?: string; // e.g. '[data-pdf-block]'
  pageSelector?: string;  // e.g. '[data-pdf-page]'
  logoUrl?: string;       // unused (kept for API compatibility)
  footerText?: string;
}

interface PxRange {
  topPx: number;
  bottomPx: number;
}

const waitForAssets = async (root: HTMLElement) => {
  await (document as any).fonts?.ready;
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if ((img as HTMLImageElement).complete) return resolve();
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        })
    )
  );
};

// Render a small HTML snippet to a canvas (used for the footer so Arabic
// renders via the browser, not jsPDF's Latin-only built-in fonts).
const renderHtmlToCanvas = async (
  html: string,
  widthPx: number,
  heightPx: number,
  scale: number
): Promise<HTMLCanvasElement> => {
  const { default: html2canvas } = await import('html2canvas');
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.width = `${widthPx}px`;
  wrapper.style.height = `${heightPx}px`;
  wrapper.style.background = '#ffffff';
  wrapper.style.fontFamily = "'Readex Pro', system-ui, sans-serif";
  wrapper.setAttribute('dir', 'rtl');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  try {
    const canvas = await html2canvas(wrapper, {
      scale,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });
    return canvas;
  } finally {
    document.body.removeChild(wrapper);
  }
};

const offsetWithin = (el: HTMLElement, root: HTMLElement): number => {
  let y = 0;
  let cur: HTMLElement | null = el;
  while (cur && cur !== root) {
    y += cur.offsetTop;
    cur = cur.offsetParent as HTMLElement | null;
  }
  return y;
};

const collectBlockRanges = (
  blocks: HTMLElement[],
  root: HTMLElement,
  pxPerCssPx: number,
  fullCanvasHeight: number,
  maxSliceCssPx: number,
  rangeBoundsCss?: { topCssPx: number; bottomCssPx: number }
): PxRange[] => {
  const ranges: PxRange[] = [];

  const pushRange = (topCssPx: number, bottomCssPx: number) => {
    if (rangeBoundsCss) {
      topCssPx = Math.max(topCssPx, rangeBoundsCss.topCssPx);
      bottomCssPx = Math.min(bottomCssPx, rangeBoundsCss.bottomCssPx);
    }
    const topPx = Math.max(0, Math.round(topCssPx * pxPerCssPx));
    const bottomPx = Math.min(fullCanvasHeight, Math.round(bottomCssPx * pxPerCssPx));
    if (bottomPx > topPx) ranges.push({ topPx, bottomPx });
  };

  const recurse = (node: HTMLElement, depth = 0) => {
    const topCssPx = offsetWithin(node, root);
    const bottomCssPx = topCssPx + node.offsetHeight;

    if (node.offsetHeight <= maxSliceCssPx || depth >= 6 || node.children.length === 0) {
      pushRange(topCssPx, bottomCssPx);
      return;
    }

    const childElements = Array.from(node.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.offsetHeight > 0
    );
    if (childElements.length === 0) {
      pushRange(topCssPx, bottomCssPx);
      return;
    }
    for (const child of childElements) recurse(child, depth + 1);
  };

  for (const block of blocks) recurse(block);
  return ranges.sort((a, b) => a.topPx - b.topPx);
};

const packRangesIntoPages = (
  ranges: PxRange[],
  groupTopPx: number,
  groupBottomPx: number,
  maxSlicePx: number
): PxRange[] => {
  const pages: PxRange[] = [];
  if (ranges.length === 0) {
    pages.push({ topPx: groupTopPx, bottomPx: groupBottomPx });
    return pages;
  }

  let pageTopPx = groupTopPx;
  let lastSafeBottomPx = pageTopPx;
  let i = 0;

  while (i < ranges.length) {
    const block = ranges[i];
    if (block.topPx > pageTopPx && block.bottomPx - pageTopPx > maxSlicePx && lastSafeBottomPx > pageTopPx) {
      pages.push({ topPx: pageTopPx, bottomPx: lastSafeBottomPx });
      pageTopPx = block.topPx;
      lastSafeBottomPx = pageTopPx;
      continue;
    }

    const candidateBottomPx = Math.max(lastSafeBottomPx, block.bottomPx);
    if (candidateBottomPx - pageTopPx <= maxSlicePx) {
      lastSafeBottomPx = candidateBottomPx;
      i++;
      continue;
    }

    if (lastSafeBottomPx > pageTopPx) {
      pages.push({ topPx: pageTopPx, bottomPx: lastSafeBottomPx });
      pageTopPx = lastSafeBottomPx;
      lastSafeBottomPx = pageTopPx;
      continue;
    }

    // Single block taller than one page: force-split.
    const forcedBottomPx = Math.min(pageTopPx + maxSlicePx, groupBottomPx);
    if (forcedBottomPx <= pageTopPx) break;
    pages.push({ topPx: pageTopPx, bottomPx: forcedBottomPx });
    pageTopPx = forcedBottomPx;
    lastSafeBottomPx = pageTopPx;
  }

  if (pageTopPx < groupBottomPx) {
    pages.push({ topPx: pageTopPx, bottomPx: groupBottomPx });
  }
  return pages;
};

export const generateReportPdfFromElement = async ({
  element,
  fileName,
  scale = 2,
  blockSelector = '[data-pdf-block]',
  pageSelector = '[data-pdf-page]',
  footerText = 'نظام +PROFIT للتقييم',
}: GeneratePdfOptions): Promise<void> => {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  await waitForAssets(element);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const sideMarginMm = 8;
  const topMarginMm = 8;
  const footerHeightMm = 10;
  const contentTopMm = topMarginMm;
  const contentBottomMm = pageHeightMm - footerHeightMm;
  const usableWidthMm = pageWidthMm - sideMarginMm * 2;
  const usableHeightMm = contentBottomMm - contentTopMm;

  // ===== Single full-container render =====
  const fullCanvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const cssWidth = element.getBoundingClientRect().width;
  const pxPerCssPx = fullCanvas.width / cssWidth;
  const pxPerMm = fullCanvas.width / usableWidthMm;
  const maxSlicePx = Math.floor(usableHeightMm * pxPerMm);
  const maxSliceCssPx = maxSlicePx / pxPerCssPx;

  // ===== Identify page groups =====
  const pageGroups = Array.from(element.querySelectorAll<HTMLElement>(pageSelector));

  // Build PDF pages
  const allPages: PxRange[] = [];

  const buildPagesForGroup = (group: HTMLElement) => {
    const groupTopCss = offsetWithin(group, element);
    const groupBottomCss = groupTopCss + group.offsetHeight;
    const groupTopPx = Math.max(0, Math.round(groupTopCss * pxPerCssPx));
    const groupBottomPx = Math.min(fullCanvas.height, Math.round(groupBottomCss * pxPerCssPx));

    const groupBlocks = Array.from(group.querySelectorAll<HTMLElement>(blockSelector));
    // Filter to leaf-most blocks only, AND exclude blocks that match the pageSelector
    // (e.g. when the page group itself also has data-pdf-block).
    const leafBlocks = groupBlocks.filter(
      (b) =>
        !b.matches(pageSelector) &&
        !groupBlocks.some((other) => other !== b && b.contains(other))
    );

    // If the group has no inner blocks, treat the whole group as one block.
    const blocksToUse = leafBlocks.length > 0 ? leafBlocks : [group];

    const ranges = collectBlockRanges(
      blocksToUse,
      element,
      pxPerCssPx,
      fullCanvas.height,
      maxSliceCssPx,
      { topCssPx: groupTopCss, bottomCssPx: groupBottomCss }
    );

    const groupPages = packRangesIntoPages(ranges, groupTopPx, groupBottomPx, maxSlicePx);
    allPages.push(...groupPages);
  };

  if (pageGroups.length === 0) {
    // Fallback: paginate the whole element as a single group.
    const allBlocks = Array.from(element.querySelectorAll<HTMLElement>(blockSelector));
    const leafBlocks = allBlocks.filter(
      (b) => !allBlocks.some((other) => other !== b && b.contains(other))
    );
    const ranges = collectBlockRanges(
      leafBlocks.length > 0 ? leafBlocks : [element],
      element,
      pxPerCssPx,
      fullCanvas.height,
      maxSliceCssPx
    );
    allPages.push(...packRangesIntoPages(ranges, 0, fullCanvas.height, maxSlicePx));
  } else {
    for (const group of pageGroups) buildPagesForGroup(group);
  }

  if (allPages.length === 0) {
    allPages.push({ topPx: 0, bottomPx: fullCanvas.height });
  }

  // ===== Render slices into the PDF =====
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = fullCanvas.width;

  for (let p = 0; p < allPages.length; p++) {
    const { topPx, bottomPx } = allPages[p];
    const sliceHeightPx = bottomPx - topPx;
    if (sliceHeightPx <= 0) continue;
    tmpCanvas.height = sliceHeightPx;
    const ctx = tmpCanvas.getContext('2d');
    if (!ctx) continue;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tmpCanvas.width, sliceHeightPx);
    ctx.drawImage(
      fullCanvas,
      0,
      topPx,
      fullCanvas.width,
      sliceHeightPx,
      0,
      0,
      fullCanvas.width,
      sliceHeightPx
    );
    const sliceDataUrl = tmpCanvas.toDataURL('image/jpeg', 0.92);
    const sliceHeightMm = (sliceHeightPx * usableWidthMm) / fullCanvas.width;

    if (p > 0) pdf.addPage();
    pdf.addImage(
      sliceDataUrl,
      'JPEG',
      sideMarginMm,
      contentTopMm,
      usableWidthMm,
      sliceHeightMm,
      undefined,
      'FAST'
    );
  }

  // ===== Footer (page number + brand) on every page =====
  const footerWidthPx = Math.round(usableWidthMm * pxPerMm);
  const footerHeightPx = Math.round(footerHeightMm * pxPerMm * 0.75);
  const totalPages = pdf.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    const footerHtml = `
      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        height:100%;
        padding:0 4px;
        font-family:'Readex Pro', system-ui, sans-serif;
        font-size:11px;
        color:#6b7280;
      ">
        <span style="direction:ltr; color:#6b7280;">Page ${p} / ${totalPages}</span>
        <span style="color:#1e3a5f; font-weight:600;">${footerText}</span>
      </div>
    `;
    const footerCanvas = await renderHtmlToCanvas(footerHtml, footerWidthPx, footerHeightPx, 1);
    const footerDataUrl = footerCanvas.toDataURL('image/png');
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.2);
    pdf.line(
      sideMarginMm,
      contentBottomMm + 2,
      pageWidthMm - sideMarginMm,
      contentBottomMm + 2
    );
    pdf.addImage(
      footerDataUrl,
      'PNG',
      sideMarginMm,
      contentBottomMm + 3,
      usableWidthMm,
      footerHeightMm - 4,
      undefined,
      'FAST'
    );
  }

  pdf.save(fileName);
};
