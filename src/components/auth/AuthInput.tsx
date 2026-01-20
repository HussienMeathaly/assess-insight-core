import { forwardRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
  error?: string;
  isValid?: boolean;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  rightElement?: ReactNode;
  hint?: ReactNode;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ 
    label, 
    icon, 
    error, 
    isValid, 
    isFocused,
    onFocusChange,
    rightElement,
    hint,
    className,
    ...props 
  }, ref) => {
    return (
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <label className="block text-sm font-semibold text-foreground">
          {label}
        </label>
        <div className="relative group">
          {/* Icon */}
          <motion.div
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300",
              isFocused ? "text-primary scale-110" : "text-muted-foreground",
            )}
            animate={isFocused ? { scale: 1.1 } : { scale: 1 }}
          >
            {icon}
          </motion.div>

          {/* Input */}
          <input
            ref={ref}
            onFocus={() => onFocusChange?.(true)}
            onBlur={() => onFocusChange?.(false)}
            className={cn(
              "w-full pr-12 pl-12 py-4 bg-secondary/30 border-2 rounded-2xl text-foreground",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:bg-secondary/50 transition-all duration-300",
              "hover:bg-secondary/40 hover:border-primary/30",
              error
                ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                : "border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
              className,
            )}
            {...props}
          />

          {/* Validation Icon or Right Element */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {rightElement ? (
              rightElement
            ) : isValid ? (
              <motion.div 
                className="text-green-500"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
            ) : null}
          </div>

          {/* Focus Glow Effect */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary/30 pointer-events-none"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                style={{ boxShadow: "0 0 25px hsl(var(--primary)/0.2)" }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p 
              className="text-destructive text-sm flex items-center gap-2 bg-destructive/10 px-3 py-2 rounded-lg"
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -5, height: 0 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Hint */}
        {hint && !error && (
          <div className="text-xs text-muted-foreground">
            {hint}
          </div>
        )}
      </motion.div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export { AuthInput };
