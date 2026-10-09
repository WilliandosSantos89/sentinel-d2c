import { describe, expect, it } from "vitest";
import { approve, createIncident, discard, DETECT_MS, INVESTIGATE_MS, statusAt, totalAvoided } from "./logic";

const t0 = 1_000_000;
const ready = t0 + DETECT_MS + INVESTIGATE_MS + 1;

describe("sentinel rules", () => {
  it("cannot approve while agents are still investigating", () => {
    const inc = createIncident("gocase-s24-print", t0);
    expect(statusAt(inc, t0 + DETECT_MS + 10)).toBe("investigating");
    expect(approve(inc, t0 + DETECT_MS + 10).status).toBe("detecting");
  });

  it("approving the full plan adds the scenario loss to Prejuízo Evitado", () => {
    const inc = approve(createIncident("gocase-s24-print", t0), ready);
    expect(inc.status).toBe("resolved");
    expect(totalAvoided([inc])).toBe(184_300);
  });

  it("discarding does not add to Prejuízo Evitado", () => {
    const inc = discard(createIncident("gocase-s24-print", t0), "falso_positivo", ready);
    expect(inc.status).toBe("discarded");
    expect(totalAvoided([inc])).toBe(0);
  });
});
