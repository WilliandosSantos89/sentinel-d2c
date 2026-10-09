import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { IncidentCard } from "@/components/sentinel/IncidentCard";
import { SeverityTag, StatusPill } from "@/components/sentinel/StatusPill";
import { cn } from "@/lib/utils";
import { matchesBrand, statusAt } from "@/lib/sentinel/logic";
import { BRAND_LABEL } from "@/lib/sentinel/scenarios";
import { useNow, useSentinel } from "@/lib/sentinel/store";

export const Route = createFileRoute("/_shell/incidentes")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => (typeof s.id === "string" ? { id: s.id } : {}),
  head: () => ({
    meta: [
      { title: "Fila de Incidentes — Sentinel D2C" },
      { name: "description", content: "Anomalias ativas investigadas pelos agentes, aguardando sua aprovação." },
      { property: "og:title", content: "Fila de Incidentes — Sentinel D2C" },
      { property: "og:description", content: "Revise causas raiz e aprove planos de ação sugeridos pela IA." },
    ],
  }),
  component: Incidents,
});

function Incidents() {
  const { id } = Route.useSearch();
  const now = useNow(500);
  const { incidents, brand } = useSentinel();
  const active = incidents.filter((i) => matchesBrand(i, brand) && !["resolved", "discarded"].includes(statusAt(i, now)));
  const selected = incidents.find((i) => i.id === id) ?? active[0];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Incidentes</h1>
        <div className="panel overflow-hidden">
          {active.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-muted-foreground">
              <Inbox className="size-5" /> Nenhum incidente ativo.
            </div>
          )}
          {active.map((i) => (
            <Link key={i.id} to="/incidentes" search={{ id: i.id }}
              className={cn("block border-b px-4 py-3 last:border-0 hover:bg-accent/40", selected?.id === i.id && "bg-accent/60")}>
              <div className="mb-1 flex items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground">{i.id}</span>
                <SeverityTag severity={i.severity} />
                <span className="ml-auto font-mono text-[10px] uppercase text-muted-foreground">{BRAND_LABEL[i.brand]}</span>
              </div>
              <div className="mb-2 text-sm leading-snug">{i.title}</div>
              <StatusPill status={statusAt(i, now)} />
            </Link>
          ))}
        </div>
      </div>
      <div className="lg:pt-11">
        {selected ? <IncidentCard key={selected.id} incident={selected} /> : (
          <div className="panel px-6 py-16 text-center text-sm text-muted-foreground">Selecione um incidente ou injete um cenário pelo botão “Demo”.</div>
        )}
      </div>
    </div>
  );
}
