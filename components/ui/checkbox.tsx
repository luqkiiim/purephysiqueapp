import * as React from "react";

import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

export function Checkbox({
  className,
  label,
  description,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex min-h-[4.25rem] cursor-pointer items-start gap-3 rounded-[1.3rem] border border-white/15 bg-slate-50 px-4 py-4 transition hover:border-accent-teal/40 sm:rounded-3xl",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 shrink-0 rounded border-white/20 bg-transparent text-accent-teal focus:ring-accent-teal"
        {...props}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        {description ? (
          <span className="mt-1 block text-safe-wrap text-sm leading-5 text-slate-600">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
