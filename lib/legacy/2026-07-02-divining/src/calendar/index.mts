// calendar-topology: calendar mathematics as a carrier.
//
// The day-number line and its civil chart (iso-date), the computus
// (computus), calendrical cycles as quotients (cycles), and feasts as
// date-valued functions of the year (feast).

export {
  WEEKDAYS,
  civilDate,
  parseIsoDate,
  formatIsoDate,
  dayNumberFromCivil,
  civilFromDayNumber,
  dayNumber,
  isoFromDayNumber,
  addDays,
  daysBetween,
  dayOfWeek,
  weekdayOnOrAfter,
  weekdayOnOrBefore,
  weekdayAfter,
  weekdayBefore,
  nthWeekdayOnOrAfter,
  nthWeekdayOnOrBefore,
  type Weekday,
  type CivilDate,
} from "./iso-date.mjs";

export { easterCivil, easterDate } from "./computus.mjs";

export { goldenNumber, dayOfYear, isoWeek, type IsoWeek } from "./cycles.mjs";

export {
  movableFeast,
  fixedFeast,
  feastDate,
  type Feast,
  type MovableFeast,
  type FixedFeast,
} from "./feast.mjs";

export {
  buildDatePanel,
  readDate,
  readSpan,
  type NamedFeast,
} from "./reading.mjs";
