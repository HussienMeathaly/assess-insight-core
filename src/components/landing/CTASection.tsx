import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, ArrowLeft, Target, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Target, title: "تقييم دقيق", desc: "تحليل شامل لجاهزية منشأتك" },
  { icon: Shield, title: "بيانات آمنة", desc: "حماية كاملة لمعلوماتك" },
  { icon: TrendingUp, title: "نتائج فورية", desc: "تقارير تفصيلية وتوصيات عملية" },
];

export function CTASection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-[2rem] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary to-primary/90 dark:from-card dark:via-card dark:to-card" />
          <div className="absolute inset-0 opacity-10">
            <div style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary-foreground) / 0.15) 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }} className="absolute inset-0" />
          </div>

          <div className="relative z-10 px-5 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 md:py-16">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
              {/* Text */}
              <div className="flex-1 text-center lg:text-right">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground dark:text-foreground mb-4 sm:mb-5 leading-tight">
                  جاهز لتحويل تجاربك
                  <br />
                  <span className="text-accent dark:text-primary">إلى مكاسب حقيقية؟</span>
                </h2>
                <p className="text-primary-foreground/70 dark:text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 lg:me-0">
                  ابدأ الآن بتقييم مجاني لمنشأتك واكتشف فرص التحسين والنمو
                </p>
                <Button
                  onClick={() => navigate("/auth?type=free")}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground px-8 sm:px-10 py-5 sm:py-6 text-sm sm:text-base font-medium rounded-2xl gap-2 sm:gap-3 group shadow-lg"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                  <span>ابدأ التقييم المجاني</span>
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
                </Button>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-auto">
                {features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 sm:gap-4 bg-primary-foreground/5 dark:bg-muted/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-primary-foreground/10 dark:border-border/30"
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-accent/20 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent dark:text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-foreground dark:text-foreground text-xs sm:text-sm">{f.title}</h3>
                      <p className="text-primary-foreground/60 dark:text-muted-foreground text-[11px] sm:text-xs">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
