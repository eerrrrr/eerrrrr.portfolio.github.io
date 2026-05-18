# Portfolio Maintenance Log

_Maintained from 2026-05-18 onward. Human-readable companion to git
log. Read this if you're about to make a change and want to know
why the site is the way it is._

This is **not** a changelog. It's a maintenance narrative:
- What's in stable state right now
- The phases that got us here, with intent and impact
- Rules about what not to touch
- Backlog of decisions you may want to make later

For commit-level history, run `git log --oneline` in either repo.
For commit-message detail, run `git show <hash>`.

---

## 1. Current stable state (as of 2026-05-18)

The portfolio is a **static, JSON-driven, GitHub-Pages-deployed
website with a runtime fallback safety net**. Specifically:

- **Static shell** — HTML + CSS + vanilla JS, no framework, no
  build step, no package manager.
- **JSON-driven homepage** — cards on `index.html` are rendered at
  runtime from `data/projects.json`. See
  [JSON_FIRST_MIGRATION_PLAN.md](JSON_FIRST_MIGRATION_PLAN.md).
- **Hardcoded fallback** — `index.html` still contains a complete
  set of `<a class="project-card">` blocks. If the JSON fetch fails
  for any reason (404, parse error, validation failure), the
  hardcoded cards remain visible. This is load-bearing safety.
- **URL modes**:
  - `/` — JSON-rendered cards, silent.
  - `/?static=1` — forces the hardcoded fallback cards. Debug /
    comparison tool.
  - `/?json=1` — same as default plus a green debug badge.
- **Schema-validated JSON** — `tools/validate_projects_json.py`
  enforces the contract described in
  [PROJECTS_JSON_SCHEMA.md](PROJECTS_JSON_SCHEMA.md).
- **Two-tag system** — `data-tags` (lowercase filter tokens,
  consumed by `script.js`) and `displayedTagsRaw` (free-form
  visible display string). They are intentionally allowed to
  diverge. See `CLAUDE.md § 7` and
  [JSON_FIRST_MIGRATION_PLAN.md § 4e](JSON_FIRST_MIGRATION_PLAN.md).
- **Lazy-loaded gallery images** on all 13 detail pages.
  `loading="lazy"` on every below-the-fold `<img>`; hero images
  stay eager.
- **CDN preconnect** on every HTML file that loads from `unpkg.com`.
- **Documentation suite** for AI handoff:
  [CLAUDE.md](../CLAUDE.md) for Claude Code,
  [README_OTHER_AI.md](../README_OTHER_AI.md) for other AI
  assistants, plus the docs index in § 6 below.
- **Two-repo sync** — primary (source of truth) and live (GitHub
  Pages user-pages mirror) hold byte-identical content for every
  runtime-relevant file. Differences are confined to per-repo
  framing inside `CLAUDE.md` and `README_OTHER_AI.md`.

---

## 2. Maintenance timeline

Each phase below was its own commit (or pair of commits, one per
repo). Primary commit hashes given. Live commits exist with their
own hashes — match them via the commit message.

Hashes shown are the state of the repos at the time this log was
created; if you rebase later, look up by message instead.

### Phase 1 — AI handoff documentation
**Primary:** `7677ea0` · **Visitor impact:** none

Initial creation of `CLAUDE.md`, `README_OTHER_AI.md`, and
`docs/WEBSITE_AUDIT.md`. Established the bidirectional sync rule
between the two repos, documented the tech stack, and flagged
known fragile parts.

- **Why it mattered:** Future AI sessions can now read context
  without scanning every file. Saved many tokens per follow-up
  session.
- **Files:** `CLAUDE.md`, `README_OTHER_AI.md`,
  `docs/WEBSITE_AUDIT.md` (all new).
- **Runtime change:** none.
- **Safe to revert?** Don't — these are the canonical AI briefings.

### Phase 2 — i18n curly-quote bug fix
**Primary:** `d89a63d` · **Visitor impact:** yes (positive)

`bamboo.html` and `commune.html` had `<p data-i18n="…">` attributes
wrapped in Unicode curly quotes (U+201D) instead of ASCII `"`. The
i18n engine never matched those keys, so four paragraphs stayed in
their English fallback in all five languages.

- **Why it mattered:** Real bug, broke multilingual support
  silently.
- **Files:** `bamboo.html`, `commune.html` (lines 62, 65).
- **Runtime change:** yes — those four paragraphs now translate.
- **Safe to revert?** No — never re-introduce the curly quotes.

### Phase 3 — JSON-first reference layer
**Primary:** `2bfd51e` · **Visitor impact:** none initially

Created `data/projects.json` (13 projects with full field set) and
`data/site-structure.json`. At this point the JSON was a
reference-only data extraction, not consumed by any runtime path.

- **Why it mattered:** First step of the "JSON-first migration"
  plan. Foundation for everything from Phase 7 onward.
- **Files:** `data/projects.json`, `data/site-structure.json`,
  `docs/JSON_FIRST_MIGRATION_PLAN.md` (all new).
- **Runtime change:** none.
- **Safe to revert?** No — the data layer is now load-bearing.

### Phase 4 — data-tags reconciliation
**Primary:** `b4440e3` · **Visitor impact:** none visible

Updated `data-tags` attributes on six homepage cards so future
tag-based filters would actually match the projects users expect.
Examples: `nyamata` got `["hospital", "design"]` (was `["landscape"]`),
`commune` got `["wood", "clt", "extension"]` (was `["wood"]`).

- **Why it mattered:** Better filter coverage without changing
  visible card text.
- **Files:** `index.html`, `data/projects.json`.
- **Runtime change:** filter mechanics still work the same; the
  set of projects each filter pill matches is slightly different.
- **Safe to revert?** Possible, but you'd lose filter coverage.

### Phase 5 — Tag policy documented
**Primary:** `0d769b6` · **Visitor impact:** none

Locked in the two-tag philosophy: `data-tags` (lowercase filter
tokens) and `displayedTagsRaw` (free display string) can intentionally
diverge.

- **Why it mattered:** Prevents future Claude sessions from
  "fixing" intentional divergence.
- **Files:** `CLAUDE.md`, `README_OTHER_AI.md`,
  `docs/JSON_FIRST_MIGRATION_PLAN.md`.
- **Runtime change:** none.
- **Safe to revert?** No — this is the editorial rule.

### Phase 6 — JSON notes cleanup
**Primary:** `b77994e` · **Visitor impact:** none

Rewrote all 13 `notes` fields and the `field_legend` in
`data/projects.json` in a clean, outward-facing tone. Removed commit
hashes, dated dev-log entries, and internal-doc references.

- **Why it mattered:** `data/projects.json` is publicly fetchable
  at `/data/projects.json`. Notes should read like a published data
  file, not a debug log.
- **Files:** `data/projects.json`.
- **Runtime change:** none.
- **Safe to revert?** Possible but reintroduces internal-looking
  content.

### Phase 7 — Opt-in JSON preview (`?json=1`)
**Primary:** `502642e` · **Visitor impact:** none in default mode

Added a JSON-rendering code path in `script.js` guarded by
`?json=1`. Default homepage behaviour unchanged. If preview fetch
failed, the hardcoded cards remained visible (atomic swap).

- **Why it mattered:** Allowed real browser testing of JSON
  rendering before committing to a default change.
- **Files:** `script.js`.
- **Runtime change:** new opt-in code path only.
- **Safe to revert?** Phase 8 supersedes this; the code lives on
  but is now the default path.

### Phase 8 — JSON cards as default homepage behaviour
**Primary:** `011a67f` · **Visitor impact:** yes (transparent)

Flipped the trigger in `script.js`: the default now renders from
JSON; `?static=1` becomes the escape hatch back to the hardcoded
cards; `?json=1` becomes a debug-badge mode. Added pre-swap
validation (card count, every card has an `href`).

- **Why it mattered:** Editing `data/projects.json` now changes
  what visitors see. Hardcoded cards remain as fallback.
- **Files:** `script.js`, `data/projects.json` (source field
  updated), `CLAUDE.md § 14`, `docs/JSON_FIRST_MIGRATION_PLAN.md`.
- **Runtime change:** yes — visitors get JSON-rendered cards by
  default. No visible difference (the JSON mirrors the hardcoded
  cards 1:1).
- **Safe to revert?** Yes — `git revert <hash>` puts JSON back to
  opt-in. Or visit `?static=1` to compare.

### Phase 9 — JSON validator (`tools/validate_projects_json.py`)
**Primary:** `7536c6c` · **Visitor impact:** none

Added a read-only Python script that validates `data/projects.json`
against required fields, unique ids, page/coverImage existence,
category whitelist, lowercase dataTags, and `card.<id>.sub` key
presence in `i18n.js`.

- **Why it mattered:** First safety net against breaking the
  homepage by mis-editing JSON.
- **Files:** `tools/validate_projects_json.py` (new),
  `CLAUDE.md § 14`, `docs/JSON_FIRST_MIGRATION_PLAN.md`.
- **Runtime change:** none. Validator is local-only.
- **Safe to revert?** No — this is part of the safety system.

### Phase 10 — Interactive-content architecture
**Primary:** `59c7232` · **Visitor impact:** none

Created `docs/INTERACTIVE_CONTENT_ARCHITECTURE.md` documenting how
future React / WebGL / Three.js / Unity WebGL demos should be added
as isolated `interactives/<demo-id>/` islands rather than a
whole-site rewrite. Added two rules to `CLAUDE.md § 13` ("must NOT
do without asking"): refuse whole-site framework conversions, and
refuse deletion of hardcoded fallback cards.

- **Why it mattered:** Prevents future Claude sessions from
  proposing a React rewrite when only a single interactive demo is
  needed.
- **Files:** `docs/INTERACTIVE_CONTENT_ARCHITECTURE.md` (new),
  `CLAUDE.md`, `README_OTHER_AI.md`,
  `docs/JSON_FIRST_MIGRATION_PLAN.md § 4d`.
- **Runtime change:** none.
- **Safe to revert?** No — this is a load-bearing design decision.

### Phase 11 — Add-new-project workflow
**Primary:** `f8bcb8d` · **Visitor impact:** none

Created `docs/ADDING_A_PROJECT.md` — the operational checklist for
adding or substantially modifying one project. Covers identifiers,
asset folder, detail HTML, i18n keys across 5 languages with
cache-version bump, JSON entry, hardcoded fallback card, validator
run, three-URL test, and the primary → live mirror order.

- **Why it mattered:** Future "add a project" tasks no longer need
  to re-derive the workflow from scratch.
- **Files:** `docs/ADDING_A_PROJECT.md` (new), `CLAUDE.md`,
  `README_OTHER_AI.md`.
- **Runtime change:** none.
- **Safe to revert?** No — operational reference.

### Phase 12 — Performance audit
**Primary:** `6278cc9` · **Visitor impact:** none (audit only)

Created `docs/PERFORMANCE_OPTIMIZATION_PLAN.md` after measuring the
repo. Headline findings: ~682 MB total media; `ruach/Media2.mp4`
(92 MB, unused) and `spirulina/final.png` (24.6 MB) are the biggest
single files; 46 files (~164 MB) are unreferenced from any HTML;
the homepage card icon `study-group/Study-group-Works_icon.jpg`
was 10 MB. Suggested an 8-step compression / lazy-loading order.

- **Why it mattered:** Replaces speculation with measurements.
- **Files:** `docs/PERFORMANCE_OPTIMIZATION_PLAN.md` (new).
- **Runtime change:** none. Audit only.
- **Safe to revert?** No — reference for future optimisation work.

### Phase 13 — Stale hero video size doc correction
**Primary:** `6c5b3da` · **Visitor impact:** none

Three documents (`CLAUDE.md § 9`, `README_OTHER_AI.md § 4`,
`docs/WEBSITE_AUDIT.md § 3.1`) all claimed `main page/hero.mp4` was
~180 MB. Direct measurement during Phase 12 showed it's actually
~828 KB. Corrected all three.

- **Why it mattered:** Prevents future "the hero video is huge,
  let's compress it" tasks from chasing a non-issue.
- **Files:** `CLAUDE.md`, `README_OTHER_AI.md`,
  `docs/WEBSITE_AUDIT.md`.
- **Runtime change:** none.
- **Safe to revert?** No — would re-introduce a known-false claim.

### Phase 14 — Lazy loading + unpkg preconnect
**Primary:** `555a943` · **Visitor impact:** yes (positive,
invisible)

Added `loading="lazy"` to 147 non-hero `<img>` tags across the 13
detail pages. Added `<link rel="preconnect" href="https://unpkg.com"
crossorigin>` to the `<head>` of every HTML file that loads from
unpkg.

- **Why it mattered:** Detail pages with many images defer below-
  fold loads; every page warms the unpkg TLS connection in parallel
  with local CSS fetch. No visual change.
- **Files:** `index.html` + 13 detail HTML files.
- **Runtime change:** yes — faster page loads. Hero images stay
  eager so above-the-fold paint isn't affected. Homepage card
  icons intentionally left eager (planned for a future image
  optimisation pass).
- **Safe to revert?** Yes, but loses performance with no benefit.

### Phase 15 — Study-group icon compression (later reverted)
**Primary:** `6485b2d` · **Visitor impact:** would have been yes;
reverted before push.

`study-group/Study-group-Works_icon.jpg` re-encoded from 10 MB /
7158×7158 to 293 KB / 3000×3000 using ffmpeg at JPEG quality 4.
Then reverted in Phase 17 because the user decided to pause all
homepage image compression until final cover images are picked.

- **Why it was made:** Single biggest visitor-affecting file at
  the time (every homepage visit downloads this icon).
- **Why it was reverted:** User strategy: compress only when
  homepage covers are final, to avoid double-compression churn.
- **Files (at the time):** `study-group/Study-group-Works_icon.jpg`.
- **Runtime change:** would have been yes; reverted so net is none.
- **Safe to revert?** Was reverted. The original 10 MB file is
  currently in both repos.

### Phase 16 — Visual / content audit
**Primary:** `2a88723` · **Visitor impact:** none

Created `docs/PORTFOLIO_VISUAL_CONTENT_AUDIT.md` — a read-only
review of the homepage card set. Card-by-card factual rundown,
cover-image inventory sorted by size, tag-style consistency
comparison, title-style consistency comparison, and an explicit
note about the (now-reverted) Phase 15 commit.

- **Why it mattered:** Captures editorial decisions to be made
  ("Single-family home" lowercase 'h', "#3Dprinting" vs
  "#3DPrinting", `#Wood Frame` space, etc.).
- **Files:** `docs/PORTFOLIO_VISUAL_CONTENT_AUDIT.md` (new),
  `CLAUDE.md`, `README_OTHER_AI.md`.
- **Runtime change:** none.
- **Safe to revert?** No — reference for editorial polish.

### Phase 17 — Study-group icon compression REVERTED
**Primary:** `d4b9980` · **Visitor impact:** none (Phase 15 had
not been pushed)

Used `git revert` (not `reset --hard`) to undo Phase 15. Phase 16
audit is preserved. The 10 MB original icon is back in both repos.

- **Why it mattered:** Honest history. The compression decision
  belongs in a later all-icons pass.
- **Files:** `study-group/Study-group-Works_icon.jpg` (restored).
- **Runtime change:** restored prior state.
- **Safe to revert?** Don't — would re-apply a paused decision.

### Phase 18 — Editorial polish: `#3DPrinting` and `Single-family Home`
**Primary:** `8f0e5bd` · **Visitor impact:** yes (tiny)

Two homepage-card text fixes:

1. Bamboo display tag: `#3Dprinting` → `#3DPrinting`, matching
   vault's `#3DPrinting` capitalisation. `dataTags` stays
   lowercase (`"3dprinting"`).
2. Single-family-home card title: `Single-family home` →
   `Single-family Home`, applying title case.

- **Why it mattered:** Visible polish, brings card text into
  alignment with neighbours.
- **Files:** `index.html`, `data/projects.json`.
- **Runtime change:** visible card text only.
- **Safe to revert?** Yes; cosmetic.
- **Still pending:** `Single-family-home.html`'s `<title>` tag
  uses a third form ("Single-Family Home" — cap F). Future small
  polish commit.

### Phase 19 — `projects.json` schema documentation and stricter validator
**Primary:** `3fa8619` · **Visitor impact:** none

Three coordinated changes:

1. New doc: [PROJECTS_JSON_SCHEMA.md](PROJECTS_JSON_SCHEMA.md) —
   field-by-field reference for every key in `data/projects.json`.
2. Validator strengthened: `id` URL-safe lowercase, `page` ends
   with `.html`, `coverImage` extension whitelist, every
   `images[]` path exists, `dataTags` cannot contain `#`,
   `displayedTagsRaw` WARN if missing `#`, `notes` WARN if it
   contains commit-hash / dev-marker / dated text.
3. `data/projects.json` pruned: the new `images[]`-must-exist
   check surfaced 10 files (~35 MB) that existed in primary's
   working copy but were never committed to the live repo. Pruned
   the entries so the JSON describes live's deployed state. **No
   image file was added, removed, or modified on disk** — primary
   keeps them as archive; the JSON simply no longer lists them.

- **Why it mattered:** Editing `data/projects.json` is now
  noticeably safer. Drift between primary and live for those 10
  files is documented and contained.
- **Files:** `docs/PROJECTS_JSON_SCHEMA.md` (new),
  `tools/validate_projects_json.py`, `data/projects.json`,
  `docs/JSON_FIRST_MIGRATION_PLAN.md`, `CLAUDE.md`,
  `README_OTHER_AI.md`.
- **Runtime change:** none.
- **Safe to revert?** Partial — reverting the JSON prune is fine
  if you decide to mirror the 10 files into live instead; reverting
  the validator/schema is not recommended.

### Bonus: live-only commit
**Live:** `30f1a8a` "Remove duplicate CDN note from live CLAUDE
docs" · **Visitor impact:** none

A small live-repo-only cleanup that removed a CLAUDE.md
duplication introduced by an earlier copy step. Primary's
CLAUDE.md never had the duplication, so this commit exists only in
live and is the one explained drift between repo commit counts.

### Phase 20 — Maintenance log (this file)
**Primary:** `c019649` · **Visitor impact:** none

Created `docs/MAINTENANCE_LOG.md` — the human-readable narrative
companion to git log that this section sits in. Captures current
stable state, phase-by-phase intent, safety rules, backlog, and
useful commands. CLAUDE.md and README_OTHER_AI.md footer reference
lists updated.

- **Why it mattered:** Future Claude sessions can read this and
  understand why decisions were made without scanning every commit.
- **Files:** `docs/MAINTENANCE_LOG.md` (new), `CLAUDE.md`,
  `README_OTHER_AI.md`.
- **Runtime change:** none.

### Phase 21A — Per-language i18n validator check
**Primary:** `a25edd7` · **Visitor impact:** none

Tightened `tools/validate_projects_json.py`: every
`card.<id>.sub` i18n key must appear exactly 5 times (once per
language object: en / zh / fi / de / ja). Previously the check only
required presence "somewhere in the file" — which meant a key
defined only in EN would silently fall back to English in the four
non-EN languages without the validator ever complaining.

- **Why it mattered:** Closes a real silent-regression path that
  i18n.js's single-file 5-language design makes easy to introduce.
- **Files:** `tools/validate_projects_json.py`.
- **Runtime change:** none.
- **Safe to revert?** No — preventive check.

### Phase 21B — Cache-buster bump tool
**Primary:** `cee2835` · **Visitor impact:** none

Added `tools/bump_cache_version.py`. After editing `i18n.js`, this
script bumps the `?v=N` query string across every HTML file at the
repo root by one, in a single dry-run-by-default operation.

Behaviour:
- Dry-run lists each file's old/new version.
- `--apply` rewrites the version in all HTML files.
- FAILs (exit 2) if HTML files have drifted to different versions.

Replaces a 14-file manual-edit step that was easy to forget.

- **Files:** `tools/bump_cache_version.py` (new).
- **Runtime change:** none. The script is for future i18n edits.
- **Safe to revert?** Yes; would just bring back the manual step.

### Phase 21C — Primary↔live sync tool
**Primary:** `7185294` · **Visitor impact:** none

Added `tools/sync_repos.py`. Compares the two portfolio repos and,
with `--apply`, mirrors runtime-relevant files from primary to live
(or live to primary with `--reverse`).

Behaviour:
- Dry-run lists files to ADD, OVERWRITE, and present ONLY IN
  TARGET.
- `--apply` performs ADD and OVERWRITE operations.
- `--allow-delete` (off by default) also removes orphans in the
  target.
- Intentionally excludes `CLAUDE.md`, `README_OTHER_AI.md` (they
  differ by design) and `.git/`.

First dry-run after this commit surfaced real drift: 10 files
in primary's working tree absent from live (the same 10 files
pruned from JSON in Phase 19 — kept as primary-only archive), plus
`commune/commune-Section.jpg` which exists in both repos at
different sizes (3.5 MB in primary, 1.6 MB in live). The live
version is what visitors actually see.

- **Files:** `tools/sync_repos.py` (new).
- **Runtime change:** none. The script is for future editorial work.
- **Safe to revert?** Yes; would re-impose the manual mirror step.

### Phase 21D — Document the new maintenance tools
**Primary:** TBD (in progress) · **Visitor impact:** none

Updated `MAINTENANCE_LOG.md` (this file), `CLAUDE.md`, and
`docs/ADDING_A_PROJECT.md` to document the three Phase 21 tools
and their usage. Without this step, future Claude sessions wouldn't
discover the helpers and would re-introduce the manual workflow.

- **Files:** `docs/MAINTENANCE_LOG.md` (this file),
  `CLAUDE.md`, `docs/ADDING_A_PROJECT.md`,
  `docs/JSON_FIRST_MIGRATION_PLAN.md`.
- **Runtime change:** none.

---

## 3. Current safety rules

Hard rules learned from this session. Future Claude or future you
should follow these unless the user explicitly overrides:

1. **Do not remove the hardcoded `<a class="project-card">` blocks
   in `index.html`.** They are the runtime fallback if
   `data/projects.json` ever fails to load or validate. The
   validator FAILs if `index.html` has zero hardcoded cards.
2. **Do not convert the portfolio shell to React / Vue / Svelte /
   Astro / Eleventy or any other framework.** Interactive content
   goes in `interactives/<demo-id>/` islands. See
   [INTERACTIVE_CONTENT_ARCHITECTURE.md](INTERACTIVE_CONTENT_ARCHITECTURE.md).
3. **Do not add a build system at the repo root.** No
   `package.json`, no `node_modules`, no Vite config. Bundlers are
   allowed only inside an `interactives/<id>/` folder.
4. **Do not compress homepage cover images yet.** The user is
   choosing final cover images. When finals are picked, compress
   all homepage card icons in one coordinated pass.
5. **Do not delete media files on a whim.** Several files were
   flagged as cleanup candidates in
   [PERFORMANCE_OPTIMIZATION_PLAN.md](PERFORMANCE_OPTIMIZATION_PLAN.md)
   § 5 but they are not to be removed without user review.
6. **Keep portfolio docs in English.** This repo's documentation
   uses English consistently. No Chinese writing rules apply here.
7. **Run `python tools/validate_projects_json.py` after every
   edit to `data/projects.json`, `index.html`'s hardcoded cards,
   or `i18n.js`'s `card.<id>.sub` keys.** Exit 0 required before
   commit.
8. **Keep primary and live repos synchronized for every
   runtime-relevant file** (HTML, CSS, JS, JSON, images, project
   pages, validator). `CLAUDE.md` and `README_OTHER_AI.md` may
   differ only in PRIMARY-vs-BACKUP framing.
9. **Never restore the curly-quote `data-i18n` form.** ASCII `"`
   only on `data-i18n` attributes.
10. **Don't reintroduce the "180 MB hero.mp4" claim.** The actual
    file is ~828 KB.

---

## 4. Known backlog

Items deliberately deferred. None of these are blockers; they're
opportunities for future small commits.

### 4.1 Editorial polish

- **`Single-family-home.html` `<title>` tag** still uses a third
  form (`Single-Family Home` with cap F) inconsistent with the
  homepage card title (`Single-family Home` with cap H). 1-line
  fix in 1 file.
- **`Studio Renovation - Corridor bridge`** title still has
  lowercase 'b' (the user kept this intentional in Phase 18). May
  be revisited later.
- **`#Wood Frame`** display tag still has a space (kept
  intentional in Phase 18).

### 4.2 Media optimisation (paused)

Order, when the user is ready:

1. Compress the 4 oversized homepage card icons:
   `study-group/Study-group-Works_icon.jpg` (10 MB),
   `studio-renovation/Studio-Renovation_icon.png` (2.5 MB),
   `spirulina/spirulina_icon.jpg` (1.4 MB),
   `Single-family-home/Single-family_icon.jpg` (903 KB).
2. Convert PNG renders in `bamboo/` to JPEG.
3. Compress `cultural-center/plan-*.jpg` (5 × 10-12 MB) with a
   two-tier delivery strategy (compressed default + optional
   full-res link).
4. Re-encode `spirulina/final.png` (24.6 MB PNG of a photographic
   image).
5. Review the 46 "unused candidate" files (~164 MB) listed in
   `PERFORMANCE_OPTIMIZATION_PLAN.md` § 5 and decide which to
   delete. Several were already flagged in the Phase 19 JSON
   prune; primary keeps them as archive but live ships without.

### 4.3 Interactive demos

The architecture is documented in
[INTERACTIVE_CONTENT_ARCHITECTURE.md](INTERACTIVE_CONTENT_ARCHITECTURE.md)
but no interactive folder exists yet. When a project earns one
(RUACH is the most natural candidate), follow that doc.

### 4.4 Hardcoded fallback removal (do **not** do yet)

Eventually, when the JSON-driven path has been live and stable
through several real editing cycles, the hardcoded
`<a class="project-card">` fallback blocks in `index.html` could
be removed. Don't do this until:

- JSON path has survived at least one new-project addition
  end-to-end without falling back.
- User explicitly approves removal.

Until then, leave the fallback in place.

### 4.5 Drift surfaced by `tools/sync_repos.py` (Phase 21C dry-run)

The first dry-run of the new sync script (after Phase 21C shipped)
revealed two distinct kinds of drift between primary and live:

1. **10 files exist only in primary** (~35 MB total): the same set
   pruned from `data/projects.json` in Phase 19 (bamboo
   auto-generated images, `joint 1.png` / `joint 2.png`,
   `commune/1-commune-Section.jpg`,
   `commune/balcony-section-single.jpg`, two `vault-house/` PDFs).
   These are primary-only archive. Not blocking; the policy
   tolerates this.
2. **One file differs in content**:
   `commune/commune-Section.jpg` is **3.5 MB in primary, 1.6 MB in
   live**. Both are referenced by the JSON; the live (1.6 MB)
   version is what visitors actually see. Decision pending: which
   is canonical? Either ship primary's heavier version, or accept
   live's compressed version as canonical and replace primary's
   copy.

Until decided, the sync script will keep reporting this drift.
Resolving it is one of:

```powershell
# Option A: make primary canonical (live gets the 3.5 MB version)
python tools/sync_repos.py --apply

# Option B: make live canonical (primary gets the 1.6 MB version)
python tools/sync_repos.py --reverse --apply

# Option C: leave the drift, document it
# (no action; sync script keeps reporting it)
```

---

## 5. Useful commands

### Run the validator

```powershell
cd "E:\my-portfolio-website\eerrrrr.portfolio.github.io"
python tools/validate_projects_json.py
# or, from the live repo:
cd "E:\my-portfolio-website\eerrrrr.github.io"
python tools/validate_projects_json.py
```

Exit `0` = safe to commit. Exit `1` = something is broken; read the
FAIL lines.

### Local browser test

```powershell
cd "E:\my-portfolio-website\eerrrrr.github.io"
python -m http.server 8000
```

Then open:

- `http://localhost:8000/` — default mode (JSON cards, no badge)
- `http://localhost:8000/?static=1` — hardcoded fallback
- `http://localhost:8000/?json=1` — JSON cards + green debug badge

Verify the homepage filters work, language switcher works, and
detail pages still render correctly.

### Push to live

```powershell
git -C "E:\my-portfolio-website\eerrrrr.portfolio.github.io" push origin main
git -C "E:\my-portfolio-website\eerrrrr.github.io" push origin main
```

Only the live repo (`eerrrrr.github.io`) push updates the public
site at `https://eerrrrr.github.io/`. The primary repo push is for
source-of-truth bookkeeping.

### Verify both repos in sync after a change

```powershell
$primary = "E:\my-portfolio-website\eerrrrr.portfolio.github.io"
$live    = "E:\my-portfolio-website\eerrrrr.github.io"
foreach ($f in @("index.html", "script.js", "i18n.js", "style.css", "data\projects.json", "tools\validate_projects_json.py")) {
    $d = Compare-Object (Get-Content (Join-Path $primary $f)) (Get-Content (Join-Path $live $f))
    if ($d) { Write-Output ("DIFFERS: " + $f) } else { Write-Output ("MATCH:   " + $f) }
}
```

Or, for a comprehensive cross-repo check including images and
docs, use the sync tool (dry-run by default):

```powershell
cd "E:\my-portfolio-website\eerrrrr.portfolio.github.io"
python tools/sync_repos.py
```

### After editing `i18n.js` — bump the cache-buster

```powershell
cd "E:\my-portfolio-website\eerrrrr.portfolio.github.io"
python tools/bump_cache_version.py            # dry-run
python tools/bump_cache_version.py --apply    # rewrite all HTML files
```

The `?v=N` query in every HTML file must increment when `i18n.js`
changes; otherwise returning visitors load the cached old
dictionary. This script does the 14-file bump in one command.

### Mirror primary → live (or live → primary)

```powershell
cd "E:\my-portfolio-website\eerrrrr.portfolio.github.io"
python tools/sync_repos.py                            # dry-run primary -> live
python tools/sync_repos.py --apply                    # actually mirror
python tools/sync_repos.py --reverse                  # dry-run live -> primary
python tools/sync_repos.py --reverse --apply          # mirror live -> primary
python tools/sync_repos.py --apply --allow-delete     # also remove orphans (use with care)
```

The script intentionally excludes `CLAUDE.md` and
`README_OTHER_AI.md` (those differ by design — PRIMARY vs BACKUP
framing) and `.git/`. Everything else is kept in lockstep.

---

## 6. Source documents

The documentation suite, in approximate read order for someone new:

| Doc | Purpose |
|---|---|
| [CLAUDE.md](../CLAUDE.md) | Project briefing for Claude Code. Read first. |
| [README_OTHER_AI.md](../README_OTHER_AI.md) | Quick orientation for any AI assistant. |
| [docs/MAINTENANCE_LOG.md](MAINTENANCE_LOG.md) | This file. The maintenance narrative. |
| [docs/WEBSITE_AUDIT.md](WEBSITE_AUDIT.md) | Original site audit with bug list and SEO / a11y observations. |
| [docs/JSON_FIRST_MIGRATION_PLAN.md](JSON_FIRST_MIGRATION_PLAN.md) | The JSON-first architecture rationale and runtime contract. |
| [docs/PROJECTS_JSON_SCHEMA.md](PROJECTS_JSON_SCHEMA.md) | Field-by-field schema for `data/projects.json`. Read before editing the data file. |
| [docs/ADDING_A_PROJECT.md](ADDING_A_PROJECT.md) | Operational step-by-step for adding or substantially modifying a project. |
| [docs/INTERACTIVE_CONTENT_ARCHITECTURE.md](INTERACTIVE_CONTENT_ARCHITECTURE.md) | How future React / WebGL / Three.js / Unity demos should be added (as isolated islands, not a whole-site rewrite). |
| [docs/PERFORMANCE_OPTIMIZATION_PLAN.md](PERFORMANCE_OPTIMIZATION_PLAN.md) | Audit of media file sizes and suggested compression order. |
| [docs/PORTFOLIO_VISUAL_CONTENT_AUDIT.md](PORTFOLIO_VISUAL_CONTENT_AUDIT.md) | Editorial review of card titles, tags, cover images. |

External authoritative reference (i18n key conventions):
`E:\my-portfolio-website\portfolio support document\PORTFOLIO_I18N_SYSTEM.md`
and the sibling files in that folder. See `CLAUDE.md § 15` for the
list.

---

## 7. How to update this log

When you finish a meaningful maintenance phase (one logical unit
of work, usually one commit per repo):

1. Add a new `### Phase N — <short title>` block to § 2.
2. Use the same template: primary commit hash, visitor impact,
   what changed, why it mattered, files involved, runtime-change
   yes/no, safe-to-revert yes/no.
3. If the phase changes a rule, update § 3.
4. If the phase resolves or adds a backlog item, update § 4.
5. Commit this log update in the same logical batch as the phase
   work (or in a small follow-up commit if the phase is already
   shipped).

Keep entries terse. The point is to make the *next* maintainer's
job easier, not to write a complete dev diary.
