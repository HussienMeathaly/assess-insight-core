import { motion } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  isLogin: boolean;
}

export function AuthHeader({ isLogin }: AuthHeaderProps) {
  return (
    <motion.div 
      className="text-center mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <motion.div
        className={cn(
          "inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 transition-all duration-500 relative",
          isLogin 
            ? "bg-gradient-to-br from-primary/20 to-primary/5" 
            : "bg-gradient-to-br from-accent/20 to-accent/5",
        )}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Inner Glow */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-3xl blur-xl",
            isLogin ? "bg-primary/30" : "bg-accent/30"
          )}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {isLogin ? (
          <LogIn className="w-9 h-9 text-primary relative z-10" />
        ) : (
          <UserPlus className="w-9 h-9 text-accent relative z-10" />
        )}
      </motion.div>
      
      <motion.h2 
        className="text-3xl font-bold text-foreground mb-2"
        key={isLogin ? "login" : "signup"}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {isLogin ? "مرحباً بعودتك" : "إنشاء حساب جديد"}
      </motion.h2>
      
      <motion.p 
        className="text-muted-foreground"
        key={isLogin ? "login-desc" : "signup-desc"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {isLogin ? "سجل دخولك للمتابعة" : "أدخل بياناتك للبدء في التقييم"}
      </motion.p>
    </motion.div>
  );
}
