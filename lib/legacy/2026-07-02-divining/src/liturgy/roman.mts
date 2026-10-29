// The General Roman Calendar as structure over the day line.
//
// Vocabulary: a liturgical year is named by the calendar year in which its
// First Sunday of Advent falls (the "advent year"); it runs from that Sunday
// to the eve of the next one. The seven seasons partition it exactly:
//
//   advent           Advent 1 (the Sunday on or before Dec 3, i.e. the 4th
//                    Sunday before Christmas) … Dec 24
//   christmas        Dec 25 … Baptism of the Lord (the Sunday strictly after
//                    Epiphany, Jan 6 — the universal, untransferred calendar)
//   ordinary-time-i  day after Baptism … Shrove Tuesday (Easter − 47)
//   lent             Ash Wednesday (Easter − 46) … Wednesday of Holy Week
//                    (Easter − 4)
//   triduum          Holy Thursday (Easter − 3) … Holy Saturday (Easter − 1)
//   easter           Easter … Pentecost (Easter + 49)
//   ordinary-time-ii Easter + 50 … eve of the next Advent
//
// Day-granularity simplifications, stated rather than hidden: Lent formally
// ends at the evening Mass on Holy Thursday and the Triduum closes with
// Easter Sunday's evening prayer; a partition of whole days cannot witness
// either boundary, so Holy Thursday through Holy Saturday are read as
// triduum and Easter Sunday opens the easter season.
//
// Morphisms: `romanSeasons` is the partition; `liturgicalYearOf` the
// projection date → advent year; `romanDay` the full chart date →
// LiturgicalDay. Week numbering follows the General Roman Calendar: Ordinary
// Time after Pentecost is numbered backward from Christ the King, the
// 34th and last Sunday — so an early-Easter year silently omits the weeks
// the calendar omits.
//
// The cycles: the Sunday cycle is A/B/C by advent year mod 3 (advent year
// divisible by 3 → Year A; anchors: Advent 2016 and Advent 2025 both began
// Year A). The weekday cycle is I in liturgical years that end in an odd
// calendar year, II in even ones.

import {
  addDays,
  civilDate,
  dayNumber,
  dayOfWeek,
  easterDate,
  feastDate,
  fixedFeast,
  formatIsoDate,
  movableFeast,
  parseIsoDate,
  weekdayAfter,
  weekdayOnOrBefore,
  type FixedFeast,
  type MovableFeast,
} from "../calendar/index.mjs";

import {
  observance,
  type LiturgicalDay,
  type Observance,
  type ObservanceRank,
  type RomanSeasonName,
  type Season,
  type SundayCycle,
  type WeekdayCycle,
} from "./vocabulary.mjs";

export type MovableObservance = Readonly<{
  name: string;
  rank: ObservanceRank;
  feast: MovableFeast;
}>;

export type FixedObservance = Readonly<{
  name: string;
  rank: ObservanceRank;
  feast: FixedFeast;
}>;

/** The major movable days of the General Roman Calendar, as offsets from Easter. */
export const ROMAN_MOVABLE_OBSERVANCES: readonly MovableObservance[] = Object.freeze(
  (
    [
      ["Ash Wednesday", "privileged", -46],
      ["Palm Sunday of the Passion of the Lord", "privileged", -7],
      ["Easter Sunday of the Resurrection of the Lord", "solemnity", 0],
      ["Ascension of the Lord", "solemnity", 39],
      ["Pentecost", "solemnity", 49],
      ["The Most Holy Trinity", "solemnity", 56],
      ["The Most Holy Body and Blood of Christ", "solemnity", 60],
    ] as const
  ).map(([name, rank, offsetDays]) =>
    Object.freeze({ name, rank, feast: movableFeast(offsetDays) }),
  ),
);

/** The principal fixed solemnities of the General Roman Calendar. */
export const ROMAN_FIXED_OBSERVANCES: readonly FixedObservance[] = Object.freeze(
  (
    [
      ["Mary, the Holy Mother of God", 1, 1],
      ["Epiphany of the Lord", 1, 6],
      ["Saint Joseph, Spouse of the Blessed Virgin Mary", 3, 19],
      ["Annunciation of the Lord", 3, 25],
      ["Nativity of Saint John the Baptist", 6, 24],
      ["Saints Peter and Paul, Apostles", 6, 29],
      ["Assumption of the Blessed Virgin Mary", 8, 15],
      ["All Saints", 11, 1],
      ["Immaculate Conception of the Blessed Virgin Mary", 12, 8],
      ["Nativity of the Lord", 12, 25],
    ] as const
  ).map(([name, month, day]) =>
    Object.freeze({ name, rank: "solemnity" as ObservanceRank, feast: fixedFeast(month, day) }),
  ),
);

/** First Sunday of Advent of the given calendar year: the Sunday on or before Dec 3. */
export function adventStart(adventYear: number): string {
  if (!Number.isInteger(adventYear)) throw new TypeError("adventYear must be an integer");
  return weekdayOnOrBefore(formatIsoDate(civilDate(adventYear, 12, 3)), "sunday");
}

/** Baptism of the Lord closing the Christmas season: the Sunday strictly after Jan 6. */
export function baptismOfTheLord(adventYear: number): string {
  return weekdayAfter(formatIsoDate(civilDate(adventYear + 1, 1, 6)), "sunday");
}

function season(name: RomanSeasonName, start: string, end: string): Season {
  return Object.freeze({ name, start, end });
}

/** The seven-season partition of the liturgical year that begins at Advent of `adventYear`. */
export function romanSeasons(adventYear: number): readonly Season[] {
  const advent1 = adventStart(adventYear);
  const year = adventYear + 1;
  const christmas = formatIsoDate(civilDate(adventYear, 12, 25));
  const baptism = baptismOfTheLord(adventYear);
  const easter = easterDate(year);
  const nextAdvent = adventStart(year);
  return Object.freeze([
    season("advent", advent1, formatIsoDate(civilDate(adventYear, 12, 24))),
    season("christmas", christmas, baptism),
    season("ordinary-time-i", addDays(baptism, 1), addDays(easter, -47)),
    season("lent", addDays(easter, -46), addDays(easter, -4)),
    season("triduum", addDays(easter, -3), addDays(easter, -1)),
    season("easter", easter, addDays(easter, 49)),
    season("ordinary-time-ii", addDays(easter, 50), addDays(nextAdvent, -1)),
  ]);
}

/** The projection date → advent year of the liturgical year containing it. */
export function liturgicalYearOf(iso: string): number {
  const civilYear = parseIsoDate(iso).year;
  return dayNumber(iso) >= dayNumber(adventStart(civilYear)) ? civilYear : civilYear - 1;
}

/** Advent year → Sunday cycle. Years divisible by 3 begin Year A (anchors: Advent 2016, Advent 2025). */
export function sundayCycleOf(adventYear: number): SundayCycle {
  if (!Number.isInteger(adventYear)) throw new TypeError("adventYear must be an integer");
  const residue = ((adventYear % 3) + 3) % 3;
  return (["A", "B", "C"] as const)[residue] as SundayCycle;
}

/** Advent year → Roman weekday cycle: I when the ending calendar year is odd, II when even. */
export function weekdayCycleOf(adventYear: number): WeekdayCycle {
  if (!Number.isInteger(adventYear)) throw new TypeError("adventYear must be an integer");
  return (adventYear + 1) % 2 === 0 ? "II" : "I";
}

function weekOf(seasonName: RomanSeasonName, iso: string, context: Readonly<{
  advent1: string;
  christmas: string;
  baptism: string;
  easter: string;
  nextAdvent: string;
}>): number {
  const d = dayNumber(iso);
  switch (seasonName) {
    case "advent":
      return Math.floor((d - dayNumber(context.advent1)) / 7) + 1;
    case "christmas":
      return Math.floor((d - dayNumber(context.christmas)) / 7) + 1;
    case "ordinary-time-i": {
      // Ordinary Time week 1 begins the Monday after the Baptism of the Lord;
      // the following Sunday is the 2nd Sunday in Ordinary Time.
      const start = dayNumber(addDays(context.baptism, 1));
      const sunday = dayNumber(weekdayOnOrBefore(iso, "sunday"));
      return sunday < start ? 1 : 2 + (sunday - (start + 6)) / 7;
    }
    case "lent": {
      // Days from Ash Wednesday to the eve of Lent 1 carry week 0.
      const lent1 = dayNumber(addDays(context.easter, -42));
      const sunday = dayNumber(weekdayOnOrBefore(iso, "sunday"));
      return sunday < lent1 ? 0 : 1 + (sunday - lent1) / 7;
    }
    case "triduum":
      return 1;
    case "easter":
      return Math.floor((d - dayNumber(context.easter)) / 7) + 1;
    case "ordinary-time-ii": {
      // Numbered backward from Christ the King, the Sunday of week 34.
      const christTheKing = dayNumber(addDays(context.nextAdvent, -7));
      const sunday = dayNumber(weekdayOnOrBefore(iso, "sunday"));
      return 34 - (christTheKing - sunday) / 7;
    }
    default:
      throw new TypeError(`not a Roman season: ${JSON.stringify(seasonName)}`);
  }
}

/** The full chart: date → LiturgicalDay under the General Roman Calendar. */
export function romanDay(iso: string): LiturgicalDay {
  const civil = parseIsoDate(iso);
  const adventYear = liturgicalYearOf(iso);
  const seasons = romanSeasons(adventYear);
  const d = dayNumber(iso);
  const containing = seasons.find(
    (candidate) => d >= dayNumber(candidate.start) && d <= dayNumber(candidate.end),
  ) as Season;

  const year = adventYear + 1;
  const easter = easterDate(year);
  const nextAdvent = adventStart(year);
  const context = Object.freeze({
    advent1: adventStart(adventYear),
    christmas: formatIsoDate(civilDate(adventYear, 12, 25)),
    baptism: baptismOfTheLord(adventYear),
    easter,
    nextAdvent,
  });

  const observances: Observance[] = [];
  for (const movable of ROMAN_MOVABLE_OBSERVANCES) {
    if (feastDate(movable.feast, year) === iso) observances.push(observance(movable.name, movable.rank));
  }
  for (const fixed of ROMAN_FIXED_OBSERVANCES) {
    if (fixed.feast.month === civil.month && fixed.feast.day === civil.day) {
      observances.push(observance(fixed.name, fixed.rank));
    }
  }
  if (iso === addDays(nextAdvent, -7)) {
    observances.push(observance("Our Lord Jesus Christ, King of the Universe", "solemnity"));
  }
  if (iso === context.baptism) observances.push(observance("Baptism of the Lord", "feast"));
  if (observances.length === 0) {
    observances.push(
      dayOfWeek(iso) === "sunday" ? observance("Sunday", "sunday") : observance("Weekday", "weekday"),
    );
  }

  return Object.freeze({
    date: iso,
    season: containing.name,
    weekOfSeason: weekOf(containing.name, iso, context),
    observances: Object.freeze(observances),
    cycles: Object.freeze({ sunday: sundayCycleOf(adventYear), weekday: weekdayCycleOf(adventYear) }),
  });
}
