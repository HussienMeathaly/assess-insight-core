import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, ChevronDown } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-accent/5" />
        <div className="absolute -bottom-40 -right-32 w-[620px] h-[620px] rounded-full bg-primary/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-32 text-center">
        {/* Logo */}
        <motion.img
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          src={profitLogo}
          alt="Profit+ Logo"
          className="h-28 sm:h-32 md:h-36 mx-auto mb-10 drop-shadow-xl"
        />

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6"
        >
          تحويل التجارب <span className="text-accent dark:text-primary">إلى مكاسب</span>
        </motion.h1>

        {/* Description */}
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          حلول متكاملة للمستثمرين من التقييم والتخطيط إلى التنفيذ والتشغيل
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/auth?type=free")}
            size="lg"
            className="btn-primary-enhanced px-10 py-6 rounded-2xl gap-3"
          >
            <Sparkles className="w-5 h-5" />
            ابدأ التقييم المجاني
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-6 rounded-2xl"
          >
            اكتشف المزيد
          </Button>
        </div>
      </div>

      {/* Scroll */}
      <button
        onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/40"
      >
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
}
