# CLAUDE.md — Erin Wong Portfolio (eerrrrr.portfolio.github.io)

> Read this file first in every session. It is the project briefing for
> Claude Code. Keep it terse, accurate, and current.

## 1. What this is

A single-page-plus-detail-pages **static portfolio website** for Erin
Wong (architectural designer). The site doubles as an online CV.

This repo (`eerrrrr.portfolio.github.io`) is the **PRIMARY / source of
truth** working copy. There is also a **BACKUP** mirror at
`E:\my-portfolio-website\eerrrrr.github.io`. Whenever you change
website content here, the same change must also be applied to the
backup repo (and vice versa). See section 11.

The backup repo is the one wired to GitHub Pages at
`https://eerrrrr.github.io/` (a GitHub user-pages site). This primary
repo is the working copy the user edits in; treat it as the canonical
source even when the backup is the publicly-served copy.

## 2. Tech stack

- Plain **HTML5 + CSS3 + vanilla JS** — no framework, no build step.
- **GitHub Pages** for hosting (the backup repo deploys to
  `https://eerrrrr.github.io/`).
- CDN libraries (via `unpkg`):
  - `aos@2.3.1` — scroll-triggered animations
  - `imagesloaded@5` and `masonry-layout@4` — gallery layout on index
- Optional WebGL "Liquid Chrome" hero shader in `script.js` (currently
  inactive — see section 9 risk #2).
- No package manager, no `package.json`, no node_modules. Nothing to
  install.

## 3. Folder layout

```
eerrrrr.portfolio.github.io/
├── index.html                ← homepage (hero + bio + masonry gallery)
├── 404.html                  ← GitHub Pages 404
├── style.css                 ← single shared stylesheet (~25 KB)
├── script.js                 ← shared JS (masonry, filter, WebGL hero)
├── i18n.js                   ← 5-language dictionary (~280 KB)
├── favicon.svg
│
├── <project>.html            ← 14 project detail pages (bamboo.html, …)
├── <project>/                ← matching image folder for each page
│       └── *.jpg / *.png     ← hero, renders, diagrams, icons
│
├── main page/                ← homepage hero assets (hero.mp4, poster.jpg)
└── docs/                     ← project documentation (this folder)
```

The 14 project pages and their image folders:

| HTML page                  | Image folder        |
|----------------------------|---------------------|
| `index.html`               | `main page/`        |
| `bamboo.html`              | `bamboo/`           |
| `commune.html`             | `commune/`          |
| `cultural-center.html`     | `cultural-center/`  |
| `furniture-park.html`      | `furniture-park/`   |
| `nyamata.html`             | `nyamata/`          |
| `Single-family-home.html`  | `Single-family-home/` |
| `spirulina.html`           | `spirulina/`        |
| `stool.html`               | `stool/`            |
| `studio-renovation.html`   | `studio-renovation/` |
| `Study-group-Works.html`   | `study-group/`      |
| `tearoom.html`             | `tearoom/`          |
| `tri-stool.html`           | `tri-stool/` and uses `ruach/` icons too |
| `vault-house.html`         | `vault-house/`      |

Folder name `main page` has a literal space — referenced in HTML as
`main%20page/...`. Don't rename it without updating every reference.

## 4. Key files

| File          | What it controls                                      |
|---------------|-------------------------------------------------------|
| `index.html`  | Hero (mp4 video), about, masonry project grid, sidebar with CV |
| `style.css`   | All styling. CSS variables defined in `:root` at the top. RWD breakpoints at 1400px and 768px. |
| `script.js`   | Masonry init, `filterByType` / `filterProjects` / `filterByTag`, sticky nav scroll behaviour, dead WebGL hero |
| `i18n.js`     | Dictionary for `en / zh / fi / de / ja`. `data-i18n="key"` attributes in HTML resolve to entries here. |
| `<project>.html` | Per-project detail page — shares `style.css`, `script.js`, `i18n.js`. Two-column layout: gallery main + sticky sidebar with project meta. |

Cache-buster: `i18n.js?v=4` — bump the `v=` number when you ship a
change to the dictionary, so visitors don't get the stale cached copy.

## 5. Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```powershell
cd "E:\my-portfolio-website\eerrrrr.portfolio.github.io"
python -m http.server 8000
# then open http://localhost:8000/
```

A static server is required for the hero video and `fetch`-style
relative paths to behave like production. `file://` mostly works but
some browsers block the video autoplay.

## 6. Deploy

```powershell
git add <changed-files>
git commit -m "<message>"
git push origin main
```

This primary repo's remote is
`https://github.com/eerrrrr/eerrrrr.portfolio.github.io.git`. Pushing
to `main` here does **not** by itself update the public site at
`https://eerrrrr.github.io/` — that is served from the backup repo.
After the sync step (section 11), the backup repo's push is what
publishes the change.

There is no CI, no preview environment, no staging. Once the backup
is pushed, the live site updates within ~30s.

## 7. Content editing rules

- **Text changes** — edit the HTML directly. If the element has a
  `data-i18n="some.key"` attribute, also update `i18n.js` for *every*
  language (en / zh / fi / de / ja). If only the English source is
  updated, the other languages keep the old text.
- **New project** — duplicate an existing `<project>.html` + folder,
  rewrite content, add a new `<a class="project-card">` block in
  `index.html` under `#masonry-container`, add matching `card.*.sub`
  keys to `i18n.js`.
- **Project image icons** — use `<folder>/<icon>.jpg`, ~600 × 800 px.
- **Don't** add per-project HTML inside subfolders — folders hold
  images only.
- **i18n keys** — naming convention: `<scope>.<section>.<index>`
  (e.g. `bamboo.h1`, `bamboo.body.h1.1`, `meta.year`,
  `card.bamboo.sub`). Stay consistent.

### Tag policy

The homepage has **two parallel tag systems** that are intentionally
not always identical. Treat them as separate fields, not duplicates:

- `data-tags` attribute on each `<a class="project-card">` =
  **functional filter tags**. Lowercase, simple tokens, consumed by
  `script.js` `filterByTag()` via substring match. These also
  populate the `dataTags` array in `data/projects.json`.
- Visible `<div class="tags">` text inside each card =
  **decorative / display tags**. Mirrored to `displayedTagsRaw` in
  `data/projects.json`. May include location names, material wording,
  visual keywords, or human-friendly phrasing.

Rules:

- The two **do not need to be identical.** A card may display
  `#Helsinki` (location) without putting `helsinki` in `data-tags`. A
  project may have `landscape` in `data-tags` (for filter coverage)
  without surfacing it in the visible display.
- However, `data-tags` should cover **every concept a future filter
  might match on.** If a card displays `#Hospital`, then `data-tags`
  should contain `hospital` so the filter actually finds the project.
- Use lowercase, simple tokens in `data-tags`. Use whatever wording
  reads well in the visible display.
- When you change `data-tags` in `index.html`, **also update
  `dataTags` in `data/projects.json` in the same commit.**
- When you change the visible `<div class="tags">` text, **also
  update `displayedTagsRaw` in `data/projects.json` in the same
  commit.**
- Future Claude sessions: **do not "fix" display/data tag divergence
  on your own.** Mismatch is an intentional editorial choice.
  Reconcile only when the user explicitly asks.

## 8. Layout & design rules

- Design principle: **"What I did" — spacing-first, delicate
  refinement.** Each detail page leads with a `project-contrib-row`
  block listing 3-5 concrete contributions before any prose.
- Colour palette is centralised in `:root` (`--green-bg`,
  `--green-accent`, etc.). Don't hardcode greens elsewhere.
- Typography sizes come from `--text-size-*` variables. Don't add new
  font-size literals — extend the variable set instead.
- The site doubles as a CV: the sidebar (homepage) and meta blocks
  (detail pages) are intentionally information-dense. Preserve that
  dual role.
- Masonry layout — when adding/removing cards, no further config is
  needed; `script.js` calls `imagesLoaded → Masonry` automatically.

## 9. Known fragile / risky parts

1. **Curly-quote i18n bug** — `bamboo.html:62, 65` and
   `commune.html:62, 65` use Unicode curly quotes (`”`) around the
   `data-i18n` attribute value. Those keys never resolve. Fix to ASCII
   double quotes (`"`) when editing those files. See
   `docs/WEBSITE_AUDIT.md`. The same bug exists in the backup repo —
   fix both copies in the same pass.
2. **Dead WebGL hero path** — `script.js` calls `initLiquidChrome()`
   which looks for `<canvas id="hero-canvas">`. The current
   `index.html` uses an mp4 hero video instead, so the function exits
   silently. The dead code path is not removed because the shader may
   come back. Don't be confused by it.
3. **Special-case order swap** — `script.js:115-125` swaps
   `Single-family-home.html` and `tearoom.html` in the DOM when the
   architecture filter is active. If you reorder cards on the
   homepage, verify both filtered and unfiltered orders still look
   right.
4. **`tri-stool.html` card uses `ruach/` icons** — the card titled
   "RUACH" on the homepage points at `tri-stool.html` but reads its
   icon from `ruach/RUACH_icon.jpg`. That's intentional — don't
   "fix" it. The commented-out tri-stool card below it is the
   genuine tri-stool entry, currently hidden.
5. **5 language dictionaries must stay in lockstep** — when adding a
   new `data-i18n` key, add it to all 5 language objects in `i18n.js`,
   even if the value is the same English fallback.
6. **`main page/` has a literal space** — encoded as `%20` in URLs.
   Don't rename.
7. **Large media assets** — `main page/hero.mp4` is ~180 MB, total
   repo media is ~680 MB. Be mindful when committing new assets.
   GitHub Pages serves them but cold loads are slow.

## 10. SEO / accessibility notes

- Each page sets `<title>`, `meta name="description"`, and
  Open Graph tags. Keep those updated when titles change.
- `<html lang="en">` is hardcoded; the language switcher only swaps
  text, it does not update `document.documentElement.lang`. Minor a11y
  gap.
- Project images have `alt` attributes — preserve and write meaningful
  alts for any new images.
- Filter pills use `<a href="#" onclick="…return false;">` — fine for
  this static portfolio; do not refactor unless asked.

## 11. Sync rule (very important)

This repo (`eerrrrr.portfolio.github.io`) is the **PRIMARY / source of
truth**.
The **BACKUP** mirror is `E:\my-portfolio-website\eerrrrr.github.io`.

**Mandatory bidirectional sync** — any data / content / code
correction must be applied to **both** repos:

- When the user fixes something in the **primary** (this repo), apply
  the **same** correction in the **backup**
  (`eerrrrr.github.io`) — same file, same lines, same text.
- When the user fixes something in the **backup**, apply the **same**
  correction in the **primary** (this repo).
- This applies to: HTML text, `i18n.js` translations, `style.css`,
  `script.js`, image swaps, new project additions — anything that
  affects what visitors see or how the site behaves.
- Documentation files (`CLAUDE.md`, `README_OTHER_AI.md`,
  `docs/WEBSITE_AUDIT.md`) should also be kept in sync between repos,
  with their primary/backup framing adjusted per side.

Procedure after every edit:

1. Make the edit in whichever repo you are currently in.
2. Make the **identical** edit in the other repo (same file path,
   same change).
3. Verify both copies match (diff if unsure).
4. Commit & push each repo independently.

Note: only the backup repo's push updates the public site at
`https://eerrrrr.github.io/`. The primary's push is for source-of-
truth bookkeeping. Pushing only the primary will leave the live site
stale; pushing only the backup will leave the source of truth out of
date.

If the user asks for "a portfolio fix", default to applying in both
repos. If the user explicitly says "only here" or "only the backup"
or "only the primary", respect that — but flag the divergence so it
can be reconciled later.

## 12. Things Claude should check before editing

- Which repo am I in? (primary vs. backup — see section 11)
- After this edit, will I remember to mirror the same change to the
  other repo? (see section 11 — this is mandatory, not optional)
- Does this element have a `data-i18n` key? If yes, update `i18n.js`
  for all 5 languages, then bump `?v=` on the script tag.
- Am I introducing a new font-size, colour, or spacing literal? If
  yes, add it as a CSS variable in `:root` first.
- For new content blocks, am I keeping the `project-contrib-row`
  ("What I did") at the top of detail pages?
- For new project cards, did I add `data-category`, `data-type`,
  `data-tags` so filters work?

## 13. Things Claude must NOT do without asking

- Add a build step, bundler, or framework (Vite, React, Tailwind, …).
- Move or rename `main page/`, `style.css`, `script.js`, `i18n.js`.
- Refactor `i18n.js` into multiple files or a different format.
- Delete the "dead" WebGL hero code path in `script.js`.
- Force-push, rewrite history, or amend already-pushed commits.
- Commit large new media files without confirming.
- Strip out the inline `onclick` filter handlers — they are
  intentional for this no-framework site.
- Change `<html lang="en">` to a non-English value.

## 14. JSON-first homepage rendering (live as of 2026-05-18)

The homepage now renders project cards from `data/projects.json` by
default. The hardcoded `<a class="project-card">` blocks in
`index.html` are still present and act as a fallback / escape hatch.

URL query parameters:

| URL | Behavior |
|---|---|
| `/` (default) | Cards from `data/projects.json`. Silent. |
| `/?json=1` | Same as default, plus a green debug badge top-right. |
| `/?static=1` | Force the original hardcoded cards in `index.html`. |

Fallback: if the JSON fetch fails, parsing fails, the projects array
is empty, the card count doesn't match `project_count`, or any card
builds without an `href`, the hardcoded cards remain visible. The
swap is atomic — cards are built in memory and validated first, then
replaced in one step.

**Rules for Claude in current and future sessions:**

- Editing `data/projects.json` **now changes what visitors see** in
  default mode. Treat it as live data, not reference-only.
- When changing a card on the homepage:
  - For cosmetic changes (`displayedTagsRaw`, title, subtitle
    fallback), `data/projects.json` is enough.
  - For filter behavior (`dataTags`), update **both** the JSON and
    the matching `data-tags` attribute in `index.html` (the
    hardcoded fallback) per the tag policy.
- For new projects, append to `data/projects.json` AND keep adding
  the corresponding hardcoded `<a class="project-card">` to
  `index.html` until the hardcoded fallback is retired (planned for a
  later phase). The hardcoded block is what `?static=1` shows and is
  also what visitors see if the JSON ever breaks.
- The card subtitle uses `data-i18n="card.<id>.sub"` — make sure
  `i18n.js` has that key for every project, in every language.
- Do not delete the hardcoded `<a class="project-card">` blocks from
  `index.html` without explicit instruction. They are load-bearing
  safety.
- Do not introduce a build step, bundler, framework, or runtime
  package manager. The site is still a hand-deployed static site.
- See [docs/JSON_FIRST_MIGRATION_PLAN.md](docs/JSON_FIRST_MIGRATION_PLAN.md)
  for the full architecture, fallback policy, and future variants.

### Validating `data/projects.json` before editing

Run the validator any time you change `data/projects.json`,
`i18n.js`, `index.html`'s hardcoded cards, or rename a project page or
folder:

```powershell
python tools/validate_projects_json.py
```

It exits `0` (PASS / WARN only) or `1` (one or more FAILs). FAILs
include: invalid JSON, missing required fields, duplicate ids, broken
page or coverImage paths, invalid category, non-lowercase dataTags,
missing `card.<id>.sub` in `i18n.js`, or `index.html` being stripped
of all hardcoded fallback cards. WARNs are intentional cases
(`role: null`, `isFeatured: null`, tag-display divergence per the
locked tag policy).

The validator is read-only — it does not modify any file. Run it in
both repos before committing.

## 15. Related external docs (READ THESE before i18n work)

A parallel documentation folder exists at
`E:\my-portfolio-website\portfolio support document\`. It predates
this `CLAUDE.md` and is the **authoritative source for i18n
conventions**. Do not duplicate or replace its content. Read from it
first when doing i18n work, then come back here for the rest.

| File | What it covers |
|---|---|
| `PORTFOLIO_I18N_SYSTEM.md` | i18n key naming rules, language list, what-to-translate vs. what-not, HTML patterns, meta-value enum, EN fallback behaviour |
| `PORTFOLIO_I18N_STATE.md` | Current i18n completion snapshot per page: key counts, caption counts, last sync date |
| `PORTFOLIO_I18N_CHANGELOG.md` | Dated history of i18n work (2026-04-15 build, 2026-04-16 web-quality fixes) |
| `NEW_PROJECT_CHECKLIST.md` | Step-by-step procedure for adding a new project page (HTML attributes → i18n.js → cache bump → sync) |
| `PORTFOLIO_I18N_TASK_TEMPLATE.md` | Reusable task brief format |
| `verify_i18n.py` | Verification script (parses `i18n.js`, checks key set parity across 5 languages) |
| `启动_PORTFOLIO_ prompt.txt` | Kick-off prompt the user pastes to start a portfolio session |

**Relationship to this `CLAUDE.md`**: this file is the project
briefing (tech stack, layout, fragile parts, sync rule). The support
document folder is the deep i18n reference. The two are complementary,
not duplicates.

**If you find a conflict** between this file and the support document
folder: the support document is authoritative for i18n key naming,
translation policy, and cache-version procedure. Update this file to
match, not the other way around.

---

**For deeper context:** see [README_OTHER_AI.md](README_OTHER_AI.md)
(quick orientation for any AI assistant),
[docs/WEBSITE_AUDIT.md](docs/WEBSITE_AUDIT.md) (current issues and
improvement ideas), and
[docs/JSON_FIRST_MIGRATION_PLAN.md](docs/JSON_FIRST_MIGRATION_PLAN.md)
(the JSON-first migration approach and what comes next).
