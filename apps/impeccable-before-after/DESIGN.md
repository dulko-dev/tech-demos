# Design

<!-- impeccable:design-schema 1 -->

Documented after the AFTER landing was built. Describes the shipped world, not a pre-write rulebook.

## Platform

web

## Surfaces

- `pages/before/` — AI-default landing, kept as evidence. Not this system.
- `pages/after/` — Persuade landing in the transit-wayfinding world.

## World

Municipal / transit wayfinding. The page is a platform: porcelain tile, enamel navy, a strip map, a departure board, a fare table. Course-amber is reserved for the active leg and the trial action. It does not decorate.

## Color

| Role | Value | Use |
|---|---|---|
| Tile | `#d9e2e8` | Page ground |
| Foam | `#eef3f6` | Alternate bands |
| Ink | `#10243a` | Navy field, text |
| Ink 2 | `#2a4158` | Secondary text on tile |
| Hair | `#8aa0b3` | Rules |
| Course | `#f0b429` | Active station, primary action only |
| Course ink | `#10243a` | Text on course |

Pairs checked ≥4.5:1 before ship. No purple, no generic gray on color.

## Type

- Display: **Chivo Condensed** 600/800 — station names, headings, actions
- Body: **Chivo** 400/700 — reading
- Body size 1.0625rem, measure ~62ch
- No Inter, no gradient type

## Layout

Strip navigation. Four-station product diagram. Tables for “what moves” and fares. Pull quotes without a side bar. No card-as-scaffold, no nested cards, no icon tile above a heading.

## Motion

One draw of the route rule, `cubic-bezier(0.16, 1, 0.3, 1)`, ~900ms. Disabled under `prefers-reduced-motion`.

## Components

- Ticket form: label, email, course-amber submit
- Fare table: one `active-leg` row
- Skip link, focus ring in course amber
