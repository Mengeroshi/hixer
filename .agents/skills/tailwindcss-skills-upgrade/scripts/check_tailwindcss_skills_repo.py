#!/usr/bin/env python3
"""Read-only hygiene checks for the tailwindcss-skills repository."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


TEXT_SUFFIXES = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".svg",
    ".ts",
    ".txt",
    ".yaml",
    ".yml",
}

DELIVERABLE_ROOTS = [
    "README.md",
    "README.zh-CN.md",
    "AGENTS.md",
    "CLAUDE.md",
    ".github",
    ".claude-plugin",
    ".cursor-plugin",
    "assets",
    "examples",
    "skills",
]

EXCLUDED_DIRS = {
    ".git",
    ".codex",
    ".idea",
    ".next",
    ".turbo",
    ".vercel",
    "dist",
    "node_modules",
    "upstream",
}

FORBIDDEN_PATTERNS = [
    ("template placeholder", re.compile(r"\[TODO:|Complete and informative explanation")),
    ("local upstream checkout path", re.compile(r"upstream/(tailwindcss\.com|pixijs-skills)")),
    ("local absolute user path", re.compile(r"/Users/[A-Za-z0-9._-]+/")),
    ("old guessed GitHub URL", re.compile(r"github\.com/huxy/tailwindcss-skills")),
]

NAME_RE = re.compile(r"^[a-z0-9-]{1,64}$")


def iter_text_files(root: Path):
    for entry in DELIVERABLE_ROOTS:
        path = root / entry
        if not path.exists():
            continue
        if path.is_file() or path.is_symlink():
            if path.suffix in TEXT_SUFFIXES or path.name in {"AGENTS.md", "CLAUDE.md"}:
                yield path
            continue
        for child in path.rglob("*"):
            if any(part in EXCLUDED_DIRS for part in child.relative_to(root).parts):
                continue
            if child.is_file() and child.suffix in TEXT_SUFFIXES:
                yield child


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def parse_frontmatter(text: str) -> dict[str, str] | None:
    if not text.startswith("---\n"):
        return None
    try:
        raw = text.split("---\n", 2)[1]
    except IndexError:
        return None
    data: dict[str, str] = {}
    for line in raw.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data


def check_gitignore(root: Path, errors: list[str]) -> None:
    gitignore = root / ".gitignore"
    if not gitignore.exists():
        errors.append(".gitignore is missing")
        return
    lines = {line.strip() for line in read_text(gitignore).splitlines()}
    if "upstream/" not in lines:
        errors.append(".gitignore must include upstream/")


def check_claude_link(root: Path, errors: list[str]) -> None:
    claude = root / "CLAUDE.md"
    if not claude.exists():
        errors.append("CLAUDE.md is missing; Claude Code should load AGENTS.md through this link")
        return
    if claude.is_symlink() and claude.readlink().as_posix() == "AGENTS.md":
        return
    errors.append("CLAUDE.md should be a symlink to AGENTS.md")


def check_forbidden_patterns(root: Path, errors: list[str]) -> None:
    for path in iter_text_files(root):
        rel = path.relative_to(root)
        text = read_text(path)
        for label, pattern in FORBIDDEN_PATTERNS:
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                errors.append(f"{rel}:{line}: forbidden {label}: {match.group(0)}")


def check_skill_frontmatter(root: Path, errors: list[str]) -> list[str]:
    skills_dir = root / "skills"
    if not skills_dir.exists():
        errors.append("skills/ directory is missing")
        return []

    skill_names: list[str] = []
    for skill_dir in sorted(path for path in skills_dir.iterdir() if path.is_dir()):
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            errors.append(f"{skill_dir.relative_to(root)} is missing SKILL.md")
            continue
        data = parse_frontmatter(read_text(skill_md))
        if data is None:
            errors.append(f"{skill_md.relative_to(root)} is missing YAML frontmatter")
            continue
        name = data.get("name", "")
        description = data.get("description", "")
        if name != skill_dir.name:
            errors.append(f"{skill_md.relative_to(root)} name {name!r} must match directory {skill_dir.name!r}")
        if not NAME_RE.fullmatch(name):
            errors.append(f"{skill_md.relative_to(root)} name {name!r} must be lowercase hyphen-case under 64 chars")
        if not description:
            errors.append(f"{skill_md.relative_to(root)} description is missing")
        if len(description) > 1024:
            errors.append(f"{skill_md.relative_to(root)} description is longer than 1024 chars")
        skill_names.append(skill_dir.name)
    return skill_names


def check_indexes(root: Path, skill_names: list[str], errors: list[str], warnings: list[str]) -> None:
    readmes = [root / "README.md", root / "README.zh-CN.md"]
    for readme in readmes:
        if not readme.exists():
            warnings.append(f"{readme.name} is missing")
            continue
        text = read_text(readme)
        for name in skill_names:
            if f"**{name}**" not in text and f"`{name}`" not in text:
                errors.append(f"{readme.name} does not list skill {name}")

    router_index = root / "skills" / "tailwindcss" / "references" / "index.md"
    if router_index.exists():
        text = read_text(router_index)
        for name in skill_names:
            if name != "tailwindcss" and name not in text:
                warnings.append(f"{router_index.relative_to(root)} does not mention {name}")
    else:
        warnings.append("skills/tailwindcss/references/index.md is missing")


def check_optional_artifacts(root: Path, warnings: list[str]) -> None:
    if (root / "package.json").exists():
        warnings.append("root package.json exists; confirm it is intentional before publishing")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", nargs="?", default=".", help="Path to tailwindcss-skills repository")
    args = parser.parse_args()

    root = Path(args.repo).resolve()
    errors: list[str] = []
    warnings: list[str] = []

    check_gitignore(root, errors)
    check_claude_link(root, errors)
    check_forbidden_patterns(root, errors)
    skill_names = check_skill_frontmatter(root, errors)
    check_indexes(root, skill_names, errors, warnings)
    check_optional_artifacts(root, warnings)

    for warning in warnings:
        print(f"WARN: {warning}")
    for error in errors:
        print(f"ERROR: {error}")

    if errors:
        print(f"\nFailed with {len(errors)} error(s) and {len(warnings)} warning(s).")
        return 1

    print(f"OK: checked {len(skill_names)} public skill(s) with {len(warnings)} warning(s).")
    print("Note: structure/hygiene only — Tailwind facts still need verification against official sources.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
