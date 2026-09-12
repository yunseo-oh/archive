<!-- Generated from .project/PROJECT.md by the engine — do not run `impeccable init`, which would interview a user who isn't here. Edit .project/PROJECT.md; this file is regenerated from it. -->
# ARCHIVE

**Platform:** Responsive web — Next.js, React, Tailwind. shadcn/ui and lucide are installed and available; the direction decides whether they fit or whether this surface needs its own vocabulary.
**Task mode:** Operate (pass as `--mode operate` to any script)

## What this is

A private single-user archive for books, movies, TV series, and gallery visits.

## What it enables

Keep a simple, durable record of what was read, watched, and visited, organized by year.

## Primary user

One person who wants a lightweight personal archive without ratings, reviews, social features, or dashboards.

## What exists today

iPhone-first archive screen with year filtering and per-category counts. - Persistent browser storage for books, movies, series, and gallery visits. - Search-first add flows for books, movies, and series with manual entry fallback. - Server-only Kakao and TMDB search actions with metadata enrichment. - Editable and deletable records, plus direct persistent TV season toggles. - Installable web app metadata and safe-area-aware mobile layout.

## Brand commitments & durable constraints

Simple personal archive only. No ratings, reviews, notes, social features, stats, tags, recommendations, or dashboard treatment. Search credentials stay server-side.

- **This project already HAS a committed visual world — do NOT offer a design picker.** `.project/DESIGN_SYSTEM.md` records a direction someone decided on, and the code, tokens and components are built around it. Read it, inherit it, and make the requested change inside it. Dealing six alternative worlds here offers to throw away a working design system nobody asked you to replace.
- **Tailoring is not redesigning.** "Make it about my business", new copy, a different logo, swapped imagery, a brand colour — all of that lands INSIDE the committed world. Change what was asked for and leave the direction alone.
- **The one exception is an explicit, whole-app redesign** — the user asking for a different look outright, not merely a change that happens to be large. Then the direction is open again and the picker applies. When they name the new direction themselves, that is the decision: pin it and build, still without a picker.
- The user's own words always outrank the roll. A direction, palette, face or reference they named is pinned; the roll only decides what they left open.
- Two review rounds is the budget, then ship and report open items honestly under the reviewer's own verdict — never announce a table with open findings as a pass.
- Web fonts load through Fontsource, never `next/font/google` — this sandbox has no Google egress, so the fetch hangs at compile and the preview renders blank.
- No AI-builder badge, watermark, or attribution anywhere in the product.
- Decisions recorded in `.project/` (ledger, DESIGN_SYSTEM.md) are commitments; contradict one only when the user asks.

## Positioning

A private single-user archive for books, movies, TV series, and gallery visits.

## Operating Context

Responsive web, built unattended in one pass. Task mode: Operate.

## Evidence on Hand

iPhone-first archive screen with year filtering and per-category counts. - Persistent browser storage for books, movies, series, and gallery visits. - Search-first add flows for books, movies, and series with manual entry fallback. - Server-only Kakao and TMDB search actions with metadata enrichment. - Editable and deletable records, plus direct persistent TV season toggles. - Installable web app metadata and safe-area-aware mobile layout.

## Product Principles

- Clarity of the task beats decoration; the interface earns attention only where the product does.
- Say what is true: no invented prices, customers, benchmarks or capabilities the product does not have.
