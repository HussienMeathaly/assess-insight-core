import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, ChevronDown } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Subtle background elements */}
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
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Right side (RTL) - Text content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center lg:text-right"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 dark:bg-primary/10 border border-accent/20 dark:border-primary/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent dark:bg-primary animate-pulse-soft" />
              <span className="text-sm font-medium text-accent-foreground dark:text-primary">
                استوديو استثماري متكامل
              </span>
            </motion.div>

            {/* Main heading - balanced sizing */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.15] mb-6">
              تحويل التجارب
              <br />
              <span className="text-accent dark:text-primary">الى مكاسب</span>
            </h1>

            {/* Description - proportional to heading */}
            <p className="text-muted-foreground text-lg sm:text-xl max-w-xl leading-relaxed mb-10 mx-auto lg:mx-0 lg:me-0">
              <span className="font-semibold text-foreground">PROFIT+</span>{" "}
              استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل
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

          {/* Left side (RTL) - Logo showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 relative"
          >
            <div className="absolute inset-0 bg-accent/5 dark:bg-primary/8 blur-3xl rounded-full scale-150" />
            <div className="relative">
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={profitLogo}
                  alt="Profit+ Logo"
                  className="h-36 sm:h-44 md:h-52 lg:h-64 w-auto relative z-10 drop-shadow-2xl"
                />
              </motion.div>
            </div>
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
