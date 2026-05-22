import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn.js";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "secondary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
        variant === "primary" &&
          "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:opacity-90",
        variant === "secondary" &&
          "border border-[var(--border-subtle)] bg-white hover:bg-[var(--bg-muted)]",
        variant === "ghost" && "hover:bg-[var(--bg-muted)]",
        "disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
