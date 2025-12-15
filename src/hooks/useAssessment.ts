import { useState, useCallback } from 'react';
import { assessmentQuestions, MAX_SCORE, QUALIFICATION_THRESHOLD } from '@/data/questions';
import { Answer, AssessmentResult, QuestionOption } from '@/types/assessment';
import { RegistrationData } from '@/components/assessment/RegistrationForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logError } from '@/lib/logger';

export function useAssessment() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'registration' | 'questions' | 'result'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const totalQuestions = assessmentQuestions.length;

  const calculateScore = useCallback((option: QuestionOption, weight: number): number => {
    return (option.scorePercentage / 100) * weight;
  }, []);

  const handleStart = useCallback(() => {
    setCurrentStep('registration');
  }, []);

  const handleRegistration = useCallback(async (data: RegistrationData) => {
    if (!user) {
      logError('User not authenticated');
      return;
    }

    try {
      const { data: org, error } = await supabase
        .from('organizations')
        .insert({
          name: data.organizationName,
          contact_person: data.contactPerson,
          phone: data.phone,
          email: data.email,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setOrganizationId(org.id);
      setRegistrationData(data);
      setCurrentStep('questions');
    } catch (error) {
      logError('Error saving organization', error);
    }
  }, [user]);

  const handleBackToWelcome = useCallback(() => {
    setCurrentStep('welcome');
  }, []);

  const handleSelectOption = useCallback((option: QuestionOption) => {
    setSelectedOption(option.id);

    setTimeout(() => {
      const score = calculateScore(option, currentQuestion.weight);
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        selectedOptionId: option.id,
        score,
      };

      const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion.id);
      let updatedAnswers: Answer[];
      
      if (existingAnswerIndex >= 0) {
        updatedAnswers = [...answers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
      } else {
        updatedAnswers = [...answers, newAnswer];
      }
      
      setAnswers(updatedAnswers);
      setSelectedOption(null);

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setCurrentStep('result');
      }
    }, 400);
  }, [answers, calculateScore, currentQuestion, currentQuestionIndex, totalQuestions]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const previousAnswer = answers.find(a => a.questionId === assessmentQuestions[currentQuestionIndex - 1].id);
      setSelectedOption(previousAnswer?.selectedOptionId || null);
    }
  }, [currentQuestionIndex, answers]);

  const getResult = useCallback((): AssessmentResult => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
    return {
      totalScore,
      maxScore: MAX_SCORE,
      isQualified: totalScore >= QUALIFICATION_THRESHOLD,
      answers,
    };
  }, [answers]);

  const saveAssessmentToDatabase = useCallback(async () => {
    if (!organizationId) return;

    try {
      const result = getResult();
      
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          organization_id: organizationId,
          total_score: result.totalScore,
          max_score: result.maxScore,
          is_qualified: result.isQualified,
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Get question options from database to map local IDs
      const { data: dbOptions } = await supabase
        .from('question_options')
        .select('id, question_id, label');

      if (dbOptions) {
        const answersToInsert = result.answers.map(answer => {
          const question = assessmentQuestions.find(q => q.id === answer.questionId);
          const localOption = question?.options.find(o => o.id === answer.selectedOptionId);
          const dbOption = dbOptions.find(
            o => o.question_id === answer.questionId && o.label === localOption?.label
          );

          return {
            assessment_id: assessment.id,
            question_id: answer.questionId,
            selected_option_id: dbOption?.id,
            score: answer.score,
          };
        });

        const { error: answersError } = await supabase
          .from('assessment_answers')
          .insert(answersToInsert);

        if (answersError) throw answersError;
      }
    } catch (error) {
      logError('Error saving assessment', error);
    }
  }, [organizationId, getResult]);

  const resetAssessment = useCallback(() => {
    setCurrentStep('welcome');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setOrganizationId(null);
    setRegistrationData(null);
  }, []);

  const retakeAssessment = useCallback(() => {
    setCurrentStep('questions');
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
    registrationData,
    handleStart,
    handleRegistration,
    handleBackToWelcome,
    handleSelectOption,
    handlePreviousQuestion,
    getResult,
    saveAssessmentToDatabase,
    resetAssessment,
    retakeAssessment,
  };
}
