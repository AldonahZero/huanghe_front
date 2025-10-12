import * as React from "react";

export interface AlertProps {
  variant?: "default" | "destructive";
  children: React.ReactNode;
}

export const Alert = ({ variant = "default", children }: AlertProps) => {
  const base = "w-full rounded-md p-3 text-sm";
  const variants: Record<string, string> = {
    default: "bg-blue-50 text-blue-800 border border-blue-100",
    destructive: "bg-red-50 text-red-800 border border-red-100",
  };
  return (
    <div className={`${base} ${variants[variant] || variants.default}`}>
      {children}
    </div>
  );
};

export default Alert;
