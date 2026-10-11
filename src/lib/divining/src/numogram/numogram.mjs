/**
 * numogram — the CCRU Decimal Labyrinth & the Numogram (numomancy) as a deterministic
 * cast over the ten Zones 0..9, reduced from a query string.
 *
 * THE STRUCTURE (used faithfully):
 *
 *  - Ten ZONES, numbered 0..9. A query lands on ONE zone — its landed zone Z — by
 *    DIGITAL REDUCTION: render the query as a digit string, sum the digits, and reduce
 *    until a single digit 0..9. (Per CCRU numogram convention 9 is kept as 9, never
 *    collapsed back to 0; the reduction floor for nonzero sums is the 1..9 cycle, with
 *    0 reserved for the genuinely empty/void query.)
 *
 *  - SYZYGIES — the twin-pairs summing to 9: 0::9, 1::8, 2::7, 3::6, 4::5. Each zone Z
 *    has its twin 9-Z. The syzygy is an INVOLUTION n ↦ 9-n: applying it twice returns n.
 *    This is the numogram's built-in σ — it echoes the bilattice's σ/conflation
 *    (order-swap) the Reading core already gauges; the landed zone and its twin are a
 *    dual pair exactly as diagnosis and prediction are.
 *
 *  - The GATE of a zone is the digital sum of 0..Z — the triangular number
 *    T(Z) = Z(Z+1)/2 — itself digit-reduced. (In the Decimal Labyrinth each Gate is the
 *    sum of the Zone-current up to that Zone; we read the triangular sum as that current's
 *    cumulative charge, reduced to a single digit.)
 *
 * SIMPLIFICATION (stated plainly, per the doc-comment contract): this is a faithful but
 * SIMPLIFIED numomancy. It realizes the ZONES, the SYZYGIES (twin involution), and the
 * GATES (triangular reduction). The full Time-Circuit currents — the three Lemurian
 * currents (Warp / Cycle / the demonic remainder) that partition the nine non-zero zones,
 * and the Gate-channel/Current decimal labyrinth circuitry — are SUMMARIZED here as the
 * single "outer/odd current" flag (`outerCurrent`): a zone whose landed digit is odd runs
 * the outer current, which the reading reads as the refuting/odd polarity of the twin. The
 * void/whole syzygy (0::9) is the most over-determined cast and is flagged accordingly.
 *
 * THE CAST IS DETERMINISTIC. There is no randomness anywhere (Math.random is unavailable
 * and would be wrong here): the cast is a pure function of the query string. The "seed" is
 * the query itself; the digit string it reduces is derived from the query by a stable
 * digit projection (its own digits if it has any, else a deterministic per-character digit
 * sum) — mirroring how tarot's `dailySpread` seeds its draw from the date string, except a
 * numogram cast needs no shuffle: the reduction IS the cast.
 */

/** A zone of the Decimal Labyrinth: a single digit 0..9. */

/** The ten zones of the numogram, in order. */
export const ZONES = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

/** A numogram cast: the deterministic reduction of a query onto a zone, with its twin
 * (the 9-Z syzygy) and its gate (the digit-reduced triangular sum 0..Z). */

  

    

  

  

/**
 * Project a query string to the digit string the cast reduces. If the query already
 * contains digits, those digits ARE the cast material (their order preserved). Otherwise
 * every character contributes its code point's low decimal digit, so a non-numeric query
 * still casts deterministically. Empty input projects to "0" (the void). This mirrors
 * tarot seeding from a string: a stable, reproducible projection of the query, no entropy.
 */
export function queryDigits(query) {
  const present = query.replace(/\D/g, "");
  if (present.length > 0) return present;
  let acc = "";
  for (let i = 0; i < query.length; i += 1) {
    acc += String(query.charCodeAt(i) % 10);
  }
  return acc.length > 0 ? acc : "0";
}

/** Sum the decimal digits of a string (non-digits ignored). */
function digitSum(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    const d = digits.charCodeAt(i) - 48;
    if (d >= 0 && d <= 9) sum += d;
  }
  return sum;
}

/**
 * Digitally reduce a non-negative integer to a single digit 0..9, recording the orbit.
 * A sum of 0 reduces to 0 (the void). A nonzero multiple of 9 reduces to 9, NOT to 0:
 * the numogram keeps 9 as the maximal zone. (Equivalently: nonzero n ↦ 1 + (n-1) mod 9.)
 */
export function reduceToDigit(n) {
  const orbit = [n];
  let current = n;
  while (current > 9) {
    current = digitSum(String(current));
    orbit.push(current);
  }
  // current is now 0..9; 0 stays 0 (void), 1..9 stay themselves (9 is kept as 9).
  return Object.freeze({ zone: current, orbit: Object.freeze(orbit) });
}

/** The twin (syzygy partner) of a zone: the involution n ↦ 9-n. Applied twice it is the
 * identity — the numogram's built-in σ. */
export const twinOf = (zone) => (9 - zone);

/** The gate of a zone: the digit-reduced triangular number T(Z) = Z(Z+1)/2. */
export function gateOf(zone) {
  return reduceToDigit((zone * (zone + 1)) / 2).zone;
}

/**
 * Cast a query onto the numogram — a pure, deterministic reduction. The query's digit
 * projection is summed and digit-reduced to the landed zone Z; the twin is 9-Z; the gate
 * is the reduced triangular sum of Z. No randomness: the same query always casts the same.
 */
export function castNumogram(query) {
  const digits = queryDigits(query);
  const raw = digitSum(digits);
  const { zone, orbit } = reduceToDigit(raw);
  const twin = twinOf(zone);
  const gate = gateOf(zone);
  return Object.freeze({
    kind: "numogram.cast",
    query,
    digits,
    orbit,
    zone,
    twin,
    gate,
    outerCurrent: zone % 2 === 1,
    voidWhole: zone === 0 || zone === 9,
  });
}
