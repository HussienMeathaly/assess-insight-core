import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion value for slider position (0 = dark, 100 = light)
  const sliderPosition = useMotionValue(theme === "light" ? 100 : 0);
  
  // Update slider when theme changes externally
  useEffect(() => {
    animate(sliderPosition, theme === "light" ? 100 : 0, { duration: 0.3 });
  }, [theme, sliderPosition]);
  
  // Transform for visual effects
  const sunOpacity = useTransform(sliderPosition, [0, 50, 100], [0.3, 0.6, 1]);
  const moonOpacity = useTransform(sliderPosition, [0, 50, 100], [1, 0.6, 0.3]);
  const thumbPosition = useTransform(sliderPosition, [0, 100], ["0%", "100%"]);
  const thumbX = useTransform(sliderPosition, [0, 100], [2, -2]);
  
  const handleDrag = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = 'touches' in event 
      ? event.touches[0].clientX - rect.left 
      : (event as React.MouseEvent).clientX - rect.left;
    
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    sliderPosition.set(percentage);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    const currentPosition = sliderPosition.get();
    
    // Snap to nearest theme
    if (currentPosition > 50) {
      animate(sliderPosition, 100, { duration: 0.2 });
      setTheme("light");
    } else {
      animate(sliderPosition, 0, { duration: 0.2 });
      setTheme("dark");
    }
  };
  
  const handleClick = (event: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    if (percentage > 50) {
      animate(sliderPosition, 100, { duration: 0.3 });
      setTheme("light");
    } else {
      animate(sliderPosition, 0, { duration: 0.3 });
      setTheme("dark");
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-between w-20 h-9 rounded-full cursor-pointer select-none",
        "bg-secondary/80 backdrop-blur-sm border border-border/50",
        "shadow-sm hover:shadow-md transition-shadow duration-300"
      )}
      onMouseMove={handleDrag}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleDrag}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={handleDragEnd}
      onClick={handleClick}
    >
      {/* Dark side (Moon) */}
      <motion.div 
        className="flex items-center justify-center w-8 h-full z-10 pointer-events-none"
        style={{ opacity: moonOpacity }}
      >
        <Moon className="h-4 w-4 text-primary" />
      </motion.div>
      
      {/* Light side (Sun) */}
      <motion.div 
        className="flex items-center justify-center w-8 h-full z-10 pointer-events-none"
        style={{ opacity: sunOpacity }}
      >
        <Sun className="h-4 w-4 text-amber-500" />
      </motion.div>
      
      {/* Sliding thumb */}
      <motion.div
        className={cn(
          "absolute top-1 w-7 h-7 rounded-full",
          "bg-card shadow-md border border-border/30",
          "flex items-center justify-center",
          "transition-colors duration-200"
        )}
        style={{ 
          left: thumbPosition,
          x: thumbX,
        }}
      >
        <motion.div
          animate={{ rotate: theme === "light" ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {theme === "light" ? (
            <Sun className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-primary" />
          )}
        </motion.div>
      </motion.div>
      
      <span className="sr-only">تبديل الثيم</span>
    </div>
  );
}
