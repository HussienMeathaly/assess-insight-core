import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle2, X } from 'lucide-react';

interface CriterionOption {
  id: string;
  label: string;
  score_percentage: number;
}

interface CriterionCardProps {
  id: string;
  name: string;
  weight: number;
  options: CriterionOption[];
  selectedOptionId?: string;
  onSelect: (optionId: string, scorePercentage: number) => void;
  onClear?: (criterionId: string) => void;
}

export function CriterionCard({
  id,
  name,
  weight,
  options,
  selectedOptionId,
  onSelect,
  onClear
}: CriterionCardProps) {
  const isAnswered = !!selectedOptionId;

  return (
    <div className={cn(
      "card-elevated rounded-xl p-3 sm:p-5 transition-all duration-300",
      isAnswered && "ring-2 ring-primary/30"
    )}>
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            {isAnswered && (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            )}
            <h4 className="font-semibold text-foreground text-sm sm:text-base leading-tight">{name}</h4>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            الوزن: {weight}%
          </span>
        </div>
        {isAnswered && onClear && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear(id);
            }}
            className="p-1 sm:p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
            title="مسح الاختيار"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      <RadioGroup
        value={selectedOptionId}
        onValueChange={(value) => {
          const option = options.find(o => o.id === value);
          if (option) {
            onSelect(value, option.score_percentage);
          }
        }}
        className="space-y-1.5 sm:space-y-2"
      >
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const rawScore = ((option.score_percentage / 100) * weight).toFixed(1).replace(/\.0$/, '');
          
          // Color based on percentage: green (>=70%), yellow (40-69%), red (<40%)
          const getScoreColor = (percentage: number) => {
            if (percentage >= 70) return { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500/30' };
            if (percentage >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500/30' };
            return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/30' };
          };
          
          const scoreColor = getScoreColor(option.score_percentage);
          
          return (
            <div
              key={option.id}
              className={cn(
                "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all duration-200",
                "border-2 flex-row-reverse",
                isSelected
                  ? `border-primary bg-primary/10`
                  : `border-muted hover:${scoreColor.border} hover:bg-muted/50`
              )}
              onClick={() => onSelect(option.id, option.score_percentage)}
            >
              <RadioGroupItem value={option.id} id={`${id}-${option.id}`} className="shrink-0" />
              <Label
                htmlFor={`${id}-${option.id}`}
                className={cn(
                  "flex-1 cursor-pointer text-xs sm:text-sm text-right leading-relaxed",
                  isSelected ? "text-primary font-medium" : "text-foreground"
                )}
              >
                {option.label}
              </Label>
              <span className={cn(
                "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[1.5rem] sm:min-w-[2rem] text-center font-medium shrink-0",
                isSelected
                  ? `${scoreColor.bg} text-white`
                  : `${scoreColor.bg}/20 ${scoreColor.text}`
              )}>
                {rawScore}
              </span>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
