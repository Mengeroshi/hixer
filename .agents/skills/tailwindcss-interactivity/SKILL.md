---
name: tailwindcss-interactivity
description: "Use this skill when styling interaction behavior in Tailwind CSS v4. Covers accent color, appearance, caret color, color scheme, cursor, field sizing, pointer events, resize, scroll behavior, scrollbar color/width/gutter, scroll margin/padding, scroll snap, touch action, user select, will-change, and interactive state combinations. Triggers on: cursor, pointer-events, select-none, user-select, resize, scroll, scroll-snap, scroll-m, scroll-p, scrollbar, touch-action, caret, accent, color-scheme, field-sizing, will-change."
license: MIT
---

Interactivity utilities control how elements respond to input, selection, scrolling, form behavior, and browser UI affordances.

## Quick Start

```html
<form class="space-y-4">
  <input class="field-sizing-content caret-sky-600 accent-sky-600" />
  <button class="cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50">
    Submit
  </button>
</form>
```

**Related skills:** `tailwindcss-states-variants`, `tailwindcss-effects-filters`, `tailwindcss-layout`, `tailwindcss-svg-accessibility`.

## Utility Map

| Need | Utilities |
|---|---|
| Cursor | `cursor-pointer`, `cursor-not-allowed`, `cursor-grab`, `cursor-[...]` |
| Pointer events | `pointer-events-none`, `pointer-events-auto` |
| Selection | `select-none`, `select-text`, `select-all`, `select-auto` |
| Resize | `resize`, `resize-x`, `resize-y`, `resize-none` |
| Touch | `touch-auto`, `touch-none`, `touch-pan-x`, `touch-pan-y`, `touch-manipulation` |
| Scroll behavior | `scroll-smooth`, `scroll-auto` |
| Scroll snap | `snap-x`, `snap-y`, `snap-mandatory`, `snap-center`, `snap-start`, `snap-always` |
| Scroll spacing | `scroll-m-*`, `scroll-p-*` |
| Scrollbars | `scrollbar-thin`, `scrollbar-none`, `scrollbar-gutter-*`, `scrollbar-thumb-*`, `scrollbar-track-*` |
| Forms | `accent-*`, `caret-*`, `appearance-none`, `field-sizing-*` |
| Browser color scheme | `scheme-light`, `scheme-dark`, `scheme-light-dark` |
| Performance hint | `will-change-*` |

## Core Patterns

### Disabled controls

```html
<button class="cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50">
  Continue
</button>
```

### Scroll snapping

```html
<div class="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth">
  <section class="w-80 shrink-0 snap-start">...</section>
  <section class="w-80 shrink-0 snap-start">...</section>
</div>
```

### Anchor offset under sticky headers

```html
<h2 id="billing" class="scroll-mt-24">Billing</h2>
```

### Form affordances

```html
<input class="accent-sky-600 caret-sky-600" type="checkbox" />
<textarea class="resize-y field-sizing-content"></textarea>
```

### Will-change

Use `will-change-*` only for elements that are about to animate or change:

```html
<div class="will-change-transform transition-transform hover:scale-105"></div>
```

Remove broad `will-change` use if it creates memory or rendering pressure.

## Common Mistakes

### [HIGH] Using `pointer-events-none` on accessible controls without disabling semantics

Pointer-events only affects pointer input. Use proper `disabled`, `aria-disabled`, focus handling, and keyboard behavior as appropriate.

### [MEDIUM] Enabling smooth scroll without considering reduced motion

For large scroll movement, consider user preference and product accessibility requirements.

### [MEDIUM] Leaving `will-change` everywhere

`will-change` is a hint with cost. Use it surgically.

## API Reference

- Cursor: `https://tailwindcss.com/docs/cursor`
- Pointer events: `https://tailwindcss.com/docs/pointer-events`
- User select: `https://tailwindcss.com/docs/user-select`
- Scroll behavior: `https://tailwindcss.com/docs/scroll-behavior`
- Scroll snap type: `https://tailwindcss.com/docs/scroll-snap-type`
- Scrollbar color: `https://tailwindcss.com/docs/scrollbar-color`
- Will change: `https://tailwindcss.com/docs/will-change`
