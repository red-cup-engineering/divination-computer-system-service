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

const RANKS = Object.freeze([
  "solemnity",
  "feast",
  "memorial",
  "optional-memorial",
  "privileged",
  "sunday",
  "weekday",
]);

/** Build the frozen observance record, checking the rank is one of the grading's values. */
export function observance(name, rank) {
  if (typeof name !== "string" || name.length === 0) {
    throw new TypeError("observance name must be a non-empty string");
  }
  if (!RANKS.includes(rank)) throw new TypeError(`not an observance rank: ${JSON.stringify(rank)}`);
  return Object.freeze({ name, rank });
}

/** The three-year Sunday lectionary cycle, shared by the Roman lectionary and the RCL. */

/** The Roman two-year weekday lectionary cycle. */

  

