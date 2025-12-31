import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";
  
  return (
    <div className={cn(
      "flex gap-3 p-3 rounded-xl",
      isUser ? "bg-primary/10 flex-row-reverse" : "bg-muted"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn(
        "flex-1 text-sm leading-relaxed whitespace-pre-wrap",
        isUser ? "text-right" : "text-right"
      )}>
        {content}
      </div>
    </div>
  );
}
