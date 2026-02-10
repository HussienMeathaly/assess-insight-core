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
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-accent"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.025, 0.045, 0.025] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-32 w-[620px] h-[620px] rounded-full bg-primary"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-32">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center lg:text-right order-2 lg:order-1"
          >
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight mb-6">
              تحويل التجارب <span className="text-accent dark:text-primary">إلى مكاسب</span>
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-10 mx-auto lg:mx-0">
              حلول متكاملة للمستثمرين من التقييم والتخطيط إلى التنفيذ والتشغيل
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
                className="px-8 py-6 text-base rounded-2xl border-border/50 hover:border-primary/30 text-muted-foreground w-full sm:w-auto"
              >
                اكتشف المزيد
              </Button>
            </div>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex-shrink-0 relative order-1 lg:order-2"
          >
            <div className="absolute inset-0 bg-accent/4 dark:bg-primary/6 blur-3xl rounded-full scale-140" />

            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <img
                src={profitLogo}
                alt="Profit+ Logo"
                className="h-32 sm:h-40 md:h-52 lg:h-60 w-auto relative z-10 drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
      >
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}
