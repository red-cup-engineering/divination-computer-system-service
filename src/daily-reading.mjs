import { computeChart, signPlacement, aspectsInChart, lunationOf, BODIES } from "@lenticule-science/divining/astrology";
import { lectionFor } from "@lenticule-science/divining/liturgy";
import { typedListTerm } from "@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/json-codec";
import { inferTerm } from "@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/typing";

// A daily reading is a SEN term over marks, pairs and array-encoded lists;
// alternatives (an optional mark, a found or absent lection) are tagged pairs,
// so the reading's type is its term's inferred structural type.

function productTerm(...members) {
  if (members.length < 2) throw new Error("an SEN product term requires at least two members");
  return members.slice(0, -1).reduceRight((right, left) => ["pair", left, right], members.at(-1));
}

function mark(value) { return ["mark", String(value)]; }
function decimal(value, field) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${field} is not a finite measured value`);
  return mark(value.toString());
}
function listTerm(values) {
  return typedListTerm(undefined, values);
}
function tagged(tag, value) { return ["pair", ["mark", tag], value]; }

/** The structural type of one daily reading term. */
export function dailyReadingType(term) {
  return inferTerm(term);
}

function optionalMark(value) {
  return value === undefined ? tagged("absent", ["star"]) : tagged("present", mark(value));
}

function signTerm(placement) {
  return productTerm(mark(placement.sign.name), decimal(placement.degreeInSign, "degreeInSign"));
}

function aspectTerm(hit) {
  return productTerm(
    mark(hit.bodyA),
    mark(hit.bodyB),
    mark(hit.aspect.name),
    decimal(hit.separation, "aspect separation"),
    decimal(hit.offset, "aspect offset"),
    mark(hit.phase),
  );
}

function lectionTerm(lection) {
  if (lection.outcome === "found") {
    const entry = lection.entry;
    const readings = entry.readings.map((reading) => productTerm(
      mark(reading.role), mark(reading.citation), optionalMark(reading.track), optionalMark(reading.alternativeCitation),
    ));
    const value = productTerm(
      mark(entry.tradition), mark(entry.service), mark(entry.date), mark(entry.cycle), mark(entry.name),
      listTerm(readings), mark(entry.provenance),
    );
    return tagged("found", value);
  }
  if (lection.outcome === "no-entry-recorded") {
    return tagged("no-entry-recorded", productTerm(mark(lection.date), mark(lection.tradition), mark(lection.note)));
  }
  throw new Error(`unknown lection outcome ${String(lection.outcome)}`);
}

export function computeDailyReadingTerm(date, tradition) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(date)) throw new Error("date must be an ISO calendar date");
  const instant = `${date}T00:00:00.000Z`;
  if (new Date(instant).toISOString().slice(0, 10) !== date) throw new Error("date must be a real ISO calendar date");
  if (!["rcl", "roman"].includes(tradition)) throw new Error("tradition must be rcl or roman");
  const chart = computeChart(instant);
  const sun = signPlacement(chart.bodies.sun.longitude);
  const moon = signPlacement(chart.bodies.moon.longitude);
  const lunation = lunationOf({ sun: chart.bodies.sun, moon: chart.bodies.moon });
  const chartStates = {};
  for (const body of BODIES) chartStates[body] = chart.bodies[body];
  const aspects = aspectsInChart(chartStates).map(aspectTerm);
  return productTerm(
    mark(instant),
    signTerm(sun),
    signTerm(moon),
    productTerm(mark(lunation.phase), decimal(lunation.illuminatedFraction, "illuminated fraction"), mark(lunation.trend)),
    listTerm(aspects),
    productTerm(mark(chart.provenance.algorithm), mark(chart.provenance.accuracy)),
    lectionTerm(lectionFor(date, tradition)),
  );
}
