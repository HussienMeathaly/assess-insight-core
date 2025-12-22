import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import profitLogo from "@/assets/profit-logo.png";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MailCheck,
  Building2,
  User,
  Phone,
  Shield,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logError } from "@/lib/logger";

// اسم الجهة + اسم مدخل البيانات: عربي/إنجليزي/أرقام/مسافات/_ فقط
const validOrgAndNameRegex = /^[\u0600-\u06FFa-zA-Z0-9\s_]+$/;
// رقم التواصل: أرقام فقط وبحد أدنى 10
const phoneDigitsMin10Regex = /^\d{10,}$/;
type SignupField = "organizationName" | "contactPerson" | "phone";
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
const signupFieldSchema = {
  organizationName: signupSchema.shape.organizationName,
  contactPerson: signupSchema.shape.contactPerson,
  phone: signupSchema.shape.phone,
} as const;
const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });
type FormErrors = {
  email?: string;
  password?: string;
  organizationName?: string;
  contactPerson?: string;
  phone?: string;
  general?: string;
  emailConfirmationHint?: boolean;
  newPassword?: string;
  confirmPassword?: string;
};
const SESSION_STORAGE_KEY = "auth_form_data";
export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, isAuthenticated, loading, user } = useAuth();

  // Initialize state from sessionStorage
  const [isLogin, setIsLogin] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.isLogin ?? true;
    }
    return true;
  });
  const [isForgotPassword, setIsForgotPassword] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.isForgotPassword ?? false;
    }
    return false;
  });
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResetSent, setShowResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // For 3D card effect - MUST be at top level, not after conditional returns
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResettingPassword(true);
        setIsForgotPassword(false);
        setIsLogin(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Save form data to sessionStorage when it changes
  useEffect(() => {
    const dataToSave = {
      email: formData.email,
      organizationName: formData.organizationName,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      isLogin,
      isForgotPassword,
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData.email, formData.organizationName, formData.contactPerson, formData.phone, isLogin, isForgotPassword]);

  // Clear sessionStorage on successful auth
  const clearSessionStorage = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };
  useEffect(() => {
    if (isAuthenticated && !loading && !isResettingPassword) {
      clearSessionStorage();
      navigate("/assessment");
    }
  }, [isAuthenticated, loading, navigate, isResettingPassword]);
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
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      }, 400);
    },
    [validateSignupField],
  );
  const handleChange = (field: keyof typeof formData, value: string) => {
    const nextValue = field === "phone" ? value.replace(/\D/g, "") : value;
    setFormData((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    if (!isLogin && (field === "organizationName" || field === "contactPerson" || field === "phone")) {
      debouncedValidateSignupField(field as SignupField, nextValue);
    }
  };
  const getPasswordStrength = (password: string) => {
    if (!password)
      return {
        strength: 0,
        label: "",
        color: "",
      };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    if (strength <= 2)
      return {
        strength,
        label: "ضعيفة",
        color: "bg-red-500",
      };
    if (strength <= 3)
      return {
        strength,
        label: "متوسطة",
        color: "bg-yellow-500",
      };
    return {
      strength,
      label: "قوية",
      color: "bg-green-500",
    };
  };
  const passwordStrength = getPasswordStrength(formData.password);
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const schema = isLogin ? loginSchema : signupSchema;
    const dataToValidate = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : formData;
    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Partial<
        Record<"email" | "password" | "organizationName" | "contactPerson" | "phone" | "general", string>
      > = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          handleAuthError(error);
        }
      } else {
        const { data, error } = await signUp(formData.email, formData.password);
        if (error) {
          handleAuthError(error);
        } else if (data?.user) {
          // Save organization data after successful signup
          await saveOrganization(data.user.id);
          clearSessionStorage();
          setShowConfirmation(true);
        }
      }
    } catch {
      setErrors({
        general: "حدث خطأ في الاتصال",
      });
    } finally {
      setIsSubmitting(false);
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
    // Clear sessionStorage when switching modes
    clearSessionStorage();
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const emailResult = z.string().email("البريد الإلكتروني غير صحيح").safeParse(formData.email);
    if (!emailResult.success) {
      setErrors({
        email: emailResult.error.errors[0].message,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(formData.email);
      if (error) {
        setErrors({
          general: "حدث خطأ أثناء إرسال رابط إعادة التعيين",
        });
      } else {
        setShowResetSent(true);
      }
    } catch {
      setErrors({
        general: "حدث خطأ في الاتصال",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = resetPasswordSchema.safeParse(resetPasswordData);
    if (!result.success) {
      const fieldErrors: Partial<Pick<FormErrors, "newPassword" | "confirmPassword" | "general">> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as "newPassword" | "confirmPassword";
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: resetPasswordData.newPassword,
      });
      if (error) {
        setErrors({
          general: "حدث خطأ أثناء تحديث كلمة المرور",
        });
      } else {
        setResetSuccess(true);
      }
    } catch {
      setErrors({
        general: "حدث خطأ في الاتصال",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const getNewPasswordStrength = (password: string) => {
    if (!password)
      return {
        strength: 0,
        label: "",
        color: "",
      };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    if (strength <= 2)
      return {
        strength,
        label: "ضعيفة",
        color: "bg-red-500",
      };
    if (strength <= 3)
      return {
        strength,
        label: "متوسطة",
        color: "bg-yellow-500",
      };
    return {
      strength,
      label: "قوية",
      color: "bg-green-500",
    };
  };
  const newPasswordStrength = getNewPasswordStrength(resetPasswordData.newPassword);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show password reset success
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
              <img src={profitLogo} alt="Profit+" className="h-20 md:h-24 mx-auto mb-4 relative z-10" />
            </div>
          </div>

          <div className="card-elevated rounded-3xl p-8 md:p-10 animate-slide-up relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-4">تم تغيير كلمة المرور بنجاح</h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة
            </p>

            <button
              onClick={() => {
                setResetSuccess(false);
                setIsResettingPassword(false);
                setResetPasswordData({
                  newPassword: "",
                  confirmPassword: "",
                });
                navigate("/auth");
              }}
              className="w-full py-4 font-bold rounded-xl bg-secondary text-secondary-foreground hover:opacity-90 transition-all duration-300"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form
  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
              <img src={profitLogo} alt="Profit+" className="h-20 md:h-24 mx-auto mb-4 relative z-10" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">منصة التقييم المؤسسي</p>
          </div>

          <div className="card-elevated rounded-3xl p-8 md:p-10 animate-slide-up relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-primary/10">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">إعادة تعيين كلمة المرور</h2>
              <p className="text-muted-foreground mt-2 text-sm">أدخل كلمة المرور الجديدة</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">كلمة المرور الجديدة</label>
                <div className="relative">
                  <div
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                      focusedField === "newPassword" ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={resetPasswordData.newPassword}
                    onChange={(e) =>
                      setResetPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    onFocus={() => setFocusedField("newPassword")}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      "w-full pr-12 pl-12 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                      "focus:outline-none focus:bg-secondary transition-all duration-300",
                      errors.newPassword
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary",
                    )}
                    placeholder="أدخل كلمة المرور الجديدة"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.newPassword}
                  </p>
                )}
                {resetPasswordData.newPassword && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            level <= newPasswordStrength.strength ? newPasswordStrength.color : "bg-secondary",
                          )}
                        />
                      ))}
                    </div>
                    <p
                      className={cn(
                        "text-xs",
                        newPasswordStrength.strength <= 2
                          ? "text-red-500"
                          : newPasswordStrength.strength <= 3
                            ? "text-yellow-500"
                            : "text-green-500",
                      )}
                    >
                      قوة كلمة المرور: {newPasswordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">تأكيد كلمة المرور</label>
                <div className="relative">
                  <div
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                      focusedField === "confirmPassword" ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) =>
                      setResetPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      "w-full pr-12 pl-12 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                      "focus:outline-none focus:bg-secondary transition-all duration-300",
                      errors.confirmPassword
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary",
                    )}
                    placeholder="أعد إدخال كلمة المرور"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
                {resetPasswordData.confirmPassword &&
                  resetPasswordData.newPassword === resetPasswordData.confirmPassword && (
                    <p className="text-green-500 text-sm flex items-center gap-1 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      كلمتا المرور متطابقتان
                    </p>
                  )}
              </div>

              {/* Error Message */}
              {errors.general && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3 animate-scale-in">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-destructive text-sm">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full py-4 font-bold rounded-xl transition-all duration-300",
                  "focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-background",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "bg-secondary text-secondary-foreground hover:opacity-90 hover:scale-[1.02] glow-accent",
                  "flex items-center justify-center gap-3",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    <span>تحديث كلمة المرور</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show email confirmation message
  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
              <img src={profitLogo} alt="Profit+" className="h-20 md:h-24 mx-auto mb-4 relative z-10" />
            </div>
          </div>

          {/* Confirmation Card */}
          <div className="card-elevated rounded-3xl p-8 md:p-10 animate-slide-up relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
              <MailCheck className="w-10 h-10 text-green-500" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-4">تم إرسال رابط التأكيد</h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              تم إرسال رسالة تأكيد إلى بريدك الإلكتروني
              <br />
              <span className="text-foreground font-medium">{formData.email}</span>
              <br />
              يرجى فتح الرابط في الرسالة لتفعيل حسابك
            </p>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6">
              <p className="text-amber-600 text-sm">💡 تحقق من مجلد البريد المزعج (Spam) إذا لم تجد الرسالة</p>
            </div>

            <button
              onClick={toggleMode}
              className="w-full py-4 font-bold rounded-xl bg-secondary text-secondary-foreground hover:opacity-90 transition-all duration-300"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset sent message
  if (showResetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
              <img src={profitLogo} alt="Profit+" className="h-20 md:h-24 mx-auto mb-4 relative z-10" />
            </div>
          </div>

          {/* Reset Sent Card */}
          <div className="card-elevated rounded-3xl p-8 md:p-10 animate-slide-up relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Mail className="w-10 h-10 text-primary" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-4">تم إرسال رابط إعادة التعيين</h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى
              <br />
              <span className="text-foreground font-medium">{formData.email}</span>
              <br />
              يرجى فتح الرابط في الرسالة لإعادة تعيين كلمة المرور
            </p>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6">
              <p className="text-amber-600 text-sm">💡 تحقق من مجلد البريد المزعج (Spam) إذا لم تجد الرسالة</p>
            </div>

            <button
              onClick={() => {
                setShowResetSent(false);
                setIsForgotPassword(false);
                setFormData({
                  email: "",
                  password: "",
                  organizationName: "",
                  contactPerson: "",
                  phone: "",
                });
                clearSessionStorage();
              }}
              className="w-full py-4 font-bold rounded-xl bg-secondary text-secondary-foreground hover:opacity-90 transition-all duration-300"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show forgot password form
  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
              <img src={profitLogo} alt="Profit+" className="h-20 md:h-24 mx-auto mb-4 relative z-10" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">منصة التقييم المؤسسي</p>
          </div>

          {/* Forgot Password Card */}
          <div className="card-elevated rounded-3xl p-8 md:p-10 animate-slide-up relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-primary/10">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground md:text-2xl">نسيت كلمة المرور؟</h2>
              <p className="text-muted-foreground mt-2 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">البريد الإلكتروني</label>
                <div className="relative">
                  <div
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                      focusedField === "email" ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      "w-full pr-12 pl-12 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                      "focus:outline-none focus:bg-secondary transition-all duration-300",
                      errors.email
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary",
                    )}
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                  {formData.email && !errors.email && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {errors.general && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3 animate-scale-in">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-destructive text-sm">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full py-4 font-bold rounded-xl transition-all duration-300",
                  "focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-background",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "bg-secondary text-secondary-foreground hover:opacity-90 hover:scale-[1.02] glow-accent",
                  "flex items-center justify-center gap-3",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>إرسال رابط إعادة التعيين</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrors({});
                  setFormData({
                    email: "",
                    password: "",
                    organizationName: "",
                    contactPerson: "",
                    phone: "",
                  });
                  clearSessionStorage();
                }}
                className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>العودة لتسجيل الدخول</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Animated glow spots */}
      <motion.div
        className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 -left-20 w-80 h-80 bg-accent/15 rounded-full blur-[80px] pointer-events-none"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md relative z-10" style={{ perspective: "1000px" }}>
        {/* Logo Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative inline-block">
            <motion.div 
              className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"
              animate={{
                scale: [1.5, 1.8, 1.5],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <img src={profitLogo} alt="Profit+" className="h-20 md:h-24 mx-auto mb-4 relative z-10" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">منصة التقييم المؤسسي</p>
        </motion.div>

        {/* Form Card with 3D effect */}
        <motion.div
          className="relative"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Card glow border effect */}
          <div className="absolute -inset-[1px] rounded-3xl overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "linear-gradient(0deg, transparent, hsl(var(--primary)/0.3), transparent)",
                  "linear-gradient(90deg, transparent, hsl(var(--primary)/0.3), transparent)",
                  "linear-gradient(180deg, transparent, hsl(var(--primary)/0.3), transparent)",
                  "linear-gradient(270deg, transparent, hsl(var(--primary)/0.3), transparent)",
                  "linear-gradient(360deg, transparent, hsl(var(--primary)/0.3), transparent)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          <div className="card-elevated rounded-3xl p-8 md:p-10 relative overflow-hidden backdrop-blur-sm">
            {/* Traveling light beam effect */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <motion.div
                className={cn(
                  "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-all duration-500 relative",
                  isLogin ? "bg-primary/10" : "bg-accent/10",
                )}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {/* Inner glow effect */}
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-2xl blur-md",
                    isLogin ? "bg-primary/20" : "bg-accent/20"
                  )}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {isLogin ? <LogIn className="w-8 h-8 text-primary relative z-10" /> : <UserPlus className="w-8 h-8 text-accent relative z-10" />}
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground md:text-2xl">
                {isLogin ? "مرحباً بك" : "إنشاء حساب جديد"}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {isLogin ? "سجل دخولك للمتابعة" : "أدخل بياناتك للبدء في التقييم"}
              </p>
            </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Organization Fields - Only for Signup */}
            {!isLogin && (
              <>
                {/* Organization Name */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-foreground">اسم الجهة</label>
                  <div className="relative">
                    <motion.div
                      className={cn(
                        "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                        focusedField === "organizationName" ? "text-primary" : "text-muted-foreground",
                      )}
                      animate={focusedField === "organizationName" ? { scale: 1.1 } : { scale: 1 }}
                    >
                      <Building2 className="w-5 h-5" />
                    </motion.div>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => handleChange("organizationName", e.target.value)}
                      onFocus={() => setFocusedField("organizationName")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "w-full pr-12 pl-4 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                        "focus:outline-none focus:bg-secondary transition-all duration-300",
                        errors.organizationName
                          ? "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary",
                      )}
                      placeholder="أدخل اسم الجهة"
                    />
                    {formData.organizationName && !errors.organizationName && (
                      <motion.div 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                    )}
                    {/* Focus glow effect */}
                    <AnimatePresence>
                      {focusedField === "organizationName" && (
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-primary/50 pointer-events-none"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          style={{ boxShadow: "0 0 20px hsl(var(--primary)/0.3)" }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.organizationName && (
                    <motion.p 
                      className="text-destructive text-sm flex items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.organizationName}
                    </motion.p>
                  )}
                </motion.div>

                {/* Contact Person */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">اسم مدخل البيانات</label>
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                        focusedField === "contactPerson" ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange("contactPerson", e.target.value)}
                      onFocus={() => setFocusedField("contactPerson")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "w-full pr-12 pl-4 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                        "focus:outline-none focus:bg-secondary transition-all duration-300",
                        errors.contactPerson
                          ? "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary",
                      )}
                      placeholder="أدخل اسم مدخل البيانات"
                    />
                    {formData.contactPerson && !errors.contactPerson && (
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {errors.contactPerson && (
                    <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="w-4 h-4" />
                      {errors.contactPerson}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">رقم التواصل</label>
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                        focusedField === "phone" ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      minLength={10}
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "w-full pr-12 pl-12 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                        "focus:outline-none focus:bg-secondary transition-all duration-300",
                        errors.phone
                          ? "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary",
                      )}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                    {formData.phone && !errors.phone && (
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">البريد الإلكتروني</label>
              <div className="relative">
                <div
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                    focusedField === "email" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "w-full pr-12 pl-12 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                    "focus:outline-none focus:bg-secondary transition-all duration-300",
                    errors.email ? "border-destructive focus:border-destructive" : "border-border focus:border-primary",
                  )}
                  placeholder="example@domain.com"
                  dir="ltr"
                />
                {formData.email && !errors.email && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}

              {/* Email verification notice for signup */}
              {!isLogin && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  سيتم إرسال رابط تأكيد إلى هذا البريد
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">كلمة المرور</label>
              <div className="relative">
                <div
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                    focusedField === "password" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "w-full pr-12 pl-12 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                    "focus:outline-none focus:bg-secondary transition-all duration-300",
                    errors.password
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary",
                  )}
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator (only for signup) */}
              {!isLogin && formData.password && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-all duration-300",
                          i <= passwordStrength.strength ? passwordStrength.color : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p
                    className={cn(
                      "text-xs",
                      passwordStrength.strength <= 2
                        ? "text-red-500"
                        : passwordStrength.strength <= 3
                          ? "text-yellow-500"
                          : "text-green-500",
                    )}
                  >
                    قوة كلمة المرور: {passwordStrength.label}
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link - Only for Login */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setErrors({});
                  }}
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            {/* Privacy Notice - Only for Signup */}
            {!isLogin && (
              <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl text-right">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  جميع البيانات المدخلة تُستخدم لأغراض التقييم فقط ولا يتم مشاركتها مع أي طرف ثالث.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="space-y-3 animate-scale-in">
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-destructive text-sm">{errors.general}</p>
                </div>
                {errors.emailConfirmationHint && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <p className="text-amber-600 text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      إذا كنت قد سجلت مسبقاً، تحقق من بريدك الإلكتروني وافتح رابط التأكيد
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button glow effect */}
              <motion.div
                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 blur-lg opacity-0"
                animate={{
                  opacity: isSubmitting ? 0 : [0, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "relative w-full py-4 font-bold rounded-xl transition-all duration-300",
                  "focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-background",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "bg-secondary text-secondary-foreground hover:opacity-90 glow-accent",
                  "flex items-center justify-center gap-3 overflow-hidden",
                )}
              >
                {/* Button background animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري المعالجة...</span>
                    </>
                  ) : (
                    <>
                      {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                      <span>{isLogin ? "تسجيل الدخول" : "إنشاء حساب"}</span>
                    </>
                  )}
                </span>
              </button>
            </motion.div>
          </form>

          {/* Toggle Mode */}
          <motion.div 
            className="mt-8 pt-6 border-t border-border/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={toggleMode}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>{isLogin ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب؟ سجل الدخول"}</span>
            </motion.button>
          </motion.div>
        </div>
        </motion.div>
      </div>
    </div>
  );
}
