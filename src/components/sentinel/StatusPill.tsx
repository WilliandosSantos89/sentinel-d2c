import { cn } from "@/lib/utils";
import type { IncidentStatus } from "@/lib/sentinel/types";

const MAP: Record<IncidentStatus, { label: string; cls: string; dot: string }> = {
  detecting: { label: "Alerta", cls: "text-critical border-critical/40 bg-critical/10", dot: "bg-critical animate-pulse" },
  investigating: { label: "Agentes trabalhando", cls: "text-warning border-warning/40 bg-warning/10", dot: "bg-warning animate-pulse" },
  review: { label: "Aguardando ação", cls: "text-info border-info/40 bg-info/10", dot: "bg-info" },
  resolved: { label: "Resolvido", cls: "text-success border-success/40 bg-success/10", dot: "bg-success" },
  discarded: { label: "Descartado", cls: "text-muted-foreground border-border bg-muted", dot: "bg-muted-foreground" },
};

export function StatusPill({ status, className }: { status: IncidentStatus; className?: string }) {
  const m = MAP[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide", m.cls, className)}>
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function SeverityTag({ severity }: { severity: "alta" | "media" }) {
  return (
    <span className={cn("font-mono text-[11px] uppercase", severity === "alta" ? "text-critical" : "text-warning")}>
      SEV {severity === "alta" ? "1" : "2"}
    </span>
  );
}
