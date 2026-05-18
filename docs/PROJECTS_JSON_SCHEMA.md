# `data/projects.json` Schema

_Schema document for the Erin Wong portfolio. Living reference for
anyone (human or AI) editing `data/projects.json`._

This file is **consumed by the live homepage by default** — see
[JSON_FIRST_MIGRATION_PLAN.md](JSON_FIRST_MIGRATION_PLAN.md). Editing
it changes what visitors see. Before any edit, read this schema and
run `python tools/validate_projects_json.py`.

---

## 1. Top-level structure

```json
{
  "$schema_version": "1.0",
  "generated_at": "YYYY-MM-DD",
  "source": "where this data was extracted from / how to interpret it",
  "field_legend": { "<field name>": "<short description>" },
  "categories": ["master", "bachelor", "internship"],
  "types": ["architecture", "furniture", "3dprinting", "vr", "other"],
  "language_codes": ["en", "zh", "fi", "de", "ja"],
  "project_count": 13,
  "projects": [ /* one object per active project, in homepage order */ ],
  "hidden_or_commented_out": [ /* free-form notes about cards hidden in HTML */ ]
}
```

| Top-level field | Required? | Purpose |
|---|---|---|
| `$schema_version` | yes | Tracks breaking changes to this schema. Bump only on incompatible structure changes. |
| `generated_at` | yes | ISO date the extraction was last refreshed. |
| `source` | yes | Plain-text description of how the data was assembled. Public-facing. |
| `field_legend` | yes | Inline reference for each per-project field. Public-facing. |
| `categories` | yes | Whitelist used by the validator. Must be lowercase. |
| `types` | yes | Type whitelist. Lowercase. The validator does **not** currently enforce `type` against this list (added FYI). |
| `language_codes` | yes | The five UI languages. Must match `i18n.js` sections. |
| `project_count` | yes | Integer matching `len(projects)`. Validator FAILs if they disagree. |
| `projects` | yes | Array of project objects, in the order they should appear on the homepage. |
| `hidden_or_commented_out` | optional | Free-form notes about cards present in `index.html` but commented out. Not a project array. |

## 2. Per-project field reference

Each `projects[i]` object uses the following fields. Required fields are checked by `tools/validate_projects_json.py`; the validator FAILs if any are missing.

### 2.1 `id`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | yes (i18n namespace for `card.<id>.sub` and other keys) |
| Public-facing | yes |
| Safe to edit manually | **no** — changing `id` invalidates every `card.<id>.sub` lookup, every `i18nKeys` reference, and any future generator that joins on `id` |
| Validation | lowercase, URL-safe (`[a-z0-9][a-z0-9_-]*`), unique across the array |
| Example | `"commune"`, `"sfh"`, `"ruach"` |

Note: `id` is **not always equal to** the page filename stem or the slug. Several existing projects diverge by design (e.g. `tri-stool.html` uses `id="ruach"`; `Single-family-home.html` uses `id="sfh"`).

### 2.2 `title`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | yes (homepage card `<h3>`) |
| Public-facing | yes |
| Safe to edit | yes — pure display string |
| Validation | not empty |
| Example | `"Commune"`, `"Single-family Home"` |

### 2.3 `slug`

| | |
|---|---|
| Type | string |
| Required | yes (one of the eight required fields) |
| Used by live | no — informational |
| Public-facing | yes |
| Safe to edit | with care — keep it URL-safe |
| Validation | none beyond non-empty |
| Example | `"commune"`, `"Single-family-home"`, `"tri-stool"` |

Slug **usually** matches the page filename stem (`page` minus `.html`). The validator WARNs when it diverges, but several existing projects diverge intentionally.

### 2.4 `page`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | yes (homepage card `href`) |
| Public-facing | yes |
| Safe to edit | **only if** the actual HTML file is renamed in the same commit |
| Validation | must end in `.html`; file must exist on disk |
| Example | `"commune.html"`, `"Single-family-home.html"` |

GitHub Pages is case-sensitive. Casing matters.

### 2.5 `category`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | yes (`data-category` attribute, used by `script.js` `filterProjects()`) |
| Public-facing | yes |
| Safe to edit | with care — must be in the top-level `categories` whitelist |
| Validation | must be one of `categories` (currently `master` / `bachelor` / `internship`) |
| Example | `"master"` |

### 2.6 `type`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | yes (`data-type` attribute, used by `script.js` `filterByType()`) |
| Public-facing | yes |
| Safe to edit | with care — must be one of `architecture` / `furniture` / `3dprinting` / `vr` / `other` |
| Validation | matched against top-level `types` (not currently FAIL-enforced; treat the list as authoritative) |
| Example | `"3dprinting"` |

### 2.7 `year`

| | |
|---|---|
| Type | integer |
| Required | yes |
| Used by live | yes (subtitle fallback when i18n key is missing) |
| Public-facing | yes |
| Safe to edit | yes |
| Validation | none beyond non-empty |
| Example | `2025` |

### 2.8 `location`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | yes (subtitle fallback) |
| Public-facing | yes |
| Safe to edit | yes |
| Validation | none beyond non-empty |
| Example | `"Helsinki"` |

### 2.9 `role`

| | |
|---|---|
| Type | string or `null` |
| Required | no (may be null) |
| Used by live | no (informational; no current renderer reads it) |
| Public-facing | yes |
| Safe to edit | yes |
| Validation | none (WARN aggregated when null on many projects) |
| Example | `null`, `"Internship"`, `"Design and Development"` |

### 2.10 `coverImage`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | yes (homepage card `<img src>`) |
| Public-facing | yes |
| Safe to edit | **only if** the actual file is added/renamed in the same commit |
| Validation | file must exist on disk; extension must be `.jpg`, `.jpeg`, `.png`, or `.webp` |
| Example | `"commune/commune_icon.jpg"` |

### 2.11 `images`

| | |
|---|---|
| Type | array of strings |
| Required | yes (one of the eight required fields; the array may be empty but the key must exist) |
| Used by live | no — informational |
| Public-facing | yes |
| Safe to edit | with care — every listed path must exist on disk |
| Validation | each path must exist; FAIL on any missing entry |
| Example | `["commune/hero.jpg", "commune/section-1.jpg"]` |

This is a folder snapshot for reference, not a curated render list.

### 2.12 `displayedTagsRaw`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | yes (mirrored to homepage card `<div class="tags">` text; JSON renderer copies it verbatim into the card) |
| Public-facing | yes |
| Safe to edit | yes — free-form display string, capitalisation up to you |
| Validation | WARN if it does not start with `#`; otherwise free-form |
| Example | `"#Helsinki #CLT #Extension"` |

Display tag style is intentionally separate from filter tag tokens (`dataTags`). See the tag policy in `CLAUDE.md § 7` and `JSON_FIRST_MIGRATION_PLAN.md § 4e`.

### 2.13 `dataTags`

| | |
|---|---|
| Type | array of strings |
| Required | yes |
| Used by live | yes (joined by space into the `data-tags` attribute; used by `script.js` `filterByTag()`) |
| Public-facing | yes |
| Safe to edit | with care — must keep filter coverage in sync with what the card displays |
| Validation | each token must match `^[a-z0-9][a-z0-9-]*$`; **`#` is not allowed** (it's a token, not a hashtag) |
| Example | `["wood", "clt", "extension"]` |

### 2.14 `shortDescription`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | no — informational (the detail-page sidebar reads from `i18n.js` `{prefix}.desc.p1`) |
| Public-facing | yes |
| Safe to edit | yes, but the live source of truth for visible text is `i18n.js`; keep them in rough sync |
| Validation | none beyond non-empty |
| Example | `"A timber extension to an existing residential building..."` |

### 2.15 `longDescription`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | no — informational; live text comes from `i18n.js` `{prefix}.desc.p2` |
| Public-facing | yes |
| Safe to edit | yes |
| Validation | none beyond non-empty |
| Example | `"The project asks how a new wooden volume can densify..."` |

### 2.16 `i18nPrefix`

| | |
|---|---|
| Type | string |
| Required | yes |
| Used by live | yes (the JSON renderer reads it indirectly — the card subtitle uses `data-i18n="card.<id>.sub"`, where `<id>` here happens to equal `i18nPrefix` for all current projects) |
| Public-facing | yes |
| Safe to edit | **no** — must match the namespace used by `i18n.js` for this project |
| Validation | none (consistency with `i18n.js` is the editor's responsibility) |
| Example | `"commune"`, `"sfh"`, `"ruach"` |

### 2.17 `i18nKeys`

| | |
|---|---|
| Type | array of strings |
| Required | yes |
| Used by live | no — informational (which `data-i18n` keys the detail page actually references) |
| Public-facing | yes |
| Safe to edit | yes when the detail page's `data-i18n` references change |
| Validation | none |
| Example | `["card.commune.sub", "commune.desc.p1", ...]` |

### 2.18 `isFeatured`

| | |
|---|---|
| Type | `null` (currently) — reserved for future boolean |
| Required | no |
| Used by live | no |
| Public-facing | yes |
| Safe to edit | yes, but until a renderer reads this field it has no effect |
| Validation | none (WARN aggregated when null on all projects) |
| Example | `null` |

### 2.19 `sourceFiles`

| | |
|---|---|
| Type | object `{ "html": "<page>", "folder": "<folder>/" }` |
| Required | yes |
| Used by live | no — informational |
| Public-facing | yes |
| Safe to edit | yes |
| Validation | none |
| Example | `{ "html": "commune.html", "folder": "commune/" }` |

### 2.20 `notes`

| | |
|---|---|
| Type | string |
| Required | yes (may be a short empty-ish phrase but the key must exist) |
| Used by live | no |
| Public-facing | **yes** — `data/projects.json` is fetchable at `/data/projects.json` |
| Safe to edit | yes, with style discipline |
| Validation | WARN if the string looks like an internal dev log (commit hashes, dated entries, dev markers like `TODO`/`FIXME`) |
| Example | `"Page filename uses 'cultural-center'; the i18n key namespace is 'cultural'."` |

**Notes style guide** (because this field is publicly served):

- Write factual, outward-facing observations about the project's
  data shape, file structure, or intentional quirks.
- Do **not** include commit hashes, branch names, or "fixed on YYYY-MM-DD" entries.
- Do **not** include `TODO` / `FIXME` / `XXX` / `HACK` markers.
- Do **not** include phrases like "see commit abc1234" or "fix in
  later commit".
- Internal maintenance history belongs in
  `docs/JSON_FIRST_MIGRATION_PLAN.md`, not in `notes`.

## 3. Optional fields reserved for the future

These are not currently in the schema. If you add them, remember:
**adding a field that no renderer reads is just noise.** Add a field
only when there's a renderer ready to use it.

| Candidate field | Purpose |
|---|---|
| `coverAlt` | Per-project alt text for the homepage card image (currently falls back to `title`). |
| `interactiveDemo` | Path to an `interactives/<id>/` URL if the project has an interactive island. |
| `status` | `"published"` / `"draft"` / `"archived"` if the user wants to hide cards without commenting them out. |
| `seoTitle` | Per-page `<title>` override. |
| `seoDescription` | Per-page `<meta name="description">` override. |

When adding any of these, update this schema doc and the validator
in the same commit.

## 4. Validation summary

`tools/validate_projects_json.py` enforces the schema. Exit codes:

- `0` — only PASS / WARN (safe to commit)
- `1` — one or more FAILs (do not commit)

Current FAIL conditions cover: JSON syntax, `project_count` mismatch,
missing required fields, duplicate `id`, broken `page` or
`coverImage` paths, invalid `category`, non-lowercase `dataTags`,
missing `card.<id>.sub` in `i18n.js`, `index.html` having no
hardcoded fallback cards, `id` non-URL-safe, `page` not ending in
`.html`, `coverImage` extension not in `{jpg, jpeg, png, webp}`,
`dataTags` containing `#`, and any `images[]` entry missing on disk.

Current WARN conditions cover: `displayedTagsRaw` not starting with
`#`, `notes` containing internal-dev language, `slug` differing
from page stem, aggregated counts for `role: null` /
`isFeatured: null` / tag divergence.

The validator deliberately separates "blocking errors" from
"editorial flags". Don't suppress WARNs blindly — read them.

## 5. Editing workflow

1. Read this schema doc.
2. Open `data/projects.json` and make the change.
3. Run `python tools/validate_projects_json.py` until exit 0.
4. Test all three homepage URLs (`/`, `/?static=1`, `/?json=1`) plus the affected detail page.
5. Mirror the change to both repos.
6. Commit each repo with a short imperative message describing the user-visible effect.
7. Push live.

For adding a brand-new project, follow
[ADDING_A_PROJECT.md](ADDING_A_PROJECT.md) — it includes all of the
above plus the i18n key additions and the hardcoded fallback card.

## 6. Version history

- **`1.0`** (2026-05-18) — Initial schema as documented here.

Bump `$schema_version` only when the structure changes
incompatibly (renaming or removing a field, changing a field's
type). Adding a new optional field does not require a bump.
