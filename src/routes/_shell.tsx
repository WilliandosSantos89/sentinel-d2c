import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { History, Inbox, LayoutDashboard, LogOut, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoController } from "@/components/sentinel/DemoController";
import { statusAt } from "@/lib/sentinel/logic";
import { useHydrateSentinel, useNow, useSentinel } from "@/lib/sentinel/store";
import type { BrandFilter } from "@/lib/sentinel/types";

export const Route = createFileRoute("/_shell")({ component: Shell });

const NAV = [
  { to: "/war-room", label: "War Room", icon: LayoutDashboard },
  { to: "/incidentes", label: "Incidentes", icon: Inbox },
  { to: "/historico", label: "Histórico", icon: History },
] as const;

function Shell() {
  const ready = useHydrateSentinel();
  const { loggedIn, brand, setBrand, logout, incidents } = useSentinel();
  const navigate = useNavigate();
  const now = useNow(1000);
  const active = incidents.filter((i) => { const s = statusAt(i, now); return s !== "resolved" && s !== "discarded"; }).length;

  useEffect(() => { if (ready && !loggedIn) navigate({ to: "/" }); }, [ready, loggedIn, navigate]);
  if (!ready || !loggedIn) return <div className="min-h-screen bg-background" />;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r bg-sidebar">
        <div className="flex items-center gap-2 px-5 py-5">
          <ShieldAlert className="size-5 text-primary" />
          <span className="font-semibold tracking-tight">Sentinel</span>
          <span className="font-mono text-[10px] text-muted-foreground">D2C</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
              <Icon className="size-4" /> {label}
              {to === "/incidentes" && active > 0 && <span className="ml-auto rounded bg-critical/15 px-1.5 font-mono text-[11px] text-critical">{active}</span>}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 flex items-center gap-2 px-2 text-xs">
            <span className="size-1.5 rounded-full bg-success" />
            <span className="font-mono text-muted-foreground">agentes online · 3/3</span>
          </div>
          <button onClick={() => { logout(); navigate({ to: "/" }); }} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-6 backdrop-blur">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Marca</span>
          <Select value={brand} onValueChange={(v) => setBrand(v as BrandFilter)}>
            <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as marcas</SelectItem>
              <SelectItem value="gocase">Gocase</SelectItem>
              <SelectItem value="gobeaute">Gobeaute</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-xs text-muted-foreground md:inline">admin@sentinel.io</span>
            <DemoController />
          </div>
        </header>
        <main className="bg-grid flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
}
