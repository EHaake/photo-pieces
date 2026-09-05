// The pause's lights and approach across its pinned stretch (spec 007):
// progress p in [0, 1] shapes to 0 → 1 → 0 — up over the first RAMP,
// held, down over the last RAMP — each ramp a smoothstep, so nothing
// snaps at either end. Pure, so it has a test; the piece page's script
// feeds it each pause's measured progress.
export const RAMP = 0.28;

export function shape(p: number): number {
  const t = p < RAMP ? p / RAMP : p > 1 - RAMP ? (1 - p) / RAMP : 1;
  return t * t * (3 - 2 * t);
}
