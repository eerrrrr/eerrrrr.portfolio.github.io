#!/usr/bin/env python3
"""
tools/bump_cache_version.py

Bump the ``i18n.js?v=N`` cache-buster query across all HTML files in
the repo root by one. Run this AFTER editing ``i18n.js`` so visitors
load the new dictionary instead of the cached old version.

Without this step, the i18n change ships to the live site but
returning visitors see stale translations until their browser cache
expires.

Usage:
    python tools/bump_cache_version.py            # dry-run (default)
    python tools/bump_cache_version.py --apply    # actually rewrite

Behaviour:
- Scans every ``*.html`` file in the repo root.
- Finds the current ``i18n.js?v=N`` reference in each file.
- Verifies they all use the same N (WARN if any drift).
- Computes new version = max(observed) + 1.
- Lists each file's old/new version.
- With ``--apply``, writes the new version to every HTML file that
  references ``i18n.js?v=``.

Exit codes:
    0 — dry-run completed, OR --apply succeeded
    1 — no HTML files reference i18n.js?v= (nothing to do)
    2 — drift detected (HTML files use different versions); resolve
        before bumping

The script is read-only without ``--apply``.
"""

import re
import sys
from pathlib import Path

PATTERN = re.compile(r'i18n\.js\?v=(\d+)')


def main() -> int:
    apply = "--apply" in sys.argv[1:]
    repo_root = Path(__file__).resolve().parent.parent
    html_files = sorted(repo_root.glob("*.html"))
    if not html_files:
        print(f"No *.html files found at {repo_root}")
        return 1

    per_file = []
    for f in html_files:
        text = f.read_text(encoding="utf-8")
        m = PATTERN.search(text)
        if m:
            per_file.append((f, int(m.group(1)), text))

    if not per_file:
        print("No HTML files reference i18n.js?v=N — nothing to bump.")
        return 1

    versions = {v for _, v, _ in per_file}
    if len(versions) > 1:
        print(f"DRIFT detected: HTML files use multiple ?v= values: {sorted(versions)}")
        print("Per-file versions:")
        for f, v, _ in per_file:
            print(f"  v={v:<3}  {f.name}")
        print()
        print("Resolve drift before bumping (all files should be at the same version).")
        return 2

    current = next(iter(versions))
    new = current + 1
    print(f"Repo root: {repo_root}")
    print(f"Current version: ?v={current}  (all {len(per_file)} HTML files in sync)")
    print(f"New version:     ?v={new}")
    print()

    if not apply:
        print("DRY-RUN. The following files would be rewritten:")
        for f, _, _ in per_file:
            print(f"  {f.name}: i18n.js?v={current} -> i18n.js?v={new}")
        print()
        print("Re-run with --apply to write the changes.")
        return 0

    # Apply: rewrite each file in place
    rewritten = 0
    for f, _, text in per_file:
        new_text = PATTERN.sub(f"i18n.js?v={new}", text)
        if new_text == text:
            print(f"  SKIP   {f.name} (no change)")
            continue
        f.write_text(new_text, encoding="utf-8")
        print(f"  WROTE  {f.name}: ?v={current} -> ?v={new}")
        rewritten += 1

    print()
    print(f"Done. {rewritten} file(s) rewritten. Next steps: run validator, "
          "mirror to the other repo, commit, push.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
