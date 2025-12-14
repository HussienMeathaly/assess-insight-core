import { useState, useCallback } from 'react';
import { AssessmentResult } from '@/types/assessment';
import { assessmentQuestions } from '@/data/questions';

export function useAnalysis() {
  const [analysisText, setAnalysisText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateAnalysis = useCallback((result: AssessmentResult): string => {
    const { isQualified, totalScore, answers } = result;
    
    // Analyze answer patterns
    const hasBusinessExperience = answers.find(a => a.questionId === 1)?.score === 4;
    const productExperienceAnswer = answers.find(a => a.questionId === 2);
    const hasMarketStudy = answers.find(a => a.questionId === 3)?.score === 4;
    const hasFunding = answers.find(a => a.questionId === 4)?.score === 6;
    const isAvailable = answers.find(a => a.questionId === 5)?.score === 3;

    // Get product experience level
    const productExpOption = assessmentQuestions[1].options.find(
      o => o.id === productExperienceAnswer?.selectedOptionId
    );
    const productExpLevel = productExpOption?.label || '';

    if (isQualified) {
      let analysis = 'تشير نتائج التقييم الأولي إلى توفر حدٍ أدنى من الجاهزية يمكّن المنشأة من الاستفادة من التقييم الشامل.';
      
      const strengths: string[] = [];
      if (hasBusinessExperience) strengths.push('خبرة تجارية سابقة');
      if (productExperienceAnswer && productExperienceAnswer.score > 1.5) {
        strengths.push(`خبرة في منتجات مشابهة (${productExpLevel})`);
      }
      if (hasMarketStudy) strengths.push('دراسة مسبقة للسوق');
      if (hasFunding) strengths.push('جاهزية تمويلية');
      if (isAvailable) strengths.push('تفرغ للإدارة');

      if (strengths.length > 0) {
        analysis += ` تتميز المنشأة بـ: ${strengths.join('، ')}.`;
      }

      analysis += ' ننصح بالمضي قدمًا في التقييم الشامل للحصول على خارطة طريق تفصيلية.';
      
      return analysis;
    } else {
      let analysis = 'أظهرت نتائج التقييم الأولي وجود فجوات أساسية قد تؤثر على الاستفادة المثلى من التقييم الشامل في مرحلته الحالية.';
      
      const gaps: string[] = [];
      if (!hasBusinessExperience) gaps.push('الخبرة التجارية');
      if (!productExperienceAnswer || productExperienceAnswer.score === 0) gaps.push('الخبرة في المنتجات المشابهة');
      if (!hasMarketStudy) gaps.push('دراسة السوق');
      if (!hasFunding) gaps.push('الجاهزية التمويلية');
      if (!isAvailable) gaps.push('التفرغ للإدارة');

      if (gaps.length > 0) {
        analysis += ` تتضمن الفجوات الرئيسية: ${gaps.join('، ')}.`;
      }

      analysis += ' يمكنك الاستمرار في التقييم الشامل للحصول على توصيات مفصلة لتطوير هذه الجوانب.';
      
      return analysis;
    }
  }, []);

  const analyzeResult = useCallback(async (result: AssessmentResult) => {
    setIsLoading(true);
    
    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = generateAnalysis(result);
    setAnalysisText(analysis);
    setIsLoading(false);
  }, [generateAnalysis]);

  return {
    analysisText,
    isLoading,
    analyzeResult,
  };
}
