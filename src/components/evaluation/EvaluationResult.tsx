import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import profitLogo from '@/assets/profit-logo.png';

interface MainElementScore {
  score: number;
  max: number;
  name: string;
}

interface EvaluationResultProps {
  totalScore: number;
  maxScore: number;
  scoresByElement: Map<string, MainElementScore>;
  onRetake: () => void;
  onBack: () => void;
}

export function EvaluationResult({
  totalScore,
  maxScore,
  scoresByElement,
  onRetake,
  onBack
}: EvaluationResultProps) {
  const percentage = Math.round(totalScore);
  const isQualified = percentage >= 60;

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'جيد', color: 'text-green-500' };
    if (score > 65) return { label: 'متوسط', color: 'text-yellow-500' };
    return { label: 'ضعيف', color: 'text-destructive' };
  };

  const scoreInfo = getScoreLabel(percentage);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <img
          src={profitLogo}
          alt="PROFIT Logo"
          className="h-16 sm:h-20 md:h-24 mx-auto mb-4 sm:mb-6"
        />
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          نتائج التقييم
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          تم الانتهاء من التقييم الشامل للمنتج
        </p>
      </div>

      {/* Main Score Card */}
      <div className="card-elevated rounded-xl sm:rounded-2xl p-5 sm:p-8 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Score Circle */}
          <div className="relative w-28 h-28 sm:w-40 sm:h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isQualified ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.83} 283`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-bold text-foreground">{percentage}%</span>
              <span className={cn("text-xs sm:text-sm font-medium", scoreInfo.color)}>
                {scoreInfo.label}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex-1 text-center sm:text-right">
            <div className={cn(
              "inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4",
              isQualified ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            )}>
              {isQualified ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="font-medium text-sm sm:text-base">
                {isQualified ? 'المنتج مؤهل للتصنيف' : 'المنتج يحتاج تحسينات'}
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {isQualified
                ? 'حقق المنتج الحد الأدنى المطلوب للتأهل. يمكنك الآن متابعة عملية التصنيف.'
                : 'لم يحقق المنتج الحد الأدنى المطلوب. راجع التفاصيل أدناه لمعرفة نقاط التحسين.'}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="card-elevated rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="font-bold text-foreground mb-4 sm:mb-6 text-sm sm:text-base">
          تفاصيل النتائج حسب العناصر الرئيسية
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {Array.from(scoresByElement.entries()).map(([id, element]) => {
            const elementPercentage = element.max > 0 ? (element.score / element.max) * 100 : 0;
            const elementInfo = getScoreLabel(elementPercentage);

            return (
              <div key={id} className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-medium text-foreground text-sm sm:text-base truncate flex-1">
                    {element.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-xs sm:text-sm", elementInfo.color)}>
                      {elementInfo.label}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      {element.score.toFixed(1)}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={elementPercentage} 
                  className="h-1.5 sm:h-2"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onRetake}
          className="gap-2 text-sm sm:text-base"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          إعادة التقييم
        </Button>
        <Button
          onClick={onBack}
          className="gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
}
