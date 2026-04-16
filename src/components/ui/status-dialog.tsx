import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  type: "success" | "error" | "warning";
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
};

const colors = {
  success: "text-green-500 bg-green-500/10",
  error: "text-destructive bg-destructive/10",
  warning: "text-yellow-500 bg-yellow-500/10",
};

export function StatusDialog({ open, onClose, type, title, message, actionLabel, onAction }: StatusDialogProps) {
  const Icon = icons[type];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm text-center p-8 gap-4 [&>button]:hidden" dir="rtl">
        <div className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-full", colors[type])}>
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {message && <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>}
        <div className="flex flex-col gap-2 mt-2">
          {onAction && actionLabel && (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
