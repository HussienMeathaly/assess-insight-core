import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, ChevronDown } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.035, 0.06, 0.035] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-accent"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.025, 0.045, 0.025] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-48 -right-40 w-[640px] h-[640px] rounded-full bg-primary"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center lg:text-right"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.05] mb-10">
              تحويل التجارب
              <br />
              <span className="text-accent dark:text-primary">الى مكاسب</span>
            </h1>

            <p className="text-muted-foreground/90 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-14 mx-auto lg:mx-0">
              حلول متكاملة للمستثمرين، من التقييم والتخطيط
              <br className="hidden sm:block" />
              إلى التنفيذ والتشغيل
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
              <Button
                onClick={() => navigate("/auth?type=free")}
                size="lg"
                className="btn-primary-enhanced px-10 py-6 text-base font-medium rounded-2xl gap-3 group w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
              >
                <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>ابدأ التقييم المجاني</span>
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-6 text-base rounded-2xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors w-full sm:w-auto"
              >
                اكتشف المزيد
              </Button>
            </div>
          </motion.div>

          {/* Logo / Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center lg:justify-start"
          >
            {/* Decorative frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 blur-2xl" />
            </div>

            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <img
                src={profitLogo}
                alt="Profit+ Logo"
                className="h-32 sm:h-40 md:h-52 lg:h-60 w-auto drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        <span className="text-xs tracking-wide">اكتشف المزيد</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}
