---
name: github-memory
description: >-
  Keeps this repo's memory on GitHub and ships with GitHub flow. Use on every
  feature, fix, or decision that should outlive the chat, including when the
  user says remember, don't forget, issue, branch, commit, merge, ready, or
  starts work they will want later. Search or create one issue before editing,
  keep requirements and decisions on that issue, and commit or merge to main
  only after the user says the feature is ready.
---

# GitHub memory

GitHub is the memory. The open issue is the spec. Chat is scratch. A new session starts by reading GitHub, not by guessing.

Code stays local until the user says the feature is ready. Requirements still live on the issue, so both of you can see them without a commit.

## Start of a session

1. `gh issue list --state open --limit 30` and `git status` plus `git branch --show-current`.
2. On a branch named `<n>-<slug>`, run `gh issue view <n>` and continue that issue.
3. On `main` with a dirty tree, stop. Ask which open issue it belongs to before editing more.

If `gh` cannot see the repo, stop and say so. Do not invent a second memory file.

## What gets an issue

A feature or a fix the user wants kept. Search first: `gh issue list --search "<words>" --state all`. Reuse a match. A question, a review, or a one-line typo inside the current feature does not get its own issue.

A bug found while building something else gets a new issue and stays unfixed on this branch.

## Before editing

1. Create the issue if none exists. Title: `feat: <verb phrase>` or `fix: <verb phrase>`.
2. Body, then keep editing this body as requirements change. Comment only to record a decision or a rejected option.

```markdown
## Outcome
## Requirements
- [ ]
## Decisions
## Open questions
## Done when
- [ ]
```

3. From an up-to-date `main`: `git checkout -b <n>-<slug>`. `<slug>` is the title after the prefix, kebab-case, four words or fewer. Example: issue 12 `feat: persist session on the issue` → branch `12-persist-session`.
4. Edit only on that branch. Never commit to `main`.

## While working

Update the issue when a requirement, decision, or open question changes. Check off requirements as they land in the working tree. Do not commit, push, or open a pull request.

## Ready

Commit and merge only when the user says the feature is ready: "ready", "ship it", "commit", or "merge". "Looks good" and "keep going" are not ready.

1. Update the issue so the body matches what will ship.
2. One commit on the feature branch. Subject is the issue title. Body includes `Closes #<n>`.
3. Push, `gh pr create` with that title and `Closes #<n>`, then `gh pr merge`.
4. Stop if the merge fails. Do not force-push or skip hooks.

After merge, the issue is the record. Do not also write a changelog or a decision doc.
