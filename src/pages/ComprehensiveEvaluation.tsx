import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check, Lock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import profitLogo from '@/assets/profit-logo.png';

const lockedDomains = [
  { name: 'العلامة التجارية', elements: ['تجربة العلامة', 'قوة العلامة', 'تواصل العلامة'] },
  { name: 'أصناف العلامة التجارية', elements: ['جودة المنتج', 'التغليف والعرض', 'الخصائص الملموسة للصنف'] },
  { name: 'التواجد والانتشار', elements: ['التغطية الجغرافية', 'قنوات البيع', 'تغطية الفئة المستهدفة', 'الحصة داخل القنوات'] },
  { name: 'التوزيع السليم', elements: ['الصنف المناسب', 'المكان المناسب', 'الكمية المناسبة'] },
  { name: 'سياسة التسعير', elements: ['تنافسية السعر', 'القيمة مقابل السعر', 'المرونة', 'الربحية', 'الاتساق والوضوح'] },
  { name: 'الفريق البيعي', elements: ['كفاءة الفريق', 'الأداء والنتائج', 'التغذية الراجعة', 'الابتكار والتحسين المستمر'] },
  { name: 'بيئة العمل', elements: ['المرافق والبنية التحتية', 'الثقافة والبيئة التنظيمية', 'التعاون والعمل الجماعي', 'الصحة والسلامة', 'الابتكار والتحسين المستمر'] },
  { name: 'السلامة المهنية', elements: ['الامتثال القانوني', 'الكفاءة والتوظيف', 'الرواتب والمزايا', 'الاستعداد الانضباطي', 'الابتكار والتحسين المستمر'] },
  { name: 'السلامة المالية', elements: ['السيولة المالية', 'الربحية', 'إدارة الديون', 'الكفاءة المالية', 'الامتثال والمعايير المالية'] },
  { name: 'سلاسل الإمداد والتمويل', elements: ['الكفاءة التشغيلية', 'المرونة والتكيف', 'التكلفة والربحية', 'الجودة والموثوقية', 'الابتكار والتحسين المستمر'] },
  { name: 'خدمة العملاء', elements: ['سرعة الاستجابة', 'الاحترافية والجودة', 'المرونة والتكيف', 'رضا العملاء', 'الابتكار في الخدمة'] },
  { name: 'القطاع الصناعي', elements: ['المواد الخام', 'المعدات والأجهزة', 'عمليات التصنيع والإنتاج', 'العمالة والفريق الفني', 'نظام الجودة الشامل', 'المنتج النهائي والتغليف', 'التوثيق الرقمي والتحليل البيئي'] },
];

const allDomainNames = lockedDomains.map((d) => d.name);

export default function ComprehensiveEvaluation() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  // Check if user already submitted a request
  useEffect(() => {
    if (!user) return;
    supabase
      .from('comprehensive_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSubmitted(true);
      });
  }, [user]);

  const toggle = (d: string, e: string) => {
    const id = makeKey(d, e);
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const handleSubmit = () => {
    if (submitting || submitted) return;
    if (selected.length === 0) {
      toast.error('يرجى اختيار عنصر واحد على الأقل');
      return;
    }

    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    setSubmitting(true);

    (async () => {
      // Get user's organization
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const items = selected.map((key) => {
        const [domain, element] = key.split('::');
        return { domain, element };
      });

      const { error } = await supabase.from('comprehensive_requests').insert({
        user_id: user.id,
        organization_id: org?.id ?? null,
        selected_items: items,
      });

      if (error) {
        toast.error('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
      } else {
        setSubmitted(true);
        toast.success('تم إرسال طلبك بنجاح، سيتواصل معك فريقنا قريبًا');
      }
      setSubmitting(false);
    })();
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Helmet>
        <title>التقييم الشامل | PROFIT</title>
      </Helmet>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <img src={profitLogo} alt="PROFIT" className="h-10 sm:h-12" />
        </div>
      </header>

      <main className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="text-right">
          <h1 className="text-xl font-bold text-foreground">التقييم الشامل</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            اختر المحاور التي تريد تقييمها ثم اضغط إرسال.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected([...allItemKeys])}
              disabled={selected.length === allItemKeys.length}
            >
              <Check className="h-3.5 w-3.5 ml-1.5" />
              اختيار الكل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
            >
              إلغاء الكل
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {lockedDomains.map((domain) => {
            const allKeys = domain.elements.map((e) => makeKey(domain.name, e));
            const allSelected = allKeys.every((id) => selected.includes(id));

            return (
              <div key={domain.name} className="rounded-xl border border-border p-4">
                <button
                  type="button"
                  onClick={() => {
                    if (allSelected) {
                      setSelected((s) => s.filter((id) => !allKeys.includes(id)));
                    } else {
                      setSelected((s) => [...new Set([...s, ...allKeys])]);
                    }
                  }}
                  className="flex w-full items-center gap-3 text-right"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      allSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {allSelected ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <span className="flex-1 text-right text-sm font-semibold text-foreground">{domain.name}</span>
                </button>

                <div className="mt-3 space-y-2 pr-10">
                  {domain.elements.map((element) => {
                    const isSelected = selected.includes(makeKey(domain.name, element));

                    return (
                      <button
                        key={element}
                        type="button"
                        onClick={() => toggle(domain.name, element)}
                        className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-right transition-colors ${
                          isSelected
                            ? 'border-primary/25 bg-primary/10'
                            : 'border-border/60 bg-muted/15 hover:bg-muted/30'
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isSelected ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        </div>
                        <span
                          className={`flex-1 text-right text-sm transition-all ${
                            isSelected ? 'font-medium text-foreground' : 'text-muted-foreground blur-[2px]'
                          }`}
                        >
                          {element}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-4 flex justify-center pt-2">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full max-w-sm gap-2 rounded-xl shadow-lg sm:w-auto"
            disabled={selected.length === 0 || submitting || submitted}
          >
            <Send className="h-4 w-4" />
            {submitted ? 'تم الإرسال' : submitting ? 'جاري الإرسال...' : `إرسال (${selected.length})`}
          </Button>
        </div>
      </main>
    </div>
  );
}
