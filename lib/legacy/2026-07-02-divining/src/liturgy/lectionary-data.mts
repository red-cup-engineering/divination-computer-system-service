// Lectionary reading tables as data.
//
// Vocabulary: a LectionaryEntry is a record of what a lectionary appoints
// for one date — the tradition, the service (Sunday or daily), the cycle
// letter, the day's name, and the readings. A reading carries its role
// (first / psalm / second / gospel), its track where the lectionary forks
// (the RCL's Old Testament stream after Pentecost is two-valued:
// semicontinuous or complementary), and any printed alternative citation.
// Every record is frozen; every entry names its provenance.
//
// PROVENANCE. All entries below were transcribed on 2026-06-11 from the
// Vanderbilt Divinity Library's online Revised Common Lectionary
// (https://lectionary.library.vanderbilt.edu/), Year A 2025–26. Sunday
// propers come from the dated proper pages and the texts endpoint; daily
// readings come from the Year A daily-readings page. Each entry's
// `provenance` field carries its exact source URL. No citation here was
// composed from memory.
//
// COVERAGE, honestly stated: Sunday propers are recorded for June–July 2026
// only (Propers 5–12, Year A); daily readings for June 2026 only. Dates
// outside that window have no entry, and `lectionFor` says so with a typed
// outcome rather than a guess.

export type ReadingRole = "first" | "psalm" | "second" | "gospel";

export type LectionaryTrack = "semicontinuous" | "complementary";

export type LectionaryReading = Readonly<{
  role: ReadingRole;
  citation: string;
  /** Present only where the lectionary forks into two Old Testament streams. */
  track?: LectionaryTrack;
  /** A printed "or" alternative, where the source gives one. */
  alternativeCitation?: string;
}>;

export type LectionaryEntry = Readonly<{
  tradition: "rcl";
  service: "sunday" | "daily";
  /** IsoDate. */
  date: string;
  cycle: "A";
  /** The day's name in the lectionary ("Proper 6 (11)", "Daily Readings"). */
  name: string;
  readings: readonly LectionaryReading[];
  /** Source URL and fetch date for every citation in this entry. */
  provenance: string;
}>;

const FETCHED = "fetched 2026-06-11";

function reading(
  role: ReadingRole,
  citation: string,
  track?: LectionaryTrack,
  alternativeCitation?: string,
): LectionaryReading {
  return Object.freeze({
    role,
    citation,
    ...(track === undefined ? {} : { track }),
    ...(alternativeCitation === undefined ? {} : { alternativeCitation }),
  });
}

/** The four gospels, for routing a daily citation to its role. */
function roleOfThirdReading(citation: string): ReadingRole {
  for (const gospel of ["Matthew ", "Mark ", "Luke ", "John "]) {
    if (citation.startsWith(gospel)) return "gospel";
  }
  return "second";
}

function sundayEntry(
  date: string,
  name: string,
  url: string,
  parts: Readonly<{
    semicontinuousFirst: string;
    semicontinuousFirstAlternative?: string;
    semicontinuousPsalm: string;
    semicontinuousPsalmAlternative?: string;
    complementaryFirst: string;
    complementaryFirstAlternative?: string;
    complementaryPsalm: string;
    second: string;
    gospel: string;
  }>,
): LectionaryEntry {
  return Object.freeze({
    tradition: "rcl",
    service: "sunday",
    date,
    cycle: "A",
    name,
    readings: Object.freeze([
      reading("first", parts.semicontinuousFirst, "semicontinuous", parts.semicontinuousFirstAlternative),
      reading("psalm", parts.semicontinuousPsalm, "semicontinuous", parts.semicontinuousPsalmAlternative),
      reading("first", parts.complementaryFirst, "complementary", parts.complementaryFirstAlternative),
      reading("psalm", parts.complementaryPsalm, "complementary"),
      reading("second", parts.second),
      reading("gospel", parts.gospel),
    ]),
    provenance: `${url} (${FETCHED})`,
  });
}

const DAILY_URL = "https://lectionary.library.vanderbilt.edu/daily-readings/";

/** A daily entry whose Old Testament stream forks into the two tracks. */
function dailyTrackedEntry(
  date: string,
  semicontinuousPsalm: string,
  semicontinuousFirst: string,
  complementaryPsalm: string,
  complementaryFirst: string,
  third: string,
): LectionaryEntry {
  return Object.freeze({
    tradition: "rcl",
    service: "daily",
    date,
    cycle: "A",
    name: "Daily Readings",
    readings: Object.freeze([
      reading("psalm", semicontinuousPsalm, "semicontinuous"),
      reading("first", semicontinuousFirst, "semicontinuous"),
      reading("psalm", complementaryPsalm, "complementary"),
      reading("first", complementaryFirst, "complementary"),
      reading(roleOfThirdReading(third), third),
    ]),
    provenance: `${DAILY_URL} (Year A 2025–26 daily readings, ${FETCHED})`,
  });
}

/** A daily entry with a single, untracked set (the days after Trinity Sunday). */
function dailyEntry(date: string, psalm: string, first: string, third: string): LectionaryEntry {
  return Object.freeze({
    tradition: "rcl",
    service: "daily",
    date,
    cycle: "A",
    name: "Daily Readings",
    readings: Object.freeze([
      reading("psalm", psalm),
      reading("first", first),
      reading(roleOfThirdReading(third), third),
    ]),
    provenance: `${DAILY_URL} (Year A 2025–26 daily readings, ${FETCHED})`,
  });
}

const TEXTS = "https://lectionary.library.vanderbilt.edu/texts/?y=17134&z=p";

/** Sunday propers, Year A, June–July 2026. */
export const RCL_SUNDAY_ENTRIES: readonly LectionaryEntry[] = Object.freeze([
  sundayEntry(
    "2026-06-07",
    "Proper 5 (10)",
    "https://lectionary.library.vanderbilt.edu/2026/06/june-07-2026-proper-5-10/",
    {
      semicontinuousFirst: "Genesis 12:1-9",
      semicontinuousPsalm: "Psalm 33:1-12",
      complementaryFirst: "Hosea 5:15-6:6",
      complementaryPsalm: "Psalm 50:7-15",
      second: "Romans 4:13-25",
      gospel: "Matthew 9:9-13, 18-26",
    },
  ),
  sundayEntry(
    "2026-06-14",
    "Proper 6 (11)",
    "https://lectionary.library.vanderbilt.edu/2026/06/june-14-2026-proper-6-11/",
    {
      semicontinuousFirst: "Genesis 18:1-15, (21:1-7)",
      semicontinuousPsalm: "Psalm 116:1-2, 12-19",
      complementaryFirst: "Exodus 19:2-8a",
      complementaryPsalm: "Psalm 100",
      second: "Romans 5:1-8",
      gospel: "Matthew 9:35-10:8, (9-23)",
    },
  ),
  sundayEntry("2026-06-21", "Proper 7 (12)", `${TEXTS}&d=61`, {
    semicontinuousFirst: "Genesis 21:8-21",
    semicontinuousPsalm: "Psalm 86:1-10, 16-17",
    complementaryFirst: "Jeremiah 20:7-13",
    complementaryPsalm: "Psalm 69:7-10, (11-15), 16-18",
    second: "Romans 6:1b-11",
    gospel: "Matthew 10:24-39",
  }),
  sundayEntry("2026-06-28", "Proper 8 (13)", `${TEXTS}&d=62`, {
    semicontinuousFirst: "Genesis 22:1-14",
    semicontinuousPsalm: "Psalm 13",
    complementaryFirst: "Jeremiah 28:5-9",
    complementaryPsalm: "Psalm 89:1-4, 15-18",
    second: "Romans 6:12-23",
    gospel: "Matthew 10:40-42",
  }),
  sundayEntry("2026-07-05", "Proper 9 (14)", `${TEXTS}&d=63`, {
    semicontinuousFirst: "Genesis 24:34-38, 42-49, 58-67",
    semicontinuousPsalm: "Psalm 45:10-17",
    semicontinuousPsalmAlternative: "Song of Solomon 2:8-13",
    complementaryFirst: "Zechariah 9:9-12",
    complementaryPsalm: "Psalm 145:8-14",
    second: "Romans 7:15-25a",
    gospel: "Matthew 11:16-19, 25-30",
  }),
  sundayEntry("2026-07-12", "Proper 10 (15)", `${TEXTS}&d=64`, {
    semicontinuousFirst: "Genesis 25:19-34",
    semicontinuousPsalm: "Psalm 119:105-112",
    complementaryFirst: "Isaiah 55:10-13",
    complementaryPsalm: "Psalm 65:(1-8), 9-13",
    second: "Romans 8:1-11",
    gospel: "Matthew 13:1-9, 18-23",
  }),
  sundayEntry("2026-07-19", "Proper 11 (16)", `${TEXTS}&d=65`, {
    semicontinuousFirst: "Genesis 28:10-19a",
    semicontinuousPsalm: "Psalm 139:1-12, 23-24",
    complementaryFirst: "Wisdom of Solomon 12:13, 16-19",
    complementaryFirstAlternative: "Isaiah 44:6-8",
    complementaryPsalm: "Psalm 86:11-17",
    second: "Romans 8:12-25",
    gospel: "Matthew 13:24-30, 36-43",
  }),
  sundayEntry("2026-07-26", "Proper 12 (17)", `${TEXTS}&d=66`, {
    semicontinuousFirst: "Genesis 29:15-28",
    semicontinuousPsalm: "Psalm 105:1-11, 45b",
    semicontinuousPsalmAlternative: "Psalm 128",
    complementaryFirst: "1 Kings 3:5-12",
    complementaryPsalm: "Psalm 119:129-136",
    second: "Romans 8:26-39",
    gospel: "Matthew 13:31-33, 44-52",
  }),
]);

/** Daily readings, Year A, June 2026 (Sundays carry propers and are listed above). */
export const RCL_DAILY_ENTRIES: readonly LectionaryEntry[] = Object.freeze([
  // June 1–3 follow Trinity Sunday (May 31) with a single, untracked set.
  dailyEntry("2026-06-01", "Psalm 29", "Job 38:39-39:12", "1 Corinthians 12:1-3"),
  dailyEntry("2026-06-02", "Psalm 29", "Job 39:13-25", "1 Corinthians 12:4-13"),
  dailyEntry("2026-06-03", "Psalm 29", "Job 39:26-40:5", "John 14:25-26"),
  dailyTrackedEntry("2026-06-04", "Psalm 33:1-12", "Genesis 13:1-18", "Psalm 50:7-15", "Lamentations 1:7-11", "2 Peter 2:17-22"),
  dailyTrackedEntry("2026-06-05", "Psalm 33:1-12", "Genesis 14:17-24", "Psalm 50:7-15", "Lamentations 3:40-58", "Acts 28:1-10"),
  dailyTrackedEntry("2026-06-06", "Psalm 33:1-12", "Genesis 15:1-20", "Psalm 50:7-15", "Exodus 34:1-9", "Matthew 9:27-34"),
  dailyTrackedEntry("2026-06-08", "Psalm 119:41-48", "Genesis 16:1-15", "Psalm 40:1-8", "Leviticus 15:25-31; 22:1-9", "2 Corinthians 6:14-7:2"),
  dailyTrackedEntry("2026-06-09", "Psalm 119:41-48", "Genesis 17:1-27", "Psalm 40:1-8", "Hosea 8:11-14; 10:1-2", "Hebrews 13:1-16"),
  dailyTrackedEntry("2026-06-10", "Psalm 119:41-48", "Genesis 18:16-33", "Psalm 40:1-8", "Hosea 14:1-9", "Matthew 12:1-8"),
  dailyTrackedEntry("2026-06-11", "Psalm 116:1-2, 12-19", "Genesis 21:1-7", "Psalm 100", "Exodus 4:18-23", "Hebrews 3:1-6"),
  dailyTrackedEntry("2026-06-12", "Psalm 116:1-2, 12-19", "Genesis 24:1-9", "Psalm 100", "Exodus 4:27-31", "Acts 7:35-43"),
  dailyTrackedEntry("2026-06-13", "Psalm 116:1-2, 12-19", "Genesis 24:10-52", "Psalm 100", "Exodus 6:28-7:13", "Mark 7:1-13"),
  dailyTrackedEntry("2026-06-15", "Psalm 126", "Genesis 23:1-19", "Psalm 105:1-11, 37-45", "Joshua 1:1-11", "1 Thessalonians 3:1-5"),
  dailyTrackedEntry("2026-06-16", "Psalm 126", "Genesis 25:7-11", "Psalm 105:1-11, 37-45", "1 Samuel 3:1-9", "2 Thessalonians 2:13-3:5"),
  dailyTrackedEntry("2026-06-17", "Psalm 126", "Nehemiah 9:1-8", "Psalm 105:1-11, 37-45", "Proverbs 4:10-27", "Luke 6:12-19"),
  dailyTrackedEntry("2026-06-18", "Psalm 86:1-10", "Exodus 12:43-49", "Psalm 69:7-10, 16-18", "Jeremiah 18:12-17", "Hebrews 2:5-9"),
  dailyTrackedEntry("2026-06-19", "Psalm 86:1-10", "Genesis 35:1-4", "Psalm 69:7-10, 16-18", "Jeremiah 18:18-23", "Acts 5:17-26"),
  dailyTrackedEntry("2026-06-20", "Psalm 86:1-10", "Ezekiel 29:3-7", "Psalm 69:7-10, 16-18", "Jeremiah 20:1-6", "Luke 11:53-12:3"),
  dailyTrackedEntry("2026-06-22", "Psalm 86:11-17", "Genesis 16:1-15", "Psalm 6", "Micah 7:1-7", "Revelation 2:1-7"),
  dailyTrackedEntry("2026-06-23", "Psalm 86:11-17", "Genesis 25:12-18", "Psalm 6", "Jeremiah 26:1-12", "Revelation 2:8-11"),
  dailyTrackedEntry("2026-06-24", "Psalm 86:11-17", "Jeremiah 42:18-22", "Psalm 6", "Jeremiah 38:1-13", "Matthew 10:5-23"),
  dailyTrackedEntry("2026-06-25", "Psalm 13", "Micah 7:18-20", "Psalm 89:1-4, 15-18", "Jeremiah 25:1-7", "Galatians 5:2-6"),
  dailyTrackedEntry("2026-06-26", "Psalm 13", "2 Chronicles 20:5-12", "Psalm 89:1-4, 15-18", "Jeremiah 25:8-14", "Galatians 5:7-12"),
  dailyTrackedEntry("2026-06-27", "Psalm 13", "Genesis 26:23-25", "Psalm 89:1-4, 15-18", "Jeremiah 28:1-4", "Luke 17:1-4"),
  dailyTrackedEntry("2026-06-29", "Psalm 47", "Genesis 22:15-18", "Psalm 119:161-168", "1 Kings 21:1-16", "1 Thessalonians 4:9-12"),
  dailyTrackedEntry("2026-06-30", "Psalm 47", "1 Kings 18:36-39", "Psalm 119:161-168", "1 Kings 21:17-29", "1 John 4:1-6"),
]);

/** Every recorded entry, Sundays and dailies together. */
export const RCL_LECTIONARY_ENTRIES: readonly LectionaryEntry[] = Object.freeze([
  ...RCL_SUNDAY_ENTRIES,
  ...RCL_DAILY_ENTRIES,
]);
