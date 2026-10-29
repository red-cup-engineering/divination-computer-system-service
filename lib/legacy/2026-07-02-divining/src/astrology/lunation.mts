// The lunation cycle: the Sun–Moon elongation circle and its eightfold
// quotient.
//
// Vocabulary: elongation is the Moon's longitude minus the Sun's, folded onto
// [0, 360) — the synodic phase angle. The eight named phases are the quotient
// of that circle by 45° arcs centered on the cardinal values (new = 0°,
// first quarter = 90°, full = 180°, last quarter = 270°). The illuminated
// fraction is the standard (1 − cos e)/2 reading of the same angle.

import type { BodyState } from "./chart.mjs";
import { normalizeDegrees } from "./zodiac.mjs";

export type LunarPhaseName =
  | "new moon"
  | "waxing crescent"
  | "first quarter"
  | "waxing gibbous"
  | "full moon"
  | "waning gibbous"
  | "last quarter"
  | "waning crescent";

export const LUNAR_PHASES: readonly LunarPhaseName[] = Object.freeze([
  "new moon",
  "waxing crescent",
  "first quarter",
  "waxing gibbous",
  "full moon",
  "waning gibbous",
  "last quarter",
  "waning crescent",
]);

export type Lunation = Readonly<{
  /** Moon − Sun longitude, degrees in [0, 360). */
  elongation: number;
  phase: LunarPhaseName;
  /** Fraction of the lunar disc illuminated, [0, 1]. */
  illuminatedFraction: number;
  /** Whether elongation is below or above 180°. */
  trend: "waxing" | "waning";
}>;

export function lunationOf(
  states: Readonly<{ sun: Pick<BodyState, "longitude">; moon: Pick<BodyState, "longitude"> }>,
): Lunation {
  const elongation = normalizeDegrees(states.moon.longitude - states.sun.longitude);
  const phaseIndex = Math.floor(normalizeDegrees(elongation + 22.5) / 45) % 8;
  return Object.freeze({
    elongation,
    phase: LUNAR_PHASES[phaseIndex] as LunarPhaseName,
    illuminatedFraction: (1 - Math.cos((elongation * Math.PI) / 180)) / 2,
    trend: elongation < 180 ? "waxing" : "waning",
  });
}
