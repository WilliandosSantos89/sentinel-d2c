export type Brand = "gocase" | "gobeaute" | "multi";
export type BrandFilter = "all" | "gocase" | "gobeaute";
export type Severity = "alta" | "media";
export type IncidentStatus = "detecting" | "investigating" | "review" | "resolved" | "discarded";
export type ActionType = "bloqueio" | "comunicacao" | "ticket";
export type ActionStatus = "pendente" | "aprovada" | "rejeitada";
export type DiscardReason = "falso_positivo" | "risco_aceitavel";

export interface ActionItem {
  id: string;
  type: ActionType;
  label: string;
  description: string;
  status: ActionStatus;
}

export interface Scenario {
  id: string;
  brand: Brand;
  title: string;
  severity: Severity;
  signal: string;
  context: string;
  rootCause: string;
  sku: string;
  logs: string[];
  actions: Omit<ActionItem, "status">[];
  emailSubject: string;
  emailBody: string;
  avoidedLoss: number;
}

export interface Incident {
  id: string;
  scenarioId: string;
  brand: Brand;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  createdAt: number;
  resolvedAt?: number;
  actions: ActionItem[];
  avoidedLoss: number;
  discardReason?: DiscardReason;
}
