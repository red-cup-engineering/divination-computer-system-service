/**
 * settling/reading — the divining Reading: a settled sign-charge at a cut, presented
 * as the σ-dual pair DIAGNOSIS (≤knowledge, the held present) and PREDICTION
 * (≤truth, the reach toward the not-yet), carrying its full D₄ orbit.
 *
 * A Reading is the settled object of divining. A panel of sign-witnesses is
 * adjudicated by the knowledge-join: corroboration joins positively, refutation
 * through `negate`, and an irreconcilable contradiction is HELD at `stable` (⊤,
 * "told both"), local to its cell, not exploded. The fold is a finite knowledge-join,
 * so one pass IS the fixed point. The settled charge's value on the knowledge order
 * is the diagnosis; its order-swap σ is the prediction — the Priestley dual on the
 * truth order. The eight dihedral images are the reading's D₄ orbit: the gauge of
 * counter-omen ∼ and time-reversal −, extended by the order-swap σ.
 *
 * This generalizes `astrology/experimental/settlement` (a panel of ephemeris
 * theories) into the package core; every divinatory practice — cartomantic,
 * numerological, calendrical, liturgical — produces a panel of `SignWitness`es and
 * reads it here. The faculties enrich each pole later: `knowing` makes the diagnosis
 * a cognized known-state, `playing` makes the prediction a cut-interaction, and
 * `socializing` makes the panel a Social Field.
 */
import {
  bottom,
  cell,
  claim,
  dihedral,
  dihedralElementNames,
  entitySet,
  mark,
  meme,
  negate,
  orderSwapValue,
  predicateOfClaim,
  sameChargeValue,
  token,
  valueOf,
  witnessedPotential,
  allCells,
  type ChargeCarrier,
  type ChargeValue,
  type DihedralElementName,
  type JsonRecord,
  type JsonValue,
} from "@emsenn/relating";
import {
  admitField,
  completeTranslations,
  convergeAction,
  emptyField,
  type SocialField,
  type SocialMember,
} from "@emsenn/socializing";
// knowing — the comonad on Meme working the knowledge order ≤_k. `standingOf` reads a
// meme's FOUR ≤_k standing (the diagnosis as a cognized known-state). This is the
// diagnosis pole's faculty enrichment: the diagnosis is the held PRESENT, knowledge.
import { standingOf } from "@emsenn/knowing";
// playing — the *-autonomous interaction faculty. design/dualize/interact are the cut:
// a Design ⊗ Design^⊥ → Interaction. This is the prediction pole's faculty enrichment:
// the cut is the real ludics interaction the prediction reaches toward. JSON in/out.
import { designAction, dualizeAction, interactAction } from "@emsenn/playing";
import type { DiviningCarrier } from "../../../../topology/index.mjs";

/** The cut a reading is taken at — the divinatory "now"/horizon. The transitional
 * surface where `playing`'s interaction (the Girard cut) and a settling clopen will
 * later refine it; for now a labeled moment. */
export interface DiviningCut {
  readonly kind: "divining.cut";
  readonly at: string;
}

/** Construct a cut at a labeled moment. */
export const cut = (at: string): DiviningCut => Object.freeze({ kind: "divining.cut" as const, at });

/** One source's charged testimony about the question: a named witness and the charge
 * it contributes to the panel. */
export interface SignWitness {
  readonly kind: "divining.sign";
  readonly witness: string;
  readonly charge: ChargeCarrier;
}

/** A sign that affirms (corroborates): a potential charge witnessed by its source. */
export const corroborating = (witness: string): SignWitness =>
  Object.freeze({ kind: "divining.sign" as const, witness, charge: witnessedPotential(mark(witness)) });

/** A sign that denies (refutes): the negation of its source's potential charge. */
export const refuting = (witness: string): SignWitness =>
  Object.freeze({ kind: "divining.sign" as const, witness, charge: negate(witnessedPotential(mark(witness))) });

/** A sign carrying an already-formed charge (a domain reading's own testimony). */
export const signing = (witness: string, charge: ChargeCarrier): SignWitness =>
  Object.freeze({ kind: "divining.sign" as const, witness, charge });

/** The shared question-cell every panel sign predicates over: all signs concern the
 * ONE question, so they are observers settling over a single base cell. A fixed cell
 * built from relating's `allCells` over a two-token entity set (the question subject and
 * its object), tagged with the divining predicate. */
const QUESTION_CELL = (() => {
  const subject = token(mark("divining.question.subject"));
  const object = token(mark("divining.question.object"));
  const [s, o] = allCells(entitySet([subject, object], (l, r) => l === r))[0]!;
  return cell(s, predicateOfClaim(claim(mark("divining.adjudicates"))), o);
})();

/** Build the Social Field whose members are the panel's signs: each sign is one
 * observer holding a single `meme(QUESTION_CELL, sign.charge)` over the shared
 * question-cell, with the fully-connected observer category over the panel. The empty
 * panel yields the empty field (whose converge reports `absurd`/no obstruction). */
function panelField(panel: readonly SignWitness[]): SocialField {
  if (panel.length === 0) return emptyField();
  const members: readonly SocialMember[] = panel.map((sign, index) =>
    Object.freeze({
      kind: "socializing.member" as const,
      agent: Object.freeze({
        kind: "animating.agent",
        name: `${sign.witness}|${index}`,
      }) as unknown as JsonRecord,
      memes: Object.freeze([meme(QUESTION_CELL, sign.charge) as unknown as JsonRecord]),
    }),
  );
  return Object.freeze({
    ...emptyField(),
    members,
    base: Object.freeze({
      kind: "socializing.social-base" as const,
      translations: completeTranslations(panel.length),
    }),
  }) as unknown as SocialField;
}

/** Lift a charge that has crossed the convergeAction JSON transport (its evidence Marks
 * degraded to plain objects) back into a genuine frozen `ChargeCarrier`: re-`mark` each
 * evidence entry so `negate`/the orbit see live Marks, keyed by the same bilattice value.
 * The value (coordinates) is carried through verbatim — the consensus decision is the
 * value; this only re-homes the evidence into the carrier shape `adjudicate` promises. */
function liftConsensusCharge(pooled: JsonRecord): ChargeCarrier {
  const value = (pooled as unknown as { readonly value: readonly [unknown, unknown] }).value;
  const rawEvidence = (pooled as unknown as { readonly evidence?: readonly [readonly unknown[], readonly unknown[]] }).evidence;
  const positive = (rawEvidence?.[0] ?? []).map((m) => mark((m as { readonly value?: unknown }).value ?? m));
  const negative = (rawEvidence?.[1] ?? []).map((m) => mark((m as { readonly value?: unknown }).value ?? m));
  return Object.freeze({
    kind: "bilattice-charge.carrier" as const,
    value: Object.freeze([value[0], value[1]] as const),
    evidence: Object.freeze([Object.freeze(positive), Object.freeze(negative)] as const),
  }) as unknown as ChargeCarrier;
}

/**
 * Adjudicate a panel into one settled charge by routing it through a socializing Social
 * Field consensus. Each sign is one OBSERVER holding a single meme over the shared
 * question-cell; the observers are fully connected, and `converge` reads the
 * network-sheaf consensus over the (single) connected component. The component's `pooled`
 * charge is the knowledge-join `∨_k` over the panel — consensus.mts builds `pooled` by
 * `joinKnowledge`-folding the component's charges, exactly the finite knowledge-join
 * fixed point divining already settled to (one pass IS the fixed point). The empty panel
 * takes the emptyField path: no component, so it settles to `bottom` (absurd,
 * ⊥knowledge — no sign).
 *
 * `pooled` (the `∨_k` join) is the corner that matches the plain knowledge-join fold;
 * `common` (the `∧_k` meet) does not — so we read `pooled`. It is lifted back across the
 * convergeAction JSON transport into a genuine carrier.
 */
export function adjudicate(panel: readonly SignWitness[]): ChargeCarrier {
  return panelConsensus(panel).charge;
}

/** The settled consensus of a panel AND its social cost: the adjudicated charge (the
 * single component's `∨_k` `pooled`) together with the opposition-H¹ `obstruction`,
 * whether the panel's signs `glued` into one common section, and whether reaching
 * consensus is `coordinationFree` (H¹ = 0, CALM). Read off the Social Field `converge`
 * writes over the fully-connected panel. */
export function panelConsensus(panel: readonly SignWitness[]): {
  readonly charge: ChargeCarrier;
  readonly obstruction: number;
  readonly glued: boolean;
  readonly coordinationFree: boolean;
} {
  const converged = admitField(
    convergeAction.run(panelField(panel) as unknown as JsonValue, {}) as JsonValue,
    "divining.adjudicate",
  );
  const section = converged.section;
  // The whole fully-connected panel is one component (or none, for the empty panel).
  // Its `pooled` (∨_k) is the adjudicated charge; the empty panel has no component and
  // settles to `bottom` (absurd, ⊥knowledge).
  const component = section.components[0];
  const charge = component === undefined ? bottom : liftConsensusCharge(component.pooled);
  return Object.freeze({
    charge,
    obstruction: section.obstruction,
    glued: section.glued,
    coordinationFree: section.coordinationFree,
  });
}

/** A reading's consensus cost: the social cost of settling the panel, surfaced from the
 * Social Field `converge` — the opposition-H¹ obstruction, whether the signs glued, and
 * whether consensus is coordination-free (CALM). */
export interface ReadingConsensus {
  readonly kind: "divining.reading.consensus";
  /** The opposition-H¹: the first Betti number of the disagreement subgraph. 0 ⇒ the
   * panel glues into one common section (no cycle of standing disagreement). */
  readonly obstruction: number;
  /** Whether the panel's signs glue into a single common section (⟺ obstruction = 0). */
  readonly glued: boolean;
  /** Whether reaching consensus is coordination-free (H¹ = 0 — the CALM flag). */
  readonly coordinationFree: boolean;
}

/** One dihedral image of the diagnosis: a gauge element and the value it sends the
 * diagnosis to. */
export interface OrbitImage {
  readonly element: DihedralElementName;
  readonly value: ChargeValue;
}

/** The FOUR knowledge-order standing a diagnosis cognizes to (knowing's ≤_k poset). */
export type ReadingStanding = "absurd" | "active" | "potential" | "stable";

/**
 * The diagnosis pole's faculty enrichment (knowing): the diagnosis read as a knowing
 * KNOWN-STATE. The settled charge is wrapped as a meme over the shared question-cell and
 * cognized by knowing's `standingOf` — its FOUR knowledge-order standing on ≤_k. The
 * standing is the diagnosis name confirmed through the comonad's extract; `contested`
 * marks a HELD contradiction (standing `stable` with BOTH evidence sides populated — the
 * panel told both and the conflict is held local, not exploded). */
export interface ReadingCognition {
  readonly kind: "divining.reading.cognition";
  /** The diagnosis's ≤_k knowledge standing (= the diagnosis value name; knowing confirms,
   * does not change). */
  readonly standing: ReadingStanding;
  /** Whether the diagnosis holds a both-sides-witnessed contradiction settled stable. */
  readonly contested: boolean;
}

/**
 * The prediction pole's faculty enrichment (playing): the Girard CUT of the diagnosis
 * against its dual. The diagnosis value is mapped to a ludics ACT (potential→proponent,
 * active→opponent, stable→daimon, absurd→none), built as a single-locus `design`; its
 * `dualize` (the ≤_t polarity involution, fate's counter-design) is cut against it by
 * `interact`. `converges` is true when the cut reaches a Daimon/orthogonal normal form
 * (the interaction report records ≥1 Daimon locus where the two designs collide into ⊤).
 *
 * Note this is the CUT-INTERACTION reading, NOT the prediction value: the σ order-swap
 * `prediction` stays the Priestley dual on ≤_t; this `interaction` is the *-autonomous
 * cut, the second, orthogonal faculty reading of the same pole. */
export interface ReadingInteraction {
  readonly kind: "divining.reading.interaction";
  /** The encoded Design built from the diagnosis act (playing/design). */
  readonly design: JsonValue;
  /** Its dual Design — fate's counter-design, the ≤_t polarity involution (playing/design). */
  readonly dual: JsonValue;
  /** The interaction report (playing/interaction): the normal form, per-locus meetings,
   * and the Daimon loci where the cut converges. */
  readonly report: JsonValue;
  /** Whether the cut reaches a Daimon/orthogonal normal form (≥1 Daimon locus). */
  readonly converges: boolean;
}

/** The ludics ACT a diagnosis value cognizes to, in bijection with the FOUR charge
 * values: potential→proponent, active→opponent, stable→daimon, absurd→none. */
const DIAGNOSIS_ACT: { readonly [s in ReadingStanding]: "proponent" | "opponent" | "daimon" | "none" } = Object.freeze({
  potential: "proponent",
  active: "opponent",
  stable: "daimon",
  absurd: "none",
});

/**
 * Cognize a settled charge as a knowing known-state (the diagnosis pole). Wrap the charge
 * as a meme over the shared question-cell and read its ≤_k standing with knowing's pure
 * `standingOf`; `contested` is a held contradiction (standing `stable` with both evidence
 * sides populated). The standing equals the diagnosis value name — knowing confirms the
 * already-settled standing, it does not change it. */
export function cognize(settled: ChargeCarrier): ReadingCognition {
  const m = meme(QUESTION_CELL, settled);
  const standing = standingOf(m) as ReadingStanding;
  const evidence = (settled as unknown as { readonly evidence?: readonly [readonly unknown[], readonly unknown[]] }).evidence;
  const contested = standing === "stable"
    && (evidence?.[0]?.length ?? 0) > 0
    && (evidence?.[1]?.length ?? 0) > 0;
  return Object.freeze({ kind: "divining.reading.cognition" as const, standing, contested });
}

/**
 * Cut a settled diagnosis against its dual (the prediction pole's playing enrichment).
 * Map the diagnosis value to a ludics act at the root locus, `design` it, `dualize` it
 * (fate's counter-design), and `interact` (the cut). `converges` reflects whether the cut
 * reaches a Daimon/orthogonal normal form — the report records ≥1 Daimon locus. The
 * playing actions are JSON in/out (like `convergeAction` above); their `.run` already
 * returns a `jsonResource` JsonValue, so no further parse is needed at this boundary. */
export function cutOf(diagnosis: ChargeValue): ReadingInteraction {
  const act = DIAGNOSIS_ACT[diagnosis.name as ReadingStanding] ?? "none";
  const design = designAction.run({ entries: [{ locus: "", act }] } as unknown as JsonValue, {});
  const dual = dualizeAction.run(design, {});
  const report = interactAction.run({ designA: design, designB: dual } as unknown as JsonValue, {});
  const daimonLoci = (report as unknown as { readonly daimonLoci?: readonly unknown[] }).daimonLoci;
  const converges = Array.isArray(daimonLoci) && daimonLoci.length > 0;
  return Object.freeze({ kind: "divining.reading.interaction" as const, design, dual, report, converges });
}

/**
 * A divining Reading: the settled charge at a cut, read as the σ-dual pair
 * diagnosis/prediction with its D₄ orbit.
 */
export interface Reading {
  readonly kind: "divining.reading";
  /** The admitted question this reads (a communicating carrier). */
  readonly question: DiviningCarrier;
  /** The cut the reading is taken at. */
  readonly cut: DiviningCut;
  /** The settled, adjudicated charge — the panel's knowledge-join, evidence and all. */
  readonly charge: ChargeCarrier;
  /** Diagnosis: the settled value on the knowledge order — the held present. */
  readonly diagnosis: ChargeValue;
  /** Prediction: the order-swap σ of the diagnosis — the truth-order reach toward the
   * not-yet, the Priestley dual of the diagnosis. */
  readonly prediction: ChargeValue;
  /** The reading's D₄ orbit: the eight dihedral images of the diagnosis. */
  readonly orbit: readonly OrbitImage[];
  /** Whether the settled reading HOLDS a contradiction: the diagnosis is `stable`
   * (⊤knowledge, "told both") — the panel disagreed and the conflict is held local,
   * not exploded. Carried by the diagnosis value; surfaced here for convenience. */
  readonly holdsContradiction: boolean;
  /** The social cost of settling this panel: the Social Field consensus the panel
   * converged to — its opposition-H¹ obstruction, whether the signs glued, and whether
   * consensus was coordination-free. The panel is adjudicated AS a multi-observer
   * consensus; this surfaces the cost the `charge`/`diagnosis` alone do not show. */
  readonly consensus: ReadingConsensus;
  /** The diagnosis pole's faculty enrichment (knowing): the diagnosis read as a known-state
   * — its ≤_k knowledge standing and whether it holds a contested contradiction. */
  readonly cognition: ReadingCognition;
  /** The prediction pole's faculty enrichment (playing): the Girard cut of the diagnosis
   * against its dual — the design, its counter-design, the interaction report, and whether
   * the cut converges to a Daimon normal form. Orthogonal to the σ `prediction`, which
   * stays the Priestley dual. */
  readonly interaction: ReadingInteraction;
}

/**
 * Read a panel of sign-witnesses at a cut into a Reading of the question. The panel
 * is adjudicated to a settled charge; the diagnosis is its knowledge-order value, the
 * prediction its order-swap, and the orbit its eight dihedral images.
 */
export function read(question: DiviningCarrier, c: DiviningCut, panel: readonly SignWitness[]): Reading {
  const social = panelConsensus(panel);
  const settled = social.charge;
  const diagnosis = valueOf(settled);
  const prediction = orderSwapValue(diagnosis);
  const orbit: readonly OrbitImage[] = Object.freeze(
    dihedralElementNames.map((element) => Object.freeze({ element, value: dihedral(element, diagnosis) })),
  );
  return Object.freeze({
    kind: "divining.reading" as const,
    question,
    cut: c,
    charge: settled,
    diagnosis,
    prediction,
    orbit,
    holdsContradiction: diagnosis.name === "stable",
    consensus: Object.freeze({
      kind: "divining.reading.consensus" as const,
      obstruction: social.obstruction,
      glued: social.glued,
      coordinationFree: social.coordinationFree,
    }),
    cognition: cognize(settled),
    interaction: cutOf(diagnosis),
  });
}

/** A witness that a reading's two poles are genuinely Priestley-dual: the prediction
 * is the order-swap σ of the diagnosis. */
export interface ReadingDualityWitness {
  readonly kind: "divining.readingDuality:witness";
  readonly diagnosis: ChargeValue;
  readonly prediction: ChargeValue;
}

/** An obstruction: a reading's prediction is not the order-swap of its diagnosis. */
export interface ReadingDualityObstruction {
  readonly kind: "divining.readingDuality-obstruction";
  readonly diagnosis: ChargeValue;
  readonly prediction: ChargeValue;
  readonly expected: ChargeValue;
}

/** The result of testing that a reading's poles are σ-dual. */
export type ReadingDualityJudgment = ReadingDualityWitness | ReadingDualityObstruction;

/** Witness that diagnosis and prediction are the order-swap dual pair of the reading. */
export function readingDuality(reading: Reading): ReadingDualityJudgment {
  const expected = orderSwapValue(reading.diagnosis);
  return sameChargeValue(expected, reading.prediction)
    ? Object.freeze({ kind: "divining.readingDuality:witness" as const, diagnosis: reading.diagnosis, prediction: reading.prediction })
    : Object.freeze({ kind: "divining.readingDuality-obstruction" as const, diagnosis: reading.diagnosis, prediction: reading.prediction, expected });
}
