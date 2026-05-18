#!/usr/bin/env python3
"""
tools/validate_projects_json.py

Validate `data/projects.json` before committing or pushing changes.

Run from anywhere; the script resolves its own repo root from __file__.

Checks (FAIL = blocking, WARN = informational / known-intentional):
  FAIL  JSON is parseable
  FAIL  project_count (if declared) matches len(projects)
  FAIL  each project has the required fields
  FAIL  project ids are unique
  FAIL  each project's `page` file exists on disk
  FAIL  each project's `coverImage` file exists on disk
  FAIL  each project's `category` is in the declared `categories` list
  FAIL  each `dataTag` is a non-empty lowercase string with no whitespace
  FAIL  `card.<id>.sub` exists as an i18n key in `i18n.js`
  FAIL  `index.html` exists and has at least one hardcoded
        `<a class="project-card">` entry (the runtime fallback safety net)

  WARN  per project where `slug` differs from the page filename stem
  WARN  per project where the displayed and data tag sets diverge (intentional)
  WARN  summary line for `role: null` and `isFeatured: null` (intentional)

Exit code:
  0  no FAILs (PASS / WARN only)
  1  one or more FAILs

Run:
    python tools/validate_projects_json.py
"""

import json
import re
import sys
from pathlib import Path


REQUIRED_FIELDS = (
    "id", "title", "page", "coverImage", "category",
    "dataTags", "displayedTagsRaw", "i18nPrefix",
)

# Tags style: lowercase, no whitespace, non-empty
_TAG_RE = re.compile(r"^[a-z0-9][a-z0-9\-]*$")


class Report:
    def __init__(self):
        self.passes = []
        self.warns = []
        self.fails = []

    def passing(self, msg):
        self.passes.append(msg)
        print(f"PASS  {msg}")

    def warn(self, msg):
        self.warns.append(msg)
        print(f"WARN  {msg}")

    def fail(self, msg):
        self.fails.append(msg)
        print(f"FAIL  {msg}")


def _parse_display_tokens(raw):
    """Best-effort tokenise the `<div class='tags'>` display string."""
    tokens = set()
    for piece in raw.split():
        cleaned = piece.lstrip("#").lower().strip()
        if cleaned:
            tokens.add(cleaned)
    return tokens


def validate(repo_root: Path, report: Report):
    json_path = repo_root / "data" / "projects.json"
    i18n_path = repo_root / "i18n.js"
    index_path = repo_root / "index.html"

    # --- JSON syntax ---
    if not json_path.exists():
        report.fail(f"data/projects.json not found at {json_path}")
        return
    try:
        data = json.loads(json_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        report.fail(f"data/projects.json is not valid JSON: {e}")
        return
    report.passing("data/projects.json parses as valid JSON")

    projects = data.get("projects", [])
    if not isinstance(projects, list) or not projects:
        report.fail("'projects' is missing, not a list, or empty")
        return

    # --- project_count matches length ---
    declared = data.get("project_count")
    if declared is None:
        report.warn("project_count is not declared at top level")
    elif declared == len(projects):
        report.passing(
            f"project_count ({declared}) matches projects.length ({len(projects)})"
        )
    else:
        report.fail(
            f"project_count ({declared}) != projects.length ({len(projects)})"
        )

    # --- categories whitelist ---
    valid_categories = set(data.get("categories", []) or [])
    if not valid_categories:
        report.warn("top-level 'categories' is missing or empty; skipping category check")

    # --- i18n.js load (for card.<id>.sub key check) ---
    i18n_content = None
    if i18n_path.exists():
        i18n_content = i18n_path.read_text(encoding="utf-8")
        report.passing(f"i18n.js loaded ({len(i18n_content):,} bytes)")
    else:
        report.fail("i18n.js not found — cannot verify card.<id>.sub keys")

    # --- index.html fallback exists ---
    if not index_path.exists():
        report.fail("index.html not found — runtime fallback cards are missing")
    else:
        html = index_path.read_text(encoding="utf-8")
        # Strip HTML comments so commented-out cards don't count
        html_uncommented = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)
        card_count = len(re.findall(
            r'<a[^>]+class="project-card"', html_uncommented
        ))
        if card_count == 0:
            report.fail(
                "index.html has no hardcoded <a class=\"project-card\"> entries "
                "(runtime fallback safety net is gone)"
            )
        else:
            report.passing(
                f"index.html has {card_count} hardcoded fallback card(s) "
                f"(JSON projects: {len(projects)})"
            )
            if card_count != len(projects):
                report.warn(
                    f"hardcoded card count ({card_count}) differs from JSON "
                    f"projects count ({len(projects)}); fallback may drift"
                )

    # --- per-project checks ---
    seen_ids = set()
    null_roles = []
    null_featured = []
    tag_divergence = []

    for idx, p in enumerate(projects):
        if not isinstance(p, dict):
            report.fail(f"project[{idx}] is not an object")
            continue
        pid = p.get("id") or f"<index:{idx}>"

        # Required fields
        for field in REQUIRED_FIELDS:
            if field not in p:
                report.fail(f"[{pid}] missing required field: {field}")
            else:
                val = p[field]
                if field == "dataTags":
                    if not isinstance(val, list):
                        report.fail(f"[{pid}] dataTags is not an array")
                elif val in (None, "", []):
                    report.fail(f"[{pid}] required field {field} is empty / null")

        # Unique id
        if "id" in p:
            if p["id"] in seen_ids:
                report.fail(f"duplicate id: {p['id']}")
            else:
                seen_ids.add(p["id"])

        # Page file exists
        page = p.get("page")
        if isinstance(page, str) and page:
            page_path = repo_root / page
            if not page_path.exists():
                report.fail(f"[{pid}] page file not found: {page}")

        # coverImage exists
        cover = p.get("coverImage")
        if isinstance(cover, str) and cover:
            cover_path = repo_root / cover
            if not cover_path.exists():
                report.fail(f"[{pid}] coverImage not found: {cover}")

        # category valid
        cat = p.get("category")
        if cat and valid_categories and cat not in valid_categories:
            report.fail(
                f"[{pid}] category '{cat}' not in declared categories "
                f"{sorted(valid_categories)}"
            )

        # dataTags tokens lowercase / non-empty / no whitespace
        data_tags = p.get("dataTags")
        if isinstance(data_tags, list):
            for tag in data_tags:
                if not isinstance(tag, str):
                    report.fail(f"[{pid}] dataTag is not a string: {tag!r}")
                elif not _TAG_RE.match(tag):
                    report.fail(
                        f"[{pid}] dataTag is not a lowercase token "
                        f"(alphanumeric + hyphens): {tag!r}"
                    )

        # card.<id>.sub key in i18n.js
        if i18n_content and isinstance(p.get("id"), str):
            sub_key = f"card.{p['id']}.sub"
            pattern = re.compile(
                r"['\"]" + re.escape(sub_key) + r"['\"]\s*:"
            )
            if not pattern.search(i18n_content):
                report.fail(f"[{pid}] i18n key missing in i18n.js: {sub_key}")

        # slug vs page filename
        slug = p.get("slug")
        if isinstance(page, str) and isinstance(slug, str):
            page_stem = page[:-5] if page.endswith(".html") else page
            if page_stem != slug:
                report.warn(
                    f"[{pid}] slug '{slug}' differs from page stem '{page_stem}'"
                )

        # displayedTagsRaw vs dataTags divergence (intentional per tag policy)
        displayed = p.get("displayedTagsRaw")
        if isinstance(displayed, str) and isinstance(data_tags, list):
            disp_set = _parse_display_tokens(displayed)
            data_set = {t.lower() for t in data_tags if isinstance(t, str)}
            if disp_set != data_set:
                tag_divergence.append(pid)

        # role / isFeatured (informational only)
        if p.get("role") is None:
            null_roles.append(pid)
        if p.get("isFeatured") is None:
            null_featured.append(pid)

    # --- aggregated WARN summaries (avoid 13× noise) ---
    if null_roles:
        report.warn(
            f"role is null on {len(null_roles)}/{len(projects)} projects "
            f"(intentional — no v.role.* declared): "
            f"{', '.join(null_roles)}"
        )
    if null_featured:
        report.warn(
            f"isFeatured is null on {len(null_featured)}/{len(projects)} projects "
            f"(reserved for future use)"
        )
    if tag_divergence:
        report.warn(
            f"displayedTagsRaw vs dataTags diverge on {len(tag_divergence)} "
            f"project(s) (intentional per tag policy): "
            f"{', '.join(tag_divergence)}"
        )


def main():
    # Best-effort UTF-8 stdout so em-dashes and other non-ASCII chars render
    # correctly on Windows consoles that default to legacy codepages.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, OSError):
        pass

    repo_root = Path(__file__).resolve().parent.parent
    print(f"Validating data/projects.json in {repo_root}")
    print()
    report = Report()
    validate(repo_root, report)
    print()
    print("=" * 60)
    print(
        f"Summary:  PASS {len(report.passes)}  "
        f"WARN {len(report.warns)}  "
        f"FAIL {len(report.fails)}"
    )
    print("=" * 60)
    if report.fails:
        print("Result: BLOCKED (one or more FAILs above)")
        return 1
    print("Result: OK (no FAILs)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
