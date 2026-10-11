# Ephemeris Tracking Team

A xiaowei (RenDanHeYi micro-enterprise) inside Divination. Its order is
every consuming enterprise's own need for a planetary chart that carries
its own provenance — which algorithm computed it, at what accuracy — rather
than a body's position asserted with no ephemeris behind it.

## Realization

The chart computation lives in Divination's own practice-producer library:
`src/lib/divining/src/astrology/` — `ephemeris.mts` (`computeChart`,
`bodyLongitude`, `findIngresses`, `findStations`, `findExactAspects`,
`findLunationQuarters`, each carrying `EPHEMERIS_PROVENANCE`), `chart.mts`
(the `Chart`/`ChartProvenance` carrier), `aspects.mts` (angular relations
within orb), `lunation.mts` (the Sun-Moon elongation cycle), `zodiac.mts`,
`time.mts`, and `events.mts` (zero-crossing machinery, currently
meeus-truncated-series + jpl-approximate-elements, zero-dependency). This
team's charge is the accuracy and honest provenance of that ephemeris, not
a separate codebase run in parallel to it.

## The one hard constraint

A chart is never presented without `EPHEMERIS_PROVENANCE` beside it. If a
future higher-accuracy ephemeris (full VSOP87, a JPL DE kernel) replaces
the current truncated series, the provenance names the change; a chart
never quietly gets more or less accurate without that being visible to
whatever consumed it.

## Sellable tiers

- `computeEphemeris(date)` is the Moment Essentials product. It returns all ten body
  positions and velocities, sign degree/glyph/element/modality, three-state
  motion, lunar phase and illumination, major aspects, provenance,
  and audited per-body error bounds.
- `computePrecisionMoment(date, location)` is the Precision Moment product.
  It recomputes the same instant from a pinned JPL DE440 kernel and returns
  raw apparent-place measurements plus a location-specific chart: houses,
  angles, nodes, lots, sect, dignities, distributions, and expanded aspects.
  It also reports divergence from Moment Essentials rather than disguising
  presentation resolution as physical accuracy.

These functions contain no payment or hosting authority. The separately
owned paid gateway contracts for them and projects them to x402/Bazaar.

## Theory basis

- The RenDanHeYi xiaowei model: a unit constituted by the users its
  producer serves, not a department wearing the name.
- The legacy `@emsenn/divining` package's own design: astrology is one
  Practice among several, a functor from a query (an instant) to a panel of
  sign-witnesses (placements, aspects, ingresses), each witness carrying
  its own provenance.
