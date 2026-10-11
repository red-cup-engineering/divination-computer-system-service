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

const ELEMENT_CYCLE = ["fire", "earth", "air", "water"];
const MODALITY_CYCLE = ["cardinal", "fixed", "mutable"];

const SIGN_NAMES = [
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

export const ZODIAC_SIGNS = Object.freeze(
  SIGN_NAMES.map(([name, glyph, rulerClassical], index) =>
    Object.freeze({
      index,
      name,
      glyph,
      element: ELEMENT_CYCLE[index % 4],
      modality: MODALITY_CYCLE[index % 3],
      rulerClassical,
    }),
  ),
);

/** Fold any degree value onto the circle: the representative in [0, 360). */
import { normalizeDegrees, signedArc } from "@lenticule-science/astronomy-position-computation-service";
export { normalizeDegrees, signedArc };

/**
 * The signed shortest arc from `from` to `to`, in (-180, 180]. Positive means
 * `to` lies counterclockwise (zodiacally forward) of `from`.
 */
/** The unsigned shortest arc between two longitudes: [0, 180]. */
export function angularSeparation(a, b) {
  return Math.abs(signedArc(a, b));
}

/** The quotient map R/360° → Z12: which sign a longitude falls in, and where. */
export function signPlacement(longitude) {
  const folded = normalizeDegrees(longitude);
  const index = Math.floor(folded / 30) % 12;
  return Object.freeze({
    sign: ZODIAC_SIGNS[index],
    degreeInSign: folded - index * 30,
  });
}
