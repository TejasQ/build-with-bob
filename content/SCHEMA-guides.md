# Guide (editorial topic hub) format

File: `content/topics/<slug>.md`, served at `/topics/<slug>`. Overrides any auto-generated tag hub
with the same slug. These are the site's "pillar" pages: they aggregate first-hand evidence from
several episodes to answer one search intent completely.

```yaml
---
slug: <given slug>
title: "<SEO <title>, ≤60 chars, given in the brief>"
h1: "<on-page H1, can be a question, e.g. 'What is IBM Bob?'>"
description: "<meta description ≤160 chars, given in the brief>"
answer: "<answer-first summary, 40-60 words, fully answers the H1 on its own>"
updated: "2026-09-30"
about: ["<canonical entity names this page is about, e.g. 'IBM Bob'>"]
episodes: [<slugs of episodes that feed this page>]
faq:
  - q: "<real query phrasing from the keyword map>"
    a: "<2-4 sentence self-contained answer>"
---
```

Body rules:

- 1,200-2,000 words of Markdown. Do not repeat the `answer` or H1 in the body; start with a short intro paragraph.
- `##` H2 per section from the brief's outline; open every H2 with one self-contained answer sentence.
- Evidence links MUST use absolute episode paths with a timestamp: `[12:34](/episodes/<slug>?t=754)`.
  (There is no video player on guide pages, so never use bare `?t=` links here.)
- Link each feeding episode at least once by title; link `/projects/walfly` where relevant; link
  sibling guides as `/topics/<slug>`.
- External facts (IBM docs, vendor docs, GitHub issues) get an inline Markdown link to the source.
- Lists and one table where a comparison genuinely exists. Short verbatim quotes as `>` blockquotes
  with attribution and timestamp link.
- Date-sensitive claims are phrased as dated observations ("In August 2026, the hosted deployment we used...").
- Ground every show claim in the transcripts. No invented numbers, features or outcomes.
- Voice: the show's editorial team; clear, friendly, technical. No mention of AI writing tools,
  no "in this article", no hype words ("delve", "game-changer", "unleash", "revolutionize").
- Canonical names: Building with Bob (never "Build with Bob"), IBM Bob, Bob Shell, Bob Review,
  Walfly, Docling, hosted Docling (Docling for IBM watsonx), Whisper Turbo, Beads, MCP Agent Mail,
  Xavier, Astra DB, Tejas Kumar, David Jones-Gilardi.
