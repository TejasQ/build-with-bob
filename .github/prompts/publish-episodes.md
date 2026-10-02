You are running unattended in GitHub Actions on a fresh checkout of `main`. Nobody will answer
questions, so make every decision yourself and finish the job.

These registered episodes have no post in `content/episodes/` yet (`<videoId> <YouTube title>`):

```
$MISSING
```

Read `AGENTS.md`, `content/SCHEMA.md` and `content/SCHEMA-guides.md` first, then run steps 2-8 of
the **Living site loop** in `AGENTS.md` for each episode above, in chronological order:

1. **Assign** `project` (an existing `content/projects/<slug>.md`, or create one for a genuinely
   new project) and a keyword-led `slug` in `data/episodes.json`, then run `pnpm sync` to
   renumber.
2. **Research keywords** (web search, `suggestqueries.google.com` autocomplete via `curl`, SERP
   inspection) and append findings to `content/seo/keywords.md`.
3. **Write the post** `content/episodes/<slug>.md`. Read the whole transcript in
   `data/transcripts/<videoId>.txt` first. Write your own title, not the YouTube title.
4. **Grow the graph:** update the relevant guides in `content/topics/` (bump `updated`), the
   project page, and add cross-links from the previous episode's post to the new one.
5. **Refresh** any guide whose `updated` date is more than 30 days old.
6. **Verify:** `pnpm lint && pnpm typecheck && pnpm build`, then start the site in the background
   (`pnpm start &`), wait for it to answer, run `pnpm audit:seo http://localhost:3000` and fix every
   problem until it passes with zero problems. Stop the server afterwards.
7. Run `pnpm youtube:metadata`.

Hard rules:

- Ground every claim in the transcript (with `?t=` timestamps) or a source you actually fetched.
  Never invent facts, quotes or numbers.
- Never mention AI assistance, Claude, or automation anywhere in the content.
- Keep every file at or under 100 lines where ESLint enforces it.
- Do **not** run `git commit` or `git push`; the workflow verifies and commits your changes.
- Do not edit `.github/`, `scripts/` or `src/` unless a build or audit failure requires it.

When you finish, print one line per episode: `<videoId> -> /episodes/<slug> "<title>"`.
