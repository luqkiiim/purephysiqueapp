import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("surface-card", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-display text-xl leading-[1.1] text-slate-900 sm:text-2xl", className)} {...props} />
  );
}

export function CardDescription(
  { className, ...props }: React.HTMLAttributes<HTMLParagraphElement>,
) {
  return (
    <p
      className={cn("mt-2 text-sm leading-6 text-slate-600 sm:text-[0.95rem]", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 pb-4 pt-0 sm:px-6 sm:pb-6 sm:pt-0", className)} {...props} />;
}
