import profitLogo from "@/assets/profit-logo.png";

export function Footer() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border/20 bg-card/30 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-16 py-10 sm:py-14">
        {/* Main footer content */}
        <div className="flex flex-col items-center gap-8">
          {/* Logo & Brand */}
          <button onClick={scrollToTop} className="group">
            <img
              src={profitLogo}
              alt="Profit+"
              className="h-10 sm:h-12 w-auto opacity-70 group-hover:opacity-100 transition-opacity duration-300"
            />
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 sm:gap-8">
            {[
              { label: "الرئيسية", id: "hero" },
              { label: "من نحن", id: "about" },
              { label: "خدماتنا", id: "services" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 right-0 w-0 h-px bg-accent dark:bg-primary group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-16 h-px bg-border/50" />

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Profit+ — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}