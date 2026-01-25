import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, KeyRound, Shield, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import profitLogo from "@/assets/profit-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { AuthErrorAlert } from "./AuthMessages";
import { PasswordStrength } from "./PasswordStrength";
import { cn } from "@/lib/utils";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });
      if (error) {
        setErrors({ general: "حدث خطأ أثناء تحديث كلمة المرور" });
      } else {
        onSuccess();
      }
    } catch {
      setErrors({ general: "حدث خطأ في الاتصال" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordsMatch = formData.newPassword && formData.confirmPassword && 
    formData.newPassword === formData.confirmPassword;

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
            <img src={profitLogo} alt="Profit+" className="h-16 sm:h-20 md:h-24 mx-auto mb-4 relative z-10" />
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
              <KeyRound className="w-9 h-9 text-primary" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">إعادة تعيين كلمة المرور</h2>
            <p className="text-muted-foreground">أدخل كلمة المرور الجديدة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <AuthInput
                label="كلمة المرور الجديدة"
                icon={<Lock className="w-5 h-5" />}
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, newPassword: e.target.value }));
                  if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
                }}
                isFocused={focusedField === "newPassword"}
                onFocusChange={(focused) => setFocusedField(focused ? "newPassword" : null)}
                error={errors.newPassword}
                placeholder="أدخل كلمة المرور الجديدة"
                dir="ltr"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              <PasswordStrength password={formData.newPassword} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <AuthInput
                label="تأكيد كلمة المرور"
                icon={<Shield className="w-5 h-5" />}
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }}
                isFocused={focusedField === "confirmPassword"}
                onFocusChange={(focused) => setFocusedField(focused ? "confirmPassword" : null)}
                error={errors.confirmPassword}
                placeholder="أعد إدخال كلمة المرور"
                dir="ltr"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              
              {/* Match Indicator */}
              {passwordsMatch && (
                <motion.p 
                  className="text-green-500 text-sm flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-lg"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  كلمتا المرور متطابقتان
                </motion.p>
              )}
            </div>

            {/* Error */}
            {errors.general && (
              <AuthErrorAlert message={errors.general} />
            )}

            {/* Submit Button */}
            <AuthButton
              isSubmitting={isSubmitting}
              icon={<KeyRound className="w-5 h-5" />}
              label="تحديث كلمة المرور"
              loadingLabel="جاري التحديث..."
            />
          </form>
        </motion.div>
      </div>
    </div>
  );
}
