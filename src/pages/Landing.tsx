import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ChevronDown, Sparkles, ArrowLeft, Shield, Target, TrendingUp, Zap, BarChart3, Award } from "lucide-react";
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX - innerWidth / 2) / 50);
      mouseY.set((clientY - innerHeight / 2) / 50);
      setMousePosition({ x: clientX / innerWidth, y: clientY / innerHeight });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

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
      description: "تحليل شامل ومفصل لجاهزية منشأتك الاستثمارية"
    },
    {
      icon: Shield,
      title: "بيانات آمنة",
      description: "حماية متقدمة وتشفير كامل لجميع معلوماتك"
    },
    {
      icon: TrendingUp,
      title: "نتائج فورية",
      description: "تقارير احترافية وتوصيات قابلة للتنفيذ"
    }
  ];

  const stats = [
    { icon: BarChart3, value: "500+", label: "تقييم مكتمل" },
    { icon: Award, value: "98%", label: "رضا العملاء" },
    { icon: Zap, value: "5 دقائق", label: "متوسط الوقت" }
  ];

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10
  }));

  return (
    <>
      <Helmet>
        <title>Profit+ | بروفيت بلس - حوّل خبراتك إلى أرباح</title>
        <meta name="description" content="بروفيت بلس - استديو متخصص في تقديم حلول متكاملة للمستثمرين. ابدأ تقييمك المجاني الآن!" />
      </Helmet>

      <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Dynamic gradient orbs with parallax */}
          <motion.div 
            style={{ x, y }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl animate-pulse-soft" />
          </motion.div>
          
          <motion.div 
            style={{ x: useTransform(x, v => -v * 1.5), y: useTransform(y, v => -v * 1.5) }}
            className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-25"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/30 via-accent/10 to-transparent rounded-full blur-3xl" />
          </motion.div>

          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
            <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full" />
          </div>

          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-accent/20 dark:bg-primary/20"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Spotlight effect following mouse */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-300 ease-out opacity-20"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 70%)',
              left: mousePosition.x * 100 + '%',
              top: mousePosition.y * 100 + '%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="mx-4 md:mx-6 mt-4 md:mt-6">
            <div className="flex justify-between items-center max-w-7xl mx-auto glass-strong rounded-2xl px-4 md:px-6 py-3 md:py-4">
              <ThemeToggle />
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-primary/5 dark:bg-primary/10 border-primary/20 
                             hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/40 
                             text-foreground px-5 md:px-8 py-2.5 text-sm md:text-base 
                             transition-all duration-300 rounded-xl group"
                  >
                    <span className="font-medium">تسجيل الدخول</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-52 md:w-56 glass-strong border-border/50 shadow-elevated rounded-xl p-2"
                >
                  <DropdownMenuItem
                    onClick={handleFreeAssessment}
                    className="cursor-pointer hover:bg-accent/10 focus:bg-accent/10 text-foreground 
                             text-sm md:text-base text-right py-3 px-4 rounded-lg transition-all duration-200
                             hover:translate-x-1"
                  >
                    <Sparkles className="w-4 h-4 ml-2 text-accent dark:text-primary" />
                    التقييم المجاني
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleComprehensiveAssessment}
                    className="cursor-pointer text-muted-foreground text-sm md:text-base text-right py-3 px-4 rounded-lg opacity-50"
                    disabled
                  >
                    <Award className="w-4 h-4 ml-2" />
                    التقييم الشامل (قريباً)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 pt-24 pb-8 text-center relative z-10">
          {/* Logo Section with enhanced effects */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="mb-8 md:mb-12"
          >
            <div className="relative inline-block group">
              {/* Multiple glow layers */}
              <div className="absolute inset-0 bg-accent/20 dark:bg-primary/20 blur-3xl rounded-full scale-150 
                            group-hover:scale-175 transition-transform duration-700" />
              <div className="absolute inset-0 bg-accent/10 dark:bg-primary/10 blur-2xl rounded-full scale-125 
                            animate-pulse-soft" />
              
              {/* Logo container with glass effect */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative z-10 p-4 md:p-6"
              >
                <img 
                  src={profitLogo} 
                  alt="Profit+ Logo" 
                  className="h-20 md:h-28 lg:h-36 w-auto drop-shadow-2xl" 
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-3 md:mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                           bg-accent/10 dark:bg-primary/10 border border-accent/20 dark:border-primary/20
                           text-accent dark:text-primary text-xs md:text-sm font-medium tracking-wider uppercase">
              <Zap className="w-3 h-3 md:w-4 md:h-4" />
              Turning Experience Into Profit
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mb-6 md:mb-8"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
              حوّل خبراتك إلى{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l 
                               from-accent via-accent/80 to-success dark:from-primary dark:via-primary/80 dark:to-success">
                  أرباح حقيقية
                </span>
                <motion.span 
                  className="absolute -bottom-2 left-0 right-0 h-3 md:h-4 bg-accent/20 dark:bg-primary/20 
                            -skew-x-12 rounded"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-xl leading-relaxed px-4 max-w-2xl mx-auto">
              استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12 md:mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleFreeAssessment}
                size="lg"
                className="relative overflow-hidden px-10 md:px-16 py-6 md:py-8 text-base md:text-xl font-semibold 
                         rounded-2xl gap-3 group bg-accent dark:bg-primary text-accent-foreground dark:text-primary-foreground
                         shadow-[0_8px_30px_-4px] shadow-accent/40 dark:shadow-primary/40
                         hover:shadow-[0_12px_40px_-4px] hover:shadow-accent/50 dark:hover:shadow-primary/50
                         hover:brightness-110 transition-all duration-300 border-0"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                               translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-12" />
                <span>ابدأ التقييم المجاني</span>
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-x-2" />
              </Button>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground text-xs md:text-sm mt-4"
            >
              مجاني بالكامل • لا يتطلب بطاقة ائتمان
            </motion.p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12 md:mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 
                              dark:from-primary/10 dark:to-primary/5 flex items-center justify-center
                              group-hover:from-accent/20 group-hover:to-accent/10 dark:group-hover:from-primary/20 
                              dark:group-hover:to-primary/10 transition-all duration-300">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-accent dark:text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full px-2"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent 
                              dark:from-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 
                              transition-opacity duration-300" />
                
                <div className="relative glass rounded-2xl p-5 md:p-6 text-center h-full border border-border/50
                              group-hover:border-accent/30 dark:group-hover:border-primary/30 
                              transition-all duration-300">
                  {/* Icon with gradient background */}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-accent dark:bg-primary
                                flex items-center justify-center mx-auto mb-4 shadow-lg
                                group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-accent-foreground dark:text-primary-foreground" />
                  </div>
                  
                  <h3 className="font-semibold text-foreground text-base md:text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="py-6 md:py-8 text-center relative z-10"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <img src={profitLogo} alt="Profit+" className="h-5 md:h-6 w-auto" />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              © {new Date().getFullYear()} Profit+ جميع الحقوق محفوظة
            </p>
          </div>
        </motion.footer>
      </div>
    </>
  );
};

export default Landing;
