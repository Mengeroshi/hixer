---
name: tailwindcss
description: "Use this skill first for ANY Tailwind CSS v4 task; it routes to the right specialized skill for installation, utility-first styling, variants, responsive design, dark mode, theme variables, colors, custom styles, source detection, directives, Preflight, layout, flex/grid, spacing/sizing, typography, backgrounds/borders, effects/filters, transitions, transforms, interactivity, SVG/accessibility, compatibility, and v3-to-v4 migration. Triggers on: Tailwind, tailwindcss, utility classes, className, @theme, @utility, @variant, @source, @apply, dark:, hover:, responsive, container query."
license: MIT
---

Entry point for the Tailwind CSS v4 skill collection. Tailwind CSS is a utility-first CSS framework that scans source files for class names and generates static CSS with zero runtime.

## How to use this skill

1. Find the specialized skill in the router below that best matches the task.
2. Load that skill's `SKILL.md` and follow its guidance.
3. If no sub-skill fits, verify the exact feature against the official docs at `https://tailwindcss.com/docs`.

As of the latest verified official docs, the docs are on Tailwind CSS v4.3. If the user's repository pins another Tailwind version, follow that repository version and load `tailwindcss-upgrade-v4` only for migration work.

For a compact trigger index for every skill, see [references/index.md](references/index.md).

## Skill router

### Foundations

| Skill | Load when... |
|---|---|
| [tailwindcss-installation](../tailwindcss-installation/SKILL.md) | Installing Tailwind CSS, choosing Vite/PostCSS/CLI/webpack/Play CDN, framework setup, or fixing missing generated CSS. |
| [tailwindcss-core-concepts](../tailwindcss-core-concepts/SKILL.md) | Explaining the utility-first model, zero-runtime build, class composition, generated CSS, or v4 CSS-first defaults. |
| [tailwindcss-compatibility](../tailwindcss-compatibility/SKILL.md) | Browser support, CSS preprocessors, prefixing, build boundaries, or deciding whether to stay on v3.4. |
| [tailwindcss-upgrade-v4](../tailwindcss-upgrade-v4/SKILL.md) | Upgrading from Tailwind CSS v3 to v4 or diagnosing v3 syntax in a v4 project. |
| [tailwindcss-preflight](../tailwindcss-preflight/SKILL.md) | Base styles, reset behavior, form defaults, heading/list/button defaults, or overriding base layer styles. |

### Core concepts

| Skill | Load when... |
|---|---|
| [tailwindcss-states-variants](../tailwindcss-states-variants/SKILL.md) | Using `hover:`, `focus:`, `group-*`, `peer-*`, `data-*`, `aria-*`, `supports-*`, pseudo-elements, arbitrary variants, or custom variants. |
| [tailwindcss-responsive-design](../tailwindcss-responsive-design/SKILL.md) | Breakpoints, mobile-first behavior, `max-*` ranges, arbitrary media queries, `@container`, `@container-size`, or container query variants. |
| [tailwindcss-dark-mode](../tailwindcss-dark-mode/SKILL.md) | Dark mode styling, selector-driven dark mode, data attribute themes, persisted toggles, or avoiding flash of wrong theme. |
| [tailwindcss-theme](../tailwindcss-theme/SKILL.md) | Design tokens, `@theme`, token namespaces, default theme customization, CSS variables, or adding theme-backed utilities. |
| [tailwindcss-colors](../tailwindcss-colors/SKILL.md) | Color palettes, text/background/border colors, opacity modifiers, OKLCH, color variables, or new v4.2 palettes. |
| [tailwindcss-custom-styles](../tailwindcss-custom-styles/SKILL.md) | Arbitrary values/properties/variants, custom CSS, `@layer`, component classes, or authoring project utilities. |
| [tailwindcss-source-detection](../tailwindcss-source-detection/SKILL.md) | Missing classes, dynamic class strings, scanning source files, `@source`, safelisting, or excluding sources. |
| [tailwindcss-functions-directives](../tailwindcss-functions-directives/SKILL.md) | CSS directives/functions like `@import`, `@theme`, `@source`, `@utility`, `@variant`, `@custom-variant`, `@apply`, `@reference`, `@config`, `@plugin`, `--spacing()`, or `theme()`. |

### Utility groups

| Skill | Load when... |
|---|---|
| [tailwindcss-layout](../tailwindcss-layout/SKILL.md) | Display, position, overflow, object fit, visibility, z-index, columns, break behavior, box sizing, or layout containment. |
| [tailwindcss-flex-grid](../tailwindcss-flex-grid/SKILL.md) | Flexbox, grid, gap, order, row/column spans, auto placement, justification, alignment, or place utilities. |
| [tailwindcss-spacing-sizing](../tailwindcss-spacing-sizing/SKILL.md) | Padding, margin, width, height, min/max size, logical `inline-*`/`block-*`, or spacing scale work. |
| [tailwindcss-typography](../tailwindcss-typography/SKILL.md) | Font family/size/weight, text color, line height, letter spacing, lists, wrapping, overflow, `tab-*`, or content utilities. |
| [tailwindcss-backgrounds-borders](../tailwindcss-backgrounds-borders/SKILL.md) | Background color/image/gradient/position/repeat/size, border radius/width/color/style, or outline utilities. |
| [tailwindcss-effects-filters](../tailwindcss-effects-filters/SKILL.md) | Box/text shadows, opacity, blend modes, masks, filters, backdrop filters, or scrollbar styling. |
| [tailwindcss-transitions-animation](../tailwindcss-transitions-animation/SKILL.md) | Transitions, timing, duration, delay, `transition-behavior`, animations, keyframes, or motion-safe/motion-reduce variants. |
| [tailwindcss-transforms](../tailwindcss-transforms/SKILL.md) | Rotate, scale, skew, translate, transform origin/style, perspective, backface visibility, or `zoom-*`. |
| [tailwindcss-interactivity](../tailwindcss-interactivity/SKILL.md) | Cursor, pointer events, resize, scroll behavior/snap/margins/padding, touch action, user select, color scheme, field sizing, or will-change. |
| [tailwindcss-svg-accessibility](../tailwindcss-svg-accessibility/SKILL.md) | SVG fill/stroke/stroke-width or accessibility utilities like `forced-color-adjust`. |

## Fallback: canonical Tailwind CSS docs

If the task references a utility, directive, package, or version feature not covered by a sub-skill, use the official docs:

- Latest official docs: `https://tailwindcss.com/docs`
- Latest official blog and release notes: `https://tailwindcss.com/blog`

When a fact may have changed, prefer the live docs over this skill text.
