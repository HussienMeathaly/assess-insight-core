import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, ArrowLeft, Shield, Target, TrendingUp, GripVertical } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
} from "@/components/ui/image-comparison";

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
          className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6"
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto gap-2">
            <ThemeToggle />
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5 sm:gap-2 bg-card/80 backdrop-blur-sm border-border/50 
                           hover:bg-card hover:border-primary/30 text-foreground px-3 sm:px-5 md:px-8 py-2 sm:py-2.5 
                           text-xs sm:text-sm md:text-base shadow-md transition-all duration-300"
                >
                  <span>تسجيل الدخول</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-44 sm:w-48 md:w-52 bg-card border-border shadow-lg z-50"
              >
                <DropdownMenuItem
                  onClick={handleFreeAssessment}
                  className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10 text-foreground 
                           text-xs sm:text-sm md:text-base text-right py-2.5 sm:py-3 transition-colors"
                >
                  التقييم المجاني
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleComprehensiveAssessment}
                  className="cursor-pointer hover:bg-secondary focus:bg-secondary text-muted-foreground 
                           text-xs sm:text-sm md:text-base text-right py-2.5 sm:py-3"
                  disabled
                >
                  التقييم الشامل (قريباً)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 text-center relative z-10 pt-20 sm:pt-24 md:pt-28">
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 sm:mb-10 md:mb-14"
          >
            <div className="relative inline-block">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-accent/8 blur-2xl rounded-full scale-125" />
              <img 
                src={profitLogo} 
                alt="Profit+ Logo" 
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto relative z-10" 
              />
            </div>
          </motion.div>

          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="max-w-2xl mb-6 sm:mb-10 md:mb-12 px-2"
          >
            <p className="text-brand-gray dark:text-muted-foreground text-xs sm:text-sm md:text-base tracking-wider uppercase mb-3 sm:mb-4">
              Turning Experience Into Profit
            </p>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-5 md:mb-6">
              حوّل خبراتك إلى{" "}
              <span className="text-accent dark:text-primary">أرباح</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed px-2">
              بروفيت بلس هي استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-10 sm:mb-14 md:mb-18"
          >
            <Button
              onClick={handleFreeAssessment}
              size="lg"
              className="btn-primary-enhanced px-6 sm:px-10 md:px-14 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-medium 
                       rounded-lg gap-2 sm:gap-3 group"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              <span>ابدأ التقييم المجاني</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 max-w-3xl w-full px-2 sm:px-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.08 }}
                className="card-interactive rounded-lg p-3 sm:p-4 md:p-5 text-center group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 dark:bg-primary/10 
                              flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-all duration-300 
                              group-hover:bg-accent/15 dark:group-hover:bg-primary/15">
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent dark:text-primary" />
                </div>
                <h3 className="font-medium text-foreground text-xs sm:text-sm md:text-base mb-1">{feature.title}</h3>
                <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Before/After Comparison Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="mt-12 sm:mt-16 md:mt-20 w-full max-w-4xl px-2 sm:px-4"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                شاهد الفرق قبل وبعد التقييم
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                اسحب للمقارنة بين حالة المنشأة قبل وبعد تطبيق توصياتنا
              </p>
            </div>
            
            <div className="card-elevated rounded-xl overflow-hidden p-1 sm:p-2">
              <ImageComparison 
                className="aspect-[16/10] sm:aspect-video w-full rounded-lg cursor-ew-resize"
                springOptions={{ bounce: 0.1, duration: 0.3 }}
              >
                <ImageComparisonImage 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=675&fit=crop" 
                  alt="بعد التقييم - مكتب منظم وحديث" 
                  position="right" 
                />
                <ImageComparisonImage 
                  src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&h=675&fit=crop" 
                  alt="قبل التقييم - مكتب تقليدي" 
                  position="left" 
                />
                <ImageComparisonSlider className="bg-primary w-1">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                                  w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary shadow-lg 
                                  flex items-center justify-center">
                    <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  </div>
                </ImageComparisonSlider>
              </ImageComparison>
              
              {/* Labels */}
              <div className="flex justify-between mt-3 sm:mt-4 px-2 sm:px-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-destructive/70" />
                  <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">قبل التقييم</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success" />
                  <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">بعد التقييم</span>
                </div>
              </div>
            </div>
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
