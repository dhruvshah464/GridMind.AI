import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    default: "bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] shadow-sm shadow-[var(--primary)]/20",
    outline: "bg-transparent border border-[var(--border)] text-[var(--text-1)] hover:bg-white/[0.03] hover:border-[var(--border-hover)]",
    ghost: "bg-transparent text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-white/[0.03]",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-sm px-6 py-3 gap-2",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
