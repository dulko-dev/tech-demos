---
name: project-planning
description: Use when starting a new project, scoping an idea, choosing a stack, or producing an MVP implementation plan — an opinionated Bun/shadcn planning skill.
---

Turn a fresh project idea into a focused, MVP-first plan that favors prebuilt solutions and opinionated frameworks over custom complexity.

Workflow:

1. Clarify the goal in one sentence and define the single-user MVP boundary: what ships in the first cut, what is explicitly out of scope.
2. Decompose the goal into a small set of manageable tasks. Group by user-visible outcome, not by layer.
3. Research frameworks and libraries that could absorb whole tasks. Prefer pre-built solutions unless a clear constraint rules them out.
4. Start from an official scaffold via bunx create-* (create-next-app, create-vite, create-t3-app, create-tanstack, create-expo) instead of hand-rolling.
5. Before any dependency install, create or preserve bunfig.toml with [install] minimumReleaseAge = 259200. Prefer scaffold flags that skip the initial install, then run bun install.
6. Pick an opinionated framework when it improves organization; skip framework-grade tooling for one-screen utilities.
7. For UI, init shadcn/ui with bunx shadcn@latest init, minimalist preset, prefer shadcn blocks; add components on demand.
8. Lay out components and services in a logical structure before writing code.
9. Decide the minimum useful testing surface and git-hook surface; both default to small.
10. Produce a short plan: goal, MVP scope, task list, stack choices with one-line rationale, deferred items.

Rules: build for one user first; Bun by default; official scaffolds; bunfig.toml minimumReleaseAge = 259200 before installs; shadcn/ui minimalist; prebuilt over bespoke; boring well-documented defaults; cut features before clarity; one opinionated framework; organize by feature once >1 screen; tests for critical logic only; git hooks for formatting/fast checks only; defer anything not on the MVP path; re-evaluate after first end-to-end slice.

Output shape: goal in one sentence; single-user MVP + explicit outs; outcome-oriented task list (vertical slices); stack with one-line rationale each; deferred items and why.
