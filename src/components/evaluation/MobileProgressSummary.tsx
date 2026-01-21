import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MainElementProgress {
  id: string;
  name: string;
  weight: number;
  score: number;
  max: number;
}

interface MobileProgressSummaryProps {
  elements: MainElementProgress[];
  currentIndex: number;
  onElementClick: (index: number) => void;
  overallProgress: number;
  totalScore: number;
}

export function MobileProgressSummary({
  elements,
  currentIndex,
  onElementClick,
  overallProgress,
  totalScore
}: MobileProgressSummaryProps) {
  const [open, setOpen] = useState(false);
  
  const currentElement = elements[currentIndex];
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score > 65) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'جيد';
    if (score > 65) return 'متوسط';
    return 'ضعيف';
  };

  const handleElementClick = (index: number) => {
    onElementClick(index);
    setOpen(false);
  };

  return (
    <div className="card-elevated rounded-xl p-3 sm:p-4">
      {/* Compact Summary */}
      <div className="flex items-center gap-3">
        {/* Mini Score Circle */}
        <div className="relative w-14 h-14 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${totalScore * 2.64} 264`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-foreground">{Math.round(totalScore)}%</span>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">التقدم الكلي</span>
          </div>
          <Progress value={overallProgress} className="h-2 mb-1.5" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground truncate">{currentElement?.name}</span>
            <span className={cn("text-xs font-medium", getScoreColor(totalScore))}>
              {getScoreLabel(totalScore)}
            </span>
          </div>
        </div>

        {/* Expand Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors shrink-0">
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )} />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl" dir="rtl">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-right">العناصر الرئيسية</SheetTitle>
            </SheetHeader>
            
            {/* Score Display */}
            <div className="flex items-center justify-center gap-6 py-4 mb-4 bg-secondary/50 rounded-xl">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{Math.round(totalScore)}%</span>
                  <span className={cn("text-[10px]", getScoreColor(totalScore))}>
                    {getScoreLabel(totalScore)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">التقدم</div>
                <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
              </div>
            </div>

            {/* Elements List */}
            <div className="space-y-2 overflow-y-auto max-h-[calc(70vh-200px)] pb-4">
              {elements.map((element, index) => {
                const isActive = index === currentIndex;
                const isCompleted = element.score > 0;
                const percentage = element.max > 0 ? (element.score / element.max) * 100 : 0;

                return (
                  <motion.button
                    key={element.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleElementClick(index)}
                    className={cn(
                      "w-full text-right p-3 rounded-xl transition-all duration-200",
                      "border-2",
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : isCompleted 
                            ? "bg-green-500/20 text-green-500"
                            : "bg-muted-foreground/10 text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "font-medium text-sm truncate",
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
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              isActive ? "bg-primary" : "bg-green-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}