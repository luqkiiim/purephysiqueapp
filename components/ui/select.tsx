import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-2xl border border-white/15 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/15",
      className,
    )}
    {...props}
  />
));

Select.displayName = "Select";
