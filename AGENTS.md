<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Building with Bob

The website for _Building with Bob_, the livestream where Tejas Kumar and David Jones-Gilardi build
open-source apps live with IBM Bob. Production: https://build-with-bob.vercel.app. Next.js 16 App
Router, TypeScript, Tailwind CSS v4, fully static. Goal: be the most discoverable, most cited source
on everything the show covers, across search engines (Google, Bing) and answer engines (ChatGPT,
Claude, Perplexity, Gemini, Google AI Mode / AI Overviews, Copilot).

## Non-negotiable rules

1. **Search the web at every turn.** Before acting on any task, search the web for the current state
   of whatever you're touching (tool versions, APIs, SEO/GEO practice, facts you're about to write).
   Never rely on memory for anything that can change. Cite sources in content.
2. **The site is alive.** Every session starts with the Living site loop below, unless the task
   explicitly says otherwise.
3. **Always write our own titles.** Never reuse YouTube titles for episodes; write specific,
   keyword-led titles (≤60 chars) from `content/seo/keywords.md`. Also propose a matching YouTube
   title via `pnpm youtube:metadata` (`content/seo/youtube.md`) for the hosts to apply.
4. **Never add co-author trailers, tool attribution or any mention of AI assistance** to commits,
   PRs, code, comments or content.
5. **No file over 100 lines** (ESLint `max-lines`). Small, single-purpose, imported modules.
6. **Ground every claim** in a transcript (with `?t=` evidence) or a cited source. No invented facts.
   Date anything that can change ("In August 2026, …").
7. **Every page gets an amazing, dynamic OG image built with Satori** (`next/og` `ImageResponse`):
   an `opengraph-image.tsx` in the route segment, rendered with the shared design system in
   `src/lib/og/` (IBM Plex TTF fonts, Bob gradients, `Frame`, `Headline`, templates for episode,
   guide, project, host, question and page cards). Use real imagery: YouTube thumbnails, host
   avatars (`assets/og/`), the Bob mascot (`assets/og/bob.svg`). `pageMetadata()` points OG and
   Twitter images at the route's own card by default. Before shipping a new page type, research
   current Satori practice, render the card, and look at it: no overflow, no clipped text,
   titles sized by length. Never ship a generic or text-only fallback card.

## Living site loop (run every session)

1. **Sync streams:** `pnpm sync`. This reads https://www.youtube.com/@ibm-bob/streams, ingests any
   new Building with Bob stream (captions, metadata, transcript) into `data/` and prints what's new.
   CI runs it every 6 hours (`.github/workflows/sync-streams.yml`): the `sync` job pushes new
   streams to `main`, then the `publish` job runs Claude Code with
   `.github/prompts/publish-episodes.md` to do steps 2-8 for every episode without a post
   (`scripts/streams/missing_posts.py`) and every guide older than 30 days
   (`scripts/streams/stale_guides.py`), verifies and pushes to `main`. Needs the
   `ANTHROPIC_API_KEY` (or `CLAUDE_CODE_OAUTH_TOKEN`) repo secret; `YT_COOKIES` is optional.
2. **Assign each new entry** in `data/episodes.json`: set `project` (existing slug, or create
   `content/projects/<slug>.md` for a new project) and a keyword-led `slug`. Re-run `pnpm sync` to
   renumber. Numbering is global and chronological; `part` is the position within a project.
3. **Research keywords** for the new episode (web search, Google + YouTube autocomplete via
   `suggestqueries.google.com`, SERP inspection) and append findings to `content/seo/keywords.md`.
4. **Write the post** `content/episodes/<slug>.md` per `content/SCHEMA.md` (read the whole
   transcript; derive chapters if YouTube has none).
5. **Grow the graph:** add the new evidence to every relevant guide in `content/topics/` (bump
   `updated`), create a new guide when a search intent now has enough evidence (`content/SCHEMA-guides.md`),
   update the project page, and add cross-links from older posts to the new one.
6. **Refresh for freshness:** any guide with `updated` older than 30 days gets re-checked against the
   web and new episodes, then updated. Answer engines weight recency heavily.
7. **Verify:** `pnpm lint && pnpm typecheck && pnpm build`, then `pnpm start` and
   `pnpm audit:seo http://localhost:3000` (must pass with zero problems).
8. **YouTube:** run `pnpm youtube:metadata` so `content/seo/youtube.md` carries the new
   titles/descriptions for the hosts to apply in YouTube Studio.
9. **Ship:** commit and push to `main` (no PRs). After Vercel deploys production, `.github/workflows/indexnow.yml`
   pings IndexNow automatically (or run `pnpm indexnow`).

## SEO / GEO playbook (go hard)

- **Answer first.** Every page opens with a 40-60 word self-contained answer (`tldr` / `answer`).
  Every H2 opens with one declarative sentence that fully answers it. Answer engines quote passages.
- **One intent per page**, long tail first. Put exact query phrasings, error strings and
  "X vs Y" wording in H2/H3s and FAQs. Target what autocomplete proves people search.
- **Entities:** name tools, people and products precisely and consistently (canonical names in
  `content/SCHEMA.md`), link first mentions to official sources, keep hosts' `sameAs` complete.
- **Evidence density:** timestamps, concrete numbers, versions, commands, tables and short quotes.
  First-hand experience ("we saw…") is our moat; never generic filler.
- **Structured data on every page** (see `src/lib/seo/`): VideoObject with Clip key moments +
  SeekToAction, BlogPosting/Article with dateModified, FAQPage, BreadcrumbList, ProfilePage/Person,
  SoftwareSourceCode, WebSite SearchAction, Organization. Keep them valid (`pnpm audit:seo`).
- **Machine access:** `/llms.txt`, `/llms-full.txt`, `.md` twins of every episode and guide,
  `/catalog.json`, RSS, WebMCP tools (`src/lib/webmcp/`), robots.txt welcoming AI crawlers.
- **Internal links:** every episode links its project, adjacent episodes and 2-4 guides; every
  guide links its source episodes; topic hubs exist only for tags in 3+ episodes or with a guide.
- **Freshness:** visible "Updated" dates, real updates, IndexNow on every deploy.
- **Off-site:** YouTube titles/descriptions should mirror our titles and link the matching page;
  YouTube and Reddit are among the most-cited sources in answer engines.
- **Measure:** set `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`; promote queries with
  impressions but position > 10 into their own H2/FAQ; test the GEO prompt list in
  `content/seo/keywords.md` monthly in ChatGPT, Claude, Perplexity and Google AI Mode.

## Commands

`pnpm dev` · `pnpm build` (prebuild syncs search chunks to Astra DB) · `pnpm index` · `pnpm lint` · `pnpm typecheck` ·
`pnpm format` · `pnpm sync` (new streams) · `pnpm audit:seo [url]` · `pnpm indexnow` ·
`pnpm seed:questions [url]` · `pnpm youtube:metadata`.
Prettier + ESLint run on commit via husky + lint-staged.

## Layout

- `data/episodes.json`: source of truth for episodes (videoId, slug, project, number, part, chapters).
- `data/transcripts/<videoId>.{json,txt}`: cleaned transcripts. `data/raw/`: yt-dlp output (ignored).
- `content/episodes/*.md` (`content/SCHEMA.md`), `content/topics/*.md` guides
  (`content/SCHEMA-guides.md`), `content/projects/*.md`, `content/seo/keywords.md`.
- `src/lib/content/*` loaders (zod) · `src/lib/seo/*` metadata + JSON-LD · `src/lib/feeds/*`
  RSS, llms.txt, Markdown twins, catalog · `src/lib/astra/*` + `/api/search`: hybrid search in
  Astra DB (collection `bwb_search`: NVIDIA vectorize + BM25 lexical + NVIDIA reranker,
  `findAndRerank`) · `src/lib/webmcp/*` WebMCP tools.
- `scripts/sync_streams.py` + `scripts/streams/` (YouTube sync) · `scripts/build-search-index.ts`
  · `scripts/seo/` (audit, IndexNow).
- Env (see `.env.example`): `NEXT_PUBLIC_SITE_URL`, `ASTRA_DB_API_ENDPOINT`,
  `ASTRA_DB_APPLICATION_TOKEN` (server-only; never commit or expose). Without Astra env the build
  skips the index sync and search returns nothing.
- Question pages: every search via `/api/search` is persisted in Astra (`bwb_queries`) as
  `/ask/<slug>`. Only on-topic questions (reranker top score ≥ 3, sane wording) are indexable and
  listed in the sitemap/llms.txt; the rest render `noindex`. Seed target prompts with
  `pnpm seed:questions <url>`. ISR caches Astra reads in Next's data cache; locally, delete
  `.next/cache/fetch-cache` if lists look stale.
