import { motion } from "framer-motion";
import { Shield, Sparkles, Clock } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="text-center max-w-2xl mx-auto px-1">
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-6 md:mb-8"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-accent/8 dark:bg-primary/10 blur-2xl rounded-full scale-125" />
          <img 
            src={profitLogo} 
            alt="Profit+" 
            className="h-14 md:h-18 lg:h-20 mx-auto mb-3 relative z-10" 
          />
        </div>
        <p className="text-muted-foreground text-sm md:text-base">منصة التقييم المؤسسي</p>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="card-elevated rounded-xl p-6 md:p-8 lg:p-10 mb-6 md:mb-8 relative overflow-hidden"
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent dark:via-primary to-transparent opacity-60" />
        
        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 dark:bg-primary/10 text-accent dark:text-primary mb-4 md:mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">مجاني بالكامل</span>
            </div>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl font-bold text-foreground mb-3"
          >
            التقييم الأولي للجاهزية
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5 md:mb-6 max-w-xl mx-auto"
          >
            يهدف هذا التقييم إلى قياس مستوى الجاهزية المبدئية للمنشأة، وتحديد مدى ملاءمتها للاستفادة من التقييم الشامل المجاني
          </motion.p>

          {/* Info cards */}
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 md:mb-8"
          >
            <div className="flex items-center gap-3 p-3.5 bg-secondary/50 rounded-lg">
              <div className="w-9 h-9 rounded-md bg-accent/10 dark:bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-accent dark:text-primary" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">بيانات آمنة</p>
                <p className="text-xs text-muted-foreground">لا يتم مشاركتها مع أي طرف</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3.5 bg-secondary/50 rounded-lg">
              <div className="w-9 h-9 rounded-md bg-accent/10 dark:bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-accent dark:text-primary" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">سريع وبسيط</p>
                <p className="text-xs text-muted-foreground">أقل من دقيقتين</p>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            onClick={onStart} 
            className="btn-primary-enhanced px-8 md:px-12 py-3.5 md:py-4 bg-primary text-primary-foreground 
                     font-medium rounded-lg transition-all duration-300 hover:opacity-90 
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 
                     focus:ring-offset-background text-sm md:text-base group"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" />
              بدء التقييم
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Footer note */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="text-muted-foreground text-xs md:text-sm"
      >
        يمكنك إعادة التقييم في أي وقت للحصول على نتائج محدثة
      </motion.p>
    </div>
  );
}
