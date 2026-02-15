import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  ArrowRight, 
  Building2, 
  User, 
  Mail, 
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield
} from 'lucide-react';
import profitLogo from '@/assets/profit-logo.png';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportData {
  report_id: string;
  evaluation_id: string;
  org_name: string;
  org_contact_person: string;
  org_email: string;
  org_phone: string;
  total_score: number;
  max_score: number;
  is_completed: boolean;
  completed_at: string | null;
  is_active: boolean;
  expires_at: string | null;
}

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

interface GroupedAnswers {
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

export default function EvaluationReport() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [answers, setAnswers] = useState<ReportAnswer[]>([]);

  useEffect(() => {
    async function fetchReport() {
      if (!token) {
        setError('رابط التقرير غير صالح');
        setLoading(false);
        return;
      }

      try {
        // Fetch report data
        const { data: reportResult, error: reportError } = await supabase
          .rpc('get_report_by_token', { p_token: token });

        if (reportError) throw reportError;
        if (!reportResult || reportResult.length === 0) {
          setError('التقرير غير موجود أو منتهي الصلاحية');
          setLoading(false);
          return;
        }

        setReportData(reportResult[0] as ReportData);

        // Fetch answers
        const { data: answersResult, error: answersError } = await supabase
          .rpc('get_report_answers_by_token', { p_token: token });

        if (answersError) throw answersError;
        setAnswers((answersResult || []) as ReportAnswer[]);

      } catch (err) {
        console.error('Error fetching report:', err);
        setError('حدث خطأ أثناء تحميل التقرير');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [token]);

  const groupedAnswers = answers.reduce<GroupedAnswers[]>((acc, answer) => {
    let mainElement = acc.find(g => g.mainElementId === answer.main_element_id);
    
    if (!mainElement) {
      mainElement = {
        mainElementId: answer.main_element_id,
        mainElementName: answer.main_element_name,
        mainElementWeight: answer.main_element_weight,
        totalScore: 0,
        subElements: []
      };
      acc.push(mainElement);
    }

    let subElement = mainElement.subElements.find(s => s.subElementId === answer.sub_element_id);
    
    if (!subElement) {
      subElement = {
        subElementId: answer.sub_element_id,
        subElementName: answer.sub_element_name,
        answers: []
      };
      mainElement.subElements.push(subElement);
    }

    subElement.answers.push(answer);
    
    // Calculate actual score for this criterion
    const actualScore = (answer.criterion_weight * answer.score) / 100;
    mainElement.totalScore += actualScore;

    return acc;
  }, []);

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'ممتاز', color: 'text-green-500', bgColor: 'bg-green-500/10' };
    if (score >= 60) return { label: 'جيد جداً', color: 'text-primary', bgColor: 'bg-primary/10' };
    if (score >= 40) return { label: 'جيد', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
    return { label: 'يحتاج تحسين', color: 'text-destructive', bgColor: 'bg-destructive/10' };
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !reportData) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`تقرير-التقييم-${reportData.org_name}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري تحميل التقرير...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">خطأ في التقرير</h2>
            <p className="text-muted-foreground mb-6">{error || 'التقرير غير متوفر'}</p>
            <Button onClick={() => navigate('/')} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentage = reportData.total_score || 0;
  const isQualified = percentage >= 60;
  const scoreInfo = getScoreLabel(percentage);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Action Bar - Fixed at top */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            الرئيسية
          </Button>
          <Button onClick={handleExportPDF} disabled={exporting} className="gap-2">
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            تحميل PDF
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="bg-white dark:bg-card">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10 pb-8 border-b border-border">
            <img
              src={profitLogo}
              alt="PROFIT Logo"
              className="h-16 sm:h-20 md:h-24 mx-auto mb-6"
            />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">تقرير تقييم المنتج</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {reportData.org_name}
            </h1>
            <p className="text-muted-foreground">
              تاريخ إصدار التقرير: {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>

          {/* Organization Info */}
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                معلومات الجهة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">اسم الجهة</p>
                    <p className="font-medium text-foreground">{reportData.org_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المسؤول</p>
                    <p className="font-medium text-foreground">{reportData.org_contact_person}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium text-foreground" dir="ltr">{reportData.org_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium text-foreground" dir="ltr">{reportData.org_phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Summary */}
          <Card className="mb-8 overflow-hidden">
            <div className={cn(
              "p-6",
              isQualified ? "bg-gradient-to-br from-primary/10 to-primary/5" : "bg-gradient-to-br from-destructive/10 to-destructive/5"
            )}>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Circle */}
                <div className="relative w-44 h-44">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={isQualified ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${percentage * 2.83} 283`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-foreground">{percentage}%</span>
                    <span className={cn("text-lg font-semibold mt-1", scoreInfo.color)}>
                      {scoreInfo.label}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-1 text-center md:text-right">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-5 py-3 rounded-xl mb-4",
                    isQualified ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                  )}>
                    {isQualified ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertCircle className="w-6 h-6" />
                    )}
                    <span className="font-bold text-lg">
                      {isQualified ? 'المنتج مؤهل للتصنيف' : 'المنتج يحتاج تحسينات'}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {isQualified
                      ? 'حقق المنتج الحد الأدنى المطلوب للتأهل ويمكن متابعة عملية التصنيف.'
                      : 'لم يحقق المنتج الحد الأدنى المطلوب. راجع التفاصيل أدناه لمعرفة نقاط التحسين.'}
                  </p>
                  {reportData.completed_at && (
                    <div className="flex items-center gap-2 justify-center md:justify-start mt-4 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>تاريخ إكمال التقييم: {new Date(reportData.completed_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed Scores by Main Element */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                ملخص النتائج حسب العناصر الرئيسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {groupedAnswers.map((element) => {
                  const elementPercentage = element.mainElementWeight > 0 
                    ? (element.totalScore / element.mainElementWeight) * 100 
                    : 0;
                  const elementInfo = getScoreLabel(elementPercentage);

                  return (
                    <div key={element.mainElementId} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{element.mainElementName}</span>
                        <div className="flex items-center gap-3">
                          <Badge className={cn(elementInfo.bgColor, elementInfo.color, "border-0")}>
                            {elementInfo.label}
                          </Badge>
                          <span className="font-bold text-foreground min-w-[80px] text-left">
                            {element.totalScore.toFixed(1)} / {element.mainElementWeight}
                          </span>
                        </div>
                      </div>
                      <Progress value={elementPercentage} className="h-3" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Answers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                التفاصيل الكاملة للتقييم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupedAnswers.map((mainElement) => (
                <div key={mainElement.mainElementId} className="border border-border rounded-xl overflow-hidden">
                  {/* Main Element Header */}
                  <div className="bg-primary/10 px-5 py-4 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-foreground">{mainElement.mainElementName}</h3>
                    <Badge variant="default" className="text-sm">
                      {mainElement.totalScore.toFixed(1)} / {mainElement.mainElementWeight}
                    </Badge>
                  </div>

                  {/* Sub Elements */}
                  <div className="divide-y divide-border">
                    {mainElement.subElements.map((subElement) => (
                      <div key={subElement.subElementId} className="p-5">
                        <h4 className="font-medium text-primary mb-4 text-base">
                          {subElement.subElementName}
                        </h4>
                        <div className="space-y-3">
                          {subElement.answers.map((answer) => {
                            const actualScore = (answer.criterion_weight * answer.score) / 100;
                            const answerPercentage = answer.score;
                            const answerInfo = getScoreLabel(answerPercentage);

                            return (
                              <div
                                key={answer.criterion_id}
                                className="flex items-start justify-between gap-4 bg-muted/50 rounded-lg p-4"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-foreground mb-2">
                                    {answer.criterion_name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">الإجابة:</span>
                                    <Badge variant="outline" className={cn(answerInfo.bgColor, answerInfo.color, "border-0")}>
                                      {answer.selected_option_label}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-left shrink-0">
                                  <Badge variant="secondary" className="font-bold">
                                    {actualScore.toFixed(1)} / {answer.criterion_weight}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-border text-center">
            <img
              src={profitLogo}
              alt="PROFIT Logo"
              className="h-12 mx-auto mb-4 opacity-50"
            />
            <p className="text-sm text-muted-foreground">
              هذا التقرير صادر من نظام PROFIT للتقييم
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              جميع الحقوق محفوظة © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}