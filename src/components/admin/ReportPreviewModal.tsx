import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileSpreadsheet } from 'lucide-react';
import profitLogo from '@/assets/profit-logo.png';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

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

interface ReportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
  downloading: boolean;
  reportData: {
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
  } | null;
}

export function ReportPreviewModal({
  open,
  onOpenChange,
  onDownload,
  downloading,
  reportData
}: ReportPreviewModalProps) {
  if (!reportData) return null;

  const handleExportExcel = () => {
    try {
      const {
        orgName,
        contactPerson,
        email,
        phone,
        percentage,
        isQualified,
        totalAnswers,
        maxScore,
        groupedAnswers,
        completedAt
      } = reportData;

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Calculate total criteria count
      const totalCriteria = groupedAnswers.reduce((acc, me) => 
        acc + me.subElements.reduce((subAcc, se) => subAcc + se.answers.length, 0), 0
      );

      // Sheet 1: Summary - Enhanced
      const summaryData: (string | number)[][] = [
        [''],
        ['تقرير التقييم الشامل'],
        ['نظام PROFIT للتقييم والتصنيف'],
        [''],
        ['═══════════════════════════════════════════════════════════════'],
        [''],
        ['▌ معلومات الجهة'],
        [''],
        ['البيان', 'التفاصيل'],
        ['اسم الجهة', orgName],
        ['المسؤول', contactPerson || '-'],
        ['البريد الإلكتروني', email || '-'],
        ['رقم الهاتف', phone || '-'],
        ['تاريخ التقييم', completedAt ? new Date(completedAt).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA')],
        [''],
        ['═══════════════════════════════════════════════════════════════'],
        [''],
        ['▌ ملخص النتيجة النهائية'],
        [''],
        ['البيان', 'القيمة'],
        ['النتيجة النهائية', `${percentage}%`],
        ['حالة التأهيل', isQualified ? '✓ مؤهل للتصنيف' : '✗ يحتاج تحسينات'],
        ['إجمالي المعايير المقيّمة', totalCriteria],
        ['الدرجة القصوى الممكنة', maxScore],
        [''],
        ['═══════════════════════════════════════════════════════════════'],
        [''],
        ['▌ نتائج العناصر الرئيسية'],
        [''],
        ['#', 'العنصر الرئيسي', 'النتيجة المحققة', 'الوزن الكلي', 'النسبة المئوية', 'التقييم'],
      ];

      groupedAnswers.forEach((element, index) => {
        const elemPercentage = element.mainElementWeight > 0 
          ? Math.round((element.totalScore / element.mainElementWeight) * 100) 
          : 0;
        let label = 'يحتاج تحسين';
        let emoji = '⚠';
        if (elemPercentage >= 80) { label = 'ممتاز'; emoji = '★'; }
        else if (elemPercentage >= 60) { label = 'جيد جداً'; emoji = '●'; }
        else if (elemPercentage >= 40) { label = 'جيد'; emoji = '○'; }
        
        summaryData.push([
          index + 1,
          element.mainElementName,
          element.totalScore.toFixed(2),
          element.mainElementWeight,
          `${elemPercentage}%`,
          `${emoji} ${label}`
        ]);
      });

      // Add footer to summary
      summaryData.push(
        [''],
        ['═══════════════════════════════════════════════════════════════'],
        [''],
        ['تم إنشاء هذا التقرير بواسطة نظام PROFIT للتقييم'],
        [`تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}`]
      );

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Set column widths for summary
      summarySheet['!cols'] = [
        { wch: 5 },
        { wch: 40 },
        { wch: 18 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 }
      ];

      // Merge cells for header
      summarySheet['!merges'] = [
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Title
        { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // Subtitle
      ];
      
      XLSX.utils.book_append_sheet(wb, summarySheet, 'الملخص');

      // Sheet 2: Detailed Results by Main Element
      const detailsData: (string | number | null)[][] = [
        [''],
        ['التفاصيل الكاملة للتقييم - جميع المعايير'],
        [''],
      ];

      let rowNumber = 1;

      groupedAnswers.forEach((mainElement, meIndex) => {
        const elemPercentage = mainElement.mainElementWeight > 0 
          ? Math.round((mainElement.totalScore / mainElement.mainElementWeight) * 100) 
          : 0;

        // Add main element header
        detailsData.push(['']);
        detailsData.push([`▌ ${meIndex + 1}. ${mainElement.mainElementName}`]);
        detailsData.push([`   النتيجة: ${mainElement.totalScore.toFixed(2)} / ${mainElement.mainElementWeight} (${elemPercentage}%)`]);
        detailsData.push(['']);
        
        mainElement.subElements.forEach((subElement, seIndex) => {
          // Calculate sub-element score
          const subElementScore = subElement.answers.reduce((acc, a) => acc + a.score, 0);
          const subElementMaxScore = subElement.answers.reduce((acc, a) => acc + a.criterion_weight, 0);
          const subElemPercentage = subElementMaxScore > 0 
            ? Math.round((subElementScore / subElementMaxScore) * 100) 
            : 0;

          // Add sub-element header
          detailsData.push([`   ○ ${seIndex + 1}.${meIndex + 1} ${subElement.subElementName} (${subElemPercentage}%)`]);
          detailsData.push(['']);
          
          // Add criteria table header
          detailsData.push(['#', 'المعيار', 'الإجابة المختارة', 'الوزن', 'النتيجة', 'النسبة']);
          
          // Add each criterion
          subElement.answers.forEach((answer, aIndex) => {
            const criterionPercentage = answer.criterion_weight > 0 
              ? Math.round((answer.score / answer.criterion_weight) * 100) 
              : 0;
            
            detailsData.push([
              rowNumber++,
              answer.criterion_name,
              answer.selected_option_label,
              answer.criterion_weight,
              answer.score.toFixed(2),
              `${criterionPercentage}%`
            ]);
          });
          
          // Add sub-element subtotal
          detailsData.push([
            '',
            `إجمالي ${subElement.subElementName}`,
            '',
            subElementMaxScore,
            subElementScore.toFixed(2),
            `${subElemPercentage}%`
          ]);
          detailsData.push(['']);
        });

        // Add main element total
        detailsData.push([
          '',
          `═══ إجمالي ${mainElement.mainElementName} ═══`,
          '',
          mainElement.mainElementWeight,
          mainElement.totalScore.toFixed(2),
          `${elemPercentage}%`
        ]);
        detailsData.push(['']);
        detailsData.push(['───────────────────────────────────────────────────────────────────────────────────']);
      });

      // Add final total
      detailsData.push(['']);
      detailsData.push([
        '',
        '★★★ الإجمالي النهائي ★★★',
        '',
        maxScore,
        groupedAnswers.reduce((acc, me) => acc + me.totalScore, 0).toFixed(2),
        `${percentage}%`
      ]);

      const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
      
      // Set column widths for details
      detailsSheet['!cols'] = [
        { wch: 5 },
        { wch: 55 },
        { wch: 35 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 }
      ];
      
      XLSX.utils.book_append_sheet(wb, detailsSheet, 'التفاصيل الكاملة');

      // Sheet 3: Raw Data Table (for analysis)
      const rawData: (string | number)[][] = [
        ['جدول البيانات الخام للتحليل'],
        [''],
        ['رقم', 'العنصر الرئيسي', 'العنصر الفرعي', 'المعيار', 'الإجابة', 'الوزن', 'النتيجة', 'النسبة']
      ];

      let rawRowNum = 1;
      groupedAnswers.forEach(mainElement => {
        mainElement.subElements.forEach(subElement => {
          subElement.answers.forEach(answer => {
            const pct = answer.criterion_weight > 0 
              ? Math.round((answer.score / answer.criterion_weight) * 100) 
              : 0;
            rawData.push([
              rawRowNum++,
              mainElement.mainElementName,
              subElement.subElementName,
              answer.criterion_name,
              answer.selected_option_label,
              answer.criterion_weight,
              answer.score,
              `${pct}%`
            ]);
          });
        });
      });

      const rawSheet = XLSX.utils.aoa_to_sheet(rawData);
      
      rawSheet['!cols'] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 30 },
        { wch: 50 },
        { wch: 30 },
        { wch: 8 },
        { wch: 10 },
        { wch: 10 }
      ];
      
      XLSX.utils.book_append_sheet(wb, rawSheet, 'البيانات الخام');

      // Generate and download
      const fileName = `تقرير-التقييم-${orgName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('تم تحميل ملف Excel بنجاح');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('حدث خطأ أثناء تصدير الملف');
    }
  };

  const {
    orgName,
    domainName,
    contactPerson,
    email,
    phone,
    percentage,
    isQualified,
    totalAnswers,
    maxScore,
    groupedAnswers,
    completedAt
  } = reportData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-lime-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-lime-100 text-lime-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'ممتاز';
    if (score >= 60) return 'جيد جداً';
    if (score >= 40) return 'جيد';
    return 'يحتاج تحسين';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 border-b bg-gradient-to-l from-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={profitLogo} alt="Profit Logo" className="h-8 sm:h-10" />
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-primary">
                  معاينة التقرير
                </DialogTitle>
                <p className="text-sm text-muted-foreground">{orgName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExportExcel}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button
                onClick={onDownload}
                disabled={downloading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {downloading ? 'جاري التحميل...' : 'PDF'}
                </span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="space-y-6" dir="rtl">
            {/* Organization Info Card */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
                معلومات الجهة
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">اسم الجهة</p>
                  <p className="font-semibold text-foreground">{orgName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">المسؤول</p>
                  <p className="font-semibold text-foreground">{contactPerson || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-semibold text-foreground">{email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                  <p className="font-semibold text-foreground">{phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Score Summary Card */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
                ملخص النتيجة
              </div>
              <div className="p-6">
                <div className={`text-center p-6 rounded-xl ${isQualified ? 'bg-lime-50 border-2 border-lime-400' : 'bg-red-50 border-2 border-red-400'}`}>
                  {/* Score Circle */}
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 ${isQualified ? 'border-lime-500 bg-white' : 'border-red-500 bg-white'} mx-auto flex flex-col items-center justify-center mb-4`}>
                    <span className={`text-3xl sm:text-4xl font-bold ${isQualified ? 'text-lime-600' : 'text-red-600'}`}>
                      {percentage}
                    </span>
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  
                  <p className={`text-xl font-bold mb-1 ${isQualified ? 'text-lime-600' : 'text-red-600'}`}>
                    {isQualified ? 'مؤهل للتصنيف' : 'يحتاج تحسينات'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isQualified ? 'حقق المنتج الحد الأدنى المطلوب للتأهل' : 'لم يحقق المنتج الحد الأدنى المطلوب (60%)'}
                  </p>

                  {/* Stats Row */}
                  <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-dashed border-muted-foreground/30">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{totalAnswers}</p>
                      <p className="text-xs text-muted-foreground">إجمالي المعايير</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{groupedAnswers.length}</p>
                      <p className="text-xs text-muted-foreground">العناصر الرئيسية</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{maxScore}</p>
                      <p className="text-xs text-muted-foreground">الدرجة القصوى</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Summary Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
                ملخص النتائج حسب العناصر الرئيسية
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-right p-3 font-semibold">العنصر الرئيسي</th>
                      <th className="text-right p-3 font-semibold">النتيجة</th>
                      <th className="text-right p-3 font-semibold">النسبة</th>
                      <th className="text-right p-3 font-semibold">التقييم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedAnswers.map((element, index) => {
                      const elemPercentage = element.mainElementWeight > 0 
                        ? Math.round((element.totalScore / element.mainElementWeight) * 100) 
                        : 0;
                      return (
                        <tr key={element.mainElementId} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="p-3 font-medium">{element.mainElementName}</td>
                          <td className="p-3">{element.totalScore.toFixed(1)} / {element.mainElementWeight}</td>
                          <td className={`p-3 font-semibold ${getScoreColor(elemPercentage)}`}>
                            {elemPercentage}%
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreBgColor(elemPercentage)}`}>
                              {getScoreLabel(elemPercentage)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Results by Main Element */}
            {groupedAnswers.map((mainElement) => {
              const elemPercentage = mainElement.mainElementWeight > 0 
                ? Math.round((mainElement.totalScore / mainElement.mainElementWeight) * 100) 
                : 0;
              
              return (
                <div key={mainElement.mainElementId} className="rounded-xl border bg-card overflow-hidden">
                  {/* Main Element Header */}
                  <div className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-4 py-3 flex items-center justify-between">
                    <span className="font-bold">{mainElement.mainElementName}</span>
                    <span className="bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {mainElement.totalScore.toFixed(1)} / {mainElement.mainElementWeight} ({elemPercentage}%)
                    </span>
                  </div>

                  {/* Sub Elements */}
                  <div className="p-4 space-y-4">
                    {mainElement.subElements.map((subElement) => (
                      <div key={subElement.subElementId} className="bg-muted/30 rounded-lg p-3">
                        <h4 className="font-semibold text-primary mb-3 pb-2 border-b-2 border-primary/20">
                          {subElement.subElementName}
                        </h4>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-primary/10">
                                <th className="text-right p-2 font-semibold text-primary" style={{ width: '50%' }}>المعيار</th>
                                <th className="text-right p-2 font-semibold text-primary" style={{ width: '30%' }}>الإجابة</th>
                                <th className="text-center p-2 font-semibold text-primary" style={{ width: '10%' }}>الوزن</th>
                                <th className="text-center p-2 font-semibold text-primary" style={{ width: '10%' }}>النتيجة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subElement.answers.map((answer) => (
                                <tr key={answer.criterion_id} className="border-b border-muted last:border-0">
                                  <td className="p-2 text-foreground">{answer.criterion_name}</td>
                                  <td className="p-2 text-muted-foreground">{answer.selected_option_label}</td>
                                  <td className="p-2 text-center text-primary">{answer.criterion_weight}%</td>
                                  <td className={`p-2 text-center font-semibold ${getScoreColor(answer.score)}`}>
                                    {answer.score}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div className="text-center py-6 border-t mt-6">
              <img src={profitLogo} alt="Profit Logo" className="h-12 mx-auto mb-3" />
              <p className="font-bold text-primary mb-1">شكراً لاستخدامكم نظام PROFIT</p>
              <p className="text-sm text-muted-foreground">
                تم إنشاء هذا التقرير بواسطة نظام PROFIT للتقييم
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                جميع الحقوق محفوظة © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
