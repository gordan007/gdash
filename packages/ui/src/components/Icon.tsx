import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn.js";

type Props = {
  icon: LucideIcon;
  size?: number;
  className?: string;
  label?: string;
};

export function Icon({ icon: Lucide, size = 20, className, label }: Props) {
  return (
    <Lucide
      size={size}
      strokeWidth={1.75}
      className={cn("shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    />
  );
}
