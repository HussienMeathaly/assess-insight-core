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
import { cn } from '@/lib/utils';

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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden" dir="rtl">
        {/* Hero Section */}
        <div className="bg-gradient-to-bl from-primary/15 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <DialogHeader className="text-center sm:text-center">
            <div className="text-4xl mb-3">🎉</div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
              أحسنت! لقد أكملت التقييم المبدئي
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
              للحصول على تحليل شامل وتوصيات تفصيلية تساعدك على التطوير، ننصحك بالانتقال إلى التقييم الكامل.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Domains List */}
        <ScrollArea className="max-h-[45vh] px-6 py-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            محاور التقييم الشامل ({comprehensiveDomains.length} مجال)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {comprehensiveDomains.map((domain, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Star className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">{domain.name}</h4>
                </div>
                <ul className="space-y-1 mr-9">
                  {domain.elements.map((el, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                      {el}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* CTA Footer */}
        <div className="border-t border-border px-6 py-4 flex flex-col sm:flex-row gap-3">
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
