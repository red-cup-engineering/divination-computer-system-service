/**
 * ifa — the public Ifá Opele casting structure as a divining domain.
 *
 * CULTURAL CONSTRAINT (non-negotiable): Public casting structure attributed to the
 * Yoruba/Ifá tradition; not the initiated oracular corpus. This domain encodes ONLY the
 * public binary casting combinatorics and the public Odu NAMES — no ese Ifá (verse text),
 * interpretations, prescriptions, or sacred meanings; that initiated priestly (Babaláwo)
 * corpus is not ours to encode. Sign valence derives ONLY from structural parity.
 *
 * The casting structure (`./ifa`) and the panel/reading layer (`./reading`) are
 * re-exported here as the domain surface; the thin divining-facing Practice wrapping lives
 * in `../practicing/ifa`.
 */
export {
  PRINCIPAL_ODU,
  CHAIN_POSITIONS,
  COLUMN_MARKS,
  SEEDED_CAST_METHOD,
  castOpele,
  type IfaMark,
  type IfaColumn,
  type IfaCast,
} from "./ifa.mjs";

export { buildPanel, buildPanelFromCast, readCast } from "./reading.mjs";
