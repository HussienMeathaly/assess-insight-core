// Loads Readex Pro Arabic font from Google Fonts and converts to base64
// for use as a virtual font file system (VFS) in pdfmake.

let cachedVfs: Record<string, string> | null = null;

const FONT_URLS = {
  // Readex Pro - excellent Arabic & Latin support, modern and clean
  regular: 'https://fonts.gstatic.com/s/readexpro/v27/SLXnc1bJ7HE5YDoGPuzj_dh8uc7wUy8ZQQyX2KY8TL0kGZN6blTC4USmgg.ttf',
  bold: 'https://fonts.gstatic.com/s/readexpro/v27/SLXnc1bJ7HE5YDoGPuzj_dh8uc7wUy8ZQQyX2KY8TL0kGZN6blTCBkOmgg.ttf',
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunkSize))
    );
  }
  return btoa(binary);
};

export const loadPdfFonts = async (): Promise<Record<string, string>> => {
  if (cachedVfs) return cachedVfs;

  const [regularBuf, boldBuf] = await Promise.all([
    fetch(FONT_URLS.regular).then((r) => r.arrayBuffer()),
    fetch(FONT_URLS.bold).then((r) => r.arrayBuffer()),
  ]);

  cachedVfs = {
    'ReadexPro-Regular.ttf': arrayBufferToBase64(regularBuf),
    'ReadexPro-Bold.ttf': arrayBufferToBase64(boldBuf),
  };

  return cachedVfs;
};

export const PDF_FONTS = {
  ReadexPro: {
    normal: 'ReadexPro-Regular.ttf',
    bold: 'ReadexPro-Bold.ttf',
    italics: 'ReadexPro-Regular.ttf',
    bolditalics: 'ReadexPro-Bold.ttf',
  },
};
