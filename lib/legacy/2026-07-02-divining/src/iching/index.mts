// iching — the I Ching domain: the cast structure (six lines, hexagram, King Wen
// number) and its reading (the FOUR-corner SignWitness panel through the core).
//
// The cast (`iching.mts`) is the domain mathematics; the reading (`reading.mts`)
// projects a cast onto a panel of sign-witnesses and reads it through the package's
// one Reading core, exactly as the astrology and divination domains do.

export {
  castIChing,
  THREE_COINS_METHOD,
  type LineValue,
  type LinePolarity,
  type LineKind,
  type CastLine,
  type CastProvenance,
  type Cast,
} from "./iching.mjs";

export {
  buildCastPanel,
  buildPanel,
  read,
} from "./reading.mjs";
