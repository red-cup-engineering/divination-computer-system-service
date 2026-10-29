// liturgy-topology: liturgical calendars and lectionaries as structure over
// @emsenn/calendar-topology.
//
// The shared vocabulary (vocabulary), the General Roman Calendar's season
// partition and day chart (roman), the Revised Common Lectionary's cycles,
// propers, and daily structure (rcl), the sourced reading tables
// (lectionary-data), and the total lookup (lection).

export {
  observance,
  type RomanSeasonName,
  type Season,
  type ObservanceRank,
  type Observance,
  type SundayCycle,
  type WeekdayCycle,
  type LiturgicalDay,
} from "./vocabulary.mjs";

export {
  ROMAN_MOVABLE_OBSERVANCES,
  ROMAN_FIXED_OBSERVANCES,
  adventStart,
  baptismOfTheLord,
  romanSeasons,
  liturgicalYearOf,
  sundayCycleOf,
  weekdayCycleOf,
  romanDay,
  type MovableObservance,
  type FixedObservance,
} from "./roman.mjs";

export { rclYear, properOfSunday, dailyRelation, type ProperReading, type DailyRelation } from "./rcl.mjs";

export {
  RCL_SUNDAY_ENTRIES,
  RCL_DAILY_ENTRIES,
  RCL_LECTIONARY_ENTRIES,
  type ReadingRole,
  type LectionaryTrack,
  type LectionaryReading,
  type LectionaryEntry,
} from "./lectionary-data.mjs";

export { lectionFor, type LectionaryTradition, type LectionOutcome } from "./lection.mjs";

export { buildLectionPanel, readLections } from "./reading.mjs";
