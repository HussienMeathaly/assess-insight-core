import { Shield } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="animate-fade-in text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <img src={profitLogo} alt="Profit+" className="h-16 md:h-20 mx-auto mb-3" />
        <p className="text-muted-foreground text-lg">منصة التقييم المؤسسي</p>
      </div>

      <div className="card-elevated rounded-2xl p-8 md:p-12 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">التقييم الأولي للجاهزية</h2>
        <p className="text-muted-foreground text-base leading-relaxed mb-6">
          يهدف هذا التقييم إلى قياس مستوى الجاهزية المبدئية للمنشأة، وتحديد مدى ملاءمتها للاستفادة من التقييم المجاني.
        </p>

        <div className="flex items-center justify-center gap-3 text-muted-foreground mb-8 p-4 bg-secondary/50 rounded-lg">
          <Shield className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm">جميع البيانات المدخلة تُستخدم لأغراض التقييم فقط ولا يتم مشاركتها مع أي طرف ثالث.</p>
        </div>

        <button
          onClick={onStart}
          className="px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-lg 
                     transition-all duration-300 hover:opacity-90 hover:scale-[1.02] 
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                     glow-accent"
        >
          بدء التقييم
        </button>
      </div>

      <p className="text-muted-foreground text-sm">مدة التقييم المتوقعة: أقل من دقيقتين</p>
    </div>
  );
}
