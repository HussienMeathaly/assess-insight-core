import { CriterionCard } from './CriterionCard';

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

interface SubElementSectionProps {
  name: string;
  criteria: Criterion[];
  answers: Map<string, { selectedOptionId: string }>;
  onAnswerCriterion: (criterionId: string, optionId: string, scorePercentage: number) => void;
  onClearCriterion?: (criterionId: string) => void;
}

export function SubElementSection({
  name,
  criteria,
  answers,
  onAnswerCriterion,
  onClearCriterion
}: SubElementSectionProps) {
  const sortedCriteria = [...criteria].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
        {name}
      </h3>
      <div className="space-y-4">
        {sortedCriteria.map((criterion) => {
          const answer = answers.get(criterion.id);
          return (
            <CriterionCard
              key={criterion.id}
              id={criterion.id}
              name={criterion.name}
              weight={criterion.weight_percentage}
              options={criterion.options.sort((a, b) => a.display_order - b.display_order)}
              selectedOptionId={answer?.selectedOptionId}
              onSelect={(optionId, scorePercentage) => 
                onAnswerCriterion(criterion.id, optionId, scorePercentage)
              }
              onClear={onClearCriterion}
            />
          );
        })}
      </div>
    </div>
  );
}
