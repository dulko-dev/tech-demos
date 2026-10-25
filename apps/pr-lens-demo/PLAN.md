# PLAN — PR Lens viewer

## Goal

Let the owner see what [PR Lens](https://prlens.dev) produces on real changes: a small local viewer that plays PR Lens's own animated architecture and data-flow diagrams for this repo's open PRs (#1 earstrip, #2 impeccable) plus a couple of well-known public PRs.

## Single-user MVP

In scope (one screen, no backend, no paid key):

1. A PR picker listing a handful of real pull requests (this repo's #1 and #2, plus 1–2 public PRs).
2. For the selected PR: the official PR Lens animated SVGs (architecture + data-flow, dark theme), produced by `@coldtea/pr-lens-cli render` from a schema-valid graph document.
3. A short text summary of the real diff next to the diagram (title, files, +/- counts, 3–6 sentence walkthrough).
4. Lens toggle (architecture / data-flow) and an optional walkthrough stepper that pages the document's own steps.
5. A link to the hosted PR Lens canvas (`pr-lens canvas push`) when a view URL can be minted without an account.

Out of scope: live `analyze` of arbitrary PRs (needs `GEMINI_API_KEY` / `OPENAI_API_KEY`), GitHub App / Action, posting comments, a backend, editing graph documents in the UI.

## Tasks (vertical slices)

1. **Plan + scaffold**: this file, then Vite + vanilla TS via `bunx create-vite`, with `bunfig.toml` `[install] minimumReleaseAge = 259200` written before any install.
2. **Skill-write graph docs**: read each real diff, write `public/artifacts/<id>/graph.json` following the PR Lens skill (`pr-lens skill` / `skill references`). No `analyze` — that command is the paid-key path.
3. **Render with the official CLI**: `npx @coldtea/pr-lens-cli validate` then `render` into committed SVGs + `manifest.json` + `drawn.graph.json`.
4. **Viewer**: pick a PR, show its rendered SVGs, summary, walkthrough steps; expose canvas links if push works keylessly.
5. **README**: how to run, which mode was used, what needed a key, what worked and what did not.

## Stack

- **Bun** — repo-standard runtime and package manager.
- **Vite + vanilla TypeScript** (`bunx create-vite`) — official scaffold; one screen does not need React or a router.
- **`@coldtea/pr-lens-cli` (npx, at generate time)** — official validate/render/canvas; only these commands are keyless.
- **Committed artifacts** — diagrams are generated once and checked in so `bun run dev` works offline with no key.

## Deferred (and why)

- `pr-lens analyze` — talks to Gemini/OpenAI and refuses to run without a provider key. The skill path (agent writes the graph document, CLI only validates/renders) is the documented keyless equivalent.
- Hosted GitHub App / Action — needs a repo install or `GEMINI_API_KEY`; this demo is a local viewer.
- Live fetch of arbitrary GitHub PRs — would need a token and a model; the point is to show finished PR Lens output, not to build an analyzer.
- Re-rendering in the browser via `@coldtea/pr-lens-renderer` — same pictures as the CLI; skipped to keep the app a viewer of committed official output.
