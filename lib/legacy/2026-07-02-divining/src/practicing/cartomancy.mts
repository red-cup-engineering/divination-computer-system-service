/**
 * practicing/cartomancy — tarot as a Practice: the day's drawn spread, as a panel.
 *
 * Mirrors the REFERENCE `./astrology` exactly. The cartomancy DOMAIN (the deck, the
 * seeded draw, spread machinery, the spread→SignWitness reading) stays in
 * `../divination`; this is only the thin divining-facing layer. A day is one panel:
 * the domain's seeded `dailySpread` draws that day's card, each drawn card contributes
 * its sign (upright corroborates, reversed refutes via `buildSpreadPanel`), and the
 * domain's `readSpread` settles the joined panel — admitting the question and cutting
 * at the spread's own instant — into one Reading.
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { dailySpread } from "../divination/tarot.mjs";
import { buildSpreadPanel, readSpread } from "../divination/reading.mjs";

/** The cartomancy query: the ISO date whose daily spread is read. */
export interface CartomancyQuery {
  readonly date: string;
}

/** Cartomancy as a Practice: the day's drawn spread settles to one Reading. */
export const cartomancy: Practice<CartomancyQuery> = registerPractice({
  name: "cartomancy",
  summary: "the day's drawn spread — each card's orientation as one panel of testimony",
  buildPanel: (query) => buildSpreadPanel(dailySpread(query.date)),
  read: (query, question) => readSpread(query.date, question),
});
