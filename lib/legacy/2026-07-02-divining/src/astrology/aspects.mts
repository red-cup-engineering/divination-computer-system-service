// Aspects: angular relations on the circle, witnessed within an orb.
//
// Vocabulary: an Aspect names a target separation (the harmonic angle); an
// orb is the tolerance band around it. An AspectHit witnesses that two
// bodies' separation lies within orb of an aspect's angle, and records the
// offset (how far from exact, signed toward growth) and whether the pair is
// applying (separation moving toward exact) or separating — read off the
// bodies' relative speed, not guessed.

import type { Body, BodyState } from "./chart.mjs";
import { angularSeparation, signedArc } from "./zodiac.mjs";

export type AspectName =
  | "conjunction"
  | "semisextile"
  | "semisquare"
  | "sextile"
  | "square"
  | "trine"
  | "sesquiquadrate"
  | "quincunx"
  | "opposition";

export type Aspect = Readonly<{
  name: AspectName;
  glyph: string;
  /** The exact separation the aspect names, degrees in [0, 180]. */
  angle: number;
  /** Default orb, degrees. */
  orb: number;
  rank: "major" | "minor";
}>;

export const ASPECTS: readonly Aspect[] = Object.freeze(
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
    ] as const
  ).map(([name, glyph, angle, orb, rank]) => Object.freeze({ name, glyph, angle, orb, rank })),
);

export type AspectHit = Readonly<{
  bodyA: Body;
  bodyB: Body;
  aspect: Aspect;
  /** The pair's separation at the instant, degrees in [0, 180]. */
  separation: number;
  /** separation − aspect.angle: negative inside the angle, positive past it. */
  offset: number;
  /** Whether the separation is moving toward the exact angle. */
  phase: "applying" | "separating";
}>;

export type AspectSearchOptions = Readonly<{
  /** Which aspects to witness; defaults to the majors. */
  aspects?: readonly Aspect[];
  /** Override the orb for every searched aspect. */
  orb?: number;
}>;

/**
 * Witness every aspect within orb among the given bodies' states. Pairs are
 * unordered; each pair reports at most one aspect (orbs in the default table
 * do not overlap on [0, 180]).
 */
export function aspectsInChart(
  states: Readonly<Partial<Record<Body, BodyState>>>,
  options: AspectSearchOptions = {},
): readonly AspectHit[] {
  const searched = options.aspects ?? ASPECTS.filter((aspect) => aspect.rank === "major");
  const bodies = Object.keys(states) as Body[];
  const hits: AspectHit[] = [];
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const bodyA = bodies[i] as Body;
      const bodyB = bodies[j] as Body;
      const stateA = states[bodyA] as BodyState;
      const stateB = states[bodyB] as BodyState;
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
function separationTrend(stateA: BodyState, stateB: BodyState): number {
  const arc = signedArc(stateA.longitude, stateB.longitude);
  const relativeSpeed = stateB.speed - stateA.speed;
  // separation = |arc|; d|arc|/dt = sign(arc) * d(arc)/dt.
  return Math.sign(arc || 1) * relativeSpeed;
}
