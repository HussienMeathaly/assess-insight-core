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
    <section id="about" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-20" ref={ref}>
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-20 mb-28">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            {/* Bigger section label */}
            <span className="block text-accent dark:text-primary text-lg sm:text-xl font-bold tracking-wide mb-6">
              من نحن
            </span>

            {/* Visual claim */}
            <h3 className="text-4xl sm:text-5xl md:text-[52px] font-extrabold text-foreground leading-[1.15]">
              نبني مشاريع
              <br />
              <span className="text-muted-foreground font-bold">مدروسة ومستدامة</span>
            </h3>
          </motion.div>

          {/* Client text (unchanged) */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-7 text-muted-foreground text-base sm:text-lg leading-[2] lg:pt-16"
          >
            <span className="font-semibold text-foreground">PROFIT+</span> استوديو متخصص في تقديم حلول استثمارية، تبدأ
            من التقييم والتخطيط وتمتد إلى التنفيذ والتشغيل. نعمل مع المستثمرين على بناء مشاريع مدروسة قائمة على فهم عميق
            للسوق، واستراتيجيات عملية، وتحويل الأفكار الواعدة إلى منتجات مستدامة وقابلة للنمو.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
              className="group relative rounded-[32px] p-10 lg:p-12 border border-border/40 overflow-hidden w-full"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-accent/5 dark:from-primary/5 to-transparent rounded-[32px]" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 dark:bg-primary/10 flex items-center justify-center mb-8 transition-all duration-300 group-hover:scale-110">
                  <card.icon className="w-8 h-8 text-accent dark:text-primary" />
                </div>

                <h3 className="font-extrabold text-foreground text-2xl sm:text-3xl mb-5">{card.title}</h3>

                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
