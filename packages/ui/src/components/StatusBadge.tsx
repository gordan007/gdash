import { AlertCircle, CircleCheck, CircleDashed, Loader2 } from "lucide-react";
import type { ConnectorStatus } from "@gdash/core";
import { Icon } from "./Icon.js";
import { cn } from "../lib/cn.js";

const map: Record<
  ConnectorStatus,
  { Icon: typeof CircleCheck; color: string; label: string }
> = {
  ok: { Icon: CircleCheck, color: "text-[var(--status-ok)]", label: "OK" },
  warn: { Icon: AlertCircle, color: "text-[var(--status-warn)]", label: "Warning" },
  error: { Icon: AlertCircle, color: "text-[var(--status-error)]", label: "Error" },
  pending: { Icon: CircleDashed, color: "text-[var(--text-muted)]", label: "Pending" },
  loading: { Icon: Loader2, color: "text-[var(--text-muted)]", label: "Loading" },
};

export function StatusBadge({
  status,
  text,
  className,
}: {
  status: ConnectorStatus;
  text?: string;
  className?: string;
}) {
  const cfg = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Icon
        icon={cfg.Icon}
        size={16}
        className={cn(cfg.color, status === "loading" && "animate-spin")}
      />
      <span>{text ?? cfg.label}</span>
    </span>
  );
}

export function ChecklistStatusIcon({
  status,
}: {
  status: "ok" | "warn" | "pending" | "phase2";
}) {
  const s =
    status === "ok"
      ? "ok"
      : status === "warn"
        ? "warn"
        : "pending";
  return <StatusBadge status={s} />;
}
