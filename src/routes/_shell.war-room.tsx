import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, ArrowRight, Clock, PiggyBank } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatusPill } from "@/components/sentinel/StatusPill";
import { brl, matchesBrand, mttrMinutes, statusAt, totalAvoided } from "@/lib/sentinel/logic";
import { useNow, useSentinel } from "@/lib/sentinel/store";

export const Route = createFileRoute("/_shell/war-room")({
  head: () => ({
    meta: [
      { title: "War Room — Sentinel D2C" },
      { name: "description", content: "Saúde da operação, incidentes ativos, MTTR e prejuízo evitado em tempo real." },
      { property: "og:title", content: "War Room — Sentinel D2C" },
      { property: "og:description", content: "Painel de comando com KPIs de incidentes e saúde da operação." },
    ],
  }),
  component: WarRoom,
});

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: string; tone: string }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className={`size-4 ${tone}`} />
      </div>
      <div className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
    </div>
  );
}

function WarRoom() {
  const now = useNow(500);
  const { incidents, brand } = useSentinel();
  const list = incidents.filter((i) => matchesBrand(i, brand));
  const active = list.filter((i) => !["resolved", "discarded"].includes(statusAt(i, now)));

  const chart = useMemo(() => {
    const base = brand === "gobeaute" ? 620 : brand === "gocase" ? 880 : 1400;
    return Array.from({ length: 24 }, (_, h) => {
      const normal = Math.round(base * (0.55 + 0.45 * Math.sin(((h - 6) / 24) * Math.PI * 2) ** 2) + ((h * 37) % 60));
      const spike = active.length && h >= 21 ? active.length * base * 0.18 * (h - 20) : 0;
      return { h: `${String(h).padStart(2, "0")}h`, normal, anomalias: Math.round(normal * 0.02 + spike) };
    });
  }, [brand, active.length]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">War Room</h1>
          <p className="text-sm text-muted-foreground">Monitoramento contínuo · 3 agentes ativos</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{new Date(now).toLocaleTimeString("pt-BR")}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi icon={AlertTriangle} label="Incidentes ativos" value={String(active.length)} tone={active.length ? "text-critical" : "text-success"} />
        <Kpi icon={Clock} label="MTTR médio" value={`${mttrMinutes(list).toFixed(1)} min`} tone="text-warning" />
        <Kpi icon={PiggyBank} label="Prejuízo evitado" value={brl(totalAvoided(list))} tone="text-success" />
      </div>

      <div className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Saúde da operação · pedidos/h</span>
          <div className="flex gap-4 font-mono text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-info" />normal</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-critical" />anomalias</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--info)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--info)" stopOpacity={0} /></linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--critical)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--critical)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="h" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="normal" stroke="var(--info)" fill="url(#gN)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="anomalias" stroke="var(--critical)" fill="url(#gA)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Incidentes ativos</span>
          <Link to="/incidentes" className="flex items-center gap-1 text-xs text-primary">Abrir fila <ArrowRight className="size-3" /></Link>
        </div>
        {active.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">Operação estável. Use “Demo” para injetar um cenário de crise.</div>
        ) : active.map((i) => (
          <Link key={i.id} to="/incidentes" search={{ id: i.id }} className="flex items-center gap-4 border-b px-5 py-3 last:border-0 hover:bg-accent/40">
            <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
            <span className="flex-1 truncate text-sm">{i.title}</span>
            <StatusPill status={statusAt(i, now)} />
          </Link>
        ))}
      </div>
    </div>
  );
}
