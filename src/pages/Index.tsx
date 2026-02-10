import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, ChevronDown } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { Button } from "@/components/ui/button";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-background">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-accent/10" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-48 -left-48 w-[700px] h-[700px] rounded-full bg-primary blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 text-center lg:text-right"
          >
            {/* Accent line */}
            <div className="hidden lg:block mb-6 h-[4px] w-20 bg-accent rounded-full ms-auto" />

            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.05] text-foreground mb-10">
              تحول التجارب
              <br />
              <span className="relative inline-block text-accent dark:text-primary">
                الى مكاسب
                <span className="absolute -bottom-3 right-0 w-full h-[8px] bg-accent/25 rounded-full" />
              </span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-14 mx-auto lg:mx-0">
              حلول متكاملة للمستثمرين، من التقييم والتخطيط
              <br className="hidden sm:block" />
              إلى التنفيذ والتشغيل
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Button
                onClick={() => navigate("/auth?type=free")}
                size="lg"
                className="px-10 py-6 text-base font-medium rounded-2xl gap-3 group shadow-xl ring-1 ring-primary/30 hover:shadow-2xl transition-all"
              >
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>ابدأ التقييم المجاني</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-6 text-base rounded-2xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                اكتشف المزيد
              </Button>
            </div>
          </motion.div>

          {/* Visual / Logo panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="absolute inset-0 rounded-[40px] border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 backdrop-blur-sm" />

            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 p-12"
            >
              <img
                src={profitLogo}
                alt="Profit+ Logo"
                className="h-40 sm:h-48 md:h-56 xl:h-64 w-auto drop-shadow-2xl"
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <span className="text-xs tracking-wide">اكتشف المزيد</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}

export default HeroSection;
