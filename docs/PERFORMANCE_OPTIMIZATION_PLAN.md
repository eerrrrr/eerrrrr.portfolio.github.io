# Performance Optimization Plan

_Audit date: 2026-05-18_
_Scope: Erin Wong portfolio (both repos — measurements taken in the
live repo; both repos hold the same media)._
_Status: **AUDIT ONLY**. No files were modified by this pass._

This document inventories what is currently shipped, identifies what
can be optimized without changing visual design, and proposes an
order of work. **Run any of the suggested changes as their own
separate, scoped commits** — do not bundle compression with
structural changes.

---

## 1. Headline numbers

| Category | Count | Total |
|---|---:|---:|
| `.jpg` | 153 | ~324 MB |
| `.png` | 49 | ~167 MB |
| `.mp4` | 4 | ~190 MB |
| `.jpeg` (the one outlier) | 1 | ~0.4 MB |
| `.svg` | 1 | <1 KB |
| HTML | 15 | ~0.2 MB |
| JS (`script.js`, `i18n.js`) | 2 | ~0.3 MB |
| CSS | 1 | ~25 KB |
| **Total media** | **207 files** | **~682 MB** |

The repo is dominated by media. JS / CSS / HTML are a rounding error.

Per-folder media size (sorted largest first):

| Folder | Size | Files |
|---|---:|---:|
| `ruach/` | 176 MB | 8 |
| `cultural-center/` | 144 MB | 37 |
| `bamboo/` | 107 MB | 35 |
| `study-group/` | 61 MB | 8 |
| `tearoom/` | 51 MB | 20 |
| `spirulina/` | 27 MB | 7 |
| `stool/` | 22 MB | 16 |
| `nyamata/` | 18 MB | 6 |
| `main page/` | 16 MB | 3 |
| `commune/` | 15 MB | 21 |
| `studio-renovation/` | 15 MB | 7 |
| `Single-family-home/` | 10 MB | 18 |
| `vault-house/` | 10 MB | 12 |
| `furniture-park/` | 10 MB | 9 |
| `tri-stool/` | 0 MB | 0 |

---

## 2. What's already good

- Hero `<video>` has `preload="metadata"` — good.
- The actual `main page/hero.mp4` is only **828 KB**. (Three existing
  docs incorrectly claim it is "~180 MB" — see § 8.)
- Hero video has a `poster="main%20page/poster.jpg"` (59 KB) that
  shows before the video loads.
- `i18n.js` is unminified but text-heavy and gzip-friendly; GitHub
  Pages serves it compressed.
- CSS uses variables and stays a single ~25 KB file.
- JSON-first rendering means the homepage is now driven by a single
  ~33 KB data file rather than a long HTML block.
- `?v=` cache-busting query on `i18n.js` is already in place.

---

## 3. High-impact opportunities

### 3.1 [HIGH] `study-group/Study-group-Works_icon.jpg` is **10 MB**

This file is the homepage card icon for the Study-group Works
project. It is loaded by **every** homepage visit. Cards are
typically displayed at ~300 px wide — a 10 MB source is ~20× larger
than necessary.

| | Current | Target |
|---|---|---|
| Size | 10.0 MB | ~150-300 KB |
| Format | JPEG, very high quality | JPEG q82 or WebP |
| Dimensions | unknown (very large) | ~800 × 1000 max |

**Expected saving:** ~9.7 MB per visitor's first homepage load.

### 3.2 [HIGH] `spirulina/final.png` is **24.6 MB**

Biggest single image in the repo. Used on the spirulina detail
page. PNG is the wrong format for a photographic / rendered final
image.

| | Current | Target |
|---|---|---|
| Format | PNG | JPEG q85 or WebP |
| Size | 24.6 MB | ~1-3 MB |

**Expected saving:** ~21-23 MB per visitor of the spirulina page.

### 3.3 [HIGH] `studio-renovation/Studio-Renovation_icon.png` is **2.5 MB**

Another homepage card icon, served as PNG instead of JPEG.

**Expected saving:** ~2.3 MB per homepage visit.

### 3.4 [HIGH] PNG renders in `bamboo/`

Many 7-8 MB `render-*.png` files used in the bamboo detail page.
PNG is correct for diagrams with hard edges and text, but the
`render-*` files are photographic 3D renders that compress poorly as
PNG.

| File pattern | Count | Average size | Format |
|---|---:|---|---|
| `bamboo/render-*.png` | 10 | 7-8 MB | PNG → JPEG |

**Expected saving:** ~60-70 MB if all 10 are converted to JPEG q85
(~1-2 MB each).

### 3.5 [HIGH] Cultural-center plans (`plan-*.jpg`)

5 architectural plan exports at 10-12 MB each. High-resolution scans
are useful for design students, but every homepage→cultural-center
visitor downloads all of them. A two-tier delivery is the cleanest
fix:

- Serve a compressed (~2-3 MB) JPEG by default on the page.
- Keep the full-resolution version available as a "View / download
  high-res" link if the user wants it.

**Expected saving:** ~40-50 MB total on the cultural-center page.

---

## 4. Safe / cheap wins (no visible quality loss)

### 4.1 [MEDIUM] Add `loading="lazy"` to below-the-fold images

Zero `<img>` tags in any HTML file currently have a `loading`
attribute. Detail pages with many images would benefit most:

| Page | `<img>` count |
|---|---:|
| `bamboo.html` | 27 |
| `cultural-center.html` | 23 |
| `commune.html` | 13 |
| `tearoom.html` | many |

A one-attribute change per `<img>` would defer the network request
for images that aren't in the initial viewport, with no visible
change.

**Rule of thumb:** the first 1-2 images (hero, intro) stay eager;
everything else gets `loading="lazy"`.

### 4.2 [MEDIUM] Add `<link rel="preconnect" href="https://unpkg.com">`

Every HTML page loads four scripts from `unpkg.com` (AOS CSS, AOS
JS, imagesLoaded, Masonry). A single `<link rel="preconnect">` in
`<head>` saves the TCP / TLS handshake for those four requests. One
line per HTML file, no visual change.

### 4.3 [MEDIUM] Convert remaining homepage card icons

Several card icons are larger than necessary even without format
conversion. Targets:

| File | Current | Suggested target |
|---|---:|---:|
| `study-group/Study-group-Works_icon.jpg` | 10.0 MB | <300 KB |
| `studio-renovation/Studio-Renovation_icon.png` | 2.5 MB | <300 KB |
| `spirulina/spirulina_icon.jpg` | 1.4 MB | <300 KB |
| `Single-family-home/Single-family_icon.jpg` | 902 KB | <300 KB |

All other card icons are already ≤ 750 KB; leave them alone.

### 4.4 [LOW] Self-host CDN scripts

Replace `unpkg.com` references with copies served from the repo.
This removes a third-party DNS / TLS / cache hop and protects the
site if unpkg has an outage. Trade-off: harder to update library
versions later. Not urgent.

---

## 5. Unused-asset cleanup (carefully)

The repo contains **46 media files (~164 MB)** that are not
referenced by any HTML page. Some may be intentional archives the
user wants to keep; others are likely development scratch.

### 5.1 Heavy unused files (>1 MB)

| Size | File | Why probably unused |
|---:|---|---|
| 91.9 MB | `ruach/Media2.mp4` | Likely an early variant of `hero.mp4` (the one that is used). Verify before deleting. |
| 15.5 MB | `main page/0416 (1).mp4` | Date-named working file; not referenced by `index.html` (which uses `main page/hero.mp4`). |
| 11.4 MB | `cultural-center/structure-hand.jpg` | Probably superseded by the structural diagram variants that ARE used. |
| 8.6 MB | `cultural-center/logic-exploded.png` | Same pattern. |
| 6.5 MB | `study-group/20220625_035350.jpg` | Date-named, looks like a phone photo. |
| 4.5 MB | `stool/20250616_220901.jpg` | Date-named, same pattern. |
| 3.7 MB | `commune/commune-Section.jpg` | Filename suggests near-duplicate of `1-commune-Section.jpg` (which IS used). |
| ~12 MB | `cultural-center/render-1.jpg` … `render-8.jpg` (8 files) | Variants not currently used by the page. |
| 1.4 MB | `bamboo/Generated Image December 30, 2025 - 12_48AM.png` | Auto-generated working file. |
| ~3.5 MB | `bamboo/axo-joint-1.jpg` … `axo-joint-4.jpg` | Possibly variants of the in-use axo views. |

Smaller unused files (<1 MB each, ~5 MB total) are mostly
`Single-family-home/*` detail variants and a few `commune/*`
working files.

**Total candidate-for-removal: ~164 MB across 46 files.**

### 5.2 Safety rules before any deletion

1. **Verify each candidate with the user.** A file being absent from
   HTML right now doesn't mean it's not wanted — it might be a
   reference, archive, or future-card asset.
2. **Don't delete `ruach/Media2.mp4` blindly.** It's 92 MB — the
   single biggest deletion — and there's a non-zero chance it's
   referenced from somewhere this audit didn't check (e.g. an
   external link, a future interactive demo).
3. **Run the validator** (`python tools/validate_projects_json.py`)
   after any deletion. The `images` arrays in `data/projects.json`
   may need to be updated to drop deleted entries.
4. **Keep one commit per cleanup batch** with a clear
   "Remove unused N MB of assets in folder X" message.

---

## 6. Per-page recommendation matrix

| Detail page | `<img>` count | Folder size | Quick win |
|---|---:|---:|---|
| `bamboo.html` | 27 | 107 MB | Convert PNG renders to JPEG. Add `loading="lazy"`. |
| `cultural-center.html` | 23 | 144 MB | Compress 5 `plan-*.jpg`. Remove unused 8 `render-*` if confirmed unused. |
| `commune.html` | 13 | 15 MB | Mostly fine already. Add `loading="lazy"`. |
| `vault-house.html` | n/a | 10 MB | Two embedded PDFs in folder; check if they should be linked rather than served. |
| `tearoom.html` | many | 51 MB | Compress `site-photo.jpg` (10 MB) and `pav ana site montage 1.jpg` (8 MB). |
| `study-group/Study-group-Works.html` | n/a | 61 MB | **Fix the 10 MB homepage icon first** — this is the most visitor-affecting single fix. |
| `spirulina.html` | 5 | 27 MB | Convert `final.png` (24.6 MB) to JPEG / WebP. |
| `nyamata.html` | n/a | 18 MB | Mostly large hero `.png`s; convert to JPEG. |
| `Single-family-home.html` | n/a | 10 MB | Mostly fine. |
| `furniture-park.html` | n/a | 10 MB | Mostly fine. |
| `studio-renovation.html` | n/a | 15 MB | Fix the 2.5 MB PNG icon (loaded on every homepage). |
| `tri-stool.html` (RUACH) | n/a | 176 MB | Compress `ruach/hero.mp4` (90 MB) if quality allows; investigate whether `ruach/Media2.mp4` is needed. |
| `stool.html` | n/a | 22 MB | Mostly fine; remove unused 4.5 MB photo. |

---

## 7. Suggested order of work (Phase 9 candidate)

When you're ready to actually optimize, do these as **separate
commits** in roughly this order. Each is independently revertable.

1. **Add `loading="lazy"` to below-the-fold images.** Zero risk,
   pure HTML-attribute change. One commit per detail page or one
   sweeping commit — either works.
2. **Add `<link rel="preconnect" href="https://unpkg.com">` to all
   HTML files.** One commit. Zero visual change.
3. **Fix the 10 MB `Study-group-Works_icon.jpg`.** Single biggest
   homepage-affecting issue. One commit replacing one file.
4. **Fix the 2.5 MB `Studio-Renovation_icon.png`.** Same idea.
5. **Convert `spirulina/final.png` (24.6 MB) to JPEG/WebP.** One
   commit, one file.
6. **Bulk-convert `bamboo/render-*.png` PNG renders to JPEG.** ~10
   files; one commit per batch, or one sweeping commit if confident.
   Update HTML references to `.jpg` (or keep `.png` extension and
   accept slight semantic mismatch).
7. **Compress `cultural-center/plan-*.jpg`.** Decide on the
   two-tier approach (compressed default + high-res link) or just
   serve a smaller variant.
8. **Cleanup unused assets.** Go through § 5.1 with the user, verify
   each, delete in named batches. Run the validator after each
   batch.
9. **Optional: convert hero images to AVIF/WebP** with JPEG
   fallback using `<picture>`. Higher effort, smaller marginal
   gain.

Expected total saving if all steps are applied: **~250-300 MB**
(from ~680 MB down to ~380-430 MB). Most of that comes from § 5
(unused) and §§ 3.1, 3.2, 3.4, 3.5 (per-file compression of the
worst offenders).

---

## 8. Stale doc claims to fix (separate small commit)

While taking measurements I found three existing documents that
claim **`main page/hero.mp4` is ~180 MB**:

- `CLAUDE.md` § 9 risk #7 (both repos)
- `docs/WEBSITE_AUDIT.md` § 3.1 (both repos)
- `README_OTHER_AI.md` § 4 "risky to edit" (both repos)

**The actual file is 828 KB.** The 180 MB figure may have been true
at an earlier point in the project's history but isn't now. A small
docs-only commit can correct all three references in both repos.
Suggested commit message: `Correct stale hero.mp4 size in docs`.

(The 92 MB and 16 MB MP4s identified in § 5.1 are different files,
not the hero.)

---

## 9. What this audit deliberately does NOT do

- **Does not modify any image, video, HTML, CSS, JS, or data file.**
- **Does not recommend touching `index.html`'s hardcoded fallback
  cards** — they remain the runtime safety net for `data/projects.json`.
- **Does not recommend a build step.** Image compression can be done
  with manual tools (Squoosh, ImageMagick, ffmpeg) outside the repo
  and the resulting file committed. No Vite, no webpack, no npm.
- **Does not recommend converting the portfolio to React.** Per
  [INTERACTIVE_CONTENT_ARCHITECTURE.md](INTERACTIVE_CONTENT_ARCHITECTURE.md).
- **Does not recommend automatic deletion of unused files** without
  a manual user review.
- **Does not recommend any change that would visibly alter card
  layout, image cropping, or page composition.** Compression and
  format conversion are quality-preserving operations.

---

## 10. Methodology

All measurements taken from
`E:\my-portfolio-website\eerrrrr.github.io` on the audit date.
Both repos hold the same media; primary was not separately measured
because all `.jpg`/`.png`/`.mp4` files have been mirrored 1:1 in
every phase to date.

References to specific HTML files were extracted by regex matching
`(?:src|href|poster)="…"` attributes on `.html` files. Files in
project folders that did not match any reference were marked as
unused candidates in § 5.

Container-level overhead (gzip compression by GitHub Pages,
HTTP/2 multiplexing, browser cache) was assumed default. No actual
network capture was performed — sizes are on-disk sizes.
