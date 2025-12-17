import { AssessmentResult } from "@/types/assessment";
import { CheckCircle2, AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import profitLogo from "@/assets/profit-logo.png";
import { assessmentQuestions } from "@/data/questions";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ResultScreenProps {
  result: AssessmentResult;
  analysisText: string;
  isLoading: boolean;
  onRetake?: () => void;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ResultScreen({ result, analysisText, isLoading, onRetake }: ResultScreenProps) {
  const { isQualified } = result;

  const pieData = result.answers.map((answer, index) => {
    const question = assessmentQuestions.find((q) => q.id === answer.questionId);
    return {
      name: `س${index + 1}`,
      fullName: question?.text || "",
      value: answer.score,
      maxValue: question?.weight || 0,
    };
  });

  return (
    <div className="animate-scale-in text-center max-w-2xl mx-auto px-1">
      <div className="mb-6 md:mb-8">
        <img src={profitLogo} alt="Profit+" className="h-12 md:h-14 lg:h-16 mx-auto" />
      </div>

      <div className="card-elevated rounded-2xl p-5 md:p-8 lg:p-12">
        <div className="mb-6 md:mb-8">
          <div
            className={cn(
              "w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center",
              isQualified ? "bg-success/20" : "bg-muted",
            )}
          >
            {isQualified ? (
              <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-success" />
            ) : (
              <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
            )}
          </div>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-2">نتيجة التقييم الأولي</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {isQualified ? "جاهزية مبدئية متوفرة" : "فجوات في الجاهزية"}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="bg-secondary/50 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 text-center">تفصيل الدرجات</h3>

          {/* Pie Chart */}
          <div className="h-40 md:h-48 mb-4 md:mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _, props) => [
                    `${value.toFixed(1)} / ${props.payload.maxValue}`,
                    props.payload.fullName,
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    direction: "rtl",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 md:space-y-3">
            {result.answers.map((answer) => {
              const question = assessmentQuestions.find((q) => q.id === answer.questionId);
              if (!question) return null;
              const maxQuestionScore = question.weight;
              const percentage = (answer.score / maxQuestionScore) * 100;

              return (
                <div key={answer.questionId} className="text-right">
                  <div className="flex flex-row-reverse justify-between items-center mb-1 gap-2">
                    <span className="text-xs md:text-sm font-medium text-foreground whitespace-nowrap">
                      {answer.score.toFixed(1)} / {maxQuestionScore}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground truncate max-w-[65%] md:max-w-[70%]">
                      {question.text}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 md:h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        percentage >= 70 ? "bg-success" : percentage >= 40 ? "bg-primary" : "bg-muted-foreground",
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Score */}
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
            <div className="flex flex-row-reverse justify-between items-center">
              <span className="text-base md:text-lg font-bold text-primary">
                {result.totalScore.toFixed(1)} / {result.maxScore}
              </span>
              <span className="text-xs md:text-sm font-semibold text-foreground">المجموع الكلي</span>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-secondary/50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground text-sm md:text-base">جارٍ تحليل النتائج...</span>
            </div>
          ) : (
            <p className="text-foreground text-base md:text-lg leading-relaxed">{analysisText}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onRetake && (
            <button
              onClick={onRetake}
              className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-secondary text-foreground font-semibold rounded-lg 
                         transition-all duration-300 hover:bg-secondary/80
                         focus:outline-none focus:ring-2 focus:ring-secondary/50
                         flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              <span>اعادة التقييم الأولي</span>
            </button>
          )}
          <button
            className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-primary text-primary-foreground font-semibold rounded-lg 
                       transition-all duration-300 hover:opacity-90 hover:scale-[1.01] 
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                       glow-accent flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base"
          >
            <span>التقييم المجاني </span>
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {!isQualified && (
          <p className="text-muted-foreground text-sm mt-4">يمكنك الاستمرار في التقييم الشامل للحصول على تحليل أعمق</p>
        )}
      </div>
    </div>
  );
}
