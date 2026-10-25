# impeccable-before-after

Does [Impeccable](https://impeccable.style) actually make AI-built UI better? This app keeps a deliberately typical AI-default landing page (BEFORE), the same page after Impeccable commands (AFTER), the real `impeccable detect` output for both, and a log of the commands that were run.

## Run

```bash
bun install
bun run dev
```

`bunfig.toml` sets `minimumReleaseAge = 259200` (3 days). Open the printed localhost URL.

## Layout

- `pages/before/` — AI-default SyncFlow landing (Inter, purple gradient, nested cards, bounce easing)
- `pages/after/` — transit-wayfinding rewrite after Impeccable commands
- `detector-output/` — raw CLI JSON/text, not invented counts
- `impeccable-log.md` — commands and what each changed
- `PLAN.md` — goal, MVP, stack

## Detector (this run)

| | Total | Primary | Advisory |
|---|---|---|---|
| BEFORE | 63 | 44 | 19 |
| AFTER | 0 | 0 | 0 |

Static HTML engine only. See `impeccable-log.md` for honest limits (no browser overlay, no human interview, `--list-rules` returned an empty catalog).
