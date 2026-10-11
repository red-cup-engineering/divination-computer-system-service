// Aspects: angular relations on the circle, witnessed within an orb.
//
// Vocabulary: an Aspect names a target separation (the harmonic angle); an
// orb is the tolerance band around it. An AspectHit witnesses that two
// bodies' separation lies within orb of an aspect's angle, and records the
// offset (how far from exact, signed toward growth) and whether the pair is
// applying (separation moving toward exact) or separating — read off the
// bodies' relative speed, not guessed.

import { angularSeparation, signedArc } from "./zodiac.mjs";

export const ASPECTS = Object.freeze(
  (
    [
      ["conjunction", "☌", 0, 8, "major"],
      ["semisextile", "⚺", 30, 2, "minor"],
      ["semisquare", "∠", 45, 2, "minor"],
      ["sextile", "⚹", 60, 6, "major"],
      ["square", "□", 90, 7, "major"],
      ["trine", "△", 120, 8, "major"],
      ["sesquiquadrate", "⚼", 135, 2, "minor"],
      ["quincunx", "⚻", 150, 3, "minor"],
      ["opposition", "☍", 180, 8, "major"],
    ]
  ).map(([name, glyph, angle, orb, rank]) => Object.freeze({ name, glyph, angle, orb, rank })),
);

  

/**
 * Witness every aspect within orb among the given bodies' states. Pairs are
 * unordered; each pair reports at most one aspect (orbs in the default table
 * do not overlap on [0, 180]).
 */
export function aspectsInChart(
  states,
  options = {},
) {
  const searched = options.aspects ?? ASPECTS.filter((aspect) => aspect.rank === "major");
  const bodies = Object.keys(states);
  const hits = [];
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const bodyA = bodies[i];
      const bodyB = bodies[j];
      const stateA = states[bodyA];
      const stateB = states[bodyB];
      const separation = angularSeparation(stateA.longitude, stateB.longitude);
      for (const aspect of searched) {
        const orb = options.orb ?? aspect.orb;
        const offset = separation - aspect.angle;
        if (Math.abs(offset) > orb) continue;
        hits.push(
          Object.freeze({
            bodyA,
            bodyB,
            aspect,
            separation,
            offset,
            // Applying means |offset| is shrinking. At exact (offset 0) any
            // motion grows it: separating.
            phase: separationTrend(stateA, stateB) * Math.sign(offset) < 0 ? "applying" : "separating",
          }),
        );
        break;
      }
    }
  }
  return Object.freeze(hits);
}

/** d(separation)/dt at the instant, degrees/day, from the pair's speeds. */
function separationTrend(stateA, stateB) {
  const arc = signedArc(stateA.longitude, stateB.longitude);
  const relativeSpeed = stateB.speed - stateA.speed;
  // separation = |arc|; d|arc|/dt = sign(arc) * d(arc)/dt.
  return Math.sign(arc || 1) * relativeSpeed;
}
