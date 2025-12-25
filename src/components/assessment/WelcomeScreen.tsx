import { Shield } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
interface WelcomeScreenProps {
  onStart: () => void;
}
export function WelcomeScreen({
  onStart
}: WelcomeScreenProps) {
  return <div className="animate-fade-in text-center max-w-2xl mx-auto px-1">
      <div className="mb-6 md:mb-8">
        <img src={profitLogo} alt="Profit+" className="h-14 md:h-16 lg:h-20 mx-auto mb-2 md:mb-3" />
        <p className="text-muted-foreground text-base md:text-lg">منصة التقييم المؤسسي</p>
      </div>

      <div className="card-elevated rounded-2xl p-5 md:p-8 lg:p-12 mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-3 md:mb-4">التقييم الأولي </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4 md:mb-6">
          يهدف هذا التقييم إلى قياس مستوى الجاهزية المبدئية للمنشأة، وتحديد مدى ملاءمتها للاستفادة من التقييم المجاني.
        </p>

        <div className="flex items-center justify-center gap-2 md:gap-3 text-muted-foreground mb-6 md:mb-8 p-3 md:p-4 bg-secondary/50 rounded-lg">
          <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
          <p className="text-xs">جميع البيانات المدخلة تُستخدم لأغراض التقييم فقط ولا يتم مشاركتها مع أي طرف ثالث.</p>
        </div>

        <button onClick={onStart} className="px-8 md:px-10 py-3 md:py-4 bg-primary text-primary-foreground font-semibold rounded-lg 
                     transition-all duration-300 hover:opacity-90 hover:scale-[1.02] 
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                     glow-accent text-sm md:text-base">
          بدء التقييم
        </button>
      </div>

      <p className="text-muted-foreground text-xs md:text-sm">مدة التقييم المتوقعة: أقل من دقيقتين</p>
    </div>;
}