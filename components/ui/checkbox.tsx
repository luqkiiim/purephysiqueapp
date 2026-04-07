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
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-3xl border border-white/15 bg-slate-50 px-4 py-4 transition hover:border-accent-coral/40",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-accent-coral focus:ring-accent-coral"
        {...props}
      />
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
      </span>
    </label>
  );
}
