# earstrip vs earcut

A browser demo comparing [earstrip](https://github.com/GLMap/earstrip) — a WebAssembly polygon triangulator with an earcut-compatible API (`earstrip(coords, holeIndices)` → triangle indices), claimed 1.4–2.1× faster — against [earcut](https://github.com/mapbox/earcut).

Links: [HN thread](https://news.ycombinator.com/item?id=50193170) · [blog post: Cutting map polygons into triangles](https://globus.software/blog/2026/10/16/cutting-map-polygons/)

## Run

```bash
bun install
bun run dev
```

Then open the printed URL (default http://localhost:5173).

## What you can do

- **Draw** a polygon on the left canvas: click to add points, "Close ring" to finish the outline, then draw more rings inside it as holes.
- **Presets**: square with hole, star, self-intersecting ring, and a 1000-hole stress polygon. The self-intersecting ring is where the libraries genuinely differ: earcut paints a (wrong) area, earstrip's drop-in list mode reports `approximate` and can return 0 triangles (it may not add vertices), and its `strips()` mode adds points at the crossings and returns a correct constrained triangulation.
- **Compare** the two side-by-side panels: colored triangle fills + wireframe from each library, with per-panel triangle counts and timing. Hovering a panel highlights the triangle under the cursor in both panels.
- **Benchmark**: run each triangulator N× (20/100/500) on the current scene; a table shows median/total ms, triangle count, index count, and speedup vs earcut. Three rows: earcut, earstrip's drop-in triangle list, and earstrip's native `strips()` output.
- **Real data**: a small static GeoJSON of OSM building footprints (central Berlin, ODbL) is committed in `src/data/buildings.json` — no network, no API key. Load it to triangulate all footprints with both libraries and see totals/timing.
- **Strip toggle**: switch the earstrip panel to color triangles by the triangle strip they belong to (`earstrip.strips()`, ~1.7 indices per triangle) vs earcut's plain triangle list (3 indices per triangle).

## Honesty notes

- All numbers are measured live in your browser; they vary with browser, machine, and load. Compare medians over many runs, not single passes.
- The committed dataset is small (59 footprints). earstrip's headline speedups come from large map workloads and many-hole polygons — the 1000-holes preset is the closest in-browser approximation here.
- Data © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright).
