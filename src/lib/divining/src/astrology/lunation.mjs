// The lunation cycle: the Sun–Moon elongation circle and its eightfold
// quotient.
//
// Vocabulary: elongation is the Moon's longitude minus the Sun's, folded onto
// [0, 360) — the synodic phase angle. The eight named phases are the quotient
// of that circle by 45° arcs centered on the cardinal values (new = 0°,
// first quarter = 90°, full = 180°, last quarter = 270°). The illuminated
// fraction is the standard (1 − cos e)/2 reading of the same angle.

import { normalizeDegrees } from "./zodiac.mjs";

export const LUNAR_PHASES = Object.freeze([
  "new moon",
  "waxing crescent",
  "first quarter",
  "waxing gibbous",
  "full moon",
  "waning gibbous",
  "last quarter",
  "waning crescent",
]);

  

  

export function lunationOf(
  states,
) {
  const elongation = normalizeDegrees(states.moon.longitude - states.sun.longitude);
  const phaseIndex = Math.floor(normalizeDegrees(elongation + 22.5) / 45) % 8;
  return Object.freeze({
    elongation,
    phase: LUNAR_PHASES[phaseIndex],
    illuminatedFraction: (1 - Math.cos((elongation * Math.PI) / 180)) / 2,
    trend: elongation < 180 ? "waxing" : "waning",
  });
}
