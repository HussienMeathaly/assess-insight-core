import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center w-16 h-8 rounded-full cursor-pointer select-none",
        "bg-secondary/80 backdrop-blur-sm border border-border/50",
        "shadow-sm hover:shadow-md transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
      )}
      aria-label="تبديل الثيم"
    >
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <Moon className={cn(
          "h-4 w-4 transition-opacity duration-300",
          isDark ? "opacity-100 text-primary" : "opacity-30 text-muted-foreground"
        )} />
        <Sun className={cn(
          "h-4 w-4 transition-opacity duration-300",
          isDark ? "opacity-30 text-muted-foreground" : "opacity-100 text-amber-500"
        )} />
      </div>
      
      {/* Sliding thumb */}
      <motion.div
        className={cn(
          "absolute w-6 h-6 rounded-full",
          "bg-card shadow-md border border-border/30",
          "flex items-center justify-center"
        )}
        initial={false}
        animate={{ 
          x: isDark ? 4 : 36,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-500" />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
}
