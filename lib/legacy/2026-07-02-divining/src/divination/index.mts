// divination-topology: the divination domain as mathematics.
//
// The tarot deck and spreads (tarot), numerological reduction (numerology),
// and the daily-indicators carrier (indicators) that mounts the astrology
// vocabulary from @emsenn/astrology-topology.

export {
  TAROT_DECK,
  SEEDED_DRAW_METHOD,
  drawCards,
  dailySpread,
  type TarotCard,
  type TarotSuit,
  type TarotRank,
  type Orientation,
  type Draw,
  type DrawProvenance,
  type Spread,
  type SpreadPosition,
} from "./tarot.mjs";

export { MASTER_NUMBERS, reduceDate, type DateReduction, type ReductionKind } from "./numerology.mjs";

export {
  type DailyIndicators,
  type FeaturedMotion,
  type Lection,
  type SynthesizedSignal,
} from "./indicators.mjs";

export {
  buildSpreadPanel,
  buildReductionPanel,
  readSpread,
  readReduction,
} from "./reading.mjs";
