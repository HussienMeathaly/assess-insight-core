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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse-soft" />
          <img 
            src={profitLogo} 
            alt="Profit+" 
            className="h-14 md:h-16 lg:h-20 mx-auto mb-2 md:mb-3 relative z-10" 
          />
        </div>
        <p className="text-muted-foreground text-base md:text-lg">منصة التقييم المؤسسي</p>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card-elevated rounded-2xl p-6 md:p-10 lg:p-12 mb-6 md:mb-8 relative overflow-hidden"
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 md:mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">مجاني بالكامل</span>
            </div>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 md:mb-4"
          >
            التقييم الأولي للجاهزية
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 md:mb-8 max-w-xl mx-auto"
          >
            يهدف هذا التقييم إلى قياس مستوى الجاهزية المبدئية للمنشأة، وتحديد مدى ملاءمتها للاستفادة من التقييم الشامل المجاني
          </motion.p>

          {/* Info cards */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10"
          >
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">بيانات آمنة</p>
                <p className="text-xs text-muted-foreground">لا يتم مشاركتها مع أي طرف</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">سريع وبسيط</p>
                <p className="text-xs text-muted-foreground">أقل من دقيقتين</p>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={onStart} 
            className="btn-primary-enhanced px-10 md:px-14 py-4 md:py-5 bg-primary text-primary-foreground 
                     font-semibold rounded-xl transition-all duration-300 hover:opacity-90 
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 
                     focus:ring-offset-background text-base md:text-lg group"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
              بدء التقييم
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Footer note */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-muted-foreground text-xs md:text-sm"
      >
        يمكنك إعادة التقييم في أي وقت للحصول على نتائج محدثة
      </motion.p>
    </div>
  );
}
