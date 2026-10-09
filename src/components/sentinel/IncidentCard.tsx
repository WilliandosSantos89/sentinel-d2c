import { AnimatePresence, motion } from "framer-motion";
import { Ban, Check, Loader2, Mail, Radar, Search, Ticket, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BRAND_LABEL, getScenario } from "@/lib/sentinel/scenarios";
import { brl, DETECT_MS, INVESTIGATE_MS, statusAt } from "@/lib/sentinel/logic";
import { useNow, useSentinel } from "@/lib/sentinel/store";
import type { ActionType, DiscardReason, Incident } from "@/lib/sentinel/types";
import { SeverityTag, StatusPill } from "./StatusPill";

const ICON: Record<ActionType, typeof Ban> = { bloqueio: Ban, comunicacao: Mail, ticket: Ticket };

function Typed({ text, speed = 12 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => (v >= text.length ? v : v + 2)), speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <>{text.slice(0, n)}{n < text.length && <span className="animate-pulse">▍</span>}</>;
}

function Step({ icon: Icon, label, state }: { icon: typeof Radar; label: string; state: "wait" | "run" | "done" }) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", state === "wait" && "text-muted-foreground/50")}>
      <span className={cn("grid size-6 place-items-center rounded-md border",
        state === "run" && "border-warning/50 text-warning",
        state === "done" && "border-success/40 text-success")}>
        {state === "run" ? <Loader2 className="size-3.5 animate-spin" /> : state === "done" ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
      </span>
      <span className="font-mono uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function IncidentCard({ incident }: { incident: Incident }) {
  const now = useNow(250);
  const s = getScenario(incident.scenarioId);
  const status = statusAt(incident, now);
  const { setAction, approve, discard } = useSentinel();
  const [discardOpen, setDiscardOpen] = useState(false);
  const [reason, setReason] = useState<DiscardReason>("falso_positivo");
  const live = status === "detecting" || status === "investigating";
  const closed = status === "resolved" || status === "discarded";

  const age = now - incident.createdAt;
  const logsShown = status === "detecting" ? 1 : status === "investigating"
    ? Math.min(s.logs.length, 1 + Math.floor(((age - DETECT_MS) / INVESTIGATE_MS) * s.logs.length)) : s.logs.length;
  const stepState = (i: number) => {
    const idx = { detecting: 0, investigating: 1, review: 3, resolved: 3, discarded: 3 }[status];
    return idx > i ? "done" : idx === i ? "run" : "wait";
  };
  const approvedValue = Math.round(s.avoidedLoss * incident.actions.filter((a) => a.status === "aprovada").length / incident.actions.length);

  return (
    <div className={cn("panel overflow-hidden", status === "detecting" && "animate-pulse-critical border-critical/60")}>
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
        <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
        <SeverityTag severity={incident.severity} />
        <span className="font-mono text-[11px] uppercase text-muted-foreground">{BRAND_LABEL[incident.brand]}</span>
        <StatusPill status={status} className="ml-auto" />
      </div>

      <div className="space-y-5 p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{incident.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{s.context}</p>
        </div>

        <div className="flex flex-wrap gap-6">
          <Step icon={Radar} label="Detector" state={stepState(0)} />
          <Step icon={Search} label="Investigador" state={stepState(1)} />
          <Step icon={Wrench} label="Resolutor" state={stepState(2)} />
        </div>

        <div className="rounded-md border bg-background/60 p-3 font-mono text-xs leading-relaxed">
          {s.logs.slice(0, logsShown).map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-muted-foreground">
              <span className="text-muted-foreground/50">{String(i + 1).padStart(2, "0")} </span>{l}
            </motion.div>
          ))}
          {live && <div className="mt-1 text-warning"><Loader2 className="mr-1 inline size-3 animate-spin" />{status === "detecting" ? "Analisando logs…" : "Agentes trabalhando…"}</div>}
        </div>

        <AnimatePresence>
          {!live && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="rounded-md border border-critical/30 bg-critical/5 p-4">
                <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-critical">Causa raiz</div>
                <p className="text-sm"><Typed text={s.rootCause} /></p>
                <div className="mt-2 font-mono text-xs text-muted-foreground">SKU · {s.sku}</div>
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Plano de ação</div>
                  <div className="font-mono text-xs text-success">Prejuízo evitado est. {brl(approvedValue)}</div>
                </div>
                <div className="space-y-2">
                  {incident.actions.map((a) => {
                    const Icon = ICON[a.type];
                    const on = a.status === "aprovada";
                    return (
                      <div key={a.id} className={cn("flex items-center gap-3 rounded-md border p-3 transition-colors", on ? "border-info/30 bg-info/5" : "opacity-60")}>
                        <Icon className={cn("size-4 shrink-0", on ? "text-info" : "text-muted-foreground")} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{a.label}</div>
                          <div className="text-xs text-muted-foreground">{a.description}</div>
                        </div>
                        {!closed ? (
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" aria-label="Aprovar ação" className={cn("size-7", on && "bg-success/15 text-success hover:bg-success/20 hover:text-success")} onClick={() => setAction(incident.id, a.id, "aprovada")}><Check className="size-4" /></Button>
                            <Button size="icon" variant="ghost" aria-label="Rejeitar ação" className={cn("size-7", !on && "bg-critical/15 text-critical hover:bg-critical/20 hover:text-critical")} onClick={() => setAction(incident.id, a.id, "rejeitada")}><X className="size-4" /></Button>
                          </div>
                        ) : (
                          <span className={cn("font-mono text-[11px] uppercase", on ? "text-success" : "text-muted-foreground")}>{a.status}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <details className="group rounded-md border" open={!closed}>
                <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm"><Mail className="size-4 text-muted-foreground" /> Rascunho de e-mail gerado</summary>
                <div className="border-t px-4 py-3">
                  <div className="text-sm font-medium">{s.emailSubject}</div>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-muted-foreground">{s.emailBody}</pre>
                </div>
              </details>

              {status === "review" && (
                <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                  <Button variant="ghost" onClick={() => setDiscardOpen(true)}>Descartar alerta</Button>
                  <Button onClick={() => approve(incident.id)} className="gap-2"><Check className="size-4" /> Aprovar plano</Button>
                </div>
              )}
              {closed && (
                <div className="border-t pt-4 font-mono text-xs text-muted-foreground">
                  {status === "resolved"
                    ? <>Resolvido em {Math.max(1, Math.round((incident.resolvedAt! - incident.createdAt) / 60000))} min · <span className="text-success">{brl(incident.avoidedLoss)} evitados</span></>
                    : <>Arquivado · motivo: {incident.discardReason === "falso_positivo" ? "Falso positivo" : "Risco aceitável"}</>}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar alerta</DialogTitle>
            <DialogDescription>Seu feedback treina os agentes para alertas futuros.</DialogDescription>
          </DialogHeader>
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as DiscardReason)} className="gap-3">
            <Label className="flex items-center gap-3 rounded-md border p-3"><RadioGroupItem value="falso_positivo" /> Falso positivo</Label>
            <Label className="flex items-center gap-3 rounded-md border p-3"><RadioGroupItem value="risco_aceitavel" /> Risco aceitável</Label>
          </RadioGroup>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDiscardOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { discard(incident.id, reason); setDiscardOpen(false); }}>Arquivar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
