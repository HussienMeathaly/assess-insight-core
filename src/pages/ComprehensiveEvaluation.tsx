import { useState, useEffect, useCallback } from "react";
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
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const { user } = useAuth();

  const checkPendingRequest = useCallback(async () => {
    if (!user) {
      setHasPendingRequest(false);
      return false;
    }

    const { data } = await supabase
      .from('comprehensive_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .limit(1)
      .maybeSingle();

    const pending = Boolean(data);
    setHasPendingRequest(pending);
    return pending;
  }, [user]);

  useEffect(() => {
    void checkPendingRequest();
  }, [checkPendingRequest]);

  const toggleDomain = (domainName: string) => {
    setSelected((current) =>
      current.includes(domainName)
        ? current.filter((item) => item !== domainName)
        : [...current, domainName]
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (selected.length === 0) {
      toast.error('يرجى اختيار عنصر واحد على الأقل');
      return;
    }

    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (hasPendingRequest) {
      toast.error('لديك طلب شامل قيد المعالجة بالفعل');
      return;
    }

    const pending = await checkPendingRequest();
    if (pending) {
      toast.error('لديك طلب شامل قيد المعالجة بالفعل');
      return;
    }

    setSubmitting(true);

    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const items = selected.map((domainName) => {
        const domain = lockedDomains.find((item) => item.name === domainName);
        return { domain: domainName, elements: domain?.elements || [] };
      });

      const { error } = await supabase.from('comprehensive_requests').insert({
        user_id: user.id,
        organization_id: org?.id ?? null,
        selected_items: items,
      });

      if (error) {
        toast.error('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
        return;
      }

      setSelected([]);
      setHasPendingRequest(true);
      toast.success('تم إرسال طلبك بنجاح، سيتواصل معك فريقنا قريبًا');
    } finally {
      setSubmitting(false);
    }
  };

  const submitDisabled = selected.length === 0 || submitting || hasPendingRequest;
  const submitLabel = submitting
    ? 'جاري الإرسال...'
    : selected.length > 0
      ? `إرسال (${selected.length})`
      : hasPendingRequest
        ? 'تم الإرسال'
        : 'إرسال (0)';

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
              onClick={() => setSelected([...allDomainNames])}
              disabled={allDomainNames.length === selected.length || hasPendingRequest}
            >
              <Check className="ml-1.5 h-3.5 w-3.5" />
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

        <div className="space-y-3">
          {lockedDomains.map((domain) => {
            const isSelected = selected.includes(domain.name);

            return (
              <div
                key={domain.name}
                className={`rounded-xl border p-4 transition-colors ${
                  isSelected ? 'border-primary/30 bg-primary/5' : 'border-border'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleDomain(domain.name)}
                  className="flex w-full items-center gap-3 text-right"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <span className="flex-1 text-right text-sm font-semibold text-foreground">{domain.name}</span>
                  <span className="text-xs text-muted-foreground">{domain.elements.length} عنصر</span>
                </button>

                <div className="mt-3 space-y-2 pr-10">
                  {domain.elements.map((element) => (
                    <div
                      key={element}
                      className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/15 px-3 py-2.5"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Lock className="h-3 w-3" />
                      </div>
                      <span className="flex-1 text-right text-sm text-muted-foreground blur-[5px] select-none">
                        {element}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-4 z-10 flex justify-center px-4 pt-2">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-auto min-w-[11rem] max-w-full gap-2 rounded-xl px-5 shadow-lg sm:min-w-[13rem] sm:px-6"
            disabled={submitDisabled}
          >
            <Send className="h-4 w-4" />
            {submitLabel}
          </Button>
        </div>
      </main>
    </div>
  );
}
