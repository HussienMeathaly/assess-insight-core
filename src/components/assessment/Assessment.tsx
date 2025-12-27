import { useEffect, useState } from "react";
import { useAssessment } from "@/hooks/useAssessment";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logError, logInfo } from "@/lib/logger";
import { WelcomeScreen } from "./WelcomeScreen";
import { ProgressIndicator } from "./ProgressIndicator";
import { QuestionCard } from "./QuestionCard";
import { ResultScreen } from "./ResultScreen";
import { EditOrganizationModal } from "./EditOrganizationModal";

export function Assessment() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState<string | null>(null);

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
    const fetchOrganizationName = async () => {
      if (!user) {
        logInfo("No user found for organization fetch");
        return;
      }

      logInfo("Fetching organization for user", { userId: user.id });

      const { data, error } = await supabase
        .from("organizations")
        .select("name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logError("Error fetching organization", error);
        return;
      }

      logInfo("Organization data fetched", { hasOrg: !!data });

      if (data) {
        setOrganizationName(data.name);
      }
    };

    fetchOrganizationName();
  }, [user]);

  useEffect(() => {
    if (currentStep === "result") {
      const result = getResult();
      analyzeResult(result);
      saveAssessmentToDatabase();
    }
  }, [currentStep, getResult, analyzeResult, saveAssessmentToDatabase]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      {/* Header section */}
      <div className="flex items-center justify-start mb-4">
        <EditOrganizationModal />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          {currentStep === "welcome" && <WelcomeScreen onStart={handleStart} />}

          {currentStep === "questions" && (
            <div className="card-elevated rounded-2xl p-5 md:p-8 lg:p-12">
              <ProgressIndicator current={currentQuestionIndex + 1} total={totalQuestions} />
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                selectedOptionId={selectedOption}
                onSelect={handleSelectOption}
                onPrevious={currentQuestionIndex > 0 ? handlePreviousQuestion : undefined}
              />
            </div>
          )}

          {currentStep === "result" && (
            <ResultScreen
              result={getResult()}
              analysisText={analysisText}
              isLoading={isLoading}
              onRetake={retakeAssessment}
            />
          )}
        </div>
      </div>
    </div>
  );
}
