# Episode post format

File: `content/episodes/<slug>.md` — YAML frontmatter + Markdown body.

```yaml
---
slug: <given slug, unchanged>
videoId: <YouTube id>
title: "<SEO title, 50-65 chars, specific, includes primary keyword>"
description: "<meta description, 140-160 chars, answer-first, no clickbait>"
tldr: "<2-3 sentence plain-language summary that directly answers 'what happens in this episode?'>"
project: <project slug from data/episodes.json, e.g. walfly | killrctx>
topics: ["<4-8 lowercase topic phrases, e.g. 'audio chunking', 'expo'>"]
tools:
  [
    "<tools/technologies actually discussed, canonical spelling, e.g. 'IBM Bob', 'Expo', 'Docling'>",
  ]
takeaways:
  - "<5-7 concrete, self-contained lessons; each quotable on its own>"
faq:
  - q: "<question a developer would type into ChatGPT/Google>"
    a: "<2-4 sentence self-contained answer grounded in the episode>"
# ONLY when data/episodes.json has no chapters for this video: 6-10 chapters you derive
# from the transcript (distinct start seconds, first at 0, keyword-rich titles).
chapters:
  - start: 0
    title: "<chapter title>"
---
```

Body rules:

- 1,400-2,200 words. Start with a 2-3 sentence answer-first intro (no heading).
- H2 (`##`) sections with descriptive, question-or-keyword headings; H3 where helpful.
- Each section opens with a direct, self-contained answer sentence (LLMs quote these).
- Cite moments with timestamp links in the exact form `[12:34](?t=754)` (seconds after `t=`). Use 8+ of them.
- Include 2-4 short verbatim quotes as `>` blockquotes, attributed ("— Tejas" / "— David") with a timestamp link. Lightly clean filler words only.
- Use bullet or numbered lists for processes, decisions, and comparisons; one table where a comparison genuinely exists.
- Link to other episodes as `/episodes/<slug>` where relevant; link project as `/projects/walfly`.
- End with `## What's next` describing what the next episode picks up (or what's planned).
- Ground every claim in the transcript. Never invent numbers, features, or outcomes. If a proper noun is ambiguous in the auto-captions, use the most plausible canonical spelling from context and list it in your final report.
- Write as the show's own editorial team, in a clear, friendly, technical voice. No mention of AI writing tools, no "in this blog post", no hype words like "delve", "game-changer", "unleash".

## Numbering and names

- Episodes are numbered globally and chronologically (`number` in `data/episodes.json`) and have a
  `part` within their project. In prose say "episode 7" or "part 3 of the Walfly build"; never use a
  bare number that could mean either.
- Titles are ours, not YouTube's: always write a new, specific, keyword-led title.
- Canonical names: Building with Bob (never "Build with Bob"), IBM Bob, Bob Shell, Bob Review,
  Walfly, KillrCtx (the open-source NotebookLM clone, https://github.com/TejasQ/killrctx), OpenRAG
  (https://github.com/langflow-ai/openrag), Docling, Langflow, OpenSearch, ElevenLabs, Xavier
  (https://xavier.team, an AI agent orchestrator), Beads, MCP Agent Mail, Astra DB,
  Tejas Kumar, David Jones-Gilardi.
- Link the first mention of an external tool to its official site or repo.
