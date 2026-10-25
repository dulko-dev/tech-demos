# PR Lens demo

Small viewer for [PR Lens](https://prlens.dev) diagrams of real pull requests.

[PR Lens](https://github.com/coldteadotai/pr-lens) (MIT) draws a change as animated architecture and data-flow SVGs from one typed graph document. Not Mermaid — `@coldtea/pr-lens-renderer`.

## Run

```bash
cd apps/pr-lens-demo
bun install
bun run dev
```

`bunfig.toml` sets `[install] minimumReleaseAge = 259200` before install.

## What you should see

Pick one of three real PRs:

1. [dulko-dev/tech-demos#1](https://github.com/dulko-dev/tech-demos/pull/1) — monorepo bootstrap + earstrip vs earcut
2. [dulko-dev/tech-demos#2](https://github.com/dulko-dev/tech-demos/pull/2) — Impeccable before/after
3. [facebook/react#13968](https://github.com/facebook/react/pull/13968) — experimental Hooks

Each has the official rendered architecture + data-flow SVGs, a short diff summary, a local walkthrough stepper, and a **live canvas** link (`pr-lens canvas push`, no sign-in).

## How the diagrams were made (and the key)

| Path | Used here? | Key? |
| --- | --- | --- |
| Agent skill writes `graph.json`, then `pr-lens validate` + `render` | **Yes** | No |
| `pr-lens canvas push` | Yes (unlisted view links) | No |
| `pr-lens analyze` (LLM reads the diff) | No | Needs `GEMINI_API_KEY` or `OPENAI_API_KEY` |
| GitHub App / Action | No | App uses theirs; Action wants your Gemini/OpenAI key |

`analyze` is the only CLI command that talks to a model. This demo does **not** call it. The graph documents were written from the real diffs following `pr-lens skill` / `skill references`, then drawn by the official renderer (`@coldtea/pr-lens-renderer@0.3.6`).

Rebuild SVGs after editing a graph document:

```bash
bun run generate
```

## Honest notes

Worked: schema-valid documents; official CLI validate/render (animated SVGs, no JS in the file); both themes; walkthrough stages switch the local view; canvas push without an account or paid key.

Did not run: `analyze` (no provider key in this environment). The pictures are therefore skill-authored graphs, not model-inferred ones. Canvas write tokens stay in ignored `.pr-lens/canvas.json` and are not in this repo. PR #1 and #2 may still be open / unmerged; the graphs use their published head SHAs.

Do not commit `.pr-lens/` — it holds canvas write tokens.
