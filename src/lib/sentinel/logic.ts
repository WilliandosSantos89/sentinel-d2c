import type { BrandFilter, DiscardReason, Incident, IncidentStatus } from "./types";
import { getScenario } from "./scenarios";

export const DETECT_MS = 2500;
export const INVESTIGATE_MS = 4500;

export function createIncident(scenarioId: string, now: number): Incident {
  const s = getScenario(scenarioId);
  return {
    id: `INC-${Math.floor(now / 1000).toString(36).toUpperCase().slice(-5)}`,
    scenarioId,
    brand: s.brand,
    title: s.title,
    severity: s.severity,
    status: "detecting",
    createdAt: now,
    actions: s.actions.map((a) => ({ ...a, status: "aprovada" })),
    avoidedLoss: s.avoidedLoss,
  };
}

export function statusAt(inc: Incident, now: number): IncidentStatus {
  if (inc.status === "resolved" || inc.status === "discarded") return inc.status;
  const age = now - inc.createdAt;
  if (age < DETECT_MS) return "detecting";
  if (age < DETECT_MS + INVESTIGATE_MS) return "investigating";
  return "review";
}

export function approve(inc: Incident, now: number): Incident {
  if (statusAt(inc, now) !== "review") return inc;
  const approved = inc.actions.filter((a) => a.status === "aprovada").length;
  const ratio = inc.actions.length ? approved / inc.actions.length : 0;
  return { ...inc, status: "resolved", resolvedAt: now, avoidedLoss: Math.round(inc.avoidedLoss * ratio) };
}

export function discard(inc: Incident, reason: DiscardReason, now: number): Incident {
  if (statusAt(inc, now) !== "review") return inc;
  return { ...inc, status: "discarded", resolvedAt: now, discardReason: reason, avoidedLoss: 0 };
}

export function totalAvoided(list: Incident[]) {
  return list.filter((i) => i.status === "resolved").reduce((s, i) => s + i.avoidedLoss, 0);
}

export function mttrMinutes(list: Incident[]) {
  const done = list.filter((i) => i.status === "resolved" && i.resolvedAt);
  if (!done.length) return 0;
  return done.reduce((s, i) => s + (i.resolvedAt! - i.createdAt), 0) / done.length / 60000;
}

export function matchesBrand(inc: Incident, f: BrandFilter) {
  return f === "all" || inc.brand === f || inc.brand === "multi";
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
