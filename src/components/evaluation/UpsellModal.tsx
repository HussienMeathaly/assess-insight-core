import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronLeft, Lock, Sparkles } from 'lucide-react';

interface UpsellModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const comprehensiveDomains = [
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

const freeEvaluationPreview = {
  name: 'فئة النشاط',
  elements: [
    'ملاءمة الفئة للسوق المحلي',
    'قابلية الاستيراد والتصدير',
    'الربحية والاستدامة',
    'التوافق القانوني والتنظيمي',
  ],
};

const domainTeasers = [
  'تفاصيل أعمق وتوصيات عملية عند الترقية',
  'رؤية أوضح لفرص التحسين عند الانتقال للتقييم الشامل',
  'تحليل أدق يساعدك على اتخاذ قرارات تطوير أفضل',
  'مؤشرات أوسع وخطوات عملية تظهر لك بعد الترقية',
  'قراءة أشمل للمحور مع توصيات قابلة للتنفيذ',
];

export function UpsellModal({ open, onClose, onUpgrade }: UpsellModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl gap-0 overflow-hidden p-0 text-right [direction:rtl] [&_*]:text-right [&_*]:[direction:rtl] [&>button]:left-4 [&>button]:right-auto"
        dir="rtl"
      >
        {/* Hero Section */}
        <div className="bg-gradient-to-bl from-primary/15 via-primary/5 to-transparent px-6 pt-6 pb-4 text-right" dir="rtl">
          <DialogHeader className="items-end text-right sm:text-right">
            <div className="text-4xl mb-3">🎉</div>
            <DialogTitle className="w-full text-xl sm:text-2xl font-bold text-foreground text-right">
              أحسنت! لقد أكملت التقييم المبدئي
            </DialogTitle>
            <DialogDescription className="w-full text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed text-right">
              للحصول على تحليل شامل وتوصيات تفصيلية تساعدك على التطوير، ننصحك بالانتقال إلى التقييم الكامل.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Domains List */}
        <ScrollArea className="max-h-[45vh] px-6 py-4" dir="rtl">
          <div className="space-y-4 text-right" dir="rtl">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-card p-4 shadow-sm" dir="rtl">
              <div className="mb-4 flex flex-col items-center border-b border-primary/15 pb-4 text-center" dir="rtl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Check className="h-3.5 w-3.5" />
                  <span>تم تقييمه في النسخة المجانية</span>
                </div>

                <h3 className="text-lg font-bold text-foreground">{freeEvaluationPreview.name}</h3>
              </div>

              <ul className="space-y-2.5 text-right" dir="rtl">
                {freeEvaluationPreview.elements.map((element) => (
                  <li
                    key={element}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-3 text-sm text-foreground shadow-sm"
                    dir="rtl"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="flex-1 text-right font-medium leading-6">{element}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-muted-foreground" dir="rtl">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 text-right">
                يتوفر بعد الترقية للتقييم الشامل ({comprehensiveDomains.length} مجال)
              </span>
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" dir="rtl">
              {comprehensiveDomains.map((domain, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-3 text-right transition-colors hover:border-primary/30"
                  dir="rtl"
                >
                  <div className="mb-2 flex items-start gap-2" dir="rtl">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-right text-sm font-semibold text-foreground">{domain.name}</h4>
                      <p className="mt-1 text-right text-[11px] text-muted-foreground">
                        هذا المحور مقفل ويظهر كاملًا بعد الترقية
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-3">
                    <ul className="space-y-2 text-right select-none" aria-hidden="true">
                      {domain.elements.map((_, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground/60" dir="rtl">
                          <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                          <span
                            className={`block h-3 rounded-full bg-muted-foreground/25 blur-sm ${
                              j % 3 === 0 ? 'w-3/4' : j % 3 === 1 ? 'w-5/6' : 'w-2/3'
                            }`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-2 text-right text-xs font-medium text-primary/80" dir="rtl">
                    {domainTeasers[i % domainTeasers.length]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* CTA Footer */}
        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 text-right sm:flex-row" dir="rtl">
          <Button onClick={onUpgrade} className="flex-1 gap-2 text-sm sm:text-base">
            الانتقال إلى التقييم الشامل
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={onClose} className="text-sm text-muted-foreground">
            ليس الآن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
