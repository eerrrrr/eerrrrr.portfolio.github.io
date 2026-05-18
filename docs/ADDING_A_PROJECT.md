# Adding a New Project

_Workflow date: 2026-05-18_
_Scope: How to add (or substantially modify) one project in the Erin
Wong portfolio so it appears on the homepage, has a detail page, and
is filter-/i18n-correct in both repos._

This document is the **operational checklist**. For data-layer
philosophy see
[JSON_FIRST_MIGRATION_PLAN.md](JSON_FIRST_MIGRATION_PLAN.md). For
i18n key naming conventions and translation policy see the
authoritative source at
`E:\my-portfolio-website\portfolio support document\PORTFOLIO_I18N_SYSTEM.md`.
For interactive demos see
[INTERACTIVE_CONTENT_ARCHITECTURE.md](INTERACTIVE_CONTENT_ARCHITECTURE.md).

---

## 1. When to use this doc

Use this checklist when:

- Adding a brand-new project to the portfolio.
- Replacing or substantially renaming an existing project (e.g. new
  page filename, new image folder name, new project id).

Do **not** use this for: small caption tweaks, tag adjustments, or
i18n-only edits. Those don't go through every step below.

## 2. Prerequisites

- Both repos cloned and on `main`:
  - Primary: `E:\my-portfolio-website\eerrrrr.portfolio.github.io`
  - Live:    `E:\my-portfolio-website\eerrrrr.github.io`
- Python 3 available (for the validator).
- The new project's assets ready locally (images, optional video,
  optional PDF).

## 3. Files usually touched

| File | Why |
|---|---|
| `data/projects.json` | Append a new entry under `projects` and bump `project_count`. |
| `<new-project>/` folder | Drop image and asset files here. |
| `<new-project>.html` | New project detail page. Copy a similar existing page as the template. |
| `index.html` | Append a new hardcoded `<a class="project-card">` block under `#masonry-container` so the runtime fallback stays correct. |
| `i18n.js` | Add `card.<id>.sub`, sidebar description keys, body paragraph keys, captions in all 5 languages. Bump `?v=` cache version in every HTML file. |
| `docs/ADDING_A_PROJECT.md` (this file) | Update only if the workflow itself changes. |
| `interactives/<id>/` (optional) | Only if the project has an interactive demo — see § 9. |

Both repos get the same edits (primary first; see § 10).

## 4. Step-by-step

### Step 1 — Choose identifiers

Decide three strings before touching any file:

| Name | Example | Rule |
|---|---|---|
| `id` | `vault` | The i18n key namespace prefix. Lowercase, no spaces, no hyphens. Stable for the project's life. |
| `slug` | `vault-house` | URL-friendly identifier. Usually matches the page filename stem. Hyphens are fine. |
| `page` | `vault-house.html` | The detail-page filename at the repo root. Case matters on GitHub Pages. |

Notes:

- `id` is **not always equal to the page filename stem.** Existing
  examples: `Single-family-home.html` → `id=sfh`, `tri-stool.html` →
  `id=ruach`, `Study-group-Works.html` → `id=study`. Mismatches are
  preserved for legacy reasons; only diverge intentionally.
- The image folder usually matches the slug (e.g. `vault-house/`),
  but the page may pull from another folder (e.g. `tri-stool.html`
  uses the `ruach/` folder). Document any indirection in the project's
  `notes` field.

### Step 2 — Create the asset folder

```
<repo>/<slug>/
├── <slug>_icon.jpg     ← homepage card icon, ~600 × 800 px
├── hero.jpg            ← detail-page hero image
└── (other images, videos, PDFs)
```

Naming conventions in use:

- Cover image: usually `<slug>_icon.jpg` (look at existing folders
  for the exact form). Some folders use `<Name>_icon.png` instead.
  Preserve case sensitivity.
- File names with spaces, semicolons, or non-ASCII characters are
  allowed but URL-encode them in HTML references.

### Step 3 — Create the detail HTML page

Copy a structurally similar existing page (e.g. `bamboo.html` for a
master-thesis-style project, `tearoom.html` for a bachelor
architecture project) as the template. Adjust:

- `<title>`, `<meta name="description">`, all Open Graph tags.
- Sidebar meta block: year, location, team, role, material, etc.
  Use existing `meta.*` labels and `v.*` enumerated values where
  possible — only add new `v.*` keys if the value is genuinely new.
- Body sections, headings, captions — each gets its own `data-i18n`
  key following the `{i18nPrefix}.body.h{N}.{P}`, `{i18nPrefix}.h{N}`,
  `cap.{i18nPrefix}.{N}` pattern documented in
  `portfolio support document\PORTFOLIO_I18N_SYSTEM.md`.
- Previous/next-work links at the bottom — update by hand to maintain
  the homepage order.

### Step 4 — Add i18n keys

Follow `PORTFOLIO_I18N_SYSTEM.md` exactly:

1. Add the `card.<id>.sub` key to **all 5 language objects** in
   `i18n.js` (`en`, `zh`, `fi`, `de`, `ja`). The English baseline
   should match the visible card subtitle (e.g.
   `'Helsinki / Master 2025'`).
2. Add the sidebar description keys
   (`{i18nPrefix}.desc.p1`, `{i18nPrefix}.desc.p2`) in all 5 languages.
3. Add section headings (`{i18nPrefix}.h1` … `{i18nPrefix}.hN`) in all
   5 languages.
4. Add body paragraphs (`{i18nPrefix}.body.hN.P`) in all 5 languages.
5. Add captions (`cap.{i18nPrefix}.N`) in all 5 languages.
6. Add any new meta values (`v.type.*`, `v.role.*`, `v.loc.*`,
   `v.mat.*`) only if the value is genuinely new.
7. **Bump the cache version** — change `?v=N` to `?v=N+1` in
   **every** HTML file (`index.html` + all 13 + the new project's
   page). Otherwise visitors will load the stale `i18n.js` from cache.

A missing key in a non-EN language silently falls back to English at
runtime — easy to miss until a non-EN visitor opens the page. Adding
to all 5 in lockstep is the simplest defence.

### Step 5 — Add to `data/projects.json`

Append the new entry to the `projects` array, preserving the
homepage order (which currently mirrors the order projects appear in
`index.html`'s `#masonry-container`). Required fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Lowercase, matches the i18n namespace prefix. Must be unique. |
| `title` | string | Card title as shown on the homepage. |
| `slug` | string | URL-safe; matches page filename stem when possible. |
| `page` | string | Detail-page filename, e.g. `vault-house.html`. |
| `category` | string | One of `master`, `bachelor`, `internship`. |
| `type` | string | One of `architecture`, `furniture`, `3dprinting`, `vr`, `other`. |
| `year` | integer | Pulled from the card subtitle. |
| `location` | string | Pulled from the card subtitle (e.g. `"Helsinki"`). |
| `role` | string or null | Use `null` if no `v.role.*` is declared on the page. |
| `coverImage` | string | Relative path to the homepage card icon. |
| `images` | array of strings | All files in the project's asset folder. |
| `displayedTagsRaw` | string | Exact contents of the card's `<div class="tags">` — visible to humans, can include `#Location`, spaces, capitalisation. |
| `dataTags` | array of strings | Functional filter tags. Lowercase, alphanumeric + hyphen, no spaces. Must cover every concept a future filter might match on. See § 6. |
| `i18nPrefix` | string | Namespace for this project's i18n keys. |
| `i18nKeys` | array of strings | All unique `data-i18n` keys referenced by the detail page, sorted. Easiest way to fill this: run `grep -o 'data-i18n="[^"]*"' <project>.html` and clean up. |
| `isFeatured` | null | Reserved for future use. Always null for now. |
| `sourceFiles` | object | `{ "html": "<page>", "folder": "<folder>/" }`. |
| `notes` | string | Project-specific quirks worth knowing — folder/file casing oddities, intentional tag divergence, etc. Keep outward-facing tone (no dated dev log entries). |

Also: **bump `project_count`** at the top level to match the new
`projects.length`.

### Step 6 — Add the hardcoded fallback card to `index.html`

`index.html` keeps a hardcoded `<a class="project-card">` block for
every project. This is the runtime safety net — when
`data/projects.json` fails to load, parse, or validate, the user sees
these cards instead. **Do not skip this step.**

Add a new block under `#masonry-container` in the same order as the
JSON. The block must mirror the JSON values exactly for:

- `href` ↔ `page`
- `data-category` ↔ `category`
- `data-type` ↔ `type`
- `data-tags` ↔ `dataTags.join(' ')`
- card title text ↔ `title`
- card subtitle text + `data-i18n` ↔ default English of
  `card.<id>.sub`
- `<div class="tags">` text ↔ `displayedTagsRaw`
- `<img src="…" alt="…">` ↔ `coverImage` (alt text is descriptive,
  not necessarily equal to `title`)

If `index.html` and `data/projects.json` drift, the validator
(§ 7) will warn. Treat the warning as a real signal — fix one to
match the other before commit.

### Step 7 — Run the validator

From either repo root:

```powershell
python tools/validate_projects_json.py
```

Exit 0 means safe to commit. Exit 1 means something is broken — read
the FAIL lines and fix. Run it again until it passes.

Typical FAILs after a new project addition:

- `page file not found` — the new HTML file isn't where the JSON
  says it is. Check filename case.
- `coverImage not found` — the icon path is wrong.
- `i18n key missing in i18n.js: card.<id>.sub` — Step 4 was
  incomplete.
- `project_count (N) != projects.length (M)` — Step 5 forgot to bump
  the count.

Expected WARNs (informational, not blocking):

- `role is null on N projects` — fine if the new project has no
  `v.role.*` key.
- `isFeatured is null on N projects` — always null currently.
- `displayedTagsRaw vs dataTags diverge` — intentional per the tag
  policy. Only worry if your new project should match exactly and
  doesn't.
- `slug differs from page stem` — only intentional in legacy cases.
  For new projects, prefer matching slug and page stem.

### Step 8 — Test locally

```powershell
cd "E:\my-portfolio-website\eerrrrr.github.io"
python -m http.server 8000
```

Then open each URL and run the checklist:

| URL | What to confirm |
|---|---|
| `http://localhost:8000/` | New card appears in the JSON-rendered grid in the expected position. Image loads. Click goes to the detail page. No green badge. Console logs `[json-default] Rendered N cards`. |
| `http://localhost:8000/?static=1` | Same card visible (this is the hardcoded fallback). Image loads. Click goes to the detail page. Console logs `[json-default] ?static=1 — using hardcoded cards`. |
| `http://localhost:8000/?json=1` | Same as default plus green debug badge. |
| Detail page (e.g. `http://localhost:8000/<page>.html`) | Page renders. Hero image / video plays. All sections show. Language switcher swaps text. Previous / Next work links work. |
| Default → click each filter pill | Architecture / Furniture / 3D Printing / VR / AIGC — the new card appears or hides in the right filter buckets. |
| Default → click each language pill | EN / 中 / FI / DE / JP — every translated string changes, including the new card subtitle. |

Browser devtools console must have no errors in any mode.

### Step 9 — Optional: interactive demo

If the new project has an interactive component (WebGL, React,
Three.js, Unity WebGL), follow the islands pattern documented in
[INTERACTIVE_CONTENT_ARCHITECTURE.md](INTERACTIVE_CONTENT_ARCHITECTURE.md):

- Put it in `interactives/<id>/` with its own self-contained
  `index.html` and assets.
- Provide a static poster image or short video as the fallback.
- Link to it from the detail page using the simplest viable
  integration (plain link → iframe → modal → separate subpath).
- Do **not** add a build system at the repo root. If the interactive
  uses a bundler, scope it to the interactive folder and commit its
  build output.
- Update `data/projects.json` if a future schema adds an interactive
  URL field, then re-run the validator.

### Step 10 — Mirror, commit, push

Sync rule applies. Working order:

1. Make all edits in the **primary** repo first.
2. Run the validator in primary. Confirm exit 0.
3. Test locally in primary or live (either works for the test
   itself).
4. Mirror the exact same changes to the **live** repo. For shared
   files (`script.js`, `data/projects.json`,
   `<project>.html`, `<folder>/`, `i18n.js`, the new `index.html`
   block), copying is fine — they should be byte-identical between
   repos. For `CLAUDE.md` and `README_OTHER_AI.md`, only mirror the
   substantive additions; keep each repo's existing
   PRIMARY-vs-BACKUP framing.
5. Re-run the validator in live. Confirm exit 0.
6. Commit in each repo independently. Use a clear message like
   `Add <project name>` or `Update <project name>`.
7. Push **live** to publish to `https://eerrrrr.github.io/`. Push
   primary as well for source-of-truth bookkeeping.

## 5. Field reference shortcuts

A new project entry skeleton (fill in the angle brackets):

```json
{
  "id": "<id>",
  "title": "<Title>",
  "slug": "<slug>",
  "page": "<page>.html",
  "category": "<master|bachelor|internship>",
  "type": "<architecture|furniture|3dprinting|vr|other>",
  "year": 0000,
  "location": "<Location>",
  "role": null,
  "coverImage": "<folder>/<icon>.jpg",
  "images": ["<folder>/<file>", "…"],
  "displayedTagsRaw": "#<Tag1> #<Tag2>",
  "dataTags": ["<tag1>", "<tag2>"],
  "shortDescription": "<one-sentence pitch>",
  "longDescription": "<longer description>",
  "i18nPrefix": "<id>",
  "i18nKeys": ["card.<id>.sub", "…"],
  "isFeatured": null,
  "sourceFiles": {"html": "<page>.html", "folder": "<folder>/"},
  "notes": "<anything worth knowing>"
}
```

## 6. Choosing `dataTags` vs `displayedTagsRaw`

The portfolio has two parallel tag systems and they don't have to
match (see the tag policy in `CLAUDE.md § 7`):

- `displayedTagsRaw` is what visitors see. May include location names
  (`#Helsinki`), material wording (`#Wood Frame` — one tag with a
  space), or marketing keywords. Capitalisation is free.
- `dataTags` is what the filter system uses. Lowercase, simple
  tokens, no whitespace. Must cover every concept a future filter
  might match on.

Worked examples:

| Project | displayedTagsRaw | dataTags | Why |
|---|---|---|---|
| `commune` | `#Helsinki #CLT #Extension` | `["wood", "clt", "extension"]` | `#Helsinki` is location wording (display-only). `wood` is filterable but not displayed. |
| `nyamata` | `#Hospital #Design` | `["hospital", "design"]` | They match — clear when the visible tags ARE the filter concepts. |
| `cultural` | `#Landscape #Wood Frame` | `["wood", "landscape"]` | `#Wood Frame` is one display tag; split into two filter tokens. |

Do **not** "fix" intentional divergence unprompted. The validator
will WARN about all divergences but not block them.

## 7. Things future Claude sessions must NOT do

Reinforced here so this doc can stand alone:

- **Do not delete the hardcoded `<a class="project-card">` blocks in
  `index.html`.** They are the runtime fallback safety net for
  `data/projects.json`. The validator FAILs if `index.html` is
  stripped of all cards.
- **Do not convert the portfolio shell to React / Vue / Astro /
  Eleventy / any framework.** Interactive content goes in
  `interactives/<demo-id>/` islands. See
  [INTERACTIVE_CONTENT_ARCHITECTURE.md](INTERACTIVE_CONTENT_ARCHITECTURE.md).
- **Do not add a build system at the repo root.** No `package.json`,
  no `node_modules`, no Vite config. A bundler is allowed only
  inside an interactive folder.
- **Do not rename `main page/`, `style.css`, `script.js`, `i18n.js`,
  or any project folder casually.** Many references are
  case-sensitive on GitHub Pages.
- **Do not edit only one repo.** Changes must end up in both primary
  and live before being considered done.
- **Do not skip the validator.** If `python tools/validate_projects_json.py`
  exits 1, the change is not ready to commit.
- **Do not skip the `?static=1` test.** The hardcoded fallback must
  visibly work; that's the whole point of keeping it.
- **Do not bump only some HTML files' `?v=` query.** Either every
  HTML file moves to the new version or none of them do.
- **Do not assume `id == slug == page stem`.** Several existing
  projects use different values intentionally. Use the JSON's actual
  values, don't derive them from filenames.

## 8. Quick reference (TL;DR)

```
1. id / slug / page          — choose three strings
2. folder + assets           — drop images in <slug>/
3. <page>.html               — copy a similar page, adjust meta + i18n
4. i18n.js                   — add all keys in all 5 languages; bump ?v=
5. data/projects.json        — append entry; bump project_count
6. index.html                — append hardcoded fallback card in JSON order
7. tools/validate_projects_json.py — must exit 0
8. local test                — / + /?static=1 + /?json=1 + filters + langs + detail page
9. mirror to live; commit both; push live
```

If any step feels skippable, re-read § 7.
