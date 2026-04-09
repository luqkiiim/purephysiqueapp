import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-32 w-full rounded-[1.1rem] border border-white/15 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/15 sm:rounded-2xl sm:text-sm",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
