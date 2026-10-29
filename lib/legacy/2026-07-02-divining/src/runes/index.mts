// runes-topology: the Elder Futhark domain as mathematics.
//
// The 24-rune ordered futhark and its invertibility structure plus the seeded
// deterministic cast (`runes`), and the cast recast as a SignWitness panel read
// through the divining Reading core (`reading`). The futhark is the carrier; a
// cast is a seeded draw; a reading settles one cast to one verdict.

export {
  FUTHARK,
  NON_INVERTIBLE,
  SEEDED_CAST_METHOD,
  DEFAULT_RUNE_COUNT,
  isInvertible,
  drawRunes,
  castRunes,
  type RuneName,
  type Orientation,
  type DrawnRune,
  type DrawProvenance,
  type Cast,
} from "./runes.mjs";

export { buildCastPanel, buildPanel, readCast } from "./reading.mjs";
