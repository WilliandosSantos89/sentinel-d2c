import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSentinel } from "@/lib/sentinel/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — Sentinel D2C" },
      { name: "description", content: "Acesse o War Room do Sentinel D2C, orquestrador agêntico de incidentes para e-commerce." },
      { property: "og:title", content: "Entrar — Sentinel D2C" },
      { property: "og:description", content: "Agentes de IA que detectam, investigam e resolvem incidentes de e-commerce em minutos." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const login = useSentinel((s) => s.login);
  const [email, setEmail] = useState("");
  const enter = (e?: FormEvent) => {
    e?.preventDefault();
    useSentinel.persist.rehydrate();
    login();
    navigate({ to: "/war-room" });
  };

  return (
    <div className="bg-grid relative grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <ShieldAlert className="size-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">Sentinel</span>
          <span className="font-mono text-xs text-muted-foreground">D2C</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Centro de comando de incidentes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Agentes detectam, investigam e propõem. Você decide.</p>
        <form onSubmit={enter} className="panel mt-8 space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail corporativo</Label>
            <Input id="email" type="email" placeholder="voce@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Senha</Label>
            <Input id="pw" type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">Entrar</Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => enter()}>Entrar como Admin</Button>
        </form>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">Ambiente de demonstração · qualquer credencial é aceita</p>
      </div>
    </div>
  );
}
