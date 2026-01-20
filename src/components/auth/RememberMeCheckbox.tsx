import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function RememberMeCheckbox({ checked, onChange }: RememberMeCheckboxProps) {
  return (
    <motion.label 
      className="flex items-center gap-3 cursor-pointer group select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
            checked 
              ? "bg-primary border-primary" 
              : "bg-secondary/50 border-border/50 group-hover:border-primary/50"
          )}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            initial={false}
            animate={{ 
              scale: checked ? 1 : 0,
              opacity: checked ? 1 : 0
            }}
            transition={{ duration: 0.15 }}
          >
            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        </motion.div>
      </div>
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        تذكرني
      </span>
    </motion.label>
  );
}
