import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("h-3 w-full rounded-full bg-slate-100", className)}>
      <div
        className="h-3 rounded-full bg-gradient-to-r from-accent-coral via-accent-magenta to-accent-teal transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
