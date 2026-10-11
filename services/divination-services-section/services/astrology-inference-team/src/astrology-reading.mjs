// Astrology Inference Team — the wire-ready capability. Produces an astrology
// reading grounded in a REAL computed chart: the placements come from Divination's
// ephemeris (provenance-carrying), and the interpretation job embeds those exact
// positions so the model interprets real data instead of hallucinating the sky.
// This module runs no LLM and hits no network — it computes the chart and builds
// the inference job; the tollbooth (payment) and LISS (inference) consume them.
import {
  computeChart, aspectsInChart, signPlacement,
} from "@lenticule-science/divining/astrology";

const BODIES_ORDER = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

function normalizeIso(date) {
  const s = String(date);
  return s.includes("T") ? s : `${s}T00:00:00.000Z`;
}

// Real chart → structured reading input (placements + aspects + provenance).
export function computeReadingChart(date) {
  const time = normalizeIso(date);
  const chart = computeChart(time);
  const placements = {};
  for (const body of BODIES_ORDER) {
    const st = chart.bodies[body];
    if (!st) continue;
    const sign = signPlacement(st.longitude)?.sign;
    placements[body] = {
      longitude: Number(st.longitude.toFixed(4)),
      sign: sign?.name ?? null,
      retrograde: st.speed < 0,
    };
  }
  const aspects = aspectsInChart(chart.bodies).map((a) => ({
    a: a.bodyA, b: a.bodyB, aspect: a.aspect,
    orb: Number((a.offset ?? a.separation ?? 0).toFixed(3)),
    phase: a.phase,
  }));
  return { time, placements, aspects, provenance: chart.provenance };
}

// Human-readable chart summary the interpreting model reads from.
export function chartSummaryText(reading) {
  const lines = BODIES_ORDER
    .filter((b) => reading.placements[b])
    .map((b) => {
      const p = reading.placements[b];
      return `${b}: ${p.sign} (${p.longitude}°)${p.retrograde ? " retrograde" : ""}`;
    });
  const asp = reading.aspects.length
    ? reading.aspects.map((a) => `${a.a} ${a.aspect} ${a.b} (orb ${a.orb}°, ${a.phase})`).join("; ")
    : "no major aspects within orb";
  return `Placements:\n${lines.join("\n")}\n\nAspects: ${asp}`;
}

// Wire-ready: request → { chart, job }. The tollbooth serves `job` through LISS
// and binds `chart` (with its provenance) into the signed receipt.
export function astrologyReadingJob({
  date, tradition = "western", question, maxTokens = 500, id = "astro-1",
  preferEndpoints = ["groq-llama-3.1-8b-instant"],
} = {}) {
  if (!date) throw new Error("astrologyReadingJob requires a date");
  const chart = computeReadingChart(date);
  const summary = chartSummaryText(chart);
  const system = `You are an astrologer in the ${tradition} tradition. Interpret ONLY the computed chart provided below. Do not invent or adjust any planetary position — every placement and aspect you reference must come from the chart as given.`;
  const user = `${question ? `Question: ${question}\n\n` : ""}Computed chart for ${chart.time}\n(ephemeris: ${chart.provenance?.algorithm ?? "unknown"}):\n\n${summary}\n\nGive an interpretation grounded strictly in these placements and aspects.`;
  const job = {
    id,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    maxTokens,
    preferEndpoints,
  };
  return { chart, job };
}
