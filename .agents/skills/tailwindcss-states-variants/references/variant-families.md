# Variant Families Reference

Use this file to choose the right Tailwind CSS v4 variant family.

| Family | Examples | Use when |
|---|---|---|
| User action | `hover:`, `focus:`, `focus-visible:`, `active:`, `visited:` | Styling direct interaction states. |
| Form/control state | `disabled:`, `checked:`, `invalid:`, `required:`, `placeholder-shown:` | Styling form and control states. |
| Parent state | `group-hover:`, `group-focus:`, `group-has-*`, named groups like `group/card` | A child responds to ancestor state. |
| Sibling state | `peer-checked:`, `peer-invalid:`, named peers | A later sibling responds to an earlier sibling. |
| Attributes | `aria-expanded:`, `aria-[sort=ascending]:`, `data-[state=open]:` | Styling semantic state exposed via attributes. |
| Structure | `first:`, `last:`, `odd:`, `even:`, `empty:`, `only:` | Styling based on document structure. |
| Pseudo-elements | `before:`, `after:`, `placeholder:`, `marker:`, `selection:`, `backdrop:` | Styling generated or browser pseudo-elements. |
| Media/preferences | `motion-safe:`, `motion-reduce:`, `contrast-more:`, `portrait:`, `print:` | Styling based on environment or preferences. |
| Feature support | `supports-[...]` | Gating styles behind `@supports`. |
| Negation/relational | `not-*`, `has-*` | Styling based on absence or descendant state. |
| Arbitrary selectors | `[&>li]:`, `lg:[&:nth-child(3)]:` | One-off selector logic. |
| Custom variants | `@custom-variant theme-midnight (...)` | Repeated project selector logic. |

## Selection Rule

Use built-in variants first, arbitrary variants for local one-offs, and `@custom-variant` for repeated project semantics.
