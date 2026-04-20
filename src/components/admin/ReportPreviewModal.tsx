import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusDialog } from '@/components/ui/status-dialog';
import { Download, FileSpreadsheet } from 'lucide-react';
import profitLogo from '@/assets/profit-logo.png';

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
  captureRef?: React.RefObject<HTMLDivElement>;
}

export function ReportPreviewModal({
  open,
  onOpenChange,
  onDownload,
  downloading,
  reportData,
  captureRef,
}: ReportPreviewModalProps) {
  const [downloadStatus, setDownloadStatus] = useState<{ open: boolean; type: "success" | "error"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });
  if (!reportData) return null;

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const { orgName, groupedAnswers } = reportData;

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Raw Data Table without weight column
      const rawData: (string | number)[][] = [
        ['رقم', 'العنصر الرئيسي', 'العنصر الفرعي', 'المعيار', 'الإجابة', 'الدرجة']
      ];

      let rawRowNum = 1;
      let totalScore = 0;
      groupedAnswers.forEach(mainElement => {
        mainElement.subElements.forEach(subElement => {
          subElement.answers.forEach(answer => {
            totalScore += answer.score;
            rawData.push([
              rawRowNum++,
              mainElement.mainElementName,
              subElement.subElementName,
              answer.criterion_name,
              answer.selected_option_label,
              answer.score
            ]);
          });
        });
      });

      // Add total row
      rawData.push([]);
      rawData.push(['', '', '', '', 'المجموع', totalScore]);
      rawData.push(['', '', '', '', 'النسبة المئوية', `${percentage}%`]);

      const rawSheet = XLSX.utils.aoa_to_sheet(rawData);
      
      rawSheet['!cols'] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 30 },
        { wch: 50 },
        { wch: 30 },
        { wch: 10 }
      ];
      
      XLSX.utils.book_append_sheet(wb, rawSheet, 'البيانات');

      // Generate and download
      const fileName = `تقرير-التقييم-${orgName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      setDownloadStatus({ open: true, type: "success", title: "تم التحميل بنجاح", message: "تم تحميل ملف Excel بنجاح" });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setDownloadStatus({ open: true, type: "error", title: "حدث خطأ", message: "حدث خطأ أثناء تصدير الملف" });
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
    if (score > 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-lime-100 text-lime-700';
    if (score > 65) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'جيد';
    if (score > 65) return 'متوسط';
    return 'ضعيف';
  };

  const issueDateLabel = completedAt
    ? new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(completedAt))
    : new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date());

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 border-b bg-gradient-to-l from-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <img src={profitLogo} alt="Profit Logo" className="h-12 sm:h-14" />
            <DialogTitle className="flex-1 text-center text-lg sm:text-xl font-bold text-primary">
              معاينة التقرير
            </DialogTitle>
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
          <div ref={captureRef} id="report-capture-root" className="space-y-6 bg-white p-4 sm:p-6" dir="rtl" style={{ fontFamily: "'Readex Pro', sans-serif" }}>
            {/* PAGE 1: cover + org info + score summary + results summary table */}
            <div data-pdf-page className="space-y-6">
            <div data-pdf-block className="rounded-[28px] border-2 border-primary/80 bg-background px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14">
              <img src={profitLogo} alt="Profit Logo" className="mx-auto mb-8 h-12 sm:h-14" />
              <h1 className="mb-4 text-3xl font-bold text-primary sm:text-4xl">تقرير فئة النشاط</h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                تاريخ إصدار التقرير: {issueDateLabel}
              </p>
            </div>

            {/* Organization Info Card */}
            <div data-pdf-block className="rounded-xl border bg-card overflow-hidden">
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
            <div data-pdf-block className="rounded-xl border bg-card overflow-hidden">
              <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
                ملخص النتيجة
              </div>
              <div className="p-6">
                <div className={`text-center p-6 rounded-xl ${percentage > 65 ? 'bg-lime-50 border-2 border-lime-400' : 'bg-red-50 border-2 border-red-400'}`}>
                  {/* Score Circle */}
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 ${percentage > 65 ? 'border-lime-500 bg-white' : 'border-red-500 bg-white'} mx-auto flex flex-col items-center justify-center mb-4`}>
                    <span className={`text-3xl sm:text-4xl font-bold ${percentage > 65 ? 'text-lime-600' : 'text-red-600'}`}>
                      {percentage}
                    </span>
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-2 ${getScoreBgColor(percentage)}`}>
                    {getScoreLabel(percentage)}
                  </span>
                  <p className={`text-lg font-bold mb-1 ${percentage > 65 ? 'text-lime-600' : 'text-red-600'}`}>
                    {percentage > 65 ? 'المنتج مؤهل للانتقال إلى التقييم الشامل' : 'يحتاج تحسينات'}
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
            <div data-pdf-block className="rounded-xl border bg-card overflow-hidden">
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
            </div>
            {/* END PAGE 1 */}

            {/* Detailed Results by Main Element — each on its own page */}
            {groupedAnswers.map((mainElement, mainIdx) => {
              const elemPercentage = mainElement.mainElementWeight > 0 
                ? Math.round((mainElement.totalScore / mainElement.mainElementWeight) * 100) 
                : 0;
              const isLast = mainIdx === groupedAnswers.length - 1;

              return (
                <div
                  key={mainElement.mainElementId}
                  data-pdf-page
                  data-pdf-block
                  className="space-y-4"
                >
                  <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="bg-gradient-to-l from-primary to-primary/80 px-4 py-3 text-primary-foreground flex items-center justify-between gap-3">
                      <span className="font-bold">{mainElement.mainElementName}</span>
                      <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-sm font-semibold text-primary-foreground">
                        {mainElement.totalScore.toFixed(1)} / {mainElement.mainElementWeight} ({elemPercentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mainElement.subElements.map((subElement) => (
                      <div key={subElement.subElementId} className="overflow-hidden rounded-xl border bg-card">
                        <div className="bg-muted/40 px-4 py-3">
                          <h4 className="border-b-2 border-primary/20 pb-2 font-semibold text-primary">
                            {subElement.subElementName}
                          </h4>
                        </div>
                        <div className="p-3">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm" style={{ tableLayout: 'auto' }}>
                              <thead>
                                <tr className="bg-primary/10">
                                  <th className="text-right p-2 font-semibold text-primary w-auto">المعيار</th>
                                  <th className="text-right p-2 font-semibold text-primary w-auto">الإجابة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {subElement.answers.map((answer) => (
                                  <tr key={answer.criterion_id} className="border-b border-muted last:border-0">
                                    <td className="p-2 text-foreground align-top">{answer.criterion_name}</td>
                                    <td className="p-2 text-muted-foreground align-top whitespace-nowrap">{answer.selected_option_label}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer attached to the last main element so they stay on the same page */}
                  {isLast && (
                    <div className="text-center py-6 border-t mt-6">
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 flex-wrap">
                        <span>تم إنشاء هذا التقرير بواسطة نظام</span>
                        <img src={profitLogo} alt="Profit+" className="h-10 inline-block" />
                        <span>للتقييم</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        جميع الحقوق محفوظة © {new Date().getFullYear()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>

    <StatusDialog
      open={downloadStatus.open}
      onClose={() => setDownloadStatus(s => ({ ...s, open: false }))}
      type={downloadStatus.type}
      title={downloadStatus.title}
      message={downloadStatus.message}
    />
    </>
  );
}
