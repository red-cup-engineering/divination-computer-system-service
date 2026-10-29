// Linear resource contexts: each resource is consumed EXACTLY once.
//
// Vocabulary: "linear" is meant in the linear-logic sense — a resource may be
// neither duplicated (consumed twice) nor weakened (left unconsumed). A
// LinearContext is a context Γ of resources; `consume` is the elimination
// step; `settled` is the check that Γ has been emptied, i.e. that the
// evaluation was a valid derivation in the linear discipline. The truncated
// ephemeris theory evaluates its periodic series through `linearSum`, so each
// series term is provably used exactly once per evaluation.
//
// Honesty note: the arithmetic performed on the consumed resources is
// ordinary floating-point summation. What the linear context adds is the
// resource DISCIPLINE — a runtime proof that the composition is linear — not
// a different arithmetic.

export interface LinearContext<T> {
  /** Consume resource `index`; throws if it was already consumed. */
  consume(index: number): T;
  /** Number of resources not yet consumed. */
  remaining(): number;
  /** Assert the context is empty (every resource consumed exactly once). */
  settled(): void;
}

/** Wrap a list of resources as a linear context. */
export function linearContext<T>(resources: readonly T[]): LinearContext<T> {
  const consumed = new Array<boolean>(resources.length).fill(false);
  let left = resources.length;
  return Object.freeze({
    consume(index: number): T {
      if (!(index >= 0 && index < resources.length)) {
        throw new RangeError(`linearContext: no resource at index ${index}`);
      }
      if (consumed[index]) {
        throw new TypeError(`linearContext: resource ${index} consumed twice — contraction is not admissible`);
      }
      consumed[index] = true;
      left -= 1;
      return resources[index] as T;
    },
    remaining(): number {
      return left;
    },
    settled(): void {
      if (left !== 0) {
        throw new TypeError(`linearContext: ${left} resource(s) left unconsumed — weakening is not admissible`);
      }
    },
  });
}

/**
 * Resource-sensitive summation: consume every resource exactly once, in
 * order, mapping each through `evaluate`, and prove exhaustion before
 * returning the sum.
 */
export function linearSum<T>(resources: readonly T[], evaluate: (resource: T) => number): number {
  const context = linearContext(resources);
  let sum = 0;
  for (let index = 0; index < resources.length; index += 1) {
    sum += evaluate(context.consume(index));
  }
  context.settled();
  return sum;
}
