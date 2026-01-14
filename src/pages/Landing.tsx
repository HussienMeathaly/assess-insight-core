import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, ArrowLeft, Shield, Target, TrendingUp } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const Landing = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleFreeAssessment = () => {
    navigate("/auth?type=free");
  };

  const handleComprehensiveAssessment = () => {
    // سيتم برمجته لاحقاً
  };

  const features = [
    {
      icon: Target,
      title: "تقييم دقيق",
      description: "تحليل شامل لجاهزية منشأتك"
    },
    {
      icon: Shield,
      title: "بيانات آمنة",
      description: "حماية كاملة لمعلوماتك"
    },
    {
      icon: TrendingUp,
      title: "نتائج فورية",
      description: "تقارير تفصيلية وتوصيات"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Profit+ | بروفيت بلس</title>
        <meta name="description" content="بروفيت بلس - استديو متخصص في تقديم حلول متكاملة للمستثمرين" />
      </Helmet>

      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top gradient orb */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          {/* Bottom gradient orb */}
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          {/* Dot pattern */}
          <div className="absolute inset-0 dot-pattern opacity-30" />
        </div>

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <ThemeToggle />
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border-border/50 
                           hover:bg-card hover:border-primary/30 text-foreground px-5 md:px-8 py-2.5 
                           text-sm md:text-base shadow-md transition-all duration-300"
                >
                  <span>تسجيل الدخول</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 md:w-52 bg-card border-border shadow-lg z-50"
              >
                <DropdownMenuItem
                  onClick={handleFreeAssessment}
                  className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10 text-foreground 
                           text-sm md:text-base text-right py-3 transition-colors"
                >
                  التقييم المجاني
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleComprehensiveAssessment}
                  className="cursor-pointer hover:bg-secondary focus:bg-secondary text-muted-foreground 
                           text-sm md:text-base text-right py-3"
                  disabled
                >
                  التقييم الشامل (قريباً)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 text-center relative z-10">
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 md:mb-12"
          >
            <div className="relative inline-block">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse-soft" />
              <div className="relative card-elevated p-6 md:p-10 rounded-2xl inline-block shine">
                <img 
                  src={profitLogo} 
                  alt="Profit+ Logo" 
                  className="h-14 md:h-20 w-auto relative z-10" 
                />
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-3xl mb-10 md:mb-14"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
              حوّل أفكارك إلى منتجات{" "}
              <span className="text-primary">رابحة</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed px-2">
              بروفيت بلس هي استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل.
              نؤمن بأن النجاح يبدأ بفهم عميق للسوق واستراتيجية محكمة
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12 md:mb-16"
          >
            <Button
              onClick={handleFreeAssessment}
              size="lg"
              className="btn-primary-enhanced px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold 
                       rounded-xl gap-3 group"
            >
              <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>ابدأ التقييم المجاني</span>
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full px-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="card-interactive rounded-xl p-5 md:p-6 text-center group"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center 
                              mx-auto mb-3 md:mb-4 transition-all duration-300 group-hover:bg-primary/20 
                              group-hover:scale-110">
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="py-6 text-center relative z-10"
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Profit+ جميع الحقوق محفوظة
          </p>
        </motion.footer>
      </div>
    </>
  );
};

export default Landing;
