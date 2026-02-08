import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, Compass, Award } from "lucide-react";

const cards = [
  {
    icon: Eye,
    title: "رؤيتنا",
    description: "أن نقود تحول الشركات في المنطقة من التعثر إلى الربحية المستدامة",
  },
  {
    icon: Compass,
    title: "رسالتنا",
    description:
      "نمكن الشركات من تجاوز التحديات وتحقيق التحول الربحي من خلال تحليل عميق، استراتيجيات مدروسة، وتنفيذ فعّال يحقق نتائج ملموسة",
  },
  {
    icon: Award,
    title: "قيمنا",
    description: "الشفافية، الاحترافية، الالتزام بتحقيق النتائج",
  },
];

export function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-20 sm:py-28 px-4 relative">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
            من نحن
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold text-foreground">PROFIT+</span> استوديو متخصص في تقديم حلول استثمارية، تبدأ من التقييم والتخطيط وتمتد الى التنفيذ والتشغيل.
            نعمل مع المستثمرين على بناء مشاريع مدروسة قائمة على فهم عميق للسوق واستراتيجيات عملية، ونحول الأفكار الواعدة إلى منتجات مستدامة وقابلة للنمو.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="card-interactive rounded-xl p-6 sm:p-8 text-center group border border-border/50"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-accent/10 dark:bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:bg-accent/15 dark:group-hover:bg-primary/15 group-hover:scale-110">
                <card.icon className="w-6 h-6 sm:w-7 sm:h-7 text-accent dark:text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-base sm:text-lg mb-3">{card.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
