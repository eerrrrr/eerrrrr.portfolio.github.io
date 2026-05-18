# README_OTHER_AI — Erin Wong Portfolio

> Quick orientation for any AI assistant working in this repo. If you
> are Claude Code, read `CLAUDE.md` first — it is the full briefing.

## 1. What this project is

A **static** personal portfolio for Erin Wong, an architectural
designer. Pure HTML / CSS / vanilla JS.

There is no framework, no build step, no package manager, no tests.
Edits go directly into HTML / CSS / JS files and are deployed by
pushing to `main`.

**This repo is the PRIMARY / source-of-truth working copy.** A backup
mirror lives at `E:\my-portfolio-website\eerrrrr.github.io`. The
backup is the repo wired to GitHub Pages at
`https://eerrrrr.github.io/`. Any content change here must be
mirrored to the backup repo (which is what actually deploys the
public site).

**Mandatory bidirectional sync rule** — corrections must be applied
to **both** repos:

- Fix made in **primary** (this repo) → apply the **same** fix in
  **backup**.
- Fix made in **backup** → apply the **same** fix in **primary**
  (this repo).
- This covers HTML text, `i18n.js` translations, CSS, JS, images, and
  documentation. Anything you change in one must also change in the
  other.

## 2. How the website is organised

- `index.html` — homepage: hero video, about block, masonry grid of
  project cards, sticky CV sidebar.
- `<project>.html` — one detail page per project (bamboo, commune,
  cultural-center, …). All detail pages share the same layout,
  stylesheet, and JS.
- `<project>/` — image folder with the same name as the page.
- `style.css`, `script.js`, `i18n.js` — single shared CSS, JS, and
  5-language dictionary at the repo root.
- `main page/` — homepage hero assets (`hero.mp4`, `poster.jpg`).
  Note the space in the folder name.
- `docs/` — documentation (this is where audits and notes live).
- `data/` — reference data layer (`projects.json`, `site-structure.json`).
  Not consumed by the live website by default. See section 2a.

## 2a. Tag policy

The homepage uses two parallel tag systems:

- `data-tags` attribute = **filter tags**, lowercase, used by
  `script.js`'s tag filter. Mirrored to `dataTags` in
  `data/projects.json`.
- `<div class="tags">` text = **display tags**, decorative wording
  shown to visitors. Mirrored to `displayedTagsRaw` in
  `data/projects.json`.

They don't have to match. A card may display `#Helsinki` (location)
without putting `helsinki` in `data-tags`. A card may have
`landscape` in `data-tags` without displaying it. But `data-tags`
should cover every concept a future filter might match on.

When you change either side, update the matching field in
`data/projects.json` in the same commit. Don't "fix" intentional
divergence unless the user explicitly asks.

## 3. Which files are safe to edit

- ✅ Text content inside any `<project>.html` — paragraphs, headings,
  captions, alt text.
- ✅ `i18n.js` — add new keys or update translations. Update all 5
  languages, then bump the `?v=` query in the `<script>` tag.
- ✅ Project cards in `index.html` under `#masonry-container`.
- ✅ CSS variables in `:root` of `style.css` (colours, font sizes,
  spacing). Adjusting these cascades through the whole site
  predictably.
- ✅ Image assets — add to a project folder, reference from the
  matching HTML file.

## 4. Which files are risky to edit

- ⚠️ `script.js` — small but does several jobs (Masonry init, three
  filter functions, sticky-nav scroll, dead WebGL hero code). Test
  the homepage filters after any change.
- ⚠️ Layout sections of `style.css` — the gallery and sidebar use
  precise `position: fixed` / `sticky` + flexbox combos that are
  sensitive at the 1400 px and 768 px breakpoints.
- ⚠️ Adding a new `data-i18n` key without adding it to all 5
  languages will show the key string verbatim to users.
- ⚠️ Renaming any folder under root — image references everywhere
  will break silently.
- ⚠️ `main page/hero.mp4` — large file (~180 MB). Don't recommit
  unless replacing.

## 4a. Adding a new project

Use the step-by-step in
[docs/ADDING_A_PROJECT.md](docs/ADDING_A_PROJECT.md). It covers the
full sequence: identifiers (`id` / `slug` / `page`), asset folder,
detail HTML, i18n keys in all 5 languages with cache-version bump,
`data/projects.json` entry, the hardcoded `<a class="project-card">`
fallback in `index.html`, validator run, the
`/` + `/?static=1` + `/?json=1` test pass, and the primary → live
mirror.

## 5. How to make a small content change

Example: fix a typo in the bamboo project page.

1. Identify whether the text has a `data-i18n` attribute.
   - **If yes:** edit `i18n.js` for `en` (and ideally `zh`, `fi`,
     `de`, `ja` too). Bump `?v=` in the script tag on every HTML page.
   - **If no:** edit the text directly in `bamboo.html`.
2. Save.
3. Open `bamboo.html` in a browser to verify.
4. Mirror the change to the backup repo at
   `E:\my-portfolio-website\eerrrrr.github.io`.
5. `git add` the changed files, commit, push — in both repos.

## 6. How to make a style or layout change

1. Look at `:root` in `style.css` first — can the change be made by
   adjusting a variable? If yes, do that.
2. Otherwise add CSS for the specific class. Keep selectors
   class-based (no element selectors that would cascade unexpectedly).
3. Test both homepage (`index.html`) and one detail page (e.g.
   `bamboo.html`) — they share the same stylesheet.
4. Test at 1920 px, 1280 px, and 375 px widths (the layout has
   breakpoints at 1400 px and 768 px).

## 7. How to test changes

There is no test suite. Do a manual visual check:

1. Serve locally:
   ```powershell
   cd "E:\my-portfolio-website\eerrrrr.portfolio.github.io"
   python -m http.server 8000
   ```
2. Open `http://localhost:8000/` and click through:
   - Homepage hero plays the video
   - About block visible
   - All project cards visible and click through to detail page
   - Filter pills (Architecture, Furniture, 3D Printing, VR, AIGC)
     each filter the grid
   - Language switcher (EN / 中 / FI / DE / JP) swaps text
   - Detail pages: previous/next links work
3. Browser devtools console — should have no errors.
4. Network tab — large media should load (slowly is OK; broken
   404s are not).

## 8. Checklist before submitting changes

- [ ] **Same change applied to BOTH repos** (mandatory):
      - primary → `E:\my-portfolio-website\eerrrrr.portfolio.github.io`
      - backup → `E:\my-portfolio-website\eerrrrr.github.io`
      Sync direction is bidirectional — a fix in either repo must be
      copied to the other before the task is considered done.
- [ ] If `data-i18n` keys changed: all 5 languages updated, `?v=`
      bumped.
- [ ] No new hardcoded colours or font sizes — use `:root` variables.
- [ ] No new build-step / npm / framework additions.
- [ ] Manual test: homepage filters work, detail page links work,
      language switcher works, no console errors.
- [ ] Image `alt` attributes set for any new images.
- [ ] Git status reviewed — no unintended files staged, no large
      binaries you didn't mean to add.
- [ ] Commit message describes the user-visible change clearly.

## 9. Things to refuse or ask before doing

- Adding a framework or build system → ask first.
- Converting the portfolio shell to React / Vue / Astro / Eleventy →
  refuse by default and point the user to
  [docs/INTERACTIVE_CONTENT_ARCHITECTURE.md](docs/INTERACTIVE_CONTENT_ARCHITECTURE.md).
  Interactive demos go in isolated `interactives/<demo-id>/`
  folders, not a whole-site rewrite.
- Renaming or moving `main page/`, `style.css`, `script.js`,
  `i18n.js` → ask first.
- Deleting hardcoded `<a class="project-card">` blocks from
  `index.html` → refuse; they are the runtime fallback when
  `data/projects.json` fails.
- Force-push / history rewrite → ask first.
- Committing a new media file >10 MB → ask first.
- Editing only this primary repo without touching the backup →
  confirm the user explicitly wants primary-only.

---

For full project briefing, layout rules, and known fragile parts, see
[CLAUDE.md](CLAUDE.md). For the current issues list and improvement
ideas, see [docs/WEBSITE_AUDIT.md](docs/WEBSITE_AUDIT.md). For how
to add future interactive demos (React / WebGL / Three.js / Unity
WebGL) without rewriting the whole site, see
[docs/INTERACTIVE_CONTENT_ARCHITECTURE.md](docs/INTERACTIVE_CONTENT_ARCHITECTURE.md).
For the operational step-by-step of adding or substantially
modifying a project, see
[docs/ADDING_A_PROJECT.md](docs/ADDING_A_PROJECT.md). For the audit
of large media files, unused assets, and suggested compression
order, see
[docs/PERFORMANCE_OPTIMIZATION_PLAN.md](docs/PERFORMANCE_OPTIMIZATION_PLAN.md).
