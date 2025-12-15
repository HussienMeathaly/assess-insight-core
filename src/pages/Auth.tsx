import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import profitLogo from '@/assets/profit-logo.png';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().trim().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const signupSchema = z.object({
  email: z.string().trim().email('البريد الإلكتروني غير صحيح'),
  confirmEmail: z.string().trim().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
}).refine((data) => data.email === data.confirmEmail, {
  message: 'البريد الإلكتروني غير متطابق',
  path: ['confirmEmail'],
});

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', confirmEmail: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; confirmEmail?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (field: 'email' | 'confirmEmail' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear confirmEmail error when emails match
    if ((field === 'email' || field === 'confirmEmail') && errors.confirmEmail) {
      const newEmail = field === 'email' ? value : formData.email;
      const newConfirmEmail = field === 'confirmEmail' ? value : formData.confirmEmail;
      if (newEmail === newConfirmEmail) {
        setErrors(prev => ({ ...prev, confirmEmail: undefined }));
      }
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'ضعيفة', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'متوسطة', color: 'bg-yellow-500' };
    return { strength, label: 'قوية', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const schema = isLogin ? loginSchema : signupSchema;
    const dataToValidate = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;
    
    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: { email?: string; confirmEmail?: string; password?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'confirmEmail') fieldErrors.confirmEmail = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = isLogin 
        ? await signIn(formData.email, formData.password)
        : await signUp(formData.email, formData.password);

      if (error) {
        let errorMessage = 'حدث خطأ غير متوقع';
        const msg = error.message.toLowerCase();
        
        if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
          errorMessage = 'بيانات تسجيل الدخول غير صحيحة';
        } else if (msg.includes('user already registered') || msg.includes('already registered')) {
          errorMessage = 'البريد الإلكتروني مسجل مسبقاً';
        } else if (msg.includes('email not confirmed')) {
          errorMessage = 'يرجى تأكيد البريد الإلكتروني';
        } else if (msg.includes('password should be at least') || msg.includes('password')) {
          errorMessage = 'كلمة المرور ضعيفة جداً';
        } else if (msg.includes('rate limit') || msg.includes('too many requests')) {
          errorMessage = 'محاولات كثيرة، يرجى الانتظار قليلاً';
        } else if (msg.includes('network') || msg.includes('fetch')) {
          errorMessage = 'خطأ في الاتصال بالخادم';
        } else if (msg.includes('session') || msg.includes('refresh')) {
          errorMessage = 'انتهت الجلسة، يرجى المحاولة مرة أخرى';
        }
        
        setErrors({ general: errorMessage });
      } else if (!isLogin) {
        navigate('/');
      }
    } catch {
      setErrors({ general: 'حدث خطأ في الاتصال' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ email: '', confirmEmail: '', password: '' });
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
            <img 
              src={profitLogo} 
              alt="Profit+" 
              className="h-20 md:h-24 mx-auto mb-4 relative z-10"
            />
          </div>
          <p className="text-muted-foreground text-lg font-medium">منصة التقييم المؤسسي</p>
        </div>

        {/* Form Card */}
        <div className="card-elevated rounded-3xl p-8 md:p-10 animate-slide-up relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-all duration-500",
              isLogin ? "bg-primary/10" : "bg-accent/10"
            )}>
              {isLogin ? (
                <LogIn className="w-8 h-8 text-primary" />
              ) : (
                <UserPlus className="w-8 h-8 text-accent" />
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {isLogin ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'سجل دخولك للمتابعة' : 'أنشئ حسابك للبدء في التقييم'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                  focusedField === 'email' ? "text-primary" : "text-muted-foreground"
                )}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "w-full pr-12 pl-4 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                    "focus:outline-none focus:bg-secondary transition-all duration-300",
                    errors.email 
                      ? "border-destructive focus:border-destructive" 
                      : "border-border focus:border-primary"
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

            {/* Confirm Email Field (Signup only) */}
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-sm font-medium text-foreground">
                  تأكيد البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                    focusedField === 'confirmEmail' ? "text-primary" : "text-muted-foreground"
                  )}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={formData.confirmEmail}
                    onChange={(e) => handleChange('confirmEmail', e.target.value)}
                    onFocus={() => setFocusedField('confirmEmail')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      "w-full pr-12 pl-4 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                      "focus:outline-none focus:bg-secondary transition-all duration-300",
                      errors.confirmEmail 
                        ? "border-destructive focus:border-destructive" 
                        : formData.confirmEmail && formData.email === formData.confirmEmail
                          ? "border-green-500 focus:border-green-500"
                          : "border-border focus:border-primary"
                    )}
                    placeholder="أعد كتابة البريد الإلكتروني"
                    dir="ltr"
                  />
                  {formData.confirmEmail && formData.email === formData.confirmEmail && !errors.confirmEmail && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {errors.confirmEmail && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmEmail}
                  </p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                كلمة المرور
              </label>
              <div className="relative">
                <div className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                  focusedField === 'password' ? "text-primary" : "text-muted-foreground"
                )}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "w-full pr-12 pl-12 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
                    "focus:outline-none focus:bg-secondary transition-all duration-300",
                    errors.password 
                      ? "border-destructive focus:border-destructive" 
                      : "border-border focus:border-primary"
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
                          i <= passwordStrength.strength ? passwordStrength.color : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    "text-xs",
                    passwordStrength.strength <= 2 ? "text-red-500" : 
                    passwordStrength.strength <= 3 ? "text-yellow-500" : "text-green-500"
                  )}>
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
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                "bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02] glow-accent",
                "flex items-center justify-center gap-3"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <button
              onClick={toggleMode}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>{isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل الدخول'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6 animate-fade-in">
          بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
}