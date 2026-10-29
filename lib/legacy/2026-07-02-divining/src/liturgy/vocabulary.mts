// The shared vocabulary of liturgical calendars.
//
// Vocabulary, in the standard senses: a Season is a named closed interval of
// dates within a liturgical year — an element of the partition that the
// year's structure induces on the day line. An ObservanceRank is the
// standard grading of liturgical days (solemnity > feast > memorial >
// optional memorial; "privileged" covers the days the General Roman Calendar
// privileges outside that grading, such as Ash Wednesday and Palm Sunday;
// "sunday" and "weekday" are the unranked fallbacks). A LiturgicalDay is a
// date together with its season coordinate (season name, week of season),
// its witnessed observances, and its lectionary cycle identifiers.
//
// Nothing here computes; the computations live in roman.mts and rcl.mts.

export type RomanSeasonName =
  | "advent"
  | "christmas"
  | "ordinary-time-i"
  | "lent"
  | "triduum"
  | "easter"
  | "ordinary-time-ii";

export type Season = Readonly<{
  name: RomanSeasonName;
  /** First day of the interval, inclusive (IsoDate). */
  start: string;
  /** Last day of the interval, inclusive (IsoDate). */
  end: string;
}>;

export type ObservanceRank =
  | "solemnity"
  | "feast"
  | "memorial"
  | "optional-memorial"
  | "privileged"
  | "sunday"
  | "weekday";

export type Observance = Readonly<{
  name: string;
  rank: ObservanceRank;
}>;

const RANKS: readonly ObservanceRank[] = Object.freeze([
  "solemnity",
  "feast",
  "memorial",
  "optional-memorial",
  "privileged",
  "sunday",
  "weekday",
]);

/** Build the frozen observance record, checking the rank is one of the grading's values. */
export function observance(name: string, rank: ObservanceRank): Observance {
  if (typeof name !== "string" || name.length === 0) {
    throw new TypeError("observance name must be a non-empty string");
  }
  if (!RANKS.includes(rank)) throw new TypeError(`not an observance rank: ${JSON.stringify(rank)}`);
  return Object.freeze({ name, rank });
}

/** The three-year Sunday lectionary cycle, shared by the Roman lectionary and the RCL. */
export type SundayCycle = "A" | "B" | "C";

/** The Roman two-year weekday lectionary cycle. */
export type WeekdayCycle = "I" | "II";

export type LiturgicalDay = Readonly<{
  /** IsoDate. */
  date: string;
  season: RomanSeasonName;
  /**
   * The week coordinate within the season. Weeks of Advent, Christmas and
   * Easter count from the season's first day; Ordinary Time carries the
   * General Roman Calendar's own numbering (resumed after Pentecost so that
   * the final week before Advent is week 34); Lent uses 0 for the days from
   * Ash Wednesday to the first Sunday of Lent, then 1–6 (Holy Week = 6).
   */
  weekOfSeason: number;
  observances: readonly Observance[];
  cycles: Readonly<{ sunday: SundayCycle; weekday: WeekdayCycle }>;
}>;
