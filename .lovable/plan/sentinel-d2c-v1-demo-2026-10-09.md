# Sentinel D2C — V1 Demo

Frontend-only demo (no backend, no real AI). All "agent" behavior is simulated with timed state transitions; state lives in a Zustand store persisted to localStorage. UI in Portuguese.

## Pages
- `/` — Simulated login (corporate, dark). Any email/password or "Entrar como Admin" → `/war-room`.
- `/war-room` — KPIs (Incidentes Ativos, MTTR Médio, Prejuízo Evitado R$), "Saúde da Operação" chart (normal vs anomalias, Recharts), live active incidents.
- `/incidentes` — Inbox of active incidents; selecting one opens the Agentic Incident Card.
- `/historico` — Resolved/discarded incidents with actions taken and money saved.
- Shared app shell: sidebar nav, topbar with Brand dropdown (Todas / Gocase / Gobeaute) filtering everything, and "Demo Controller" button (sheet) to inject the 3 scenarios. Logout returns to login.

## Agentic pipeline (simulated)
1. Detectando (red pulse) → ~2s → 2. Investigando ("Agentes trabalhando...", streamed monospace log lines, actions locked) → ~3s → 3. Aguardando Ação: root cause revealed, action plan typed out.
- Action plan: per-action approve/reject toggles (Bloqueio / Comunicação / Ticket), email draft preview.
- "Aprovar Plano" → Resolvido, adds estimated loss avoided to KPI, records MTTR.
- "Descartar Alerta" → dialog asks reason (Falso Positivo / Risco Aceitável) → archived, no KPI gain.

## Scenarios
1. Gocase — peeling print on Samsung S24 (pause batch, free-exchange email, eng ticket).
2. Gobeaute — SP DC out of "Sérum X" (reroute to MG DC, update delivery promise).
3. Generic payment — PIX approval −40% (hide PIX, notify gateway). Shown under any brand filter as "Todas".

## Visual direction
Dark command-center (Linear/Palantir), Geist Sans + Geist Mono, semantic red/amber/green/blue tokens only, dense but scannable, framer-motion transitions. Seeded with a few historical resolved incidents so KPIs and chart aren't empty.

## Technical details
- Add deps: zustand, framer-motion, recharts (if missing).
- `src/lib/sentinel/` : types, scenarios mock JSON, store (inject, advance timers, approve, discard, brand filter).
- Routes: `index.tsx` (login), `_app.tsx`-style pathless layout named `_shell` with Outlet + `_shell.war-room.tsx`, `_shell.incidentes.tsx`, `_shell.historico.tsx`; each with own head().
- Timers driven by a client effect that resumes based on timestamps (survives reload).
- Unit tests: approve adds avoided loss; discard does not.
