# tech-demos

A sticky monorepo of small, self-contained tech demos — one app per interesting pick (library, tool, or technique), each living under `apps/<slug>/`.

Every app runs standalone with [Bun](https://bun.sh):

```bash
cd apps/<slug>
bun install
bun run dev
```

## Apps

| App | Description |
| --- | --- |
| [`apps/earstrip-vs-earcut`](apps/earstrip-vs-earcut) | Side-by-side comparison of [earstrip](https://github.com/GLMap/earstrip) (WebAssembly polygon triangulation) vs [earcut](https://github.com/mapbox/earcut): interactive polygon drawing, benchmarks, real GeoJSON building footprints, and triangle-strip visualization. |

See [`AGENTS.md`](AGENTS.md) for the rules that govern how demos are added.
