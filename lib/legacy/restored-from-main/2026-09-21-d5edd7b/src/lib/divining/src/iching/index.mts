// iching -- the I Ching domain: the cast structure (six lines, hexagram, King
// Wen number). Ported into Divination without the settling-core reading layer.

export {
  castIChing,
  THREE_COINS_METHOD,
  type LineValue,
  type LinePolarity,
  type LineKind,
  type CastLine,
  type CastProvenance,
  type Cast,
} from "./iching.mts";
export * from "./reading.mts";
