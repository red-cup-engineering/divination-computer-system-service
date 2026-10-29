// The zodiac as the circle and its quotients.
//
// Vocabulary: ecliptic longitude lives on the circle R/360°. The twelve signs
// are the quotient of that circle by 30° arcs (the literal quotient map, no
// house coinage); the four elements and three modalities are the further
// quotients Z12 → Z4 and Z12 → Z3 by index residue. A SignPlacement witnesses
// where a longitude lands: the sign, the degree within it, and nothing else.
//
// All longitudes are tropical (measured from the equinox of date) and in
// degrees. Nothing here computes positions; see ephemeris.mts for that.

export type ZodiacElement = "fire" | "earth" | "air" | "water";

export type ZodiacModality = "cardinal" | "fixed" | "mutable";

export type ZodiacSign = Readonly<{
  /** Index on Z12, Aries = 0. */
  index: number;
  name: string;
  glyph: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  /** Classical (pre-1781) ruler; the traditional septenary assignment. */
  rulerClassical: string;
}>;

export type SignPlacement = Readonly<{
  sign: ZodiacSign;
  /** Longitude folded into the sign's arc: [0, 30). */
  degreeInSign: number;
}>;

const ELEMENT_CYCLE: readonly ZodiacElement[] = ["fire", "earth", "air", "water"];
const MODALITY_CYCLE: readonly ZodiacModality[] = ["cardinal", "fixed", "mutable"];

const SIGN_NAMES: readonly (readonly [string, string, string])[] = [
  ["Aries", "♈", "Mars"],
  ["Taurus", "♉", "Venus"],
  ["Gemini", "♊", "Mercury"],
  ["Cancer", "♋", "Moon"],
  ["Leo", "♌", "Sun"],
  ["Virgo", "♍", "Mercury"],
  ["Libra", "♎", "Venus"],
  ["Scorpio", "♏", "Mars"],
  ["Sagittarius", "♐", "Jupiter"],
  ["Capricorn", "♑", "Saturn"],
  ["Aquarius", "♒", "Saturn"],
  ["Pisces", "♓", "Jupiter"],
];

export const ZODIAC_SIGNS: readonly ZodiacSign[] = Object.freeze(
  SIGN_NAMES.map(([name, glyph, rulerClassical], index) =>
    Object.freeze({
      index,
      name,
      glyph,
      element: ELEMENT_CYCLE[index % 4] as ZodiacElement,
      modality: MODALITY_CYCLE[index % 3] as ZodiacModality,
      rulerClassical,
    }),
  ),
);

/** Fold any degree value onto the circle: the representative in [0, 360). */
export function normalizeDegrees(degrees: number): number {
  if (!Number.isFinite(degrees)) throw new TypeError("degrees must be a finite number");
  const folded = degrees % 360;
  return folded < 0 ? folded + 360 : folded;
}

/**
 * The signed shortest arc from `from` to `to`, in (-180, 180]. Positive means
 * `to` lies counterclockwise (zodiacally forward) of `from`.
 */
export function signedArc(from: number, to: number): number {
  const difference = normalizeDegrees(to) - normalizeDegrees(from);
  if (difference > 180) return difference - 360;
  if (difference <= -180) return difference + 360;
  return difference;
}

/** The unsigned shortest arc between two longitudes: [0, 180]. */
export function angularSeparation(a: number, b: number): number {
  return Math.abs(signedArc(a, b));
}

/** The quotient map R/360° → Z12: which sign a longitude falls in, and where. */
export function signPlacement(longitude: number): SignPlacement {
  const folded = normalizeDegrees(longitude);
  const index = Math.floor(folded / 30) % 12;
  return Object.freeze({
    sign: ZODIAC_SIGNS[index] as ZodiacSign,
    degreeInSign: folded - index * 30,
  });
}
