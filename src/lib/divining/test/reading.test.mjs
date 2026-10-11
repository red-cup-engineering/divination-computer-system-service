import assert from "node:assert/strict";
import test from "node:test";
import { witnessedReading } from "@red-cup-engineering/signchain/bilattice";
import { corroborating, refuting, settleReading, signing } from "../src/reading.mjs";

test("settles contradictory witnesses through the canonical FOUR charge", () => {
  const reading = settleReading("question", "2026-09-08", [corroborating("tarot", "Star"), refuting("runes", "Star")]);
  assert.equal(reading.reading, "stable");
  assert.equal(reading.panel.length, 2);
});

test("keeps a practice-provided charge intact", () => {
  const reading = settleReading("question", "2026-09-08", [signing("iching", "changing line", witnessedReading("stable", { source: "iching", label: "changing line" }))]);
  assert.equal(reading.reading, "stable");
});
