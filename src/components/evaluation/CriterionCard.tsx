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

          return (
            <div
              key={option.id}
              className={cn(
                "flex flex-row-reverse items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                "border-2 text-right",
                isSelected ? "border-primary bg-primary/10" : "border-muted hover:border-primary/50 hover:bg-muted/50",
              )}
              onClick={() => onSelect(option.id, option.score_percentage)}
            >
              <RadioGroupItem value={option.id} id={`${id}-${option.id}`} />
              <Label
                htmlFor={`${id}-${option.id}`}
                className={cn(
                  "flex-1 cursor-pointer text-sm text-right",
                  isSelected ? "text-primary font-medium" : "text-foreground",
                )}
              >
                {option.label}
              </Label>
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
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
