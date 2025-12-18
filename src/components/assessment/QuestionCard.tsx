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
          const isSelected = selectedOptionId === option.id;
          const isYes = option.value === true || option.value === "yes" || option.label === "نعم";

          const isNo = option.value === false || option.value === "no" || option.label === "لا";

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option)}
              className={cn(
                "group p-3 md:p-5 rounded-lg border-2 transition-all duration-300",
                isSelected
                  ? isYes
                    ? "border-green-500 bg-green-500/10"
                    : isNo
                      ? "border-red-500 bg-red-500/10"
                      : "border-primary bg-primary/10"
                  : "border-border bg-card",
              )}
            >
              <div className="flex items-center gap-3">
                {/* الدائرة */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected
                      ? isYes
                        ? "border-green-500"
                        : isNo
                          ? "border-red-500"
                          : "border-primary"
                      : "border-muted-foreground",
                  )}
                >
                  {isSelected && (
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isYes ? "bg-green-500" : isNo ? "bg-red-500" : "bg-primary-foreground",
                      )}
                    />
                  )}
                </div>

                {/* النص */}
                <span
                  className={cn(
                    "text-sm md:text-lg font-medium",
                    isSelected
                      ? isYes
                        ? "text-green-500"
                        : isNo
                          ? "text-red-500"
                          : "text-primary"
                      : "text-foreground",
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
