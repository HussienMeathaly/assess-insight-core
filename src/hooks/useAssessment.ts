import { useState, useCallback } from 'react';
import { assessmentQuestions, MAX_SCORE, QUALIFICATION_THRESHOLD } from '@/data/questions';
import { Answer, AssessmentResult, QuestionOption } from '@/types/assessment';

export function useAssessment() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'questions' | 'result'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const totalQuestions = assessmentQuestions.length;

  const calculateScore = useCallback((option: QuestionOption, weight: number): number => {
    return (option.scorePercentage / 100) * weight;
  }, []);

  const handleStart = useCallback(() => {
    setCurrentStep('questions');
  }, []);

  const handleSelectOption = useCallback((option: QuestionOption) => {
    setSelectedOption(option.id);

    // Auto-advance after selection with a small delay
    setTimeout(() => {
      const score = calculateScore(option, currentQuestion.weight);
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        selectedOptionId: option.id,
        score,
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);
      setSelectedOption(null);

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setCurrentStep('result');
      }
    }, 400);
  }, [answers, calculateScore, currentQuestion, currentQuestionIndex, totalQuestions]);

  const getResult = useCallback((): AssessmentResult => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
    return {
      totalScore,
      maxScore: MAX_SCORE,
      isQualified: totalScore >= QUALIFICATION_THRESHOLD,
      answers,
    };
  }, [answers]);

  const resetAssessment = useCallback(() => {
    setCurrentStep('welcome');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
  }, []);

  return {
    currentStep,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedOption,
    handleStart,
    handleSelectOption,
    getResult,
    resetAssessment,
  };
}
