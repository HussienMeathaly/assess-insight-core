import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#2563eb';
    if (score >= 40) return '#ca8a04';
    return '#dc2626';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'ممتاز';
    if (score >= 60) return 'جيد جداً';
    if (score >= 40) return 'جيد';
    return 'يحتاج تحسين';
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);

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

      // Fetch evaluation answers with all related data
      const { data: answers, error: answersError } = await supabase
        .from('evaluation_answers')
        .select(`
          score,
          criteria (
            id,
            name,
            weight_percentage,
            description,
            sub_elements (
              id,
              name,
              display_order,
              main_elements (
                id,
                name,
                weight_percentage,
                display_order
              )
            )
          ),
          criteria_options (
            label,
            score_percentage
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

      const percentage = evaluation.total_score || 0;
      const isQualified = percentage >= 60;
      const orgName = evaluation.organizations?.name || organizationName;
      const domainName = evaluation.evaluation_domains?.name || 'تقييم المنتج';

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Cairo', 'Arial', sans-serif;
              background: white;
              color: #1f2937;
              line-height: 1.6;
              direction: rtl;
            }
            .container {
              width: 210mm;
              padding: 15mm;
              background: white;
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
              margin-bottom: 25px;
            }
            .logo-text {
              font-size: 32px;
              font-weight: 700;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 24px;
              color: #374151;
              margin-top: 10px;
            }
            .report-date {
              font-size: 12px;
              color: #6b7280;
              margin-top: 5px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 700;
              color: white;
              background: #2563eb;
              padding: 10px 15px;
              border-radius: 8px 8px 0 0;
              margin-bottom: 0;
            }
            .section-content {
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
              padding: 20px;
              background: #f9fafb;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .info-item {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .info-label {
              font-size: 12px;
              color: #6b7280;
            }
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
            }
            .score-box {
              text-align: center;
              padding: 30px;
              border-radius: 12px;
              background: ${isQualified ? '#dcfce7' : '#fee2e2'};
              border: 2px solid ${isQualified ? '#16a34a' : '#dc2626'};
            }
            .score-circle {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: white;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              border: 6px solid ${isQualified ? '#16a34a' : '#dc2626'};
              margin-bottom: 15px;
            }
            .score-value {
              font-size: 36px;
              font-weight: 700;
              color: ${isQualified ? '#16a34a' : '#dc2626'};
            }
            .score-percent {
              font-size: 16px;
              color: #6b7280;
            }
            .score-status {
              font-size: 20px;
              font-weight: 700;
              color: ${isQualified ? '#16a34a' : '#dc2626'};
              margin-bottom: 5px;
            }
            .score-message {
              font-size: 14px;
              color: #4b5563;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
            }
            .summary-table th {
              background: #e5e7eb;
              padding: 12px;
              text-align: right;
              font-weight: 600;
              font-size: 13px;
              border-bottom: 2px solid #d1d5db;
            }
            .summary-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
            }
            .summary-table tr:nth-child(even) {
              background: #f3f4f6;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
            }
            .main-element-header {
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              padding: 12px 15px;
              border-radius: 8px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .main-element-title {
              font-size: 15px;
              font-weight: 700;
            }
            .main-element-score {
              font-size: 14px;
              background: rgba(255,255,255,0.2);
              padding: 4px 12px;
              border-radius: 20px;
            }
            .sub-element {
              background: #f3f4f6;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 10px;
              margin-right: 15px;
            }
            .sub-element-title {
              font-size: 13px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .criterion-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 8px 0;
              border-bottom: 1px dashed #e5e7eb;
            }
            .criterion-row:last-child {
              border-bottom: none;
            }
            .criterion-name {
              font-size: 12px;
              color: #4b5563;
              flex: 1;
              padding-left: 15px;
            }
            .criterion-answer {
              font-size: 11px;
              color: #6b7280;
              max-width: 150px;
              text-align: left;
            }
            .criterion-score {
              font-size: 12px;
              font-weight: 600;
              min-width: 50px;
              text-align: left;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              margin-top: 30px;
              color: #9ca3af;
              font-size: 11px;
            }
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo-text">PROFIT</div>
              <div class="report-title">تقرير ${domainName}</div>
              <div class="report-date">تاريخ إصدار التقرير: ${new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <!-- Organization Info -->
            <div class="section">
              <div class="section-title">معلومات الجهة</div>
              <div class="section-content">
                <div class="info-grid">
                  <div class="info-item">
                    <div>
                      <div class="info-label">اسم الجهة</div>
                      <div class="info-value">${orgName}</div>
                    </div>
                  </div>
                  <div class="info-item">
                    <div>
                      <div class="info-label">المسؤول</div>
                      <div class="info-value">${evaluation.organizations?.contact_person || '-'}</div>
                    </div>
                  </div>
                  <div class="info-item">
                    <div>
                      <div class="info-label">البريد الإلكتروني</div>
                      <div class="info-value">${evaluation.organizations?.email || '-'}</div>
                    </div>
                  </div>
                  <div class="info-item">
                    <div>
                      <div class="info-label">رقم الهاتف</div>
                      <div class="info-value">${evaluation.organizations?.phone || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Score Summary -->
            <div class="section">
              <div class="section-title">ملخص النتيجة</div>
              <div class="section-content">
                <div class="score-box">
                  <div class="score-circle">
                    <div class="score-value">${percentage}</div>
                    <div class="score-percent">%</div>
                  </div>
                  <div class="score-status">${isQualified ? 'مؤهل للتصنيف' : 'يحتاج تحسينات'}</div>
                  <div class="score-message">${isQualified ? 'حقق المنتج الحد الأدنى المطلوب للتأهل' : 'لم يحقق المنتج الحد الأدنى المطلوب (60%)'}</div>
                </div>
              </div>
            </div>

            <!-- Results Summary Table -->
            <div class="section">
              <div class="section-title">ملخص النتائج حسب العناصر الرئيسية</div>
              <div class="section-content" style="padding: 0;">
                <table class="summary-table">
                  <thead>
                    <tr>
                      <th style="width: 50%;">العنصر الرئيسي</th>
                      <th style="width: 20%;">النتيجة</th>
                      <th style="width: 15%;">النسبة</th>
                      <th style="width: 15%;">التقييم</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${groupedAnswers.map(element => {
                      const elemPercentage = element.mainElementWeight > 0 
                        ? Math.round((element.totalScore / element.mainElementWeight) * 100) 
                        : 0;
                      const color = getScoreColor(elemPercentage);
                      const label = getScoreLabel(elemPercentage);
                      return `
                        <tr>
                          <td>${element.mainElementName}</td>
                          <td>${element.totalScore.toFixed(1)} / ${element.mainElementWeight}</td>
                          <td style="font-weight: 600; color: ${color};">${elemPercentage}%</td>
                          <td>
                            <span class="status-badge" style="background: ${color}20; color: ${color};">
                              ${label}
                            </span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Detailed Results -->
            <div class="section">
              <div class="section-title">التفاصيل الكاملة للتقييم</div>
              <div class="section-content">
                ${groupedAnswers.map(mainElement => {
                  const elemPercentage = mainElement.mainElementWeight > 0 
                    ? Math.round((mainElement.totalScore / mainElement.mainElementWeight) * 100) 
                    : 0;
                  return `
                    <div style="margin-bottom: 20px;">
                      <div class="main-element-header">
                        <div class="main-element-title">${mainElement.mainElementName}</div>
                        <div class="main-element-score">${mainElement.totalScore.toFixed(1)} / ${mainElement.mainElementWeight} (${elemPercentage}%)</div>
                      </div>
                      ${mainElement.subElements.map(subElement => `
                        <div class="sub-element">
                          <div class="sub-element-title">${subElement.subElementName}</div>
                          ${subElement.answers.map(answer => {
                            const scoreColor = getScoreColor(answer.score);
                            return `
                              <div class="criterion-row">
                                <div class="criterion-name">${answer.criterion_name}</div>
                                <div class="criterion-answer">${answer.selected_option_label}</div>
                                <div class="criterion-score" style="color: ${scoreColor};">${answer.score}%</div>
                              </div>
                            `;
                          }).join('')}
                        </div>
                      `).join('')}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>تم إنشاء هذا التقرير بواسطة نظام PROFIT للتقييم</p>
              <p>جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create temporary iframe to render HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = 'auto';
      document.body.appendChild(iframe);

      // Write content to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');
      
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for fonts and content to load
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get the container element
      const container = iframeDoc.querySelector('.container') as HTMLElement;
      if (!container) throw new Error('Container not found');

      // Generate canvas from HTML
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up iframe
      document.body.removeChild(iframe);

      // Save PDF
      const fileName = `تقرير-التقييم-${orgName.replace(/\s+/g, '-')}.pdf`;
      pdf.save(fileName);
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
