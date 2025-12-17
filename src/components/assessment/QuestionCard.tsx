import { Question, QuestionOption } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  selectedOptionId: string | null;
  onSelect: (option: QuestionOption) => void;
  onPrevious?: () => void;
}

export function QuestionCard({ question, selectedOptionId, onSelect, onPrevious }: QuestionCardProps) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-6 md:mb-10 leading-relaxed text-center">
        {question.text}
      </h2>

      <div
        className={cn(
          "grid gap-3 md:gap-4",
          question.options.length <= 2 ? "grid-cols-2 max-w-sm md:max-w-md mx-auto" : "grid-cols-1 max-w-lg mx-auto",
        )}
      >
        {question.options.map((option) => {
          const isYes = option.label === "نعم" || option.label.includes("نعم");
          const isNo = option.label === "لا" || option.label.includes("لا");

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option)}
              className={cn(
                "group relative p-3 md:p-5 rounded-lg border-2 transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
                selectedOptionId === option.id
                  ? option.value === "yes"
                    ? "border-green-500 bg-green-500/10 glow-accent"
                    : option.value === "no"
                      ? "border-red-500 bg-red-500/10 glow-accent"
                      : "border-primary bg-primary/10 glow-accent"
                  : "border-border bg-card",
                selectedOptionId !== option.id &&
                  (option.value === "yes"
                    ? "hover:border-green-500/50 hover:bg-green-500/10 focus:ring-green-500/30"
                    : option.value === "no"
                      ? "hover:border-red-500/50 hover:bg-red-500/10 focus:ring-red-500/30"
                      : "hover:border-primary/50 hover:bg-secondary/50 focus:ring-primary/30"),
              )}
            >
              <div className="flex items-center gap-2 md:gap-4">
                {/* الدائرة الداخلية */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all duration-300 flex-shrink-0",
                    selectedOptionId === option.id
                      ? option.value === "yes"
                        ? "border-green-500 bg-green-500/10"
                        : option.value === "no"
                          ? "border-red-500 bg-red-500/10"
                          : "border-primary bg-primary"
                      : "border-muted-foreground",
                    selectedOptionId !== option.id &&
                      (option.value === "yes"
                        ? "group-hover:border-green-500"
                        : option.value === "no"
                          ? "group-hover:border-red-500"
                          : "group-hover:border-primary/50"),
                  )}
                >
                  {selectedOptionId === option.id && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          option.value === "yes"
                            ? "bg-green-500"
                            : option.value === "no"
                              ? "bg-red-500"
                              : "bg-primary-foreground",
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* النص */}
                <span
                  className={cn(
                    "text-sm md:text-lg font-medium transition-colors",
                    selectedOptionId === option.id
                      ? option.value === "yes"
                        ? "text-green-500"
                        : option.value === "no"
                          ? "text-red-500"
                          : "text-primary"
                      : "text-foreground",
                    selectedOptionId !== option.id &&
                      (option.value === "yes"
                        ? "group-hover:text-green-500"
                        : option.value === "no"
                          ? "group-hover:text-red-500"
                          : "group-hover:text-primary/50"),
                  )}
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {onPrevious && (
        <div className="mt-6 md:mt-8 flex justify-center">
          <button
            onClick={onPrevious}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-muted-foreground hover:text-foreground 
                       transition-colors duration-200 rounded-lg hover:bg-secondary/50 text-sm md:text-base"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            <span>السؤال السابق</span>
          </button>
        </div>
      )}
    </div>
  );
}
