import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainElementProgress {
  id: string;
  name: string;
  weight: number;
  score: number;
  max: number;
}

interface EvaluationProgressProps {
  elements: MainElementProgress[];
  currentIndex: number;
  onElementClick: (index: number) => void;
  overallProgress: number;
  totalScore: number;
}

export function EvaluationProgress({
  elements,
  currentIndex,
  onElementClick,
  overallProgress,
  totalScore
}: EvaluationProgressProps) {
  return (
    <div className="card-elevated rounded-2xl p-6 sticky top-4">
      {/* Overall Score */}
      <div className="text-center mb-6">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${totalScore * 2.83} 283`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{Math.round(totalScore)}%</span>
            <span className="text-xs text-muted-foreground">النتيجة</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">التقدم</span>
          <span className="font-medium text-foreground">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Elements Navigation */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground mb-4">العناصر الرئيسية</h3>
        {elements.map((element, index) => {
          const isActive = index === currentIndex;
          const isCompleted = element.score > 0;
          const percentage = element.max > 0 ? (element.score / element.max) * 100 : 0;

          return (
            <button
              key={element.id}
              onClick={() => onElementClick(index)}
              className={cn(
                "w-full text-right p-3 rounded-xl transition-all duration-200",
                "border-2",
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-muted/50 hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "font-medium text-sm truncate",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {element.name}
                    </span>
                    <span className="text-xs text-muted-foreground mr-2">
                      {element.weight}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
