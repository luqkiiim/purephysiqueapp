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
        "flex cursor-pointer items-start gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 transition hover:border-accent-teal/40",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-accent-teal focus:ring-accent-teal"
        {...props}
      />
      <span className="space-y-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        {description ? (
          <span className="block text-sm text-slate-600">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
