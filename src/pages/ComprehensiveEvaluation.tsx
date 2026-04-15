import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import profitLogo from '@/assets/profit-logo.png';

const freeEvaluationCovered = {
  name: 'فئة النشاط',
  elements: [
    'ملاءمة الفئة للسوق المحلي',
    'قابلية الاستيراد والتصدير',
    'الربحية والاستدامة',
    'التوافق القانوني والتنظيمي',
  ],
};

const lockedDomains = [
  {
    name: 'العلامة التجارية',
    elements: ['تجربة العلامة', 'قوة العلامة', 'تواصل العلامة'],
  },
  {
    name: 'أصناف العلامة التجارية',
    elements: ['جودة المنتج', 'التغليف والعرض', 'الخصائص الملموسة للصنف'],
  },
  {
    name: 'التواجد والانتشار',
    elements: ['التغطية الجغرافية', 'قنوات البيع', 'تغطية الفئة المستهدفة', 'الحصة داخل القنوات'],
  },
  {
    name: 'التوزيع السليم',
    elements: ['الصنف المناسب', 'المكان المناسب', 'الكمية المناسبة'],
  },
  {
    name: 'سياسة التسعير',
    elements: ['تنافسية السعر', 'القيمة مقابل السعر', 'المرونة', 'الربحية', 'الاتساق والوضوح'],
  },
  {
    name: 'الفريق البيعي',
    elements: ['كفاءة الفريق', 'الأداء والنتائج', 'التغذية الراجعة', 'الابتكار والتحسين المستمر'],
  },
  {
    name: 'بيئة العمل',
    elements: ['المرافق والبنية التحتية', 'الثقافة والبيئة التنظيمية', 'التعاون والعمل الجماعي', 'الصحة والسلامة', 'الابتكار والتحسين المستمر'],
  },
  {
    name: 'السلامة المهنية',
    elements: ['الامتثال القانوني', 'الكفاءة والتوظيف', 'الرواتب والمزايا', 'الاستعداد الانضباطي', 'الابتكار والتحسين المستمر'],
  },
  {
    name: 'السلامة المالية',
    elements: ['السيولة المالية', 'الربحية', 'إدارة الديون', 'الكفاءة المالية', 'الامتثال والمعايير المالية'],
  },
  {
    name: 'سلاسل الإمداد والتمويل',
    elements: ['الكفاءة التشغيلية', 'المرونة والتكيف', 'التكلفة والربحية', 'الجودة والموثوقية', 'الابتكار والتحسين المستمر'],
  },
  {
    name: 'خدمة العملاء',
    elements: ['سرعة الاستجابة', 'الاحترافية والجودة', 'المرونة والتكيف', 'رضا العملاء', 'الابتكار في الخدمة'],
  },
  {
    name: 'القطاع الصناعي',
    elements: ['المواد الخام', 'المعدات والأجهزة', 'عمليات التصنيع والإنتاج', 'العمالة والفريق الفني', 'نظام الجودة الشامل', 'المنتج النهائي والتغليف', 'التوثيق الرقمي والتحليل البيئي'],
  },
];

const buildSelectionKey = (domainName: string, elementName: string) => `${domainName}::${elementName}`;

export default function ComprehensiveEvaluation() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const totalLockedItems = useMemo(
    () => lockedDomains.reduce((total, domain) => total + domain.elements.length, 0),
    []
  );

  const toggleItem = (domainName: string, elementName: string) => {
    const key = buildSelectionKey(domainName, elementName);

    setSelectedItems((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Helmet>
        <title>التقييم الشامل | PROFIT</title>
        <meta
          name="description"
          content="اختر المحاور والعناصر التي تريد تضمينها في التقييم الشامل بعد استكمال النسخة المجانية."
        />
      </Helmet>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/free-evaluation')}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <img src={profitLogo} alt="PROFIT" className="h-12 sm:h-14" />
          </div>

          <div className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:text-sm">
            تم اختيار {selectedItems.length} من {totalLockedItems}
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6 sm:py-8">
        <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-muted/30 p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-start">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>التقييم الشامل</span>
              </div>

              <h1 className="mt-4 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                اختر المحاور المقفلة التي تريد تقييمها بعمق
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                لقد غطت النسخة المجانية محور <span className="font-semibold text-foreground">{freeEvaluationCovered.name}</span>.
                الآن يمكنك اختيار العناصر المقفلة التي تريد تضمينها ضمن التقييم الشامل للحصول على قراءة أوسع وتوصيات أكثر دقة.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/85 p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">ملخص سريع</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                  <div className="text-xl font-bold text-foreground">{lockedDomains.length}</div>
                  <div className="mt-1 text-xs text-muted-foreground">محور مقفل</div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                  <div className="text-xl font-bold text-foreground">{selectedItems.length}</div>
                  <div className="mt-1 text-xs text-muted-foreground">عنصر محدد</div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                اختر ما يناسب أولوياتك الحالية، ويمكنك تعديل الاختيار بحرية في أي وقت داخل هذه الصفحة.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
          <div className="flex flex-col items-center border-b border-primary/15 pb-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Check className="h-3.5 w-3.5" />
              <span>تم تقييمه في النسخة المجانية</span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-foreground">{freeEvaluationCovered.name}</h2>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {freeEvaluationCovered.elements.map((element) => (
              <div
                key={element}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/85 px-4 py-3 shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
                <span className="flex-1 text-right text-sm font-medium text-foreground">{element}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="text-right">
            <h2 className="text-xl font-bold text-foreground">اختر من المحاور المقفلة</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              اضغط على أي عنصر لإضافته إلى نطاق التقييم الشامل الذي تريد التركيز عليه.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {lockedDomains.map((domain, index) => {
              const selectedInDomain = domain.elements.filter((element) =>
                selectedItems.includes(buildSelectionKey(domain.name, element))
              ).length;

              return (
                <article
                  key={domain.name}
                  className="animate-fade-in overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm motion-reduce:animate-none"
                  style={{ animationDelay: `${index * 70}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-sm">
                      <Lock className="h-4 w-4" />
                    </div>

                    <div className="flex-1 text-right">
                      <div className="inline-flex items-center rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {selectedInDomain} / {domain.elements.length} محدد
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">{domain.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        اختر العناصر التي تريد تضمينها من هذا المحور ضمن التقييم الشامل.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {domain.elements.map((element) => {
                      const isSelected = selectedItems.includes(buildSelectionKey(domain.name, element));

                      return (
                        <button
                          key={element}
                          type="button"
                          onClick={() => toggleItem(domain.name, element)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-right transition-all duration-200 ${
                            isSelected
                              ? 'border-primary/25 bg-primary/10 shadow-sm'
                              : 'border-border/70 bg-background hover:border-primary/20 hover:bg-muted/30'
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isSelected ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </div>

                          <div className="flex-1 text-right">
                            <div className="text-sm font-medium text-foreground">{element}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {isSelected ? 'تمت إضافته إلى اختيارك الحالي' : 'اضغط لإضافته إلى التقييم الشامل'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}