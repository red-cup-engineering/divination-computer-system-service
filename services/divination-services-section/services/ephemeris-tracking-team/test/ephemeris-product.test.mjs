// Product-grade tests for the sellable ephemeris calculation. The golden
// longitudes below are the engine's outputs at the moment its accuracy was
// independently audited against astronomy-engine (VSOP87/ELP) and found within
// bound for every body across 1800-2050. Freezing them means any future change
// that shifts a position — the one thing a paid ephemeris must never do silently —
// fails this test. Regenerate ONLY after a fresh independent accuracy audit.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeEphemeris,
  normalizeInstant,
  EPHEMERIS_RANGE,
} from "../src/ephemeris-product.mjs";

const GOLDEN = {
  "2000-01-01T00:00:00.000Z": {
    sun: 279.8637, moon: 217.2938, mercury: 271.1264, venus: 240.9712, mars: 327.585,
    jupiter: 25.3296, saturn: 40.2458, uranus: 314.7713, neptune: 303.1696, pluto: 251.4328,
  },
  "2026-07-18T00:00:00.000Z": {
    sun: 115.4185, moon: 163.8291, mercury: 107.8342, venus: 159.1334, mars: 73.4932,
    jupiter: 123.8851, saturn: 14.7605, uranus: 64.4963, neptune: 4.3781, pluto: 304.4898,
  },
};

test("golden regression: audited positions do not drift", () => {
  for (const [date, expected] of Object.entries(GOLDEN)) {
    const eph = computeEphemeris(date, { aspects: false });
    for (const [body, lon] of Object.entries(expected)) {
      assert.equal(eph.bodies[body].longitude, lon, `${body} @ ${date} drifted`);
    }
  }
});

test("deterministic for a given instant", () => {
  const a = computeEphemeris("2026-07-18", { aspects: true });
  const b = computeEphemeris("2026-07-18", { aspects: true });
  assert.deepEqual(a, b);
});

test("every response carries frame + provenance + audited per-body accuracy", () => {
  const eph = computeEphemeris("2026-07-18");
  assert.equal(eph.tier, "moment-essentials");
  assert.match(eph.semanticLayers.astronomy.status, /computed measurements/);
  assert.match(eph.semanticLayers.astrology.tradition, /tropical/);
  assert.match(eph.frame, /geocentric ecliptic-of-date/);
  assert.ok(eph.provenance?.algorithm, "provenance names the algorithm");
  assert.ok(eph.provenance?.accuracy, "provenance states the accuracy");
  assert.ok(Array.isArray(eph.aspects));
  assert.equal(eph.bodies.sun.motion, "direct");
  assert.equal(eph.bodies.sun.signGlyph, "♋");
  assert.equal(eph.bodies.sun.degreeInSign, 25.4185);
  assert.equal(eph.bodies.sun.element, "water");
  assert.equal(eph.lunarPhase.name, "waxing crescent");
  assert.equal(typeof eph.lunarPhase.illuminatedFraction, "number");
  assert.ok(eph.aspects.every((aspect) => aspect.rank === "major"), "essentials tier leaked deep-tier aspects");
  // audited per-body accuracy is disclosed for every body
  assert.equal(eph.accuracy.perBodyDegrees.sun, 0.02);
  assert.equal(eph.accuracy.perBodyDegrees.saturn, 0.18);
  assert.equal(eph.accuracy.validRange, "1800-2050");
  for (const b of ["sun", "moon", "mars", "pluto"]) {
    assert.equal(typeof eph.accuracy.perBodyDegrees[b], "number");
  }
});

test("refuses input we can't stand behind", () => {
  assert.throws(() => computeEphemeris("not-a-date"), TypeError);
  assert.throws(() => computeEphemeris(""), TypeError);
  // outside the validated accuracy window → typed refusal, not a wrong number
  assert.throws(() => computeEphemeris("1799-12-31"), RangeError);
  assert.throws(() => computeEphemeris(`${EPHEMERIS_RANGE.maxYear + 1}-01-01`), RangeError);
});

test("accepts both date-only and full ISO instants", () => {
  assert.equal(normalizeInstant("2026-07-18"), "2026-07-18T00:00:00.000Z");
  assert.equal(normalizeInstant("2026-07-18T12:00:00Z"), "2026-07-18T12:00:00.000Z");
  // boundary years are inside the window
  assert.ok(normalizeInstant("1800-01-01"));
  assert.ok(normalizeInstant("2050-12-31"));
});
