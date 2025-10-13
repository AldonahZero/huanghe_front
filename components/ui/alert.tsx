import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-blue-50 text-blue-800 border border-blue-100",
      destructive: "bg-red-50 text-red-800 border border-red-100",
      success: "bg-green-50 text-green-800 border border-green-100",
    };
    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-md p-3 text-sm",
          variants[variant] || variants.default,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Alert.displayName = "Alert";

export default Alert;
