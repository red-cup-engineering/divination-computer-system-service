// astrology-topology-experimental: the ephemeris as memetic settlement.
//
// The classical ephemeris (lib/astrology-topology) computes each body's
// longitude by one theory. This package recomputes the same observables
// through the workspace's relational substrate: independent ephemeris theories
// act as witnesses, each asserting a longitude claim per (body, instant);
// Relating's bilattice charge algebra folds
// their testimony by knowledge-join, carrying contradictions paraconsistently
// as STABLE (⊤) charges; SETTLEMENT selects the representative claim; and
// event times settle as finite closure ordinals of monotone bracket
// refinement, through the MPU's own transfinite iteration machinery.
//
// The conformance law (tested): for every body over a grid of instants,
// |experimental − classical| stays below the classical ephemeris' own stated
// accuracy (EPHEMERIS_PROVENANCE). See the README for an honest account of
// which parts are genuinely memetic and which are classical computation
// admitted as a witness.

export { linearContext, linearSum, type LinearContext } from "./linear.mjs";

export {
  TRUNCATED_LUNAR_LONGITUDE_SERIES,
  TRUNCATED_LUNAR_LATITUDE_SERIES,
  FROZEN_PLANET_ELEMENTS,
  type LunarSeriesTerm,
  type FrozenElements,
  type FrozenPlanetName,
} from "./truncated-data.mjs";

export {
  ANCHOR_THEORY,
  TRUNCATED_THEORY,
  DEFAULT_THEORIES,
  CLASSICAL_ACCURACY_DEGREES,
  TRUNCATED_ACCURACY_DEGREES,
  truncatedMoonLatitude,
  type EphemerisTheory,
} from "./theories.mjs";

export {
  settleBody,
  settledBodyLongitude,
  settledBodySpeed,
  computeSettledChart,
  settlementSheaf,
  circularDistanceDegrees,
  EXPERIMENTAL_PROVENANCE,
  type LongitudeClaim,
  type AdjudicatedClaim,
  type BodySettlement,
  type SettledBodyState,
  type SettledChart,
} from "./settlement.mjs";

export {
  buildBodyPanel,
  readBody,
  readChart,
} from "./reading.mjs";

export {
  settleBracket,
  findSettledZeroCrossings,
  findSettledCircleCrossings,
  findSettledIngresses,
  findSettledStations,
  type Bracket,
  type SettledCrossing,
  type SettledScanOptions,
  type SettledIngressEvent,
  type SettledStationEvent,
} from "./closure-events.mjs";
