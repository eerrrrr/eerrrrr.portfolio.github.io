# WEBSITE_AUDIT.md — Erin Wong Portfolio

> Snapshot of the site's current state and concrete issues found during
> the initial review. Use this as a backlog and triage starting point.
> Nothing here has been fixed; it is a report only.

_Audit date: 2026-05-18_
_Repo: `eerrrrr.portfolio.github.io` (PRIMARY / source-of-truth copy)_

This audit also applies to the backup repo at
`E:\my-portfolio-website\eerrrrr.github.io` — the two repos were
verified byte-identical at audit time for `index.html`, `style.css`,
`script.js`, `i18n.js`, `bamboo.html`, and `commune.html`. Every
finding below was confirmed present in both repos. Fix in both repos
in the same pass per the sync rule (CLAUDE.md § 11).

---

## 1. Structure summary

- **Type**: Static site, no build step, no framework.
- **Pages**: 1 homepage + 14 project detail pages + 1 404 page = 16
  HTML pages.
- **Shared assets**: `style.css` (~25 KB), `script.js` (~11 KB),
  `i18n.js` (~280 KB) — all loaded by every page.
- **Languages**: 5 (`en`, `zh`, `fi`, `de`, `ja`) handled via
  `i18n.js` + `data-i18n` attributes.
- **CDN dependencies**: AOS, Masonry, imagesLoaded — all from
  `unpkg.com`, no SRI.
- **Repo size on disk**: ~680 MB, dominated by:
  - 153 `.jpg` (~324 MB)
  - 49 `.png` (~167 MB)
  - 4 `.mp4` (~190 MB, mostly the two large MP4s under `ruach/`)
- **Hosting**: The backup repo (`eerrrrr.github.io`) is the GitHub
  Pages-deployed copy at `https://eerrrrr.github.io/`. This primary
  repo is the source-of-truth working copy; pushes here do not
  themselves update the live site.

---

## 2. Concrete issues found (bugs)

### 2.1 [HIGH] Curly-quote i18n attribute bug

**Files**: `bamboo.html` lines 62, 65; `commune.html` lines 62, 65.
**Confirmed in both primary and backup repos.**

The `data-i18n` attribute is wrapped in Unicode curly quotes (`”`)
instead of ASCII double quotes (`"`):

```html
<p data-i18n=”bamboo.body.h1.1”>
```

Result: `document.querySelectorAll('[data-i18n]')` will not match
these elements, so the two paragraphs never translate. They display
the inline English fallback in every language.

**Fix**: replace the curly quotes with ASCII `"`. Eight characters
total across two files. Must be applied in **both** primary and
backup.

### 2.2 [LOW] Dead WebGL hero code path

`script.js:198-321` defines `initLiquidChrome()` which looks for
`<canvas id="hero-canvas">`. The current `index.html` uses an `<video
id="hero-video">` element instead — there is no canvas. The function
returns immediately and the WebGL shader never runs.

**Status**: not a user-visible bug. Either remove the dead code or add
the canvas back. Per `CLAUDE.md`, this is intentional pending future
revival of the shader hero. Identical in both repos.

### 2.3 [LOW] Detail-page card label mismatch

In `index.html:141-150`, the card titled "RUACH" links to
`tri-stool.html` and reads its icon from `ruach/RUACH_icon.jpg`.
There is a separate commented-out card for tri-stool just below it.
This is intentional (confirmed by the comment structure) but is easy
to misread as a bug. Consider renaming the file `tri-stool.html` →
`ruach.html` to remove the confusion, or add an HTML comment
explaining the indirection.

### 2.4 ~~[LOW] `<html lang>` does not update on language switch~~ — RESOLVED

**Retracted on 2026-05-18.** Initial audit incorrectly flagged this.
Verified at `i18n.js:1859`: `applyI18n()` includes
`document.documentElement.lang = langMap[_lang] || 'en';` with mapping
`{ en:'en', zh:'zh-Hant', fi:'fi', de:'de', ja:'ja' }`. The static
attribute `<html lang="en">` is the correct default and is
overwritten at runtime on every language switch.

This was already documented in
`E:\my-portfolio-website\portfolio support document\PORTFOLIO_I18N_STATE.md`
(2026-04-16 "Web Quality Fixes" note). Leaving this entry in place as
a retraction so future audits don't re-flag it.

---

## 3. Performance issues

### 3.1 [HIGH] Heavy unoptimised media

- `main page/hero.mp4` is actually ~828 KB (already small). The
  initial audit incorrectly listed it at ~180 MB; corrected on
  2026-05-18 after a direct measurement. The genuinely heavy MP4s
  are `ruach/hero.mp4` and `ruach/Media2.mp4` at ~90 MB each — see
  [PERFORMANCE_OPTIMIZATION_PLAN.md](PERFORMANCE_OPTIMIZATION_PLAN.md).
- Several project PNGs are likely 5-10 MB each. PNG is the wrong
  format for photography or rendered images — convert to JPEG (quality
  82-88) or WebP.
- 49 PNG files total ~167 MB. Even a halving would save ~80 MB.

### 3.2 [MEDIUM] Every page loads the full 280 KB `i18n.js`

The dictionary contains text for all 14 project detail pages plus the
homepage. A bamboo visitor downloads commune's, vault-house's, etc.
strings too. Acceptable for a static portfolio but a cheap win is to
gzip on GitHub Pages (already handled by GitHub) and ship as
minified JS (currently unminified).

### 3.3 [MEDIUM] No lazy-loading on gallery images

Detail pages have many full-bleed images stacked vertically. Adding
`loading="lazy"` to `<img>` tags below the fold would defer download
until they scroll into view.

### 3.4 [LOW] CDN libraries fetched on every page

AOS, Masonry, imagesLoaded are loaded from `unpkg.com` on every page
load with no `<link rel="preconnect">` or SRI hash. Adding
`rel="preconnect"` is a one-line speedup.

---

## 4. SEO issues

- ✅ Each page has a unique `<title>` and `meta description`.
- ✅ Open Graph tags present (title, description, image, type, url).
- ⚠️ `og:image` paths are relative (e.g. `bamboo/bamboo_icon.jpg`).
  Some scrapers and the Twitter card validator prefer absolute URLs.
  Switching to `https://eerrrrr.github.io/bamboo/bamboo_icon.jpg`
  would be safer.
- ⚠️ No `sitemap.xml` and no `robots.txt`. A 14-page static site
  benefits from both.
- ⚠️ No `<link rel="canonical">`. With both primary and backup repos
  living side by side, search engines may eventually see duplicate
  content if both ever go public. Set canonical to
  `https://eerrrrr.github.io/` (the backup, which is the deployed
  one).
- ⚠️ Project cards link with relative paths — fine — but mixed
  casing in filenames (`Single-family-home.html`,
  `Study-group-Works.html`) can cause case-sensitivity issues on
  Linux GitHub Pages hosts (it is case-sensitive). Audit all
  references against actual filenames.

---

## 5. Accessibility issues

- ✅ Most `<img>` tags have `alt` attributes.
- ✅ `<html lang>` is synced by `applyI18n()` (see retracted 2.4).
- ⚠️ Filter pills (`<a href="#" onclick="…">`) work with mouse but
  not all keyboard / assistive users may understand they are filters
  rather than navigation links. Adding `role="button"` and
  `aria-pressed` would help.
- ⚠️ The hero `<video>` auto-plays muted — fine — but has no
  `aria-hidden` / no caption explaining what the visual is for
  reduced-motion users. Consider `prefers-reduced-motion` to disable
  autoplay.
- ⚠️ Skill pills (`<span class="skill-pill">`) are not focusable;
  acceptable since they convey no action.
- ⚠️ Colour contrast on `--text-color-light: #767676` against
  `--white` is ~4.5:1, just at WCAG AA threshold for normal text. Use
  with care.
- ⚠️ Language switcher buttons have no `aria-label` — they are just
  "EN", "中", "FI", "DE", "JP". Adding `aria-label="Switch language
  to English"` etc. would help screen readers.

---

## 6. Maintainability issues

- **i18n duplication**: every translation key must be repeated 5
  times in `i18n.js`. A missing key in one language falls back
  silently to the key string, which is hard to notice. A simple
  validator script (compare key sets across 5 language objects) would
  catch drift.
- **Inline `onclick` handlers** throughout HTML. Acceptable for this
  no-framework site but means logic and markup are coupled — touching
  any handler requires hunting through HTML files.
- **Hardcoded "Previous Work" / "Next Work" links** at the bottom of
  every detail page point to specific files. Reordering or removing a
  project requires editing the previous/next links on every page that
  pointed to it.
- **Mixed languages in code comments** — `style.css` and `script.js`
  mix English, Traditional Chinese, and Simplified Chinese comments.
  Not a bug, but harder for collaborators / AI to skim. Pick one and
  stick with it.
- **Commit messages**: recent log in this repo shows `we`, `vb`,
  `1a`, `z` — placeholder messages. Future you (and any AI reviewing
  history) won't be able to find anything. Suggested: short
  imperative + scope, e.g. `bamboo: fix curly quotes in i18n
  attributes`.
- **No CHANGELOG / no release tags** — small project, but for the
  CV-doubling role of this site, tagging stable snapshots before big
  redesigns is cheap insurance.
- **Two-repo sync overhead** — every content edit currently requires
  manual duplication into the backup. A small `robocopy` or rsync
  script (excluding `.git/`) run after each edit would eliminate
  drift risk. Worth setting up if edit cadence is high.

---

## 7. Suggested future improvements

**Quick wins (1-2 hours each)**:
1. Fix curly-quote i18n bug in `bamboo.html` and `commune.html`
   (apply in both repos).
2. Add `loading="lazy"` to gallery images.
3. Add `sitemap.xml`, `robots.txt`, `<link rel="canonical">`.
4. Re-encode `hero.mp4` to <5 MB.
5. Add `rel="preconnect"` to `unpkg.com`.
6. ~~Sync `<html lang>` with the language switcher.~~ (Already done —
   see retracted 2.4.)
7. Write a small primary→backup sync script to eliminate the manual
   two-repo overhead.

**Medium (half a day each)**:
8. Convert PNG photography to JPEG/WebP — expect ~80 MB savings.
9. Add an `aria-pressed` / `aria-label` pass for keyboard / SR users.
10. Write a small Node or Python validator that diffs key sets across
    the 5 language objects in `i18n.js`.
11. Set up GitHub Actions to compress newly-added images on push.

**Larger (multi-day)**:
12. Split `i18n.js` into per-page files loaded on demand — useful only
    if dictionary grows beyond ~500 KB.
13. Migrate to a static-site generator (Eleventy, Astro) for shared
    layouts and prev/next link generation. Big rewrite — only do this
    if maintenance pain becomes real.
14. Add a tiny client-side search for project tags.

---

## 8. What is already done well

Worth keeping:

- Single shared stylesheet + CSS variables — very easy to retheme.
- Masonry gallery with three independent filter dimensions (category,
  type, tag) and proper Masonry relayout — solid UX.
- "What I did" `project-contrib-row` at the top of every detail page
  — clear, scannable, recruiter-friendly.
- Sticky CV sidebar on homepage — doubles the site as an online CV.
- 5-language coverage with a coherent key naming scheme.
- AOS animations applied sparingly (and stripped from cards after
  first animation, so filters don't re-trigger them).
- Clean URL rewriting via `history.replaceState` so
  `?f=arch` shows up as `/arch` in the address bar.

---

_End of audit. Next step: triage the [HIGH] items in section 2 and 3._
