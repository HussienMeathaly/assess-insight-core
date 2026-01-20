import { ReactNode } from "react";
import { motion } from "framer-motion";
import profitLogo from "@/assets/profit-logo.png";

interface AuthCardProps {
  children: ReactNode;
  mouseX: any;
  mouseY: any;
  rotateX: any;
  rotateY: any;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}

export function AuthCard({ 
  children, 
  mouseX, 
  mouseY, 
  rotateX, 
  rotateY, 
  onMouseMove, 
  onMouseLeave 
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-accent/15 to-transparent blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb)/0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb)/0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative inline-block">
            {/* Logo Glow */}
            <motion.div 
              className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1.4, 1.6, 1.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <img 
              src={profitLogo} 
              alt="Profit+" 
              className="h-20 md:h-24 mx-auto mb-4 relative z-10 drop-shadow-2xl" 
            />
          </div>
          <motion.p 
            className="text-muted-foreground text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            منصة التقييم المؤسسي
          </motion.p>
        </motion.div>

        {/* Form Card with 3D effect */}
        <motion.div
          className="relative"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Card Border Glow */}
          <div className="absolute -inset-[1px] rounded-3xl overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "linear-gradient(0deg, transparent, hsl(var(--primary)/0.4), transparent)",
                  "linear-gradient(90deg, transparent, hsl(var(--primary)/0.4), transparent)",
                  "linear-gradient(180deg, transparent, hsl(var(--primary)/0.4), transparent)",
                  "linear-gradient(270deg, transparent, hsl(var(--primary)/0.4), transparent)",
                  "linear-gradient(360deg, transparent, hsl(var(--primary)/0.4), transparent)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl border border-border/30">
            {/* Traveling Light Beam */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
