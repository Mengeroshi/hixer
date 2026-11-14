# Tailwind CSS Skills Upgrade Checklist

Use this checklist before editing the `tailwindcss-skills` repository for a Tailwind release or docs refresh.

## Discovery

- Determine the requested target version. If unspecified, query official sources first.
- Check `npm view tailwindcss version`.
- Check the Tailwind blog for release posts and dated claims.
- Check `tailwindlabs/tailwindcss.com` for current docs source and changed docs routes.
- If `upstream/tailwindcss.com` exists, update it as ignored scratch context and compare docs locally. Do not make published files depend on that path.
- Read `AGENTS.md` and the affected skill files before editing.

## Impact Map

Classify each official change before deciding files:

- Installation or package changes: `tailwindcss-installation`, README install snippets, plugin metadata, examples.
- Directives/functions: `tailwindcss-functions-directives`, related references, custom styles.
- Theme variables or token namespaces: `tailwindcss-theme`, `tailwindcss-colors`, README quick reference.
- Source detection or safelisting: `tailwindcss-source-detection`, functions/directives references.
- Variants or state syntax: `tailwindcss-states-variants`, responsive/dark mode/interactivity skills.
- Browser, Node, build tool, Sass, or prefixing changes: `tailwindcss-compatibility`, `tailwindcss-upgrade-v4`, installation.
- New utility families: the matching utility-group skill plus router trigger index.
- Migration behavior: `tailwindcss-upgrade-v4`, compatibility, README agent guidance.

## Editing Guardrails

- Preserve the PixiJS-inspired structure and concise tone.
- Keep claims source-backed and version-specific when needed.
- Keep published skill references as public URLs, not local paths.
- Keep `upstream/` out of README structure, plugin metadata, examples, and skill instructions.
- Keep `.codex/skills` as local maintenance tooling, not part of the public skill collection.
- Do not change unrelated skills just to make wording uniform.
- Do not replace accurate older-version migration guidance with latest-version defaults unless the skill is no longer about that older migration path.

## Common Failure Modes

- Treating a local docs checkout as a published dependency.
- Copying a Tailwind v3 pattern into v4 guidance.
- Updating README claims without updating router triggers.
- Updating a dense `SKILL.md` without moving long tables into `references/`.
- Claiming "latest" without checking official sources during the current task.
- Forgetting localized README or plugin marketplace metadata.
- Running only frontmatter validation and skipping example compilation after install guidance changes.

## Verification Checklist

- Run the local hygiene script:

```bash
python3 .codex/skills/tailwindcss-skills-upgrade/scripts/check_tailwindcss_skills_repo.py .
```

- Run Agent Skills validation for every public skill when the validator exists.
- Search for template placeholders, local paths, and development-only URLs.
- Check README skill tables against `skills/*/SKILL.md`.
- Rebuild or compile affected examples when commands, package names, or CSS entrypoints change.
- Spot-check official links for docs pages touched by the change.
- Record any unverified facts in the final answer.
