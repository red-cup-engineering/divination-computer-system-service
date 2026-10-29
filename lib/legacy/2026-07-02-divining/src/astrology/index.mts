// astrology-topology: the astrology domain as mathematics.
//
// The zodiac circle and its quotients (zodiac), the chart carrier (chart),
// angular relations witnessed within orbs (aspects), the Sun–Moon elongation
// circle (lunation), zero-crossing machinery (events), time scales (time),
// and the ephemeris itself (ephemeris) — time → chart with stated provenance.

export {
  ZODIAC_SIGNS,
  normalizeDegrees,
  signedArc,
  angularSeparation,
  signPlacement,
  type ZodiacSign,
  type ZodiacElement,
  type ZodiacModality,
  type SignPlacement,
} from "./zodiac.mjs";

export {
  BODIES,
  BODY_GLYPHS,
  STATIONARY_BAND,
  motionOf,
  type Body,
  type BodyState,
  type Motion,
  type Chart,
  type ChartProvenance,
} from "./chart.mjs";

export {
  ASPECTS,
  aspectsInChart,
  type Aspect,
  type AspectName,
  type AspectHit,
  type AspectSearchOptions,
} from "./aspects.mjs";

export { LUNAR_PHASES, lunationOf, type Lunation, type LunarPhaseName } from "./lunation.mjs";

export {
  findZeroCrossings,
  findCircleCrossings,
  type Crossing,
  type CrossingDirection,
  type ScanOptions,
} from "./events.mjs";

export {
  J2000,
  julianDayFromIso,
  isoFromJulianDay,
  deltaTSeconds,
  terrestrialJulianDay,
  julianCenturies,
} from "./time.mjs";

export {
  EPHEMERIS_PROVENANCE,
  computeChart,
  bodyLongitude,
  findIngresses,
  findStations,
  findExactAspects,
  findLunationQuarters,
  type IngressEvent,
  type StationEvent,
  type ExactAspectEvent,
  type LunationQuarterEvent,
} from "./ephemeris.mjs";
