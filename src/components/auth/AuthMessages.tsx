import { motion } from "framer-motion";
import { CheckCircle2, MailCheck, Mail, KeyRound, AlertCircle } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { AuthButton } from "./AuthButton";

interface MessageCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: React.ReactNode;
  hint?: string;
  buttonLabel: string;
  onButtonClick: () => void;
  accentColor?: string;
}

function MessageCard({ 
  icon, 
  iconColor, 
  title, 
  description, 
  hint,
  buttonLabel, 
  onButtonClick,
  accentColor = "primary",
}: MessageCardProps) {
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
        </motion.div>

        {/* Card */}
        <motion.div 
          className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-border/30 relative overflow-hidden text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Top Accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${accentColor === "green" ? "green-500" : "primary"} to-transparent`} />

          {/* Icon */}
          <motion.div 
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${iconColor} mb-6`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            {icon}
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{title}</h2>

          {/* Description */}
          <div className="text-muted-foreground mb-6 leading-relaxed">
            {description}
          </div>

          {/* Hint */}
          {hint && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
              <p className="text-amber-600 dark:text-amber-400 text-sm flex items-center justify-center gap-2">
                💡 {hint}
              </p>
            </div>
          )}

          {/* Button */}
          <AuthButton
            isSubmitting={false}
            icon={null}
            label={buttonLabel}
            variant="secondary"
            type="button"
            onClick={onButtonClick}
          />
        </motion.div>
      </div>
    </div>
  );
}

// Email Confirmation Sent
export function EmailConfirmationMessage({ 
  email, 
  onBack 
}: { 
  email: string; 
  onBack: () => void;
}) {
  return (
    <MessageCard
      icon={<MailCheck className="w-12 h-12 text-green-500" />}
      iconColor="bg-green-500/10"
      title="تم إرسال رابط التأكيد"
      description={
        <>
          تم إرسال رسالة تأكيد إلى بريدك الإلكتروني
          <br />
          <span className="text-foreground font-semibold">{email}</span>
          <br />
          يرجى فتح الرابط في الرسالة لتفعيل حسابك
        </>
      }
      hint="تحقق من مجلد البريد المزعج (Spam) إذا لم تجد الرسالة"
      buttonLabel="العودة لتسجيل الدخول"
      onButtonClick={onBack}
      accentColor="green"
    />
  );
}

// Password Reset Sent
export function PasswordResetSentMessage({ 
  email, 
  onBack 
}: { 
  email: string; 
  onBack: () => void;
}) {
  return (
    <MessageCard
      icon={<Mail className="w-12 h-12 text-primary" />}
      iconColor="bg-primary/10"
      title="تم إرسال رابط إعادة التعيين"
      description={
        <>
          تم إرسال رابط إعادة تعيين كلمة المرور إلى
          <br />
          <span className="text-foreground font-semibold">{email}</span>
          <br />
          يرجى فتح الرابط في الرسالة لإعادة تعيين كلمة المرور
        </>
      }
      hint="تحقق من مجلد البريد المزعج (Spam) إذا لم تجد الرسالة"
      buttonLabel="العودة لتسجيل الدخول"
      onButtonClick={onBack}
    />
  );
}

// Password Reset Success
export function PasswordResetSuccessMessage({ 
  onLogin 
}: { 
  onLogin: () => void;
}) {
  return (
    <MessageCard
      icon={<CheckCircle2 className="w-12 h-12 text-green-500" />}
      iconColor="bg-green-500/10"
      title="تم تغيير كلمة المرور بنجاح"
      description="يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة"
      buttonLabel="تسجيل الدخول"
      onButtonClick={onLogin}
      accentColor="green"
    />
  );
}

// Error Alert
export function AuthErrorAlert({ 
  message, 
  showEmailHint 
}: { 
  message: string; 
  showEmailHint?: boolean;
}) {
  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-2xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <p className="text-destructive text-sm font-medium">{message}</p>
      </div>
      {showEmailHint && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <p className="text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 flex-shrink-0" />
            إذا كنت قد سجلت مسبقاً، تحقق من بريدك الإلكتروني وافتح رابط التأكيد
          </p>
        </div>
      )}
    </motion.div>
  );
}
