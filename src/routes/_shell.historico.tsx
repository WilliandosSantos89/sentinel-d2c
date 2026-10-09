import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusPill } from "@/components/sentinel/StatusPill";
import { brl, matchesBrand, totalAvoided } from "@/lib/sentinel/logic";
import { BRAND_LABEL } from "@/lib/sentinel/scenarios";
import { useSentinel } from "@/lib/sentinel/store";

export const Route = createFileRoute("/_shell/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de Resoluções — Sentinel D2C" },
      { name: "description", content: "Registro de incidentes resolvidos, ações aprovadas e impacto financeiro salvo." },
      { property: "og:title", content: "Histórico de Resoluções — Sentinel D2C" },
      { property: "og:description", content: "Ações tomadas e prejuízo evitado por incidente." },
    ],
  }),
  component: History,
});

function History() {
  const { incidents, brand } = useSentinel();
  const done = incidents
    .filter((i) => matchesBrand(i, brand) && (i.status === "resolved" || i.status === "discarded"))
    .sort((a, b) => (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Histórico</h1>
        <div className="text-right">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Total evitado</div>
          <div className="text-xl font-semibold text-success tabular-nums">{brl(totalAvoided(done))}</div>
        </div>
      </div>
      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>{["ID", "Incidente", "Marca", "Ações aprovadas", "Tempo", "Status", "Impacto"].map((h) => <th key={h} className="px-4 py-3 text-left font-normal">{h}</th>)}</tr>
          </thead>
          <tbody>
            {done.map((i) => (
              <tr key={i.id} className="border-b last:border-0 hover:bg-accent/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground"><Link to="/incidentes" search={{ id: i.id }}>{i.id}</Link></td>
                <td className="px-4 py-3">{i.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{BRAND_LABEL[i.brand]}</td>
                <td className="px-4 py-3 font-mono text-xs">{i.status === "resolved" ? `${i.actions.filter((a) => a.status === "aprovada").length}/${i.actions.length}` : "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{Math.max(1, Math.round(((i.resolvedAt ?? i.createdAt) - i.createdAt) / 60000))} min</td>
                <td className="px-4 py-3"><StatusPill status={i.status} /></td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums">{i.status === "resolved" ? <span className="text-success">{brl(i.avoidedLoss)}</span> : <span className="text-muted-foreground">{i.discardReason === "falso_positivo" ? "Falso positivo" : "Risco aceitável"}</span>}</td>
              </tr>
            ))}
            {done.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Nenhuma resolução ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
