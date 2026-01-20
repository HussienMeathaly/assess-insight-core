import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowLeft,
  Loader2,
  Building2,
  User,
  Phone,
  Shield,
} from "lucide-react";
import { logError } from "@/lib/logger";
import {
  AuthCard,
  AuthHeader,
  AuthInput,
  AuthButton,
  AuthErrorAlert,
  PasswordStrength,
  EmailConfirmationMessage,
  PasswordResetSentMessage,
  PasswordResetSuccessMessage,
} from "@/components/auth";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

// Validation schemas
const validOrgAndNameRegex = /^[\u0600-\u06FFa-zA-Z0-9\s_]+$/;
const phoneDigitsMin10Regex = /^\d{10,}$/;

const loginSchema = z.object({
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

const signupSchema = z.object({
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  organizationName: z
    .string()
    .trim()
    .min(2, "اسم الجهة مطلوب")
    .regex(validOrgAndNameRegex, "اسم الجهة يجب أن يحتوي على حروف عربية أو إنجليزية أو أرقام أو _ فقط"),
  contactPerson: z
    .string()
    .trim()
    .min(2, "اسم مدخل البيانات مطلوب")
    .regex(validOrgAndNameRegex, "اسم مدخل البيانات يجب أن يحتوي على حروف عربية أو إنجليزية أو أرقام أو _ فقط"),
  phone: z.string().trim().regex(phoneDigitsMin10Regex, "رقم التواصل يجب أن لا يقل عن 10 أرقام"),
});

type SignupField = "organizationName" | "contactPerson" | "phone";
const signupFieldSchema = {
  organizationName: signupSchema.shape.organizationName,
  contactPerson: signupSchema.shape.contactPerson,
  phone: signupSchema.shape.phone,
} as const;

type FormErrors = {
  email?: string;
  password?: string;
  organizationName?: string;
  contactPerson?: string;
  phone?: string;
  general?: string;
  emailConfirmationHint?: boolean;
};

const SESSION_STORAGE_KEY = "auth_form_data";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, loading } = useAuth();

  // Initialize state from sessionStorage
  const [isLogin, setIsLogin] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.isLogin ?? true;
    }
    return true;
  });

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResetSent, setShowResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        email: parsed.email || "",
        password: "",
        organizationName: parsed.organizationName || "",
        contactPerson: parsed.contactPerson || "",
        phone: parsed.phone || "",
      };
    }
    return {
      email: "",
      password: "",
      organizationName: "",
      contactPerson: "",
      phone: "",
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // 3D card effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Listen for PASSWORD_RECOVERY event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResettingPassword(true);
        setIsForgotPassword(false);
        setIsLogin(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Save form data to sessionStorage
  useEffect(() => {
    const dataToSave = {
      email: formData.email,
      organizationName: formData.organizationName,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      isLogin,
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData.email, formData.organizationName, formData.contactPerson, formData.phone, isLogin]);

  const clearSessionStorage = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Redirect on auth
  useEffect(() => {
    if (isAuthenticated && !loading && !isResettingPassword) {
      clearSessionStorage();
      navigate("/assessment");
    }
  }, [isAuthenticated, loading, navigate, isResettingPassword]);

  // Debounced validation
  const debounceTimers = useRef<Record<string, number>>({});
  
  const validateSignupField = useCallback((field: SignupField, value: string) => {
    const result = signupFieldSchema[field].safeParse(value);
    return result.success ? undefined : result.error.errors[0]?.message;
  }, []);

  const debouncedValidateSignupField = useCallback(
    (field: SignupField, value: string) => {
      const key = `signup_${field}`;
      if (debounceTimers.current[key]) {
        window.clearTimeout(debounceTimers.current[key]);
      }
      debounceTimers.current[key] = window.setTimeout(() => {
        const error = validateSignupField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }, 400);
    },
    [validateSignupField],
  );

  const handleChange = (field: keyof typeof formData, value: string) => {
    const nextValue = field === "phone" ? value.replace(/\D/g, "") : value;
    setFormData((prev) => ({ ...prev, [field]: nextValue }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    
    if (!isLogin && (field === "organizationName" || field === "contactPerson" || field === "phone")) {
      debouncedValidateSignupField(field as SignupField, nextValue);
    }
  };

  const saveOrganization = async (userId: string) => {
    try {
      const { error } = await supabase.from("organizations").insert({
        name: formData.organizationName,
        contact_person: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        user_id: userId,
      });
      if (error) throw error;
    } catch (error) {
      logError("Error saving organization", error);
      throw error;
    }
  };

  const handleAuthError = (error: { message: string }) => {
    let errorMessage = "حدث خطأ غير متوقع";
    let isEmailConfirmationHint = false;
    const msg = error.message.toLowerCase();

    if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
      if (isLogin) {
        errorMessage = "بيانات تسجيل الدخول غير صحيحة، أو لم يتم تأكيد البريد الإلكتروني بعد";
        isEmailConfirmationHint = true;
      } else {
        errorMessage = "بيانات تسجيل الدخول غير صحيحة";
      }
    } else if (msg.includes("user already registered") || msg.includes("already registered")) {
      errorMessage = "البريد الإلكتروني مسجل مسبقاً";
    } else if (msg.includes("email not confirmed")) {
      errorMessage = "يرجى تأكيد البريد الإلكتروني أولاً";
      isEmailConfirmationHint = true;
    } else if (msg.includes("password should be at least") || msg.includes("password")) {
      errorMessage = "كلمة المرور ضعيفة جداً";
    } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
      errorMessage = "محاولات كثيرة، يرجى الانتظار قليلاً";
    } else if (msg.includes("network") || msg.includes("fetch")) {
      errorMessage = "خطأ في الاتصال بالخادم";
    } else if (msg.includes("session") || msg.includes("refresh")) {
      errorMessage = "انتهت الجلسة، يرجى المحاولة مرة أخرى";
    }

    setErrors({
      general: errorMessage,
      emailConfirmationHint: isEmailConfirmationHint,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const schema = isLogin ? loginSchema : signupSchema;
    const dataToValidate = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof Omit<FormErrors, 'emailConfirmationHint'>;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) handleAuthError(error);
      } else {
        const { data, error } = await signUp(formData.email, formData.password);
        if (error) {
          handleAuthError(error);
        } else if (data?.user) {
          await saveOrganization(data.user.id);
          clearSessionStorage();
          setShowConfirmation(true);
        }
      }
    } catch {
      setErrors({ general: "حدث خطأ في الاتصال" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      organizationName: "",
      contactPerson: "",
      phone: "",
    });
    setShowConfirmation(false);
    setShowResetSent(false);
    clearSessionStorage();
  };

  const resetToLogin = () => {
    setShowConfirmation(false);
    setShowResetSent(false);
    setIsForgotPassword(false);
    setIsResettingPassword(false);
    setResetSuccess(false);
    setIsLogin(true);
    setFormData({
      email: "",
      password: "",
      organizationName: "",
      contactPerson: "",
      phone: "",
    });
    clearSessionStorage();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          </div>
          <p className="text-muted-foreground font-medium">جاري التحميل...</p>
        </motion.div>
      </div>
    );
  }

  // Password reset success
  if (resetSuccess) {
    return <PasswordResetSuccessMessage onLogin={resetToLogin} />;
  }

  // Password reset form
  if (isResettingPassword) {
    return <ResetPasswordForm onSuccess={() => setResetSuccess(true)} />;
  }

  // Email confirmation message
  if (showConfirmation) {
    return <EmailConfirmationMessage email={formData.email} onBack={toggleMode} />;
  }

  // Password reset sent message
  if (showResetSent) {
    return <PasswordResetSentMessage email={resetEmail} onBack={resetToLogin} />;
  }

  // Forgot password form
  if (isForgotPassword) {
    return (
      <ForgotPasswordForm
        onBack={() => setIsForgotPassword(false)}
        onSuccess={(email) => {
          setResetEmail(email);
          setShowResetSent(true);
        }}
      />
    );
  }

  // Main login/signup form
  return (
    <AuthCard
      mouseX={mouseX}
      mouseY={mouseY}
      rotateX={rotateX}
      rotateY={rotateY}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <AuthHeader isLogin={isLogin} />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Organization Fields - Only for Signup */}
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              key="signup-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Organization Name */}
              <AuthInput
                label="اسم الجهة"
                icon={<Building2 className="w-5 h-5" />}
                type="text"
                value={formData.organizationName}
                onChange={(e) => handleChange("organizationName", e.target.value)}
                isFocused={focusedField === "organizationName"}
                onFocusChange={(focused) => setFocusedField(focused ? "organizationName" : null)}
                isValid={formData.organizationName.length > 0 && !errors.organizationName}
                error={errors.organizationName}
                placeholder="أدخل اسم الجهة"
              />

              {/* Contact Person */}
              <AuthInput
                label="اسم مدخل البيانات"
                icon={<User className="w-5 h-5" />}
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleChange("contactPerson", e.target.value)}
                isFocused={focusedField === "contactPerson"}
                onFocusChange={(focused) => setFocusedField(focused ? "contactPerson" : null)}
                isValid={formData.contactPerson.length > 0 && !errors.contactPerson}
                error={errors.contactPerson}
                placeholder="أدخل اسم مدخل البيانات"
              />

              {/* Phone */}
              <AuthInput
                label="رقم التواصل"
                icon={<Phone className="w-5 h-5" />}
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                isFocused={focusedField === "phone"}
                onFocusChange={(focused) => setFocusedField(focused ? "phone" : null)}
                isValid={formData.phone.length >= 10 && !errors.phone}
                error={errors.phone}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <AuthInput
          label="البريد الإلكتروني"
          icon={<Mail className="w-5 h-5" />}
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          isFocused={focusedField === "email"}
          onFocusChange={(focused) => setFocusedField(focused ? "email" : null)}
          isValid={formData.email.length > 0 && !errors.email && formData.email.includes("@")}
          error={errors.email}
          placeholder="example@domain.com"
          dir="ltr"
          hint={!isLogin ? (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              سيتم إرسال رابط تأكيد إلى هذا البريد
            </span>
          ) : undefined}
        />

        {/* Password Field */}
        <div className="space-y-2">
          <AuthInput
            label="كلمة المرور"
            icon={<Lock className="w-5 h-5" />}
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            isFocused={focusedField === "password"}
            onFocusChange={(focused) => setFocusedField(focused ? "password" : null)}
            error={errors.password}
            placeholder="••••••••"
            dir="ltr"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />
          
          {/* Password Strength - Only for Signup */}
          {!isLogin && <PasswordStrength password={formData.password} />}
        </div>

        {/* Forgot Password Link - Only for Login */}
        {isLogin && (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
            >
              نسيت كلمة المرور؟
            </button>
          </motion.div>
        )}

        {/* Privacy Notice - Only for Signup */}
        <AnimatePresence>
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                جميع البيانات المدخلة تُستخدم لأغراض التقييم فقط ولا يتم مشاركتها مع أي طرف ثالث.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AuthErrorAlert 
                message={errors.general} 
                showEmailHint={errors.emailConfirmationHint} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <AuthButton
          isSubmitting={isSubmitting}
          icon={isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          label={isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          loadingLabel="جاري المعالجة..."
        />
      </form>

      {/* Toggle Mode */}
      <motion.div 
        className="mt-8 pt-6 border-t border-border/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={toggleMode}
          className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors group py-2"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">
            {isLogin ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب؟ سجل الدخول"}
          </span>
        </motion.button>
      </motion.div>
    </AuthCard>
  );
}
