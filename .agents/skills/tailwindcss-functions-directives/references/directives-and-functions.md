# Directives and Functions Reference

Use this file when you need a quick lookup before writing Tailwind CSS v4 in CSS files.

## Directives

| Directive | Use for | Typical example |
|---|---|---|
| `@import` | Import Tailwind and CSS files | `@import "tailwindcss";` |
| `@theme` | Define utility-generating design tokens | `@theme { --color-brand-500: oklch(...); }` |
| `@source` | Register, exclude, or safelist scanned classes | `@source "../packages/ui";` |
| `@utility` | Add project-specific utilities | `@utility content-auto { content-visibility: auto; }` |
| `@variant` | Apply Tailwind variants inside CSS | `@variant hover, focus { ... }` |
| `@custom-variant` | Define selector-backed variants | `@custom-variant dark (&:where(.dark, .dark *));` |
| `@apply` | Inline utilities in custom CSS | `.btn { @apply rounded-lg px-4; }` |
| `@reference` | Import Tailwind context into CSS modules/style blocks without emitting CSS | `@reference "../app.css";` |
| `@config` | Load legacy JavaScript config during migration | `@config "../../tailwind.config.js";` |
| `@plugin` | Load legacy JavaScript plugins during migration | `@plugin "@tailwindcss/typography";` |

## Functions

| Function | Use for | Notes |
|---|---|---|
| `theme()` | Dot-notation theme access | Prefer CSS variables where available. |
| `--spacing()` | Resolve values against the spacing scale in custom utilities | Often paired with `--value(integer)`. |
| `--alpha()` | Apply alpha to a color value | Useful in custom utility declarations. |
| `--value()` | Resolve functional utility values | Supports theme keys, bare values, literal values, and arbitrary values. |
| `--modifier()` | Resolve slash modifiers for functional utilities | Use for patterns like text size plus line height. |
| `--default()` | Provide default values in `--value()` or `--modifier()` | Added for utilities that work with or without explicit values. |

## Migration Rule

Use `@config` and `@plugin` as transition bridges, not as the preferred long-term model. Prefer `@theme`, `@utility`, and `@custom-variant` for new Tailwind CSS v4 work.
