import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEvaluation } from '@/hooks/useEvaluation';
import { EvaluationProgress } from '@/components/evaluation/EvaluationProgress';
import { MainElementView } from '@/components/evaluation/MainElementView';
import { EvaluationResult } from '@/components/evaluation/EvaluationResult';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import profitLogo from '@/assets/profit-logo.png';

export default function FreeEvaluation() {
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);
  
  const {
    domain,
    loading,
    error,
    answers,
    scores,
    progress,
    currentMainElement,
    currentMainElementIndex,
    answerCriterion,
    goToNextElement,
    goToPreviousElement,
    goToElement,
    isFirstElement,
    isLastElement,
    saveEvaluation,
    saving,
    saved
  } = useEvaluation();

  // Save evaluation when showing results
  useEffect(() => {
    if (showResults && !saved && !saving) {
      saveEvaluation().then((success) => {
        if (success) {
          toast.success('تم حفظ نتائج التقييم بنجاح');
        } else {
          toast.error('تعذر حفظ التقييم. تأكد من تسجيل الدخول ثم أعد المحاولة.');
        }
      });
    }
  }, [showResults, saved, saving, saveEvaluation]);

  const handleRetake = () => {
    window.location.reload();
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Helmet>
          <title>التقييم المجاني | PROFIT</title>
        </Helmet>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل التقييم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Helmet>
          <title>خطأ | PROFIT</title>
        </Helmet>
        <div className="card-elevated rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-4">حدث خطأ</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen py-8 px-4" dir="rtl">
        <Helmet>
          <title>نتائج التقييم | PROFIT</title>
          <meta name="description" content="نتائج التقييم الشامل للمنتج" />
        </Helmet>
        <EvaluationResult
          totalScore={scores.total}
          maxScore={scores.max}
          scoresByElement={scores.byMainElement}
          onRetake={handleRetake}
          onBack={handleBack}
        />
      </div>
    );
  }

  if (!domain || !currentMainElement) {
    return null;
  }

  const elementsProgress = domain.main_elements.map(me => ({
    id: me.id,
    name: me.name,
    weight: me.weight_percentage,
    score: scores.byMainElement.get(me.id)?.score || 0,
    max: me.weight_percentage
  }));

  return (
    <div className="min-h-screen" dir="rtl">
      <Helmet>
        <title>{currentMainElement.name} - التقييم المجاني | PROFIT</title>
        <meta name="description" content={`تقييم ${currentMainElement.name} - التقييم الشامل لتصنيف المنتجات`} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <img src={profitLogo} alt="PROFIT" className="h-10" />
            </div>
            <div className="text-left">
              <div className="text-sm text-muted-foreground">التقدم</div>
              <div className="font-bold text-foreground">
                {progress.current} / {progress.total}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Progress Sidebar */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <EvaluationProgress
              elements={elementsProgress}
              currentIndex={currentMainElementIndex}
              onElementClick={goToElement}
              overallProgress={progress.percentage}
              totalScore={scores.total}
            />
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <MainElementView
              element={currentMainElement}
              answers={answers}
              onAnswerCriterion={answerCriterion}
              onNext={goToNextElement}
              onPrevious={goToPreviousElement}
              isFirst={isFirstElement}
              isLast={isLastElement}
              onComplete={() => setShowResults(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
