import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="font-display text-2xl text-slate-900 sm:text-3xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}
