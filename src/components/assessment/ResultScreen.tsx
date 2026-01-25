import { motion } from "framer-motion";
import { AssessmentResult } from "@/types/assessment";
import { CheckCircle2, AlertCircle, ArrowLeft, RotateCcw, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import profitLogo from "@/assets/profit-logo.png";
import { assessmentQuestions } from "@/data/questions";
import { useNavigate } from "react-router-dom";

interface ResultScreenProps {
  result: AssessmentResult;
  analysisText: string;
  isLoading: boolean;
  onRetake?: () => void;
}

export function ResultScreen({ result, analysisText, isLoading, onRetake }: ResultScreenProps) {
  const { isQualified } = result;
  const navigate = useNavigate();
  const percentage = Math.round((result.totalScore / result.maxScore) * 100);

  return (
    <div className="text-center max-w-2xl mx-auto px-1 pt-16 md:pt-0">
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <img src={profitLogo} alt="Profit+" className="h-16 sm:h-20 md:h-24 mx-auto" />
      </motion.div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card-elevated rounded-2xl p-5 md:p-8 lg:p-10 relative overflow-hidden"
      >
        {/* Decorative border */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1.5",
          isQualified 
            ? "bg-gradient-to-r from-transparent via-success to-transparent" 
            : "bg-gradient-to-r from-transparent via-muted-foreground to-transparent"
        )} />

        {/* Status Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mb-6 md:mb-8"
        >
          <div
            className={cn(
              "w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto flex items-center justify-center",
              "relative",
              isQualified 
                ? "bg-gradient-to-br from-success/20 to-success/5" 
                : "bg-gradient-to-br from-muted to-muted/50"
            )}
          >
            {/* Glow effect */}
            {isQualified && (
              <div className="absolute inset-0 rounded-full bg-success/20 blur-xl animate-pulse-soft" />
            )}
            
            {isQualified ? (
              <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-success relative z-10" />
            ) : (
              <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground relative z-10" />
            )}
          </div>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mt-4 mb-2">
            نتيجة التقييم الأولي
          </h2>
          <p className={cn(
            "text-base md:text-lg font-medium",
            isQualified ? "text-success" : "text-muted-foreground"
          )}>
            {isQualified ? "جاهزية مبدئية متوفرة ✓" : "توجد فجوات في الجاهزية"}
          </p>
        </motion.div>

        {/* Score Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="relative w-32 h-32 md:w-36 md:h-36 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={isQualified ? "hsl(var(--success))" : "hsl(var(--muted-foreground))"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.64} 264`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl md:text-4xl font-bold text-foreground">{percentage}%</span>
              <span className="text-xs text-muted-foreground">من الدرجة الكلية</span>
            </div>
          </div>
        </motion.div>

        {/* Detailed Scores */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-secondary/50 rounded-xl p-4 md:p-6 mb-4 md:mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-base md:text-lg font-semibold text-foreground">تفصيل الدرجات</h3>
          </div>

          <div className="space-y-3 md:space-y-4">
            {result.answers.map((answer, index) => {
              const question = assessmentQuestions.find((q) => q.id === answer.questionId);
              if (!question) return null;
              const maxQuestionScore = question.weight;
              const answerPercentage = (answer.score / maxQuestionScore) * 100;

              return (
                <motion.div 
                  key={answer.questionId} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="text-right"
                >
                  <div className="flex flex-row-reverse justify-between items-center mb-1.5 gap-2">
                    <span className="text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">
                      {Math.round(answer.score)} / {maxQuestionScore}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground truncate max-w-[65%] md:max-w-[70%]">
                      {question.text}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 md:h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${answerPercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.05 }}
                      className={cn(
                        "h-full rounded-full",
                        answerPercentage >= 70 
                          ? "bg-success" 
                          : answerPercentage >= 40 
                            ? "bg-primary" 
                            : "bg-muted-foreground"
                      )}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Total Score */}
          <div className="mt-4 md:mt-5 pt-4 border-t border-border">
            <div className="flex flex-row-reverse justify-between items-center">
              <span className="text-lg md:text-xl font-bold text-primary flex items-center gap-2">
                <Award className="w-5 h-5" />
                {Math.round(result.totalScore)} / {result.maxScore}
              </span>
              <span className="text-sm font-semibold text-foreground">المجموع الكلي</span>
            </div>
          </div>
        </motion.div>

        {/* Analysis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-secondary/50 rounded-xl p-4 md:p-6 mb-6 md:mb-8"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">جارٍ تحليل النتائج...</span>
            </div>
          ) : (
            <p className="text-foreground text-base md:text-lg leading-relaxed">{analysisText}</p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {onRetake && (
            <button
              onClick={onRetake}
              className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-secondary text-foreground font-semibold rounded-xl 
                       transition-all duration-300 hover:bg-secondary/80 hover-lift
                       focus:outline-none focus:ring-2 focus:ring-secondary/50
                       flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              <span>اعادة التقييم الأولي</span>
            </button>
          )}
          <button
            onClick={() => navigate('/free-evaluation')}
            className="flex-1 btn-primary-enhanced px-6 md:px-8 py-3 md:py-4 bg-primary text-primary-foreground 
                     font-semibold rounded-xl transition-all duration-300 hover:opacity-90
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 
                     focus:ring-offset-background flex items-center justify-center gap-2 md:gap-3 
                     text-sm md:text-base group"
          >
            <span>التقييم المجاني</span>
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-translate-x-1" />
          </button>
        </motion.div>

        {!isQualified && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-muted-foreground text-sm mt-4"
          >
            يمكنك الاستمرار في التقييم الشامل للحصول على تحليل أعمق
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
