import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck, Package, ShoppingCart } from "lucide-react";

const services = [
  {
    icon: ClipboardCheck,
    number: "01",
    title: "خدمات التقييم",
    description:
      "تحليل شامل لأعمالك ومنتجاتك باستخدام معايير احترافية، لتمكينك من فهم الوضع الحالي واكتشاف فرص التحسين والنمو",
  },
  {
    icon: Package,
    number: "02",
    title: "بناء وتطوير المنتجات",
    description: "من الفكرة إلى الإطلاق، نرافقك خطوة بخطوة لنحول أفكارك إلى منتجات ناجحة تحقق تأثيراً حقيقياً في السوق",
  },
  {
    icon: ShoppingCart,
    number: "03",
    title: "إدارة وتشغيل المبيعات",
    description: "ندير كل عمليات المبيعات والتسويق، من المستودع إلى العميل النهائي، لضمان وصول منتجاتك لأوسع جمهور",
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="services" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-16 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6">
            خدماتنا
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-3xl mx-auto leading-[2]">
            تقديم حلول متكاملة تدفع أعمالك نحو النمو والربحية المستدامة، مع تركيز على النتائج الملموسة والتنفيذ الاحترافي
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
              className="group relative rounded-3xl border border-border/40 card-interactive overflow-hidden"
            >
              <div className="h-1 w-full bg-gradient-to-l from-accent/60 dark:from-primary/60 via-accent/30 dark:via-primary/30 to-transparent" />

              <div className="p-6 sm:p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-5xl font-bold text-muted-foreground/20 select-none">{service.number}</span>
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 dark:bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/15 dark:group-hover:bg-primary/15">
                    <service.icon className="w-7 h-7 text-accent dark:text-primary" />
                  </div>
                </div>

                <h3 className="font-bold text-foreground text-xl sm:text-2xl mb-4">{service.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
