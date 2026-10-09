import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { ActionStatus, BrandFilter, DiscardReason, Incident } from "./types";
import { approve, createIncident, discard } from "./logic";

const H = 3600_000;
const seedNow = Date.UTC(2026, 9, 9, 18);
const seed: Incident[] = [
  { ...createIncident("gocase-s24-print", seedNow - 72 * H), id: "INC-7Q1A2", status: "resolved", resolvedAt: seedNow - 72 * H + 11 * 60000, avoidedLoss: 142_000 },
  { ...createIncident("gobeaute-serum-sp", seedNow - 48 * H), id: "INC-7Q8K4", status: "resolved", resolvedAt: seedNow - 48 * H + 7 * 60000, avoidedLoss: 88_500 },
  { ...createIncident("payments-pix-drop", seedNow - 20 * H), id: "INC-7R0D9", status: "discarded", resolvedAt: seedNow - 20 * H + 4 * 60000, avoidedLoss: 0, discardReason: "falso_positivo" },
];

interface State {
  loggedIn: boolean;
  brand: BrandFilter;
  incidents: Incident[];
  selectedId: string | null;
  login: () => void;
  logout: () => void;
  setBrand: (b: BrandFilter) => void;
  inject: (scenarioId: string) => string;
  select: (id: string | null) => void;
  setAction: (incId: string, actionId: string, status: ActionStatus) => void;
  approve: (id: string) => void;
  discard: (id: string, reason: DiscardReason) => void;
  reset: () => void;
}

const update = (list: Incident[], id: string, fn: (i: Incident) => Incident) =>
  list.map((i) => (i.id === id ? fn(i) : i));

export const useSentinel = create<State>()(
  persist(
    (set) => ({
      loggedIn: false,
      brand: "all",
      incidents: seed,
      selectedId: null,
      login: () => set({ loggedIn: true }),
      logout: () => set({ loggedIn: false }),
      setBrand: (brand) => set({ brand }),
      inject: (scenarioId) => {
        const inc = createIncident(scenarioId, Date.now());
        inc.id = `${inc.id}${Math.floor(Math.random() * 90 + 10)}`;
        set((s) => ({ incidents: [inc, ...s.incidents], selectedId: inc.id }));
        return inc.id;
      },
      select: (selectedId) => set({ selectedId }),
      setAction: (incId, actionId, status) =>
        set((s) => ({
          incidents: update(s.incidents, incId, (i) => ({
            ...i,
            actions: i.actions.map((a) => (a.id === actionId ? { ...a, status } : a)),
          })),
        })),
      approve: (id) => set((s) => ({ incidents: update(s.incidents, id, (i) => approve(i, Date.now())) })),
      discard: (id, r) => set((s) => ({ incidents: update(s.incidents, id, (i) => discard(i, r, Date.now())) })),
      reset: () => set({ incidents: seed, selectedId: null }),
    }),
    { name: "sentinel-d2c", skipHydration: true },
  ),
);

export function useHydrateSentinel() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.resolve(useSentinel.persist.rehydrate()).then(() => setReady(true));
  }, []);
  return ready;
}

export function useNow(ms = 400) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}
