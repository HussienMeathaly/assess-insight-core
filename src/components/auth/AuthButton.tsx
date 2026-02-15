import { ReactNode, forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthButtonProps {
  isSubmitting: boolean;
  icon: ReactNode;
  label: string;
  loadingLabel?: string;
  variant?: "primary" | "secondary";
  type?: "submit" | "button";
  onClick?: () => void;
  disabled?: boolean;
}

export const AuthButton = forwardRef<HTMLDivElement, AuthButtonProps>(function AuthButton({ 
  isSubmitting, 
  icon, 
  label, 
  loadingLabel = "جاري المعالجة...",
  variant = "primary",
  type = "submit",
  onClick,
  disabled,
}, ref) {
  const isPrimary = variant === "primary";

  return (
    <motion.div 
      ref={ref}
      className="relative"
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Button Glow Effect */}
      {isPrimary && !disabled && (
        <motion.div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 blur-lg"
          animate={{
            opacity: isSubmitting ? 0 : [0, 0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      <button
        type={type}
        onClick={onClick}
        disabled={isSubmitting || disabled}
        className={cn(
          "relative w-full py-4 font-bold rounded-2xl transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-3 overflow-hidden",
          isPrimary ? [
            "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground",
            "hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25",
            "focus:ring-primary/50",
          ] : [
            "bg-secondary text-secondary-foreground",
            "hover:bg-secondary/80",
            "focus:ring-secondary/50",
          ],
        )}
      >
        {/* Shimmer Effect */}
        {isPrimary && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        
        <span className="relative z-10 flex items-center gap-3">
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{loadingLabel}</span>
            </>
          ) : (
            <>
              {icon}
              <span>{label}</span>
            </>
          )}
        </span>
      </button>
    </motion.div>
  );
});
