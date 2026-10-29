// The Elder Futhark as a carrier: the 24-rune ordered set, and casts as
// seeded draws of N runes, each upright or reversed.
//
// Vocabulary: the futhark is the ordered set of the 24 Elder Futhark runes,
// in their canonical three-ætt order (Fehu … Othala). A DrawnRune pairs a rune
// with an orientation. A Cast is a dated, named draw of N runes from the
// futhark without replacement, with the provenance of HOW the runes were drawn
// — here always the seeded deterministic shuffle below, so a cast is a checkable
// claim reproducible from its seed rather than an unwitnessed assertion.
//
// This mirrors `divination/tarot.mts` exactly: the same xmur3+mulberry32 seeded
// Fisher–Yates draw, the same orientation-by-next-uniform rule, the same
// Cast/provenance shape. The one structural addition the futhark has and the
// tarot does not is INVERTIBILITY: several runes are symmetric under reversal
// (their glyph is its own mirror), so they have no distinct reversed reading and
// always read upright. That set is carried explicitly as NON_INVERTIBLE and the
// draw forces those runes upright.

export type Orientation = "upright" | "reversed";

/** The 24 Elder Futhark runes, in canonical three-ætt order. */
export type RuneName =
  | "Fehu"
  | "Uruz"
  | "Thurisaz"
  | "Ansuz"
  | "Raidho"
  | "Kenaz"
  | "Gebo"
  | "Wunjo"
  | "Hagalaz"
  | "Nauthiz"
  | "Isa"
  | "Jera"
  | "Eihwaz"
  | "Perthro"
  | "Algiz"
  | "Sowilo"
  | "Tiwaz"
  | "Berkano"
  | "Ehwaz"
  | "Mannaz"
  | "Laguz"
  | "Ingwaz"
  | "Dagaz"
  | "Othala";

export type DrawnRune = Readonly<{
  rune: RuneName;
  orientation: Orientation;
}>;

export type DrawProvenance = Readonly<{
  method: string;
  /** The seed for deterministic methods; absent for physical casts. */
  seed?: string;
}>;

export type Cast = Readonly<{
  /** The cast's name (e.g. "three rune", "Norn"). */
  cast: string;
  /** A label for the cast's instant — the query string it was seeded from. */
  date: string;
  drawn: readonly DrawnRune[];
  provenance: DrawProvenance;
}>;

/** The futhark in its canonical three-ætt order: Freyr's ætt, Heimdall's ætt, Tyr's ætt. */
export const FUTHARK: readonly RuneName[] = Object.freeze([
  // Freyr's ætt
  "Fehu",
  "Uruz",
  "Thurisaz",
  "Ansuz",
  "Raidho",
  "Kenaz",
  "Gebo",
  "Wunjo",
  // Heimdall's ætt
  "Hagalaz",
  "Nauthiz",
  "Isa",
  "Jera",
  "Eihwaz",
  "Perthro",
  "Algiz",
  "Sowilo",
  // Tyr's ætt
  "Tiwaz",
  "Berkano",
  "Ehwaz",
  "Mannaz",
  "Laguz",
  "Ingwaz",
  "Dagaz",
  "Othala",
]);

/**
 * The non-invertible runes: those whose glyph is symmetric under reversal and so
 * have no distinct reversed reading. By the documented structure these are
 * Gebo, Hagalaz, Isa, Jera, Eihwaz, Sowilo, Ingwaz, Dagaz, and Othala — runes
 * whose stave is its own mirror image. A non-invertible rune ALWAYS reads
 * upright; the draw forces this.
 *
 * SIMPLIFICATION/judgment: the prompt left Nauthiz's invertibility open ("Nauthiz?").
 * The historical Younger/Elder stave for Nauthiz (a single bind crossed by one
 * short branch) is NOT vertically symmetric, so it admits a distinct reversed
 * reading; it is therefore treated as INVERTIBLE here and omitted from this set.
 * Othala (its diamond-and-legs stave being mirror-symmetric) is included.
 */
export const NON_INVERTIBLE: ReadonlySet<RuneName> = Object.freeze(
  new Set<RuneName>(["Gebo", "Hagalaz", "Isa", "Jera", "Eihwaz", "Sowilo", "Ingwaz", "Dagaz", "Othala"]),
) as ReadonlySet<RuneName>;

/** Whether a rune admits a distinct reversed reading. */
export function isInvertible(rune: RuneName): boolean {
  return !NON_INVERTIBLE.has(rune);
}

// — Seeded deterministic draw: xmur3 string hash feeding mulberry32. —
// (Identical to divination/tarot's seeded draw, so a cast is reproducible.)

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

export const SEEDED_CAST_METHOD =
  "xmur3+mulberry32 fisher-yates over the futhark, orientation by next uniform < 1/2 (non-invertible runes forced upright)";

/** The default number of runes drawn in a cast — the Norn three-rune spread. */
export const DEFAULT_RUNE_COUNT = 3;

/**
 * Draw `count` runes without replacement from the futhark by a seed-determined
 * Fisher–Yates shuffle; each invertible rune's orientation comes from the next
 * uniform deviate, while a non-invertible rune is forced upright (and still
 * consumes one deviate, so the stream stays aligned regardless of which runes
 * land). The same seed always yields the same cast.
 */
export function drawRunes(seed: string, count: number = DEFAULT_RUNE_COUNT): readonly DrawnRune[] {
  if (!Number.isInteger(count) || count < 1 || count > FUTHARK.length) {
    throw new TypeError(`count must be an integer in [1, ${FUTHARK.length}]`);
  }
  const random = mulberry32(hashSeed(seed));
  const indices = FUTHARK.map((_, index) => index);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = indices[i] as number;
    indices[i] = indices[j] as number;
    indices[j] = swap;
  }
  return Object.freeze(
    indices.slice(0, count).map((runeIndex) => {
      const rune = FUTHARK[runeIndex] as RuneName;
      const deviate = random();
      const orientation: Orientation = isInvertible(rune) && deviate < 0.5 ? "reversed" : "upright";
      return Object.freeze({ rune, orientation });
    }),
  );
}

/**
 * Cast `count` runes deterministically from a query string. The query IS the
 * seed (salted), so the same question always yields the same cast — the cast is
 * a checkable claim, its provenance the seed and method.
 */
export function castRunes(query: string, count: number = DEFAULT_RUNE_COUNT, seedSalt = "rune-cast"): Cast {
  const seed = `${seedSalt}:${query}`;
  const drawn = drawRunes(seed, count);
  const castName =
    count === 1 ? "single rune" : count === 3 ? "Norn (three rune)" : `${count} rune`;
  return Object.freeze({
    cast: castName,
    date: query,
    drawn,
    provenance: Object.freeze({ method: SEEDED_CAST_METHOD, seed }),
  });
}
