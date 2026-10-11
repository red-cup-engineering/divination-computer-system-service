---
title: "Divination sub-domain consolidation: merging astrology, divination, calendar, and liturgy"
description: "Design, assembly, rewiring, and isolated verification for collapsing six divination-domain packages into @561-group/divination via sub-domain subpaths."
date: 2026-06-15
status: salvaged-from-tmp
source: "/tmp/claude-1001/-home-emsenn-561-group/e5fced88-124c-4481-a94f-3939e05f74d5/tasks/wk4iqegyl.output"
---

# Divination sub-domain consolidation

**Summary:** Collapse astrology/divination/calendar/liturgy into `@561-group/divination` (sub-domain subpaths); rewire; dedup; additive; isolated verify.

Design line: `divination design: ./astrology ./astrology/experimental ./divination ./divination/codecs ./calendar ./liturgy`

## Design

### Subpaths

| Subpath | From dir |
| --- | --- |
| `./astrology` | `lib/astrology-topology` |
| `./astrology/experimental` | `lib/astrology-topology-experimental` |
| `./divination` | `lib/divination-topology` |
| `./divination/codecs` | `lib/divination-codecs` |
| `./calendar` | `lib/calendar-topology` |
| `./liturgy` | `lib/liturgy-topology` |

### Import map

| From | To |
| --- | --- |
| `@561-group/astrology-topology` | `@561-group/divination/astrology` |
| `@561-group/astrology-topology-experimental` | `@561-group/divination/astrology/experimental` |
| `@561-group/divination-topology` | `@561-group/divination/divination` |
| `@561-group/divination-codecs` | `@561-group/divination/divination/codecs` |
| `@561-group/calendar-topology` | `@561-group/divination/calendar` |
| `@561-group/liturgy-topology` | `@561-group/divination/liturgy` |

### Internal dependency edges

- **divination -> astrology** (runtime; `divination/src/indicators.mts` mounts astrology vocabulary).
  Rewrite `"@561-group/astrology-topology"` -> relative `"../astrology/index.mjs"`.
- **astrology/experimental -> astrology** (runtime; `settlement.mts`, `theories.mts`, `closure-events.mts`).
  Rewrite `"@561-group/astrology-topology"` -> relative `"../index.mjs"` (from `astrology/experimental/` up to `astrology/`).
- **liturgy -> calendar** (runtime; `lection.mts`, `roman.mts`, `rcl.mts`).
  Rewrite `"@561-group/calendar-topology"` -> relative `"../calendar/index.mjs"`.
- **divination/codecs -> astrology** (TEST-ONLY; `divination/codecs/index.test.mts`).
  Non-test codecs code imports nothing cross-member ("codecs carry nothing").
  Rewrite test specifier -> relative `"../../astrology/index.mjs"`.
- **divination/codecs -> divination** (TEST-ONLY; `divination/codecs/index.test.mts`).
  Rewrite test specifier -> relative `"../index.mjs"`.
- **astrology/experimental -> @561-group/memetic-processing-unit** (runtime; `settlement.mts`, `closure-events.mts`, `settlement.test.mts`).
  STAYS EXTERNAL (out-of-domain `@561-group` scope, not a member).

### Consumers

| Dir | Name |
| --- | --- |
| `apps/astrology-computer` | `@561-group/astrology-computer` |
| `apps/divination-computer` | `@561-group/divination-computer` |
| `sites/cassia-lorne.substack.com` | `cassia-lorne.substack.com` |
| `sites/filum.561.group` | `filum.561.group` |

### Old packages

| Dir | Name |
| --- | --- |
| `lib/astrology-topology` | `@561-group/astrology-topology` |
| `lib/astrology-topology-experimental` | `@561-group/astrology-topology-experimental` |
| `lib/divination-codecs` | `@561-group/divination-codecs` |
| `lib/divination-topology` | `@561-group/divination-topology` |
| `lib/calendar-topology` | `@561-group/calendar-topology` |
| `lib/liturgy-topology` | `@561-group/liturgy-topology` |

### Risks

**SCOPE:** target is `@561-group/divination/<subpath>` — keep the `@561-group` scope; do NOT drift to `@emsenn` despite the games/markets reference packages being `@emsenn`-scoped.

**TWO DISCONNECTED CLUSTERS:** `{astrology, astrology/experimental, divination, divination/codecs}` and `{calendar, liturgy}` share ZERO cross-member edges.
The consolidated package bundles two independent sub-domains (celestial/divinatory vs. calendrical/liturgical) under one name solely because the macro spans them.
Mandated by the task; root index should still re-export all four top-level subpaths as namespaces.

**MPU BECOMES PACKAGE-WIDE DEP:** `@561-group/memetic-processing-unit` is pulled only by astrology/experimental, but the merged `package.json` now declares it as a runtime dependency for the whole package.
It correctly stays external (out-of-domain `@561-group` scope, not a member).
No `@emsenn/relating` dedup applies — NONE of the six members import relationality (grep confirmed); the only scoped dep is MPU plus `node:test`/`node:assert` in tests.

**CODECS EDGES ARE TEST-ONLY:** `divination/codecs` cross-member imports (-> astrology, -> divination) exist ONLY in `index.test.mts`.
The shipped codecs surface imports nothing cross-member by design (record types are structural wire shapes).
If the macro rewrites only non-test imports, codecs needs NO runtime relative edges; the test file alone needs rewriting.

**DOUBLE-NAMING:** `divination-topology -> ./divination` yields `@561-group/divination/divination`, and `divination-codecs -> @561-group/divination/divination/codecs`.
Awkward but matches the markets/market and games/* precedent of a domain subpath repeating the package name.
Acceptable.

**EXPERIMENTAL SUBPATH:** `astrology/experimental` is a conformant parallel ephemeris implementation (fork-not-extend, analogous to relationality's `./topology/internal`).
It has ZERO external consumers, so its inclusion is safe either way; exposing it as a nested public subpath keeps it addressable but it should carry a no-semver / experimental caveat in docs.

**CONSUMER REWRITES:** every external consumer imports a member's BARE ROOT specifier (no member subpaths exist in the wild), so each consumer edit is a clean 1:1 specifier swap per importMap.
`apps/astrology-computer` (astrology, divination/codecs), `apps/divination-computer` (divination/codecs, divination), cassia-lorne (astrology, divination/codecs, divination, liturgy), filum (astrology, divination/codecs, divination, liturgy).
Update each consumer's `package.json`: replace the per-member workspace deps with a single `@561-group/divination` `workspace:*` entry.

**INTERNAL REWRITE DEPTH:** `astrology/experimental` and `divination/codecs` are nested two levels deep, so their relative imports must climb `../../` to reach sibling top-level subpaths (e.g. codecs test -> `../../astrology/index.mjs`).
Easy to get the depth wrong during the macro.

## Assembled package (`lib/divination`)

**ok:** true

### Files changed

```
lib/divination/package.json
lib/divination/tsconfig.json
lib/divination/tsconfig.build.json
lib/divination/tsconfig.test.json
lib/divination/.gitignore
lib/divination/README.md
lib/divination/src/index.mts
lib/divination/src/astrology/aspects.mts
lib/divination/src/astrology/chart.mts
lib/divination/src/astrology/ephemeris-data.mts
lib/divination/src/astrology/ephemeris.mts
lib/divination/src/astrology/ephemeris.test.mts
lib/divination/src/astrology/events.mts
lib/divination/src/astrology/index.mts
lib/divination/src/astrology/index.test.mts
lib/divination/src/astrology/lunation.mts
lib/divination/src/astrology/time.mts
lib/divination/src/astrology/zodiac.mts
lib/divination/src/astrology/experimental/closure-events.mts
lib/divination/src/astrology/experimental/conformance.test.mts
lib/divination/src/astrology/experimental/index.mts
lib/divination/src/astrology/experimental/linear.mts
lib/divination/src/astrology/experimental/settlement.mts
lib/divination/src/astrology/experimental/settlement.test.mts
lib/divination/src/astrology/experimental/theories.mts
lib/divination/src/astrology/experimental/truncated-data.mts
lib/divination/src/divination/index.mts
lib/divination/src/divination/index.test.mts
lib/divination/src/divination/indicators.mts
lib/divination/src/divination/numerology.mts
lib/divination/src/divination/tarot.mts
lib/divination/src/divination/codecs/glyph.mts
lib/divination/src/divination/codecs/index.mts
lib/divination/src/divination/codecs/index.test.mts
lib/divination/src/divination/codecs/indicators.mts
lib/divination/src/divination/codecs/spread.mts
lib/divination/src/calendar/computus.mts
lib/divination/src/calendar/cycles.mts
lib/divination/src/calendar/feast.mts
lib/divination/src/calendar/index.mts
lib/divination/src/calendar/index.test.mts
lib/divination/src/calendar/iso-date.mts
lib/divination/src/liturgy/index.mts
lib/divination/src/liturgy/index.test.mts
lib/divination/src/liturgy/lection.mts
lib/divination/src/liturgy/lectionary-data.mts
lib/divination/src/liturgy/rcl.mts
lib/divination/src/liturgy/roman.mts
lib/divination/src/liturgy/vocabulary.mts
```

### Notes

Built `lib/divination` as `@561-group/divination` by COPYING (not `git mv`) all six members' src into `src/<subpath>/`, per the design.
Old members, `.gitmodules`, and the 4 consumers were left untouched (importMap is returned here, not applied).
No root `pnpm install` run.

**LAYOUT** (lib/games shape, `.mjs` specifiers): `src/{astrology,calendar,divination,liturgy}/` as top-level subpaths; `src/astrology/experimental/` and `src/divination/codecs/` nested two deep.
Root `src/index.mts` re-exports the FOUR top-level subpaths as namespaces (astrology, divination, calendar, liturgy); experimental and codecs are reachable only via their exports-map subpaths, not the root namespace.
Member `index.mts` files kept as subpath barrels unchanged.

**package.json:** name `@561-group/divination`, version 0.0.1, `@561-group` scope kept (no `@emsenn` drift).
Scripts/engines-via-root-tsconfig/type/files/sideEffects copied from a representative member (build uses `scripts/package-boundary/copy-dmts-to-dts.mjs`; test compiles via `tsconfig.test.json` into `.tmp/test-dist`). exports: `"."
`, `"./astrology"`, `"./astrology/experimental"`, `"./divination"`, `"./divination/codecs"`, `"./calendar"`, `"./liturgy"`, `"./package.json"`. deps = `@561-group/memetic-processing-unit` `workspace:*` ONLY.
NO `@emsenn/relating` — grep confirmed none of the six members import it; the boilerplate "single `@emsenn/relating`" was wrong and the design's risks section is right. devDeps `@types/node` + `typescript` (no fast-check; no moved test imports it).
Copied `tsconfig.json`/`.build`/`.test` (member shape, extend `../../tsconfig.json`, `strict:false` — NOT games' self-contained strict config which would throw fresh errors) + `.gitignore`.
Added a README (`files[]` lists `README.md`).
Theorem/symbol names unchanged.

**FINAL importMap** (cross-member specifier rewrites applied, per-directory, no global find/replace):

```
src/divination/indicators.mts:            @561-group/astrology-topology -> ../astrology/index.mjs   (runtime)
src/astrology/experimental/settlement.mts, theories.mts, closure-events.mts (runtime) and settlement.test.mts, conformance.test.mts (TEST):  @561-group/astrology-topology -> ../index.mjs
src/liturgy/lection.mts, roman.mts, rcl.mts (runtime) and index.test.mts (TEST):  @561-group/calendar-topology -> ../calendar/index.mjs
src/divination/codecs/index.test.mts (TEST-ONLY): @561-group/astrology-topology -> ../../astrology/index.mjs ; @561-group/divination-topology -> ../index.mjs
```

KEPT EXTERNAL (out-of-domain, not a member): `@561-group/memetic-processing-unit` in `src/astrology/experimental/{settlement.mts:44, closure-events.mts:39, settlement.test.mts:14}`.
Codecs non-test surface imports nothing cross-member ("codecs carry nothing"); only its test file needed rewriting.
Post-rewrite grep confirms the ONLY remaining bare `@561-group` specifier is memetic-processing-unit.

**TYPECHECK** (isolation, no root install): symlinked `lib/astrology-topology-experimental/node_modules` (which resolves MPU + `@types/node`) as `lib/divination/node_modules`, ran `npx tsc -p tsconfig.json --noEmit` (includes `src/**/*.mts`, so all 8 moved test files were checked too), then removed the symlink.
Result: exit 0, no diagnostics.
Control run with `node_modules` removed errors (TS2688 cannot find 'node'), confirming the borrowed deps were load-bearing and the pass was real.
No dist/.tmp artifacts leaked.
8 test files preserved (astrology ephemeris+index, experimental conformance+settlement, calendar index, divination index, codecs index, liturgy index).

## Rewired consumers

### `apps/astrology-computer`

**ok:** true

Files changed: - `apps/astrology-computer/package.json` - `apps/astrology-computer/src/chart.ts` - `apps/astrology-computer/src/aspects.ts` - `apps/astrology-computer/src/events.ts` - `apps/astrology-computer/src/astrology-computer.test.ts`

Rewired `@561-group/astrology-computer` onto `@561-group/divination`.

**package.json:** the two divination-domain member deps (`@561-group/astrology-topology`, `@561-group/divination-codecs`), both `workspace:*`, were replaced by a single `"@561-group/divination": "workspace:*"`.
No non-divination deps existed in the dependencies block to keep; devDependencies (`@types/node`, `typescript`) untouched.
JSON validated.

**Source rewiring** (quote-anchored): applied the full import map to every source file.
Only two of the six mappings actually occur in this app: - `"@561-group/astrology-topology"` -> `"@561-group/divination/astrology"` (chart.ts, aspects.ts, events.ts, astrology-computer.test.ts) - `"@561-group/divination-codecs"` -> `"@561-group/divination/divination/codecs"` (chart.ts)

The other four mappings (astrology-topology-experimental, divination-topology, calendar-topology, liturgy-topology) had no occurrences.
Replacement ordering put the experimental variant before the base astrology mapping; quote-anchoring (closing quote in the match) prevents any substring overlap.

**Extension note:** the task specified `.mts`/`.mjs`, but this app's source files are `.ts` (chart.ts, aspects.ts, events.ts, options.ts, astrology-computer.test.ts) — there are no `.mts`/`.mjs` files in the app. I applied the import map to the `.ts` source files since rewiring the app's imports is the clear intent; options.ts had no divination-domain imports.
No submodules involved; `.gitmodules` untouched.

**Verification:** confirmed `@561-group/divination` exists at `lib/divination` with exports matching every import-map target subpath (`./astrology`, `./astrology/experimental`, `./divination`, `./divination/codecs`, `./calendar`, `./liturgy`).
Confirmed it re-exports the symbols the app uses (`computeChart`, `lunationOf`, `BODIES`, `Chart` via `./astrology`; `renderChartGlyphs` via `./divination/codecs`).
The divination package's `dist/` is not built yet (no `dist/*.mjs` present), so tsc/runtime won't resolve until divination is built — that is a build step outside this rewiring task.

**Not changed:** README.md still references `@561-group/astrology-topology` and `@561-group/divination-codecs` in prose; left as-is since it's documentation, not an import or a member dep.
`pnpm-lock.yaml` not regenerated (no install run).

### `apps/divination-computer`

**ok:** true

Files changed: - `apps/divination-computer/package.json` - `apps/divination-computer/src/draw.ts` - `apps/divination-computer/src/reduce.ts` - `apps/divination-computer/src/divination-computer.test.ts`

Rewired `@561-group/divination-computer` to consume the consolidated `@561-group/divination` package.

**DEVIATION:** The task said apply to every `.mts`/`.mjs`, but this app's source uses `.ts` extensions (no `.mts`/`.mjs` files exist anywhere in the app).
The consolidation (per the package's own description and the recent game-* merge pattern) removed the old member packages, so leaving the `.ts` sources untouched would have produced a broken app. I applied the quote-anchored import map to the `.ts` source files instead — the only coherent reading.

Import map applied (quote-anchored, all six patterns swept; only 2 of 6 had live references): - `@561-group/divination-topology` -> `@561-group/divination/divination` (draw.ts:18, reduce.ts:10) - `@561-group/divination-codecs` -> `@561-group/divination/divination/codecs` (draw.ts:19, divination-computer.test.ts:4) - astrology-topology, astrology-topology-experimental, calendar-topology, liturgy-topology: no occurrences.

**package.json:** replaced the two divination-domain deps (divination-codecs, divination-topology, both `workspace:*`) with a single `@561-group/divination` (`workspace:*`).
There were no other (non-divination) member deps to keep.

**Verification:** - Full-dir residual grep over `*.ts`/`*.mts`/`*.mjs`/`*.js`/`*.cjs`/`*.json` for all six old names returned zero hits. - Confirmed the new subpaths exist in `@561-group/divination` exports (`./divination` and `./divination/codecs`) and that every symbol the app imports is re-exported there: `dailySpread`, `drawCards`, `SEEDED_DRAW_METHOD`, type `Spread`, `reduceDate`, type `DateReduction` (from `./divination`); `encodeSpreadDocument`, `decodeSpreadDocument` (from `./divination/codecs`). - divination-computer is a normal app dir, not a submodule; `.gitmodules` untouched.

### `sites/cassia-lorne.substack.com`

**ok:** true

Files changed: - `sites/cassia-lorne.substack.com/src/cable-source.ts` - `sites/cassia-lorne.substack.com/src/lectionary.ts` - `sites/cassia-lorne.substack.com/src/indicators.ts` - `sites/cassia-lorne.substack.com/src/gates.ts` - `sites/cassia-lorne.substack.com/src/read.ts` - `sites/cassia-lorne.substack.com/package.json`

Rewired cassia-lorne.substack.com to consume `@561-group/divination`.

**DEVIATION (intentional):** The task said apply the import map to every `.mts`/`.mjs` file, but this site has NO `.mts`/`.mjs` files — its source is `.ts` (package.json exports point to `./src/*.ts`).
I applied the quote-anchored import map to the `.ts` files instead.
Leaving `.ts` imports on the old specifiers would break module resolution once the old deps are removed from package.json, contradicting the task's stated purpose ("rewire to consume `@561-group/divination`").
Confirmed `@561-group/divination` (lib/divination) exists and exposes subpath exports (`./astrology`, `./astrology/experimental`, `./divination`, `./divination/codecs`, `./calendar`, `./liturgy`) that exactly match the map targets.

Import map applied (quote-anchored, including trailing quote; longest specifier first so astrology-topology-experimental was matched before astrology-topology): - cable-source.ts: astrology-topology -> divination/astrology; divination-topology -> divination/divination - indicators.ts: astrology-topology -> divination/astrology; divination-topology -> divination/divination; divination-codecs -> divination/divination/codecs (multi-line `} from "..."
` blocks matched correctly) - read.ts: divination-codecs -> divination/divination/codecs (x2) - gates.ts: divination-codecs -> divination/divination/codecs - lectionary.ts: divination-topology -> divination/divination; liturgy-topology -> divination/liturgy

Post-grep for the six old specifiers over src returns zero hits.

**package.json:** replaced the 4 divination-domain members present (astrology-topology, divination-codecs, divination-topology, liturgy-topology) with a single `"@561-group/divination": "workspace:*"`.
Kept `@561-group/content-codecs` and `@561-group/newsroom`.
JSON validated; final deps = divination, content-codecs, newsroom.
The map's calendar/experimental specifiers were not present in this site and required no change.
Did not touch `.gitmodules`.

### `sites/filum.561.group`

**ok:** true

Files changed: - `sites/filum.
561.group/package.json` - `sites/filum.
561.group/src/producers/arithmomantia.ts` - `sites/filum.
561.group/src/producers/cartomantia.ts` - `sites/filum.
561.group/src/producers/lectio.ts` - `sites/filum.
561.group/src/producers/astrologia.ts`

Rewired filum.
561.group to consume `@561-group/divination`.

**DEVIATION (deliberate, surfaced):** this site has NO `.mts`/`.mjs` files — its source is `.ts`.
The import map was spec'd as "`.mts`/`.mjs`" but the package.json half of the task removes the four divination-domain deps, so leaving the `.ts` imports on the old specifiers would ship a broken (unresolvable) package.
To keep source consistent with the dep change I applied the import map to the `.ts` files instead.
Verified divination's package.json exports exactly match every map `to` value (`./astrology`, `./astrology/experimental`, `./divination`, `./divination/codecs`, `./calendar`, `./liturgy`).

Import rewrites (quote-anchored on both quotes, double-quoted static imports only — no dynamic `import()` or re-exports present):
- arithmomantia.ts:13  `@561-group/divination-topology` -> `@561-group/divination/divination`
- cartomantia.ts:15    `@561-group/divination-codecs`   -> `@561-group/divination/divination/codecs`
- cartomantia.ts:16    `@561-group/divination-topology` -> `@561-group/divination/divination`
- lectio.ts:16         `@561-group/liturgy-topology`     -> `@561-group/divination/liturgy`
- astrologia.ts:25     `@561-group/astrology-topology`   -> `@561-group/divination/astrology`

Map rules for astrology-topology-experimental and calendar-topology did not fire (not present) — expected, not a miss.

**package.json dependencies:** removed `@561-group/astrology-topology`, `@561-group/divination-codecs`, `@561-group/divination-topology`, `@561-group/liturgy-topology`; added single `"@561-group/divination": "workspace:*"` (placed alphabetically).
Kept content-topology, newscable, web-theming, web-theming-computer, `@emsenn/web-server`.
JSON validated (parses).
No stale divination-domain specifiers remain in src/.

**Note:** filum.
561.group is the site working tree, not a submodule, so no `.gitmodules` concern arose.
Did not install deps or run a build (lockfile/install not requested); a `pnpm install` would be needed before the next ingest/serve to materialize the new `@561-group/divination` dependency.

## Verify

**ok:** true

`@561-group/divination` typechecks CLEAN in isolation.

**Method** (no root `pnpm install`): created a throwaway `node_modules` inside `/home/emsenn/561-group/lib/divination` symlinking only its imported deps, then ran the package's own check (`tsc --noEmit -p tsconfig.json`), then removed the throwaway `node_modules`.

Symlinks created (and removed after): - `node_modules/@561-group/memetic-processing-unit` -> `/home/emsenn/561-group/lib/memetic-processing-unit` (its only runtime dep; resolved via exports map to its built `dist/index.d.ts`) - `node_modules/@types/node` -> `.pnpm/@types+node@22.19.20/.../@types/node` (required by tsconfig `types: ["node"]`) - `node_modules/undici-types` -> `.pnpm/undici-types@6.21.0/.../undici-types` (transitive ref of `@types/node`)

tsc invoked from `/home/emsenn/561-group/lib/divination/tsconfig.json` (extends repo-root tsconfig: module/moduleResolution NodeNext, skipLibCheck, strict:false, target/lib ES2024).
All `src/**/*.mts` loaded and checked (including `.test.mts`).

Tail of tsc output: (empty — no diagnostics) EXIT: 0

**Verification that the check was meaningful** (not silently `any`): `--traceResolution` confirmed `@561-group/memetic-processing-unit` "was successfully resolved to `/home/emsenn/561-group/lib/memetic-processing-unit/dist/index.d.ts`"; `--listFiles` confirmed all 30+ divination src `.mts` files were compiled.

**Cleanup done:** `lib/divination/node_modules` removed.
No source files modified.

**Diagnosis:** No errors — clean.
`tsc --noEmit` exit code 0 with zero diagnostics across all `src/**/*.mts` (including tests).
The sole dependency `@561-group/memetic-processing-unit` resolved to its real built `dist/index.d.ts` (verified via `--traceResolution`), so the typecheck exercised real types rather than falling back to any.
No file:line to report.

## Decommission targets

| Dir | Name |
| --- | --- |
| `lib/astrology-topology` | `@561-group/astrology-topology` |
| `lib/astrology-topology-experimental` | `@561-group/astrology-topology-experimental` |
| `lib/divination-codecs` | `@561-group/divination-codecs` |
| `lib/divination-topology` | `@561-group/divination-topology` |
| `lib/calendar-topology` | `@561-group/calendar-topology` |
| `lib/liturgy-topology` | `@561-group/liturgy-topology` |

---

*Process metadata from the source report: 7 agents; 1 design log line.*
