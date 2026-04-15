import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, ChevronLeft, Sparkles } from 'lucide-react';

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
          <div className="space-y-3 text-right" dir="rtl">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground" dir="rtl">
              <span className="flex-1 text-right">محاور التقييم الشامل ({comprehensiveDomains.length} مجال)</span>
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" dir="rtl">
              {comprehensiveDomains.map((domain, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-3 text-right transition-colors hover:border-primary/30"
                  dir="rtl"
                >
                  <div className="mb-2 flex items-center gap-2" dir="rtl">
                    <h4 className="flex-1 text-right text-sm font-semibold text-foreground">{domain.name}</h4>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Star className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>

                  <ul className="space-y-1 pr-9 text-right">
                    {domain.elements.map((el, j) => (
                      <li key={j} className="flex items-center gap-1.5 text-xs text-muted-foreground" dir="rtl">
                        <span className="flex-1 text-right">{el}</span>
                        <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      </li>
                    ))}
                  </ul>
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
