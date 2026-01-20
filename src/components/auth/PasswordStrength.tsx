import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export function getPasswordStrength(password: string) {
  if (!password) return { strength: 0, label: "", color: "" };
  
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return { strength, label: "ضعيفة", color: "bg-red-500" };
  if (strength <= 3) return { strength, label: "متوسطة", color: "bg-amber-500" };
  return { strength, label: "قوية", color: "bg-green-500" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { strength, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Strength Bars */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <motion.div
            key={level}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-500",
              level <= strength ? color : "bg-secondary/50",
            )}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: level * 0.05, duration: 0.2 }}
          />
        ))}
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-xs font-medium",
            strength <= 2 ? "text-red-500" : strength <= 3 ? "text-amber-500" : "text-green-500",
          )}
        >
          قوة كلمة المرور: {label}
        </p>
        
        {/* Tips */}
        {strength < 5 && (
          <p className="text-xs text-muted-foreground">
            {strength < 2 && "أضف أحرف كبيرة وأرقام"}
            {strength === 2 && "أضف رموز خاصة"}
            {strength === 3 && "أضف المزيد من التعقيد"}
            {strength === 4 && "ممتاز!"}
          </p>
        )}
      </div>
    </motion.div>
  );
}
