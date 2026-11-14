---
name: tailwindcss-svg-accessibility
description: "Use this skill when styling SVGs or accessibility-specific utilities in Tailwind CSS v4. Covers SVG `fill`, `stroke`, `stroke-width`, `currentColor`, icon sizing with `size-*`, state-colored icons, forced colors support, `forced-color-adjust`, screen-reader-only patterns, semantic SVG guidance, and avoiding visual-only accessibility regressions. Triggers on: SVG, icon, fill, stroke, stroke-width, fill-current, stroke-current, currentColor, forced colors, forced-color-adjust, accessibility, screen reader, sr-only, high contrast."
license: MIT
---

SVG utilities style icon color and stroke behavior. Accessibility utilities and forced-colors support help preserve usability for assistive technologies and high-contrast modes.

## Quick Start

```html
<button class="inline-flex items-center gap-2 text-gray-700 hover:text-gray-950">
  <svg class="size-4 stroke-current" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path stroke-width="1.5" d="M5 10h10" />
  </svg>
  Add item
</button>
```

Forced colors:

```html
<div class="forced-color-adjust-auto">
  <!-- preserve system high-contrast behavior -->
</div>
```

**Related skills:** `tailwindcss-colors`, `tailwindcss-interactivity`, `tailwindcss-states-variants`, `tailwindcss-preflight`.

## SVG Patterns

### Icon follows text color

```html
<a class="inline-flex items-center gap-2 text-sky-700 hover:text-sky-900">
  <svg class="size-4 fill-current" viewBox="0 0 20 20" aria-hidden="true"></svg>
  Details
</a>
```

### Stroke icon

```html
<svg class="size-5 stroke-gray-500 group-hover:stroke-gray-950" fill="none" viewBox="0 0 24 24" aria-hidden="true">
  <path class="stroke-2" d="M4 12h16" />
</svg>
```

### State-colored icons

```html
<div class="group text-gray-600 hover:text-sky-700">
  <svg class="size-5 stroke-current" aria-hidden="true"></svg>
</div>
```

Use `currentColor` when text and icon should change together.

## Accessibility Patterns

### Decorative vs meaningful SVG

Decorative SVG:

```html
<svg aria-hidden="true" class="size-4 fill-current"></svg>
```

Meaningful standalone SVG:

```html
<svg role="img" aria-labelledby="chart-title" class="size-6">
  <title id="chart-title">Revenue increased</title>
</svg>
```

### Screen-reader-only labels

Use visually hidden labels for icon-only controls:

```html
<button class="grid size-10 place-items-center rounded-lg">
  <svg class="size-5" aria-hidden="true"></svg>
  <span class="sr-only">Open menu</span>
</button>
```

### Forced colors

Use forced-color utilities when custom colors interfere with high-contrast modes:

```html
<svg class="forced-color-adjust-auto stroke-current" aria-hidden="true"></svg>
```

Avoid disabling forced color adjustment unless the component supplies an accessible alternative.

## Common Mistakes

### [HIGH] Icon-only button without accessible name

Add visible text or an `sr-only` label. `aria-hidden="true"` on the icon does not name the button.

### [HIGH] Marking meaningful SVG as decorative

Only use `aria-hidden="true"` for decorative icons. Meaningful SVGs need an accessible name.

### [MEDIUM] Hard-coding icon color separately from text

Use `fill-current` or `stroke-current` when the icon should inherit text state and dark mode colors.

## API Reference

- Fill: `https://tailwindcss.com/docs/fill`
- Stroke: `https://tailwindcss.com/docs/stroke`
- Stroke width: `https://tailwindcss.com/docs/stroke-width`
- Forced color adjust: `https://tailwindcss.com/docs/forced-color-adjust`
- `sr-only` / `not-sr-only`: `https://tailwindcss.com/docs/display#screen-reader-only`
