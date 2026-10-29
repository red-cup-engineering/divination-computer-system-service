/**
 * starknowledge -- Lakota star knowledge as the sun's seasonal position.
 * Public sky/season correspondences only (Goodman; Native Skywatchers; Lakota
 * ethnoastronomy), attributed; the closed ceremonial interior is not encoded.
 * Ported into Divination without the settling-core reading layer.
 */
export {
  sunLongitude,
  seasonalPosition,
  SEASONS,
  THRESHOLDS,
  SPRING_JOURNEY,

} from "./starknowledge.mjs";
export { buildSkyPanel, readSky } from "./reading.mjs";
