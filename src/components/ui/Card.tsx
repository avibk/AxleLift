import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-900 ${className}`} {...props}>
      {children}
    </div>
  );
}
