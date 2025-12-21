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
      <div className="card-elevated rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {element.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              الوزن: {element.weight_percentage}% من إجمالي التقييم
            </p>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-primary">
              {answeredCriteria}/{totalCriteria}
            </div>
            <div className="text-xs text-muted-foreground">معيار مكتمل</div>
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
        />
      ))}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="gap-2"
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </Button>

        {isLast ? (
          <Button
            onClick={onComplete}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            عرض النتائج
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="gap-2"
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
