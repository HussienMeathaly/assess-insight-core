import profitLogo from "@/assets/profit-logo.png";

export function Footer() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border/30">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-20 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          {/* Logo & copyright */}
          <div className="flex items-center gap-4">
            <img src={profitLogo} alt="Profit+" className="h-8 w-auto opacity-60" />
            <div className="h-6 w-px bg-border" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} جميع الحقوق محفوظة
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            {[
              { label: "الرئيسية", id: "hero" },
              { label: "من نحن", id: "about" },
              { label: "خدماتنا", id: "services" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
