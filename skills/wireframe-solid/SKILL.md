---
name: wireframe-solid
description: Drop-in rotating wireframe dodecahedron in pure CSS 3D (no canvas, WebGL or dependencies). Use when a /chelp chain (c1-c3) builds a hero, section accent or background that wants a quiet 3D line-art motif, or when asked for a wireframe solid.
origin: ECC
---

# wireframe-solid

A rotating wireframe dodecahedron built from CSS 3D transforms. One stylesheet, one optional
~90-line script, themed entirely through custom properties. Used by the `/chelp` chains
(`/c1`, `/c2`, `/c3`) as a restrained motion motif that passes the Hallmark Floor.

## When to Use

- A hero, divider or background needs a slow, quiet 3D line-art accent.
- You want depth and motion without a WebGL or canvas dependency.
- A page needs several desynced copies, or one that scales as the user scrolls.

Do not use it as the page's only design idea. It is an accent; hierarchy, type and colour still carry the page.

## How It Works

Files live in `assets/` next to this skill:

| File | Purpose |
|------|---------|
| `assets/wireframe-solid.css` | The solid: 12 pentagon faces folded by `rotateY`/`translateZ`/`rotateX` |
| `assets/wireframe-solid.js` | Optional. Builds the 72 nested elements and adds scroll-scrubbed scale. The CSS works without it only if you paste the markup by hand |
| `assets/demo.html` | Five variants: default, large/teal, light background, scroll scale, desynced copies |

1. Copy `wireframe-solid.css` (and `.js`) into the project's asset folder. Do not link into this skill's folder.
2. Add `<div class="wireframe-solid"></div>`. The script fills it with the faces.
3. Style with custom properties on the element or a parent:

```css
.wireframe-solid {
  --ws-size: 100px;                 /* face edge length */
  --ws-color: rgba(255,255,255,.45);/* line colour */
  --ws-line: 1px;                   /* line thickness */
  --ws-speed: 100s;                 /* one full tumble */
  --ws-delay: 0s;                   /* desync multiple copies */
}
```

Scroll-scrubbed scale (needs the script):

```html
<div class="wireframe-solid" data-ws-scale-from="2" data-ws-scale-to=".4"></div>
```

After SPA / PJAX navigation call `window.wireframeSolid.init()`.

## Rules When Using It In a Chain

- **Colour**: set `--ws-color` from the project's colour token, not a hard-coded value; keep contrast sensible on both light and dark surfaces (see `demo.html`).
- **Reduced motion**: the stylesheet already stops the animation under `prefers-reduced-motion: reduce`. Keep that block.
- **Decorative only**: the element has `pointer-events: none`; add `aria-hidden="true"` so it is skipped by assistive tech.
- **Performance**: it animates `transform` only. Keep to a few copies per page and load the script with `defer`.
- **Size**: the box is `--ws-size` wide and `2.23 x --ws-size` tall; reserve that space so it causes no layout shift.
- Run `/design-gate` after adding it, as with any visual change.

## Examples

Hero accent in a teal brand:

```html
<link rel="stylesheet" href="/css/wireframe-solid.css">
<div class="wireframe-solid" aria-hidden="true"
     style="--ws-size:160px; --ws-color:var(--color-accent); --ws-line:2px; --ws-speed:40s"></div>
<script src="/js/wireframe-solid.js" defer></script>
```

Three desynced copies: give each a different `--ws-delay` (`0s`, `3s`, `6s`).
