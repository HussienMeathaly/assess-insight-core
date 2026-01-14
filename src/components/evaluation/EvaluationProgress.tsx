import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
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
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score > 65) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'جيد';
    if (score > 65) return 'متوسط';
    return 'ضعيف';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="card-elevated rounded-2xl p-5 md:p-6 sticky top-4"
    >
      {/* Overall Score */}
      <div className="text-center mb-6">
        <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-3">
          {/* Background glow */}
          <div className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-30",
            totalScore >= 80 ? "bg-success" : totalScore > 65 ? "bg-yellow-500" : "bg-muted"
          )} />
          
          <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${totalScore * 2.64} 264`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl md:text-3xl font-bold text-foreground">{Math.round(totalScore)}%</span>
            <span className={cn("text-xs font-medium", getScoreColor(totalScore))}>
              {getScoreLabel(totalScore)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 p-3 bg-secondary/50 rounded-xl">
        <div className="flex justify-between items-center text-sm mb-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>التقدم</span>
          </div>
          <span className="font-semibold text-primary">{overallProgress}%</span>
        </div>
        <div className="progress-enhanced h-2.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>

      {/* Elements Navigation */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          العناصر الرئيسية
        </h3>
        
        {elements.map((element, index) => {
          const isActive = index === currentIndex;
          const isCompleted = element.score > 0;
          const percentage = element.max > 0 ? (element.score / element.max) * 100 : 0;

          return (
            <motion.button
              key={element.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onElementClick(index)}
              className={cn(
                "w-full text-right p-3 md:p-4 rounded-xl transition-all duration-300",
                "border-2 group",
                isActive
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-transparent bg-secondary/50 hover:bg-secondary/80 hover:border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0",
                  "transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : isCompleted 
                      ? "bg-success/20 text-success"
                      : "bg-muted-foreground/10 text-muted-foreground group-hover:bg-muted-foreground/20"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "font-medium text-sm truncate transition-colors",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {element.name}
                    </span>
                    {isCompleted && (
                      <span className="text-xs font-medium text-muted-foreground mr-2">
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={cn(
                        "h-full rounded-full transition-colors",
                        isActive ? "bg-primary" : "bg-success"
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
