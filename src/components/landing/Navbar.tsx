import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 glass-strong shadow-md"
          : "py-4 sm:py-5"
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6">
        {/* Right side (RTL): Logo */}
        <div className="flex items-center gap-3">
          <img src={profitLogo} alt="Profit+" className="h-8 sm:h-9 w-auto" />
        </div>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "الرئيسية", id: "hero" },
            { label: "من نحن", id: "about" },
            { label: "خدماتنا", id: "services" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>

        {/* Left side (RTL): Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border-border/50 
                         hover:bg-card hover:border-primary/30 text-foreground text-sm shadow-sm"
              >
                <span>تسجيل الدخول</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg z-50">
              <DropdownMenuItem
                onClick={() => navigate("/auth?type=free")}
                className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10 text-foreground text-sm text-right py-3"
              >
                التقييم المجاني
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-muted-foreground text-sm text-right py-3"
                disabled
              >
                التقييم الشامل (قريباً)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
