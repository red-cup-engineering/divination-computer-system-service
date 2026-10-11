import assert from "node:assert/strict";
import test from "node:test";
import { computeChart } from "../src/astrology/index.mjs";
import { computeAstronomyPositions } from "@lenticule-science/astronomy-position-computation-service";

test("astrology consumes the shared astronomy computation", () => {
  const instant = "2026-09-08T00:00:00Z";
  const chart = computeChart(instant);
  const astronomy = computeAstronomyPositions(instant);
  assert.equal(chart.bodies.sun.longitude.toFixed(4), astronomy.bodies.sun.longitude.toFixed(4));
  assert.equal(Object.keys(chart.bodies).length, 10);
});
