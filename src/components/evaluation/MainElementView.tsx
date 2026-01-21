import { Button } from '@/components/ui/button';
import { SubElementSection } from './SubElementSection';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CriterionOption {
  id: string;
  label: string;
  score_percentage: number;
  display_order: number;
}

interface Criterion {
  id: string;
  name: string;
  weight_percentage: number;
  display_order: number;
  options: CriterionOption[];
}

interface SubElement {
  id: string;
  name: string;
  display_order: number;
  criteria: Criterion[];
}

interface MainElement {
  id: string;
  name: string;
  weight_percentage: number;
  sub_elements: SubElement[];
}

interface MainElementViewProps {
  element: MainElement;
  answers: Map<string, { selectedOptionId: string }>;
  onAnswerCriterion: (criterionId: string, optionId: string, scorePercentage: number) => void;
  onClearCriterion?: (criterionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  onComplete: () => void;
}

export function MainElementView({
  element,
  answers,
  onAnswerCriterion,
  onClearCriterion,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  onComplete
}: MainElementViewProps) {
  const sortedSubElements = [...element.sub_elements].sort((a, b) => a.display_order - b.display_order);

  // Calculate answered criteria count for this element
  const totalCriteria = element.sub_elements.reduce((acc, se) => acc + se.criteria.length, 0);
  const answeredCriteria = element.sub_elements.reduce((acc, se) => {
    return acc + se.criteria.filter(c => answers.has(c.id)).length;
  }, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="card-elevated rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-foreground mb-1 leading-tight">
              {element.name}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              الوزن: {element.weight_percentage}% من إجمالي التقييم
            </p>
          </div>
          <div className="text-left bg-primary/10 px-3 py-2 rounded-lg shrink-0">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {answeredCriteria}/{totalCriteria}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">معيار مكتمل</div>
          </div>
        </div>
      </div>

      {/* Sub Elements */}
      {sortedSubElements.map((subElement) => (
        <SubElementSection
          key={subElement.id}
          name={subElement.name}
          criteria={subElement.criteria}
          answers={answers}
          onAnswerCriterion={onAnswerCriterion}
          onClearCriterion={onClearCriterion}
        />
      ))}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="gap-1.5 sm:gap-2 text-sm sm:text-base px-3 sm:px-4"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">السابق</span>
        </Button>

        {isLast ? (
          <Button
            onClick={onComplete}
            className="gap-1.5 sm:gap-2 bg-primary hover:bg-primary/90 text-sm sm:text-base px-4 sm:px-6"
          >
            عرض النتائج
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="gap-1.5 sm:gap-2 text-sm sm:text-base px-3 sm:px-4"
          >
            <span className="hidden xs:inline">التالي</span>
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
