import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEvaluation } from '@/hooks/useEvaluation';
import { RegistrationForm, type RegistrationData } from '@/components/assessment/RegistrationForm';
import { EvaluationProgress } from '@/components/evaluation/EvaluationProgress';
import { MobileProgressSummary } from '@/components/evaluation/MobileProgressSummary';
import { MainElementView } from '@/components/evaluation/MainElementView';
import { EvaluationResult } from '@/components/evaluation/EvaluationResult';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import profitLogo from '@/assets/profit-logo.png';

export default function FreeEvaluation() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showResults, setShowResults] = useState(false);
  const [checkingOrg, setCheckingOrg] = useState(true);
  const [needsOrganization, setNeedsOrganization] = useState(false);
  
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
    clearCriterion,
    goToNextElement,
    goToPreviousElement,
    goToElement,
    isFirstElement,
    isLastElement,
    saveEvaluation,
    saving,
    saved
  } = useEvaluation();

  // Ensure the user has an organization before starting (required for saving reports)
  useEffect(() => {
    let cancelled = false;

    async function checkOrganization() {
      if (!user) {
        setNeedsOrganization(false);
        setCheckingOrg(false);
        return;
      }

      setCheckingOrg(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setCheckingOrg(false);
        toast.error('تعذر التحقق من بيانات الجهة. حاول مرة أخرى.');
        return;
      }

      setNeedsOrganization(!data);
      setCheckingOrg(false);
    }

    checkOrganization();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleOrganizationSubmit = async (data: RegistrationData) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('organizations').insert({
        name: data.organizationName,
        contact_person: data.contactPerson,
        phone: data.phone,
        email: data.email,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success('تم حفظ بيانات الجهة بنجاح');
      setNeedsOrganization(false);
    } catch {
      toast.error('تعذر حفظ بيانات الجهة. يرجى المحاولة مرة أخرى.');
    }
  };

  // Save evaluation when showing results
  useEffect(() => {
    if (showResults && !saved && !saving) {
      saveEvaluation().then((success) => {
        if (success) {
          toast.success('تم حفظ نتائج التقييم بنجاح');
        } else {
          toast.error('تعذر حفظ التقييم. تأكد من تسجيل الدخول وإكمال بيانات الجهة.');
        }
      });
    }
  }, [showResults, saved, saving, saveEvaluation]);

  const handleRetake = () => {
    window.location.reload();
  };

  const handleBack = () => {
    navigate('/assessment');
  };

  // Navigate back to assessment results
  const handleBackToAssessment = () => {
    navigate('/assessment');
  };

  if (authLoading || checkingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Helmet>
          <title>التقييم المجاني | PROFIT</title>
        </Helmet>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحقق من الحساب...</p>
        </div>
      </div>
    );
  }

  if (needsOrganization) {
    return (
      <div className="min-h-screen py-10 px-4" dir="rtl">
        <Helmet>
          <title>إكمال بيانات الجهة | PROFIT</title>
          <meta name="description" content="أكمل بيانات الجهة للبدء في التقييم المجاني وحفظ التقرير في لوحة التحكم" />
        </Helmet>
        <RegistrationForm onSubmit={handleOrganizationSubmit} onBack={() => navigate('/')} />
      </div>
    );
  }

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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={handleBackToAssessment}
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <img src={profitLogo} alt="PROFIT" className="h-8 sm:h-10" />
            </div>
            <div className="text-left bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
              <div className="text-xs sm:text-sm text-muted-foreground">التقدم</div>
              <div className="font-bold text-foreground text-sm sm:text-base">
                {progress.current} / {progress.total}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Progress Sidebar - Hidden on mobile, shown in sheet */}
          <aside className="hidden lg:block lg:col-span-4 lg:order-1">
            <EvaluationProgress
              elements={elementsProgress}
              currentIndex={currentMainElementIndex}
              onElementClick={goToElement}
              overallProgress={progress.percentage}
              totalScore={scores.total}
            />
          </aside>

          {/* Mobile Progress Summary */}
          <div className="lg:hidden order-1">
            <MobileProgressSummary 
              elements={elementsProgress}
              currentIndex={currentMainElementIndex}
              onElementClick={goToElement}
              overallProgress={progress.percentage}
              totalScore={scores.total}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 order-2">
            <MainElementView
              element={currentMainElement}
              answers={answers}
              onAnswerCriterion={answerCriterion}
              onClearCriterion={clearCriterion}
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
