import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, ChevronDown } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { Button } from "@/components/ui/button";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-32 w-[600px] h-[600px] rounded-full bg-primary"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-32">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Text content - Right side (RTL) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center lg:text-right order-2 lg:order-1"
          >
            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-8">
              تحويل التجارب
              <br />
              <span className="text-accent dark:text-primary">الى مكاسب</span>
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-lg leading-relaxed mb-12 mx-auto lg:mx-0 lg:me-0">
              حلول متكاملة للمستثمرين، من التقييم والتخطيط
              <br className="hidden sm:block" />
              إلى التنفيذ والتشغيل
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => navigate("/auth?type=free")}
                size="lg"
                className="btn-primary-enhanced px-10 py-6 text-base font-medium rounded-2xl gap-3 group w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>ابدأ التقييم المجاني</span>
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-6 text-base rounded-2xl border-border/60 hover:border-primary/30 w-full sm:w-auto"
              >
                اكتشف المزيد
              </Button>
            </div>
          </motion.div>

          {/* Logo - Left side (RTL) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 relative order-1 lg:order-2"
          >
            <div className="absolute inset-0 bg-accent/5 dark:bg-primary/8 blur-3xl rounded-full scale-150" />
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <img
                src={profitLogo}
                alt="Profit+ Logo"
                className="h-32 sm:h-40 md:h-52 lg:h-64 w-auto relative z-10 drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
      >
        <span className="text-xs">اكتشف المزيد</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}

export default HeroSection;
