// PDF generation via HTML rasterization (html2canvas + jsPDF).
// Uses smart pagination: captures each "block" (card) separately and
// places it as a unit so cards never get split across pages.

export interface GeneratePdfOptions {
  element: HTMLElement;
  fileName: string;
  // Higher = sharper, larger file. 3 is a good balance for Arabic.
  scale?: number;
  // CSS selector matching top-level blocks that must not be split.
  // Defaults to direct children of the element.
  blockSelector?: string;
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

export const generateReportPdfFromElement = async ({
  element,
  fileName,
  scale = 3,
  blockSelector,
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
  const marginMm = 8;
  const usableWidthMm = pageWidthMm - marginMm * 2;
  const usableHeightMm = pageHeightMm - marginMm * 2;

  // Collect blocks (cards). Falls back to direct children.
  const blocks: HTMLElement[] = blockSelector
    ? Array.from(element.querySelectorAll<HTMLElement>(blockSelector))
    : (Array.from(element.children) as HTMLElement[]);

  if (blocks.length === 0) {
    blocks.push(element);
  }

  const renderOptions = {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  };

  // Cursor tracking remaining vertical space on the current page (in mm)
  let cursorMm = marginMm;
  let isFirstOnPage = true;

  for (const block of blocks) {
    // Render block to a canvas
    const canvas = await html2canvas(block, {
      ...renderOptions,
      windowWidth: block.scrollWidth,
      windowHeight: block.scrollHeight,
    });

    // Compute mm dimensions while preserving aspect ratio at usable width
    const blockHeightMm = (canvas.height * usableWidthMm) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // CASE A: block fits on the current page → place it
    const remaining = pageHeightMm - marginMm - cursorMm;
    if (blockHeightMm <= remaining + 0.01) {
      pdf.addImage(
        imgData,
        'JPEG',
        marginMm,
        cursorMm,
        usableWidthMm,
        blockHeightMm,
        undefined,
        'FAST'
      );
      cursorMm += blockHeightMm + 4; // small gap between blocks
      isFirstOnPage = false;
      continue;
    }

    // CASE B: block doesn't fit. Start a new page (unless already empty).
    if (!isFirstOnPage) {
      pdf.addPage();
      cursorMm = marginMm;
      isFirstOnPage = true;
    }

    // CASE B1: block fits on a fresh page → place it
    if (blockHeightMm <= usableHeightMm + 0.01) {
      pdf.addImage(
        imgData,
        'JPEG',
        marginMm,
        cursorMm,
        usableWidthMm,
        blockHeightMm,
        undefined,
        'FAST'
      );
      cursorMm += blockHeightMm + 4;
      isFirstOnPage = false;
      continue;
    }

    // CASE B2: block is taller than a full page → must split this single
    // block across pages (last resort, only happens for huge cards).
    let consumedMm = 0;
    while (consumedMm < blockHeightMm - 0.01) {
      const sliceHeightMm = Math.min(usableHeightMm, blockHeightMm - consumedMm);

      // Map mm slice back to canvas pixel coordinates
      const pxPerMm = canvas.width / usableWidthMm;
      const sliceTopPx = Math.floor(consumedMm * pxPerMm);
      const slicePxHeight = Math.floor(sliceHeightMm * pxPerMm);

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = slicePxHeight;
      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sliceTopPx,
          canvas.width,
          slicePxHeight,
          0,
          0,
          canvas.width,
          slicePxHeight
        );
      }
      const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);

      if (!isFirstOnPage) {
        pdf.addPage();
        cursorMm = marginMm;
        isFirstOnPage = true;
      }

      pdf.addImage(
        sliceData,
        'JPEG',
        marginMm,
        cursorMm,
        usableWidthMm,
        sliceHeightMm,
        undefined,
        'FAST'
      );

      consumedMm += sliceHeightMm;
      isFirstOnPage = false;

      if (consumedMm < blockHeightMm - 0.01) {
        // More slices to come — force a new page
        pdf.addPage();
        cursorMm = marginMm;
        isFirstOnPage = true;
      } else {
        cursorMm += sliceHeightMm + 4;
      }
    }
  }

  pdf.save(fileName);
};
