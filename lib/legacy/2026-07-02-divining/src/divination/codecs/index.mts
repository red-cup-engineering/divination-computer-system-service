// divination-codecs: coders/decoders for divination representations.
//
// Glyph notation (glyph), the tarot spread document the polity's
// encoding-a-tarot-spread skill writes (spread), and the daily-indicators
// document with its canonical markdown brief (indicators). The record
// types are structural wire shapes; divining carriers and derived readings
// satisfy them without being imported — codecs carry nothing.

export {
  RETROGRADE_MARK,
  encodeGlyphPlacement,
  decodeGlyphPlacement,
  renderChartGlyphs,
  type GlyphBodyName,
  type GlyphState,
  type GlyphPlacement,
} from "./glyph.mjs";

export {
  encodeSpreadDocument,
  decodeSpreadDocument,
  type SpreadDocument,
  type SpreadRecord,
  type SpreadPositionRecord,
  type CardRecord,
  type OrientationName,
} from "./spread.mjs";

export {
  encodeDailyIndicators,
  decodeDailyIndicators,
  assertDailyIndicators,
  renderIndicatorsBrief,
  type DailyIndicatorsRecord,
  type MotionRecord,
} from "./indicators.mjs";
