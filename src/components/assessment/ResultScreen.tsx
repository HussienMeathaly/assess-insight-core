import { AssessmentResult } from '@/types/assessment';
import { CheckCircle2, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import profitLogo from '@/assets/profit-logo.png';
import { assessmentQuestions } from '@/data/questions';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResultScreenProps {
  result: AssessmentResult;
  analysisText: string;
  isLoading: boolean;
  onRetake?: () => void;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function ResultScreen({ result, analysisText, isLoading, onRetake }: ResultScreenProps) {
  const { isQualified } = result;

  const pieData = result.answers.map((answer, index) => {
    const question = assessmentQuestions.find(q => q.id === answer.questionId);
    return {
      name: `س${index + 1}`,
      fullName: question?.text || '',
      value: answer.score,
      maxValue: question?.weight || 0,
    };
  });

  return (
    <div className="animate-scale-in text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <img 
          src={profitLogo} 
          alt="Profit+" 
          className="h-14 md:h-16 mx-auto"
        />
      </div>

      <div className="card-elevated rounded-2xl p-8 md:p-12">
        <div className="mb-8">
          <div
            className={cn(
              "w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center",
              isQualified ? "bg-success/20" : "bg-muted"
            )}
          >
            {isQualified ? (
              <CheckCircle2 className="w-10 h-10 text-success" />
            ) : (
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            نتيجة التقييم الأولي
          </h2>
          <p className="text-muted-foreground">
            {isQualified ? 'جاهزية مبدئية متوفرة' : 'فجوات في الجاهزية'}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="bg-secondary/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-right">تفصيل الدرجات</h3>
          
          {/* Pie Chart */}
          <div className="h-48 mb-6">
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
                  formatter={(value: number, _, props) => [`${value.toFixed(1)} / ${props.payload.maxValue}`, props.payload.fullName]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    direction: 'rtl'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {result.answers.map((answer) => {
              const question = assessmentQuestions.find(q => q.id === answer.questionId);
              if (!question) return null;
              const maxQuestionScore = question.weight;
              const percentage = (answer.score / maxQuestionScore) * 100;
              
              return (
                <div key={answer.questionId} className="text-right">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {answer.score.toFixed(1)} / {maxQuestionScore}
                    </span>
                    <span className="text-sm text-muted-foreground truncate max-w-[70%]">
                      {question.text}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        percentage >= 70 ? "bg-success" : percentage >= 40 ? "bg-primary" : "bg-muted-foreground"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total Score */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-primary">
                {result.totalScore.toFixed(1)} / {result.maxScore}
              </span>
              <span className="text-sm font-semibold text-foreground">المجموع الكلي</span>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-secondary/50 rounded-xl p-6 mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">جارٍ تحليل النتائج...</span>
            </div>
          ) : (
            <p className="text-foreground text-lg leading-relaxed">
              {analysisText}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {onRetake && (
            <button
              onClick={onRetake}
              className="flex-1 px-6 py-4 bg-secondary text-foreground font-semibold rounded-lg 
                         transition-all duration-300 hover:bg-secondary/80
                         focus:outline-none focus:ring-2 focus:ring-secondary/50
                         flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>إعادة التقييم</span>
            </button>
          )}
          <button
            className="flex-1 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg 
                       transition-all duration-300 hover:opacity-90 hover:scale-[1.01] 
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                       glow-accent flex items-center justify-center gap-3"
          >
            <span>الانتقال إلى التقييم المجاني</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {!isQualified && (
          <p className="text-muted-foreground text-sm mt-4">
            يمكنك الاستمرار في التقييم الشامل للحصول على تحليل أعمق
          </p>
        )}
      </div>
    </div>
  );
}
