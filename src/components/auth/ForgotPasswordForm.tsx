import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { z } from "zod";
import profitLogo from "@/assets/profit-logo.png";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { AuthErrorAlert } from "./AuthMessages";
import { useAuth } from "@/hooks/useAuth";

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

export function ForgotPasswordForm({ onBack, onSuccess }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = z.string().email("البريد الإلكتروني غير صحيح").safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError("حدث خطأ أثناء إرسال رابط إعادة التعيين");
      } else {
        onSuccess(email);
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
            <img src={profitLogo} alt="Profit+" className="h-20 md:h-24 mx-auto mb-4 relative z-10" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">منصة التقييم المؤسسي</p>
        </motion.div>

        {/* Card */}
        <motion.div 
          className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-border/30 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 mb-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <Lock className="w-9 h-9 text-primary" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">نسيت كلمة المرور؟</h2>
            <p className="text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AuthInput
              label="البريد الإلكتروني"
              icon={<Mail className="w-5 h-5" />}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              isFocused={focusedField === "email"}
              onFocusChange={(focused) => setFocusedField(focused ? "email" : null)}
              isValid={email.length > 0 && !error}
              error={error}
              placeholder="example@domain.com"
              dir="ltr"
            />

            <AuthButton
              isSubmitting={isSubmitting}
              icon={<Mail className="w-5 h-5" />}
              label="إرسال رابط إعادة التعيين"
              loadingLabel="جاري الإرسال..."
            />

            {/* Back Button */}
            <motion.button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-3"
              whileHover={{ x: 5 }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لتسجيل الدخول</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
