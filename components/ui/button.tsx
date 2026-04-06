import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/20 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-slate-900 text-white shadow-soft hover:bg-slate-800",
        secondary: "border border-slate-200 bg-white text-slate-900 hover:bg-sand-50",
        coral: "bg-accent-coral text-white shadow-soft hover:brightness-95",
        teal: "bg-accent-teal text-white shadow-soft hover:brightness-95",
        ghost: "text-slate-800 hover:bg-white/70",
      },
      size: {
        sm: "px-3.5 py-2 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-5 py-3 text-base",
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
