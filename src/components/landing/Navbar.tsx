import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import profitLogo from "@/assets/profit-logo.png";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "الرئيسية", id: "hero" },
  { label: "من نحن", id: "about" },
  { label: "خدماتنا", id: "services" },
];

export function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-3 glass-strong shadow-sm"
            : "py-5"
        }`}
      >
        <div className="flex items-center justify-between max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src={profitLogo} alt="Profit+" className={`transition-all duration-300 ${scrolled ? 'h-10 sm:h-12' : 'h-12 sm:h-14'} w-auto`} />
          </div>

          {/* Center: Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors relative group py-2"
              >
                {item.label}
                <span className="absolute -bottom-0.5 right-0 w-0 h-0.5 bg-accent dark:bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Desktop login */}
            <div className="hidden md:block">
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-card/60 backdrop-blur-sm border-border/50 
                             hover:bg-card hover:border-accent/30 dark:hover:border-primary/30 text-foreground text-base rounded-xl px-6 py-2.5"
                  >
                    <span>تسجيل الدخول</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-card/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl z-50">
                  <DropdownMenuItem
                    onClick={() => navigate("/auth?type=free")}
                    className="cursor-pointer hover:bg-accent/10 dark:hover:bg-primary/10 focus:bg-accent/10 dark:focus:bg-primary/10 text-foreground text-sm text-right py-3 rounded-lg mx-1"
                  >
                    التقييم المجاني
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-muted-foreground text-sm text-right py-3 rounded-lg mx-1"
                    disabled
                  >
                    التقييم الشامل (قريباً)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 flex items-center justify-center"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-40 pt-24 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col items-center gap-6 p-8">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-xl font-medium text-foreground hover:text-accent dark:hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="h-px w-16 bg-border my-2" />
            <Button
              onClick={() => { navigate("/auth?type=free"); setMobileOpen(false); }}
              className="btn-primary-enhanced px-8 py-5 text-base rounded-xl gap-2"
            >
              التقييم المجاني
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}
