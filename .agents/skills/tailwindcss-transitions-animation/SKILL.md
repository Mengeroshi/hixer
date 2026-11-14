---
name: tailwindcss-transitions-animation
description: "Use this skill when adding transitions or animations in Tailwind CSS v4. Covers transition property, duration, delay, timing functions, transition behavior, discrete transitions, animation utilities, custom `--animate-*` tokens, keyframes, hover/focus state transitions, and motion-safe/motion-reduce variants for accessibility. Triggers on: transition, duration, delay, ease, animation, animate-spin, keyframes, motion-safe, motion-reduce, transition-behavior, starting-style."
license: MIT
---

Use transitions for state changes and animations for continuous or keyframed motion. Respect reduced-motion preferences.

## Quick Start

```html
<button class="rounded-lg bg-sky-600 px-4 py-2 text-white transition-colors duration-200 ease-out hover:bg-sky-700 motion-reduce:transition-none">
  Save
</button>
```

Custom animation:

```css
@theme {
  --animate-fade-in: fade-in 180ms ease-out both;

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
```

```html
<div class="animate-fade-in">...</div>
```

**Related skills:** `tailwindcss-states-variants`, `tailwindcss-transforms`, `tailwindcss-effects-filters`, `tailwindcss-theme`.

## Utility Map

| Need | Utilities |
|---|---|
| Transition property | `transition`, `transition-colors`, `transition-opacity`, `transition-transform`, `transition-all`, `transition-none` |
| Duration | `duration-150`, `duration-300`, `duration-[425ms]` |
| Delay | `delay-75`, `delay-150`, `delay-[1s]` |
| Easing | `ease-linear`, `ease-in`, `ease-out`, `ease-in-out`, custom `ease-*` tokens |
| Behavior | `transition-normal`, `transition-discrete` |
| Animation | `animate-spin`, `animate-ping`, `animate-pulse`, `animate-bounce`, custom `animate-*` |
| Motion prefs | `motion-safe:*`, `motion-reduce:*` |

## Core Patterns

### State transitions

```html
<a class="text-gray-600 transition-colors hover:text-gray-950 focus-visible:text-gray-950">
  Account
</a>
```

Transition only the properties that actually change where possible.

### Transform transitions

```html
<button class="transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0">
  Press
</button>
```

### Reduced motion

```html
<div class="transition motion-reduce:transition-none motion-reduce:hover:transform-none">
  <!-- ... -->
</div>
```

For larger motion, use `motion-safe:` to opt in:

```html
<div class="motion-safe:animate-fade-in"></div>
```

### Discrete transitions

Use `transition-discrete` when working with CSS properties that support discrete transitions and when target browsers support the needed platform behavior.

## Common Mistakes

### [HIGH] Ignoring reduced-motion preferences

Large movement, parallax, and repeated animation should use `motion-safe:` or provide `motion-reduce:` fallbacks.

### [MEDIUM] Using `transition-all` everywhere

`transition-all` can animate unexpected properties. Prefer `transition-colors`, `transition-opacity`, or `transition-transform`.

### [MEDIUM] Animating layout-heavy properties

Prefer transform and opacity for smooth UI motion. Test layout-affecting animations carefully.

## API Reference

- Transition property: `https://tailwindcss.com/docs/transition-property`
- Transition duration: `https://tailwindcss.com/docs/transition-duration`
- Transition timing function: `https://tailwindcss.com/docs/transition-timing-function`
- Transition behavior: `https://tailwindcss.com/docs/transition-behavior`
- Animation: `https://tailwindcss.com/docs/animation`
- Motion variants: `https://tailwindcss.com/docs/hover-focus-and-other-states#prefers-reduced-motion`
