import { loadPdfFonts, PDF_FONTS } from '@/lib/pdfFonts';
import profitLogo from '@/assets/profit-logo.png';

interface ReportAnswer {
  criterion_id: string;
  criterion_name: string;
  criterion_weight: number;
  selected_option_label: string;
  score: number;
  sub_element_id: string;
  sub_element_name: string;
  main_element_id: string;
  main_element_name: string;
  main_element_weight: number;
}

interface GroupedElement {
  mainElementId: string;
  mainElementName: string;
  mainElementWeight: number;
  totalScore: number;
  subElements: {
    subElementId: string;
    subElementName: string;
    answers: ReportAnswer[];
  }[];
}

export interface PdfReportData {
  orgName: string;
  domainName: string;
  contactPerson: string;
  email: string;
  phone: string;
  percentage: number;
  isQualified: boolean;
  totalAnswers: number;
  maxScore: number;
  groupedAnswers: GroupedElement[];
  completedAt?: string;
}

const BRAND_NAVY = '#1e3a5f';
const BRAND_NAVY_LIGHT = '#2d4a6f';
const BRAND_GREEN = '#7cb342';

const getScoreColor = (score: number) => {
  if (score >= 80) return BRAND_GREEN;
  if (score > 65) return '#ca8a04';
  return '#dc2626';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'جيد';
  if (score > 65) return 'متوسط';
  return 'ضعيف';
};

const imageToDataURL = async (src: string): Promise<string> => {
  if (src.startsWith('data:')) return src;
  const response = await fetch(src);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateReportPdf = async (data: PdfReportData) => {
  const [{ default: pdfMake }, vfs, logoDataUrl] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    loadPdfFonts(),
    imageToDataURL(profitLogo),
  ]);

  // pdfmake exposes addVirtualFileSystem (not a plain vfs assignment) and addFonts
  const pm = pdfMake as any;
  if (typeof pm.addVirtualFileSystem === 'function') {
    pm.addVirtualFileSystem(vfs);
  } else {
    pm.vfs = { ...(pm.vfs || {}), ...vfs };
  }
  if (typeof pm.addFonts === 'function') {
    pm.addFonts(PDF_FONTS);
  } else {
    pm.fonts = PDF_FONTS;
  }

  const {
    orgName,
    domainName,
    contactPerson,
    email,
    phone,
    percentage,
    totalAnswers,
    maxScore,
    groupedAnswers,
  } = data;

  const scoreColor = percentage > 65 ? BRAND_GREEN : '#dc2626';
  const statusText =
    percentage > 65 ? 'المنتج مؤهل للانتقال إلى التقييم الشامل' : 'يحتاج تحسينات';

  const coverContent: any[] = [
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { image: logoDataUrl, width: 140, alignment: 'center' },
                {
                  text: `تقرير ${domainName}`,
                  style: 'reportTitle',
                  alignment: 'center',
                  margin: [0, 10, 0, 4],
                },
                {
                  text: `تاريخ إصدار التقرير: ${new Date().toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}`,
                  style: 'small',
                  alignment: 'center',
                },
              ],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 2,
        vLineWidth: () => 2,
        hLineColor: () => BRAND_NAVY,
        vLineColor: () => BRAND_NAVY,
        paddingTop: () => 18,
        paddingBottom: () => 18,
        paddingLeft: () => 16,
        paddingRight: () => 16,
      },
      margin: [0, 0, 0, 16],
    },

    sectionHeader('معلومات الجهة'),
    {
      table: {
        widths: ['*', '*'],
        body: [
          [infoCell('اسم الجهة', orgName), infoCell('المسؤول', contactPerson || '-')],
          [
            infoCell('البريد الإلكتروني', email || '-'),
            infoCell('رقم الهاتف', phone || '-'),
          ],
        ],
      },
      layout: sectionContentLayout(),
      margin: [0, 0, 0, 16],
    },

    sectionHeader('ملخص النتيجة'),
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                {
                  table: {
                    widths: [80],
                    body: [
                      [
                        {
                          text: `${percentage}%`,
                          alignment: 'center',
                          color: scoreColor,
                          bold: true,
                          fontSize: 22,
                          margin: [0, 14, 0, 14],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 4,
                    vLineWidth: () => 4,
                    hLineColor: () => scoreColor,
                    vLineColor: () => scoreColor,
                  },
                  alignment: 'center',
                },
                {
                  text: statusText,
                  alignment: 'center',
                  color: scoreColor,
                  bold: true,
                  fontSize: 13,
                  margin: [0, 10, 0, 4],
                },
                {
                  text: getScoreLabel(percentage),
                  alignment: 'center',
                  color: getScoreColor(percentage),
                  bold: true,
                  fontSize: 11,
                  margin: [0, 0, 0, 12],
                },
                {
                  table: {
                    widths: ['*', '*', '*'],
                    body: [
                      [
                        statCell(totalAnswers.toString(), 'إجمالي المعايير'),
                        statCell(groupedAnswers.length.toString(), 'العناصر الرئيسية'),
                        statCell(maxScore.toString(), 'الدرجة القصوى'),
                      ],
                    ],
                  },
                  layout: 'noBorders',
                },
              ],
            },
          ],
        ],
      },
      layout: sectionContentLayout(),
      margin: [0, 0, 0, 16],
    },

    sectionHeader('ملخص النتائج حسب العناصر الرئيسية'),
    {
      table: {
        headerRows: 1,
        widths: ['45%', '20%', '15%', '20%'],
        body: [
          [
            tableHeader('العنصر الرئيسي'),
            tableHeader('النتيجة'),
            tableHeader('النسبة'),
            tableHeader('التقييم'),
          ],
          ...groupedAnswers.map((el) => {
            const p =
              el.mainElementWeight > 0
                ? Math.round((el.totalScore / el.mainElementWeight) * 100)
                : 0;
            const c = getScoreColor(p);
            return [
              { text: el.mainElementName, alignment: 'right', fontSize: 10 },
              {
                text: `${el.totalScore.toFixed(1)} / ${el.mainElementWeight}`,
                alignment: 'right',
                fontSize: 10,
              },
              {
                text: `${p}%`,
                alignment: 'right',
                color: c,
                bold: true,
                fontSize: 10,
              },
              {
                text: getScoreLabel(p),
                alignment: 'right',
                color: c,
                bold: true,
                fontSize: 10,
              },
            ];
          }),
        ],
      },
      layout: summaryTableLayout(),
    },
  ];

  const detailContent: any[] = [];
  groupedAnswers.forEach((mainElement, index) => {
    const elemPercentage =
      mainElement.mainElementWeight > 0
        ? Math.round((mainElement.totalScore / mainElement.mainElementWeight) * 100)
        : 0;

    detailContent.push({
      text: '',
      pageBreak: 'before',
    });

    detailContent.push({
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            {
              text: mainElement.mainElementName,
              color: 'white',
              bold: true,
              fontSize: 13,
              alignment: 'right',
            },
            {
              text: `${mainElement.totalScore.toFixed(1)} / ${mainElement.mainElementWeight} (${elemPercentage}%)`,
              color: 'white',
              bold: true,
              fontSize: 11,
              alignment: 'right',
              fillColor: BRAND_GREEN,
              margin: [8, 0, 8, 0],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingTop: () => 10,
        paddingBottom: () => 10,
        paddingLeft: () => 14,
        paddingRight: () => 14,
        fillColor: () => BRAND_NAVY,
      },
      margin: [0, 0, 0, 12],
    });

    mainElement.subElements.forEach((subElement) => {
      detailContent.push({
        text: subElement.subElementName,
        bold: true,
        color: BRAND_NAVY,
        fontSize: 12,
        alignment: 'right',
        margin: [0, 8, 0, 6],
        decoration: 'underline',
        decorationColor: BRAND_GREEN,
      });

      detailContent.push({
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            [tableHeader('المعيار'), tableHeader('الإجابة')],
            ...subElement.answers.map((a) => [
              {
                text: a.criterion_name,
                alignment: 'right',
                fontSize: 10,
                color: '#374151',
              },
              {
                text: a.selected_option_label,
                alignment: 'right',
                fontSize: 10,
                color: '#6b7280',
                noWrap: true,
              },
            ]),
          ],
        },
        layout: criteriaTableLayout(),
        margin: [0, 0, 0, 14],
      });
    });

    if (index === groupedAnswers.length - 1) {
      detailContent.push({
        margin: [0, 24, 0, 0],
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  {
                    columns: [
                      {
                        width: '*',
                        text: 'تم إنشاء هذا التقرير بواسطة نظام',
                        alignment: 'right',
                        fontSize: 11,
                        color: '#6b7280',
                        margin: [0, 8, 0, 0],
                      },
                      {
                        width: 70,
                        image: logoDataUrl,
                        fit: [70, 22],
                        alignment: 'center',
                        margin: [0, 4, 0, 0],
                      },
                      {
                        width: 'auto',
                        text: 'للتقييم',
                        alignment: 'left',
                        fontSize: 11,
                        color: '#6b7280',
                        margin: [0, 8, 0, 0],
                      },
                    ],
                  },
                  {
                    text: `جميع الحقوق محفوظة © ${new Date().getFullYear()}`,
                    alignment: 'center',
                    fontSize: 10,
                    color: BRAND_NAVY,
                    margin: [0, 8, 0, 0],
                  },
                ],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 ? 2 : 0),
          vLineWidth: () => 0,
          hLineColor: () => BRAND_NAVY,
          paddingTop: () => 12,
          paddingBottom: () => 12,
          paddingLeft: () => 14,
          paddingRight: () => 14,
          fillColor: () => '#fafafa',
        },
      });
    }
  });

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 50],
    defaultStyle: {
      font: 'ReadexPro',
      fontSize: 11,
      alignment: 'right',
      color: '#1f2937',
      lineHeight: 1.5,
    },
    styles: {
      reportTitle: { fontSize: 20, bold: true, color: BRAND_NAVY },
      small: { fontSize: 10, color: '#6b7280' },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: 'white',
        fillColor: BRAND_NAVY,
      },
    },
    header: (currentPage: number) => ({
      margin: [40, 18, 40, 0],
      columns: [
        {
          width: 'auto',
          image: logoDataUrl,
          fit: [70, 22],
          alignment: 'left',
        },
        {
          width: '*',
          text: `${orgName}  |  ${domainName}`,
          alignment: 'right',
          fontSize: 9,
          color: BRAND_NAVY,
          margin: [0, 6, 0, 0],
        },
      ],
    }),
    footer: (currentPage: number, pageCount: number) => ({
      margin: [40, 8, 40, 0],
      columns: [
        {
          text: `صفحة ${currentPage} من ${pageCount}`,
          alignment: 'left',
          fontSize: 9,
          color: '#6b7280',
        },
        {
          text: 'نظام +PROFIT للتقييم',
          alignment: 'right',
          fontSize: 9,
          color: '#6b7280',
        },
      ],
    }),
    content: [...coverContent, ...detailContent],
  };

  const fileName = `تقرير-التقييم-${orgName.replace(/\s+/g, '-')}.pdf`;
  return new Promise<void>((resolve, reject) => {
    try {
      (pdfMake as any).createPdf(docDefinition).download(fileName, () => resolve());
    } catch (e) {
      reject(e);
    }
  });
};

function sectionHeader(title: string) {
  return {
    table: {
      widths: ['*'],
      body: [
        [
          {
            text: title,
            color: 'white',
            bold: true,
            fontSize: 12,
            alignment: 'right',
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingTop: () => 9,
      paddingBottom: () => 9,
      paddingLeft: () => 14,
      paddingRight: () => 14,
      fillColor: () => BRAND_NAVY,
    },
    margin: [0, 0, 0, 0],
  };
}

function sectionContentLayout() {
  return {
    hLineWidth: () => 1,
    vLineWidth: () => 1,
    hLineColor: () => '#e5e7eb',
    vLineColor: () => '#e5e7eb',
    paddingTop: () => 12,
    paddingBottom: () => 12,
    paddingLeft: () => 12,
    paddingRight: () => 12,
    fillColor: () => '#fafafa',
  };
}

function infoCell(label: string, value: string) {
  return {
    stack: [
      { text: label, fontSize: 9, color: '#6b7280', alignment: 'right' },
      {
        text: value,
        fontSize: 12,
        bold: true,
        color: BRAND_NAVY,
        alignment: 'right',
        margin: [0, 2, 0, 0],
      },
    ],
    margin: [4, 4, 4, 4],
  };
}

function statCell(value: string, label: string) {
  return {
    stack: [
      {
        text: value,
        fontSize: 18,
        bold: true,
        color: BRAND_NAVY,
        alignment: 'center',
      },
      { text: label, fontSize: 9, color: '#6b7280', alignment: 'center' },
    ],
  };
}

function tableHeader(text: string) {
  return {
    text,
    bold: true,
    color: 'white',
    fillColor: BRAND_NAVY,
    alignment: 'right',
    fontSize: 11,
    margin: [4, 6, 4, 6],
  };
}

function summaryTableLayout() {
  return {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0,
    hLineColor: () => '#e5e7eb',
    paddingTop: () => 8,
    paddingBottom: () => 8,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    fillColor: (rowIndex: number) =>
      rowIndex === 0 ? null : rowIndex % 2 === 0 ? '#f9fafb' : null,
  };
}

function criteriaTableLayout() {
  return {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0,
    hLineColor: () => '#e5e7eb',
    paddingTop: () => 7,
    paddingBottom: () => 7,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    fillColor: (rowIndex: number) =>
      rowIndex === 0 ? null : rowIndex % 2 === 0 ? '#f9fafb' : null,
  };
}
