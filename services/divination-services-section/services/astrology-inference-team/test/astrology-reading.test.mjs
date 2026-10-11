// Proves the reading is grounded in a real, deterministic chart and that the
// inference job embeds those exact positions (the moat — no hallucinated sky).
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeReadingChart, astrologyReadingJob, chartSummaryText } from "../src/astrology-reading.mjs";

const DATE = "2026-07-18";

test("computeReadingChart returns a real, provenance-carrying chart", () => {
  const r = computeReadingChart(DATE);
  assert.equal(r.placements.sun.sign, "Cancer"); // matches the live ephemeris for this date
  assert.ok(r.placements.moon.sign, "moon has a sign");
  assert.ok(r.provenance?.algorithm, "chart carries ephemeris provenance");
  assert.ok(Array.isArray(r.aspects));
});

test("chart is deterministic for a given instant", () => {
  const a = computeReadingChart(DATE);
  const b = computeReadingChart(DATE);
  assert.deepEqual(a.placements, b.placements);
});

test("reading job embeds the real computed positions, not free-floating astrology", () => {
  const { chart, job } = astrologyReadingJob({ date: DATE, question: "career?" });
  // the moat check: the prompt contains the actual computed sign, and provenance
  const prompt = job.messages.map((m) => m.content).join("\n");
  assert.match(prompt, /Cancer/);
  assert.match(prompt, new RegExp(chart.provenance.algorithm.slice(0, 12)));
  assert.match(prompt, /interpret only the computed chart/i);
  // job is a valid LISS shape the tollbooth can serve
  assert.equal(typeof job.id, "string");
  assert.equal(job.messages.length, 2);
  assert.equal(job.maxTokens, 500);
  assert.deepEqual(job.preferEndpoints, ["groq-llama-3.1-8b-instant"]);
});

test("summary lists every computed body", () => {
  const r = computeReadingChart(DATE);
  const s = chartSummaryText(r);
  for (const body of ["sun", "moon", "mars", "pluto"]) assert.match(s, new RegExp(body));
});
