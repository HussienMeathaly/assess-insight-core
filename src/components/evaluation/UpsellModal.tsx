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
        <div className="px-6 pt-4 pb-2 text-right" dir="rtl">
          <DialogHeader className="items-end text-right sm:text-right">
            <DialogTitle className="w-full text-lg sm:text-xl font-bold text-foreground text-right">
              🎉 أحسنت! لقد أكملت التقييم المبدئي
            </DialogTitle>
            <DialogDescription className="w-full text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed text-right">
              للحصول على تحليل شامل وتوصيات تفصيلية، ننصحك بالانتقال إلى التقييم الكامل.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Domains List */}
        <ScrollArea className="max-h-[45vh] px-6 py-4" dir="rtl">
          <div className="space-y-4 text-right" dir="rtl">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4" dir="rtl">
              <div className="flex items-center gap-2 mb-3" dir="rtl">
                <span className="text-sm font-bold text-foreground">{freeEvaluationPreview.name}</span>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <Check className="h-3 w-3" />
                  <span>تم تقييمه في النسخة المجانية</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" dir="rtl">
                {freeEvaluationPreview.elements.map((element) => (
                  <div
                    key={element}
                    className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-xs font-medium text-foreground"
                  >
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{element}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-gradient-to-b from-muted/30 to-background p-4" dir="rtl">
              <div className="mb-4 flex items-start gap-3" dir="rtl">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-right text-sm font-semibold text-foreground">
                    محاور التقييم الشامل ({comprehensiveDomains.length} مجال)
                  </h3>
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    تظهر كاملة مع تحليل أعمق وتوصيات تنفيذية بعد الترقية
                  </p>
                </div>
              </div>

              <div className="space-y-2" dir="rtl">
                {comprehensiveDomains.map((domain, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/20"
                    dir="rtl"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">{domain.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {domain.elements.length} عناصر · {domain.elements.slice(0, 2).join('، ')}
                        {domain.elements.length > 2 && '...'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      مقفل
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* CTA Footer */}
        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 text-right sm:flex-row" dir="rtl">
          <Button
            onClick={onUpgrade}
            className="hover-scale flex-1 gap-2 text-sm animate-enter motion-reduce:animate-none sm:text-base"
            style={{ animationDelay: '220ms', animationFillMode: 'both' }}
          >
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
