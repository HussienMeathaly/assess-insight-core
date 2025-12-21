import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronDown } from "lucide-react";
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

  return (
    <>
      <Helmet>
        <title>Profit+ | بروفيت بلس</title>
        <meta name="description" content="بروفيت بلس - استديو متخصص في تقديم حلول متكاملة للمستثمرين" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        {/* Header with Login Dropdown */}
        <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
          <div className="flex justify-between items-center">
            <ThemeToggle />
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-1 md:gap-2 bg-secondary/50 border-border/50 hover:bg-secondary/80 text-foreground px-4 md:px-8 py-2 text-sm md:text-base"
                >
                  <span>تسجيل الدخول</span>
                  <ChevronDown
                    className={`h-3 w-3 md:h-4 md:w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 md:w-48 bg-card border-border z-50">
                <DropdownMenuItem
                  onClick={handleFreeAssessment}
                  className="cursor-pointer hover:bg-secondary focus:bg-secondary text-foreground text-sm md:text-base text-right text-right"
                >
                  التقييم المجاني
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleComprehensiveAssessment}
                  className="cursor-pointer hover:bg-secondary focus:bg-secondary text-muted-foreground text-sm md:text-base text-right"
                  disabled
                >
                  التقييم الشامل
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 text-center">
          {/* Logo */}
          <div className="mb-8 md:mb-12 animate-fade-in">
            <div className="bg-secondary/60 p-5 md:p-8 rounded-lg inline-block">
              <img src={profitLogo} alt="Profit+ Logo" className="h-12 md:h-16 w-auto" />
            </div>
          </div>

          {/* Description */}
          <div className="max-w-3xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-base md:text-lg lg:text-xl text-foreground/90 leading-relaxed px-2">
              بروفيت بلس هي استديو متخصص في تقديم حلول متكاملة للمستثمرين، من التقييم والتخطيط إلى التنفيذ والتشغيل.
              نؤمن بأن النجاح يبدأ بفهم عميق للسوق واستراتيجية محكمة، ونعمل على تحويل الأفكار إلى منتجات رابحة
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Landing;
