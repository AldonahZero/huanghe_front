import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
  children?: React.ReactNode;
};

export function Select({ className = "", children, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      className={`w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    >
      {children}
    </select>
  );
}

export default Select;
