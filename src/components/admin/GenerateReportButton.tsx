import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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

export function GenerateReportButton({ 
  evaluationId, 
  organizationName,
  isCompleted 
}: GenerateReportButtonProps) {
  const [generating, setGenerating] = useState(false);

  // Profit brand colors
  const BRAND_NAVY = '#1e3a5f';
  const BRAND_GREEN = '#7cb342';
  const BRAND_NAVY_LIGHT = '#2d4a6f';
  const BRAND_GREEN_LIGHT = '#8bc34a';

  const getScoreColor = (score: number) => {
    if (score >= 80) return BRAND_GREEN;
    if (score >= 60) return BRAND_NAVY;
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
              padding-bottom: 25px;
              border-bottom: 4px solid ${BRAND_NAVY};
              margin-bottom: 30px;
              background: linear-gradient(135deg, ${BRAND_NAVY}08 0%, ${BRAND_GREEN}08 100%);
              padding: 25px;
              border-radius: 12px;
            }
            .logo-container {
              margin-bottom: 15px;
            }
            .logo-img {
              max-width: 180px;
              height: auto;
            }
            .report-title {
              font-size: 26px;
              color: ${BRAND_NAVY};
              margin-top: 15px;
              font-weight: 700;
            }
            .report-date {
              font-size: 13px;
              color: #6b7280;
              margin-top: 8px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 700;
              color: white;
              background: linear-gradient(135deg, ${BRAND_NAVY} 0%, ${BRAND_NAVY_LIGHT} 100%);
              padding: 12px 18px;
              border-radius: 10px 10px 0 0;
              margin-bottom: 0;
            }
            .section-content {
              border: 2px solid ${BRAND_NAVY}20;
              border-top: none;
              border-radius: 0 0 10px 10px;
              padding: 20px;
              background: linear-gradient(180deg, #f9fafb 0%, white 100%);
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 18px;
            }
            .info-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              background: white;
              border-radius: 8px;
              border: 1px solid ${BRAND_NAVY}15;
            }
            .info-label {
              font-size: 12px;
              color: #6b7280;
            }
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: ${BRAND_NAVY};
            }
            .score-box {
              text-align: center;
              padding: 35px;
              border-radius: 15px;
              background: ${isQualified ? `linear-gradient(135deg, ${BRAND_GREEN}15 0%, ${BRAND_GREEN}25 100%)` : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'};
              border: 3px solid ${isQualified ? BRAND_GREEN : '#dc2626'};
            }
            .score-circle {
              width: 140px;
              height: 140px;
              border-radius: 50%;
              background: white;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              border: 8px solid ${isQualified ? BRAND_GREEN : '#dc2626'};
              margin-bottom: 20px;
              box-shadow: 0 4px 20px ${isQualified ? BRAND_GREEN : '#dc2626'}30;
            }
            .score-value {
              font-size: 42px;
              font-weight: 700;
              color: ${isQualified ? BRAND_GREEN : '#dc2626'};
            }
            .score-percent {
              font-size: 18px;
              color: #6b7280;
            }
            .score-status {
              font-size: 22px;
              font-weight: 700;
              color: ${isQualified ? BRAND_GREEN : '#dc2626'};
              margin-bottom: 8px;
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
              background: linear-gradient(135deg, ${BRAND_NAVY} 0%, ${BRAND_NAVY_LIGHT} 100%);
              color: white;
              padding: 14px;
              text-align: right;
              font-weight: 600;
              font-size: 13px;
            }
            .summary-table td {
              padding: 14px;
              border-bottom: 1px solid ${BRAND_NAVY}15;
              font-size: 13px;
            }
            .summary-table tr:nth-child(even) {
              background: ${BRAND_NAVY}05;
            }
            .summary-table tr:hover {
              background: ${BRAND_GREEN}10;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 14px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
            }
            .main-element-header {
              background: linear-gradient(135deg, ${BRAND_NAVY} 0%, ${BRAND_NAVY_LIGHT} 100%);
              color: white;
              padding: 14px 18px;
              border-radius: 10px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .main-element-title {
              font-size: 16px;
              font-weight: 700;
            }
            .main-element-score {
              font-size: 14px;
              background: ${BRAND_GREEN};
              color: white;
              padding: 6px 14px;
              border-radius: 20px;
              font-weight: 600;
            }
            .sub-element {
              background: linear-gradient(180deg, ${BRAND_NAVY}08 0%, white 100%);
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 12px;
              margin-right: 20px;
              border: 1px solid ${BRAND_NAVY}15;
            }
            .sub-element-title {
              font-size: 14px;
              font-weight: 600;
              color: ${BRAND_NAVY};
              margin-bottom: 12px;
              padding-bottom: 10px;
              border-bottom: 2px solid ${BRAND_GREEN}40;
            }
            .criterion-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 10px 0;
              border-bottom: 1px dashed ${BRAND_NAVY}20;
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
              padding-top: 25px;
              border-top: 3px solid ${BRAND_NAVY}20;
              margin-top: 35px;
              background: linear-gradient(135deg, ${BRAND_NAVY}05 0%, ${BRAND_GREEN}05 100%);
              padding: 25px;
              border-radius: 12px;
            }
            .footer p {
              color: ${BRAND_NAVY};
              font-size: 12px;
              margin-bottom: 5px;
            }
            .footer-logo {
              max-width: 100px;
              margin-bottom: 10px;
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
              <div class="logo-container">
                <img src="${profitLogo}" alt="Profit Logo" class="logo-img" />
              </div>
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
              <img src="${profitLogo}" alt="Profit Logo" class="footer-logo" />
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
