import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-center font-semibold leading-tight whitespace-nowrap transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/25 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-accent-coral text-[#2d2e2d] shadow-soft hover:bg-accent-gold",
        secondary:
          "border border-white/15 bg-slate-50 text-slate-900 hover:border-accent-teal/30 hover:bg-slate-100",
        coral: "bg-slate-50 text-accent-magenta shadow-soft hover:bg-slate-100",
        teal:
          "bg-accent-magenta text-white shadow-[0_14px_32px_rgba(224,5,137,0.28)] hover:bg-accent-magenta/90",
        ghost: "text-slate-700 hover:bg-accent-teal/10 hover:text-slate-900",
      },
      size: {
        sm: "min-h-[2.75rem] px-3.5 py-2 text-sm",
        md: "min-h-[3rem] px-4 py-2.5 text-sm sm:text-base",
        lg: "min-h-[3.25rem] px-5 py-3 text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  ),
);

Button.displayName = "Button";
