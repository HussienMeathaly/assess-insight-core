import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import profitLogo from '@/assets/profit-logo.png';

const authSchema = z.object({
  email: z.string().trim().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (field: 'email' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = authSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
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
        // For signup, auto-login will happen via auth state change
        navigate('/');
      }
    } catch {
      setErrors({ general: 'حدث خطأ في الاتصال' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img 
            src={profitLogo} 
            alt="Profit+" 
            className="h-16 md:h-20 mx-auto mb-3"
          />
          <p className="text-muted-foreground text-lg">منصة التقييم المؤسسي</p>
        </div>

        <div className="card-elevated rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 text-right">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-all duration-200"
                placeholder="example@domain.com"
                dir="ltr"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-all duration-200"
                placeholder="••••••••"
                dir="ltr"
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm text-center">{errors.general}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-lg 
                         transition-all duration-300 hover:opacity-90 hover:scale-[1.02] 
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         glow-accent"
            >
              {isSubmitting ? 'جاري المعالجة...' : (isLogin ? 'دخول' : 'إنشاء حساب')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-primary hover:underline text-sm"
            >
              {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل الدخول'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
