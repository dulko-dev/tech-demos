# PLAN — impeccable-before-after

## Goal

Answer one question with evidence: **does [Impeccable](https://github.com/pbakaus/impeccable) actually make AI-built UI better?** We build a deliberately typical "AI-default" landing page (BEFORE), run Impeccable's deterministic detector CLI on it, then install and actually use the Impeccable skill (init → critique/audit → polish/typeset/layout/...) to produce an AFTER version, re-run the detector, and present both pages and both sets of real findings side by side in a small showcase app.

## Single-user MVP

One person opens the app locally (`bun install && bun run dev`), and can:

- View the BEFORE and AFTER landing pages live (rendered in iframes), switching via a toggle / side-by-side view.
- See a findings panel with **real** detector rule counts for BEFORE vs AFTER (numbers come only from saved raw CLI output, checked into the repo).
- Read a short log of which Impeccable commands were run and what each changed.

### Explicitly out of scope (MVP outs)

- No re-running the detector from the app itself (findings are captured offline, committed as raw JSON/text).
- No backend, no persistence, no auth, no multi-user anything.
- No pixel-perfect mobile layouts for the showcase shell (the demo pages themselves are responsive, the shell targets desktop).
- No attempt to reproduce Impeccable's LLM-only critique checks — only the deterministic CLI rules are counted.

## Tasks (outcome-oriented)

1. **Scaffold runs**: Vite vanilla-ts app scaffolded with the official `bunx create-vite`, `bunfig.toml` with `[install] minimumReleaseAge = 259200` present before any install, `bun install && bun run dev` works inside `apps/impeccable-before-after/`.
2. **BEFORE page exists**: a static `pages/before/index.html` + CSS landing page for a fictional product, deliberately exhibiting AI-default tells (Inter everywhere, purple→blue gradients, nested cards, gray-on-color text, icon tiles above headings, bounce easing).
3. **BEFORE findings captured**: raw `impeccable detect --json` output for the BEFORE page saved under `detector-output/`, counts summarized.
4. **AFTER page exists via the skill**: Impeccable skill installed into this agent's harness; its commands (init, critique, audit, polish, typeset, layout, colorize, animate as applicable) actually followed to transform the same page into `pages/after/index.html` + CSS. Every command run and its effect logged in `impeccable-log.md` and surfaced in the app.
5. **AFTER findings captured**: detector re-run on AFTER, raw output saved alongside BEFORE's.
6. **Showcase shell works**: toggle/side-by-side iframe view of both pages, findings panel with per-rule before/after counts from the saved JSON, command log rendered.
7. **Validated with evidence**: app run locally; screenshots of BEFORE, AFTER, and the findings panel attached to the PR; before/after counts reported in the PR description. Honest reporting: if the detector or skill underdelivers, that is stated in the app and PR.

## Stack

- **Bun** — repo-mandated runtime/package manager.
- **Vite (vanilla-ts, official `create-vite` scaffold)** — multi-page static serving (shell + two demo pages) with zero framework overhead; the demo pages stay plain HTML/CSS so Impeccable's static HTML engine (not just regex matching) can scan them.
- **Plain HTML/CSS for BEFORE/AFTER pages** — the detector's full element-level rules only run on parsed HTML; keeping the pages framework-free makes the before/after comparison honest and reproducible.
- **Impeccable CLI (`impeccable detect`)** — the deterministic 62-rule detector, run offline; raw output committed.

## Deferred

- Scanning the *running* pages via URL/browser engine in CI (the static HTML engine is deterministic and sufficient for the demo; a URL scan could catch more rules later).
- A drag "curtain" slider between BEFORE/AFTER (toggle + side-by-side is enough for MVP).
- Re-running Impeccable commands on future page edits (one-shot capture for the demo).
- Repo-level README app list / tracking entry — belongs to the bootstrap PR's files; add after that merges.
