# JSON-First Migration Plan

_Plan date: 2026-05-18_
_Scope: Erin Wong portfolio (both primary and backup repos)_

## 1. Why JSON-first, not direct React rewrite

A full React rewrite would bundle three migrations into one:

1. Content extraction from HTML / `i18n.js` into a structured format.
2. Component decomposition (card, hero, sidebar, gallery block, …).
3. A new build/deploy pipeline (Vite, npm, GitHub Actions).

If any one of those goes wrong, the live site is broken. The portfolio
also doubles as a CV that recruiters open without warning — uptime
matters.

JSON-first separates step (1) and runs it in isolation:

- The current static site keeps running exactly as it does today.
- A new `data/projects.json` is added alongside the HTML as a parallel
  source of truth, **not consumed by the runtime**.
- Future steps can adopt it gradually: first as a content reference,
  then to drive a small generator, then potentially as the data source
  for a React/Vite version.

If the JSON drifts or breaks, nothing on the live site changes. The
blast radius is contained to documentation.

## 2. What was extracted in this pass (2026-05-18)

Two reference files were created in `data/` of both repos:

### `data/projects.json`

13 active projects, each with:

| Field | Coverage |
|---|---|
| `id`, `slug`, `page`, `category`, `type` | ✅ Complete for all 13 |
| `title` | ✅ Complete |
| `year`, `location` | ✅ Complete (parsed from homepage card subtitle) |
| `coverImage` | ✅ Complete |
| `images` | ✅ Complete (full folder listing — includes unused/archived) |
| `displayedTagsRaw`, `dataTags` | ✅ Complete |
| `shortDescription`, `longDescription` | ✅ Complete (from `i18n.js` EN section) |
| `i18nPrefix`, `i18nKeys` | ✅ Complete (extracted from each detail page) |
| `role` | ⚠️ Partial — null for most projects (no canonical source in current HTML). Inferred for `cultural`, `studio`, `spirulina` from `v.role.*` keys noted in `PORTFOLIO_I18N_STATE.md`. |
| `isFeatured` | ⚠️ Null for all — no signal in current HTML. Reserved for future use. |
| `sourceFiles`, `notes` | ✅ Complete |

One hidden / commented-out project (`tri-stool` — the genuine one,
not RUACH) is documented in `hidden_or_commented_out` but not in the
active `projects` array. The visible RUACH card reuses
`tri-stool.html` for legacy reasons; this is captured in the notes.

### `data/site-structure.json`

Snapshot of the site shape: main pages, project pages, shared
assets, asset folders, routing behaviour, filename risks, fragile
runtime behaviours, CDN dependencies, and pointers to the
`portfolio support document/` reference folder.

## 3. What is still hardcoded

The following content lives only in HTML and `i18n.js`, and is **not**
in `projects.json`:

- **Section body paragraphs and bullets** per project (the `*.body.*`
  and `*.intro.*` keys). These are too page-specific to flatten into
  `projects.json` without losing structure. They are referenced by
  key in `i18nKeys` but their values are still in `i18n.js`.
- **Image captions** (`cap.*`). Same reason — listed as keys in
  `i18nKeys`, values stay in `i18n.js`.
- **Meta values on detail pages** (year, team, office, partners,
  project, tools, material). These are repeated across the i18n
  dictionary using `meta.*` labels and `v.*` enumerated values. Not
  flattened into `projects.json` for this pass.
- **Section headings** (`*.h1`, `*.h2`, …). Treated as i18n strings,
  not structured data.
- **Homepage hero text** (HUMAN / MACHINE / IMAGINATION / VISION /
  SYSTEM / FEELING) and ABOUT block. Lives in `index.html` + `i18n.js`.
- **Skill tags** on `index.html` (Adobe Suite, ArchiCAD, Rhino …).
  Hardcoded as `<span class="skill-pill">`.

Migrating those would multiply the size of `projects.json` and require
defining a richer schema. They are left as future work to keep this
first JSON small and trustworthy.

## 4. How `projects.json` could later drive the website (sketches)

These are forward-looking notes only. Do NOT implement without an
explicit task.

### 4a. Lightweight: generate the homepage card grid

A tiny build step (Node, ~30 lines) can read `projects.json` and emit
the `<a class="project-card">` block currently hardcoded in
`index.html`. Benefits:

- Order, categories, tags become editable in one JSON file instead of
  HTML.
- Adding a new project becomes: append to `projects.json` + drop image
  folder + run the generator.

Risks:

- A generator adds a build step where there is currently none.
- Output must be deterministic and diff-clean, or the convenience is
  lost.

### 4b. Medium: generate per-page sidebar meta blocks

Each project's sidebar (year, location, team, role, material) could
be generated from the JSON. The body content stays handwritten in the
HTML. This still doesn't require a framework — just a per-page
template + a generator.

### 4c. Larger: replace i18n.js with per-key JSON files

Instead of one ~280 KB `i18n.js`, ship per-language JSON files plus a
small runtime that fetches the active language. Reduces initial page
weight but adds a network request. Only consider if dictionary size
grows beyond ~500 KB.

### 4d. Largest: React / Vite rewrite

`projects.json` becomes the data source for a React component tree.
At that point the static HTML is replaced wholesale. This is the
endpoint of the migration — not the next step.

## 5. What should NOT be migrated yet

- **Don't connect `projects.json` to the live site.** The current site
  must keep functioning identically with zero dependency on the JSON.
- **Don't write a generator yet.** The JSON needs to be reviewed by
  the user first to confirm field coverage is accurate.
- **Don't refactor `i18n.js`.** It is in active use and tested across
  5 languages. The runtime engine (`applyI18n`, `setLanguage`,
  `t(key)`) already works well and is documented in
  `portfolio support document/PORTFOLIO_I18N_SYSTEM.md`.
- **Don't change folder names or page filenames** as part of this
  migration. The case-sensitive references and the `tri-stool.html`
  ↔ `ruach/` indirection are load-bearing.
- **Don't fix unrelated audit findings** while moving JSON forward.
  Audit fixes belong in their own tightly-scoped commits.
- **Don't introduce npm, Vite, or a build step yet.** Adding tooling
  is a separate decision with its own risks (lockfile rot, build
  divergence between repos, GitHub Pages config changes).

## 6. How to keep GitHub Pages deployment working

The deployment model is unchanged by this migration:

- `eerrrrr.github.io` (backup repo) is the GitHub Pages user-pages
  site. A push to its `main` branch publishes within ~30s.
- `eerrrrr.portfolio.github.io` (primary repo) is the source of truth.
  Pushes here do not publish anywhere.
- The bidirectional sync rule still applies — see `CLAUDE.md § 11`.

`data/projects.json` and `data/site-structure.json` are now present
in both repos. They sit alongside the static HTML and are served
verbatim by GitHub Pages. Nothing on the live site requests them.

If a future step writes JS that fetches `data/projects.json` at
runtime, that JS should:

1. Be added as a separate `<script>` tag with its own `?v=` cache
   query.
2. Fail gracefully if the fetch fails (so a malformed JSON cannot
   break the live page).
3. Be feature-detected — the static HTML should remain a working
   fallback during the transition.

## 7. What future Claude sessions should check before using the JSON

Before treating `data/projects.json` as authoritative, verify:

1. **The HTML it was extracted from is still the same shape.**
   Specifically: the `<a class="project-card">` block layout in
   `index.html`, the meta block layout in detail-page sidebars, and
   the i18n key naming conventions in `portfolio support document/
   PORTFOLIO_I18N_SYSTEM.md`. If those have drifted, the JSON is
   stale.

2. **`generated_at` in the JSON.** If more than a few weeks old, run
   a quick diff against the live HTML before recommending changes
   based on the JSON alone.

3. **Specific fields are accurate for your task.** The `role`,
   `isFeatured`, and meta values fields are intentionally incomplete.
   Don't assume they are exhaustive.

4. **The `notes` field for each project.** It flags real edge cases
   (filename mismatches, swap behaviours, mixed image naming) that a
   migration generator must respect.

5. **Both repos still have matching JSON.** The sync rule applies to
   these files just like it does to HTML / CSS / JS.

## 8. Suggested next steps (when ready)

1. **User review of `projects.json`.** Spend 10-15 minutes spot-checking
   the fields — especially `role` and any tag interpretations — and
   correct anything that doesn't match the user's intent.
2. **Bring `PORTFOLIO_I18N_STATE.md` up to date.** Its `?v=3` should
   become `?v=4`, and its "RESUME TASK" memory note in the user's
   `MEMORY.md` should be reconciled with the 2026-04-15 changelog
   entry that says i18n body work is complete.
3. **Decide on a generator.** If yes, scope it narrowly to the
   homepage card grid first (section 4a). Keep the generator output
   diff-clean.
4. **Do not skip to React.** Each intermediate step is reversible;
   skipping isn't.

---

**Files added by this migration pass (both repos):**

- `data/projects.json`
- `data/site-structure.json`
- `docs/JSON_FIRST_MIGRATION_PLAN.md` (this file)

**Files modified by this migration pass:** none. The live website
behaviour is unchanged.
