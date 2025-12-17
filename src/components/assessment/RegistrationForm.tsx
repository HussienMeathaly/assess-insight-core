import { useState, useRef, useCallback } from 'react';
import { Shield, Building2, User, Phone, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import profitLogo from '@/assets/profit-logo.png';
import { z } from 'zod';
import { cn } from '@/lib/utils';

// Regex for Arabic and English letters, spaces, and underscores only
const lettersOnlyRegex = /^[\u0600-\u06FFa-zA-Z\s_]+$/;

const registrationSchema = z.object({
  organizationName: z.string()
    .trim()
    .min(2, 'اسم الجهة مطلوب')
    .max(100, 'اسم الجهة يجب أن يكون أقل من 100 حرف')
    .regex(lettersOnlyRegex, 'اسم الجهة يجب أن يحتوي على حروف فقط (عربي أو إنجليزي أو _)'),
  contactPerson: z.string()
    .trim()
    .min(2, 'اسم مدخل البيانات مطلوب')
    .max(100, 'اسم مدخل البيانات يجب أن يكون أقل من 100 حرف')
    .regex(lettersOnlyRegex, 'اسم مدخل البيانات يجب أن يحتوي على حروف فقط (عربي أو إنجليزي أو _)'),
  phone: z.string().trim().min(9, 'رقم التواصل غير صحيح'),
  email: z.string().trim().email('البريد الإلكتروني غير صحيح'),
});

export type RegistrationData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  onBack: () => void;
}

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  dir?: 'ltr' | 'rtl';
  focusedField: string | null;
  fieldName: string;
  setFocusedField: (field: string | null) => void;
}

function FormField({ 
  label, icon, type, value, onChange, placeholder, error, dir = 'rtl',
  focusedField, fieldName, setFocusedField 
}: FormFieldProps) {
  const isFocused = focusedField === fieldName;
  const isValid = value && !error;
  
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative group">
        <div className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300",
          isFocused ? "text-primary scale-110" : "text-muted-foreground"
        )}>
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocusedField(fieldName)}
          onBlur={() => setFocusedField(null)}
          className={cn(
            "w-full pr-12 pl-12 py-4 bg-secondary/50 border-2 rounded-xl text-foreground",
            "focus:outline-none focus:bg-secondary transition-all duration-300",
            "placeholder:text-muted-foreground/60",
            error 
              ? "border-destructive focus:border-destructive" 
              : isFocused 
                ? "border-primary shadow-[0_0_20px_hsl(85_65%_50%/0.15)]" 
                : "border-border hover:border-border/80"
          )}
          placeholder={placeholder}
          dir={dir}
        />
        {isValid && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-scale-in">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function RegistrationForm({ onSubmit, onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    organizationName: '',
    contactPerson: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const validateField = (field: keyof RegistrationData, value: string) => {
    const fieldSchema = {
      organizationName: registrationSchema.shape.organizationName,
      contactPerson: registrationSchema.shape.contactPerson,
      phone: registrationSchema.shape.phone,
      email: registrationSchema.shape.email,
    };
    
    const result = fieldSchema[field].safeParse(value);
    return result.success ? undefined : result.error.errors[0]?.message;
  };

  const debouncedValidate = useCallback((field: keyof RegistrationData, value: string) => {
    // Clear existing timer for this field
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]);
    }
    
    // Set new timer with 400ms delay
    debounceTimers.current[field] = setTimeout(() => {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }, 400);
  }, []);

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error immediately when user starts typing (better UX)
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Debounced validation
    debouncedValidate(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegistrationData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof RegistrationData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    onSubmit(result.data);
  };

  const completedFields = Object.values(formData).filter(v => v.trim()).length;
  const progress = (completedFields / 4) * 100;

  return (
    <div className="animate-fade-in text-center max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
          <img 
            src={profitLogo} 
            alt="Profit+" 
            className="h-16 md:h-20 mx-auto mb-4 relative z-10"
          />
        </div>
        <p className="text-muted-foreground text-lg font-medium">منصة التقييم المؤسسي</p>
      </div>

      {/* Form Card */}
      <div className="card-elevated rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-secondary">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            تسجيل بيانات الجهة
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            يرجى إدخال بيانات الجهة قبل البدء في التقييم
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{completedFields} من 4 حقول مكتملة</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-right">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="اسم الجهة"
              icon={<Building2 className="w-5 h-5" />}
              type="text"
              value={formData.organizationName}
              onChange={(v) => handleChange('organizationName', v)}
              placeholder="أدخل اسم الجهة"
              error={errors.organizationName}
              focusedField={focusedField}
              fieldName="organizationName"
              setFocusedField={setFocusedField}
            />
            
            <FormField
              label="اسم مدخل البيانات"
              icon={<User className="w-5 h-5" />}
              type="text"
              value={formData.contactPerson}
              onChange={(v) => handleChange('contactPerson', v)}
              placeholder="أدخل اسم مدخل البيانات"
              error={errors.contactPerson}
              focusedField={focusedField}
              fieldName="contactPerson"
              setFocusedField={setFocusedField}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="رقم التواصل"
              icon={<Phone className="w-5 h-5" />}
              type="tel"
              value={formData.phone}
              onChange={(v) => handleChange('phone', v)}
              placeholder="05xxxxxxxx"
              error={errors.phone}
              dir="ltr"
              focusedField={focusedField}
              fieldName="phone"
              setFocusedField={setFocusedField}
            />
            
            <FormField
              label="البريد الإلكتروني"
              icon={<Mail className="w-5 h-5" />}
              type="email"
              value={formData.email}
              onChange={(v) => handleChange('email', v)}
              placeholder="example@domain.com"
              error={errors.email}
              dir="ltr"
              focusedField={focusedField}
              fieldName="email"
              setFocusedField={setFocusedField}
            />
          </div>

          {/* Privacy Notice */}
          <div className="flex items-center gap-4 p-5 bg-primary/5 border border-primary/20 rounded-2xl text-right">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              جميع البيانات المدخلة تُستخدم لأغراض التقييم فقط ولا يتم مشاركتها مع أي طرف ثالث.
              نلتزم بأعلى معايير الخصوصية والأمان.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className={cn(
                "flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-300",
                "bg-secondary text-foreground hover:bg-secondary/80",
                "focus:outline-none focus:ring-2 focus:ring-secondary/50",
                "flex items-center justify-center gap-2 group"
              )}
            >
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              <span>رجوع</span>
            </button>
            <button
              type="submit"
              disabled={completedFields < 4}
              className={cn(
                "flex-[2] px-6 py-4 font-bold rounded-xl transition-all duration-300",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                "glow-accent flex items-center justify-center gap-2 group"
              )}
            >
              <span>بدء التقييم</span>
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}