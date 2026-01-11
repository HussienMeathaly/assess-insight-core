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

      // Fetch ALL criteria to ensure we have complete data
      const { data: allCriteria, error: criteriaError } = await supabase
        .from('criteria')
        .select(`
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
        `)
        .eq('is_active', true);

      if (criteriaError) throw criteriaError;

      // Create a map of criteria for quick lookup
      const criteriaMap = new Map(allCriteria?.map(c => [c.id, c]) || []);

      // Transform answers with complete criteria data
      const transformedAnswers: ReportAnswer[] = (answers || []).map((answer: any) => {
        const criteriaData = answer.criteria || criteriaMap.get(answer.criterion_id);
        return {
          criterion_id: criteriaData?.id || '',
          criterion_name: criteriaData?.name || '',
          criterion_weight: criteriaData?.weight_percentage || 0,
          selected_option_label: answer.criteria_options?.label || '',
          score: answer.score || 0,
          sub_element_id: criteriaData?.sub_elements?.id || '',
          sub_element_name: criteriaData?.sub_elements?.name || '',
          main_element_id: criteriaData?.sub_elements?.main_elements?.id || '',
          main_element_name: criteriaData?.sub_elements?.main_elements?.name || '',
          main_element_weight: criteriaData?.sub_elements?.main_elements?.weight_percentage || 0,
        };
      });

      // Group answers by main element
      const groupedAnswers = transformedAnswers.reduce<GroupedElement[]>((acc, answer) => {
        if (!answer.main_element_id) return acc;
        
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
      const totalAnswers = transformedAnswers.length;

      // Generate separate pages for better PDF formatting
      const generateMainElementPages = () => {
        return groupedAnswers.map((mainElement, index) => {
          const elemPercentage = mainElement.mainElementWeight > 0 
            ? Math.round((mainElement.totalScore / mainElement.mainElementWeight) * 100) 
            : 0;
          
          return `
            <div class="page ${index > 0 ? 'page-break' : ''}">
              <div class="page-header">
                <img src="${profitLogo}" alt="Profit Logo" class="page-header-logo" />
                <div class="page-header-info">
                  <span>${orgName}</span>
                  <span class="separator">|</span>
                  <span>${domainName}</span>
                </div>
              </div>
              
              <div class="main-element-section">
                <div class="main-element-header">
                  <div class="main-element-title">${mainElement.mainElementName}</div>
                  <div class="main-element-score">${mainElement.totalScore.toFixed(1)} / ${mainElement.mainElementWeight} (${elemPercentage}%)</div>
                </div>
                
                ${mainElement.subElements.map(subElement => `
                  <div class="sub-element">
                    <div class="sub-element-title">${subElement.subElementName}</div>
                    <table class="criteria-table">
                      <thead>
                        <tr>
                          <th style="width: 50%;">المعيار</th>
                          <th style="width: 30%;">الإجابة</th>
                          <th style="width: 10%;">الوزن</th>
                          <th style="width: 10%;">النتيجة</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${subElement.answers.map(answer => {
                          const scoreColor = getScoreColor(answer.score);
                          return `
                            <tr>
                              <td class="criterion-name">${answer.criterion_name}</td>
                              <td class="criterion-answer">${answer.selected_option_label}</td>
                              <td class="criterion-weight">${answer.criterion_weight}%</td>
                              <td class="criterion-score" style="color: ${scoreColor};">${answer.score}%</td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                `).join('')}
              </div>
              
              <div class="page-footer">
                <span>صفحة ${index + 2}</span>
                <span class="separator">|</span>
                <span>نظام PROFIT للتقييم</span>
              </div>
            </div>
          `;
        }).join('');
      };

      // Create HTML content for PDF with Readex Pro font
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Readex Pro', 'Arial', sans-serif;
              background: white;
              color: #1f2937;
              line-height: 1.7;
              direction: rtl;
              font-size: 12px;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              padding: 15mm;
              background: white;
              position: relative;
              padding-bottom: 25mm;
            }
            .page-break {
              page-break-before: always;
            }
            .page-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 12px;
              border-bottom: 2px solid ${BRAND_NAVY};
              margin-bottom: 20px;
            }
            .page-header-logo {
              height: 35px;
              width: auto;
            }
            .page-header-info {
              font-size: 11px;
              color: ${BRAND_NAVY};
              font-weight: 500;
            }
            .page-header-info .separator {
              margin: 0 8px;
              color: ${BRAND_GREEN};
            }
            .page-footer {
              position: absolute;
              bottom: 10mm;
              left: 15mm;
              right: 15mm;
              text-align: center;
              font-size: 10px;
              color: #6b7280;
              border-top: 1px solid ${BRAND_NAVY}20;
              padding-top: 8px;
            }
            .page-footer .separator {
              margin: 0 10px;
              color: ${BRAND_GREEN};
            }
            .header {
              text-align: center;
              padding: 25px;
              border: 3px solid ${BRAND_NAVY};
              border-radius: 15px;
              margin-bottom: 25px;
              background: linear-gradient(135deg, ${BRAND_NAVY}05 0%, ${BRAND_GREEN}05 100%);
            }
            .logo-container {
              margin-bottom: 15px;
            }
            .logo-img {
              max-width: 160px;
              height: auto;
            }
            .report-title {
              font-size: 24px;
              color: ${BRAND_NAVY};
              margin-top: 12px;
              font-weight: 700;
            }
            .report-date {
              font-size: 12px;
              color: #6b7280;
              margin-top: 8px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: white;
              background: linear-gradient(135deg, ${BRAND_NAVY} 0%, ${BRAND_NAVY_LIGHT} 100%);
              padding: 10px 15px;
              border-radius: 8px 8px 0 0;
              margin-bottom: 0;
            }
            .section-content {
              border: 2px solid ${BRAND_NAVY}20;
              border-top: none;
              border-radius: 0 0 8px 8px;
              padding: 15px;
              background: #fafafa;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            .info-item {
              padding: 10px;
              background: white;
              border-radius: 6px;
              border: 1px solid ${BRAND_NAVY}10;
            }
            .info-label {
              font-size: 10px;
              color: #6b7280;
              margin-bottom: 3px;
            }
            .info-value {
              font-size: 13px;
              font-weight: 600;
              color: ${BRAND_NAVY};
            }
            .score-box {
              text-align: center;
              padding: 25px;
              border-radius: 12px;
              background: ${isQualified ? `linear-gradient(135deg, ${BRAND_GREEN}10 0%, ${BRAND_GREEN}20 100%)` : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'};
              border: 3px solid ${isQualified ? BRAND_GREEN : '#dc2626'};
            }
            .score-circle {
              width: 100px;
              height: 100px;
              border-radius: 50%;
              background: white;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              border: 6px solid ${isQualified ? BRAND_GREEN : '#dc2626'};
              margin-bottom: 15px;
            }
            .score-value {
              font-size: 32px;
              font-weight: 700;
              color: ${isQualified ? BRAND_GREEN : '#dc2626'};
            }
            .score-percent {
              font-size: 14px;
              color: #6b7280;
            }
            .score-status {
              font-size: 18px;
              font-weight: 700;
              color: ${isQualified ? BRAND_GREEN : '#dc2626'};
              margin-bottom: 5px;
            }
            .score-message {
              font-size: 12px;
              color: #4b5563;
            }
            .stats-row {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px dashed ${BRAND_NAVY}30;
            }
            .stat-item {
              text-align: center;
            }
            .stat-value {
              font-size: 20px;
              font-weight: 700;
              color: ${BRAND_NAVY};
            }
            .stat-label {
              font-size: 10px;
              color: #6b7280;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            .summary-table th {
              background: linear-gradient(135deg, ${BRAND_NAVY} 0%, ${BRAND_NAVY_LIGHT} 100%);
              color: white;
              padding: 10px;
              text-align: right;
              font-weight: 600;
            }
            .summary-table td {
              padding: 10px;
              border-bottom: 1px solid ${BRAND_NAVY}15;
            }
            .summary-table tr:nth-child(even) {
              background: ${BRAND_NAVY}03;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 15px;
              font-size: 10px;
              font-weight: 600;
            }
            .main-element-section {
              margin-bottom: 20px;
            }
            .main-element-header {
              background: linear-gradient(135deg, ${BRAND_NAVY} 0%, ${BRAND_NAVY_LIGHT} 100%);
              color: white;
              padding: 12px 15px;
              border-radius: 8px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .main-element-title {
              font-size: 14px;
              font-weight: 700;
            }
            .main-element-score {
              font-size: 12px;
              background: ${BRAND_GREEN};
              color: white;
              padding: 5px 12px;
              border-radius: 15px;
              font-weight: 600;
            }
            .sub-element {
              background: #fafafa;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 12px;
              border: 1px solid ${BRAND_NAVY}10;
            }
            .sub-element-title {
              font-size: 13px;
              font-weight: 600;
              color: ${BRAND_NAVY};
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 2px solid ${BRAND_GREEN}40;
            }
            .criteria-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            .criteria-table th {
              background: ${BRAND_NAVY}10;
              color: ${BRAND_NAVY};
              padding: 8px;
              text-align: right;
              font-weight: 600;
              border-bottom: 2px solid ${BRAND_NAVY}20;
            }
            .criteria-table td {
              padding: 8px;
              border-bottom: 1px solid ${BRAND_NAVY}10;
              vertical-align: top;
            }
            .criteria-table tr:nth-child(even) {
              background: white;
            }
            .criteria-table tr:hover {
              background: ${BRAND_GREEN}05;
            }
            .criterion-name {
              font-size: 11px;
              color: #374151;
              line-height: 1.5;
            }
            .criterion-answer {
              font-size: 10px;
              color: #6b7280;
            }
            .criterion-weight {
              font-size: 10px;
              color: ${BRAND_NAVY};
              text-align: center;
            }
            .criterion-score {
              font-size: 11px;
              font-weight: 600;
              text-align: center;
            }
            .footer {
              text-align: center;
              padding: 20px;
              border-top: 3px solid ${BRAND_NAVY};
              margin-top: 20px;
              background: linear-gradient(135deg, ${BRAND_NAVY}05 0%, ${BRAND_GREEN}05 100%);
              border-radius: 12px;
            }
            .footer-logo {
              max-width: 80px;
              margin-bottom: 10px;
            }
            .footer p {
              color: ${BRAND_NAVY};
              font-size: 11px;
              margin-bottom: 3px;
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="page">
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
                    <div class="info-label">اسم الجهة</div>
                    <div class="info-value">${orgName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">المسؤول</div>
                    <div class="info-value">${evaluation.organizations?.contact_person || '-'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">البريد الإلكتروني</div>
                    <div class="info-value">${evaluation.organizations?.email || '-'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">رقم الهاتف</div>
                    <div class="info-value">${evaluation.organizations?.phone || '-'}</div>
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
                  <div class="stats-row">
                    <div class="stat-item">
                      <div class="stat-value">${totalAnswers}</div>
                      <div class="stat-label">إجمالي المعايير</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">${groupedAnswers.length}</div>
                      <div class="stat-label">العناصر الرئيسية</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">${evaluation.max_score || 100}</div>
                      <div class="stat-label">الدرجة القصوى</div>
                    </div>
                  </div>
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
                      <th style="width: 45%;">العنصر الرئيسي</th>
                      <th style="width: 20%;">النتيجة</th>
                      <th style="width: 15%;">النسبة</th>
                      <th style="width: 20%;">التقييم</th>
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
                            <span class="status-badge" style="background: ${color}15; color: ${color};">
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

            <div class="page-footer">
              <span>صفحة 1</span>
              <span class="separator">|</span>
              <span>نظام PROFIT للتقييم</span>
            </div>
          </div>

          <!-- Detail Pages for each Main Element -->
          ${generateMainElementPages()}

          <!-- Final Page with Footer -->
          <div class="page page-break">
            <div class="page-header">
              <img src="${profitLogo}" alt="Profit Logo" class="page-header-logo" />
              <div class="page-header-info">
                <span>${orgName}</span>
                <span class="separator">|</span>
                <span>${domainName}</span>
              </div>
            </div>
            
            <div class="footer" style="margin-top: 50px;">
              <img src="${profitLogo}" alt="Profit Logo" class="footer-logo" />
              <p style="font-size: 16px; font-weight: 700; margin-bottom: 10px;">شكراً لاستخدامكم نظام PROFIT</p>
              <p>تم إنشاء هذا التقرير بواسطة نظام PROFIT للتقييم</p>
              <p>جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
            </div>
            
            <div class="page-footer">
              <span>صفحة ${groupedAnswers.length + 2}</span>
              <span class="separator">|</span>
              <span>نظام PROFIT للتقييم</span>
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
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get all page elements
      const pages = iframeDoc.querySelectorAll('.page');
      if (!pages || pages.length === 0) throw new Error('Pages not found');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;

      // Process each page separately
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Generate canvas from page
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
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
