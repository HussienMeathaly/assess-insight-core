import { Button } from "@/components/ui/button";
import { HelpCircle, FileQuestion, Award, Info } from "lucide-react";

interface QuickQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const quickQuestions = [
  {
    icon: HelpCircle,
    text: "كيف أبدأ التقييم؟",
  },
  {
    icon: FileQuestion,
    text: "ما هي معايير التأهل؟",
  },
  {
    icon: Award,
    text: "كيف أحسن درجتي؟",
  },
  {
    icon: Info,
    text: "ما الفرق بين التقييم الأولي والمتقدم؟",
  },
];

export function QuickQuestions({ onSelect, disabled }: QuickQuestionsProps) {
  return (
    <div className="space-y-2 p-2">
      <p className="text-xs text-muted-foreground text-center mb-3">أسئلة سريعة</p>
      <div className="grid grid-cols-1 gap-2">
        {quickQuestions.map((q, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            className="justify-end gap-2 text-right h-auto py-2 px-3 text-xs"
            onClick={() => onSelect(q.text)}
            disabled={disabled}
          >
            <span className="flex-1 text-right">{q.text}</span>
            <q.icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          </Button>
        ))}
      </div>
    </div>
  );
}
