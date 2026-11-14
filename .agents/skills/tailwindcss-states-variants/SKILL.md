---
name: tailwindcss-states-variants
description: "Use this skill when styling conditional states and selectors in Tailwind CSS v4. Covers hover/focus/active/disabled/focus-visible, group and peer variants, aria/data attributes, pseudo-elements, has/not/supports/media variants, structural selectors, arbitrary variants, custom variants with `@custom-variant`, and `@variant` inside CSS. Triggers on: hover:, focus:, active:, disabled:, focus-visible:, group-hover, peer-invalid, data-*, aria-*, has-*, not-*, supports-*, before:, after:, first:, last:, arbitrary variants, custom variant."
license: MIT
---

Variants are Tailwind prefixes that apply a utility only when a condition matches. Use them for interaction states, parent/sibling state, media features, attributes, structural selectors, pseudo-elements, dark mode, and custom selector rules.

## Quick Start

```html
<button class="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50">
  Save changes
</button>
```

```html
<label class="group block">
  <span class="text-sm font-medium text-gray-700 group-has-[:checked]:text-sky-700">Email updates</span>
  <input class="peer sr-only" type="checkbox" />
  <span class="mt-2 block rounded border border-gray-300 p-3 peer-checked:border-sky-500 peer-checked:bg-sky-50">
    Weekly digest
  </span>
</label>
```

**Related skills:** `tailwindcss-dark-mode`, `tailwindcss-responsive-design`, `tailwindcss-custom-styles`, `tailwindcss-functions-directives`.

For a grouped lookup of variant families, read [references/variant-families.md](references/variant-families.md).

## Core Patterns

### Interaction states

Use direct state variants for the element itself:

```html
<a class="text-gray-600 hover:text-gray-950 focus-visible:outline-2 active:text-gray-700">
  Account
</a>
```

Prefer `focus-visible:` for keyboard focus rings when mouse focus should not draw a ring.

### Parent state with `group`

Mark the parent with `group`, then style descendants:

```html
<a class="group block rounded-lg p-4 hover:bg-gray-50">
  <h3 class="font-medium text-gray-950 group-hover:text-sky-700">Project</h3>
  <p class="text-sm text-gray-600 group-hover:text-gray-900">Open details</p>
</a>
```

Use named groups when nesting:

```html
<div class="group/card">
  <button class="group-hover/card:opacity-100 opacity-0">Open</button>
</div>
```

### Sibling state with `peer`

`peer-*` uses a previous sibling as the marker:

```html
<input class="peer" type="email" required />
<p class="invisible text-sm text-red-600 peer-invalid:visible">Enter a valid email.</p>
```

The peer element must come before the element being styled.

### Data and ARIA attributes

Use attributes directly:

```html
<button aria-expanded="true" class="aria-expanded:bg-gray-100">Menu</button>
<div data-state="open" class="opacity-0 transition data-[state=open]:opacity-100">Panel</div>
```

### Pseudo-elements and structural selectors

```html
<ul class="divide-y divide-gray-200">
  <li class="first:pt-0 last:pb-0 odd:bg-gray-50">Item</li>
</ul>

<p class="before:mr-2 before:content-['*'] before:text-red-500">Required</p>
```

### Feature and media variants

```html
<div class="supports-[backdrop-filter]:bg-white/70 motion-reduce:transition-none">
  <!-- ... -->
</div>
```

Use `motion-safe:` and `motion-reduce:` for animation-sensitive UI.

### Arbitrary variants

Use bracket notation for a one-off selector:

```html
<ul class="[&>li:nth-child(-n+3)]:font-semibold">
  <li>One</li>
  <li>Two</li>
</ul>
```

Keep arbitrary variants local. If the selector becomes a repeated API, define a custom variant.

### Custom variants

```css
@import "tailwindcss";

@custom-variant theme-midnight (&:where([data-theme="midnight"], [data-theme="midnight"] *));
```

```html
<div class="theme-midnight:bg-gray-950 theme-midnight:text-white">
  <!-- ... -->
</div>
```

### Variants inside CSS

Use `@variant` when CSS is the right place for the rule:

```css
.button {
  background: var(--color-sky-600);

  @variant hover, focus {
    background: var(--color-sky-700);
  }
}
```

Tailwind CSS v4.3 supports stacked and compound `@variant` use.

## Common Mistakes

### [HIGH] Using `peer-*` on following siblings

`peer-*` only works for elements after the peer marker in the DOM. Move the marker before the target or use `group-*`.

### [MEDIUM] Creating custom CSS for simple hover/focus states

Use variants first. Custom CSS is appropriate when the selector is not expressible clearly with built-in or arbitrary variants.

### [MEDIUM] Leaving repeated arbitrary variants unnamed

Repeated bracket selectors are hard to maintain. Promote them to `@custom-variant` when they become a project convention.

## API Reference

- Hover, focus, and other states: `https://tailwindcss.com/docs/hover-focus-and-other-states`
- Dark mode: `https://tailwindcss.com/docs/dark-mode`
- Adding custom variants: `https://tailwindcss.com/docs/adding-custom-styles#adding-custom-variants`
- Functions and directives: `https://tailwindcss.com/docs/functions-and-directives`
