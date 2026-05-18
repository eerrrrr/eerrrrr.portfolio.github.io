# Interactive Content Architecture

_Plan date: 2026-05-18_
_Scope: Erin Wong portfolio — long-term strategy for adding interactive works (React, WebGL, Three.js, Unity WebGL, etc.) without destabilising the existing static site._

> **Nothing in this document is implemented yet.** It is a written
> decision about how interactive content should be added in the
> future, so that future maintenance does not accidentally drift into
> a whole-site rewrite. Read this before you propose a framework
> migration.

## 1. Recommended long-term strategy

Keep three things separate:

1. **The portfolio shell** — static HTML / CSS / vanilla JS. Hosted
   on GitHub Pages. Fast first paint, deployable by `git push`, no
   build step. This is what visitors and recruiters see first.
2. **The data layer** — `data/projects.json`. Already driving the
   homepage card grid (see
   [JSON_FIRST_MIGRATION_PLAN.md](JSON_FIRST_MIGRATION_PLAN.md)).
   Lightweight, validated by `tools/validate_projects_json.py`.
3. **Interactive islands** — self-contained interactive demos, one
   per work that needs them. Each lives in its own folder, can have
   its own dependencies and build output, and is linked or embedded
   from the corresponding project page.

The default position is: **do not convert the whole portfolio into a
React app**. A whole-site rewrite would couple the framework to every
piece of content, raise the deployment complexity, and put recruiter-
facing pages behind a build pipeline. Isolated islands keep the cost
of any one demo localised to that one demo.

## 2. Recommended folder structure

```
eerrrrr.github.io/
├── index.html              ← static shell, unchanged
├── style.css
├── script.js               ← JSON-first card renderer
├── i18n.js
├── data/
│   └── projects.json       ← project data layer
├── docs/
├── tools/
│   └── validate_projects_json.py
├── <project>.html          ← per-project detail page (static)
├── <project>/              ← image folder (assets only)
│
└── interactives/           ← NEW: future interactive island root
    ├── ruach/
    │   ├── index.html      ← demo entry point
    │   ├── app.js
    │   ├── style.css       ← scoped to this demo only
    │   ├── assets/
    │   └── README.md       ← demo-specific build/run notes
    │
    ├── voxel-world/
    │   ├── index.html
    │   ├── app.js
    │   ├── dist/           ← optional build output if a bundler is used
    │   └── README.md
    │
    └── <demo-id>/
        └── ...
```

Rules for the `interactives/` folder:

- Each interactive lives in `interactives/<demo-id>/` where
  `<demo-id>` matches a project `id` from `data/projects.json` if it
  belongs to a specific project, or a free-form slug otherwise.
- Everything an interactive needs (HTML, JS, CSS, assets, optional
  build artefacts) lives inside its own folder.
- Each interactive's `index.html` is fully self-contained — its CSS
  and JS must not reach outside the folder. No `<link
  href="../style.css">`, no `<script src="../script.js">`.
- If an interactive uses a bundler, the **build output** is
  committed (no `node_modules`, no build step on GitHub Pages). The
  build command and toolchain are documented in the demo's own
  `README.md`.

## 3. Integration options (from least to most invasive)

How a project detail page can reach an interactive island:

### 3a. Plain link

The simplest option. Add a link on the project page:

```html
<a href="interactives/ruach/" class="next-work-link">
  Open Interactive Demo ↗
</a>
```

Pros: zero risk to the project page, easy to add and remove, works
on every device. Cons: navigates away from the project page.

### 3b. iframe embed

Embed inside a project page as a contained surface:

```html
<iframe
  src="interactives/ruach/"
  title="RUACH interactive demo"
  width="100%" height="600"
  loading="lazy"
  allowfullscreen></iframe>
```

Pros: keeps the demo on the project page, sandboxed by the iframe.
Cons: viewport sizing is awkward on mobile, accessibility needs care
(`title` attribute is required).

### 3c. Modal / lightbox launch

Click a thumbnail or poster, open the interactive in a modal
overlay. Implementation is a small piece of vanilla JS in the
existing `script.js`, plus a button on the project page.

Pros: smooth UX, demo doesn't load until clicked. Cons: more JS to
maintain.

### 3d. Separate subpath

Treat the interactive as its own URL — `https://eerrrrr.github.io/
interactives/<demo-id>/` — and link to it from the project page.
Indistinguishable from 3a from the user's perspective, but
emphasises that the interactive is a standalone artefact.

### Required for every option

Every integration must provide a **fallback poster image or short
video** that loads first:

- Mobile users may not get the full interactive — show the poster.
- Visitors with motion sensitivity (`prefers-reduced-motion`)
  should also see the poster, with an explicit "Open demo" button.
- Slow connections should see something meaningful while the
  interactive loads.

The poster path can live in `data/projects.json` under a future
field like `interactivePoster` if/when interactives are added.

## 4. When to use vanilla JS

Use vanilla JS when the work is small and visual:

- Light DOM interactions (toggle, expand, hover effects).
- Small animations not covered by AOS / CSS transitions.
- Simple filters, search, or sort.
- Cursor effects, scroll-driven visuals.
- A WebGL / Canvas demo that fits in a single file and a few hundred
  lines.

The current `script.js` `initLiquidChrome()` shader is an example —
self-contained, no dependencies, runs from one function. That model
is fine.

## 5. When to use React

Use React **only inside an interactive island**, never as a
whole-site framework. Justified scenarios:

- Complex stateful UI (multiple panels, settings drawers, side
  effects between controls).
- Inspectors, sliders, parameter editors for a generative demo.
- Interactive research tools — filterable data tables, comparison
  views, evidence cards.
- Reusable component libraries that justify component composition.

Even then:

- The React app lives in `interactives/<demo-id>/`.
- Built output is committed (so GitHub Pages serves static files).
- The project's `README.md` documents `npm install` and the build
  command for the next person to maintain it.
- The host portfolio remains static. Do not import React anywhere
  outside the interactive folder.

If you find yourself wanting React in the portfolio shell or in a
project detail page, stop and reconsider — most needs there are
better served by vanilla JS, CSS variables, or a tiny custom
element.

## 6. When to use WebGL / Three.js / Unity WebGL

Use these for spatial or visually rich demos:

- 3D scenes, walkthroughs.
- Generative visuals or shaders that exceed what CSS can do.
- Voxel editors, particle systems, simulation playgrounds.
- AI co-creation interfaces with visual output.
- Immersive previews of architectural / VR work (e.g. RUACH).
- Unity WebGL exports of existing VR / interactive projects.

Rules:

- **They must not block the homepage.** No autoplay of a heavy 3D
  scene on `index.html`. The hero video is an mp4, not a live
  WebGL scene.
- **Always link to them from the project page**, don't embed by
  default.
- **Provide a poster image or short mp4** that loads first; only
  initialise the heavy runtime after a user gesture (click, scroll
  into view past a threshold).
- **Mobile fallback.** On small screens with limited GPU /
  bandwidth, show the poster with a small "view on desktop for the
  full experience" note instead of forcing a degraded WebGL run.
- **Unity WebGL builds are large.** Host them in their own folder
  with their `Build/`, `TemplateData/`, and `index.html`. Don't try
  to merge them into the portfolio shell.

## 7. Safety rules

Apply these to every interactive added in the future:

1. **Homepage must remain lightweight.** Adding an interactive
   never touches `index.html`, `script.js`, `style.css`, or
   `i18n.js` unless you are adding a small link or button on a
   project page.
2. **WebGL must not autoplay heavy scenes.** Click-to-start, or
   defer until the user scrolls past a threshold. Respect
   `prefers-reduced-motion`.
3. **Every interactive must have a static fallback** — image or
   short video — that loads first and that mobile users see by
   default.
4. **One broken demo must not break the portfolio.** Interactive
   folders are isolated. Test the host site after adding any demo
   to confirm the homepage, filters, language switcher, and
   project pages still work.
5. **No global CSS or JS pollution.** Interactives must not
   register global event listeners on `window` / `document` that
   leak when the demo is closed. Iframes are the easiest way to
   guarantee isolation.
6. **Document any build command.** If a future interactive uses
   Vite, esbuild, Webpack, Unity export, or anything else, the
   `interactives/<demo-id>/README.md` must include the exact
   commands and required Node / Unity version to reproduce the
   build.
7. **Validate after adding interactive metadata.** If a project's
   entry in `data/projects.json` gains an interactive URL field
   (e.g. `interactiveDemo: "interactives/ruach/"`), run
   `python tools/validate_projects_json.py` afterwards and confirm
   the homepage still works in default mode and `?static=1`.

## 8. Rules for future Claude sessions

If a future task asks you to add interactive content, follow these
defaults unless the user explicitly overrides them:

1. **Do not convert the whole portfolio to React.** Default to a new
   `interactives/<demo-id>/` folder.
2. **Do not add a build system to the portfolio root.** No
   `package.json` at the repo root. No top-level `node_modules`. If
   a build tool is needed, scope it to the interactive folder only.
3. **Ask before adding any new top-level dependency** (a CDN script
   tag in `index.html`, a new font, a new web component library).
4. **Keep hardcoded homepage fallback cards** in `index.html` —
   they are the runtime safety net behind `data/projects.json`.
   Removing them requires an explicit user instruction.
5. **When adding an interactive URL to a project**, update
   `data/projects.json` and any project page link in the same
   commit. Validate with `tools/validate_projects_json.py`
   afterwards.
6. **After any interactive addition, test all three modes** of the
   homepage:
   - `/` (JSON default)
   - `/?static=1` (hardcoded fallback)
   - `/?json=1` (debug badge)
   Confirm no console errors, all cards visible, all filters work,
   language switcher works.
7. **Prefer the simplest integration** that solves the problem.
   Plain link > iframe > modal > separate subpath > full React
   rewrite. Climb only as far as needed.
8. **Document the new interactive** in this file or in its own
   `interactives/<demo-id>/README.md`. Future Claude sessions
   should be able to read this folder and understand what's there
   without asking the user.

---

## When this plan should change

Revisit this document if any of the following becomes true:

- The number of interactive demos exceeds ~5 and the cost of
  per-folder duplication starts to dominate. Consider a small
  shared library at that point — but still scoped to
  `interactives/_shared/`, not the root.
- A future framework offers static-first rendering that genuinely
  beats vanilla for the portfolio shell's specific shape. (Astro,
  Eleventy, and similar are candidates worth re-evaluating
  someday, but only with an explicit migration plan and tests.)
- The portfolio shell itself starts wanting React-only patterns
  (real-time collaboration, server-side rendered personalisation,
  etc.). None of this is in scope now.

Until then: the answer to "should we convert to React?" is **no by
default**.
