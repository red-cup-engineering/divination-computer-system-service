// The I CHING as a carrier: a cast of six lines, bottom-to-top, each line a value
// in {6,7,8,9}, presenting as a six-bit hexagram with an optional King Wen number.
//
// Vocabulary. A consultation casts SIX lines from the bottom up. Each line is drawn
// in the three-coins distribution: three coins, yin=2/yang=3 per coin, summed —
//   6 = old (changing) yin   (probability 1/8: three tails)
//   7 = young (stable) yang  (probability 3/8)
//   8 = young (stable) yin   (probability 3/8)
//   9 = old (changing) yang  (probability 1/8: three heads)
// A line's POLARITY (for the present hexagram) is yang for {7,9} (a solid line) and
// yin for {6,8} (a broken line). A line CHANGES (is "old") for {6,9}: a changing
// line is the both/transforming corner — present yang becoming yin, or yin becoming
// yang — and the changing lines are exactly where present→future happens.
//
// The present hexagram is the six polarities read as a six-bit figure (bit i = line
// i+1, 1 = yang/solid, 0 = yin/broken, the bottom line being the least significant
// bit). The King Wen number is recovered from a binary→King-Wen table (KING_WEN_BY_BITS).
//
// The draw is DETERMINISTIC: the same query string always yields the same cast. The
// seed IS the query; provenance records the seed and the three-coins method, which
// makes the cast a checkable claim rather than an unwitnessed assertion. There is no
// Math.random here (it is unavailable) — only the seeded xmur3 → mulberry32 stream,
// borrowed verbatim from the tarot domain's seeded draw.

/** One cast line value: 6 old-yin, 7 young-yang, 8 young-yin, 9 old-yang. */

/** A line's present polarity in the hexagram figure. */

/** A line's stability: a "young" line holds; an "old" (changing) line transforms. */

/** One cast line, keyed by its 1..6 position (1 = bottom, 6 = top). */

/** The provenance of a cast: the seed and the method, so the cast is reproducible. */

/** A consultation: six cast lines bottom-to-top, the present hexagram figure, its
 * optional King Wen number, and the cast's provenance. */

  

   

    

const VALUE_POLARITY = Object.freeze({
  6: "yin",
  7: "yang",
  8: "yin",
  9: "yang",
});

const VALUE_KIND = Object.freeze({
  6: "old",
  7: "young",
  8: "young",
  9: "old",
});

// — Seeded deterministic stream: xmur3 string hash feeding mulberry32, borrowed
//   verbatim from the tarot domain so the I Ching cast is reproducible from its seed
//   in exactly the same checkable way; Math.random is never used. —

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

export const THREE_COINS_METHOD =
  "xmur3+mulberry32 three-coins per line (yin=2/yang=3 each coin), six lines bottom-to-top";

/** One coin toss from the seeded stream: 2 (yin face) or 3 (yang face), each 1/2. */
function coin(random) {
  return random() < 0.5 ? 2 : 3;
}

/** Draw one line value in {6,7,8,9} as the sum of three coins (the canonical
 * three-coins distribution: 6 = 1/8, 7 = 3/8, 8 = 3/8, 9 = 1/8). */
function drawLineValue(random) {
  const sum = coin(random) + coin(random) + coin(random);
  return sum;
}

/** Build one cast line from a drawn value at a position. */
function castLine(position, value) {
  const kind = VALUE_KIND[value];
  return Object.freeze({
    position,
    value,
    polarity: VALUE_POLARITY[value],
    kind,
    changing: kind === "old",
  });
}

/**
 * The King Wen sequence indexed by the six-bit present-hexagram figure (LSB = bottom
 * line, 1 = yang/solid). The traditional King Wen order is NOT a simple function of
 * the bits, so this is the explicit lookup table: KING_WEN_BY_BITS[bits] is the King
 * Wen number 1..64 of the hexagram whose figure has those bits. Built once below from
 * BITS_BY_KING_WEN, the per-hexagram bottom-to-top bit patterns (bottom line = bit 0 =
 * LSB, yang = 1) of the 64 hexagrams in King Wen order: index 0 = hexagram 1 ䷀ Qián
 * (all yang, 0b111111), index 1 = hexagram 2 ䷁ Kūn (all yin, 0b000000), … index 63 =
 * hexagram 64 ䷿ Wèi Jì. These are the standard binary encodings of the King Wen
 * sequence.
 *
 * The build below ASSERTS the table is a bijection of {0..63}: every one of the 64
 * figures must receive exactly one King Wen number. If the literals below were ever
 * miswritten (a duplicate or a gap), the assertion throws at module load rather than
 * silently mis-reading a hexagram; and `castIChing` falls back to kingWen 0 (reporting
 * the raw six-bit figure) for any figure the table does not cover.
 */
const BITS_BY_KING_WEN = [
  0b111111, 0b000000, 0b100010, 0b010001, 0b111010, 0b010111, 0b010000, 0b000010,
  0b111011, 0b110111, 0b000111, 0b111000, 0b101111, 0b111101, 0b001000, 0b000100,
  0b100110, 0b011001, 0b000011, 0b110000, 0b101001, 0b100101, 0b100000, 0b000001,
  0b100111, 0b111001, 0b100001, 0b011110, 0b010010, 0b101101, 0b001110, 0b011100,
  0b001111, 0b111100, 0b000101, 0b101000, 0b101011, 0b110101, 0b001010, 0b010100,
  0b110001, 0b100011, 0b111110, 0b011111, 0b000110, 0b011000, 0b010110, 0b011010,
  0b101110, 0b011101, 0b100100, 0b001001, 0b001100, 0b001101, 0b101100, 0b001011,
  0b110110, 0b011011, 0b110010, 0b010011, 0b110100, 0b110011, 0b010101, 0b101010,
];

const KING_WEN_BY_BITS = (() => {
  const table = new Array(64).fill(0);
  BITS_BY_KING_WEN.forEach((bits, index) => {
    table[bits & 0b111111] = index + 1;
  });
  // Bijection guard: the 64 literals must cover every figure exactly once.
  if (table.some((kw) => kw === 0)) {
    throw new Error("iching: KING_WEN_BY_BITS is not a bijection of the 64 six-bit figures");
  }
  return Object.freeze(table);
})();

/** The bottom-to-top glyph figure of a six-bit hexagram (LSB = bottom = first glyph). */
function figureOf(bits) {
  let figure = "";
  for (let i = 0; i < 6; i += 1) {
    figure += (bits >> i) & 1 ? "━" : "╍";
  }
  return figure;
}

/**
 * Cast a consultation deterministically from a query string. The query is the seed;
 * six lines are drawn bottom-to-top from the seeded three-coins stream; the present
 * hexagram figure is the six polarities as a six-bit figure (bit i = line i+1, LSB =
 * bottom, 1 = yang); the King Wen number is recovered from KING_WEN_BY_BITS. The same
 * query always yields the same cast.
 */
export function castIChing(query) {
  const random = mulberry32(hashSeed(query));
  const lines = [];
  let bits = 0;
  for (let position = 1; position <= 6; position += 1) {
    const value = drawLineValue(random);
    const line = castLine(position, value);
    lines.push(line);
    if (line.polarity === "yang") bits |= 1 << (position - 1);
  }
  const changingPositions = lines.filter((line) => line.changing).map((line) => line.position);
  return Object.freeze({
    label: query,
    lines: Object.freeze(lines),
    bits,
    kingWen: KING_WEN_BY_BITS[bits] ?? 0,
    figure: figureOf(bits),
    changingPositions: Object.freeze(changingPositions),
    provenance: Object.freeze({ method: THREE_COINS_METHOD, seed: query }),
  });
}
import { mulberry32 } from "@red-cup-engineering/computer-data-engineering-services-section/randomization";
