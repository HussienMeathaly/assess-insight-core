import { Question, QuestionOption } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  selectedOptionId: string | null;
  onSelect: (option: QuestionOption) => void;
}

export function QuestionCard({ question, selectedOptionId, onSelect }: QuestionCardProps) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-10 leading-relaxed text-center">
        {question.text}
      </h2>

      <div className={cn(
        "grid gap-4",
        question.options.length <= 2 ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-1 max-w-lg mx-auto"
      )}>
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            className={cn(
              "group relative p-5 rounded-lg border-2 transition-all duration-300",
              "hover:border-primary/50 hover:bg-secondary/50",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background",
              selectedOptionId === option.id
                ? "border-primary bg-primary/10 glow-accent"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all duration-300 flex-shrink-0",
                  selectedOptionId === option.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground group-hover:border-primary/50"
                )}
              >
                {selectedOptionId === option.id && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
              <span
                className={cn(
                  "text-lg font-medium transition-colors",
                  selectedOptionId === option.id ? "text-primary" : "text-foreground"
                )}
              >
                {option.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
