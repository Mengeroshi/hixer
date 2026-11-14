---
name: tailwindcss-spacing-sizing
description: "Use this skill when setting spacing and size in Tailwind CSS v4. Covers padding, margin, negative margin, space utilities, width/height/min/max, `size-*`, logical `inline-*`/`block-*` utilities, v4.2 logical spacing (`pbs-*`, `pbe-*`, `mbs-*`, `mbe-*`), spacing scale, arbitrary sizes, viewport/container units, and responsive sizing. Triggers on: padding, margin, spacing, gap, width, height, size, min-w, max-w, min-h, max-h, inline-size, block-size, logical spacing, pbs, pbe, mbs, mbe."
license: MIT
---

Use spacing utilities for interior/exterior spacing and sizing utilities to constrain width, height, and logical dimensions. Prefer theme scale values for consistency, arbitrary values for true one-offs.

## Quick Start

```html
<section class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
  <div class="grid gap-6 md:grid-cols-3">
    <article class="min-h-48 rounded-lg p-6">...</article>
  </div>
</section>
```

**Related skills:** `tailwindcss-theme`, `tailwindcss-responsive-design`, `tailwindcss-flex-grid`, `tailwindcss-layout`.

## Utility Map

| Need | Utilities |
|---|---|
| Padding | `p-*`, `px-*`, `py-*`, `pt-*`, `pe-*`, `pb-*`, `ps-*` |
| Margin | `m-*`, `mx-*`, `my-*`, `mt-*`, `me-*`, `mb-*`, `ms-*`, negative `-m-*` |
| Child spacing | `space-x-*`, `space-y-*` |
| Width/height | `w-*`, `h-*`, `size-*` |
| Min/max | `min-w-*`, `max-w-*`, `min-h-*`, `max-h-*` |
| Logical size | `inline-*`, `min-inline-*`, `max-inline-*`, `block-*`, `min-block-*`, `max-block-*` |
| Logical spacing | `pbs-*`, `pbe-*`, `mbs-*`, `mbe-*` and related block-start/block-end utilities |

## Core Patterns

### Page gutters

```html
<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <!-- ... -->
</main>
```

### Equal width and height

```html
<button class="grid size-10 place-items-center rounded-full">...</button>
```

### Fluid constraints

```html
<div class="w-full max-w-xl min-w-0"></div>
```

### Logical sizing

Use logical utilities for writing-mode-aware layouts:

```html
<div class="inline-full max-inline-lg block-64">
  <!-- ... -->
</div>
```

### Arbitrary values

```html
<aside class="w-[18rem] max-w-[calc(100vw-2rem)]"></aside>
```

### Custom spacing tokens

Define tokens with `@theme` when the value is part of the design system:

```css
@theme {
  --spacing-sidebar: 18rem;
}
```

## Common Mistakes

### [HIGH] Using margins to space flex/grid children

Prefer `gap-*` for flex and grid child spacing. Use margins when spacing should belong to one element's relationship to surrounding flow.

### [MEDIUM] Forgetting `min-w-0` or `min-h-0`

Scrollable or truncating children inside flex/grid containers often need `min-w-0` or `min-h-0` to shrink correctly.

### [MEDIUM] Overusing arbitrary dimensions

Arbitrary values are fine for one-offs. Repeated values should become theme tokens or component constraints.

## API Reference

- Padding: `https://tailwindcss.com/docs/padding`
- Margin: `https://tailwindcss.com/docs/margin`
- Width: `https://tailwindcss.com/docs/width`
- Height: `https://tailwindcss.com/docs/height`
- Inline size: `https://tailwindcss.com/docs/inline-size`
- Block size: `https://tailwindcss.com/docs/block-size`
