import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck, Package, ShoppingCart } from "lucide-react";

const services = [
  {
    icon: ClipboardCheck,
    title: "خدمات التقييم",
    description:
      "تحليل شامل لأعمالك ومنتجاتك باستخدام معايير احترافية، لتمكينك من فهم الوضع الحالي واكتشاف فرص التحسين والنمو بكل وضوح",
  },
  {
    icon: Package,
    title: "بناء وتطوير المنتجات",
    description:
      "من الفكرة إلى الإطلاق، نرافقك خطوة بخطوة لنحول أفكارك إلى منتجات ناجحة تحقق تأثيراً حقيقياً في السوق",
  },
  {
    icon: ShoppingCart,
    title: "إدارة وتشغيل المبيعات",
    description:
      "ندير كل عمليات المبيعات والتسويق، من المستودع إلى العميل النهائي، لضمان وصول منتجاتك لأوسع جمهور وتحقيق أقصى انتشار ونمو مستدام",
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="py-20 sm:py-28 px-4 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
            خدماتنا
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            تقديم حلول متكاملة تدفع أعمالك نحو النمو والربحية المستدامة، مع تركيز على النتائج الملموسة والتنفيذ الاحترافي
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="card-interactive rounded-xl p-6 sm:p-8 group border border-border/50 text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-accent/10 dark:bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:bg-accent/15 dark:group-hover:bg-primary/15 group-hover:scale-110">
                <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-accent dark:text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-base sm:text-lg mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
