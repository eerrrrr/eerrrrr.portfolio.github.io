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

## 4. How `projects.json` drives the website now (Phase 4 — done)

The homepage now renders project cards from `data/projects.json` at
runtime, in the browser. **No build step was added.** `script.js`
fetches the JSON on `DOMContentLoaded`, builds 13 card elements in
memory, validates them, and atomically swaps them in before Masonry
initializes.

URL query parameters control the behavior:

| URL | Behavior |
|---|---|
| `https://eerrrrr.github.io/` | Default. JSON cards. Silent (no badge). |
| `https://eerrrrr.github.io/?json=1` | Same as default, plus a green debug badge in the top-right. |
| `https://eerrrrr.github.io/?static=1` | Escape hatch — uses the original hardcoded cards in `index.html`. |

The hardcoded cards in `index.html` are still present and serve as
both fallback and escape-hatch source. They are NOT removed.

**Fallback policy.** Any of these failures leaves the hardcoded
cards in place:

- Fetch returns non-2xx
- JSON parse fails
- `projects` array missing or empty
- Card count mismatches `project_count`
- Any built card is missing an `href`

The swap is atomic: cards are built and validated in memory first,
then `querySelectorAll('.project-card').remove()` runs, then the new
cards are inserted. A mid-loop failure cannot leave a half-populated
grid.

### Validating `data/projects.json` before commit

Because `data/projects.json` now drives the live homepage, edits to
it carry production risk. A small validator catches the common
mistakes before they reach the live site:

```powershell
python tools/validate_projects_json.py
```

Run from anywhere in the repo — the script resolves its own root.
Exit codes:

- `0` — only PASS / WARN messages (safe to commit)
- `1` — one or more FAILs (do not commit)

FAIL conditions (blocking):

- `data/projects.json` is not valid JSON.
- `project_count` does not match `len(projects)`.
- A required field is missing or empty on any project
  (`id`, `title`, `page`, `coverImage`, `category`, `dataTags`,
  `displayedTagsRaw`, `i18nPrefix`).
- Two projects share an `id`.
- A project's `page` file does not exist on disk.
- A project's `coverImage` path does not exist on disk.
- A `category` is not in the declared `categories` whitelist.
- A `dataTag` is not a lowercase token (alphanumeric + hyphen only).
- `i18n.js` is missing the `card.<id>.sub` key for any project.
- `index.html` has been stripped of all hardcoded fallback cards
  (the runtime safety net).

WARN conditions (informational, intentional):

- `role` is null on a project (no `v.role.*` declared on the page).
- `isFeatured` is null (reserved for future use).
- `displayedTagsRaw` and `dataTags` token sets diverge (intentional
  per the locked tag policy in § 4e).
- `slug` differs from the page filename stem.
- Hardcoded fallback card count in `index.html` differs from
  `len(projects)`.

When to run it:

- After any change to `data/projects.json`.
- After renaming or moving a project page or its image folder.
- After changing the hardcoded fallback cards in `index.html`.
- After adding or renaming `card.<id>.sub` keys in `i18n.js`.
- Before every commit that touches any of the above.

The validator is read-only — no file is modified. Run it in both
the primary and the live repo to confirm both pass before committing.

### Future variants (still sketches)

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

**This is explicitly NOT recommended by default** for this portfolio.
See [INTERACTIVE_CONTENT_ARCHITECTURE.md](INTERACTIVE_CONTENT_ARCHITECTURE.md)
for the preferred alternative: keep the portfolio shell static and
add React (or WebGL, Three.js, Unity WebGL) only inside isolated
`interactives/<demo-id>/` folders linked from individual project
pages. A whole-site rewrite would couple the framework to every
piece of content and put recruiter-facing pages behind a build
pipeline — the opposite of what JSON-first was meant to enable.

## 4e. Tag policy (locked)

The portfolio has two parallel tag systems and they are intentionally
not always equal:

- **`data-tags` attribute** on each `<a class="project-card">` in
  `index.html` is the **functional filter system**. Lowercase, simple
  tokens, used by `script.js`'s `filterByTag()` substring matcher.
  Mirrored as `dataTags` in `data/projects.json`.
- **`<div class="tags">` text** inside each card is the
  **decorative display layer** shown to visitors. Mirrored as
  `displayedTagsRaw` in `data/projects.json`.

Policy:

1. The two systems do not have to be identical. Examples:
   - `sfh` shows `#Helsinki` (location wording) but `helsinki` is
     intentionally not in `data-tags` — location filtering is not
     currently planned.
   - `tearoom` has `landscape` in `data-tags` (for filter coverage)
     but its visible card shows `#Concrete #Public` — `landscape`
     does not need to appear on the card.
   - `cultural` displays the multi-word `#Wood Frame` as a single
     visible token; it is not split into separate filter tokens.
2. `data-tags` **should** cover every concept a future filter might
   match on. If the card visibly shows `#Hospital`, `data-tags` must
   contain `hospital`.
3. Lowercase tokens in `data-tags`. Display string can use any
   wording / capitalisation.
4. When `data-tags` changes in `index.html`, update `dataTags` in
   `data/projects.json` in the same commit. When the visible
   `<div class="tags">` text changes, update `displayedTagsRaw` in
   `data/projects.json` in the same commit.
5. Future Claude sessions: **do not reconcile divergences unprompted.**
   Treat each mismatch as intentional unless the user explicitly asks
   for a reconciliation pass (like the one on 2026-05-18).

## 5. What should NOT be migrated yet

- **Don't remove the hardcoded cards from `index.html`** until the
  JSON default has been live and stable for at least one editing
  cycle. They are the fallback path and the `?static=1` escape hatch.
- **Don't move the detail pages into JSON.** Each `<project>.html` is
  hand-tuned with its own content, captions, intro bullets, and
  meta. Flattening these into JSON would multiply the schema and lose
  fidelity. Keep them as-is.
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
