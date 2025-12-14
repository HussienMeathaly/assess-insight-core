interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const progress = ((current) / total) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-12">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-muted-foreground">تحليل الجاهزية</span>
        <span className="text-sm text-muted-foreground">
          {current} من {total}
        </span>
      </div>
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
