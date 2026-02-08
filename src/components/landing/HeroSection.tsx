import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative mb-6 sm:mb-8"
      >
        <div className="absolute inset-0 bg-accent/8 blur-2xl rounded-full scale-125" />
        <img
          src={profitLogo}
          alt="Profit+ Logo"
          className="h-20 sm:h-28 md:h-36 lg:h-44 w-auto relative z-10"
        />
      </motion.div>

      {/* Tagline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6"
      >
        تحويل التجارب الى{" "}
        <span className="text-accent dark:text-primary">مكاسب</span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed mb-8 sm:mb-10 px-2"
      >
        <span className="font-semibold text-foreground">PROFIT+</span> هي استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Button
          onClick={() => navigate("/auth?type=free")}
          size="lg"
          className="btn-primary-enhanced px-8 sm:px-12 py-5 sm:py-6 text-sm sm:text-lg font-medium rounded-xl gap-2.5 group"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
          <span>ابدأ التقييم المجاني</span>
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
        </Button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 animate-bounce-subtle"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-muted-foreground/40 animate-pulse-soft" />
        </div>
      </motion.div>
    </section>
  );
}
