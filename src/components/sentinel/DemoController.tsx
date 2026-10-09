import { useNavigate } from "@tanstack/react-router";
import { FlaskConical, RotateCcw, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BRAND_LABEL, SCENARIOS } from "@/lib/sentinel/scenarios";
import { useSentinel } from "@/lib/sentinel/store";
import { SeverityTag } from "./StatusPill";

export function DemoController() {
  const [open, setOpen] = useState(false);
  const inject = useSentinel((s) => s.inject);
  const reset = useSentinel((s) => s.reset);
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-warning/40 text-warning hover:bg-warning/10 hover:text-warning">
          <FlaskConical className="size-4" /> Demo
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle className="font-mono text-sm uppercase tracking-widest">Demo Controller</SheetTitle>
          <SheetDescription>Injete um cenário de crise para ver os agentes em ação.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                const id = inject(s.id);
                setOpen(false);
                navigate({ to: "/incidentes", search: { id } });
              }}
              className="panel group w-full p-4 text-left transition-colors hover:border-critical/50"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase text-muted-foreground">{BRAND_LABEL[s.brand]}</span>
                <SeverityTag severity={s.severity} />
              </div>
              <div className="text-sm font-medium">{s.title}</div>
              <div className="mt-2 flex items-center gap-1.5 font-mono text-xs text-critical">
                <Zap className="size-3" /> {s.signal}
              </div>
            </button>
          ))}
          <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground" onClick={() => reset()}>
            <RotateCcw className="size-3.5" /> Resetar dados da demo
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
