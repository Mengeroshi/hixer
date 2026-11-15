---
name: github-memory
description: >-
  Keeps this repo's memory on GitHub and ships with GitHub flow. Use on every
  feature, fix, or decision that should outlive the chat, including when the
  user says remember, don't forget, issue, branch, commit, merge, ready, or
  starts work they will want later. Hold the issue until its context is
  complete. Publish it only then, before the commit, and then create the
  branch, commit, and merge to main. Do that only after the user says the
  feature is ready.
---

# GitHub memory

GitHub is the memory once an issue is published. Until then the spec stays in the chat. Do not create or update an issue, branch, commit, or pull request while the context is still incomplete.

## Full context

The issue is publishable when the user says it is ready ("ready", "ship it", "commit", or "merge") and the body below is filled in. "Looks good" and "keep going" are not ready. Open questions must be empty or answered. A half-specified feature is not published.

```markdown
## Outcome
## Requirements
- [ ]
## Decisions
## Open questions
## Done when
- [ ]
```

Title: `feat: <verb phrase>` or `fix: <verb phrase>`.

## While the context is open

Edit locally. Do not publish the issue. Do not create a branch. Do not commit or push.

A question, a review, or a typo inside the current feature does not get its own issue. A separate bug stays in the chat until that bug has full context, then it ships on its own.

## Ship

When the context is full, do these in order. The issue exists before the commit.

1. Search `gh issue list --search "<words>" --state all`. Reuse a match only if it is this same feature. Otherwise `gh issue create` with the title and the body above.
2. From the current `main` work, `git checkout -b <n>-<slug>`. `<slug>` is the title after the prefix, kebab-case, four words or fewer. Example: issue 12 `feat: persist session on the issue` → `12-persist-session`.
3. One commit on that branch. Subject is the issue title. Body includes `Closes #<n>`.
4. Push, `gh pr create` with that title and `Closes #<n>`, then `gh pr merge`.
5. Stop if the merge fails. Do not force-push or skip hooks.

After merge, that issue is the record. Do not also write a changelog or a decision doc.

## Start of a session

`gh issue list --state open --limit 30`, `git status`, and `git branch --show-current`. Read an open issue only to continue a feature that was already published. In-progress work has no issue yet. If `gh` cannot see the repo, stop and say so.
