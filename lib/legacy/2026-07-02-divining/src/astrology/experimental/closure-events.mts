// Event finding as monotone closure: crossings settle as fixed points of
// transfinite iteration over the bracket lattice.
//
// Vocabulary: a BRACKET [low, high] is partial knowledge of a crossing time —
// "the crossing lies in this interval". The bracket carrier ordered by
// REVERSE inclusion (a ≤ b iff b ⊆ a) is the knowledge order: knowledge grows
// as the interval shrinks; join is intersection. The refinement morphism φ
// (one bisection step, identity once the bracket is within tolerance) is
// monotone and inflationary in that order, so its transfinite iteration
//   F(0) = ⊥ (the scan bracket), F(α+1) = φ(F(α)), F(λ) = ⋁_{β<λ} F(β)
// — the MPU's `approx`/`closureOrdinal` machinery, the same fold that drives
// memetic settlement — converges, and the crossing time is the value at the
// closure ordinal κ. Here κ is always finite (the regime is "finite" in the
// MPU's classification): each refinement halves the bracket, so κ ≈
// log₂(width/tolerance). The ordinal notation is the substrate's own, up to
// ε₀; this lattice simply settles early, and the closure result SAYS so.
//
// This is CALM-flavored: bracket knowledge only accumulates (monotone), so
// the crossing claim settles without coordination, and the settled time is
// the least fixed point reached from the scan's witness bracket.

import {
  normalizeDegrees,
  signedArc,
  ZODIAC_SIGNS,
  isoFromJulianDay,
  julianDayFromIso,
  terrestrialJulianDay,
  type Body,
  type ZodiacSign,
  type IngressEvent,
  type StationEvent,
} from "../index.mjs";
import {
  closeOrdinalProcess,
  closureProcess,
  closureStabilizationSearchHorizon,
  finiteOrdinalJudgment,
  type Lattice,
} from "@emsenn/relating";
import { fromCount, toCount } from "@emsenn/relating/writing";
import { settledBodyLongitude, settledBodySpeed } from "./settlement.mjs";
import { DEFAULT_THEORIES, type EphemerisTheory } from "./theories.mjs";

const DEFAULT_TOLERANCE_DAYS = 1 / 86_400; // one second

/** Partial knowledge of a crossing: "the root lies in [low, high]".
 * `lowSign` is the sign of the scanned function at `low`. */
export type Bracket = Readonly<{ low: number; high: number; lowSign: number }>;

/** A crossing settled by monotone closure, carrying its closure ordinal κ. */
export type SettledCrossing = Readonly<{
  julianDay: number;
  direction: "increasing" | "decreasing";
  /** The closure ordinal of the bracket refinement (finite regime). */
  closureOrdinal: number;
}>;

const stabilizingSup = <T,>(eq: (left: T, right: T) => boolean) => (sequence: (n: ReturnType<typeof fromCount>) => T): T => {
  let previous = sequence(fromCount(0));
  for (let index = 1; ; index += 1) {
    const current = sequence(fromCount(index));
    if (eq(current, previous)) return current;
    previous = current;
  }
};

/** The bracket carrier in the knowledge order (reverse inclusion). */
function bracketLattice(initial: Bracket): Lattice<Bracket> {
  const eq = (a: Bracket, b: Bracket): boolean => a.low === b.low && a.high === b.high;
  return {
    bottom: initial,
    eq,
    // b refines a: knowing [b.low, b.high] ⊆ [a.low, a.high] is knowing MORE.
    leq: (a, b) => b.low >= a.low && b.high <= a.high,
    // Join of nested knowledge is the intersection (the tighter bracket).
    join: (a, b) => ({
      low: Math.max(a.low, b.low),
      high: Math.min(a.high, b.high),
      lowSign: a.low >= b.low ? a.lowSign : b.lowSign,
    }),
    sup: stabilizingSup(eq),
  };
}

/** Settle one sign-changing bracket to its crossing by monotone closure. */
export function settleBracket(
  fn: (julianDay: number) => number,
  initial: Bracket,
  toleranceDays: number = DEFAULT_TOLERANCE_DAYS,
): { julianDay: number; closureOrdinal: number } {
  const lattice = bracketLattice(initial);
  const phi = (bracket: Bracket): Bracket => {
    if (bracket.high - bracket.low <= toleranceDays) return bracket; // settled: φ is the identity
    const middle = (bracket.low + bracket.high) / 2;
    const middleValue = fn(middle);
    return Math.sign(middleValue) === bracket.lowSign && middleValue !== 0
      ? { low: middle, high: bracket.high, lowSign: bracket.lowSign }
      : { low: bracket.low, high: middle, lowSign: bracket.lowSign };
  };
  const closure = closeOrdinalProcess(closureProcess(
    lattice,
    phi,
    closureStabilizationSearchHorizon(fromCount(64), fromCount(1)),
  ));
  const finite = finiteOrdinalJudgment(closure.stabilization.kind === "ordinal.closure.stabilization:witness"
    ? closure.stabilization.ordinal
    : closure.stabilization.searchedThrough);
  if (finite.kind !== "ordinal.closure.finiteOrdinal:witness") {
    throw new RangeError("settleBracket: bracket refinement did not settle at a finite ordinal");
  }
  return { julianDay: (closure.value.low + closure.value.high) / 2, closureOrdinal: toCount(finite.value) };
}

export type SettledScanOptions = Readonly<{
  stepDays: number;
  toleranceDays?: number;
}>;

/** Zero crossings of a continuous function: scan for sign-changing brackets
 * (witness accumulation), then settle each by monotone closure. */
export function findSettledZeroCrossings(
  fn: (julianDay: number) => number,
  jdStart: number,
  jdEnd: number,
  options: SettledScanOptions,
): readonly SettledCrossing[] {
  if (!(jdEnd > jdStart)) throw new TypeError("scan interval must have jdEnd > jdStart");
  if (!(options.stepDays > 0)) throw new TypeError("stepDays must be positive");
  const tolerance = options.toleranceDays ?? DEFAULT_TOLERANCE_DAYS;
  const crossings: SettledCrossing[] = [];
  let previousJd = jdStart;
  let previousValue = fn(jdStart);
  for (let jd = jdStart + options.stepDays; ; jd += options.stepDays) {
    const clamped = Math.min(jd, jdEnd);
    const value = fn(clamped);
    if (previousValue !== 0 && Math.sign(value) !== Math.sign(previousValue)) {
      const settled = settleBracket(fn, { low: previousJd, high: clamped, lowSign: Math.sign(previousValue) }, tolerance);
      crossings.push(
        Object.freeze({
          julianDay: settled.julianDay,
          direction: (value > previousValue ? "increasing" : "decreasing") as SettledCrossing["direction"],
          closureOrdinal: settled.closureOrdinal,
        }),
      );
    }
    previousJd = clamped;
    previousValue = value;
    if (clamped >= jdEnd) break;
  }
  return Object.freeze(crossings);
}

/** Crossings of a circular function (degrees on R/360°) through a target. */
export function findSettledCircleCrossings(
  fn: (julianDay: number) => number,
  targetDegrees: number,
  jdStart: number,
  jdEnd: number,
  options: SettledScanOptions,
): readonly SettledCrossing[] {
  const target = normalizeDegrees(targetDegrees);
  const local = (julianDay: number): number => signedArc(target, fn(julianDay));
  // Brackets straddling the antipode are fold artifacts, not crossings.
  return findSettledZeroCrossings(local, jdStart, jdEnd, options).filter(
    (crossing) => Math.abs(local(crossing.julianDay)) < 1,
  );
}

// ── ingresses and stations over the SETTLED longitude ───────────────────────

const EVENT_SCAN_STEP_DAYS: Readonly<Record<Body, number>> = Object.freeze({
  sun: 0.5,
  moon: 0.2,
  mercury: 0.5,
  venus: 0.5,
  mars: 1,
  jupiter: 2,
  saturn: 2,
  uranus: 4,
  neptune: 4,
  pluto: 4,
});

function ttInterval(isoStart: string, isoEnd: string): readonly [number, number] {
  return [terrestrialJulianDay(julianDayFromIso(isoStart)), terrestrialJulianDay(julianDayFromIso(isoEnd))];
}

export type SettledIngressEvent = IngressEvent & Readonly<{ closureOrdinal: number }>;

/** Ingresses of the settled longitude: cusp crossings settled by closure. */
export function findSettledIngresses(
  body: Body,
  isoStart: string,
  isoEnd: string,
  theories: readonly EphemerisTheory[] = DEFAULT_THEORIES,
): readonly SettledIngressEvent[] {
  const [jdStart, jdEnd] = ttInterval(isoStart, isoEnd);
  const fn = (jd: number): number => settledBodyLongitude(body, jd, theories);
  const scan: SettledScanOptions = { stepDays: EVENT_SCAN_STEP_DAYS[body] };
  const events: SettledIngressEvent[] = [];
  for (let cusp = 0; cusp < 360; cusp += 30) {
    for (const crossing of findSettledCircleCrossings(fn, cusp, jdStart, jdEnd, scan)) {
      const enteringIndex = (cusp / 30) % 12;
      const direct = crossing.direction === "increasing";
      const signTo = ZODIAC_SIGNS[direct ? enteringIndex : (enteringIndex + 11) % 12] as ZodiacSign;
      const signFrom = ZODIAC_SIGNS[direct ? (enteringIndex + 11) % 12 : enteringIndex] as ZodiacSign;
      events.push(
        Object.freeze({
          body,
          time: isoFromJulianDay(crossing.julianDay),
          signTo,
          signFrom,
          direction: (direct ? "direct" : "retrograde") as IngressEvent["direction"],
          closureOrdinal: crossing.closureOrdinal,
        }),
      );
    }
  }
  return Object.freeze(events.sort((a, b) => a.time.localeCompare(b.time)));
}

export type SettledStationEvent = StationEvent & Readonly<{ closureOrdinal: number }>;

/** Stations of the settled longitude: speed zero-crossings settled by closure. */
export function findSettledStations(
  body: Body,
  isoStart: string,
  isoEnd: string,
  theories: readonly EphemerisTheory[] = DEFAULT_THEORIES,
): readonly SettledStationEvent[] {
  if (body === "sun" || body === "moon") return Object.freeze([]);
  const [jdStart, jdEnd] = ttInterval(isoStart, isoEnd);
  const crossings = findSettledZeroCrossings(
    (jd) => settledBodySpeed(body, jd, theories),
    jdStart,
    jdEnd,
    { stepDays: EVENT_SCAN_STEP_DAYS[body], toleranceDays: 0.001 },
  );
  return Object.freeze(
    crossings.map((crossing) =>
      Object.freeze({
        body,
        time: isoFromJulianDay(crossing.julianDay),
        stationTo: (crossing.direction === "decreasing" ? "retrograde" : "direct") as StationEvent["stationTo"],
        longitude: settledBodyLongitude(body, crossing.julianDay, theories),
        closureOrdinal: crossing.closureOrdinal,
      }),
    ),
  );
}
