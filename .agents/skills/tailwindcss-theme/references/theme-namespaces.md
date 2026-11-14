# Theme Namespaces Reference

Use this file when deciding which `@theme` variable namespace creates the utility family you need.

| Namespace | Creates or affects |
|---|---|
| `--color-*` | Color utilities such as `bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*`, and `stroke-*`. |
| `--font-*` | Font family utilities such as `font-display`. |
| `--text-*` | Font size utilities and related text size variables. |
| `--font-weight-*` | Font weight utilities. |
| `--tracking-*` | Letter spacing utilities. |
| `--leading-*` | Line height utilities. |
| `--spacing-*` | Spacing-driven utilities, including padding, margin, gap, inset, width, and height families. |
| `--breakpoint-*` | Responsive breakpoint variants. |
| `--container-*` | Container query variants and container sizing. |
| `--radius-*` | Border radius utilities. |
| `--shadow-*` | Box shadow utilities. |
| `--inset-shadow-*` | Inset shadow utilities. |
| `--drop-shadow-*` | Drop-shadow filter utilities. |
| `--blur-*` | Blur and backdrop blur utilities. |
| `--perspective-*` | Perspective utilities. |
| `--aspect-*` | Aspect ratio utilities. |
| `--ease-*` | Transition timing function utilities. |
| `--animate-*` | Animation utilities. |

## Choosing `@theme` vs `:root`

Use `@theme` when the token should create Tailwind utilities. Use `:root` for ordinary CSS variables that should not create utility classes.
