import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { cn } from "@/lib/utils";
import { z } from "zod";

const validCategoryRegex = /^[\u0600-\u06FFa-zA-Z0-9\s_\-/&,]+$/;

const categorySchema = z
  .string()
  .trim()
  .min(2, "يرجى إدخال فئة نشاط لا تقل عن حرفين")
  .max(100, "فئة النشاط يجب أن تكون أقل من 100 حرف")
  .regex(validCategoryRegex, "يرجى استخدام حروف وأرقام فقط");

const SUGGESTIONS = [
  "شوكولاتة",
  "ملابس",
  "إكسسوارات",
  "مستحضرات تجميل",
  "أغذية ومشروبات",
  "إلكترونيات",
  "عطور",
  "ألعاب أطفال",
];

interface ActivityCategoryStepProps {
  initialValue?: string;
  onSubmit: (category: string) => Promise<void> | void;
  onBack: () => void;
  submitting?: boolean;
}

export function ActivityCategoryStep({
  initialValue = "",
  onSubmit,
  onBack,
  submitting = false,
}: ActivityCategoryStepProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = categorySchema.safeParse(value);
    if (!result.success) {
      setError(result.error.errors[0]?.message);
      return;
    }
    setError(undefined);
    await onSubmit(result.data);
  };

  return (
    <div className="min-h-[calc(100svh-2rem)] flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl text-center"
      >
        {/* Logo */}
        <div className="mb-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/15 blur-3xl rounded-full scale-150" />
            <img
              src={profitLogo}
              alt="Profit+"
              className="h-16 sm:h-20 md:h-24 mx-auto mb-3 relative z-10"
            />
          </div>
          <p className="text-muted-foreground text-sm md:text-base">منصة التقييم المؤسسي</p>
        </div>

        <div className="card-elevated rounded-2xl p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Briefcase className="w-7 h-7 text-primary" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            ما هي فئة نشاط منشأتك؟
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mb-6 leading-relaxed">
            ساعدنا في فهم مجال نشاطك لتقديم تقييم أكثر دقة. مثال: شوكولاتة، ملابس، إكسسوارات...
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                فئة / مجال النشاط
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(undefined);
                }}
                placeholder="اكتب فئة النشاط..."
                maxLength={100}
                autoFocus
                className={cn(
                  "w-full px-4 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                  "focus:outline-none focus:bg-secondary transition-all duration-300",
                  "placeholder:text-muted-foreground/60",
                  error
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                )}
                dir="rtl"
              />
              {error && (
                <p className="text-destructive text-sm mt-2 text-right">{error}</p>
              )}
            </div>

            {/* Suggestions */}
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-2">اقتراحات سريعة:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setValue(s);
                      setError(undefined);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs border transition-all",
                      value === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/50 text-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                disabled={submitting}
                className={cn(
                  "flex-1 px-5 py-3.5 font-semibold rounded-xl transition-all duration-300",
                  "bg-secondary text-foreground hover:bg-secondary/80",
                  "focus:outline-none focus:ring-2 focus:ring-secondary/50",
                  "flex items-center justify-center gap-2 disabled:opacity-50"
                )}
              >
                <ArrowRight className="w-5 h-5" />
                <span>رجوع</span>
              </button>
              <button
                type="submit"
                disabled={submitting || value.trim().length < 2}
                className={cn(
                  "flex-[2] px-5 py-3.5 font-bold rounded-xl transition-all duration-300",
                  "bg-primary text-primary-foreground hover:opacity-90",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span>{submitting ? "جاري المتابعة..." : "متابعة إلى التقييم"}</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
