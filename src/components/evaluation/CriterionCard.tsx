import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

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

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-green-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-500";
};

const getScoreBgColor = (score: number, isSelected: boolean) => {
  if (isSelected) {
    if (score >= 70) return "bg-green-500 text-white";
    if (score >= 40) return "bg-yellow-500 text-black";
    return "bg-red-500 text-white";
  }
  if (score >= 70) return "bg-green-500/20 text-green-500";
  if (score >= 40) return "bg-yellow-500/20 text-yellow-500";
  return "bg-red-500/20 text-red-500";
};

export function CriterionCard({ id, name, weight, options, selectedOptionId, onSelect }: CriterionCardProps) {
  const isAnswered = !!selectedOptionId;

  return (
    <div
      className={cn("card-elevated rounded-xl p-5 transition-all duration-300", isAnswered && "ring-2 ring-primary/30")}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isAnswered && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
            <h4 className="font-semibold text-foreground">{name}</h4>
          </div>
          <span className="text-xs text-muted-foreground">الوزن: {weight}%</span>
        </div>
      </div>

      <RadioGroup
        value={selectedOptionId}
        onValueChange={(value) => {
          const option = options.find((o) => o.id === value);
          if (option) {
            onSelect(value, option.score_percentage);
          }
        }}
        className="space-y-2"
      >
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const scoreColor = getScoreColor(option.score_percentage);
          const scoreBgColor = getScoreBgColor(option.score_percentage, isSelected);

          return (
            <div
              key={option.id}
              className={cn(
                "flex flex-row-reverse items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                "border-2 text-right",
                isSelected 
                  ? option.score_percentage >= 70 
                    ? "border-green-500 bg-green-500/10" 
                    : option.score_percentage >= 40 
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-red-500 bg-red-500/10"
                  : "border-muted hover:border-muted-foreground/50 hover:bg-muted/50",
              )}
              onClick={() => onSelect(option.id, option.score_percentage)}
            >
              <RadioGroupItem value={option.id} id={`${id}-${option.id}`} />
              <Label
                htmlFor={`${id}-${option.id}`}
                className={cn(
                  "flex-1 cursor-pointer text-sm text-right",
                  isSelected ? `${scoreColor} font-medium` : "text-foreground",
                )}
              >
                {option.label}
              </Label>
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  scoreBgColor,
                )}
              >
                {option.score_percentage}%
              </span>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
