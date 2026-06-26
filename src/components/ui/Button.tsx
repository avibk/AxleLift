import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  isLoading?: boolean;
  variant?: ButtonVariant;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-violet-500 text-neutral-950 hover:bg-violet-400",
  secondary: "bg-neutral-900 text-neutral-100 border border-neutral-800 hover:bg-neutral-800",
  ghost: "bg-transparent text-neutral-300 hover:bg-neutral-900",
};

export function Button({ children, icon, isLoading = false, variant = "secondary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
