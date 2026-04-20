// PDF generation via single-pass HTML rasterization (html2canvas + jsPDF).
// Strategy:
//   1) Render the full container to ONE high-res canvas (fast: a single
//      html2canvas pass instead of one per card).
//   2) Compute each card's vertical bounds inside that canvas using
//      getBoundingClientRect offsets.
//   3) Slice the canvas at card boundaries to avoid splitting a card
//      across pages (smart pagination).
//   4) Draw header (logo) and footer (page number + brand) on each page
//      as raster images so Arabic text renders correctly without needing
//      embedded fonts in jsPDF.

export interface GeneratePdfOptions {
  element: HTMLElement;
  fileName: string;
  scale?: number; // 2 = good Arabic clarity, much faster than 3
  blockSelector?: string; // selector for cards inside `element`
  logoUrl?: string;
  footerText?: string;
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

const loadImageAsDataUrl = async (src: string): Promise<string | null> => {
  try {
    if (src.startsWith('data:')) return src;
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const getImageSize = (dataUrl: string): Promise<{ w: number; h: number }> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 1, h: 1 });
    img.src = dataUrl;
  });

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

export const generateReportPdfFromElement = async ({
  element,
  fileName,
  scale = 2,
  blockSelector,
  logoUrl,
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
  const headerHeightMm = 16;
  const footerHeightMm = 10;
  const contentTopMm = headerHeightMm;
  const contentBottomMm = pageHeightMm - footerHeightMm;
  const usableWidthMm = pageWidthMm - sideMarginMm * 2;
  const usableHeightMm = contentBottomMm - contentTopMm;

  // Preload header logo
  let logoDataUrl: string | null = null;
  let logoSize: { w: number; h: number } | null = null;
  if (logoUrl) {
    logoDataUrl = await loadImageAsDataUrl(logoUrl);
    if (logoDataUrl) logoSize = await getImageSize(logoDataUrl);
  }

  // ===== STEP 1: One-shot render of the full container =====
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
  const pxPerCssPx = fullCanvas.width / cssWidth; // = scale, basically

  // ===== STEP 2: Compute card boundaries (in canvas pixels) =====
  const blocks: HTMLElement[] = blockSelector
    ? Array.from(element.querySelectorAll<HTMLElement>(blockSelector))
    : (Array.from(element.children) as HTMLElement[]);

  const containerTop = element.getBoundingClientRect().top;
  // Boundary list: top of canvas, bottom-of-each-card, bottom of canvas.
  const boundariesPx: number[] = [0];
  for (const b of blocks) {
    const r = b.getBoundingClientRect();
    const bottomCss = r.bottom - containerTop;
    boundariesPx.push(Math.round(bottomCss * pxPerCssPx));
  }
  boundariesPx.push(fullCanvas.height);
  // Dedupe & sort
  const uniqueBoundaries = Array.from(new Set(boundariesPx)).sort((a, b) => a - b);

  // Maximum slice height in canvas pixels that fits one PDF page
  const pxPerMm = fullCanvas.width / usableWidthMm;
  const maxSlicePx = Math.floor(usableHeightMm * pxPerMm);

  // ===== STEP 3: Greedy pack boundaries into pages =====
  // We accumulate from the previous "page top" until adding the next
  // boundary would exceed maxSlicePx, then we cut at the last good boundary.
  const pageRanges: Array<{ topPx: number; bottomPx: number }> = [];
  let pageTopPx = 0;

  for (let i = 1; i < uniqueBoundaries.length; i++) {
    const candidateBottom = uniqueBoundaries[i];
    const sliceHeight = candidateBottom - pageTopPx;

    if (sliceHeight <= maxSlicePx) {
      // Still fits; if this is the last boundary, finalize the page.
      if (i === uniqueBoundaries.length - 1) {
        pageRanges.push({ topPx: pageTopPx, bottomPx: candidateBottom });
      }
      continue;
    }

    // Doesn't fit. Cut at the previous boundary if there is one.
    const prevBottom = uniqueBoundaries[i - 1];
    if (prevBottom > pageTopPx) {
      pageRanges.push({ topPx: pageTopPx, bottomPx: prevBottom });
      pageTopPx = prevBottom;
      i--; // re-evaluate this boundary on the next page
    } else {
      // A single card is taller than one page → hard split it
      const forcedBottom = pageTopPx + maxSlicePx;
      pageRanges.push({ topPx: pageTopPx, bottomPx: forcedBottom });
      pageTopPx = forcedBottom;
      i--; // re-evaluate this boundary on the next page
    }
  }

  if (pageRanges.length === 0) {
    pageRanges.push({ topPx: 0, bottomPx: fullCanvas.height });
  }

  // ===== STEP 4: Render footer ONCE as a canvas template =====
  // We re-use the same footer image on every page (only the page number
  // changes, and we render that small bit per-page). Simpler approach:
  // render full footer per page since it's tiny.
  const footerWidthPx = Math.round(usableWidthMm * pxPerMm);
  const footerHeightPx = Math.round(footerHeightMm * pxPerMm * 0.75);

  // ===== STEP 5: Place each page slice into the PDF =====
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = fullCanvas.width;

  for (let p = 0; p < pageRanges.length; p++) {
    const { topPx, bottomPx } = pageRanges[p];
    const sliceHeightPx = bottomPx - topPx;
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

  // ===== STEP 6: Header + Footer on every page (rasterized for Arabic) =====
  const totalPages = pdf.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);

    // ----- Header: logo (right side, RTL) + thin separator -----
    if (logoDataUrl && logoSize) {
      const logoMaxHmm = 9;
      const logoMaxWmm = 32;
      const ratio = logoSize.w / logoSize.h;
      let lh = logoMaxHmm;
      let lw = lh * ratio;
      if (lw > logoMaxWmm) {
        lw = logoMaxWmm;
        lh = lw / ratio;
      }
      pdf.addImage(
        logoDataUrl,
        'PNG',
        pageWidthMm - sideMarginMm - lw,
        (headerHeightMm - lh) / 2,
        lw,
        lh,
        undefined,
        'FAST'
      );
    }
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.2);
    pdf.line(
      sideMarginMm,
      headerHeightMm - 2,
      pageWidthMm - sideMarginMm,
      headerHeightMm - 2
    );

    // ----- Footer: rasterized HTML so Arabic text renders correctly -----
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
    const footerCanvas = await renderHtmlToCanvas(
      footerHtml,
      footerWidthPx,
      footerHeightPx,
      1 // already at high px density
    );
    const footerDataUrl = footerCanvas.toDataURL('image/png');
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
