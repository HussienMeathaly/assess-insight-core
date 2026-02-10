import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, ChevronDown } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { Button } from "@/components/ui/button";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 right-1/4 w-[520px] h-[520px] rounded-full bg-accent"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full bg-primary"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-16 py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          {/* Logo – supporting element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-10 flex justify-center"
          >
            <img src={profitLogo} alt="Profit+ Logo" className="h-24 sm:h-28 md:h-32 opacity-80" />
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8">
            تحويل التجارب <span className="block text-accent dark:text-primary">الى مكاسب</span>
          </h1>

          {/* Description */}
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            حلول متكاملة للمستثمرين، من التقييم والتخطيط
            <br className="hidden sm:block" />
            إلى التنفيذ والتشغيل
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/auth?type=free")}
              size="lg"
              className="px-10 py-6 rounded-2xl gap-3 group"
            >
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>ابدأ التقييم المجاني</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
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
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
