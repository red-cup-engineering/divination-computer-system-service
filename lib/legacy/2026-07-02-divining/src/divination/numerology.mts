// Numerological reduction: iterated digit sum on the naturals, with the
// conventional fixed set of "master numbers" exempted from further reduction.
//
// Vocabulary: the reduction is the orbit of the digit-sum map until it lands
// in the terminal set {1..9} ∪ {11, 22, 33}. A DateReduction records the
// whole orbit (the steps are part of the reading, not just the answer) and
// names the kind of terminal reached — "master" or "simple" — as a
// two-valued reading, not a boolean.

export type ReductionKind = "simple" | "master";

export const MASTER_NUMBERS: readonly number[] = Object.freeze([11, 22, 33]);

export type DateReduction = Readonly<{
  /** The ISO date reduced, e.g. "2026-06-11". */
  date: string;
  /** The orbit of the digit-sum map, starting from the full digit sum. */
  steps: readonly number[];
  /** The terminal value. */
  value: number;
  kind: ReductionKind;
}>;

function digitSum(value: number): number {
  let sum = 0;
  let rest = value;
  while (rest > 0) {
    sum += rest % 10;
    rest = Math.floor(rest / 10);
  }
  return sum;
}

/** Reduce an ISO date's digits numerologically, recording the orbit. */
export function reduceDate(dateIso: string): DateReduction {
  const digits = dateIso.replace(/[^0-9]/g, "");
  if (digits.length === 0) throw new TypeError(`no digits to reduce in: ${dateIso}`);
  // The first digit sum is computed digit by digit: the concatenated date
  // may exceed safe-integer range as a single number.
  let current = [...digits].reduce((sum, digit) => sum + Number(digit), 0);
  const steps: number[] = [current];
  while (current > 9 && !MASTER_NUMBERS.includes(current)) {
    current = digitSum(current);
    steps.push(current);
  }
  return Object.freeze({
    date: dateIso,
    steps: Object.freeze(steps),
    value: current,
    kind: (MASTER_NUMBERS.includes(current) ? "master" : "simple") as ReductionKind,
  });
}
