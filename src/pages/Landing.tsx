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
        {/* Background decorations - subtle and elegant */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle gradient orbs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 dot-pattern opacity-20" />
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10 md:mb-14"
          >
            <div className="relative inline-block">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-accent/8 blur-2xl rounded-full scale-125" />
              <img 
                src={profitLogo} 
                alt="Profit+ Logo" 
                className="h-16 md:h-24 lg:h-28 w-auto relative z-10" 
              />
            </div>
          </motion.div>

          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="max-w-2xl mb-10 md:mb-12"
          >
            <p className="text-brand-gray dark:text-muted-foreground text-sm md:text-base tracking-wider uppercase mb-4">
              Turning Experience Into Profit
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-5 md:mb-6">
              حوّل خبراتك إلى{" "}
              <span className="text-accent dark:text-primary">أرباح</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed px-2">
              بروفيت بلس هي استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-14 md:mb-18"
          >
            <Button
              onClick={handleFreeAssessment}
              size="lg"
              className="btn-primary-enhanced px-10 md:px-14 py-5 md:py-6 text-base md:text-lg font-medium 
                       rounded-lg gap-3 group"
            >
              <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>ابدأ التقييم المجاني</span>
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 max-w-3xl w-full px-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.08 }}
                className="card-interactive rounded-lg p-4 md:p-5 text-center group"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 dark:bg-primary/10 
                              flex items-center justify-center mx-auto mb-3 transition-all duration-300 
                              group-hover:bg-accent/15 dark:group-hover:bg-primary/15">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-accent dark:text-primary" />
                </div>
                <h3 className="font-medium text-foreground text-sm md:text-base mb-1">{feature.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
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
