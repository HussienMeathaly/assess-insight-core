import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, ArrowLeft, Target, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Target, title: "تقييم دقيق", desc: "تحليل شامل لجاهزية منشأتك" },
  { icon: Shield, title: "بيانات آمنة", desc: "حماية كاملة لمعلوماتك" },
  { icon: TrendingUp, title: "نتائج فورية", desc: "تقارير تفصيلية وتوصيات" },
];

export function CTASection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-28 px-4 relative" ref={ref}>
      <div className="max-w-4xl mx-auto text-center">
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
            جاهز لتحويل تجاربك إلى مكاسب؟
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 sm:mb-10 max-w-xl mx-auto">
            ابدأ الآن بتقييم مجاني لمنشأتك واكتشف فرص التحسين والنمو
          </p>
          <Button
            onClick={() => navigate("/auth?type=free")}
            size="lg"
            className="btn-primary-enhanced px-8 sm:px-14 py-5 sm:py-6 text-sm sm:text-lg font-medium rounded-xl gap-2.5 group"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
            <span>ابدأ التقييم المجاني</span>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
          </Button>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 sm:mt-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="card-interactive rounded-xl p-5 sm:p-6 text-center group border border-border/50"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/10 dark:bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:bg-accent/15 dark:group-hover:bg-primary/15">
                <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent dark:text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-sm sm:text-base mb-1">{f.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
