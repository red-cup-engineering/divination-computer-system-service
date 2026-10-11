/**
 * starknowledge — Lakota star knowledge (Wičháȟpi) as the sun's seasonal position.
 *
 * "As above, so below": the sky and He Sápa (the Black Hills) mirror one another, and
 * the people keep right relation by moving through the earthly sites as the sun moves
 * through the matching star-regions. This reads the SUN'S real seasonal position — its
 * tropical ecliptic longitude, reused from the astrology ephemeris (0° at the spring
 * equinox) — and names the Lakota season, the constellation the sun is journeying
 * through, and the correspondence the time is FOR. It is a calendar of right relation
 * (when and where), not a fortune.
 *
 * Encoded from PUBLIC sources only — Ronald Goodman, "Lakota Star Knowledge"; the
 * Native Skywatchers D(L)akota Star Map (Lee, Rock & O'Rourke); published Lakota
 * ethnoastronomy — with the Lakota names carried as best transcribed (corrections
 * welcome). The closed ceremonial interior is NOT encoded; only the public sky/season
 * correspondences. Names and the season↔direction layer are deliberately left for the
 * tradition to confirm rather than guessed.
 */
import { bodyLongitude, julianDayFromIso, terrestrialJulianDay } from "../astrology/index.mjs";

/** A normalized ISO instant (noon, if only a date was given) for the sun's position. */
const instantOf = (date) => (date.includes("T") ? date : `${date}T12:00:00Z`);

/** The sun's tropical ecliptic longitude for a date, degrees in [0, 360) (0 = spring
 * equinox) — the seasonal position, read off the same ephemeris the astrology practice
 * uses. */
export function sunLongitude(date) {
  const julianDayTt = terrestrialJulianDay(julianDayFromIso(instantOf(date)));
  const longitude = bodyLongitude("sun", julianDayTt) % 360;
  return longitude < 0 ? longitude + 360 : longitude;
}

/** The four seasons by the sun's tropical-longitude quadrant (0° = spring equinox). */
export const SEASONS = Object.freeze([
  "wéetu (spring)",
  "blokétu (summer)",
  "ptaŋyétu (autumn)",
  "waníyetu (winter)",
]);

/** The quarter-day thresholds — the sacred days the season turns on (Native Skywatchers:
 * the solstices and equinoxes are sacred, good days to pray and hold ceremony). */
export const THRESHOLDS = Object.freeze([
  "spring equinox",
  "summer solstice (Wiwáŋyaŋg Wačhípi — the Sun Dance)",
  "autumn equinox",
  "winter solstice",
]);

/** The spring journey (spring equinox → summer solstice): as the sun crosses [0°, 90°)
 * it passes three star-regions and the people enter the matching He Sápa sites. Public
 * (Goodman; Lakota ethnoastronomy), ordered by the sun's passage. */

export const SPRING_JOURNEY = Object.freeze([
  Object.freeze({
    constellation: "Wičíŋčala Šakówiŋ (Seven Little Girls / Pleiades)",
    site: "Hiŋháŋ Káğa",
    note: "the great spring ritual — welcoming the thunders back in peace",
  }),
  Object.freeze({
    constellation: "Tȟayámni (the celestial buffalo)",
    site: "He Sápa (the interior)",
    note: "the buffalo turns; the people move with it",
  }),
  Object.freeze({
    constellation: "Matȟó Thípila (Bear's Lodge / Devils Tower)",
    site: "Matȟó Thípila",
    note: "toward the solstice and the Sun Dance",
  }),
]);

/** The sun's reading of the season: where it is on the year-wheel and what that time is
 * for. */

  

   

/** Read the sun's seasonal position for a date: the season, any quarter-day threshold,
 * and (in spring) the journey stage the sun is crossing. */
export function seasonalPosition(date) {
  const longitude = sunLongitude(date);

  // The nearest quarter-day boundary (0/90/180/270). When the sun sits within ~1.5° of
  // one, the date IS that quarter-day, and belongs to the season the quarter-day OPENS —
  // so the season never lags the threshold it is plainly on.
  const quarter = Math.round(longitude / 90) % 4; // 0=spring eq, 1=summer sol, 2=autumn eq, 3=winter sol
  const gap = Math.abs(longitude - quarter * 90);
  const distance = Math.min(gap, 360 - gap);
  const onThreshold = distance <= 1.5;

  const seasonIndex = onThreshold ? quarter : Math.floor(longitude / 90) % 4;
  const season = SEASONS[seasonIndex];
  const threshold = onThreshold ? THRESHOLDS[quarter] : undefined;

  // The spring journey: across [0°, 90°) the sun crosses the three star-regions in turn
  // (a just-opened spring sits at the first stage, Wičíŋčala Šakówiŋ).
  let journey;
  if (seasonIndex === 0) {
    const springProgress = onThreshold ? 0 : (longitude % 90) / 90;
    journey = SPRING_JOURNEY[Math.min(2, Math.floor(springProgress * 3))];
  }

  return Object.freeze({
    date,
    longitude,
    season,
    ...(threshold === undefined ? {} : { threshold }),
    ...(journey === undefined ? {} : { journey }),
  });
}
