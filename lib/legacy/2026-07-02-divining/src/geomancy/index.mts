// geomancy — Western / Arabic ʿilm al-raml as mathematics: the geomantic SHIELD.
//
// The figure structure, the canonical sixteen figures and their valences, and the
// deterministic cast/reduction of the shield from a query (geomancy); and the thin
// divining-facing layer that turns the cast shield into a SignWitness panel read by the
// core (reading).

export {
  FIGURES,
  SEEDED_CAST_METHOD,
  figureKey,
  nameFigure,
  castMothers,
  castShield,
  type GeomanticRow,
  type Figure,
  type Valence,
  type NamedFigure,
  type Shield,
} from "./geomancy.mjs";

export { buildShieldPanel, buildPanel, readShield } from "./reading.mjs";
