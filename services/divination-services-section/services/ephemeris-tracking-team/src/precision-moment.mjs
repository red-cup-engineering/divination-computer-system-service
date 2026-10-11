import {
  DE440_SHA256,
  OXIEPHEMERIS_VERSION,
  PRECISION_RANGE,
  computePrecisionAstronomyPositions,
  executeOxiEphemeris,
  normalizePrecisionAstronomyRequest,
} from "@lenticule-science/astronomy-position-computation-service/node";

const HOUSE_SYSTEMS = new Set(["placidus", "koch", "whole-sign", "equal", "porphyry", "regiomontanus", "campanus"]);
const SIDEREAL_MODES = new Set(["fagan-bradley", "lahiri", "krishnamurti", "raman"]);
const RULERSHIPS = new Set(["traditional", "modern"]);
function selected(value, allowed, label, fallback) { const choice = value ?? fallback; if (!allowed.has(choice)) throw new TypeError(`${label} must be one of: ${[...allowed].join(", ")}`); return choice; }
export { normalizePrecisionAstronomyRequest, computePrecisionAstronomyPositions };
export { DE440_SHA256, OXIEPHEMERIS_VERSION, PRECISION_RANGE };

export function normalizePrecisionRequest(date, options = {}) {
  const physical = normalizePrecisionAstronomyRequest(date, options);
  const houseSystem = selected(options.houseSystem, HOUSE_SYSTEMS, "houseSystem", "placidus");
  const rulership = selected(options.rulership, RULERSHIPS, "rulership", "traditional");
  const sidereal = options.sidereal === undefined || options.sidereal === null || options.sidereal === ""
    ? null
    : selected(options.sidereal, SIDEREAL_MODES, "sidereal", null);
  if ((houseSystem === "placidus" || houseSystem === "koch") && Math.abs(physical.latitude) >= 66) {
    throw new RangeError(`${houseSystem} houses are refused at |latitude| >= 66; choose whole-sign or equal`);
  }
  return Object.freeze({ ...physical, houseSystem, rulership, sidereal });
}

export async function computePrecisionMoment(date, options, { execute = executeOxiEphemeris, runtime = process.env } = {}) {
  const request = normalizePrecisionRequest(date, options);
  const chart = await execute(request, runtime);
  const physical = await computePrecisionAstronomyPositions(request.time, request, { execute: async () => chart, runtime });
  return { tier: "precision-moment", time: request.time, semanticLayers: { astronomy: { authority: "JPL DE440-backed numerical computation" }, astrology: { tradition: { zodiac: request.sidereal ? `sidereal:${request.sidereal}` : "tropical", houseSystem: request.houseSystem, rulership: request.rulership } } }, location: physical.location, configuration: { zodiac: request.sidereal ? "sidereal" : "tropical", siderealMode: request.sidereal, houseSystem: request.houseSystem, rulership: request.rulership }, metrology: physical.metrology, chart, essentialsCrossCheck: physical.essentialsCrossCheck };
}
