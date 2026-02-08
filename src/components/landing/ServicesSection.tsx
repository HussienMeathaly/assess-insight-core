import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck, Package, ShoppingCart, ArrowLeft } from "lucide-react";

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
    description:
      "من الفكرة إلى الإطلاق، نرافقك خطوة بخطوة لنحول أفكارك إلى منتجات ناجحة تحقق تأثيراً حقيقياً في السوق",
  },
  {
    icon: ShoppingCart,
    number: "03",
    title: "إدارة وتشغيل المبيعات",
    description:
      "ندير كل عمليات المبيعات والتسويق، من المستودع إلى العميل النهائي، لضمان وصول منتجاتك لأوسع جمهور",
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="services" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/[0.02] dark:bg-primary/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-20 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="text-accent dark:text-primary text-sm font-semibold tracking-wide mb-3 block">
            خدماتنا
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            حلول متكاملة لنمو أعمالك
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            تقديم حلول تدفع أعمالك نحو النمو والربحية المستدامة، مع تركيز على النتائج الملموسة
          </p>
        </motion.div>

        {/* Service Cards - Horizontal layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
              className="group relative rounded-3xl border border-border/40 card-interactive overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-l from-accent/60 dark:from-primary/60 via-accent/30 dark:via-primary/30 to-transparent" />
              
              <div className="p-8 sm:p-10">
                {/* Number + Icon row */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-5xl sm:text-6xl font-bold text-muted/60 dark:text-muted/40 select-none">
                    {service.number}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 dark:bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/15 dark:group-hover:bg-primary/15">
                    <service.icon className="w-7 h-7 text-accent dark:text-primary" />
                  </div>
                </div>

                <h3 className="font-bold text-foreground text-xl sm:text-2xl mb-4">{service.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">{service.description}</p>

                {/* Learn more link */}
                <div className="flex items-center gap-2 text-accent dark:text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <span>اعرف المزيد</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
