/**
 * ifa/ifa — the Ifá Opele (divining chain) cast as STRUCTURE ONLY.
 *
 * CULTURAL CONSTRAINT (non-negotiable): Public casting structure attributed to the
 * Yoruba/Ifá tradition; not the initiated oracular corpus.
 *
 * This module encodes ONLY the public, well-documented BINARY CASTING combinatorics
 * of the Opele chain and the public Odu NAMES, attributed to the Yoruba/Ifá tradition.
 * It does NOT fabricate, paraphrase, or include any ese Ifá (verse text),
 * interpretations, prescriptions, or sacred meanings — that is the initiated priestly
 * (Babaláwo) corpus and is not ours to encode. The sign VALENCE here derives ONLY from
 * the structural parity of the cast (concave/"open" vs convex/"closed"), never from any
 * invented meaning.
 *
 * STRUCTURE (public):
 *   - The Opele chain has 8 seed-positions. Each falls either concave (1, "open") or
 *     convex (0, "closed").
 *   - The 8 positions are read as TWO COLUMNS OF 4 (right column then left column). Each
 *     column of 4 marks identifies one of the 16 principal Odu — the column's 4-bit
 *     signature names a single Odu, and a single Odu IS the doubling of that 4-bit column
 *     signature across both columns.
 *   - The compound figure names the two columns as "RightLeft".
 *
 * SEEDING: the cast is reproducible from the query string by a deterministic hash
 * (xmur3 + mulberry32), mirroring `divination/tarot`'s seeded draw. Math.random is never
 * used (it is unavailable). The same query always yields the same cast.
 *
 * SIMPLIFICATION (stated per the doc-comment contract): a real Opele casting is a
 * physical, witnessed throw of a chain of eight seed-pods by a Babaláwo; we model only
 * the public COMBINATORICS — eight independent binary outcomes seeded from the query —
 * and the public column→Odu naming. No casting ritual, order of reading subtleties beyond
 * "right column then left column", or any oracular content is modeled.
 */

/** A single mark of the chain: concave/"open" (1) or convex/"closed" (0). */
export type IfaMark = 0 | 1;

/** The 16 PRINCIPAL Odu — PUBLIC NAMES ONLY, attributed to the Yoruba/Ifá tradition.
 * Indexed by their 4-bit column signature read top→bottom as bits [b0,b1,b2,b3] where the
 * index is b0 + 2·b1 + 4·b2 + 8·b3. These are names only; no meaning is attached. */
export const PRINCIPAL_ODU: readonly string[] = Object.freeze([
  "Ogbe",
  "Ọyẹku",
  "Iwori",
  "Odi",
  "Irosun",
  "Ọwọnrin",
  "Ọbara",
  "Ọkanran",
  "Ogunda",
  "Ọsa",
  "Ika",
  "Oturupọn",
  "Otura",
  "Irete",
  "Ọṣẹ",
  "Ọfun",
]);

/** The number of seed-positions on the Opele chain. */
export const CHAIN_POSITIONS = 8;

/** The number of marks per column (the chain reads as two columns of four). */
export const COLUMN_MARKS = 4;

// — Seeded deterministic cast: xmur3 string hash feeding mulberry32, mirroring
//   `divination/tarot`'s seeded draw. The same query always yields the same cast. —

function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

function mulberry32(state: number): () => number {
  let a = state;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The deterministic cast method, recorded as the cast's provenance. */
export const SEEDED_CAST_METHOD = "xmur3+mulberry32, eight independent binary marks, next uniform < 1/2 ⇒ open(1)";

/** One column of the cast: its four marks (top→bottom), the 4-bit signature, and the
 * principal Odu that signature names (public name only). */
export interface IfaColumn {
  /** The four marks of this column, top to bottom. */
  readonly marks: readonly [IfaMark, IfaMark, IfaMark, IfaMark];
  /** The 4-bit signature: marks[0] + 2·marks[1] + 4·marks[2] + 8·marks[3]. */
  readonly signature: number;
  /** The principal Odu this column's signature names — a PUBLIC NAME only. */
  readonly odu: string;
}

/** A complete Opele cast: the eight chain marks, the right and left columns, and the
 * compound Odu name "RightLeft". Structure only; no oracular content. */
export interface IfaCast {
  readonly kind: "ifa.cast";
  /** The query this cast was seeded from (its provenance). */
  readonly query: string;
  /** The casting method (its provenance). */
  readonly method: string;
  /** The eight chain marks in chain order: positions 0..3 are the right column
   * (read first), positions 4..7 are the left column. */
  readonly marks: readonly IfaMark[];
  /** The right column (read first). */
  readonly right: IfaColumn;
  /** The left column (read second). */
  readonly left: IfaColumn;
  /** The compound Odu name, "RightLeft" — the two columns named together. */
  readonly compound: string;
}

/** The principal Odu named by a 4-bit column signature (a column of four marks read
 * top→bottom). Public name only. */
function oduOfColumn(marks: readonly [IfaMark, IfaMark, IfaMark, IfaMark]): { signature: number; odu: string } {
  const signature = marks[0] + 2 * marks[1] + 4 * marks[2] + 8 * marks[3];
  return { signature, odu: PRINCIPAL_ODU[signature] as string };
}

/**
 * Cast the Opele chain deterministically from a query string. Eight independent binary
 * marks are drawn from the seeded stream (next uniform < 1/2 ⇒ open/1, else closed/0),
 * split into the right column (first four) then the left column (last four), and each
 * column's 4-bit signature names its principal Odu. The compound figure is "RightLeft".
 * The same query always yields the same cast.
 */
export function castOpele(query: string): IfaCast {
  const random = mulberry32(hashSeed(query));
  const marks = Array.from({ length: CHAIN_POSITIONS }, () => (random() < 0.5 ? 1 : 0) as IfaMark);
  const rightMarks = [marks[0], marks[1], marks[2], marks[3]] as [IfaMark, IfaMark, IfaMark, IfaMark];
  const leftMarks = [marks[4], marks[5], marks[6], marks[7]] as [IfaMark, IfaMark, IfaMark, IfaMark];
  const rightOdu = oduOfColumn(rightMarks);
  const leftOdu = oduOfColumn(leftMarks);
  const right: IfaColumn = Object.freeze({ marks: Object.freeze(rightMarks), signature: rightOdu.signature, odu: rightOdu.odu });
  const left: IfaColumn = Object.freeze({ marks: Object.freeze(leftMarks), signature: leftOdu.signature, odu: leftOdu.odu });
  return Object.freeze({
    kind: "ifa.cast" as const,
    query,
    method: SEEDED_CAST_METHOD,
    marks: Object.freeze([...marks]),
    right,
    left,
    compound: `${right.odu}${left.odu}`,
  });
}
