import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ReportPreviewModal } from './ReportPreviewModal';
import { StatusDialog } from '@/components/ui/status-dialog';
import { generateReportPdfFromElement } from '@/lib/generatePdf';
import profitLogo from '@/assets/profit-logo.png';

interface GenerateReportButtonProps {
  evaluationId: string;
  organizationName: string;
  isCompleted: boolean;
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

interface ReportData {
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

export function GenerateReportButton({ 
  evaluationId, 
  organizationName,
  isCompleted 
}: GenerateReportButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloadStatus, setDownloadStatus] = useState<{ open: boolean; type: "success" | "error"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'جيد';
    if (score > 65) return 'متوسط';
    return 'ضعيف';
  };

  // Fetch report data
  const fetchReportData = async (): Promise<ReportData | null> => {
    try {
      // Fetch evaluation data with domain info
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .select(`
          *,
          organizations (
            name,
            contact_person,
            email,
            phone
          ),
          evaluation_domains (
            name
          )
        `)
        .eq('id', evaluationId)
        .single();

      if (evalError) throw evalError;

      // Fetch evaluation answers with criterion and option IDs
      const { data: answers, error: answersError } = await supabase
        .from('evaluation_answers')
        .select('criterion_id, selected_option_id, score')
        .eq('evaluation_id', evaluationId);

      if (answersError) throw answersError;

      // Fetch all criteria with nested relations
      const { data: allCriteria, error: criteriaError } = await supabase
        .from('criteria')
        .select(`
          id,
          name,
          weight_percentage,
          description,
          display_order,
          sub_elements!inner (
            id,
            name,
            display_order,
            main_elements!inner (
              id,
              name,
              weight_percentage,
              display_order
            )
          )
        `)
        .eq('is_active', true)
        .order('display_order');

      if (criteriaError) throw criteriaError;

      // Fetch all criteria options
      const { data: allOptions, error: optionsError } = await supabase
        .from('criteria_options')
        .select('id, criterion_id, label, score_percentage');

      if (optionsError) throw optionsError;

      // Create maps for quick lookup
      const criteriaMap = new Map(allCriteria?.map(c => [c.id, c]) || []);
      const optionsMap = new Map(allOptions?.map(o => [o.id, o]) || []);

      // Transform answers with complete criteria data
      const transformedAnswers: ReportAnswer[] = (answers || []).map((answer: any) => {
        const criteriaData = criteriaMap.get(answer.criterion_id);
        const optionData = optionsMap.get(answer.selected_option_id);
        
        return {
          criterion_id: criteriaData?.id || answer.criterion_id || '',
          criterion_name: criteriaData?.name || '',
          criterion_weight: criteriaData?.weight_percentage || 0,
          selected_option_label: optionData?.label || '',
          score: answer.score || 0,
          sub_element_id: criteriaData?.sub_elements?.id || '',
          sub_element_name: criteriaData?.sub_elements?.name || '',
          main_element_id: criteriaData?.sub_elements?.main_elements?.id || '',
          main_element_name: criteriaData?.sub_elements?.main_elements?.name || '',
          main_element_weight: criteriaData?.sub_elements?.main_elements?.weight_percentage || 0,
        };
      });

      // Filter out invalid answers and group by main element
      const validAnswers = transformedAnswers.filter(a => a.main_element_id && a.criterion_name);
      
      // Group answers by main element
      const groupedAnswers = validAnswers.reduce<GroupedElement[]>((acc, answer) => {
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
        const actualScore = (answer.criterion_weight * answer.score) / 100;
        mainElement.totalScore += actualScore;

        return acc;
      }, []);
      
      // Sort groups by main element display order
      groupedAnswers.sort((a, b) => {
        const aOrder = allCriteria?.find(c => c.sub_elements?.main_elements?.id === a.mainElementId)?.sub_elements?.main_elements?.display_order || 0;
        const bOrder = allCriteria?.find(c => c.sub_elements?.main_elements?.id === b.mainElementId)?.sub_elements?.main_elements?.display_order || 0;
        return aOrder - bOrder;
      });

      const percentage = evaluation.total_score || 0;
      const isQualified = percentage >= 60;
      const orgName = evaluation.organizations?.name || organizationName;
      const domainName = evaluation.evaluation_domains?.name || 'تقييم المنتج';
      const totalAnswers = validAnswers.length;

      return {
        orgName,
        domainName,
        contactPerson: evaluation.organizations?.contact_person || '',
        email: evaluation.organizations?.email || '',
        phone: evaluation.organizations?.phone || '',
        percentage,
        isQualified,
        totalAnswers,
        maxScore: evaluation.max_score || 100,
        groupedAnswers,
        completedAt: evaluation.completed_at
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('حدث خطأ أثناء جلب بيانات التقرير');
      return null;
    }
  };

  // Handle preview click
  const handlePreview = async () => {
    setLoading(true);
    const data = await fetchReportData();
    if (data) {
      setReportData(data);
      setPreviewOpen(true);
      // Preload pdf libs in background for faster download
      void import('@/lib/generatePdf');
      void import('html2canvas');
      void import('jspdf');
    }
    setLoading(false);
  };

  // Handle PDF generation by rasterizing the preview content (perfect Arabic shaping)
  const handleGeneratePDF = async () => {
    if (!captureRef.current) {
      setDownloadStatus({ open: true, type: "error", title: "حدث خطأ", message: "تعذر العثور على محتوى التقرير" });
      return;
    }

    setGenerating(true);

    try {
      const orgName = reportData?.orgName || organizationName;
      const fileName = `تقرير-التقييم-${orgName.replace(/\s+/g, '-')}.pdf`;

      await generateReportPdfFromElement({
        element: captureRef.current,
        fileName,
        scale: 2,
        blockSelector: ':scope > div',
        logoUrl: profitLogo,
        footerText: 'نظام +PROFIT للتقييم',
      });

      setDownloadStatus({ open: true, type: "success", title: "تم التحميل بنجاح", message: "تم تحميل ملف PDF بنجاح" });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setDownloadStatus({ open: true, type: "error", title: "حدث خطأ", message: "حدث خطأ أثناء إنشاء التقرير" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="flex gap-1">
        {/* Preview Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          disabled={!isCompleted || loading}
          className="gap-1.5"
          title={!isCompleted ? 'التقييم غير مكتمل' : 'معاينة التقرير'}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">معاينة</span>
        </Button>
      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onDownload={handleGeneratePDF}
        downloading={generating}
        reportData={reportData}
        captureRef={captureRef}
      />

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
