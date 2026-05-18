#!/usr/bin/env python3
"""
tools/sync_repos.py

Compare the two portfolio repos and (optionally) mirror runtime-
relevant files from primary to live, so they stop drifting.

Why this script exists
----------------------
The portfolio lives in two git repos:

  primary (source of truth):
    E:\\my-portfolio-website\\eerrrrr.portfolio.github.io
  live (GitHub Pages deploy mirror):
    E:\\my-portfolio-website\\eerrrrr.github.io

Every editorial change has to land in both. Doing this manually is
tedious; forgetting causes silent drift. Phase 19's stricter validator
already surfaced one real instance (10 files were in primary but not
live). This tool reports drift on demand and, with --apply, fixes it
in one direction.

Excluded from sync
------------------
Some files INTENTIONALLY differ between the two repos:

- CLAUDE.md and README_OTHER_AI.md frame themselves as PRIMARY in
  one repo and BACKUP in the other.
- .git/ is per-repo and must not be copied.

Everything else (HTML, CSS, JS, JSON, images, videos, PDFs, docs,
tools) should match. The script enforces that.

Usage
-----
    python tools/sync_repos.py                  # dry-run: show drift
    python tools/sync_repos.py --apply          # primary -> live
    python tools/sync_repos.py --reverse        # dry-run: live -> primary
    python tools/sync_repos.py --reverse --apply  # apply live -> primary

By default the script operates primary -> live (the documented
workflow). Pass --reverse to flip direction.

Deletions are off by default. Files that exist only in the target
repo are reported but NOT removed. Pass --allow-delete to also
remove orphans in the target. Use with care.

Exit codes
----------
    0 — dry-run completed with no surprises, OR --apply succeeded
    1 — one or both repo paths don't exist
    2 — drift detected (in dry-run, this is informational; in apply
        mode this should not occur because --apply resolves drift)
"""

import filecmp
import shutil
import sys
from pathlib import Path

PRIMARY = Path(r"E:\my-portfolio-website\eerrrrr.portfolio.github.io")
LIVE = Path(r"E:\my-portfolio-website\eerrrrr.github.io")

EXCLUDE_NAMES = {"CLAUDE.md", "README_OTHER_AI.md"}
EXCLUDE_DIRS = {".git"}


def list_files(root: Path):
    """Return relative paths of every file under `root`, excluding
    the per-repo files in EXCLUDE_NAMES and the .git directory."""
    result = []
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(root)
        if any(part in EXCLUDE_DIRS for part in rel.parts):
            continue
        if rel.name in EXCLUDE_NAMES:
            continue
        result.append(rel)
    return set(result)


def file_differs(a: Path, b: Path) -> bool:
    """True iff the byte contents of `a` and `b` differ."""
    return not filecmp.cmp(a, b, shallow=False)


def human_bytes(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def plan(source: Path, target: Path):
    """Return (to_add, to_overwrite, target_only) sets of relative paths."""
    src_files = list_files(source)
    tgt_files = list_files(target)

    to_add = sorted(src_files - tgt_files)
    target_only = sorted(tgt_files - src_files)
    overlap = src_files & tgt_files

    to_overwrite = sorted(
        rel for rel in overlap
        if file_differs(source / rel, target / rel)
    )

    return to_add, to_overwrite, target_only


def main() -> int:
    args = sys.argv[1:]
    apply = "--apply" in args
    reverse = "--reverse" in args
    allow_delete = "--allow-delete" in args

    if not PRIMARY.exists():
        print(f"PRIMARY not found: {PRIMARY}")
        return 1
    if not LIVE.exists():
        print(f"LIVE not found: {LIVE}")
        return 1

    if reverse:
        source, target = LIVE, PRIMARY
        direction = "live -> primary"
    else:
        source, target = PRIMARY, LIVE
        direction = "primary -> live"

    print(f"Sync direction: {direction}")
    print(f"  source: {source}")
    print(f"  target: {target}")
    print(f"  exclude names: {sorted(EXCLUDE_NAMES)}")
    print()

    to_add, to_overwrite, target_only = plan(source, target)

    if not to_add and not to_overwrite and not target_only:
        print("Both repos are already in sync (excluding the intentionally-different files).")
        return 0

    if to_add:
        total = sum((source / rel).stat().st_size for rel in to_add)
        print(f"--- Would ADD to target ({len(to_add)} files, {human_bytes(total)}):")
        for rel in to_add:
            size = (source / rel).stat().st_size
            print(f"  +  ({human_bytes(size):>10})  {rel}")
        print()

    if to_overwrite:
        print(f"--- Would OVERWRITE in target ({len(to_overwrite)} files):")
        for rel in to_overwrite:
            src_size = (source / rel).stat().st_size
            tgt_size = (target / rel).stat().st_size
            print(f"  ~  ({human_bytes(tgt_size):>10} -> {human_bytes(src_size):<10})  {rel}")
        print()

    if target_only:
        print(f"--- Files present ONLY in target ({len(target_only)} files):")
        for rel in target_only:
            size = (target / rel).stat().st_size
            print(f"  !  ({human_bytes(size):>10})  {rel}")
        print()
        if not allow_delete:
            print("These files would NOT be removed (use --allow-delete to remove them).")
            print()

    if not apply:
        print("DRY-RUN. Re-run with --apply to perform the sync.")
        return 0

    # Apply
    print("Applying...")
    added = 0
    overwritten = 0
    deleted = 0

    for rel in to_add:
        src = source / rel
        tgt = target / rel
        tgt.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, tgt)
        added += 1
        print(f"  +  {rel}")

    for rel in to_overwrite:
        shutil.copy2(source / rel, target / rel)
        overwritten += 1
        print(f"  ~  {rel}")

    if allow_delete:
        for rel in target_only:
            (target / rel).unlink()
            deleted += 1
            print(f"  -  {rel}")

    print()
    print(f"Done. +{added} added, ~{overwritten} overwritten, -{deleted} deleted.")
    print("Next steps: run validator in both repos, commit each, push.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
