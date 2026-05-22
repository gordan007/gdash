import type { ReactNode } from "react";
import { cn } from "../../lib/cn.js";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]",
        className
      )}
    >
      {children}
    </div>
  );
}
