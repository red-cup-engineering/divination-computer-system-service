/**
 * geomancy — Western / Arabic ʿilm al-raml ("the science of the sand") as a carrier:
 * the deterministic construction of the geomantic SHIELD (the tableau of sixteen
 * figures) from a query, with the canonical table of the sixteen figures and their
 * traditional valences.
 *
 * Vocabulary. A geomantic FIGURE is four binary rows, each row either ACTIVE (a
 * single dot, an ODD count, traditionally "fire/air" energy) or PASSIVE (two dots,
 * an EVEN count). We encode a row as a bit: 1 = active (single dot, odd), 0 = passive
 * (double dot, even). A figure is therefore a 4-bit signature `[head, neck, body,
 * feet]` read top-to-bottom.
 *
 * The shield is generated mechanically:
 *  - FOUR MOTHERS, each a fresh figure, are cast from the query (historically by
 *    striking the sand sixteen times in four rows of four and taking each row's
 *    parity; here a deterministic per-row parity seeded from the query string).
 *  - FOUR DAUGHTERS are the Mothers TRANSPOSED: Daughter j's row i = Mother i's row j.
 *    (The four Mothers form a 4x4 bit-matrix; the Daughters are its transpose.)
 *  - FOUR NIECES (the first generation of "nephews") are the pairwise row-XOR of the
 *    Mothers and Daughters: Niece1 = M1 ⊕ M2, Niece2 = M3 ⊕ M4, Niece3 = D1 ⊕ D2,
 *    Niece4 = D3 ⊕ D4. (XOR per row: even-parity-of-the-pair ⇒ passive bit 0.)
 *  - The two WITNESSES: Right Witness = Niece1 ⊕ Niece2, Left Witness = Niece3 ⊕ Niece4.
 *  - The JUDGE = Right Witness ⊕ Left Witness.
 *
 * The Witnesses→Judge reduction is precisely a panel→adjudication: two corroborating
 * sub-tableaux (Right/Left) collapse, with the four Mothers, into the single settled
 * verdict (the Judge). The divining core's panel→`read` adjudication mirrors this —
 * see `reading.mts`. (We simplify the classical shield in one place: the historical
 * "Reconciler" — Judge ⊕ first Mother — is NOT computed, since the core's settled
 * Reading already plays the reconciling role.)
 */

/** One row of a figure: ACTIVE (single dot, odd, bit 1) or PASSIVE (double dot, even,
 * bit 0). */

/** A geomantic figure: four rows top-to-bottom `[head, neck, body, feet]`. */

/** A figure's traditional valence: favorable, unfavorable, or neutral/both. A "both"
 * figure (Via, Populus) is read as a HELD reading — stable, told both — rather than a
 * one-way corroboration or refutation. */

/** A named figure of the canonical sixteen, keyed by its 4-bit signature. */

/**
 * The canonical sixteen figures, by their 4-row binary signature `[head, neck, body,
 * feet]` (1 = active/single-dot/odd, 0 = passive/double-dot/even). Valences follow the
 * common Western tradition (Agrippa's planetary attributions); the two perfectly
 * symmetric figures Via and Populus are "neutral"/both — they are read as held.
 */
export const FIGURES = Object.freeze([
  // name              head neck body feet         valence
  { name: "Via", signature: [1, 1, 1, 1], valence: "neutral" }, // the way — all active; change, but read both ways
  { name: "Populus", signature: [0, 0, 0, 0], valence: "neutral" }, // the people — all passive; the crowd, read both ways
  { name: "Cauda Draconis", signature: [1, 1, 1, 0], valence: "unfavorable" }, // dragon's tail — endings, exit
  { name: "Caput Draconis", signature: [0, 1, 1, 1], valence: "favorable" }, // dragon's head — beginnings, threshold
  { name: "Fortuna Major", signature: [0, 0, 1, 1], valence: "favorable" }, // greater fortune — inward strength
  { name: "Fortuna Minor", signature: [1, 1, 0, 0], valence: "favorable" }, // lesser fortune — outward, swift success
  { name: "Acquisitio", signature: [0, 1, 0, 1], valence: "favorable" }, // gain, profit
  { name: "Amissio", signature: [1, 0, 1, 0], valence: "unfavorable" }, // loss
  { name: "Laetitia", signature: [1, 0, 0, 0], valence: "favorable" }, // joy
  { name: "Tristitia", signature: [0, 0, 0, 1], valence: "unfavorable" }, // sorrow
  { name: "Puella", signature: [0, 1, 0, 0], valence: "favorable" }, // the girl — harmony (favorable but fickle)
  { name: "Puer", signature: [1, 1, 0, 1], valence: "unfavorable" }, // the boy — rashness, conflict
  { name: "Albus", signature: [0, 0, 1, 0], valence: "favorable" }, // white — peace, wisdom
  { name: "Rubeus", signature: [0, 1, 1, 0], valence: "unfavorable" }, // red — passion, violence
  { name: "Coniunctio", signature: [1, 0, 0, 1], valence: "neutral" }, // conjunction — meeting; neutral, but here read as a true figure (favorable-leaning omitted; kept neutral)
  { name: "Carcer", signature: [1, 0, 1, 1], valence: "unfavorable" }, // prison — restriction
]);

/** A figure's 4-bit signature packed into 0..15 as `head<<3 | neck<<2 | body<<1 | feet`. */
export function figureKey(figure) {
  return (figure[0] << 3) | (figure[1] << 2) | (figure[2] << 1) | figure[3];
}

const BY_KEY = new Map(
  FIGURES.map((named) => [figureKey(named.signature), named]),
);

/** Name and valence the figure with the given signature (total — all declared requiredteen are covered). */
export function nameFigure(figure) {
  const named = BY_KEY.get(figureKey(figure));
  if (named === undefined) throw new Error(`geomancy: unmapped figure ${JSON.stringify(figure)}`);
  return named;
}

// — Deterministic seeding (mirrors tarot's xmur3+mulberry32; NEVER Math.random). —

function hashSeed(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** The method label, recorded as the cast's provenance — the cast is a checkable claim,
 * not an unwitnessed assertion. */
export const SEEDED_CAST_METHOD =
  "xmur3+mulberry32 per-row parity; row active iff next uniform < 1/2";

/**
 * Cast four Mothers deterministically from the query string. Each Mother is four rows;
 * each row is ACTIVE (1) iff the next uniform deviate is < 1/2 — the seeded analogue of
 * the sixteen sand-strikes' parities. The same query always casts the same Mothers.
 */
export function castMothers(query) {
  const random = mulberry32(hashSeed(`geomancy:${query}`));
  const mother = () =>
    Object.freeze([
      random() < 0.5 ? 1 : 0,
      random() < 0.5 ? 1 : 0,
      random() < 0.5 ? 1 : 0,
      random() < 0.5 ? 1 : 0,
    ]);
  return Object.freeze([mother(), mother(), mother(), mother()]);
}

/** XOR two figures row-by-row (even parity per row ⇒ passive bit 0). */
function xorFigures(left, right) {
  return Object.freeze([
    (left[0] ^ right[0]),
    (left[1] ^ right[1]),
    (left[2] ^ right[2]),
    (left[3] ^ right[3]),
  ]);
}

/** Transpose the four Mothers into the four Daughters: Daughter j's row i = Mother i's
 * row j (the four figures as a 4x4 bit-matrix, transposed). */
function transpose(mothers) {
  const daughter = (j) =>
    Object.freeze([mothers[0][j], mothers[1][j], mothers[2][j], mothers[3][j]]);
  return Object.freeze([daughter(0), daughter(1), daughter(2), daughter(3)]);
}

/** The fully-constructed geomantic shield reduced from a query: the four Mothers, four
 * Daughters, four Nieces, the two Witnesses, and the Judge. */

     

  

  

  

/**
 * Cast and reduce the whole shield deterministically from the query string. The Mothers
 * are seeded from the query; every later figure is a pure XOR/transpose of them, so the
 * entire shield is reproducible from the query alone.
 */
export function castShield(query) {
  const mothers = castMothers(query);
  const daughters = transpose(mothers);
  const nieces = Object.freeze([
    xorFigures(mothers[0], mothers[1]),
    xorFigures(mothers[2], mothers[3]),
    xorFigures(daughters[0], daughters[1]),
    xorFigures(daughters[2], daughters[3]),
  ]);
  const rightWitness = xorFigures(nieces[0], nieces[1]);
  const leftWitness = xorFigures(nieces[2], nieces[3]);
  const judge = xorFigures(rightWitness, leftWitness);
  return Object.freeze({ query, mothers, daughters, nieces, rightWitness, leftWitness, judge });
}
import { mulberry32 } from "@red-cup-engineering/computer-data-engineering-services-section/randomization";
