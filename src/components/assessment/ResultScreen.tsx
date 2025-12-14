import { AssessmentResult } from '@/types/assessment';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import profitLogo from '@/assets/profit-logo.png';

interface ResultScreenProps {
  result: AssessmentResult;
  analysisText: string;
  isLoading: boolean;
}

export function ResultScreen({ result, analysisText, isLoading }: ResultScreenProps) {
  const { isQualified } = result;

  return (
    <div className="animate-scale-in text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <img 
          src={profitLogo} 
          alt="Profit+" 
          className="h-14 md:h-16 mx-auto"
        />
      </div>

      <div className="card-elevated rounded-2xl p-8 md:p-12">
        <div className="mb-8">
          <div
            className={cn(
              "w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center",
              isQualified ? "bg-success/20" : "bg-muted"
            )}
          >
            {isQualified ? (
              <CheckCircle2 className="w-10 h-10 text-success" />
            ) : (
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            نتيجة التقييم الأولي
          </h2>
          <p className="text-muted-foreground">
            {isQualified ? 'جاهزية مبدئية متوفرة' : 'فجوات في الجاهزية'}
          </p>
        </div>

        <div className="bg-secondary/50 rounded-xl p-6 mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">جارٍ تحليل النتائج...</span>
            </div>
          ) : (
            <p className="text-foreground text-lg leading-relaxed">
              {analysisText}
            </p>
          )}
        </div>

        <button
          className="w-full px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg 
                     transition-all duration-300 hover:opacity-90 hover:scale-[1.01] 
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                     glow-accent flex items-center justify-center gap-3"
        >
          <span>الانتقال إلى التقييم الشامل</span>
          <ArrowLeft className="w-5 h-5" />
        </button>

        {!isQualified && (
          <p className="text-muted-foreground text-sm mt-4">
            يمكنك الاستمرار في التقييم الشامل للحصول على تحليل أعمق
          </p>
        )}
      </div>
    </div>
  );
}
