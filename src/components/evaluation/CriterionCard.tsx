import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

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
}

export function CriterionCard({
  id,
  name,
  weight,
  options,
  selectedOptionId,
  onSelect
}: CriterionCardProps) {
  const isAnswered = !!selectedOptionId;

  return (
    <div className={cn(
      "card-elevated rounded-xl p-5 transition-all duration-300",
      isAnswered && "ring-2 ring-primary/30"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isAnswered && (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            )}
            <h4 className="font-semibold text-foreground">{name}</h4>
          </div>
          <span className="text-xs text-muted-foreground">
            الوزن: {weight}%
          </span>
        </div>
      </div>

      <RadioGroup
        value={selectedOptionId}
        onValueChange={(value) => {
          const option = options.find(o => o.id === value);
          if (option) {
            onSelect(value, option.score_percentage);
          }
        }}
        className="space-y-2"
      >
        {[...options].sort((a, b) => b.score_percentage - a.score_percentage).map((option) => {
          const isSelected = selectedOptionId === option.id;
          const rawScore = Math.round((option.score_percentage / 100) * weight);
          
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
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                "border-2 flex-row-reverse",
                isSelected
                  ? `border-primary bg-primary/10`
                  : `border-muted hover:${scoreColor.border} hover:bg-muted/50`
              )}
              onClick={() => onSelect(option.id, option.score_percentage)}
            >
              <RadioGroupItem value={option.id} id={`${id}-${option.id}`} />
              <Label
                htmlFor={`${id}-${option.id}`}
                className={cn(
                  "flex-1 cursor-pointer text-sm text-right",
                  isSelected ? "text-primary font-medium" : "text-foreground"
                )}
              >
                {option.label}
              </Label>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full min-w-[2rem] text-center font-medium",
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
