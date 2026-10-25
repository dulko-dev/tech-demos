# PLAN — earstrip vs earcut

## Goal

Show, in the browser, how [earstrip](https://github.com/GLMap/earstrip) (WebAssembly ear-clipping into triangle strips) compares to [earcut](https://github.com/mapbox/earcut) on the same polygons: identical API, visualized triangulations, honest measured timings, and a view of earstrip's distinctive strip output.

## Single-user MVP

In scope (one screen, no backend, no keys, no GPU):

1. A canvas where clicking draws a polygon outline, with hole support (finish a ring, start drawing a hole inside), plus one-click presets: square-with-hole, star, self-intersecting ring, and a "1000 holes" stress polygon.
2. Two side-by-side panels rendering the earcut and earstrip triangulations of the current polygon — colored triangle fills plus wireframe, with hover highlighting the triangle under the cursor in both panels.
3. A benchmark button that runs each library N times on the current polygon and shows a shadcn table: median/total ms, triangle count, index count, and speedup.
4. A "load real data" action that triangulates a small static GeoJSON of building footprints committed in the repo and reports totals and timing for both libraries.
5. A toggle that switches the earstrip panel between plain triangle-list coloring and strip visualization (each strip from `earstrip.strips()` in an alternating color).

Explicitly out of scope: mobile/touch drawing, polygon editing (move/delete vertices), WebGL rendering, persistence, multi-polygon drawing, server anything.

## Tasks (vertical slices)

1. **Scaffold runs**: Vite + React + TS via `bunx create-vite`, `bunfig.toml` with `minimumReleaseAge` before any install, shadcn/ui init (minimalist), earcut + earstrip installed, blank app boots with `bun run dev`.
2. **Draw and triangulate**: click-to-draw canvas with rings/holes + presets; both panels render fills + wireframe from each library's output; hover highlight.
3. **Benchmark**: N-run benchmark on the current polygon, results in a shadcn table with speedup; note on browser/machine variance.
4. **Real data**: committed GeoJSON building footprints, triangulate-all with totals and timing per library.
5. **Strips view**: toggle alternating-color strip rendering from `earstrip.strips()` vs earcut's plain list.
6. **Polish and document**: README with run instructions, honest-numbers caveat in the UI.

## Stack

- **Bun** — repo-standard runtime/package manager.
- **Vite + React + TS** (`bunx create-vite`) — official scaffold, instant dev server, right size for a one-screen interactive tool.
- **shadcn/ui (minimalist preset)** — prebuilt table/button/toggle/card components instead of bespoke UI.
- **Canvas 2D** — simplest honest way to draw polygons and fill triangles; no GPU per constraints.
- **earcut 3.x + earstrip 0.2** — the two subjects; earstrip is a drop-in (`earstrip(coords, holes)`), so one shared triangulation interface covers both (`await earstrip.ready` once at startup).
- **No router, no state library** — one screen; React state is enough.

## Deferred (and why)

- WebGL rendering of strips via primitive restart — the demo is about comparing outputs, not GPU upload; Canvas 2D keeps it simple.
- `batch()` / `direct.*` earstrip APIs — interesting for engines, out of MVP; the README links to them.
- Vertex editing/undo in the drawing tool — presets + click-to-draw cover the demo need.
- Unit tests — this is a visual demo; correctness is validated visually and by the libraries' own outputs (tests-for-critical-logic-only rule, and there is no critical logic of our own).
