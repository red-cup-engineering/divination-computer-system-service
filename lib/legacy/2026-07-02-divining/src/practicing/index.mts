/**
 * practicing — the uniform Practice template, the registry, and the registered
 * methods. Each practice module self-registers on import; this barrel imports them
 * (so the registry is populated) and re-exports the template surface.
 *
 * To add a method: write `practicing/<name>.mts` that builds a panel from its query
 * and calls `registerPractice`, then add its import here. The Reading core is shared.
 */
import "./astrology.mjs";
import "./cartomancy.mjs";
import "./numerology.mjs";
import "./computus.mjs";
import "./lectionary.mjs";
import "./numogram.mjs";
import "./iching.mjs";
import "./geomancy.mjs";
import "./runes.mjs";
import "./ifa.mjs";
import "./starknowledge.mjs";

export { registerPractice, practices, practiceNamed, type Practice } from "./registry.mjs";
export { astrology, type AstrologyQuery } from "./astrology.mjs";
export { cartomancy, type CartomancyQuery } from "./cartomancy.mjs";
export { numerology, type NumerologyQuery } from "./numerology.mjs";
export { computus, type ComputusQuery } from "./computus.mjs";
export { lectionary, type LectionaryQuery } from "./lectionary.mjs";
export { numogram, type NumogramQuery } from "./numogram.mjs";
export { iching, type IChingQuery } from "./iching.mjs";
export { geomancy, type GeomancyQuery } from "./geomancy.mjs";
export { runes, type RunesQuery } from "./runes.mjs";
export { ifa, type IfaQuery } from "./ifa.mjs";
export { starknowledge, type StarKnowledgeQuery } from "./starknowledge.mjs";
