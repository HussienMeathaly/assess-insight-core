import { motion, useInView } from "framer-motion";
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
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16" ref={ref}>
        {/* Header - two column layout */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-16 mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:flex-shrink-0"
          >
            <span className="text-accent dark:text-primary text-base font-semibold tracking-wide mb-4 block">
              من نحن
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-[52px] font-extrabold text-foreground leading-[1.1]">
              نبني مشاريع
              <br />
              <span className="text-muted-foreground font-bold">مدروسة ومستدامة</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-base sm:text-lg max-w-lg leading-relaxed lg:pt-10"
          >
            <span className="font-semibold text-foreground">PROFIT+</span> استوديو متخصص في تقديم حلول استثمارية، تبدأ
            من التقييم والتخطيط وتمتد الى التنفيذ والتشغيل. نعمل مع المستثمرين على بناء مشاريع قائمة على فهم عميق للسوق.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
              className="group relative rounded-3xl p-8 sm:p-10 border border-border/40 card-interactive overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-accent/5 dark:from-primary/5 to-transparent rounded-3xl" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 dark:bg-primary/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/15 dark:group-hover:bg-primary/15">
                  <card.icon className="w-7 h-7 text-accent dark:text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-xl sm:text-2xl mb-4">{card.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
