# Portfolio Visual / Content Audit

_Audit date: 2026-05-18_
_Scope: Editorial and presentation review of the homepage cards and
the project set as it stands. **Documentation only.** No HTML, CSS,
JS, JSON, image, or video file was modified by this pass._

This document is a sit-and-think aid before the user finalises which
cover images to replace, which projects to reorder, and which detail
pages to polish. It lists facts (sizes, dimensions, current titles
and tags) plus light editorial observations the AI can make from the
file structure — but it does NOT make visual quality judgments,
because the AI cannot see the images.

---

## 1. Things this audit cannot evaluate

Be aware of these limitations before treating any suggestion as a
decision:

- **Visual quality of cover images.** Whether a JPEG looks
  sharp / muddy / well-composed / well-cropped at card size is a
  human call.
- **Strength of the project work itself.** Whether RUACH or Bamboo
  is a better recruiter opener depends on what the user wants to
  signal.
- **Case-study writing quality.** Whether each detail page reads
  well, whether captions land, whether the "What I did" bullets are
  the right four — needs human judgment.
- **Cropping fitness.** Whether a 3572×1684 ultra-wide icon
  (Single-family-home) reads well in the masonry grid vs. a 1442×1442
  square (bamboo) — only visible at runtime in a browser.

Where the audit is silent, that's by design.

---

## 2. Homepage project order

Current order on `index.html` (and mirrored in `data/projects.json`):

| # | id | Title | Cat. | Type | Year | Location |
|---|---|---|---|---|---|---|
| 1 | commune | Commune | master | architecture | 2023 | Helsinki |
| 2 | stool | Stool | master | furniture | 2025 | Helsinki |
| 3 | cultural | Cultural Center | bachelor | architecture | 2022 | Nanjing |
| 4 | bamboo | 3D-Printed Bamboo Components System | master | 3dprinting | 2025 | Helsinki |
| 5 | ruach | RUACH | master | vr | 2025 | Munich |
| 6 | vault | How to Print a House - Vault House | master | 3dprinting | 2024 | Heidelberg |
| 7 | tearoom | The Tea Room | bachelor | architecture | 2022 | Nanjing |
| 8 | sfh | Single-family home | master | architecture | 2025 | Helsinki |
| 9 | park | Furniture in Park | internship | furniture | 2024 | Hong Kong |
| 10 | studio | Studio Renovation - Corridor bridge | internship | architecture | 2021 | Yunnan |
| 11 | nyamata | Nyamata Hospital | master | architecture | 2024 | Rwanda |
| 12 | study | Study-group Works | bachelor | architecture | 2021 | Nanjing |
| 13 | spirulina | Spirulina Biolamp | master | other | 2025 | Helsinki |

### 2a. Observations on order

- **Variety in the first row is good.** Cards 1-4 cover four
  different `type` values (architecture, furniture, architecture,
  3D printing). A recruiter scanning the top of the page won't see
  four similar projects.
- **Master / bachelor / internship are interleaved, not grouped.**
  This is a curatorial choice, not a bug. If the goal is to lead
  with the most recent / most ambitious work, the order partially
  does that (Stool 2025 at #2, Bamboo 2025 at #4). If the goal is
  chronological recency, the order is not strictly by year.
- **Year distribution by position:**
  - First 5 cards: 2023, 2025, 2022, 2025, 2025 → recent-heavy with
    a 2022 anchor.
  - Last 5 cards: 2024, 2021, 2024, 2021, 2025 → mixed old and new.
- **Internships are clustered at #9-10.** Park (2024 Hong Kong)
  and Studio Renovation (2021 Yunnan). Defensible if internships are
  meant to be discoverable but not prominent.
- **Bachelor's projects are at #3, #7, #12.** Three of them, all
  from Nanjing. Spread out reasonably.
- **The 2021 Studio Renovation is the oldest project shown.**
  Earlier work could be moved to the end, hidden, or kept as proof
  of trajectory. Choice depends on what story the portfolio tells.

### 2b. Order decisions worth considering

These are forward-looking; nothing to action automatically.

1. **What's the single strongest card visually?** Whichever it is
   should be #1. Currently Commune leads.
2. **Should internship work appear above bachelor?** Internship
   (#9-10) currently appears after several bachelor entries (#3,
   #7). Defensible either way.
3. **Spirulina is at the end (#13).** As an "other" type with a
   bioart category, it's the only one of its kind. Last position
   gives it space, but it could also work as a surprise opener if
   the strategy is to lead with the unusual.
4. **RUACH (#5) is the only VR card.** Its cover is a 1461×984
   landscape image; everything around it is roughly square or
   portrait. Visually it may stand out in the masonry grid in a
   good or bad way — user to judge.

---

## 3. Card-by-card review

For each card, the facts plus any structural note worth flagging.

### 3.1 commune (#1)

| | |
|---|---|
| Title | `Commune` |
| Card subtitle | `Helsinki / Master 2023` |
| `displayedTagsRaw` | `#Helsinki #CLT #Extension` |
| `dataTags` | `wood, clt, extension` |
| Cover | `commune/commune_icon.jpg` |
| Cover size | 207 KB, 924 × 1155 (portrait) |

Notes: tags reasonably descriptive. `#Helsinki` is location-as-tag;
filtering not implemented on locations.

### 3.2 stool (#2)

| | |
|---|---|
| Title | `Stool` |
| Card subtitle | `Helsinki / Master 2025` |
| `displayedTagsRaw` | `#Furniture #Wood` |
| `dataTags` | `wood, furniture` |
| Cover | `stool/stool_icon.jpg` |
| Cover size | 42 KB, 725 × 725 |

Notes: cover is the **smallest** in the set at 42 KB / 725×725. May
appear softer than neighbouring cards at retina display. Worth a
visual check — if it looks noticeably softer than others, a
higher-res replacement would close the gap.

### 3.3 cultural (#3)

| | |
|---|---|
| Title | `Cultural Center` |
| Card subtitle | `Nanjing / Bachelor 2022` |
| `displayedTagsRaw` | `#Landscape #Wood Frame` |
| `dataTags` | `wood, landscape` |
| Cover | `cultural-center/cultural_icon.jpg` |
| Cover size | 711 KB, 2015 × 2687 (portrait) |

Notes: `#Wood Frame` is a single visible tag containing a space —
typographically distinct from the other `#OneWord` tags. Decide
whether this is intentional (it reads as one concept) or whether it
should be `#WoodFrame` for consistency. Cover file is larger than
the average card icon — candidate for the future compression pass.

### 3.4 bamboo (#4)

| | |
|---|---|
| Title | `3D-Printed Bamboo Components System` |
| Card subtitle | `Helsinki / Master 2025` |
| `displayedTagsRaw` | `#3Dprinting` |
| `dataTags` | `3dprinting` |
| Cover | `bamboo/bamboo_icon.jpg` |
| Cover size | 297 KB, 1442 × 1442 |

Notes: **longest title** in the set (33 characters). May wrap to two
or three lines on narrow card widths. Consider a shorter form like
`3D-Printed Bamboo System` or `Bamboo Joint System` if the long
title causes layout problems on mobile. Tag `#3Dprinting` has
non-standard capitalisation (lowercase 'p'); other 3D card uses
`#3DPrinting` (vault). See § 4 for the consistency check.

### 3.5 ruach (#5)

| | |
|---|---|
| Title | `RUACH` |
| Card subtitle | `Munich / Master 2025` |
| `displayedTagsRaw` | `#Unity #VR #Interaction` |
| `dataTags` | `unity, vr, interaction` |
| Cover | `ruach/RUACH_icon.jpg` |
| Cover size | 360 KB, 1461 × 984 (landscape) |

Notes: only landscape-orientation cover in the set. The page link is
`tri-stool.html` (legacy filename), and the asset folder is
`ruach/`, not `tri-stool/` (which is empty). This indirection is
documented in `data/projects.json.notes` and in
`docs/ADDING_A_PROJECT.md` § 4 step 1. Decide whether the
filename-mismatch is worth fixing in a later pass or staying as-is.

### 3.6 vault (#6)

| | |
|---|---|
| Title | `How to Print a House - Vault House` |
| Card subtitle | `Heidelberg / Master 2024` |
| `displayedTagsRaw` | `#3DPrinting ` (trailing space) |
| `dataTags` | `3dprinting, concrete` |
| Cover | `vault-house/vault_icon.jpg` |
| Cover size | 704 KB, 1707 × 1707 |

Notes: title is **double-barrelled** (`How to Print a House - Vault
House`). The narrative phrase comes first, then the project name.
Defensible as a hook, or could be tightened to `Vault House` with
"How to Print a House" as a subtitle. Trailing space in
`displayedTagsRaw` ("`#3DPrinting `") is preserved cosmetically;
invisible in render. Capitalisation `#3DPrinting` vs bamboo's
`#3Dprinting` — see § 4.

### 3.7 tearoom (#7)

| | |
|---|---|
| Title | `The Tea Room` |
| Card subtitle | `Nanjing / Bachelor 2022` |
| `displayedTagsRaw` | `#Concrete #Public` |
| `dataTags` | `concrete, public, landscape` |
| Cover | `tearoom/tearoom_icon.jpg` |
| Cover size | 201 KB, 720 × 1080 (portrait) |

Notes: clean title, clean tags. `landscape` exists in `dataTags` as
filter-only (not displayed) — intentional per the locked tag policy.

### 3.8 sfh (#8)

| | |
|---|---|
| Title | `Single-family home` |
| Card subtitle | `Helsinki / Master 2025` |
| `displayedTagsRaw` | `#Concrete #Helsinki` |
| `dataTags` | `concrete` |
| Cover | `Single-family-home/Single-family_icon.jpg` |
| Cover size | 903 KB, 3572 × 1684 (ultra-wide landscape) |

Notes: title is **lowercase 'h'** (`Single-family home`) — could
read as a typographical choice or a typo, depending on intent.
Compare with `The Tea Room` and `Cultural Center` which use title
case throughout. Cover is the **widest aspect ratio** in the set
(2.12:1) — may sit awkwardly in a masonry grid otherwise dominated
by square / portrait covers. Filename and folder use mixed casing
(`Single-family-home/Single-family_icon.jpg`) — case-sensitive on
GitHub Pages. Cover file size is on the higher side (903 KB) —
candidate for the future compression pass.

### 3.9 park (#9)

| | |
|---|---|
| Title | `Furniture in Park` |
| Card subtitle | `Hong Kong / Internship 2024` |
| `displayedTagsRaw` | `#Landscape #Wood` |
| `dataTags` | `wood, furniture, landscape` |
| Cover | `furniture-park/furniture_icon.jpg` |
| Cover size | 239 KB, 1080 × 1080 |

Notes: title preposition is `in` — small typographic choice (compare
`The Tea Room`, `Furniture in Park`, `Studio Renovation`). Clean
cover. `dataTags` contains `furniture` which isn't visibly
displayed — intentional, filter-only.

### 3.10 studio (#10)

| | |
|---|---|
| Title | `Studio Renovation - Corridor bridge` |
| Card subtitle | `Yunnan / Internship 2021` |
| `displayedTagsRaw` | `#Landscape #Steel` |
| `dataTags` | `steel, landscape` |
| Cover | `studio-renovation/Studio-Renovation_icon.png` |
| Cover size | **2.5 MB, 1080 × 1080 PNG** |

Notes: cover is the **only PNG in the homepage icon set** and the
**second-largest cover at 2.5 MB**. JPEG conversion at the same
1080×1080 would land at ~150-250 KB. Title combines project name
with a sub-phrase via hyphen ("- Corridor bridge") — same pattern
as vault. Use of lowercase 'b' in "bridge" vs. capital "C" in
"Corridor" is intentional (presumably).

### 3.11 nyamata (#11)

| | |
|---|---|
| Title | `Nyamata Hospital` |
| Card subtitle | `Rwanda / Master 2024` |
| `displayedTagsRaw` | `#Hospital #Design` |
| `dataTags` | `hospital, design` |
| Cover | `nyamata/nyamata_icon.jpg` |
| Cover size | 247 KB, 858 × 1073 (portrait) |

Notes: clean. `dataTags` directly mirrors visible tags (one of only
three cards where they match exactly — see § 4).

### 3.12 study (#12)

| | |
|---|---|
| Title | `Study-group Works` |
| Card subtitle | `Nanjing / Bachelor 2021` |
| `displayedTagsRaw` | `#Model` |
| `dataTags` | `model` |
| Cover | `study-group/Study-group-Works_icon.jpg` |
| Cover size | **293 KB, 3000 × 3000** — recently compressed in Phase 10 |

Notes: title uses hyphen (`Study-group`) — same pattern as the
file/folder. Could be `Study Group Works` if the hyphen wasn't
intentional. Page filename is `Study-group-Works.html` but folder
is `study-group/` (case mismatch) — already documented as a known
quirk. **Cover was 10 MB / 7158×7158 before Phase 10**; if homepage
images may change before final, see the note in § 7 about whether to
revert that change.

### 3.13 spirulina (#13)

| | |
|---|---|
| Title | `Spirulina Biolamp` |
| Card subtitle | `Helsinki / Master 2025` |
| `displayedTagsRaw` | `#BioArt #Spirulina` |
| `dataTags` | `bioart` |
| Cover | `spirulina/spirulina_icon.jpg` |
| Cover size | **1.4 MB, 4480 × 4480** |

Notes: cover is the **second-largest homepage icon at 1.4 MB** and
the **highest resolution in the set (4480 × 4480 = 20 megapixels)**.
Strong candidate for the future compression pass — at card display
size the resolution is 7-15× more than needed. `#Spirulina` is the
project name itself doubling as a tag.

---

## 4. Cover-image inventory (sortable)

Sorted largest → smallest. Stars mark the top compression candidates
once the user is ready to optimise.

| Cover | Size | Dimensions | Format | Star |
|---|---:|---|---|---|
| `studio-renovation/Studio-Renovation_icon.png` | 2.5 MB | 1080×1080 | PNG | ⭐ (only PNG in set) |
| `spirulina/spirulina_icon.jpg` | 1.4 MB | 4480×4480 | JPEG | ⭐ |
| `Single-family-home/Single-family_icon.jpg` | 903 KB | 3572×1684 | JPEG | ⭐ |
| `cultural-center/cultural_icon.jpg` | 711 KB | 2015×2687 | JPEG | ⭐ |
| `vault-house/vault_icon.jpg` | 704 KB | 1707×1707 | JPEG | |
| `ruach/RUACH_icon.jpg` | 360 KB | 1461×984 | JPEG | |
| `study-group/Study-group-Works_icon.jpg` | 293 KB | 3000×3000 | JPEG | (just compressed in Phase 10) |
| `bamboo/bamboo_icon.jpg` | 297 KB | 1442×1442 | JPEG | |
| `nyamata/nyamata_icon.jpg` | 247 KB | 858×1073 | JPEG | |
| `furniture-park/furniture_icon.jpg` | 239 KB | 1080×1080 | JPEG | |
| `commune/commune_icon.jpg` | 207 KB | 924×1155 | JPEG | |
| `tearoom/tearoom_icon.jpg` | 201 KB | 720×1080 | JPEG | |
| `stool/stool_icon.jpg` | 42 KB | 725×725 | JPEG | (smallest — check sharpness) |

Aspect-ratio mix in the masonry grid:

| Aspect | Cards |
|---|---|
| Square (1:1) | stool, bamboo, vault, park, studio, study, spirulina |
| Portrait (~3:4) | commune, cultural, tearoom, nyamata |
| Landscape (~3:2) | ruach |
| Ultra-wide (~2:1) | sfh |

7 squares + 4 portraits + 1 landscape + 1 ultra-wide. The ruach
landscape and sfh ultra-wide are outliers in the grid. The user may
want to crop them to closer to square / portrait for grid coherence
— that's a visual decision.

---

## 5. Tag style consistency

Currently the displayed tag strings vary in style:

| Card | Displayed tags | Style observation |
|---|---|---|
| commune | `#Helsinki #CLT #Extension` | location + acronym + concept |
| stool | `#Furniture #Wood` | type + material |
| cultural | `#Landscape #Wood Frame` | concept + multi-word tag |
| bamboo | `#3Dprinting` | type, lowercase 'p' |
| ruach | `#Unity #VR #Interaction` | tool + medium + concept |
| vault | `#3DPrinting ` (trailing space) | type, capital 'P' — inconsistent w/ bamboo |
| tearoom | `#Concrete #Public` | material + concept |
| sfh | `#Concrete #Helsinki` | material + location |
| park | `#Landscape #Wood` | concept + material |
| studio | `#Landscape #Steel` | concept + material |
| nyamata | `#Hospital #Design` | concept + concept |
| study | `#Model` | medium |
| spirulina | `#BioArt #Spirulina` | medium + project-name |

Suggested coherence decisions (none enforced — all editorial calls):

1. **Capitalisation of `#3Dprinting` vs `#3DPrinting`** — pick one.
   `#3DPrinting` (CamelCase) is the more common convention.
2. **Multi-word tags with spaces** (`#Wood Frame`) vs. squashed
   (`#WoodFrame`) — pick a convention.
3. **Location-as-tag** (`#Helsinki` on commune, sfh) — decide
   whether visible location tags are useful or noise. Three cards
   use them; ten don't.
4. **Trailing space in vault's `#3DPrinting `** — purely cosmetic;
   harmless. Worth tidying if anyone is doing a pass anyway.
5. **Project-name-as-tag** (`#Spirulina` on the spirulina card) —
   redundant with the title, but reads as a keyword for the
   recruiter's eye. Editorial call.

---

## 6. Title style consistency

| Card | Title | Style observation |
|---|---|---|
| commune | `Commune` | clean |
| stool | `Stool` | clean |
| cultural | `Cultural Center` | title case |
| bamboo | `3D-Printed Bamboo Components System` | long (33 chars) |
| ruach | `RUACH` | all caps (acronym) |
| vault | `How to Print a House - Vault House` | hyphen-double, sentence + project |
| tearoom | `The Tea Room` | title case |
| sfh | `Single-family home` | **lowercase 'h'** |
| park | `Furniture in Park` | sentence case |
| studio | `Studio Renovation - Corridor bridge` | hyphen-double, **lowercase 'b'** |
| nyamata | `Nyamata Hospital` | title case |
| study | `Study-group Works` | hyphen, mixed case |
| spirulina | `Spirulina Biolamp` | title case |

Style observations (none enforced):

1. `Single-family home` lowercase 'h' is unusual; compare
   `The Tea Room`, `Cultural Center`. Probably worth a deliberate
   decision: title case or lowercase consistent.
2. `Studio Renovation - Corridor bridge` lowercase 'b' on "bridge" —
   same pattern.
3. Three titles use a hyphen with a sub-phrase
   (`bamboo`, `vault`, `studio`). Pattern is fine but inconsistent
   with the rest. If kept, consider whether the sub-phrase is
   gaining anything.
4. `3D-Printed Bamboo Components System` is the longest title and
   may wrap awkwardly on narrow card layouts. Could shorten to
   `3D-Printed Bamboo System` without losing meaning.

---

## 7. Phase 10 note

`study-group/Study-group-Works_icon.jpg` was compressed in Phase 10
on 2026-05-18 from 10 MB / 7158×7158 → 293 KB / 3000×3000. **That
commit is in both repos locally but not pushed.**

If the user wants to keep all homepage-image compression for a
single later pass (per the new strategy), Phase 10 should be
reverted before pushing. Reverting is safe at this stage because the
commits are local-only.

To revert in each repo:

```powershell
git -C "E:\my-portfolio-website\eerrrrr.portfolio.github.io" reset --hard HEAD~1
git -C "E:\my-portfolio-website\eerrrrr.github.io" reset --hard HEAD~1
```

(Or `git revert HEAD --no-edit` for a non-destructive history.)

The original 10 MB / 7158×7158 file is recoverable from git history
either way.

---

## 8. Suggested polish backlog

When the user is ready to act (no automatic execution from this
audit), candidate tasks in roughly priority order:

### 8.1 Editorial decisions (no file changes)

1. Finalise the homepage card order. Currently it's #1 commune,
   ending #13 spirulina. Decide if that's the order you want to ship.
2. Pick a tag capitalisation convention
   (`#3DPrinting` vs `#3Dprinting`).
3. Decide on `Single-family home` capitalisation and
   `Studio Renovation - Corridor bridge` capitalisation.
4. Decide whether to shorten `3D-Printed Bamboo Components System`.
5. Decide whether `How to Print a House - Vault House` keeps the
   double-barrelled form.

### 8.2 Image replacement candidates (defer until finals)

When the user picks final homepage images, the compression-friendly
candidates (from § 4) are:

- `studio-renovation/Studio-Renovation_icon.png` — PNG → JPEG (~150-250 KB)
- `spirulina/spirulina_icon.jpg` — 1.4 MB → ~300-500 KB
- `Single-family-home/Single-family_icon.jpg` — 903 KB → ~300-500 KB
- `cultural-center/cultural_icon.jpg` — 711 KB → ~300-500 KB

### 8.3 Detail page content polish

Out of scope for this audit (would require reading every detail
page in depth), but candidates to look at next:

- bamboo.html — uses many auto-generated image filenames in
  `bamboo/` folder, some may look out of place if labelled
  visibly in captions.
- vault-house.html — folder contains two PDF presentation
  deliverables that may or may not be linked from the page.
- ruach.html (via `tri-stool.html`) — verify the page reads
  coherently given the filename indirection.

---

## 9. What this audit deliberately does NOT change

- No HTML modified.
- No CSS modified.
- No JavaScript modified.
- No JSON (`data/projects.json`, `data/site-structure.json`)
  modified.
- No image, video, or PDF file modified.
- No project detail page modified.
- No project order changed.
- No tag string normalised.
- No title rewritten.
- No file renamed.

This is decision-support material only.

---

## 10. Methodology

Cover image sizes and dimensions read from disk via `ffprobe` on
2026-05-18 against the primary repo
`E:\my-portfolio-website\eerrrrr.portfolio.github.io`. Both repos
hold the same homepage cover assets (verified byte-identical through
prior phases). Titles, tags, and subtitles read from
`data/projects.json` and cross-checked against `index.html`.

No third-party perception model or accessibility analyzer was run.
All editorial observations are surface-level and based on what the
file structure reveals — not on viewing the images in a browser.
