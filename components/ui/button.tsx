import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    };

    const sizes: Record<string, string> = {
      default: "px-4 py-2",
      sm: "px-3 py-1.5 text-sm",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex justify-center items-center rounded-md font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed",
          variants[variant] || variants.default,
          sizes[size] || sizes.default,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
