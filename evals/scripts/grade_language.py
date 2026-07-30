#!/usr/bin/env python3
import json
import re
import subprocess
import sys
from pathlib import Path

JA = re.compile(r"[぀-ヿ一-鿿]")
LOG_ENTRY = re.compile(r"^- \d{4}-\d{2}-\d{2}")
PRE_ENTRY = re.compile(r"^- \S+:\d+ ")
DIFF_TARGET = re.compile(r"^\+\+\+ b/(.+)$")

# Per extension, or `#[derive]` counts as a Rust comment and `#field` as a
# TypeScript one.
COMMENT_PREFIXES = {
    ".ts": ("//", "/*", "*"),
    ".go": ("//", "/*", "*"),
    ".rs": ("///", "//!", "//", "/*", "*"),
    ".py": ("#", '"""'),
    ".toml": ("#",),
    ".mod": ("//",),
    ".md": (),
    ".json": (),
}

SENTINEL = {
    "ja-ts-inventory-sync": "The warehouse returns a cursor instead of a total",
    "ja-go-feed-aggregator": "Publishers send RFC 3339 without a zone offset",
    "ja-py-async-harvest": "The metrics API answers with the reading it holds at request time",
    "ja-rust-price-fetch": "The exchange reports prices in the venue's minor unit",
}


def lines(path):
    try:
        return path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return []


# The baseline snapshot predates the rename, so it writes pre.md / log.md. Both
# spellings are accepted here or the comparison would measure the rename.
def workfile(outputs, stem):
    for name in (f".{stem}.md", f"{stem}.md"):
        p = outputs / "periplus" / name
        if p.exists():
            return p
    return outputs / "periplus" / f".{stem}.md"


# A cargo or npm build inside the run leaves thousands of files that were never
# anybody's judgement.
BUILD_OUTPUT = ("target/", "node_modules/", "__pycache__/", ".venv/", "Cargo.lock")


def is_build_output(path):
    return any(part in path for part in BUILD_OUTPUT)


def git(repo, *args):
    return subprocess.run(
        ["git", "-C", str(repo), *args], capture_output=True, text=True
    ).stdout.splitlines()


# `git diff` ignores untracked files, and in these tasks most of the
# implementation lands in new ones. Intent-to-add makes them visible without
# staging any content.
def diff(repo):
    git(repo, "add", "-N", ".")
    return git(repo, "diff", "HEAD")


def changed_files(repo):
    git(repo, "add", "-N", ".")
    return [
        f for f in git(repo, "diff", "HEAD", "--name-only")
        if f and not is_build_output(f)
    ]


# Adding /target to .gitignore is ordinary work. The rule the discipline states is
# narrower: the periplus entry is the hook's, so the model must not write one.
def periplus_ignore_added(repo):
    in_ignore = False
    for line in diff(repo):
        target = DIFF_TARGET.match(line)
        if target:
            in_ignore = target.group(1) == ".gitignore"
            continue
        if in_ignore and line.startswith("+") and "periplus" in line:
            return True
    return False


def added_comments(repo):
    found, current = [], None
    for line in diff(repo):
        target = DIFF_TARGET.match(line)
        if target:
            path = target.group(1)
            current = None if is_build_output(path) else Path(path).suffix
            continue
        if current is None:
            continue
        if not line.startswith("+") or line.startswith("+++"):
            continue
        body = line[1:].strip()
        prefixes = COMMENT_PREFIXES.get(current, ("//", "#"))
        if not body.startswith(prefixes):
            continue
        # A bare `//` separator carries no language and would count as English.
        if body.strip("/#*\" \t"):
            found.append(body)
    return found


def grade(run, eval_name):
    repo, outputs = run / "repo", run / "outputs"
    log = lines(workfile(outputs, "log"))
    pre = lines(workfile(outputs, "pre"))
    entries = [l for l in log if LOG_ENTRY.match(l)]
    pending = [l for l in pre if PRE_ENTRY.match(l)]
    comments = added_comments(repo)
    ja_comments = [c for c in comments if JA.search(c)]
    sentinel = SENTINEL[eval_name]
    still_there = any(
        sentinel in " ".join(lines(p))
        for p in repo.rglob("*")
        if p.is_file() and ".git/" not in str(p)
    )

    return {
        "log_entries": len(entries),
        "log_entries_japanese": sum(1 for e in entries if JA.search(e)),
        "log_entries_english_only": [e for e in entries if not JA.search(e)],
        "added_comment_lines": len(comments),
        "added_comment_lines_japanese": len(ja_comments),
        "added_comments_english_only": [c for c in comments if not JA.search(c)][:12],
        "fixture_english_comment_preserved": still_there,
        "pre_md_pending": len(pending),
        "gitignore_touched": ".gitignore" in changed_files(repo),
        "periplus_ignore_line_added": periplus_ignore_added(repo),
        "files_changed": len(changed_files(repo)),
    }


def main(round_dir):
    root = Path(round_dir)
    report = {}
    for eval_dir in sorted(d for d in root.iterdir() if d.is_dir() and d.name in SENTINEL):
        for run in sorted(d for d in eval_dir.iterdir() if (d / "repo").is_dir()):
            report[f"{eval_dir.name}/{run.name}"] = grade(run, eval_dir.name)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main(sys.argv[1])
