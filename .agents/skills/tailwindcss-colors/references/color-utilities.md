# Color Utilities Reference

Use this file when mapping a color decision to the right utility family.

| Utility family | CSS target |
|---|---|
| `bg-*` | `background-color` |
| `text-*` | `color` |
| `decoration-*` | `text-decoration-color` or decoration style/width depending on value |
| `placeholder-*` | `::placeholder` color |
| `border-*` | `border-color` or border width/style depending on value |
| `outline-*` | `outline-color` or outline width/style depending on value |
| `ring-*` | Ring color or width depending on value |
| `divide-*` | Child border color between divided elements |
| `accent-*` | Form control accent color |
| `caret-*` | Text input caret color |
| `fill-*` | SVG fill |
| `stroke-*` | SVG stroke color |
| `shadow-*` | Shadow color or shadow size depending on value |
| `scrollbar-thumb-*` | Scrollbar thumb color |
| `scrollbar-track-*` | Scrollbar track color |

## Opacity

Use slash opacity modifiers:

```html
<div class="bg-black/50 text-white/80 ring-white/20"></div>
```

Do not use removed v3 opacity utilities such as `bg-opacity-*`.
