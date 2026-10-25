# Rules for agents working in this repo

This is a tech-demos monorepo: one small demo app per pick, never a new repo.

## Structure

- Each demo is **one app** under `apps/<kebab-slug>/` (kebab-case slug).
- Every app is **self-contained**: `bun install && bun run dev` inside the app directory must be all that is needed to run it.
- **Bun** is the runtime and package manager for all apps.

## Installation safety

- Every Bun project MUST have a `bunfig.toml` containing:

  ```toml
  [install]
  minimumReleaseAge = 259200
  ```

  Create or preserve this file **before any install** runs in the project.

## Planning

- Plan first: read `skills/project-planning/SKILL.md` and follow it.
- Write the resulting plan to `apps/<slug>/PLAN.md` (goal, MVP scope, task list, stack with rationale, deferred items) before implementing.

## Scope

- Only touch your own `apps/<slug>/` directory, plus:
  - the tracking file (`tracking/seen-bookmarks.json`), and
  - the app list in the root `README.md`.
- Do not modify other apps, shared config, or other agents' work.

## Pull requests

- Every PR MUST include **at least one screenshot** of the running app and a **clear description** demonstrating the demo actually works. Video is NOT required.
- Include run instructions in the app's own `README.md`.
