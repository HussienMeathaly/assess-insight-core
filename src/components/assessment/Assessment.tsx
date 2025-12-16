import { useEffect } from 'react';
import { useAssessment } from '@/hooks/useAssessment';
import { useAnalysis } from '@/hooks/useAnalysis';
import { WelcomeScreen } from './WelcomeScreen';
import { ProgressIndicator } from './ProgressIndicator';
import { QuestionCard } from './QuestionCard';
import { ResultScreen } from './ResultScreen';

export function Assessment() {
  const {
    currentStep,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedOption,
    handleStart,
    handleSelectOption,
    handlePreviousQuestion,
    getResult,
    saveAssessmentToDatabase,
    retakeAssessment,
  } = useAssessment();

  const { analysisText, isLoading, analyzeResult } = useAnalysis();

  useEffect(() => {
    if (currentStep === 'result') {
      const result = getResult();
      analyzeResult(result);
      saveAssessmentToDatabase();
    }
  }, [currentStep, getResult, analyzeResult, saveAssessmentToDatabase]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {currentStep === 'welcome' && (
          <WelcomeScreen onStart={handleStart} />
        )}

        {currentStep === 'questions' && (
          <div className="card-elevated rounded-2xl p-8 md:p-12">
            <ProgressIndicator
              current={currentQuestionIndex + 1}
              total={totalQuestions}
            />
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              selectedOptionId={selectedOption}
              onSelect={handleSelectOption}
              onPrevious={currentQuestionIndex > 0 ? handlePreviousQuestion : undefined}
            />
          </div>
        )}

        {currentStep === 'result' && (
          <ResultScreen
            result={getResult()}
            analysisText={analysisText}
            isLoading={isLoading}
            onRetake={retakeAssessment}
          />
        )}
      </div>
    </div>
  );
}
