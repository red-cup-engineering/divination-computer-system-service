// Glyph notation: the standard astrological shorthand for a placement.
//
// Vocabulary: a placement line is `<body glyph> <degree>°<minute>′ <sign
// glyph>`, optionally suffixed ` ℞` when the body is retrograde — e.g.
// `☽ 2°07′ ♉`. Morphisms: encodeGlyphPlacement (body name + ecliptic state
// → line) and decodeGlyphPlacement (line → body name, longitude to the
// arcminute, motion). The body and sign glyph tables are the notation's
// own standard and live here: a codec carries its wire format and nothing
// else (no runtime dependencies; the carrier types are structural).
//
// Laws: decode(encode(x)) recovers the body, the longitude to within half
// an arcminute (the notation's resolution), and retrogradation.

/** The ten bodies the notation names, as the codec's own wire vocabulary. */
export type GlyphBodyName =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

const BODY_GLYPH: Readonly<Record<GlyphBodyName, string>> = Object.freeze({
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
});

const SIGN_GLYPHS: readonly string[] = Object.freeze([
  "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓",
]);

export const RETROGRADE_MARK = "℞";

/** Below this |speed| (degrees/day) the notation shows no motion mark. */
const STATIONARY_BAND = 0.003;

export type GlyphState = Readonly<{
  /** Ecliptic longitude of date, degrees. */
  longitude: number;
  /** dLongitude/dt, degrees per day. */
  speed: number;
}>;

export type GlyphPlacement = Readonly<{
  body: GlyphBodyName;
  /** Ecliptic longitude recovered from the notation, degrees in [0, 360). */
  longitude: number;
  motion: "direct" | "retrograde";
}>;

function fold(degrees: number): number {
  if (!Number.isFinite(degrees)) throw new TypeError("longitude must be a finite number");
  const folded = degrees % 360;
  return folded < 0 ? folded + 360 : folded;
}

export function encodeGlyphPlacement(body: GlyphBodyName, state: GlyphState): string {
  const glyph = BODY_GLYPH[body];
  if (!glyph) throw new TypeError(`unknown body name: ${body}`);
  const folded = fold(state.longitude);
  const signIndex = Math.floor(folded / 30) % 12;
  const degreeInSign = folded - signIndex * 30;
  const wholeDegrees = Math.floor(degreeInSign);
  const minutes = Math.round((degreeInSign - wholeDegrees) * 60);
  // 59.6′ rounds to 60: carry, staying inside the sign's arc notationally.
  const carried = minutes === 60;
  const degreeText = carried ? wholeDegrees + 1 : wholeDegrees;
  const minuteText = String(carried ? 0 : minutes).padStart(2, "0");
  const retrograde = state.speed < -STATIONARY_BAND ? ` ${RETROGRADE_MARK}` : "";
  return `${glyph} ${degreeText}°${minuteText}′ ${SIGN_GLYPHS[signIndex]}${retrograde}`;
}

const PLACEMENT_PATTERN = /^(\S)\s+(\d{1,2})°(\d{2})′\s+(\S)(?:\s+(℞))?$/u;

export function decodeGlyphPlacement(line: string): GlyphPlacement {
  if (typeof line !== "string") throw new TypeError("glyph placement must be a string");
  const match = PLACEMENT_PATTERN.exec(line.trim());
  if (!match) throw new TypeError(`not a glyph placement line: ${line}`);
  const [, bodyGlyph, degreeText, minuteText, signGlyph, retrogradeMark] = match;
  const body = (Object.keys(BODY_GLYPH) as readonly GlyphBodyName[]).find(
    (candidate) => BODY_GLYPH[candidate] === bodyGlyph,
  );
  if (!body) throw new TypeError(`unknown body glyph: ${bodyGlyph}`);
  const signIndex = SIGN_GLYPHS.indexOf(signGlyph as string);
  if (signIndex === -1) throw new TypeError(`unknown sign glyph: ${signGlyph}`);
  const degrees = Number(degreeText);
  const minutes = Number(minuteText);
  if (degrees > 30 || minutes >= 60) throw new TypeError(`degrees out of a sign's arc: ${line}`);
  return Object.freeze({
    body,
    longitude: fold(signIndex * 30 + degrees + minutes / 60),
    motion: (retrogradeMark ? "retrograde" : "direct") as GlyphPlacement["motion"],
  });
}

/** Chart placements as glyph lines; stationary bodies are noted in words. */
export function renderChartGlyphs(states: Readonly<Partial<Record<GlyphBodyName, GlyphState>>>): string {
  return (Object.entries(states) as readonly [GlyphBodyName, GlyphState][])
    .map(
      ([body, state]) =>
        encodeGlyphPlacement(body, state) + (Math.abs(state.speed) <= STATIONARY_BAND ? " (stationary)" : ""),
    )
    .join("\n");
}
