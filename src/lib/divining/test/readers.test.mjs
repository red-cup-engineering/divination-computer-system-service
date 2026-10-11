import assert from "node:assert/strict";
import test from "node:test";
import { ZODIAC_SIGNS, normalizeDegrees, signedArc, angularSeparation, signPlacement } from "../src/astrology/zodiac.mjs";
import { BODIES, BODY_GLYPHS, STATIONARY_BAND, motionOf } from "@lenticule-science/astronomy-position-computation-service";
import { J2000, julianDayFromIso, isoFromJulianDay, deltaTSeconds, terrestrialJulianDay, julianCenturies } from "@lenticule-science/astronomy-position-computation-service";
import { EPHEMERIS_PROVENANCE, computeChart, bodyLongitude } from "@lenticule-science/astronomy-position-computation-service";
import { ASPECTS, aspectsInChart } from "../src/astrology/aspects.mjs";
import { LUNAR_PHASES, lunationOf } from "../src/astrology/lunation.mjs";
import { findIngresses } from "../src/astrology/events.mjs";
import { buildChartPanel, readChart } from "../src/astrology/reading.mjs";
const astrology = Object.freeze({ ZODIAC_SIGNS, normalizeDegrees, signedArc, angularSeparation, signPlacement, BODIES, BODY_GLYPHS, STATIONARY_BAND, motionOf, J2000, julianDayFromIso, isoFromJulianDay, deltaTSeconds, terrestrialJulianDay, julianCenturies, EPHEMERIS_PROVENANCE, computeChart, bodyLongitude, ASPECTS, aspectsInChart, LUNAR_PHASES, lunationOf, findIngresses, buildChartPanel, readChart });
import { WEEKDAYS, civilDate, parseIsoDate, formatIsoDate, dayNumberFromCivil, civilFromDayNumber, dayNumber, isoFromDayNumber, addDays, daysBetween, dayOfWeek, weekdayOnOrAfter, weekdayOnOrBefore, weekdayAfter, weekdayBefore, nthWeekdayOnOrAfter, nthWeekdayOnOrBefore } from "../src/calendar/iso-date.mjs";
import { easterCivil, easterDate } from "../src/calendar/computus.mjs";
import { goldenNumber, dayOfYear, isoWeek } from "../src/calendar/cycles.mjs";
import { movableFeast, fixedFeast, feastDate } from "../src/calendar/feast.mjs";
import { buildDatePanel, readDate } from "../src/calendar/reading.mjs";
const calendar = Object.freeze({ WEEKDAYS, civilDate, parseIsoDate, formatIsoDate, dayNumberFromCivil, civilFromDayNumber, dayNumber, isoFromDayNumber, addDays, daysBetween, dayOfWeek, weekdayOnOrAfter, weekdayOnOrBefore, weekdayAfter, weekdayBefore, nthWeekdayOnOrAfter, nthWeekdayOnOrBefore, easterCivil, easterDate, goldenNumber, dayOfYear, isoWeek, movableFeast, fixedFeast, feastDate, buildDatePanel, readDate });
import { TAROT_DECK, SEEDED_DRAW_METHOD, drawCards, dailySpread } from "../src/divination/tarot.mjs";
import { MASTER_NUMBERS, reduceDate } from "../src/divination/numerology.mjs";
import { buildSpreadPanel, buildReductionPanel, readSpread, readReduction } from "../src/divination/reading.mjs";
const divination = Object.freeze({ TAROT_DECK, SEEDED_DRAW_METHOD, drawCards, dailySpread, MASTER_NUMBERS, reduceDate, buildSpreadPanel, buildReductionPanel, readSpread, readReduction });
import { buildShieldPanel, buildPanel, readShield } from "../src/geomancy/reading.mjs";
import { FIGURES, SEEDED_CAST_METHOD, figureKey, nameFigure, castMothers, castShield } from "../src/geomancy/geomancy.mjs";
const geomancy = Object.freeze({ buildShieldPanel, buildPanel, readShield, FIGURES, SEEDED_CAST_METHOD, figureKey, nameFigure, castMothers, castShield });
import { buildCastPanel, buildPanel as buildPanel_2, read } from "../src/iching/reading.mjs";
import { castIChing, THREE_COINS_METHOD } from "../src/iching/iching.mjs";
const iching = Object.freeze({ buildCastPanel, buildPanel: buildPanel_2, read, castIChing, THREE_COINS_METHOD });
import { buildPanelFromCast, buildPanel as buildPanel_3, readCast } from "../src/ifa/reading.mjs";
import { PRINCIPAL_ODU, CHAIN_POSITIONS, COLUMN_MARKS, SEEDED_CAST_METHOD as SEEDED_CAST_METHOD_2, castOpele } from "../src/ifa/ifa.mjs";
const ifa = Object.freeze({ buildPanelFromCast, buildPanel: buildPanel_3, readCast, PRINCIPAL_ODU, CHAIN_POSITIONS, COLUMN_MARKS, SEEDED_CAST_METHOD: SEEDED_CAST_METHOD_2, castOpele });
import { observance } from "../src/liturgy/vocabulary.mjs";
import { ROMAN_MOVABLE_OBSERVANCES, ROMAN_FIXED_OBSERVANCES, adventStart, baptismOfTheLord, romanSeasons, liturgicalYearOf, sundayCycleOf, weekdayCycleOf, romanDay } from "../src/liturgy/roman.mjs";
import { rclYear, properOfSunday, dailyRelation } from "../src/liturgy/rcl.mjs";
import { RCL_SUNDAY_ENTRIES, RCL_DAILY_ENTRIES, RCL_LECTIONARY_ENTRIES } from "../src/liturgy/lectionary-data.mjs";
import { lectionFor } from "../src/liturgy/lection.mjs";
import { buildLectionPanel, readLections } from "../src/liturgy/reading.mjs";
const liturgy = Object.freeze({ observance, ROMAN_MOVABLE_OBSERVANCES, ROMAN_FIXED_OBSERVANCES, adventStart, baptismOfTheLord, romanSeasons, liturgicalYearOf, sundayCycleOf, weekdayCycleOf, romanDay, rclYear, properOfSunday, dailyRelation, RCL_SUNDAY_ENTRIES, RCL_DAILY_ENTRIES, RCL_LECTIONARY_ENTRIES, lectionFor, buildLectionPanel, readLections });
import { queryDigits, reduceToDigit, gateOf, castNumogram, ZONES, twinOf } from "../src/numogram/numogram.mjs";
import { buildPanelFromCast as buildPanelFromCast_2, castLabel, read as read_2 } from "../src/numogram/reading.mjs";
const numogram = Object.freeze({ queryDigits, reduceToDigit, gateOf, castNumogram, ZONES, twinOf, buildPanelFromCast: buildPanelFromCast_2, castLabel, read: read_2 });
import { buildCastPanel as buildCastPanel_2, buildPanel as buildPanel_4, readCast as readCast_2 } from "../src/runes/reading.mjs";
import { FUTHARK, NON_INVERTIBLE, SEEDED_CAST_METHOD as SEEDED_CAST_METHOD_3, DEFAULT_RUNE_COUNT, isInvertible, drawRunes, castRunes } from "../src/runes/runes.mjs";
const runes = Object.freeze({ buildCastPanel: buildCastPanel_2, buildPanel: buildPanel_4, readCast: readCast_2, FUTHARK, NON_INVERTIBLE, SEEDED_CAST_METHOD: SEEDED_CAST_METHOD_3, DEFAULT_RUNE_COUNT, isInvertible, drawRunes, castRunes });
import { sunLongitude, seasonalPosition, SEASONS, THRESHOLDS, SPRING_JOURNEY } from "../src/starknowledge/starknowledge.mjs";
import { buildSkyPanel, readSky } from "../src/starknowledge/reading.mjs";
const starknowledge = Object.freeze({ sunLongitude, seasonalPosition, SEASONS, THRESHOLDS, SPRING_JOURNEY, buildSkyPanel, readSky });
import { settleReading } from "../src/reading.mjs";

test("every restored reader executes through canonical settlement", () => {
  assert.equal(calendar.readDate("2026-01-02", "q").value, "absurd");
  assert.ok(divination.readSpread("2026-09-08", "q").panel.length > 0);
  assert.ok(geomancy.readShield("q", "q").panel.length === 7);
  assert.ok(iching.read("q", "q").panel.length === 6);
  assert.equal(ifa.readCast("q", "q").panel.length, 9);
  assert.ok(runes.readCast("q", "q").panel.length > 0);
  assert.ok(numogram.read("q", "q").panel.length >= 3);
  assert.ok(liturgy.readLections("2026-09-08", "q").panel.length > 0);
  assert.ok(starknowledge.readSky("2026-03-20", "q").panel.length > 0);
  assert.ok(astrology.readChart(astrology.computeChart("2026-09-08T00:00:00Z"), "q").cut.includes("2026"));
});

test("the restored readers retain their practice-specific evidence laws", () => {
  // Calendar and sky observation keep an absent optional marker silent.
  assert.equal(calendar.readDate("2026-01-02", "no marker").value, "absurd");

  // A neutral geomantic figure is explicit both-sided evidence, rather than an
  // omitted or one-polarity sign.
  const neutralShield = {
    mothers: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
    rightWitness: [1, 1, 1, 1], leftWitness: [1, 1, 1, 1], judge: [1, 1, 1, 1],
  };
  assert.equal(geomancy.readShield("neutral", "q").panel.length, 7);
  assert.equal(
    settleReading("q", "neutral", geomancy.buildShieldPanel(neutralShield)).value,
    "stable",
  );

  // Old (6/9) I Ching lines retain their changing/both charge.
  const changingCast = {
    label: "changing", lines: [6, 7, 8, 9, 7, 8].map((value, index) => ({
      position: index + 1, value, polarity: value === 7 || value === 9 ? "yang" : "yin",
      kind: value === 6 || value === 9 ? "old" : "young", changing: value === 6 || value === 9,
    })),
  };
  assert.equal(
    settleReading("q", "changing", iching.buildCastPanel(changingCast)).value,
    "stable",
  );

  // Ifa exposes only eight public binary marks plus an Odu parity marker.
  const ifaPanel = ifa.buildPanelFromCast({ marks: [1, 0, 1, 0, 1, 0, 1, 0], compound: "public-odu" });
  assert.equal(ifaPanel.length, 9);
  assert.deepEqual(ifaPanel.map(({ label }) => label), ["pos0", "pos1", "pos2", "pos3", "pos4", "pos5", "pos6", "pos7", "odu:public-odu"]);

  // A non-invertible rune remains upright even when a hand-supplied cast says
  // otherwise; orientation still decides an invertible rune's charge.
  const runePanel = runes.buildCastPanel({ date: "runes", drawn: [
    { rune: "Gebo", orientation: "upright" }, { rune: "Fehu", orientation: "reversed" },
  ] });
  assert.deepEqual(runePanel.map(({ label }) => label), ["Gebo", "Fehu"]);
  assert.equal(settleReading("q", "runes", runePanel).value, "stable");

  // The chart reads only present astronomy-derived aspect facts and preserves its instant.
  const chart = astrology.computeChart("2026-09-08T00:00:00Z");
  const chartReading = astrology.readChart(chart, "chart");
  assert.equal(chartReading.cut, chart.time);
  assert.deepEqual(chartReading.panel.map(({ source }) => source), Array(chartReading.panel.length).fill("astrology"));
});
