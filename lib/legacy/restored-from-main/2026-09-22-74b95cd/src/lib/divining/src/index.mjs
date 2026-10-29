/**
 * @lenticule-science/divining -- sign-reading practice producers, live at Divination.
 *
 * This package carries the practice producers and a clean common Reading
 * settlement for the live Divination service:
 * astrology, tarot/numerology, the computus, the lectionary, geomancy, the
 * I Ching, Ifa, runes, the Numogram, and Lakota star knowledge, each as
 * domain mathematics. It ships source, not dist-only, and its declared
 * dependencies provide shared astronomy computation and FOUR charges without
 * importing the dead agential-relationality archive.
 *
 * `settleReading` is the clean replacement for the legacy core's basic
 * panel settlement: it joins a panel of sign witnesses through the current
 * Articulating FOUR provider. The legacy `panelConsensus`, sigma-dual
 * prediction, and D4 gauge-orbit APIs remain unported. The legacy depended on
 * `@lenticule-science/{relating,knowing,playing,socializing,communicating}` in
 * the dead agential-relationality archive; this package does not rewire to it.
 * See ../../../content/text/documents/sign-reading-as-settling.md.
 *
 * A consumer wanting a plain indicator set (a moon phase, a tarot card, a
 * numerological reduction, a lection) calls a domain's own producers
 * directly or uses the common Reading object, whose FOUR settlement comes
 * from the current Articulating provider.
 */

export * as astrology from "./astrology/index.mjs";
export * as divination from "./divination/index.mjs";
export * as divinationCodecs from "./divination/codecs/index.mjs";
export * as calendar from "./calendar/index.mjs";
export * as liturgy from "./liturgy/index.mjs";
export * as geomancy from "./geomancy/index.mjs";
export * as iching from "./iching/index.mjs";
export * as ifa from "./ifa/index.mjs";
export * as runes from "./runes/index.mjs";
export * as numogram from "./numogram/index.mjs";
export * as starknowledge from "./starknowledge/index.mjs";
export * from "./reading.mjs";
