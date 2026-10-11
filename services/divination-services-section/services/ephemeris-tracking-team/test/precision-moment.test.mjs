import assert from "node:assert/strict";
import test from "node:test";

import {
  DE440_SHA256,
  computePrecisionAstronomyPositions,
  computePrecisionMoment,
  normalizePrecisionAstronomyRequest,
  normalizePrecisionRequest,
  PRECISION_RANGE,
} from "../src/precision-moment.mjs";

const BODIES = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

function supplierFixture(request) {
  return {
    kind: "natal",
    epoch_utc: request.time,
    bodies: BODIES.map((body, index) => ({
      body,
      lon_deg: [118.28082814466296, 202.975898030039, 106.71354450314597, 162.389572338644,
        75.564096617384, 124.52676450703868, 14.7210715899229, 64.61123993507262,
        4.36898584560857, 304.43259393531685][index],
    })),
    houses: { system: request.houseSystem, cusps_deg: Array.from({ length: 12 }, (_, cusp) => cusp * 30) },
    angles: { ascendant_deg: 277.84814268371105, mc_deg: 213.37468449748192 },
    nodes: { mean_node_deg: 331.52801390791086, true_node_deg: 330.2782328236698 },
    lots: { fortune_deg: 2.5432125690871055, spirit_deg: 193.15307279833502 },
    distribution: { fire: 3, earth: 1, air: 4, water: 2 },
    dignities: [],
    aspects: [],
  };
}

test("normalizes the exact instant, location, and chart tradition before paid work", () => {
  assert.deepEqual(normalizePrecisionRequest("2026-07-21T00:00:00Z", {
    latitude: "41.8781",
    longitude: "-87.6298",
    houseSystem: "whole-sign",
    rulership: "modern",
    sidereal: "lahiri",
  }), {
    time: "2026-07-21T00:00:00.000Z",
    latitude: 41.8781,
    longitude: -87.6298,
    houseSystem: "whole-sign",
    rulership: "modern",
    sidereal: "lahiri",
  });
});

test("refuses unsupported inputs before payment", () => {
  assert.deepEqual(PRECISION_RANGE, { minYear: 1972, maxYear: 2050 });
  assert.throws(() => normalizePrecisionRequest("1900-01-01", { latitude: 0, longitude: 0 }), RangeError);
  assert.throws(() => normalizePrecisionRequest("2026-07-21", { latitude: 91, longitude: 0 }), RangeError);
  assert.throws(() => normalizePrecisionRequest("2026-07-21", { latitude: 70, longitude: 0 }), RangeError);
  assert.throws(() => normalizePrecisionRequest("2026-07-21", { latitude: 0, longitude: 0, houseSystem: "unknown" }), TypeError);
});

test("precision astronomy admits physical observation without astrology settings", async () => {
  let observedRequest;
  const result = await computePrecisionAstronomyPositions("2026-07-21", {
    latitude: 70,
    longitude: -87.6298,
    houseSystem: "unknown",
    sidereal: "lahiri",
  }, {
    execute: async (request) => {
      observedRequest = request;
      return supplierFixture(request);
    },
  });
  assert.deepEqual(normalizePrecisionAstronomyRequest("2026-07-21", { latitude: 70, longitude: -87.6298 }), {
    time: "2026-07-21T00:00:00.000Z",
    latitude: 70,
    longitude: -87.6298,
  });
  assert.deepEqual(observedRequest, {
    time: "2026-07-21T00:00:00.000Z",
    latitude: 70,
    longitude: -87.6298,
  });
  assert.equal(result.tier, "astronomy-precision-positions");
  assert.equal("configuration" in result, false);
  assert.equal("houses" in result, false);
  assert.equal(result.bodies[0].body, "Sun");
});

test("precision product preserves the supplier chart and adds deterministic metrological cross-checks", async () => {
  const result = await computePrecisionMoment("2026-07-21", {
    latitude: 41.8781,
    longitude: -87.6298,
  }, { execute: async (request) => supplierFixture(request) });
  assert.equal(result.tier, "precision-moment");
  assert.equal(result.semanticLayers.astronomy.authority, "JPL DE440-backed numerical computation");
  assert.equal(result.semanticLayers.astrology.tradition.houseSystem, "placidus");
  assert.equal(result.metrology.ephemeris, "JPL DE440");
  assert.equal(result.metrology.ephemerisSha256, DE440_SHA256);
  assert.equal(result.chart.houses.system, "placidus");
  assert.equal(result.location.longitudeDegreesEast, -87.6298);
  assert.equal(Object.keys(result.essentialsCrossCheck).length, 10);
  assert.equal(result.essentialsCrossCheck.sun.precisionLongitudeDegrees, 118.28082814466296);
  assert.equal(typeof result.essentialsCrossCheck.saturn.absoluteDifferenceArcminutes, "number");
});
