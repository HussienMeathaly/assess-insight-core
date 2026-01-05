import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

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

export function GenerateReportButton({ 
  evaluationId, 
  organizationName,
  isCompleted 
}: GenerateReportButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setGenerating(true);

    try {
      // Fetch evaluation data
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .select(`
          *,
          organizations (
            name,
            contact_person,
            email,
            phone
          )
        `)
        .eq('id', evaluationId)
        .single();

      if (evalError) throw evalError;

      // Fetch evaluation answers with all related data
      const { data: answers, error: answersError } = await supabase
        .from('evaluation_answers')
        .select(`
          score,
          criteria (
            id,
            name,
            weight_percentage,
            sub_elements (
              id,
              name,
              main_elements (
                id,
                name,
                weight_percentage
              )
            )
          ),
          criteria_options (
            label
          )
        `)
        .eq('evaluation_id', evaluationId);

      if (answersError) throw answersError;

      // Transform answers
      const transformedAnswers: ReportAnswer[] = (answers || []).map((answer: any) => ({
        criterion_id: answer.criteria?.id || '',
        criterion_name: answer.criteria?.name || '',
        criterion_weight: answer.criteria?.weight_percentage || 0,
        selected_option_label: answer.criteria_options?.label || '',
        score: answer.score || 0,
        sub_element_id: answer.criteria?.sub_elements?.id || '',
        sub_element_name: answer.criteria?.sub_elements?.name || '',
        main_element_id: answer.criteria?.sub_elements?.main_elements?.id || '',
        main_element_name: answer.criteria?.sub_elements?.main_elements?.name || '',
        main_element_weight: answer.criteria?.sub_elements?.main_elements?.weight_percentage || 0,
      }));

      // Group answers by main element
      const groupedAnswers = transformedAnswers.reduce<GroupedElement[]>((acc, answer) => {
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

      // Generate PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add Arabic font support
      pdf.setFont('helvetica');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      const drawRightAlignedText = (text: string, y: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const textWidth = pdf.getTextWidth(text);
        pdf.text(text, pageWidth - margin - textWidth, y);
      };

      const drawCenteredText = (text: string, y: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const textWidth = pdf.getTextWidth(text);
        pdf.text(text, (pageWidth - textWidth) / 2, y);
      };

      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      drawCenteredText('Evaluation Report', 25, 24);
      pdf.setFontSize(14);
      drawCenteredText('PROFIT Assessment System', 38, 14);

      yPos = 60;
      pdf.setTextColor(0, 0, 0);

      // Organization Info Box
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 3, 3, 'F');
      
      yPos += 12;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Organization Information', margin + 5, yPos);
      
      yPos += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${evaluation.organizations?.name || organizationName}`, margin + 5, yPos);
      
      yPos += 7;
      pdf.text(`Contact: ${evaluation.organizations?.contact_person || '-'}`, margin + 5, yPos);
      
      yPos += 7;
      pdf.text(`Email: ${evaluation.organizations?.email || '-'}`, margin + 5, yPos);
      
      yPos += 7;
      pdf.text(`Phone: ${evaluation.organizations?.phone || '-'}`, margin + 5, yPos);

      yPos += 20;

      // Score Summary Box
      const percentage = evaluation.total_score || 0;
      const isQualified = percentage >= 60;
      
      if (isQualified) {
        pdf.setFillColor(220, 252, 231);
      } else {
        pdf.setFillColor(254, 226, 226);
      }
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 3, 3, 'F');
      
      yPos += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      if (isQualified) {
        pdf.setTextColor(22, 163, 74);
      } else {
        pdf.setTextColor(220, 38, 38);
      }
      drawCenteredText('Total Score: ' + percentage + '%', yPos, 20);
      
      yPos += 12;
      pdf.setFontSize(12);
      const statusMessage = isQualified ? 'Product Qualified for Classification' : 'Product Needs Improvements';
      drawCenteredText(statusMessage, yPos, 14);
      
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      drawCenteredText(`Report Date: ${new Date().toLocaleDateString('en-US')}`, yPos, 10);

      yPos += 25;
      pdf.setTextColor(0, 0, 0);

      // Results Summary
      addNewPageIfNeeded(30);
      
      pdf.setFillColor(59, 130, 246);
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Results Summary by Main Elements', margin + 5, yPos + 7);
      
      yPos += 18;
      pdf.setTextColor(0, 0, 0);

      // Table Header
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Element', margin + 5, yPos + 7);
      pdf.text('Score', pageWidth - margin - 40, yPos + 7);
      pdf.text('Status', pageWidth - margin - 15, yPos + 7);
      
      yPos += 12;

      // Table Rows
      pdf.setFont('helvetica', 'normal');
      groupedAnswers.forEach((element) => {
        addNewPageIfNeeded(12);
        
        const elementPercentage = element.mainElementWeight > 0 
          ? (element.totalScore / element.mainElementWeight) * 100 
          : 0;
        
        let statusLabel = 'Needs Work';
        if (elementPercentage >= 80) statusLabel = 'Excellent';
        else if (elementPercentage >= 60) statusLabel = 'Good';
        else if (elementPercentage >= 40) statusLabel = 'Fair';

        // Alternate row colors
        if (groupedAnswers.indexOf(element) % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
        }

        pdf.setFontSize(9);
        let elementName = element.mainElementName;
        if (element.mainElementName.length > 50) {
          elementName = element.mainElementName.substring(0, 47) + '...';
        }
        pdf.text(elementName, margin + 5, yPos);
        pdf.text(element.totalScore.toFixed(1) + '/' + element.mainElementWeight, pageWidth - margin - 40, yPos);
        
        // Status color
        if (elementPercentage >= 60) {
          pdf.setTextColor(22, 163, 74);
        } else {
          pdf.setTextColor(220, 38, 38);
        }
        pdf.text(statusLabel, pageWidth - margin - 15, yPos);
        pdf.setTextColor(0, 0, 0);
        
        yPos += 10;
      });

      yPos += 15;

      // Detailed Results
      groupedAnswers.forEach((mainElement) => {
        addNewPageIfNeeded(40);
        
        // Main Element Header
        pdf.setFillColor(59, 130, 246);
        pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        
        const mainElName = mainElement.mainElementName.length > 60 
          ? mainElement.mainElementName.substring(0, 57) + '...' 
          : mainElement.mainElementName;
        pdf.text(mainElName, margin + 5, yPos + 8);
        pdf.text(`${mainElement.totalScore.toFixed(1)}/${mainElement.mainElementWeight}`, pageWidth - margin - 25, yPos + 8);
        
        yPos += 18;
        pdf.setTextColor(0, 0, 0);

        mainElement.subElements.forEach((subElement) => {
          addNewPageIfNeeded(25);
          
          // Sub Element Header
          pdf.setFillColor(241, 245, 249);
          pdf.roundedRect(margin + 5, yPos, pageWidth - 2 * margin - 10, 8, 1, 1, 'F');
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          
          const subElName = subElement.subElementName.length > 65 
            ? subElement.subElementName.substring(0, 62) + '...' 
            : subElement.subElementName;
          pdf.text(subElName, margin + 10, yPos + 5.5);
          
          yPos += 12;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);

          subElement.answers.forEach((answer) => {
            addNewPageIfNeeded(15);
            
            const criterionName = answer.criterion_name.length > 55 
              ? answer.criterion_name.substring(0, 52) + '...' 
              : answer.criterion_name;
            
            pdf.setTextColor(60, 60, 60);
            pdf.text(`• ${criterionName}`, margin + 15, yPos);
            
            const scoreText = `${answer.score}%`;
            if (answer.score >= 60) {
              pdf.setTextColor(22, 163, 74);
            } else if (answer.score >= 40) {
              pdf.setTextColor(202, 138, 4);
            } else {
              pdf.setTextColor(220, 38, 38);
            }
            pdf.text(scoreText, pageWidth - margin - 15, yPos);
            pdf.setTextColor(0, 0, 0);
            
            yPos += 6;
          });
          
          yPos += 5;
        });
        
        yPos += 8;
      });

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2 - 10, pageHeight - 10);
        pdf.text('PROFIT Evaluation System', margin, pageHeight - 10);
      }

      // Save PDF
      pdf.save(`Evaluation-Report-${organizationName.replace(/\s+/g, '-')}.pdf`);
      toast.success('تم تحميل التقرير بنجاح');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء التقرير');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGeneratePDF}
      disabled={!isCompleted || generating}
      className="gap-2"
      title={!isCompleted ? 'التقييم غير مكتمل' : 'تحميل التقرير PDF'}
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{generating ? 'جاري التحميل...' : 'تقرير'}</span>
    </Button>
  );
}
