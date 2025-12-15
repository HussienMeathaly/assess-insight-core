import { useState } from 'react';
import { Shield } from 'lucide-react';
import profitLogo from '@/assets/profit-logo.png';
import { z } from 'zod';

const registrationSchema = z.object({
  organizationName: z.string().trim().min(2, 'اسم الجهة مطلوب'),
  contactPerson: z.string().trim().min(2, 'اسم مدخل البيانات مطلوب'),
  phone: z.string().trim().min(9, 'رقم التواصل غير صحيح'),
  email: z.string().trim().email('البريد الإلكتروني غير صحيح'),
});

export type RegistrationData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  onBack: () => void;
}

export function RegistrationForm({ onSubmit, onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    organizationName: '',
    contactPerson: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
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

  return (
    <div className="animate-fade-in text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <img 
          src={profitLogo} 
          alt="Profit+" 
          className="h-16 md:h-20 mx-auto mb-3"
        />
        <p className="text-muted-foreground text-lg">منصة التقييم المؤسسي</p>
      </div>

      <div className="card-elevated rounded-2xl p-8 md:p-12 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
          تسجيل بيانات الجهة
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          يرجى إدخال بيانات الجهة قبل البدء في التقييم
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-right">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              اسم الجهة
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => handleChange('organizationName', e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-right
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                         transition-all duration-200"
              placeholder="أدخل اسم الجهة"
            />
            {errors.organizationName && (
              <p className="text-destructive text-sm mt-1">{errors.organizationName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              اسم مدخل البيانات
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleChange('contactPerson', e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-right
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                         transition-all duration-200"
              placeholder="أدخل اسم مدخل البيانات"
            />
            {errors.contactPerson && (
              <p className="text-destructive text-sm mt-1">{errors.contactPerson}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              رقم التواصل
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-right
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                         transition-all duration-200"
              placeholder="05xxxxxxxx"
              dir="ltr"
            />
            {errors.phone && (
              <p className="text-destructive text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-right
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                         transition-all duration-200"
              placeholder="example@domain.com"
              dir="ltr"
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 text-muted-foreground p-4 bg-secondary/50 rounded-lg">
            <Shield className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm">
              جميع البيانات المدخلة تُستخدم لأغراض التقييم فقط ولا يتم مشاركتها مع أي طرف ثالث.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-4 bg-secondary text-foreground font-semibold rounded-lg 
                         transition-all duration-300 hover:bg-secondary/80
                         focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              رجوع
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-lg 
                         transition-all duration-300 hover:opacity-90 hover:scale-[1.02] 
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                         glow-accent"
            >
              بدء التقييم
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
