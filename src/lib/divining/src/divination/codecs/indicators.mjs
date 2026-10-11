// Daily-indicators codec: the daily-indicators document (the carrier's
// stored JSON wire form) and the canonical markdown brief projected from it.
//
// Vocabulary: the wire form is plain JSON — the indicators file a cycle's
// first stage writes and its second stage reads. The record types here are
// STRUCTURAL: they name exactly the fields the wire carries, and the
// divination-topology carrier satisfies them without this codec importing
// it (a codec carries its wire format and nothing else). Morphisms:
// encodeDailyIndicators (record → canonical JSON text),
// decodeDailyIndicators (text → validated record), and
// renderIndicatorsBrief (record → a deterministic markdown projection — the
// brief a synthesizer or a reviewing human reads). Validation checks the
// shape the pipeline depends on and throws TypeError for anything else —
// the only thing this codec throws.

export function encodeDailyIndicators(indicators) {
  assertDailyIndicators(indicators);
  return `${JSON.stringify(indicators, null, 2)}\n`;
}

export function decodeDailyIndicators(text) {
  if (typeof text !== "string") throw new TypeError("indicators document must be a string");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new TypeError("indicators document is not JSON");
  }
  assertDailyIndicators(parsed);
  return deepFreeze(parsed);
}

export function assertDailyIndicators(value) {
  if (value === null || typeof value !== "object") throw new TypeError("indicators must be an object");
  const record = value;
  for (const key of ["date", "chartTime"]) {
    if (typeof record[key] !== "string") throw new TypeError(`indicators.${key} must be a string`);
  }
  const moon = record.moon;
  if (!moon || typeof moon !== "object") throw new TypeError("indicators.moon is required");
  const placement = moon.placement;
  const lunation = moon.lunation;
  if (!placement || typeof (placement.sign)?.name !== "string") {
    throw new TypeError("indicators.moon.placement.sign.name is required");
  }
  if (!lunation || typeof lunation.phase !== "string") {
    throw new TypeError("indicators.moon.lunation.phase is required");
  }
  const motion = record.motion;
  if (!motion || (motion.kind !== "aspect" && motion.kind !== "ingress")) {
    throw new TypeError("indicators.motion.kind must be aspect or ingress");
  }
  const tarot = record.tarot;
  if (!tarot || !Array.isArray(tarot.positions) || tarot.positions.length === 0) {
    throw new TypeError("indicators.tarot.positions must be a non-empty list");
  }
  const numerology = record.numerology;
  if (!numerology || typeof numerology.value !== "number") {
    throw new TypeError("indicators.numerology.value must be a number");
  }
  const lection = record.lection;
  if (lection !== undefined && (typeof lection.reference !== "string" || typeof lection.cycle !== "string")) {
    throw new TypeError("indicators.lection, when carried, needs cycle and reference");
  }
  if (!Array.isArray(record.signals)) throw new TypeError("indicators.signals must be a list");
  for (const signal of record.signals) {
    if (typeof signal?.kind !== "string" || typeof signal?.text !== "string" || typeof signal?.synthesizer !== "string") {
      throw new TypeError("each signal needs kind, text, and synthesizer");
    }
  }
}

/** The canonical markdown brief: what a synthesizer (or reviewer) reads. */
export function renderIndicatorsBrief(indicators) {
  assertDailyIndicators(indicators);
  const lines = [];
  lines.push(`# Daily indicators — ${indicators.date}`);
  lines.push("");
  lines.push(`Chart computed for ${indicators.chartTime}.`);
  lines.push("");
  const placement = indicators.moon.placement;
  const lunation = indicators.moon.lunation;
  lines.push("## Moon");
  lines.push("");
  lines.push(
    `${lunation.phase} (${Math.round(lunation.illuminatedFraction * 100)}% illuminated, ${lunation.trend}), ` +
      `Moon at ${placement.degreeInSign.toFixed(1)}° ${placement.sign.name}.`,
  );
  lines.push("");
  lines.push("## Featured motion");
  lines.push("");
  if (indicators.motion.kind === "aspect") {
    const hit = indicators.motion.aspect;
    const exactness =
      Math.abs(hit.offset) < 0.05 ? "exact" : `${Math.abs(hit.offset).toFixed(1)}° from exact, ${hit.phase}`;
    lines.push(
      `${capitalize(hit.bodyA)} ${hit.aspect.name} ${capitalize(hit.bodyB)} (${exactness})` +
        (indicators.motion.exactTime ? `, exact at ${indicators.motion.exactTime}` : "") +
        ".",
    );
  } else {
    const ingress = indicators.motion.ingress;
    lines.push(
      `${capitalize(ingress.body)} enters ${ingress.signTo.name} at ${ingress.time}` +
        (ingress.direction === "retrograde" ? " (by retrograde motion)" : "") +
        ".",
    );
  }
  lines.push("");
  lines.push("## Tarot");
  lines.push("");
  for (const position of indicators.tarot.positions) {
    lines.push(`${position.card.name}, ${position.orientation} (${position.position}).`);
  }
  lines.push(
    `Draw: ${indicators.tarot.provenance.method}${indicators.tarot.provenance.seed ? `; seed ${indicators.tarot.provenance.seed}` : ""}.`,
  );
  lines.push("");
  lines.push("## Numerology");
  lines.push("");
  lines.push(
    `The date reduces ${indicators.numerology.steps.join(" → ")}: a ${indicators.numerology.kind === "master" ? "master number " : ""}${indicators.numerology.value}.`,
  );
  lines.push("");
  if (indicators.lection) {
    lines.push("## Lection");
    lines.push("");
    lines.push(
      `${indicators.lection.reference} (${indicators.lection.cycle}${indicators.lection.translation ? `, ${indicators.lection.translation}` : ""})` +
        (indicators.lection.text ? ` — “${indicators.lection.text}”` : "") +
        ".",
    );
  }
  if (indicators.signals.length > 0) {
    lines.push("");
    lines.push("## Signals");
    lines.push("");
    for (const signal of indicators.signals) {
      lines.push(`- ${signal.kind}: ${signal.text} _(synthesized by ${signal.synthesizer})_`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function deepFreeze(value) {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}
