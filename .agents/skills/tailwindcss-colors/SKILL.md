---
name: tailwindcss-colors
description: "Use this skill when using or customizing colors in Tailwind CSS v4. Covers default color palette steps, text/background/border/fill/stroke/caret/accent colors, opacity modifiers like `bg-black/50`, OKLCH theme variables, `currentColor`, dark-mode color pairing, custom `--color-*` tokens, and v4.2 palettes (mauve, olive, mist, taupe). Triggers on: colors, palette, bg-*, text-*, border-*, fill-*, stroke-*, color opacity, /50, OKLCH, --color-*, dark color, mauve, olive, mist, taupe."
license: MIT
---

Tailwind color utilities are driven by the theme color palette. The default palette uses shade steps from `50` through `950`, and custom colors are added with `--color-*` theme variables.

## Quick Start

```html
<div class="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
  <strong class="font-semibold text-sky-900 dark:text-sky-50">Deployment ready</strong>
  <p class="mt-1 text-sm/6 text-sky-800/80 dark:text-sky-100/80">The palette works across states and dark mode.</p>
</div>
```

Custom color:

```css
@theme {
  --color-brand-500: oklch(0.68 0.18 245);
}
```

```html
<button class="bg-brand-500 text-white hover:bg-brand-500/90">Save</button>
```

**Related skills:** `tailwindcss-theme`, `tailwindcss-dark-mode`, `tailwindcss-backgrounds-borders`, `tailwindcss-svg-accessibility`.

For a color utility lookup table, read [references/color-utilities.md](references/color-utilities.md).

## Core Patterns

### Common color utilities

| Utility | CSS target |
|---|---|
| `bg-*` | background color |
| `text-*` | text color |
| `border-*` | border color |
| `outline-*` | outline color |
| `ring-*` | ring color |
| `divide-*` | divider color |
| `placeholder-*` | placeholder color |
| `fill-*` | SVG fill |
| `stroke-*` | SVG stroke |
| `caret-*` | caret color |
| `accent-*` | form accent color |

### Opacity modifiers

Use slash opacity modifiers instead of deprecated v3 opacity utilities:

```html
<div class="bg-black/50 text-white/90 ring-1 ring-white/20">
  <!-- ... -->
</div>
```

### `currentColor`

Use `fill-current`, `stroke-current`, or SVG utilities that inherit text color when icons should follow surrounding text:

```html
<a class="inline-flex items-center gap-2 text-sky-700 hover:text-sky-900">
  <svg class="size-4 fill-current" viewBox="0 0 20 20"></svg>
  Details
</a>
```

### Dark mode color pairs

Pair background, foreground, border, and subtle surfaces:

```html
<section class="bg-white text-gray-950 ring-1 ring-gray-950/10 dark:bg-gray-950 dark:text-white dark:ring-white/10">
  <!-- ... -->
</section>
```

Avoid simply inverting one color; preserve contrast and hierarchy.

### v4.2/v4.3 palette additions

The v4.3 release notes cover v4.2 additions, including new neutral-ish palettes: `mauve`, `olive`, `mist`, and `taupe`. Verify exact shade names in the live docs when using them in generated code.

## Common Mistakes

### [HIGH] Using removed v3 opacity utilities

Wrong in v4:

```html
<div class="bg-black bg-opacity-50"></div>
```

Correct:

```html
<div class="bg-black/50"></div>
```

### [MEDIUM] Adding a custom color in `:root` and expecting utilities

Use `@theme { --color-brand-500: ... }` to create `bg-brand-500`. A `:root` variable alone will not create utilities.

### [MEDIUM] Forgetting SVG and form color targets

Icons and controls often need `fill-*`, `stroke-*`, `caret-*`, or `accent-*`, not just text/background colors.

## API Reference

- Colors: `https://tailwindcss.com/docs/colors`
- Background color: `https://tailwindcss.com/docs/background-color`
- Text color: `https://tailwindcss.com/docs/color`
- Border color: `https://tailwindcss.com/docs/border-color`
- v4.3 release notes: `https://tailwindcss.com/blog/tailwindcss-v4-3`
