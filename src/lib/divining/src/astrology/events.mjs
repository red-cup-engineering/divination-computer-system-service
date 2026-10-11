// Astrological events interpret numerical crossings through the tropical zodiac.
//
// The astronomy package supplies circular root finding and body positions. This
// module adds only the sign quotient: which sign was left and which was entered.

import {
  bodyLongitude,
  findCircleCrossings,
  isoFromJulianDay,
  julianDayFromIso,
  terrestrialJulianDay,

} from "@lenticule-science/astronomy-position-computation-service";
import { ZODIAC_SIGNS } from "./zodiac.mjs";

/**
 * Find tropical zodiac boundary crossings over a UTC interval. Numerical
 * bracketing remains in astronomy; this operation names the resulting signs.
 */
export function findIngresses(body, start, end) {
  const startTt = terrestrialJulianDay(julianDayFromIso(start));
  const endTt = terrestrialJulianDay(julianDayFromIso(end));
  const events = [];
  for (let cusp = 0; cusp < 360; cusp += 30) {
    const crossings = findCircleCrossings(
      (julianDay) => bodyLongitude(body, julianDay),
      cusp,
      startTt,
      endTt,
      { stepDays: body === "moon" ? 0.1 : 1 },
    );
    for (const crossing of crossings) {
      const toIndex = crossing.direction === "increasing"
        ? cusp / 30
        : (cusp / 30 + 11) % 12;
      const fromIndex = crossing.direction === "increasing"
        ? (toIndex + 11) % 12
        : (toIndex + 1) % 12;
      events.push(Object.freeze({
        body,
        from: ZODIAC_SIGNS[fromIndex],
        to: ZODIAC_SIGNS[toIndex],
        julianDay: crossing.julianDay,
        time: isoFromJulianDay(crossing.julianDay),
        direction: crossing.direction,
      }));
    }
  }
  return Object.freeze(events.sort((left, right) => left.julianDay - right.julianDay));
}
