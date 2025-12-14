export interface Question {
  id: number;
  text: string;
  weight: number;
  type: 'binary' | 'multiple';
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  label: string;
  scorePercentage: number; // Percentage of weight to apply
}

export interface Answer {
  questionId: number;
  selectedOptionId: string;
  score: number;
}

export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  isQualified: boolean;
  answers: Answer[];
}
