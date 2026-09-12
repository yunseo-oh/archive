---
name: "ARCHIVE"
description: "A private single-user archive for books, movies, TV series, and gallery visits."
colors:
  background: "#ffffff"
  foreground: "#111111"
  card: "#ffffff"
  card-foreground: "#111111"
  popover: "#ffffff"
  popover-foreground: "#111111"
  primary: "#007aff"
  primary-foreground: "#ffffff"
  secondary: "#f2f2f7"
  secondary-foreground: "#111111"
  muted: "#f2f2f7"
  muted-foreground: "#6b6b70"
  accent: "#eaf3ff"
  accent-foreground: "#0066d6"
  destructive: "#ff3b30"
  border: "#e5e5ea"
  input: "#e5e5ea"
  ring: "#007aff"
  sidebar: "#f2f2f7"
  sidebar-foreground: "#111111"
  sidebar-primary: "#007aff"
  sidebar-primary-foreground: "#ffffff"
  sidebar-accent: "#eaf3ff"
  sidebar-accent-foreground: "#0066d6"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"SF Pro Display\", \"Helvetica Neue\", Arial, sans-serif"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"SF Pro Display\", \"Helvetica Neue\", Arial, sans-serif"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
rounded:
  md: "0.75rem"
  sm: "calc(var(--radius) - 4px)"
  lg: "0.75rem"
---

<!-- Generated from .project/DESIGN_SYSTEM.md + app/globals.css by the engine. Tokens above are normative and mirror the CSS; edit the CSS and DESIGN_SYSTEM.md, not this file. -->

## Overview

An iPhone field notebook: white paper, system text, blue controls, and hairline separators.

## Colors

| Token | Value |
| background | #ffffff |
| surface | #f2f2f7 |
| text / muted | #111111 / #6b6b70 |
| border | #e5e5ea |
| primary | #007aff |
| accent | #eaf3ff |
| success / warning / danger | #007aff / #ff9500 / #ff3b30 |

Declared in `globals.css` as `--color-*` and mirrored in the frontmatter. Use the token, never a raw hex.

## Typography

- Headings: system sans stack
- Body: system sans stack

- Display: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif`
- Body: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif`
- Mono: `ui-monospace, SFMono-Regular, Menlo, monospace`

## Layout

- Tight mobile rhythm, rounded 10–12px controls, minimal shadows, safe-area spacing.
- Shared components: Button, Input, Dialog, compact list rows, category tabs.

## Shapes

Radii: `md` 0.75rem, `sm` calc(var(--radius) - 4px), `lg` 0.75rem

## Do's and Don'ts

- Voice: Plain, private, and unembellished.

- Do load faces through Fontsource, not `next/font/google`.
- Don't introduce a colour or radius that isn't a token above.
- Don't use gradient text, or a purple/violet gradient as the brand signal.
- Don't use bounce or elastic easing; real objects decelerate smoothly.
