/**
 * practicing/ifa — the Ifá Opele cast as a Practice: a query's deterministic cast, as a
 * panel.
 *
 * CULTURAL CONSTRAINT (non-negotiable): Public casting structure attributed to the
 * Yoruba/Ifá tradition; not the initiated oracular corpus. This practice encodes ONLY the
 * public binary casting combinatorics and the public Odu NAMES — never any ese Ifá (verse
 * text), interpretation, prescription, or sacred meaning, which belong to the initiated
 * priestly (Babaláwo) corpus and are not ours to encode. The sign valence derives ONLY
 * from the structural parity of the cast.
 *
 * The thin divining-facing layer mirroring the astrology reference: the Ifá DOMAIN (the
 * Opele cast, the column→Odu naming, the panel) stays in `../ifa`; this only wraps it as a
 * Practice. One query's cast is one panel — the eight chain marks each contribute their
 * structural-parity sign and the identified compound Odu names itself — and the core
 * `read` settles the joined panel into ONE Reading of the question (one verdict per query).
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { buildPanel, readCast } from "../ifa/index.mjs";

/** The Ifá query: the string whose deterministic Opele cast is read. The same query
 * always yields the same cast. */
export interface IfaQuery {
  readonly query: string;
}

/** The Ifá Opele cast as a Practice: a query's deterministic cast settles to one Reading. */
export const ifa: Practice<IfaQuery> = registerPractice({
  name: "ifa",
  summary: "the Opele chain cast from a query — eight binary marks and the named compound Odu as one panel (public casting structure only)",
  buildPanel: (query) => buildPanel(query.query),
  read: (query, question) => readCast(query.query, question),
});
