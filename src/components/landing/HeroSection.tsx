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
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large gradient orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-60 -right-40 w-[800px] h-[800px] rounded-full bg-primary"
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        {/* Floating geometric shapes */}
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[15%] w-16 h-16 border border-accent/20 rounded-2xl"
        />
        <motion.div
          animate={{ y: [15, -15, 15], rotate: [45, -45, 45] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-[10%] w-10 h-10 border border-primary/15 rounded-full"
        />
        <motion.div
          animate={{ y: [10, -20, 10] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-[8%] w-6 h-6 bg-accent/10 rounded-full"
        />
      </div>

      {/* Main content - full width */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-20 py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Right side (RTL) - Text content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center lg:text-right"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 dark:bg-primary/10 border border-accent/20 dark:border-primary/20 mb-6 sm:mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent dark:bg-primary animate-pulse-soft" />
              <span className="text-xs sm:text-sm font-medium text-accent-foreground dark:text-primary">
                استوديو استثماري متكامل
              </span>
            </motion.div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-[1.1] mb-6">
              تحويل التجارب
              <br />
              <span className="text-accent dark:text-primary">الى مكاسب</span>
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-8 sm:mb-10 mx-auto lg:mx-0 lg:me-0">
              <span className="font-semibold text-foreground">PROFIT+</span>{" "}
              استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => navigate("/auth?type=free")}
                size="lg"
                className="btn-primary-enhanced px-10 py-6 text-base sm:text-lg font-medium rounded-2xl gap-3 group w-full sm:w-auto"
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

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center gap-8 sm:gap-12 mt-12 justify-center lg:justify-start"
            >
              {[
                { value: "100+", label: "مشروع منجز" },
                { value: "50+", label: "عميل راضٍ" },
                { value: "3", label: "خدمات رئيسية" },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Left side (RTL) - Logo showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 relative"
          >
            {/* Glow behind logo */}
            <div className="absolute inset-0 bg-accent/5 dark:bg-primary/8 blur-3xl rounded-full scale-150" />
            <div className="absolute inset-0 bg-primary/3 blur-2xl rounded-full scale-125 animate-pulse-soft" />
            
            {/* Logo container */}
            <div className="relative">
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={profitLogo}
                  alt="Profit+ Logo"
                  className="h-40 sm:h-52 md:h-60 lg:h-72 xl:h-80 w-auto relative z-10 drop-shadow-2xl"
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
