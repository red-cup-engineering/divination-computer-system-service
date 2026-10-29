/**
 * practicing — the uniform Practice template and registry.
 *
 * A Practice is ONE divinatory method, reduced to its essence: a functor from a
 * `Query` to a panel of `SignWitness`es, read through the core `read` into a
 * `Reading`. Astrology, cartomancy, the computus, a Lakota star reading, the
 * Numogram, the I Ching — every method is one Practice of the SAME shape,
 * registered here.
 *
 * The Reading core (the σ-dual diagnosis/prediction, the D₄ orbit, the socializing
 * panel adjudication, the knowing/playing poles) is shared and settled; a Practice
 * decides only what its SIGNS are — what counts as a corroborating or refuting
 * witness in that method. Growing the chain is therefore a ritual: add a
 * `practicing/<name>.mts` that builds a panel from a query and call
 * `registerPractice`. Nothing in the core changes.
 */
import type { Reading, SignWitness } from "../articulating/predicating/positing/settling/reading.mjs";
import type { DiviningCarrier } from "../topology/index.mjs";

/**
 * A divinatory method: a query → a panel of sign-witnesses → a Reading.
 *
 * `Query` is the method's own admitted input (an instant, a drawn spread, a date,
 * a number, a cast). `buildPanel` posits the signs; `read` settles them through the
 * core, admitting a string `question` via `divine` or accepting a carrier.
 */
export interface Practice<Query = never> {
  /** The method's name — its registry key and (later) its projected verb. */
  readonly name: string;
  /** One line: what the method reads. */
  readonly summary: string;
  /** Posit the panel of sign-witnesses this method reads from a query. */
  buildPanel(query: Query): readonly SignWitness[];
  /** Settle a query into a Reading of the question. */
  read(query: Query, question: DiviningCarrier | string): Reading;
}

const registry = new Map<string, Practice<never>>();

/**
 * Register a Practice — runs at module load (the practice's module self-registers).
 * Returns the practice so the module can also export it by name. Throws on a
 * duplicate name (two methods cannot claim the same verb).
 */
export function registerPractice<Query>(practice: Practice<Query>): Practice<Query> {
  if (registry.has(practice.name)) {
    throw new Error(`practicing: a practice named ${JSON.stringify(practice.name)} is already registered`);
  }
  registry.set(practice.name, practice);
  return practice;
}

/** Every registered practice, in registration order. */
export const practices = (): readonly Practice<never>[] => Object.freeze([...registry.values()]);

/** The registered practice of a given name, or `undefined`. */
export const practiceNamed = (name: string): Practice<never> | undefined => registry.get(name);
