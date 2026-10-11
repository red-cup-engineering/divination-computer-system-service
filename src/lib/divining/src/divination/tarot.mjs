// The tarot as a carrier: a 78-element set with structure, and spreads as
// finite maps from named positions into it.
//
// Vocabulary: the deck is the disjoint union of the 22 major arcana
// (numbered 0–21) and the 56 minors (4 suits × 14 ranks). A Draw pairs a
// card with an orientation. A Spread is a finite map from position names to
// draws, dated, with the provenance of how the cards were drawn — a physical
// shuffle witnessed by a person, or the seeded deterministic shuffle below.
// The seeded draw exists so a daily draw is reproducible from its seed: the
// provenance IS the seed and method, which makes the draw a checkable claim
// rather than an unwitnessed assertion.

const MAJOR_NAMES = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

const SUITS = ["wands", "cups", "swords", "pentacles"];

const RANKS = [
  "ace",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "page",
  "knight",
  "queen",
  "king",
];

function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const TAROT_DECK = Object.freeze([
  ...MAJOR_NAMES.map((name, number) => Object.freeze({ arcana: "major", number, name })),
  ...SUITS.flatMap((suit) =>
    RANKS.map((rank) =>
      Object.freeze({
        arcana: "minor",
        suit,
        rank,
        name: `${titleCase(rank)} of ${titleCase(suit)}`,
      }),
    ),
  ),
]);

// — Seeded deterministic draw: xmur3 string hash feeding mulberry32. —

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

export const SEEDED_DRAW_METHOD = "xmur3+mulberry32 fisher-yates, orientation by next uniform < 1/2";

/**
 * Draw `count` cards without replacement by a seed-determined Fisher–Yates
 * shuffle; each card's orientation comes from the next uniform deviate. The
 * same seed always yields the same draws.
 */
export function drawCards(seed, count) {
  if (!Number.isInteger(count) || count < 1 || count > TAROT_DECK.length) {
    throw new TypeError(`count must be an integer in [1, ${TAROT_DECK.length}]`);
  }
  const random = mulberry32(hashSeed(seed));
  const indices = TAROT_DECK.map((_, index) => index);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = indices[i];
    indices[i] = indices[j];
    indices[j] = swap;
  }
  return Object.freeze(
    indices.slice(0, count).map((cardIndex) =>
      Object.freeze({
        card: TAROT_DECK[cardIndex],
        orientation: (random() < 0.5 ? "upright" : "reversed"),
      }),
    ),
  );
}

/** A dated single-card spread drawn deterministically from a seed. */
export function dailySpread(dateIso, seedSalt = "routine-read") {
  const seed = `${seedSalt}:${dateIso}`;
  const [draw] = drawCards(seed, 1);
  return Object.freeze({
    spread: "single card",
    date: dateIso,
    positions: Object.freeze([
      Object.freeze({
        position: "the day",
        card: (draw).card,
        orientation: (draw).orientation,
      }),
    ]),
    provenance: Object.freeze({ method: SEEDED_DRAW_METHOD, seed }),
  });
}
import { mulberry32 } from "@red-cup-engineering/computer-data-engineering-services-section/randomization";
