# Building with Bob: keyword and GEO opportunity map

Research date: 2026-09-30. Scope: home, `/episodes/*` (5), `/projects/walfly`, `/topics/*`, `/search`, `/about`, `llms.txt`.

---

## 1. Method

**Demand signals (free, no paid tools).** We pulled about 4,900 raw Google and YouTube autocomplete suggestions (`suggestqueries.google.com`, `client=firefox`, `hl=en&gl=us`, plus `ds=yt` for YouTube). Each seed was expanded with a–z suffixes, question prefixes (what/how/why/is/does/can/best) and modifiers (vs/alternative/tutorial/not working). About 35 more targeted seeds followed from what we learned. Autocomplete shows that people search a phrase, not how often they search it. Read "G" / "YT" below as "appears in Google / YouTube autocomplete", and "G×n" as "n or more distinct long-tail variants seen".

**SERP inspection.** We ran web searches on about 20 of the most promising terms to see who ranks, whether the intent is served, and where first-hand content is missing.

**Grounding.** Every recommendation below that says an episode "covers" something was checked against `data/transcripts/*.json`. Timestamps are given as `?t=<seconds>`.

### Tactics we're applying (with sources)

| Tactic                                                                                                                    | Why it matters for us                                                                                                           | Source                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Long tail first, one page per intent (not per keyword)                                                                    | New domain with no authority; short heads are owned by IBM, Expo, React Native docs                                             | [w3era](https://www.w3era.com/blog/seo/long-tail-keyword-strategy/), [TripleDart](https://www.tripledart.com/saas-seo/long-tail-keyword-strategy)                                                                                                                                                                                  |
| "GEO is still SEO": helpful, people-first pages from the same index; no special AI markup                                 | Don't chase tricks; ship good pages, structured data, and crawlable text                                                        | [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [Google: succeeding in AI search](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search), [SEJ](https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/) |
| Answer-first: fully answer in the first ~200 words and open every H2 with a self-contained sentence                       | Retrieval systems score passages, not pages                                                                                     | [Enrich Labs GEO guide](https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026), [Frase](https://www.frase.io/blog/what-is-generative-engine-optimization-geo)                                                                                                                                      |
| Lists, quotes, and concrete specifics                                                                                     | Structured passages with quotes/stats saw higher AI visibility                                                                  | [Enrich Labs](https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026)                                                                                                                                                                                                                               |
| Query fan-out coverage: answer the sub-questions an engine will spawn (what / how / vs / cost / limits)                   | ChatGPT rewrites prompts into fan-out queries that share little wording with the original; Perplexity stays close to the prompt | [Enrich Labs](https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026)                                                                                                                                                                                                                               |
| Freshness: visible "Updated" dates and real updates                                                                       | Perplexity strongly favours recent pages; IBM Bob changes monthly                                                               | [Enrich Labs](https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026), [Bob Aug 2026 release](https://bob.ibm.com/blog/august-2026-release/)                                                                                                                                                        |
| Balanced, non-promotional comparisons                                                                                     | Claude-style engines prefer multi-source, balanced content, and comparison prompts ("X vs Y") fan out heavily                   | [Enrich Labs](https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026)                                                                                                                                                                                                                               |
| Show up where engines already cite: YouTube and Reddit                                                                    | YouTube and Reddit are the most cited sources across AI engines; AI Overviews and Perplexity drive most YouTube citations       | [Search Engine Land](https://searchengineland.com/ai-search-engines-cite-reddit-youtube-and-linkedin-most-study-473138), [Otterly YouTube study](https://otterly.ai/blog/youtube-ai-citation-study-2026/), [Semrush](https://www.semrush.com/blog/most-cited-domains-ai/)                                                          |
| Entity consistency: one canonical spelling for show, hosts, tools, and project across site, YouTube, schema, and llms.txt | Engines resolve entities; our YouTube metadata currently spells the project "Wallfly" and "Docling SAS"                         | observed in `data/episodes.json`                                                                                                                                                                                                                                                                                                   |

### Entity hygiene issues found (fix before anything else)

1. **Four of five YouTube videos share the title "Building with Bob: Walfly Wearables App".** YouTube is a top-cited source in AI Overviews and Perplexity, and identical titles waste that. Give each video the episode's own keyword title (see section 4).
2. **Spelling drift.** YouTube chapters say "Wallfly" (ep1–5) and "Docling SAS" (ep3); the site says "Walfly" and "hosted Docling / Docling SaaS". Standardise on **Walfly**. For the hosted product, IBM's own name is **Docling for IBM watsonx** ([IBM](https://www.ibm.com/products/docling)). Say "hosted Docling (Docling for IBM watsonx)" once per page.
3. **Name collision.** IBM runs a YouTube channel called **"Build with Bob"** ([@BuildwithIBM](https://www.youtube.com/@BuildwithIBM)). There is also an unrelated IBM i build tool historically called "Project Bob / Better Object Builder" ([IBM community](https://community.ibm.com/community/user/discussion/project-bob-ibmi-competitors)). Always write the show as **"Building with Bob"**, and add one disambiguation sentence on `/about`: "a livestream by Tejas Kumar and David Jones-Gilardi, building apps with IBM Bob, IBM's AI coding agent".
4. **Freshness caveat on Docling audio.** On stream (Aug 2026) the hosted deployment returned an "ASR capability gap" ([TrJNkt1G6TA?t=716](https://youtu.be/TrJNkt1G6TA?t=716)). IBM's marketing says Docling for IBM watsonx processes "audio files" ([IBM announcement](https://www.ibm.com/new/announcements/docling-for-ibm-watsonx-turn-complex-documents-into-ai-ready-data)). State our result as a dated observation ("in August 2026, the deployment we used…"), not a permanent fact, and add `dateModified`.

---

## 2. What the demand data says (summary)

- **IBM Bob is the biggest opening.** About 330 distinct IBM-Bob suggestions (GA was 2026-04-28). High-signal clusters:
  - What it is: `what is ibm bob`, `what does ibm bob do`, `is ibm bob an ide / an agent / an llm`, `ibm bob full form`
  - Quality: `is ibm bob good`, `ibm bob review(s)`, `ibm bob reddit`, `ibm bob review reddit`
  - Comparisons (G×10): `ibm bob vs claude code / claude / cursor / codex / copilot / github copilot / kiro / antigravity`, `ibm bob alternative`, `ibm bob competitors`
  - Models: `what model does ibm bob use`, `does ibm bob use claude`, `is ibm bob built on claude`
  - Features: `ibm bob plan mode`, `ibm bob modes`, `ibm bob custom modes`, `ibm bob review mode`, `ibm bob code review`, `ibm bob findings`, `bob shell`, `bob ide vs bob shell`, `what is ibm bob shell`, `ibm bob mcp`, `ibm bob skills`, `ibm bob rules`, `ibm bob yolo`, `ibm bob spec driven development`
  - How-to: `how to use ibm bob`, `ibm bob tutorial`, `ibm bob demo`, `ibm bob examples`, `ibm bob in action`, `ibm bob use cases`, `ibm bob best practices`
  - SERPs: bob.ibm.com docs, IBM newsroom, trade press (The Register, DevOps.com), Medium and personal blogs (mostly IBM i/COBOL), and thin comparison templates (Terminal Trove, SourceForge, G2). **Nobody has a multi-episode, first-hand record of building a modern JS/mobile app with Bob.**
- **Docling audio is a small but wide-open niche.** Autocomplete has `docling asr`, `docling asr pipeline`, `docling audio`, `docling transcription`, `docling whisper`, `docling serve asr`, `docling serve audio`, `docling pipeline type asr`, `docling saas`, `docling mlx`, `docling mac`, `does docling run locally`, `is docling local`, and `does docling need gpu`. The SERP has official docs, GitHub issues ([m4a MIME bug](https://github.com/docling-project/docling-core/issues/787), [zero-duration segments](https://github.com/docling-project/docling/issues/3006)) and one dev.to post. A general "transcribe audio python mac" search returns **no Docling results at all**. That is a clear gap for a first-hand troubleshooting page.
- **Expo/React Native long tail has huge variety but strong incumbents.** Examples: `keyboardavoidingview extra padding`, `keyboardavoidingview keyboardverticaloffset`, `keyboardavoidingview safeareaview`, `expo keyboardavoidingview not working`, `expo audio not working on ios`, `expo audio permission`, `expo audio or expo av`, `expo av to expo audio migration`. The rankers are RN docs, Expo docs, GitHub issues and Medium. We win only on the exact symptom plus fix, so put those in episode H2s and FAQs rather than making new pages.
- **Agent tooling is young and searched.** Suggestions include `beads agent`, `beads coding agent`, `beads rust`, `beads vs github issues`, `beads vs linear`, `mcp agent mail`, `mcp agent mail rust`, `agent mail mcp server`, `grill me skill` (G×10, incl. `grill me skill matt pocock`) and `coding agent harness`. SERPs are GitHub READMEs and a few blogs, with almost no "how we used Beads + Agent Mail + GitHub Projects together" content.
- **Wearable-recorder alternatives**: `limitless pendant alternative`, `bee ai wearable alternative`, `alternative to bee.computer`, `plaud alternative open source`, `open source limitless pendant`, `open source ai wearable recording device`. The SERPs are vendor listicles; Omi is the usual "open source" answer. Walfly can be the "build-it-yourself, local-first" answer.
- **Not worth targeting** (IBM or others own them, or our content can't answer): `ibm bob pricing / download / install / login / hackathon / certification / for ibm i / cobol`, `bobcoins` (mentioned once, never explained), head terms like `ai code review`, `coding agent`, `spec driven development`, `react native safe area context`.

---

## 3. Prioritized keyword map

Difficulty: **L** = mostly docs/issues/thin pages, first-hand content can rank; **M** = established blogs or docs but gaps exist; **H** = owned by official docs, big publishers or brand. Priority P1 = build now.

| #       | Keyword cluster                                                                                                                                                                                      | Signal              | Intent                     | Difficulty + why                                                                         | Target URL                                                                   | Primary on-page actions                                                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 (P1)  | what is ibm bob · what does ibm bob do · is ibm bob an ide / agent · ibm bob ai                                                                                                                      | G×15, YT            | Informational              | **M**: IBM docs + press rank; no neutral first-hand explainer                            | **NEW** `/topics/ibm-bob`                                                    | H1 "What is IBM Bob?". First sentence: definition + "we've built a real app with it on 5 livestreams". FAQ: "Is IBM Bob an IDE or an agent?"                                       |
| 2 (P1)  | is ibm bob good · ibm bob review(s) · ibm bob review reddit · ibm bob reddit                                                                                                                         | G×6                 | Commercial investigation   | **L–M**: Gartner/G2 (few reviews), Medium; no builder's diary                            | `/topics/ibm-bob` (H2 "Is IBM Bob good? What worked and what didn't")        | Balanced pros/cons list with timestamp evidence; `dateModified`; seed a Reddit thread linking the episode                                                                          |
| 3 (P1)  | ibm bob vs claude code · vs cursor · vs codex · vs copilot · vs kiro · ibm bob alternative · ibm bob competitors                                                                                     | G×12                | Comparison                 | **L–M**: Terminal Trove/SourceForge templates, G2                                        | **NEW** `/topics/ibm-bob-vs-claude-code-cursor-codex` (see section 4 caveat) | Title uses "vs"; comparison table limited to what we observed + cited IBM facts; no winner claims                                                                                  |
| 4 (P1)  | ibm bob plan mode · ibm bob modes · ibm bob custom modes · ibm bob spec driven development                                                                                                           | G×5                 | How-to                     | **L**: bob.ibm.com docs + heidloff.net only                                              | **NEW** `/topics/ibm-bob-features-in-practice` + ep1                         | H2 "How IBM Bob's plan mode works on a real project"; FAQ "Does Bob switch from plan to agent mode by itself?"                                                                     |
| 5 (P1)  | ibm bob code review · ibm bob review mode · ibm bob findings · fix with bob · bob review vs                                                                                                          | G×4                 | How-to / comparison        | **L**: IBM docs + one IBM tutorial                                                       | ep4 + features page                                                          | Rename ep4 H2 to "Bob Review vs Xavier Review on the same commits"; FAQ "What is Fix with Bob?"                                                                                    |
| 6 (P1)  | bob shell · what is ibm bob shell · bob ide vs bob shell · ibm bob cli                                                                                                                               | G×8                 | Informational              | **L–M**: IBM docs, heidloff, Medium                                                      | features page (H2)                                                           | Answer "Bob Shell vs Bob IDE" with ep3 sync moment ([t=3552](?t=3552)); link IBM docs for specifics                                                                                |
| 7 (P2)  | what model does ibm bob use · does ibm bob use claude · is ibm bob built on claude · ibm bob which model                                                                                             | G×9                 | Informational              | **M**: press answers it                                                                  | `/topics/ibm-bob` FAQ                                                        | Cite IBM (routes across Claude, Mistral, Granite) + our observation that you can't pick the model ([bkPj3b8icH0 t=3202](?t=3202))                                                  |
| 8 (P2)  | ibm bob permissions · ibm bob auto-approve · ibm bob yolo · ibm bob security                                                                                                                         | G×3 + SERP          | Troubleshooting            | **L**: docs + IBM community Q&A                                                          | features page + ep1 FAQ                                                      | FAQ "Why does IBM Bob keep asking for permission?" (exists in ep1; syndicate to hub)                                                                                               |
| 9 (P2)  | ibm bob memory · ibm bob rules · ibm bob skills                                                                                                                                                      | G×3                 | How-to                     | **L**                                                                                    | features page                                                                | Example: telling Bob to update memory after it claimed Next.js 16 didn't exist ([PSAbjcEsn-Q t=3831](?t=3831), [t=3911](?t=3911))                                                  |
| 10 (P1) | docling audio · docling asr · docling asr pipeline · docling transcription · docling whisper · docling pipeline type asr                                                                             | G×6                 | How-to                     | **L**: official docs + GitHub issues + one dev.to post                                   | **NEW** `/topics/docling-audio-transcription`                                | H1 "How to transcribe audio with Docling". H2s: hosted vs local, docling-serve, Python import, MLX Whisper, VTT vs SRT, errors                                                     |
| 11 (P1) | docling serve asr · docling serve audio · docling saas · "asr capability gap"                                                                                                                        | G×3                 | Troubleshooting            | **L**: GitHub issues only                                                                | Docling hub + ep2                                                            | Quote the exact error text from [TrJNkt1G6TA t=716](?t=716) in an H3 so it matches pasted-error searches                                                                           |
| 12 (P2) | docling mlx · mlx whisper · docling mac · does docling run locally · is docling local · does docling need gpu                                                                                        | G×7, YT             | Informational              | **L–M**                                                                                  | Docling hub + ep3                                                            | FAQ "Does Docling use MLX Whisper on a Mac?" ([TrJNkt1G6TA t=2057](?t=2057)); "fast on Apple silicon" ([tH5-O5iKzM8 t=548](?t=548))                                                |
| 13 (P2) | docling "unrecognized audio container" · docling m4a · docling webm                                                                                                                                  | SERP (issues)       | Troubleshooting            | **L**                                                                                    | ep5 + Docling hub                                                            | Quote the error "Unrecognized audio container, expected wav/mp3" ([eUZacfuVVDU t=5467](?t=5467)); link ep2 WebM finding                                                            |
| 14 (P1) | audio chunking · audio chunking python · whisper chunking · whisper chunk length · chunk length whisper                                                                                              | G×8, YT             | How-to / design            | **M**: WhisperX paper, vendor blogs; design-level gap on ordering and ephemeral services | **NEW** `/topics/audio-chunking` + ep5                                       | H2 "How long should audio chunks be?" answered in one sentence (30 s baseline + VAD pause)                                                                                         |
| 15 (P3) | whisper turbo · mlx whisper turbo                                                                                                                                                                    | G×8                 | Informational              | **H**: HF, benchmarks                                                                    | ep3 mention only                                                             | Don't target; keep canonical spelling "Whisper Turbo"                                                                                                                              |
| 16 (P2) | expo audio recording · expo av recording · expo audio permission · expo audio not working on ios · expo audio or expo av                                                                             | G×20                | Troubleshooting            | **M–H**: Expo docs, SO                                                                   | ep2                                                                          | H2 "Why does my Expo app record on web but not on iOS?"; keep expo-av naming as on stream                                                                                          |
| 17 (P2) | keyboardavoidingview extra padding · keyboardverticaloffset · keyboardavoidingview safeareaview · expo keyboardavoidingview not working                                                              | G×60+ variants      | Troubleshooting            | **M–H**: RN docs, GitHub issues, Medium; exact-symptom answer is rare                    | ep4                                                                          | H2 "Chat input floats above the iOS keyboard: remove keyboardVerticalOffset={insets.top}"; add code snippet                                                                        |
| 18 (P3) | react native safe area insets expo · expo router safe area                                                                                                                                           | G×10                | How-to                     | **H**                                                                                    | ep4 section                                                                  | Keep as H3; name Expo SDK 57 as on stream ([bkPj3b8icH0 t=1247](?t=1247))                                                                                                          |
| 19 (P3) | react native keyboard controller · keyboardstickyview                                                                                                                                                | G×10                | How-to                     | **M**                                                                                    | ep4                                                                          | One H3: KeyboardStickyView was native-only and broke the web build ([t=3389](?t=3389))                                                                                             |
| 20 (P3) | expo sdk upgrade · expo cocoapods after upgrade                                                                                                                                                      | G×10                | Troubleshooting            | **H**                                                                                    | ep3 FAQ                                                                      | Keep existing FAQ                                                                                                                                                                  |
| 21 (P1) | beads agent · beads coding agent · beads rust · beads vs github issues · beads vs linear                                                                                                             | G×15, YT            | Informational / comparison | **L**: READMEs + a few blogs                                                             | **NEW** `/topics/coordinating-coding-agents` + ep3, ep5                      | Table: Beads vs MCP Agent Mail vs GitHub Projects (ep5 already has one)                                                                                                            |
| 22 (P1) | mcp agent mail · mcp agent mail rust · agent mail mcp server                                                                                                                                         | G×5                 | Informational              | **L**: GitHub + author site                                                              | same hub                                                                     | FAQ "How do you stop coding agents overwriting each other's files?"                                                                                                                |
| 23 (P2) | grill me skill · grill me skill matt pocock · grill me skill claude code                                                                                                                             | G×10                | How-to                     | **L–M**                                                                                  | agents hub + ep3/ep4 FAQ                                                     | Show a real grill-me run ([tH5-O5iKzM8 t=4908](?t=4908)) and Xavier wrapping it (ep4 [t=626](?t=626))                                                                              |
| 24 (P3) | coding agent harness · meta harness                                                                                                                                                                  | G×8                 | Informational              | **M**                                                                                    | ep4 (Xavier)                                                                 | One-sentence definition from [t=1119](?t=1119)                                                                                                                                     |
| 25 (P2) | python sidecar · next.js python sidecar                                                                                                                                                              | G (Tauri-dominated) | How-to                     | **L** for Next.js variant                                                                | ep3                                                                          | H2 "What is a Python sidecar in a Next.js/Expo app?"                                                                                                                               |
| 26 (P1) | limitless pendant alternative · bee ai wearable alternative · alternative to bee.computer · plaud alternative open source · open source limitless pendant · open source ai wearable recording device | G×8                 | Commercial                 | **M**: vendor listicles; Omi dominates "open source"                                     | `/projects/walfly`                                                           | H2 "An open-source, local-first alternative to Bee, Limitless and Plaud" (Bee is referenced on stream [PSAbjcEsn-Q t=65](?t=65)); be honest that Walfly is a DIY app, not hardware |
| 27 (P3) | astra db hybrid search · astra db vector search                                                                                                                                                      | G×2                 | How-to                     | **M**: DataStax docs                                                                     | `/projects/walfly`                                                           | One H3 describing the hybrid search use; don't target                                                                                                                              |
| 28 (P2) | ephemeral asr · stateless transcription service · self-host whisper api docker                                                                                                                       | no AC               | Design                     | **L** (no demand, high GEO value)                                                        | ep5 + chunking hub                                                           | Definition sentence for "ephemeral ASR service" ([eUZacfuVVDU t=1166](?t=1166))                                                                                                    |
| 29 (P2) | building with bob · tejas kumar ibm · david jones-gilardi                                                                                                                                            | G (brand)           | Navigational               | **L** but collides with IBM "Build with Bob"                                             | home, `/about`                                                               | `Organization`/`Person` schema with `sameAs` (YouTube, GitHub, LinkedIn); disambiguation sentence                                                                                  |
| 30 (P3) | build app with ai · vibe coding livestream · build an app with ai live                                                                                                                               | YT                  | Entertainment / learning   | **M–H** on YouTube                                                                       | home                                                                         | Tagline "Watch two developers build a real app live with IBM Bob"; H2 "Spec coding vs vibe coding" (ep1 [t=2106](?t=2106))                                                         |

---

## 4. Recommended NEW pages (6)

All live under `/topics/<slug>` (hub pages). Each needs: an answer-first intro (≤60 words), `Updated <date>`, `BreadcrumbList` + `FAQPage` JSON-LD, embedded clips (`VideoObject` with `Clip` for the cited moments), links to every feeding episode, and an entry in `llms.txt`.

### 4.1 `/topics/ibm-bob`: flagship explainer (P1)

- **Title (50):** What Is IBM Bob? A Hands-On Guide From Real Builds
- **Meta (149):** What IBM Bob is, how its plan mode, Bob Review, Bob Shell and memory behave on a real project, and where it struggled, from five livestreamed builds.
- **H2 outline**
  1. What is IBM Bob? (definition. Cite [bob.ibm.com](https://bob.ibm.com/) and the GA date from the [IBM newsroom](https://newsroom.ibm.com/2026-04-28-introducing-ibm-bob-ai-development-partner-that-takes-enterprises-from-ai-assisted-coding-to-production-ready-software). On stream: "IBM's coding agent similar to Cursor, Claude Code, Codex" [TrJNkt1G6TA t=0](?t=0))
  2. What we built with it: Walfly in 5 episodes (one line + link each)
  3. What IBM Bob did well (plan mode questions [PSAbjcEsn-Q t=1665](?t=1665); web apps "does really well" [bkPj3b8icH0 t=3172](?t=3172); Bob Review caught real UX issues [t=2232](?t=2232); IDE and Shell sync [tH5-O5iKzM8 t=3552](?t=3552))
  4. Where it struggled (claimed Next.js 16 didn't exist [PSAbjcEsn-Q t=3831](?t=3831); mobile Expo is "a different beast" [bkPj3b8icH0 t=3172](?t=3172); a review suggested re-adding the removed prop [t=4849](?t=4849); suggested a docling-serve flag that didn't exist, per ep2)
  5. Which model does IBM Bob use? (cite IBM/press on routing; our note that you can't choose a model [bkPj3b8icH0 t=3202](?t=3202))
  6. Why IBM Bob asks for permission so often (enterprise, security-first default [PSAbjcEsn-Q t=3359](?t=3359), [t=3390](?t=3390); link [auto-approve docs](https://bob.ibm.com/docs/ide/features/auto-approving-actions))
  7. Is IBM Bob good? Our verdict so far (balanced, dated)
  8. FAQ
- **Fed by:** all 5 transcripts, with the timestamps above.

### 4.2 `/topics/ibm-bob-features-in-practice` (P1)

- **Title (55):** IBM Bob Plan Mode, Bob Review and Bob Shell in Practice
- **Meta (151):** How we used IBM Bob's plan mode, Bob Review with Fix with Bob, Bob Shell, memory and permission prompts to build a real app, with timestamped examples.
- **H2 outline**
  1. Plan mode: from a whiteboard diagram to numbered subtasks. Attach the diagram and ask Bob to explain it back ([PSAbjcEsn-Q t=1084](?t=1084)); multiple-choice questions edited inline ([t=1703](?t=1703)); subtasks with IDs, like spec coding ([t=2106](?t=2106)); the "let's discuss" habit ([tH5-O5iKzM8 t=1765](?t=1765)); `genesis.md` ([PSAbjcEsn-Q t=1533](?t=1533))
  2. Plan mode to agent mode: Bob switches itself ([PSAbjcEsn-Q t=3296](?t=3296), [t=3328](?t=3328))
  3. Bob Review, Bob Findings and "Fix with Bob" ([bkPj3b8icH0 t=2232](?t=2232), [t=2448](?t=2448)); one fix per session; check reviews against what you know ([t=4849](?t=4849))
  4. Bob Shell vs the Bob IDE (sync [tH5-O5iKzM8 t=3552](?t=3552); cycling modes / "advanced mode" [TrJNkt1G6TA t=3246](?t=3246))
  5. Memory: teaching Bob to search the web and use current versions ([PSAbjcEsn-Q t=3865](?t=3865)–[t=4045](?t=4045))
  6. Parallel tasks: move side work (memory updates, Git setup) into a separate Bob task so the main task isn't disrupted ([PSAbjcEsn-Q t=4085](?t=4085))
  7. Long sessions: clear context after ~100 turns ([tH5-O5iKzM8 t=3223](?t=3223))
  8. Permissions and approvals ([PSAbjcEsn-Q t=3359](?t=3359); outside-workspace approvals [bkPj3b8icH0 ~t=2130](?t=2130))
- **Fed by:** ep1, ep3, ep4 mainly.

### 4.3 `/topics/ibm-bob-vs-claude-code-cursor-codex` (P2, conditional)

- **Title (53):** IBM Bob vs Claude Code, Cursor and Codex: What We Saw
- **Meta (147):** Honest notes on IBM Bob next to Claude Code, Cursor and Codex from building a real app live: model choice, permissions, review, memory and context.
- **Caveat:** the transcripts support only observations, not a head-to-head benchmark. Keep the table to "what we observed in Bob" plus "what the vendor documents say" for the others, with citations. Evidence available:
  - Bob doesn't let you choose the model ([bkPj3b8icH0 t=3202](?t=3202))
  - Restrictive security by default ([PSAbjcEsn-Q t=3359](?t=3359))
  - Built-in review with Fix with Bob ([bkPj3b8icH0 t=2448](?t=2448))
  - Task lists are per session in Bob or Claude Code unless you add Beads ([tH5-O5iKzM8 t=1124](?t=1124))
  - Tejas lost accumulated context switching to Codex ([bkPj3b8icH0 t=1119](?t=1119))
  - Hosts frame Bob as "similar to Cursor, Claude Code, Codex" ([TrJNkt1G6TA t=0](?t=0))
- **Strongly recommended:** a future episode that runs the same task in Bob and one other agent. That would make this the strongest page on the site, since demand is G×12 and current results are thin templates.
- **H2 outline:** Short answer · How they differ in approach (IDE+shell vs CLI vs IDE) · Model choice · Permissions and safety defaults · Planning and spec workflow · Code review · Memory and context across sessions · Where each fits · FAQ.

### 4.4 `/topics/docling-audio-transcription` (P1)

- **Title (51):** Docling Audio Transcription: ASR, Whisper and Fixes
- **Meta (151):** Transcribe audio with open-source Docling's ASR pipeline and Whisper: hosted vs local, docling-serve, MLX Whisper on Mac, VTT output and common errors.
- **H2 outline**
  1. Can Docling transcribe audio? (yes, via the open-source ASR pipeline with Whisper; link [Docling ASR docs](https://docling-project.github.io/docling/examples/minimal_asr_pipeline/))
  2. Hosted Docling vs local Docling for audio (the "ASR capability gap" error, dated Aug 2026 [TrJNkt1G6TA t=716](?t=716); "built for Word, Excel, PowerPoint" [tH5-O5iKzM8 t=119](?t=119))
  3. Why docling-serve returned the same error for us ([TrJNkt1G6TA t=1547](?t=1547); "we have to actually write code, we can't use a server" [t=1734](?t=1734))
  4. The working setup: import Docling in Python as a sidecar ([tH5-O5iKzM8 t=244](?t=244), [t=343](?t=343), [t=411](?t=411))
  5. Which Whisper does Docling use? MLX on Apple silicon, Whisper Turbo ([TrJNkt1G6TA t=2057](?t=2057); [tH5-O5iKzM8 t=343](?t=343), [t=548](?t=548))
  6. VTT vs SRT: you probably just need timestamps ([TrJNkt1G6TA t=3278](?t=3278), [t=3820](?t=3820), [t=3851](?t=3851))
  7. Audio formats and errors: WebM parsing (ep2), "Unrecognized audio container, expected wav/mp3" ([eUZacfuVVDU t=5467](?t=5467)), sidecar "transient request failed" / port bind ([tH5-O5iKzM8 t=5277](?t=5277), [t=5310](?t=5310)); link the known GitHub issues
  8. Hosting Docling ASR as a stateless service (links to 4.5)
  9. FAQ
- **Fed by:** ep2, ep3, ep5.

### 4.5 `/topics/audio-chunking` (P1)

- **Title (51):** Audio Chunking for Speech-to-Text: 30s Chunks + VAD
- **Meta (156):** How to chunk long recordings for Whisper-style ASR: chunk length, voice activity detection, ordering chunks that arrive out of order, and stateless hosting.
- **H2 outline**
  1. Why chunk audio at all? (near-real-time updates [bkPj3b8icH0 t=484](?t=484); laptop overheating on long files, ep4 [t=1450](?t=1450); memory limits [eUZacfuVVDU t=2203](?t=2203); lose less on failure [tH5-O5iKzM8 t=892](?t=892))
  2. How long should chunks be? 30 s baseline + wait for a pause ([eUZacfuVVDU t=2318](?t=2318), [t=2349](?t=2349), [t=5397](?t=5397)); cite WhisperX's ~30 s VAD merge for external support
  3. Handling out-of-order chunks: sequence index, don't trust the client ([eUZacfuVVDU t=1686](?t=1686), [t=1898](?t=1898), [t=2243](?t=2243))
  4. Writing chunking requirements as outcomes in a PRD (ep5 [t=2404](?t=2404))
  5. An ephemeral ASR service: stores nothing ([eUZacfuVVDU t=1166](?t=1166)); deploy targets DigitalOcean / Render / Fly ([t=2694](?t=2694)); Daytona on-demand idea (ep4 [t=4734](?t=4734))
  6. Privacy and consent when recording conversations ([eUZacfuVVDU ~t=1441](?t=1441), [t=1529](?t=1529))
  7. What broke in the first test ([eUZacfuVVDU t=4803](?t=4803), [t=5467](?t=5467))
- **Fed by:** ep3, ep4, ep5.

### 4.6 `/topics/coordinating-coding-agents` (P1)

- **Title (53):** Coordinating Coding Agents: Beads, Agent Mail, GitHub
- **Meta (148):** How we run several coding agents at once: Beads for persistent tasks, MCP Agent Mail for messages and file reservations, GitHub Projects for humans.
- **H2 outline**
  1. Why agents need coordination (file clobbering [TrJNkt1G6TA t=956](?t=956); per-session task lists [tH5-O5iKzM8 t=1124](?t=1124))
  2. Beads / Beads Rust as persistent task memory (ep3 ~[t=976](?t=976)–[t=1124](?t=1124); checkpoints epic [t=4598](?t=4598), [t=4943](?t=4943))
  3. MCP Agent Mail: identities, messages, file reservations (ep3; ep4 David quote [t=904](?t=904))
  4. Adding humans: GitHub Projects + GitHub CLI ([eUZacfuVVDU t=226](?t=226), [t=329](?t=329)); "commit, sync and push" ([t=667](?t=667)); keep GitHub out of the agent-to-agent loop ([t=935](?t=935))
  5. Xavier and the "grill me" skill ([bkPj3b8icH0 t=626](?t=626), [t=761](?t=761); [tH5-O5iKzM8 t=4908](?t=4908)); meta harness ([bkPj3b8icH0 t=1119](?t=1119))
  6. Comparison table (reuse and extend ep5's)
  7. FAQ ("Beads vs GitHub Issues?" answered from ep5's table)
- **Fed by:** ep3, ep4, ep5.

Not recommended as new pages: KeyboardAvoidingView (one fix, strong incumbents; optimise ep4 instead) and Expo audio (optimise ep2).

---

## 5. Per-episode tweaks

Descriptions are ≤160 chars. The recommended YouTube title can mirror the site title (drop "with IBM Bob" if the channel name carries it).

### Ep 1: `planning-walfly-wearable-app-mvp-with-ibm-bob` (PSAbjcEsn-Q)

- **Title (47):** IBM Bob Plan Mode: Scoping a Real App MVP, Live
- **Description (148):** Watch IBM Bob's plan mode turn a whiteboard diagram into an MVP plan with clarifying questions and numbered subtasks, then build a working Expo app.
- **Primary keywords:** ibm bob plan mode, ibm bob spec driven development, ibm bob tutorial.
- **Extra FAQs**
  - _Does IBM Bob switch from plan mode to agent mode automatically?_ After the hosts approved the plan, Bob switched itself into agent mode to implement it. As David put it, plan mode is for planning, not code implementation. ([t=3296](?t=3296), [t=3328](?t=3328))
  - _Can I give IBM Bob an architecture diagram?_ Yes. They exported the whiteboard as a PNG, attached it to the prompt, and asked Bob to explain the diagram back before writing code. Plan mode confirmed it had read the diagram before asking questions. ([t=1051](?t=1051), [t=1084](?t=1084), [t=1665](?t=1665))
  - _How do I stop IBM Bob using outdated framework versions?_ Bob scaffolded older Next.js and React and insisted Next.js 16 didn't exist. The fix was telling it to update its memory to always search the web for the latest versions, which it saved for future sessions. ([t=3831](?t=3831), [t=3911](?t=3911), [t=4045](?t=4045))
  - _Is IBM Bob's plan mode spec-driven development?_ David described it as very similar to regular spec coding: the plan came back with subtasks that have IDs, unlike vibe coding. ([t=1797](?t=1797), [t=2106](?t=2106))

### Ep 2: `debugging-expo-audio-and-local-docling-transcription` (TrJNkt1G6TA)

- **Title (59):** Docling Audio Transcription and Expo Mic Fixes with IBM Bob
- **Description (153):** Hosted Docling had no ASR pipeline for audio, so Walfly moved to local Docling with Whisper. Plus Expo mic permissions, multipart uploads and VTT vs SRT.
- **Primary keywords:** docling asr, docling serve asr, docling saas, expo audio not working on ios.
- **Extra FAQs**
  - _What does Docling's "ASR capability gap" error mean?_ It came back after a successful upload: non-audio documents converted normally on that deployment, but transcription needed a deployment with the ASR pipeline enabled. It was not a payload problem. ([t=716](?t=716))
  - _Does docling-serve transcribe audio?_ In this session, docling-serve running locally in Docker returned the same ASR error. Tejas concluded they had to call Docling from code rather than through the server. ([t=1547](?t=1547), [t=1734](?t=1734))
  - _How can a coding agent reuse a pipeline I already built?_ David asked Bob for a gap analysis: what is missing compared with a project where the pipeline already worked. He then turned the gaps into a task list. ([t=1205](?t=1205))
  - _Does IBM Bob hide secrets in its output?_ David noticed the Bob IDE actively cuts out PII, though he hadn't checked Bob Shell. Treat this as an on-stream observation, not a guarantee. ([t=1164](?t=1164))

### Ep 3: `local-first-transcription-python-sidecar-and-coordinating-agents` (tH5-O5iKzM8)

- **Title (57):** Local Docling + Whisper Sidecar and Beads for Agent Teams
- **Description (155):** Walfly runs open-source Docling with Whisper Turbo in a Python sidecar next to Next.js and Expo, then coordinates IBM Bob agents with Beads and Agent Mail.
- **Primary keywords:** docling whisper, docling mac, python sidecar next.js, beads rust, mcp agent mail.
- **Extra FAQs**
  - _Is local Docling transcription fast on a Mac?_ David was surprised: Docling uses Apple silicon well, and even long recordings transcribed quickly on his Mac. ([t=548](?t=548))
  - _Do Bob Shell and the Bob IDE share sessions?_ A recent Bob release syncs them. David moved from Bob Shell back to the IDE and said it worked great. ([t=3552](?t=3552))
  - _When should I start a fresh chat with a coding agent?_ After around 100 turns, the hosts cleared context and started a new chat seeded with the current error, rather than pushing a long session further. ([t=3161](?t=3161), [t=3223](?t=3223))
  - _What is the "grill me" skill?_ It makes the agent question you until requirements are concrete. Tejas used it to define recording checkpoints, and Bob logged the result as a Beads epic. ([t=4908](?t=4908), [t=4943](?t=4943))

### Ep 4: `ai-code-review-and-expo-mobile-layout-fixes` (bkPj3b8icH0)

- **Title (59):** Bob Review vs Xavier and a KeyboardAvoidingView Fix in Expo
- **Description (148):** Bob Review and Xavier Review run on the same commits. Then a chat input floating above the iOS keyboard is fixed by removing keyboardVerticalOffset.
- **Primary keywords:** ibm bob code review, bob findings, keyboardavoidingview extra padding, keyboardverticaloffset.
- **H2 wording change:** "Debugging the keyboard…" becomes "Why is there extra space above the keyboard? Remove keyboardVerticalOffset={insets.top}". Add a 3-line before/after code block.
- **Extra FAQs**
  - _What is "Fix with Bob"?_ It's the one-click action on each item in the Bob Findings panel after a Bob Review. David applied findings one at a time, each in its own session. ([t=2232](?t=2232), [t=2448](?t=2448))
  - _Can you choose which model IBM Bob uses?_ Not during this episode. Tejas pointed to a mobile-specific model on Hugging Face and noted Bob doesn't let you choose the model. ([t=3202](?t=3202))
  - _Should you trust AI code review output?_ Check it. A later review told the team to re-add the exact prop they had removed to fix the keyboard bug, which made Tejas question the other points. ([t=4849](?t=4849), [t=4881](?t=4881))
  - _Does KeyboardStickyView from react-native-keyboard-controller work with Expo web?_ In Walfly it needed a CocoaPods reinstall and broke the web build, because the package is native-only. It also pushed the input off-screen via translateY. ([t=3389](?t=3389), [t=3542](?t=3542), [t=3819](?t=3819))

### Ep 5: `designing-audio-chunking-and-ephemeral-asr` (eUZacfuVVDU)

- **Title (60):** Audio Chunking and a Stateless Docling ASR Service in Docker
- **Description (155):** Walfly's plan: 30-second audio chunks that wait for a pause (VAD), sequence indexes for out-of-order chunks, and a stateless Docling ASR service in Docker.
- **Primary keywords:** audio chunking, whisper chunk length, ephemeral asr, docling docker.
- **Extra FAQs**
  - _What does "Unrecognized audio container, expected wav/mp3" mean in Docling?_ It appeared when the new ASR service processed a chunk. The chunk was in a container format the pipeline didn't accept, so it was logged as a format issue to fix next. ([t=5467](?t=5467))
  - _Where can you host a Docling ASR service?_ The PRD asked for a container easily deployable to DigitalOcean, Render or Fly.io. The team tested it locally first before deploying anywhere. ([t=2694](?t=2694), [t=2730](?t=2730), [t=4051](?t=4051))
  - _Why doesn't a chunk upload while someone is still talking?_ The rule is 30 seconds _and_ a pause. A chunk closes only once the speaker stops, so continuous speech delays the checkpoint. ([t=4803](?t=4803), [t=5397](?t=5397))
  - _What does "commit, sync and push" do with Beads?_ It's David's end-of-task ritual. The agent commits locally, syncs Beads, and pushes, which makes the final steps happen reliably. ([t=667](?t=667))

### Project: `/projects/walfly`

- **Title (54):** Walfly: Open-Source, Local-First Conversation Recorder
- **Add H2:** "An open-source alternative to Bee, Limitless and Plaud". Answer-first: Walfly is a DIY, self-hostable app (not hardware) that records on phone/web and transcribes locally with Docling + Whisper. Evidence: Bee as the inspiration and the privacy motive ([PSAbjcEsn-Q t=65](?t=65), [t=194](?t=194)); Apple's closed alternative (ep4 [t=198](?t=198)). Add a small honest comparison table (hardware? open source? where audio is processed?), citing vendor pages for competitor facts.

### Home and About

- **Home title (52):** Building with Bob: Build Real Apps Live with IBM Bob
- `/about`: the disambiguation sentence from section 1, plus host `Person` schema (`sameAs` GitHub/LinkedIn/YouTube) and a `CreativeWorkSeries` / `VideoObject` list.

---

## 6. GEO prompt list → target URL

These are prompts our content can answer honestly. Test each monthly in ChatGPT, Perplexity, Claude and AI Overviews, and log whether we're cited.

| #   | Prompt                                                                           | Target URL                                    |
| --- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| 1   | What is IBM Bob and is it any good?                                              | `/topics/ibm-bob`                             |
| 2   | Has anyone built a real app with IBM Bob? What was it like?                      | `/topics/ibm-bob`, `/projects/walfly`         |
| 3   | IBM Bob vs Claude Code: what's the difference?                                   | `/topics/ibm-bob-vs-claude-code-cursor-codex` |
| 4   | IBM Bob vs Cursor for building a React Native app                                | comparison page, ep4                          |
| 5   | Can I choose which model IBM Bob uses?                                           | `/topics/ibm-bob` (FAQ), ep4                  |
| 6   | How does IBM Bob's plan mode work?                                               | `/topics/ibm-bob-features-in-practice`, ep1   |
| 7   | How do I use IBM Bob for spec-driven development?                                | ep1, features page                            |
| 8   | Why does IBM Bob keep asking me to approve commands?                             | ep1, features page                            |
| 9   | What is Bob Review / Fix with Bob, and how good is it?                           | ep4, features page                            |
| 10  | What's the difference between Bob Shell and the Bob IDE?                         | features page                                 |
| 11  | How do I make IBM Bob remember to use the latest library versions?               | ep1, features page                            |
| 12  | How do I transcribe audio with Docling?                                          | `/topics/docling-audio-transcription`         |
| 13  | Does Docling support audio / MP3 / speech-to-text?                               | Docling hub, ep3                              |
| 14  | Docling says "ASR capability gap". How do I fix it?                              | ep2, Docling hub                              |
| 15  | Can hosted Docling (Docling for watsonx) transcribe audio?                       | ep2, Docling hub (dated)                      |
| 16  | Does Docling use Whisper, and does it use MLX on a Mac?                          | Docling hub, ep2                              |
| 17  | Should I output SRT or VTT from a transcription pipeline?                        | ep2                                           |
| 18  | How do I run a Python library like Docling from a Next.js app?                   | ep3 (Python sidecar)                          |
| 19  | How long should audio chunks be for Whisper transcription?                       | `/topics/audio-chunking`, ep5                 |
| 20  | How do I handle audio chunks arriving out of order?                              | audio-chunking hub, ep5                       |
| 21  | How do I design a stateless / ephemeral transcription service?                   | ep5, audio-chunking hub                       |
| 22  | How do I coordinate multiple AI coding agents without them overwriting files?    | `/topics/coordinating-coding-agents`, ep3     |
| 23  | What is Beads for coding agents, and Beads vs GitHub Issues?                     | agents hub, ep3, ep5                          |
| 24  | What is MCP Agent Mail?                                                          | agents hub, ep3                               |
| 25  | How do I use GitHub Projects with AI coding agents on a team?                    | ep5, agents hub                               |
| 26  | What is the "grill me" skill for coding agents?                                  | agents hub, ep3                               |
| 27  | Why is my React Native chat input floating above the keyboard?                   | ep4                                           |
| 28  | Why does my Expo app record audio on web but not iOS?                            | ep2                                           |
| 29  | Is there an open-source, local-first alternative to the Bee / Limitless pendant? | `/projects/walfly`                            |
| 30  | Why do AI coding agents struggle with mobile / Expo development?                 | ep4                                           |

---

## 7. Implementation checklist (site-wide GEO)

- **Structured data** on each page:
  - Episodes: `VideoObject` with `hasPart` `Clip` per chapter (key moments), `FAQPage`, `BreadcrumbList`
  - Hubs: `Article` with `about` entities: IBM Bob ([bob.ibm.com](https://bob.ibm.com/)), Docling, Expo
  - Hosts: `Person` with `sameAs`
- **Transcripts as HTML text** on episode pages (not collapsed behind JS) so passage retrieval can quote them; keep `?t=` deep links.
- **llms.txt**: one line per episode and hub, each with a one-sentence answer-first summary, canonical entity names, and the date.
- **Freshness**: show "Updated" on hubs and refresh `/topics/ibm-bob` after each episode, since new Bob releases are monthly.
- **Off-site**:
  - Rename the four duplicate YouTube titles and correct "Wallfly" / "Docling SAS" in chapters
  - Put the site URL for the matching hub in each video description
  - Answer the Docling ASR GitHub issues and relevant Reddit threads with a link to the specific timestamp or page, only where it genuinely helps
- **Measure**: Google Search Console queries per URL after 4–6 weeks. Promote any query with impressions but position > 10 to its own H2 or FAQ.

---

## 8. KillrCtx + new episodes (added 2026-09-30)

Scope: the four KillrCtx episodes (`data/episodes.json` #1–4) and the second Walfly episode (#6, `zLrhBlgXsiA`). **Numbering note:** `episodes.json` now numbers every episode globally (KillrCtx 1–4, Walfly 5–10). The "Ep 1–5" labels in sections 4–6 are the old Walfly-only numbers. To avoid ambiguity, this section names episodes by slug:

| Short | Slug                                                             | Video       | Date       |
| ----- | ---------------------------------------------------------------- | ----------- | ---------- |
| K1    | `killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob` | TvdoO55fG4g | 2026-06-20 |
| K2    | `adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob`           | fesh8hfeMjw | 2026-06-25 |
| K3    | `notebooklm-clone-setup-wizard-and-ai-workbench-backend`         | xAfx7I8pHFY | 2026-07-09 |
| K4    | `debugging-rag-backends-openrag-vs-ai-workbench`                 | hOpIIVHJheE | 2026-07-17 |
| W2    | `walfly-record-button-redesign-and-astra-db-setup`               | zLrhBlgXsiA | 2026-08-21 |

Evidence links below use `/episodes/<slug>?t=<seconds>`, with the short name as the link text.

### 8.1 Method (same as section 1)

- **Autocomplete:** about 3,800 Google queries (`client=firefox`, `hl=en&gl=us`) plus about 620 YouTube queries (`ds=yt`) returned about 5,460 unique suggestions. We ran 99 seeds: the 17 in the brief, the IBM Bob feature terms, and follow-ups found along the way (spec coding, agentic RAG, Astra DB, Vercel Blob, WebM, Caveman/RTK token savers). Each seed was expanded with a–z suffixes, question prefixes and modifiers (vs/alternative/tutorial/github/not working/reddit/example).
- **SERPs:** we inspected 12 by hand:
  - open source notebooklm alternative self hosted
  - notebooklm clone github next.js
  - openrag langflow docling opensearch
  - openrag sdk typescript
  - react flow mind map from LLM json
  - notebooklm mind map not working alternative
  - elevenlabs podcast generator from pdf
  - DataStax AI Workbench
  - astra db create collection vectorize
  - agentic rag vs traditional rag
  - ibm bob skills / custom modes / spec driven development
  - spec coding vs vibe coding
- **Grounding:** we read all five transcripts in full. Every recommendation cites a timestamp.

### 8.2 Entity hygiene for these episodes (fix first)

1. **"Build with Bob" vs "Building with Bob".** All four KillrCtx YouTube titles say "Build with Bob: NotebookLM Clone Part N". That is the exact name of IBM's own channel (section 1, issue 3), and the hosts also say "Build with Bob" on air (K2 [t=0](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=0)). Rename the videos to "Building with Bob" plus the episode keyword title (8.5).
2. **Project name.** On air and in auto-captions it's "Killer Context", "Killer CTX" or "killerctx". The repo is `TejasQ/killrctx`. Standardise on **KillrCtx**, and add "(pronounced 'killer context')" once on the project page so spoken-name searches still resolve. Right now `killer context` autocompletes only to "jeff the killer context", so the brand has no demand of its own yet. Every page has to carry the generic terms (NotebookLM clone / alternative).
3. **ASR spellings to fix in any displayed transcript or chapter:** "Open Rag"/"OpenRG" → **OpenRAG**; "Dockling"/"Duckling" → **Docling**; "Dockling SAS" → **hosted Docling (Docling for IBM watsonx)**; "K Lima"/"Kalema" → **Colima**; "Aster"/"Astrod" → **Astra DB**; "Wallfly" → **Walfly**; "Bobby Talk" is the actual skill name (keep it).
4. **Duplicate YouTube titles again.** W2 shares "Building with Bob: Walfly app, what?" with PSAbjcEsn-Q. KillrCtx parts 2–4 carry the generic "Mind-Map, again…" and "Part 4" titles. K2–K4 also have **no chapters**. Add chapters from the timestamps in 8.5, because YouTube key moments are what AI Overviews cite.
5. **AI Workbench naming.** Two similar product names cause trouble. Our product is **DataStax AI Workbench** (the open-source `datastax/ai-workbench` repo, v0.5 on stream: K3 [t=3344](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3344)). The `ai workbench` autocomplete (G×138) is dominated by **NVIDIA AI Workbench**, Vertex AI Workbench, Cloudera and others. Always write "DataStax AI Workbench (for Astra DB)" and never just "AI Workbench". Don't target the bare term.
6. **Dated caveats.**
   - AI Workbench is v0.5 and "not SaaS-ified yet" (K3 [t=2815](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2815)).
   - Bob Shell 1.0.4 → 1.0.6 changed the output noticeably (K4 [t=1010](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1010)).
   - Bob's YOLO/auto-approve controls moved in a June 2026 update (K2 [t=2148](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2148)).
   - State all three as "in June/July 2026…" with `dateModified`.

### 8.3 What the demand data says

- **"NotebookLM alternative" is a big, commercial cluster, and "open source / self-hosted / local" is a real sub-intent.** Signals:
  - `notebooklm alternative` G×78: …free, …reddit, …local, …local llm, …offline, …ollama, …self hosted, …open source, …github, …docker, …for linux, …for podcast, …mind map tools, …with api
  - open-source phrasings G×27: `open source notebooklm`, `…clone`, `…github`, `…podcast`, `…reddit`, `is there an open source notebooklm`, `open source version of notebooklm`, `how to deploy an open source version of notebooklm`
  - `self hosted notebooklm` G×11, incl. `can you self host notebooklm` and `is there a self hosted version of notebooklm`
  - `local notebooklm` G×13, incl. `how to build a local notebooklm`
  - `notebooklm clone` G×11 + YT, incl. `notebooklm clone github` and `notebooklm clone open source`
  - `build notebooklm from scratch` G + YT

  **SERP:** XDA (5+ articles), KDnuggets, Medium, openalternative.co and pinggy. Every listicle names **Open Notebook** (about 33k GitHub stars), SurfSense or Deta Surf. The GitHub "notebooklm-clone" results are small hobby repos. **Nobody offers a build-along on video explaining the RAG backend choice.** Our angle is "how it's built, on an open RAG stack", not "the best alternative". Stay honest: KillrCtx is a developer-learner tool (K4 [t=4530](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4530)), not a polished end-user app.

- **The NotebookLM mind map has heavy how-to and troubleshooting demand** (G×48, YT×7). Examples: `notebooklm mind map not working / not showing / missing / edit / export / to xmind / to obsidian / prompt / expand all / extractor`. The SERP pain point is that NotebookLM's map is **read-only and not editable** (XDA, Atlas, MindMap AI). KillrCtx's map has collapsible nodes, drill-down conversations, and horizontal/vertical layouts (K3 [t=711](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=711)–[t=808](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=808)). That is a genuine, differentiated answer for the developer sub-intent: `ai mind map generator open source / github / from pdf` (G×8) and `react flow mind map` / `mind map react flow / library / component` (G×6, YT). Those developer SERPs are React Flow's own tutorial plus small GitHub repos, and **none of them is LLM-driven from RAG**.
- **OpenRAG is new, and the name is ours to take.** `openrag` G×54: …github, …docs, …install, …docker compose, …sdk, …mcp / mcp server, …ollama, …langflow, …opensearch, …architecture, …tutorial, …demo, …on watsonx.data, …ibm, …skill, …vs, `openrag vs opensearch`, `how to install openrag`. The SERP is the langflow-ai GitHub repo, **about ten forks**, PyPI, docs.openr.ag, and one scraped "install and architecture" page. **There is no independent explainer and no first-hand app build.** That makes it the lowest-difficulty head term in this batch. Note the collision: "OpenRAG" is also an academic benchmark/dataset (`openrag bench`, `openrag paper`), so disambiguate in the first sentence.
- **Supporting RAG terms:**
  - `langflow rag` G×11 + YT×6 (…pipeline, …chatbot, …agent, …tutorial, …ollama)
  - `docling rag` G×13 + YT×3
  - `opensearch rag` G×19
  - `docling langflow` / `langflow docling serve` (G + YT)
  - `agentic rag vs rag / traditional / normal / classic` G×15 + YT; the SERP is vendor blogs (NVIDIA, Couchbase, PingCAP), all theoretical
  - `can you mix embedding models` (G)

  We have first-hand answers to the last two. Agentic vs traditional RAG: K1 [t=874](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=874). Multiple embedding models in one index: K1 [t=644](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=644), [t=779](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=779). `rag chatbot next.js` and `next.js rag` return no Google autocomplete (one YT), so don't target them.

- **Podcast-from-sources terms have volume, but our evidence is thin.**
  - Volume: `pdf to podcast` G×82 + YT×6 (incl. `elevenlabs pdf to podcast`), `elevenlabs podcast` G×21 + YT×5 (…generator, …api, …tutorial), `notebooklm podcast alternative` G×3, `notebooklm podcast open source`, `ai podcast generator open source`.
  - SERP: ElevenLabs' own Create Podcast API, Podcastfy, PDF2Pod.
  - Evidence: the stream only demos the feature and a cloned host voice (K2 [t=422](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=422), [t=453](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=453)).
  - Verdict: an H2 on the build guide, not its own page. P3 until an episode actually builds or explains the podcast pipeline.
- **Astra DB has moderate navigational/how-to demand.** `astra db` G×82 + YT×6 (…create collection, …collection, …vectorize, …api endpoint, …application token, …vector search, …free tier, …langflow, `astra db vs pinecone/qdrant/milvus/mongodb/chromadb`). `astra db data api`, `astra db collections` and `ai workbench datastax` return **no** autocomplete. DataStax docs own the SERP. W2 has one strong first-hand moment: Bob built the collection through the Data API without being told how (W2 [t=5577](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5577)). Use it as an episode H2 and on `/projects/walfly`, not a new page.
- **Spec-driven development is the largest cluster these episodes newly support.** `spec driven development` G×279 + YT×10; `spec coding` G×23 incl. `spec coding vs vibe coding`; `ibm bob spec driven development` already in section 3 row 4. The SERP is Kiro, GitHub Spec Kit, Augment, InfoWorld, RedMonk, plus heidloff.net and Medium for Bob. KillrCtx has the richest spec-coding footage on the site: a custom mode and skill, numbered requirement IDs, a validate step, and Bob choosing spec mode unprompted (K2 [t=868](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=868)–[t=1409](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1409); K3 [t=2369](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2369)–[t=2493](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2493)).
- **IBM Bob terms newly supported:**
  - `bob shell` about 25 relevant variants: …auto approve, …skills, …mcp, …v2, …update, …login, `how to use (ibm) bob shell`
  - `ibm bob vs` G×24, now incl. …cline, …roo code, …vscode, …devin, …gemini, …claude code reddit
  - `ibm bob skills` (…github, …md), `ibm bob mcp` G×5, `ibm bob context window`, `ibm bob v2`, `ibm bob yolo`, `ibm bob auto approve`, `ibm bob subagents`, `ibm bob login`, `ibm bob agents.md`, `ibm bob security`

  Most are single-suggestion (small but real). No new pages: route them to the existing hubs (8.7).

- **Token-saving skills are hot adjacent terms:** `caveman skill` G×136 and `rtk token` G×38 (…saver, …killer, …github). K3 mentions **Caveman / "Bobby Talk"** for Bob (K3 [t=1732](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1732)) and **RTK** for git output (K3 [t=4538](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4538)). These are one-liners, so give them FAQ answers on K3 and the features hub.
- **Don't target:**
  - `notebooklm mind map download / login / ipad` (Google's product support)
  - bare `ai workbench` (NVIDIA)
  - `colima` (a Mexican state dominates the results)
  - `record button` (hardware/Zoom/iPhone intent; `record button ui/design` has a single suggestion each)
  - `webm to mp4` G×228 (converter tools; only `convert webm to mp4 javascript` is close, and our evidence is a one-line "browser can't record MP4", W2 [t=5256](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5256))
  - `vercel blob` G×147 (Vercel docs own it)
  - `llm as a judge bias` G×3 (the K2 eval tangent, [t=4264](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4264), is a teaser, not a tutorial)

### 8.4 Keyword map additions (continues section 3)

| #       | Keyword cluster                                                                                                                                                                                              | Signal            | Intent                   | Difficulty + why                                                                                | Target URL                                                                       | Primary on-page actions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 31 (P1) | open source notebooklm · open source notebooklm alternative · self hosted notebooklm · local notebooklm · notebooklm alternative self hosted / github / docker / ollama · is there an open source notebooklm | G×50+, YT         | Commercial investigation | **M**: XDA/KDnuggets listicles all name Open Notebook; no build-along or architecture explainer | **`/projects/killrctx`** (new project page, same template as `/projects/walfly`) | Title (57): "KillrCtx: Open-Source, Self-Hosted NotebookLM Alternative". Answer-first: what it does, that it's self-hosted on OpenRAG or DataStax AI Workbench, and that it's aimed at developers ([K4 t=4530](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4530)). Feature table vs NotebookLM (sources, chat with citations, mind map, podcast, outline/Q&A/summary). Honest "vs Open Notebook" line: those are end-user apps, KillrCtx is a thin Next.js front end on a RAG backend ([K1 t=1005](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1005)). `SoftwareSourceCode` schema with `codeRepository`. |
| 32 (P1) | notebooklm clone · notebooklm clone github · notebooklm clone open source · build notebooklm from scratch · how to build a local notebooklm · how to deploy an open source version of notebooklm             | G×15, YT          | How-to                   | **L**: GitHub hobby repos only                                                                  | **NEW** `/topics/build-notebooklm-clone` (8.6.1)                                 | Architecture diagram as HTML text (ingest vs query flow); 4-episode build log; "clone → env → `npm run init`" quick start                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 33 (P1) | openrag · what is openrag · openrag github / docs / install / docker compose · openrag architecture · openrag tutorial · openrag demo                                                                        | G×30, YT×2        | Informational / how-to   | **L**: repo + forks + docs only; name collides with an academic benchmark                       | **NEW** `/topics/openrag` (8.6.2)                                                | First sentence disambiguates: "OpenRAG, the open-source RAG platform from the Langflow team that packages Langflow, Docling and OpenSearch". Cite the [repo](https://github.com/langflow-ai/openrag) and [docs](https://docs.openr.ag/quickstart/). The diagram walk-through is at [K1 t=679](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=679).                                                                                                                                                                                                                                                                          |
| 34 (P1) | openrag sdk · openrag mcp / mcp server · openrag skill · openrag langflow · openrag opensearch · openrag vs opensearch                                                                                       | G×8               | How-to / comparison      | **L**                                                                                           | `/topics/openrag` H2s                                                            | H2 "Using the OpenRAG TypeScript SDK from Next.js" (SDK → API → Langflow flows, [K1 t=974](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=974); SDK is TS/Python + MCP, [t=1005](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1005)). H3 "An OpenRAG SDK skill for your coding agent" ([K1 t=2208](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2208)). FAQ "OpenRAG vs OpenSearch?": OpenSearch is the vector store _inside_ OpenRAG.                                                                                                                          |
| 35 (P2) | langflow rag · langflow rag pipeline / chatbot / agent · docling rag · docling langflow · langflow docling serve · opensearch rag                                                                            | G×45, YT×12       | How-to                   | **M**: Langflow/IBM docs, YouTube tutorials                                                     | `/topics/openrag`                                                                | H2 "How Langflow, Docling and OpenSearch divide the work" (Docling converts to Markdown/JSON, [K1 t=745](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=745); vectors in OpenSearch, [t=812](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=812); agent uses everything as tools, [t=843](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=843))                                                                                                                                                                                                                      |
| 36 (P2) | agentic rag vs rag / traditional rag / normal rag · can you mix embedding models                                                                                                                             | G×16, YT          | Informational            | **M**: vendor blogs (NVIDIA, Couchbase), all theory                                             | `/topics/openrag` FAQ + K1                                                       | Quote David's one-line distinction ([K1 t=874](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=874), [t=912](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=912)). FAQ "Can one index hold vectors from different embedding models?": yes in OpenRAG, which stores which model made each vector ([t=644](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=644), [t=779](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=779), [t=874](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=874))                      |
| 37 (P1) | react flow mind map · mind map react library / component · ai mind map generator open source / github / from pdf · mind map from pdf ai                                                                      | G×14, YT          | How-to                   | **L–M**: React Flow tutorial + small repos; no LLM/RAG-driven example                           | **NEW** `/topics/ai-mind-map-react-flow` (8.6.3)                                 | Lead with the before/after (markdown outline → React Flow map); include the prompt rules that fixed it (hierarchy, >1 nesting level, strip citations/JSON)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 38 (P2) | notebooklm mind map · notebooklm mind map not working / edit / export / expand all · notebooklm alternative mind map tools                                                                                   | G×48, YT×7        | Troubleshooting / alt    | **M–H**: Google support + XDA; "read-only map" is the stated pain                               | mind-map guide (FAQ) + `/projects/killrctx`                                      | FAQ "Can you edit or drill into a NotebookLM-style mind map?" answered with KillrCtx's drill-down conversations ([K3 t=744](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=744)). Don't claim to fix Google's product.                                                                                                                                                                                                                                                                                                                                                                                                              |
| 39 (P3) | pdf to podcast · elevenlabs podcast generator · notebooklm podcast alternative / open source · ai podcast generator open source                                                                              | G×90+, YT×11      | Commercial / how-to      | **H**: ElevenLabs, Podcastfy, many tools                                                        | build guide H2 + K2                                                              | One H2: "Podcasts from your sources with ElevenLabs": the script comes from agentic RAG ([K2 t=486](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=486)), with a cloned host voice ([t=453](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=453)). Link ElevenLabs' Create Podcast API. No page of its own until we have implementation footage.                                                                                                                                                                                                                                                                     |
| 40 (P2) | spec driven development · spec coding · spec coding vs vibe coding · ibm bob spec driven development · ibm bob custom modes · ibm bob skills (md / github)                                                   | G×300+, YT×12     | How-to / comparison      | **M**: Kiro, Spec Kit, InfoWorld; Bob-specific = heidloff + Medium                              | **NEW** `/topics/spec-driven-development-ibm-bob` (8.6.4)                        | Show the real `specs/` folder workflow; balanced "when vibing is fine" H2 (K4 [t=1319](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1319)); link [Bob custom modes docs](https://bob.ibm.com/docs/ide/configuration/custom-modes)                                                                                                                                                                                                                                                                                                                                                                                                         |
| 41 (P2) | datastax ai workbench · ai workbench astra · openrag vs ai workbench · astra db rag                                                                                                                          | no AC (brand-new) | Informational            | **L** (no demand yet; GEO value)                                                                | `/topics/openrag` H2 + K3, K4                                                    | H2 "OpenRAG vs DataStax AI Workbench as a RAG backend" (Workbench adds agents + knowledge bases on Astra DB, [K3 t=2729](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2729); v0.5 and self-hosted only, [t=2815](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2815), [t=3344](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3344); env-var-reference config friction, [K4 t=3774](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3774)). Dated, balanced.                                                                                                                  |
| 42 (P2) | astra db create collection · astra db vectorize · astra db api endpoint · astra db application token · astra db serverless · astra db vector search                                                          | G×12, YT          | How-to                   | **M–H**: DataStax docs                                                                          | W2 + `/projects/walfly`                                                          | W2 H2 "Creating an Astra DB vector collection with vectorize via the Data API" ([W2 t=896](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=896), [t=960](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=960), [t=1493](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1493), [t=2121](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2121)); FAQ "Do I set a dimension with vectorize?" ([t=1921](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1921)). Replaces row 27's "don't target" for the collection sub-intent only.                                                      |
| 43 (P2) | bob shell auto approve · ibm bob yolo · ibm bob auto approve · bob shell update / v2 · bob shell login · how to use bob shell                                                                                | G×10              | How-to / troubleshooting | **L**: bob.ibm.com docs                                                                         | `/topics/ibm-bob-features-in-practice` (refresh, 8.9)                            | Update row 6/8 answers with Shift+Tab / YOLO in Bob Shell ([K4 t=706](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=706)), "approve for this task" ([K3 t=3376](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3376)), auto-upgrade ([K4 t=940](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=940))                                                                                                                                                                                                                                                                                                       |
| 44 (P2) | ibm bob skills · bob shell skills · ibm bob custom modes · ibm bob mcp · ibm bob agents.md · ibm bob context window                                                                                          | G×12              | How-to                   | **L**                                                                                           | features hub + spec guide                                                        | Real skill examples: project-level spec-coding skill ([K1 t=1681](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1681)), OpenRAG SDK skill ([t=2208](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2208)), Bobby Talk ([K3 t=1732](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1732)), devrel coding-style skill ([t=2211](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2211))                                                                                                                                                                    |
| 45 (P2) | ibm bob vs claude code · …reddit · ibm bob vs cline / roo code / vscode · ibm bob v2                                                                                                                         | G×24              | Comparison               | **L–M** (as row 3)                                                                              | `/topics/ibm-bob-vs-claude-code-cursor-codex` (refresh)                          | Add the K2/K3 task-list and parallelism observations; add the VS Code-fork fact ([K3 t=1839](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1839)); quote David's "on par with Claude Code" with his stated IBM bias ([K3 t=3938](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3938), [t=3969](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3969))                                                                                                                                                                                                                                      |
| 46 (P3) | caveman skill · caveman skill claude / cursor / copilot · rtk token saver · rtk token killer                                                                                                                 | G×170             | How-to                   | **M**: GitHub + blogs; our evidence is one mention each                                         | K3 FAQ + features hub FAQ                                                        | FAQ "How do you cut output tokens in IBM Bob?": Bobby Talk (Caveman-inspired skill) + RTK for git output ([K3 t=1732](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1732), [t=4538](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4538))                                                                                                                                                                                                                                                                                                                                                                      |
| 47 (P3) | docling serve not running · openrag ingest failed · uvx openrag                                                                                                                                              | SERP (issues)     | Troubleshooting          | **L**                                                                                           | K4 + `/topics/openrag` H2                                                        | H3 "Every ingest failed: docling-serve wasn't running" ([K4 t=3965](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3965), [t=4103](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4103), [t=4165](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4165)); `uvx openrag` vs `make` ([K2 t=4390](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4390))                                                                                                                                                                                                                                               |
| 48 (P3) | expo file system web · expo audio upload multipart · expo record audio web vs native                                                                                                                         | G×2               | Troubleshooting          | **M–H** (as row 16)                                                                             | W2 FAQ                                                                           | FAQ "Why does my Expo upload work on iPhone but not web?": expo-file-system has no web support, so branch by platform and send a real Blob ([W2 t=2562](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2562), [t=2629](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2629))                                                                                                                                                                                                                                                                                                                                                |
| 49 (P3) | killrctx · killer context app                                                                                                                                                                                | no AC             | Navigational             | **L**                                                                                           | `/projects/killrctx`, home                                                       | `sameAs` to the GitHub repo; spoken-name alias in copy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### 8.5 Per-episode primary keywords (the 5 new episodes)

Titles ≤60 and descriptions ≤160, same rules as section 5. Each episode also needs YouTube chapters (K2–K4 have none).

#### K1: `killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob` (TvdoO55fG4g)

- **Title (52):** KillrCtx: An Open-Source NotebookLM Clone on OpenRAG
- **Description (130):** Meet KillrCtx, a self-hosted NotebookLM clone: how OpenRAG wires Langflow, Docling and OpenSearch, then a first IBM Bob fix, live.
- **Primary keywords:** open source notebooklm clone, self hosted notebooklm, what is openrag, openrag langflow docling opensearch, agentic rag vs traditional rag.
- **Extra FAQs**
  - _What is KillrCtx?_ A fully open-source, self-hosted NotebookLM: you create notebooks, add sources, chat with citations and generate a mind map, summary, outline, Q&A or podcast. ([t=281](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=281), [t=417](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=417))
  - _How does OpenRAG keep each notebook's sources separate?_ Creating a notebook automatically creates an OpenRAG knowledge filter, so chat and note generation only see that notebook's documents. ([t=1299](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1299), [t=1338](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1338))
  - _Why did a vague prompt make the UI worse?_ "Fix the headers" made Bob change the padding twice. It only aligned the panels once told the select component was the cause and to give all three headers the same fixed height. ([t=1822](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1822), [t=2032](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2032))
- **Chapters:** already present (8). Rename "Exploring Killer Context" to "Exploring KillrCtx".

#### K2: `adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob` (fesh8hfeMjw)

- **Title (50):** Adding a React Flow Mind Map to a NotebookLM Clone
- **Description (150):** IBM Bob picks React Flow, writes a spec, and turns a markdown outline into a visual mind map in KillrCtx, plus ElevenLabs podcasts and LLM-judge bias.
- **Primary keywords:** react flow mind map, ai mind map generator open source, notebooklm mind map, spec coding ibm bob, elevenlabs podcast.
- **Extra FAQs**
  - _Which library should you use for a mind map in Next.js?_ Bob recommended React Flow first and D3 second. The hosts chose React Flow partly because Langflow's canvas is built on it. ([t=995](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=995), [t=1026](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1026))
  - _Why was the first AI mind map flat and full of junk?_ The map mirrors whatever hierarchy the LLM returns, and the old prompt was minimal. The fix was a prompt that asks for real hierarchy with more than one level of nesting and strips leaked citations, JSON fragments and search queries. ([t=3393](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3393), [t=3525](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3525), [t=3757](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3757))
  - _Can IBM Bob run to-dos in parallel?_ Asked to do all tasks in parallel, Bob batched them sensibly: it installed React Flow and built the renderer first. ([t=2022](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2022), [t=2054](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2054))
- **Chapters to add:**
  - 0:00 Recap
  - 2:05 KillrCtx on OpenRAG
  - 7:02 ElevenLabs podcast demo
  - 9:47 Mind map is just markdown
  - 13:16 Asking Bob for a library
  - 16:35 React Flow
  - 18:47 Spec coding the feature
  - 26:29 Tailwind review
  - 33:10 Parallel tasks
  - 44:04 First mind map
  - 56:33 Fixing the prompt
  - 1:05:20 Working map
  - 1:10:32 LLM judge bias teaser

#### K3: `notebooklm-clone-setup-wizard-and-ai-workbench-backend` (xAfx7I8pHFY)

- **Title (54):** NotebookLM Clone Setup Wizard + DataStax AI Workbench
- **Description (142):** KillrCtx gains an AI Workbench on Astra DB backend and mind-map drill-down, then a spec-coded npm run init wizard that finds Docker or Colima.
- **Primary keywords:** datastax ai workbench, openrag vs ai workbench, spec driven development ibm bob, notebooklm mind map drill down, ibm bob v2.
- **Extra FAQs**
  - _Should an open-source app bundle its RAG backend?_ The hosts decided not to. KillrCtx stays a lean front end that asks for an OpenRAG and/or AI Workbench URL and key, and the wizard installs a backend only if you have none. ([t=1609](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1609), [t=1657](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1657))
  - _Which model does IBM Bob use?_ David's on-stream answer: a combination (sometimes Granite, some Anthropic), and it isn't exposed to you. Pair this with IBM's official routing statement. ([t=2145](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2145))
  - _How do you cut token costs with coding agents?_ David runs the Bobby Talk skill (inspired by Caveman) to shorten output, and RTK to trim git command output. ([t=1732](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1732), [t=4538](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4538))
  - _Why add command-line flags to an interactive setup wizard?_ So a coding agent can run setup non-interactively. ([t=4407](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4407); confirmed in K4 [t=4699](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4699))
- **Chapters to add:**
  - 0:00 Intro
  - 2:38 AI Workbench backend
  - 11:51 Mind-map drill-down
  - 14:03 Querying event data
  - 22:50 Developer experience goal
  - 26:49 Bundle or not?
  - 28:52 Bobby Talk
  - 31:10 Writing the spec
  - 44:48 AI Workbench vs Astra DB
  - 1:00:00 Docker/Colima detection
  - 1:10:14 Task lists
  - 1:19:04 Testing npm run init
  - 1:29:18 Context wiki

#### K4: `debugging-rag-backends-openrag-vs-ai-workbench` (hOpIIVHJheE)

- **Title (58):** Debugging RAG Backends: OpenRAG vs AI Workbench Onboarding
- **Description (153):** Finishing KillrCtx's MVP: read-only offline mode, a gated setup wizard, four parallel Bob Shell agents, and a docling-serve outage behind failed ingests.
- **Primary keywords:** openrag docling serve, openrag ingest failed, bob shell parallel agents, ibm bob yolo, open source notebooklm alternative.
- **Extra FAQs**
  - _Why did every source fail to ingest in OpenRAG?_ docling-serve wasn't running, so OpenRAG couldn't convert anything. Starting it (e.g. via `uvx openrag`) fixed it, and the app now surfaces the upstream error. ([t=3965](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3965), [t=4103](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4103), [t=4165](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4165))
  - _How do you run several Bob Shell agents at once?_ Tejas opened multiple Bob Shell tabs on orthogonal tasks (header fix, embedder default, URL retry, error details), renamed each session, and let four run concurrently. ([t=2244](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2244), [t=3260](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3260), [t=3392](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3392))
  - _What happens to my notebooks if the RAG backend goes down?_ KillrCtx polls backend health and switches affected notebooks to read-only. Saved notes and podcasts stay available from the local database. ([t=286](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=286), [t=389](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=389))
- **Chapters to add:**
  - 0:00 Intro
  - 3:38 Backend health + read-only mode
  - 8:52 Fresh clone
  - 11:15 Workbench offline bug
  - 12:59 Bob Shell 1.0.6
  - 31:08 Onboarding gap
  - 37:24 Parallel agents
  - 44:57 Mock embedder 502
  - 58:08 Creating an Astra DB database
  - 1:03:58 Back to OpenRAG
  - 1:06:05 docling-serve was down
  - 1:10:30 Using it to learn
  - 1:13:19 Supporting multiple backends
  - 1:20:05 Next project: Walfly

#### W2: `walfly-record-button-redesign-and-astra-db-setup` (zLrhBlgXsiA)

- **Title (55):** Record Button UX and Astra DB Vector Setup With IBM Bob
- **Description (150):** Walfly gets a pulsing red record button, then Bob creates an Astra DB collection with vectorize via the Data API. Upload and Docling errors, debugged.
- **Primary keywords:** astra db create collection, astra db vectorize, record button ui, expo audio upload web, docling saas transcription.
- **Extra FAQs**
  - _How should a record button show it's recording?_ Bob offered shape shift, pulsing ring and color inversion. The hosts settled on a solid red circle that pulses in opacity, not size, with no inner glyph. ([t=425](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=425), [t=551](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=551), [t=658](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=658), [t=693](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=693))
  - _Which embedding model does Astra DB vectorize use?_ It defaults to NVIDIA-hosted models; Bob checked IBM docs and chose NV-Embed-QA E5-v5. No dimension field is needed. ([t=1691](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1691), [t=1790](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1790), [t=1921](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1921))
  - _Why did hosted Docling transcription keep failing?_ In this session, Bob invented a `transcribe` endpoint, the API key had expired (keys have a TTL), and the browser recorded WebM/OGG, which the service rejected. Treat this as a dated observation. ([t=3832](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3832), [t=4652](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4652), [t=4750](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4750), [t=5256](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5256))
  - _Should dev uploads go to Vercel Blob?_ They made storage switchable: an empty `BLOB_READ_WRITE_TOKEN` writes to the OS temp dir, and a set token uses Vercel Blob. ([t=2788](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2788), [t=2822](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2822), [t=2862](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2862))
- **Chapters:** already present. Fix "Wallfly" to "Walfly" and rename the video (duplicate of PSAbjcEsn-Q's title).

### 8.6 Recommended NEW guide pages (4)

Same requirements as section 4: answer-first intro, `Updated`, `BreadcrumbList` + `FAQPage`, `Clip`s, links to every feeding episode, and an `llms.txt` entry. Also create **`/projects/killrctx`** (row 31) as the commercial "alternative" page, so the build guide can stay how-to.

#### 8.6.1 `/topics/build-notebooklm-clone` (P1)

- **Title (55):** How to Build an Open-Source NotebookLM Clone (KillrCtx)
- **Meta (145):** How we built KillrCtx, a self-hosted NotebookLM alternative: OpenRAG for RAG, a React Flow mind map, ElevenLabs podcasts and a one-command setup.
- **H2 outline**
  1. What a NotebookLM clone needs: sources, grounded chat with citations, and generated notes. Recap of NotebookLM itself ([K1 t=62](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=62), [t=125](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=125)); what KillrCtx does ([t=281](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=281), [t=417](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=417))
  2. The architecture: a thin Next.js app on a RAG backend. SDK → API ([K1 t=974](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=974)); "a thin wrapper around OpenRAG" ([t=1005](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1005)); Next.js ([t=1037](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1037)); local SQL-like store synced to OpenRAG ([t=2139](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2139))
  3. One notebook = one knowledge filter: filters per notebook ([K1 t=1299](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1299); [K2 t=227](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=227)); cascade deletes ([K2 t=359](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=359))
  4. Picking models at runtime: the model picker via the SDK ([K1 t=2208](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2208)); AI Workbench agents instead of models ([K3 t=431](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=431))
  5. Generated notes: summary, outline, Q&A and mind map (async, in parallel, [K1 t=448](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=448); outline formatting, [K2 t=486](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=486)–[t=555](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=555); formatting pass, [K3 t=611](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=611)). Link to 8.6.3.
  6. Podcasts from your sources with ElevenLabs ([K2 t=422](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=422), [t=453](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=453), [t=486](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=486)); link the [ElevenLabs Create Podcast API](https://elevenlabs.io/docs/api-reference/studio/create-podcast) for the "how"
  7. Swappable backends: OpenRAG or DataStax AI Workbench ([K3 t=158](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=158)–[t=431](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=431)); why there's no universal RAG API ([K4 t=4451](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4451), [t=4486](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4486))
  8. Getting it running locally: `npm run init`. Don't bundle the backend ([K3 t=1609](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1609)); the wizard spec ([t=1870](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1870)); Docker/Colima detection ([t=3600](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3600), [t=4963](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4963)); gate launch until at least one backend is configured ([K4 t=2460](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2460)); flags so an agent can run it ([K4 t=4699](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4699))
  9. Staying useful offline: read-only mode ([K4 t=286](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=286), [t=389](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=389))
  10. Hosting: the front end deploys anywhere, the backend is the hard part ([K3 t=2946](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2946), [t=3009](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3009))
  11. FAQ, including "Is there an open-source NotebookLM?" (name Open Notebook and SurfSense too, to stay balanced) and "Can I self-host NotebookLM?" (no; Google's is SaaS only, so use an open alternative)
- **Fed by:** K1–K4.

#### 8.6.2 `/topics/openrag` (P1)

- **Title (56):** What Is OpenRAG? Langflow, Docling and OpenSearch in One
- **Meta (147):** OpenRAG explained from a real build: how Langflow, Docling and OpenSearch fit, the TypeScript SDK, agentic RAG, notebook filters and common errors.
- **H2 outline**
  1. What is OpenRAG? It packages Docling, Langflow and OpenSearch into one install ([K1 t=542](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=542), [t=580](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=580)); "more than a wrapper", with an SDK ([t=644](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=644)); cite the [repo](https://github.com/langflow-ai/openrag). One disambiguation line against the OpenRAG benchmark.
  2. How Langflow, Docling and OpenSearch divide the work: ingestion flow vs query flow ([K1 t=679](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=679)); Docling → Markdown/JSON ([t=745](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=745)); vectors in OpenSearch ([t=812](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=812)); tools-using agent ([t=843](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=843)); plain-English recap ([K2 t=159](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=159))
  3. Agentic RAG vs traditional RAG ([K1 t=874](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=874), [t=912](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=912))
  4. Embedding models: switch at runtime and mix in one index ([K1 t=644](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=644), [t=779](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=779), [t=874](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=874))
  5. Using the OpenRAG TypeScript SDK from Next.js: filters, cascade deletes, model lists ([K1 t=974](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=974), [t=1299](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1299); [K2 t=227](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=227), [t=359](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=359)); give your coding agent an SDK skill ([K1 t=2208](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2208), [t=2242](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2242)); link [docs.openr.ag](https://docs.openr.ag/quickstart/)
  6. Running it: `uvx openrag` vs `make` from source ([K2 t=4390](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4390)); OpenSearch warm-up 500/503 health checks ([K2 t=4489](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4489)); default port 3000 ([K4 t=1350](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1350))
  7. Troubleshooting: every ingest fails because docling-serve isn't running ([K4 t=3965](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3965), [t=4103](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4103), [t=4165](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4165)); API key needed for SDK calls ([K4 t=3060](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3060))
  8. OpenRAG vs DataStax AI Workbench on Astra DB: Workbench adds agents plus knowledge bases that create Astra artifacts for you ([K3 t=2688](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2688)–[t=2760](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2760)); self-hosted only, v0.5 ([t=2815](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2815), [t=3344](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3344)); config friction and mock embedder ([K4 t=2697](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2697), [t=3774](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3774), [t=4399](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4399)). Dated and balanced.
  9. Beyond notebooks: OpenRAG as the policy source for an LLM judge ([K2 t=4328](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4328), [t=4520](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4520))
  10. FAQ ("OpenRAG vs OpenSearch?", "Does OpenRAG have an MCP server?" (SDK/MCP mention at [K1 t=1005](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1005); link docs for details), "Is OpenRAG open source?")
- **Fed by:** K1, K2, K3, K4. **Caveat:** Tejas and David are IBM employees, and OpenRAG is IBM/Langflow technology. Say so in the intro.

#### 8.6.3 `/topics/ai-mind-map-react-flow` (P1)

- **Title (53):** AI Mind Map From Your Sources: React Flow + LLM Guide
- **Meta (147):** Turn RAG output into a real mind map with React Flow: prompting for hierarchy, stripping LLM leakage, node weighting, drill-down chats and styling.
- **H2 outline**
  1. Why "mind map" features are often just an outline: markdown only ([K1 t=1073](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1073); [K2 t=587](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=587)); cite the NotebookLM read-only complaint (XDA)
  2. Choosing a library: React Flow vs D3 vs mind-map renderers ([K2 t=796](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=796), [t=995](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=995), [t=1026](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1026)); link [React Flow's mind-map tutorial](https://reactflow.dev/learn/tutorials/mind-map-app-with-react-flow)
  3. The map is only as good as the LLM's hierarchy: flat output ([K2 t=3393](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3393), [t=3427](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3427)); require more than one nesting level ([t=3757](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3757)); weight nodes by importance ([t=2841](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2841))
  4. Strip LLM leakage: citations, JSON fragments and search queries ([K2 t=3525](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3525); leftover "search query" nodes, [t=3952](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3952)); the result ([t=3920](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3920))
  5. Styling React Flow to match your app: override default styles ([K2 t=2946](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2946)); design tokens, no magic numbers ([t=1589](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1589), [t=1651](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1651)); full-screen and color ([t=2708](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2708)); before/after ([t=3141](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3141)); fit node text ([K4 t=4332](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4332))
  6. Making it useful: collapsible nodes, drill-down conversations linked to a node, and horizontal/vertical layout ([K3 t=711](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=711), [t=744](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=744), [t=776](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=776), [t=808](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=808))
  7. Grounding the map in your sources, per notebook, via RAG filters ([K1 t=1441](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1441))
  8. FAQ ("Can I edit an AI-generated mind map?", "Best React library for mind maps?", "How do I make a mind map from a PDF with AI?")
- **Fed by:** K1, K2, K3, K4.

#### 8.6.4 `/topics/spec-driven-development-ibm-bob` (P2)

- **Title (53):** Spec-Driven Development With IBM Bob: A Real Workflow
- **Meta (148):** Spec coding in IBM Bob on a live build: a custom mode and skill for requirements, design and tasks, numbered IDs, validation, and when to just vibe.
- **Overlap check:** `/topics/ibm-bob-features-in-practice` covers _plan mode_. This page covers the requirements → design → tasks _spec-coding custom mode_. Cross-link both, and keep the plan-mode H2 on the features page canonical for `ibm bob plan mode`.
- **H2 outline**
  1. What spec coding is, vs vibe coding ([K1 t=1649](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1649); [K2 t=837](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=837); [K3 t=2369](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2369))
  2. Setting it up in Bob: point Bob at a process repo to create a custom mode/skill ([K2 t=868](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=868), [t=1265](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1265)); project-level skills ([K1 t=1681](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1681)); link Bob [custom modes](https://bob.ibm.com/docs/ide/configuration/custom-modes)
  3. Requirements with numbered IDs and acceptance criteria ([K2 t=931](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=931), [t=1225](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1225))
  4. Design, tasks and the validate step that links them back ([K2 t=963](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=963), [t=1265](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1265); [K3 t=2429](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2429))
  5. Reviewing the spec is where humans add value: Tailwind magic numbers caught in design ([K2 t=1589](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1589), [t=1716](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1716)); the wrong localhost assumption and "don't bundle OpenRAG" caught in requirements ([K3 t=2555](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2555), [t=3074](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3074)); "80% of this episode was specking" ([t=5624](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=5624))
  6. Bob recognises new features and proposes spec mode itself ([K2 t=899](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=899), [t=1127](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1127))
  7. Task files vs the agent's internal task list: keep your own `to-do.md` for posterity and tell the agent to update it ([K2 t=1888](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1888), [t=1918](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1918), [t=2213](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2213); [K3 t=4214](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4214))
  8. Does it pay off? AI Workbench support "pretty much one-shot" from a spec ([K3 t=363](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=363)); the specs folder as a feature database ([t=327](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=327)); keep a context wiki updated ([t=5358](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=5358))
  9. When vibe coding is fine: small visual fixes from a screenshot ([K4 t=1319](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1319)); vague prompts fail on layout ([K1 t=2032](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2032)); "we would have spec'd this with a designer" ([W2 t=728](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=728)). Balanced: Tejas prefers to let it run and correct afterwards ([W2 t=425](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=425))
  10. FAQ ("Is spec-driven development just waterfall?" (autocomplete query) answered with the iterate-and-validate loop; "Does IBM Bob support spec-driven development?")
- **Fed by:** K1, K2, K3, K4, W2 (+ link PSAbjcEsn-Q's plan-mode spec moment, section 5).

Not recommended as new pages:

- ElevenLabs/PDF-to-podcast: thin evidence, heavy competition. Keep it as an H2.
- Astra DB collections: docs own it. Keep it as a W2 H2.
- DataStax AI Workbench on its own: no demand yet. Keep it as an OpenRAG H2.
- Record button UX: wrong intent.

### 8.7 GEO prompts → target URL (continues section 6)

| #   | Prompt                                                                    | Target URL                                                     |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 31  | Is there an open-source, self-hosted alternative to NotebookLM?           | `/projects/killrctx`, `/topics/build-notebooklm-clone`         |
| 32  | How would I build my own NotebookLM clone?                                | `/topics/build-notebooklm-clone`, K1                           |
| 33  | Can I self-host NotebookLM or run it locally?                             | `/projects/killrctx` (FAQ)                                     |
| 34  | What is OpenRAG and how do Langflow, Docling and OpenSearch fit together? | `/topics/openrag`, K1                                          |
| 35  | How do I use the OpenRAG SDK in a Next.js app?                            | `/topics/openrag`, K1                                          |
| 36  | What's the difference between agentic RAG and traditional RAG?            | `/topics/openrag`, K1                                          |
| 37  | Can I use different embedding models in the same vector index?            | `/topics/openrag` (FAQ), K1                                    |
| 38  | Why are all my OpenRAG document ingests failing?                          | K4, `/topics/openrag`                                          |
| 39  | OpenRAG vs DataStax AI Workbench: which should I use for RAG on Astra DB? | `/topics/openrag`, K3, K4                                      |
| 40  | How do I turn LLM output into an interactive mind map in React?           | `/topics/ai-mind-map-react-flow`, K2                           |
| 41  | Why is my AI-generated mind map flat or full of citations?                | `/topics/ai-mind-map-react-flow`, K2                           |
| 42  | Is there a NotebookLM-style mind map I can drill into or edit?            | `/topics/ai-mind-map-react-flow`, K3                           |
| 43  | How do I generate a podcast from my documents with ElevenLabs?            | `/topics/build-notebooklm-clone` (H2), K2                      |
| 44  | How do I do spec-driven development with IBM Bob?                         | `/topics/spec-driven-development-ibm-bob`, K2                  |
| 45  | Spec coding vs vibe coding: when is each worth it?                        | `/topics/spec-driven-development-ibm-bob`, K4                  |
| 46  | How do I run multiple IBM Bob Shell agents in parallel?                   | `/topics/coordinating-coding-agents`, K4                       |
| 47  | How do I turn on YOLO / auto-approve in IBM Bob Shell?                    | `/topics/ibm-bob-features-in-practice`, K4                     |
| 48  | How can I reduce token usage with IBM Bob?                                | K3, features hub                                               |
| 49  | How do I create an Astra DB vector collection with vectorize from code?   | W2                                                             |
| 50  | Why does my Expo audio upload work on iOS but fail on web?                | W2                                                             |
| 51  | Does hosted Docling (Docling for IBM watsonx) transcribe audio?           | `/topics/docling-audio-transcription` (dated), W2, TrJNkt1G6TA |
| 52  | How should an app's record button show that it's recording?               | W2                                                             |

### 8.8 Where these episodes change existing rows

- **Row 1/2 (`/topics/ibm-bob`):** the hub now spans **10 episodes** (all ten are built with Bob), not five.
- **Row 7 (model):** add David's K3 answer ([t=2145](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2145)).
- **Rows 8/9 (permissions, skills):** now have strong evidence (8.9).
- **Row 27 (Astra DB):** is superseded for the collection sub-intent by row 42.
- **Row 29 (brand):** add the "Build with Bob" YouTube title collision (8.2).

### 8.9 Refresh EXISTING guides with new evidence

**`/topics/ibm-bob` (`content/topics/ibm-bob.md`)**

- **Frontmatter:**
  - `description`/`answer`: "five livestreamed builds" → "ten livestreamed episodes across two projects". Add KillrCtx to `about` and all ten slugs to `episodes`.
  - FAQ "Has anyone built a real app with IBM Bob?": add KillrCtx (4 episodes: a NotebookLM clone on OpenRAG).
- **Rename H2** "What we built with IBM Bob: Walfly in five episodes" → "What we built with IBM Bob: KillrCtx and Walfly". Add four KillrCtx lines plus W2. Note that KillrCtx was built entirely with Bob ([K1 t=2174](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2174); [K2 t=587](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=587)).
- **"What IBM Bob did well": add**
  - one-shot model picker from an SDK skill ([K1 t=2242](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2242))
  - chose spec mode unprompted ([K2 t=1127](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1127))
  - sensible parallel batching ([K2 t=2054](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2054))
  - AI Workbench support "pretty much one-shot" from a spec ([K3 t=363](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=363))
  - created the Astra DB collection via the Data API without instructions ([W2 t=5577](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5577))
  - used IBM product knowledge and Chrome DevTools to check docs ([W2 t=1790](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1790), [t=1855](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1855))
  - "Bob V2… much more concise" ([K3 t=611](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=611))
- **"Where it struggled": add**
  - vague layout prompt made things worse twice ([K1 t=1790](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1790))
  - didn't check the Tailwind config until asked ([K2 t=1716](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1716))
  - "now I really see the issue" loops ([K2 t=2339](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2339))
  - invented a Docling `transcribe` endpoint ([W2 t=3832](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3832))
  - Bob Shell 1.0.4 leaked raw thinking syntax, fixed in 1.0.6 ([K4 t=779](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=779), [t=1010](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1010))
  - frequent re-login in Bob Shell ([K2 t=657](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=657); [K3 t=2273](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2273))
  - no Live Share in the VS Code fork ([K3 t=1839](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1839))
- **"Which model does IBM Bob use?":** add [K3 t=2145](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2145).
- **"Why IBM Bob asks for permission":** add W2's lesson that loosening permissions let a pasted API key sit in plain view, so use a credential store ([W2 t=3282](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3282)).
- **Verdict:** add David's "on par with Claude Code for building apps", flagged with his own IBM-bias caveat ([K3 t=3938](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3938), [t=3969](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3969)).

**`/topics/ibm-bob-features-in-practice`**

- **New H2 "Skills and custom modes"** (targets `ibm bob skills`, `bob shell skills`, `ibm bob custom modes`):
  - project-level skills ([K1 t=1613](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1613), [t=1681](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1681))
  - an OpenRAG SDK skill ([t=2208](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2208))
  - spec-coding mode created from a repo ([K2 t=868](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=868))
  - Bobby Talk ([K3 t=1732](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1732))
  - devrel coding-style skill ([t=2211](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2211), [t=4439](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4439))
  - Link out to `/topics/spec-driven-development-ibm-bob`.
- **"Bob Shell vs the Bob IDE": add**
  - Tejas uses Bob Shell daily and "never" the IDE; David prefers the IDE for larger codebases ([K1 t=1202](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1202), [t=1507](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1507); [K3 t=2620](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2620))
  - "meet developers where they are" ([K2 t=657](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=657))
  - Bob is a VS Code fork ([K3 t=1839](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1839))
  - auto-upgrade to 1.0.6 ([K4 t=940](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=940), [t=1010](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1010))
  - context % indicator unclear in Shell ([K4 t=1548](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1548))
- **"Permissions and approvals": add**
  - YOLO via Shift+Tab / trust folder ([K4 t=706](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=706), [t=737](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=737))
  - auto-approve settings moved in an update ([K2 t=2148](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2148), [t=3066](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3066))
  - "approve for this task" per command type ([K3 t=3376](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3376))
  - FAQ targets `bob shell auto approve`, `ibm bob yolo`.
- **"Long sessions": add**
  - the 100-turn task limit prompt ([W2 t=4253](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4253))
  - David's suggestion of "start new session with context" ([t=4288](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4288))
  - reusing a previous repo as context ([t=4418](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4418), [t=4518](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4518))
  - the context-wiki idea ([K3 t=5358](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=5358))
- **"Parallel tasks": add**
  - subagent batching from agent mode ([K2 t=2022](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2022), [t=2054](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2054))
  - a new Bob task while committing ([W2 t=1458](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1458))
- **New FAQ:** "How do you save tokens with Bob?" (row 46).

**`/topics/ibm-bob-vs-claude-code-cursor-codex`**

- **"Planning and spec workflow":**
  - Claude Code keeps its own task list, which collided with David's file-based to-dos; Bob does the same ([K2 t=1888](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1888), [t=2213](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2213); [K3 t=4214](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4214))
  - Claude Code also batched "do all 20 in parallel" ([K2 t=2022](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2022))
- **"How they differ in approach":** Bob IDE is a VS Code fork; Bob Shell is "like Claude Code" in the terminal ([K1 t=1202](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1202); [K3 t=1839](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1839)).
- **"Model choice":** [K3 t=2145](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2145).
- **"Where each fits":** David's bias-flagged parity claim ([K3 t=3938](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3938)).
- **Update intro/`episodes`** to cite 10 episodes. Add `ibm bob vs cline / roo code` to the FAQ only if we can cite vendor docs (no transcript evidence; the hosts compared against VS Code/Roo only in passing at [K3 t=1839](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1839)).

**`/topics/coordinating-coding-agents`**

- **New H2 "Parallel Bob Shell sessions without a coordinator"** (answers "how do I run multiple coding agents in parallel" without Beads):
  - multiplex Bob Shell tabs on orthogonal tasks ([K4 t=1900](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1900), [t=2244](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2244), [t=2275](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2275))
  - rename sessions to track them ([t=3260](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3260))
  - four at once ([t=3392](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3392))
  - "hundreds of parallel agents" is Tejas's claim, so quote it as such ([t=3226](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3226))
  - Position it as the step _before_ file clobbering forces Beads/Agent Mail. This is the origin story of the later Walfly coordination work.
- **Also add** the branch-based two-human workflow (each host pushing and pulling a feature branch while Bob commits) ([K3 t=4538](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4538)–[t=4807](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4807)).

**`/topics/docling-audio-transcription`**

- **"Hosted Docling vs local Docling": add W2 as the earliest attempt (21 Aug 2026, before the "ASR capability gap" episode):**
  - Bob invented a `/transcribe` endpoint ([t=3832](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3832))
  - it read open-source docs instead of hosted-Docling docs ([t=3494](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3494))
  - the API key had expired, since hosted keys have a TTL ([t=4750](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4750))
  - the hosted UI rejected MP4/MP3 uploads ([t=4975](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4975))
  - an env-var switch between local and hosted ([t=3732](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3732))
  - local MLX on Apple silicon as the MVP fallback ([t=3560](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3560))
- **"Audio formats and the errors we hit": add**
  - "File format not allowed" for `.ogg` ([t=4652](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4652))
  - WebM and "the browser can't actually record as MP4" ([t=5256](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5256))
  - the service couldn't fetch a `localhost` file URL ([t=3050](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3050))
  - Quote each error string verbatim in an H3.
- **Add one line** on Docling inside OpenRAG: ingestion fails silently when docling-serve is down ([K4 t=3965](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3965)). Link `/topics/openrag`.

**`/topics/audio-chunking`**

- Small addition to "Why chunk audio at all?": W2's first end-to-end upload path (record → multipart → store → Docling) and its serialization bugs. "Failed to parse multipart form" → base64/bytes → platform-specific blob ([t=2291](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2291), [t=2531](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2531), [t=2629](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2629)).
- Temp-dir vs Vercel Blob storage switch ([t=2822](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2822)): this is the storage half of the "ephemeral" design.

**`/projects/walfly`** (not a guide, but affected)

- Add W2 to the episode list.
- H3 "Search on Astra DB with vectorize": serverless vector DB ([t=960](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=960)); vectorize the transcripts plus metadata ([t=1528](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1528), [t=1564](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1564)); NVIDIA embeddings ([t=1691](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1691)).
- Origin line: Walfly was pitched at the end of KillrCtx as a Granola-style recorder for in-person meetings, with no cloud middleman and an MCP server for agents ([K4 t=4805](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4805), [t=4836](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4836), [t=4884](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4884)). This also strengthens row 26's "alternative" H2.

**`llms.txt`:** add lines for `/projects/killrctx`, the four new guides and the five episodes, using canonical names (KillrCtx, OpenRAG, Docling, DataStax AI Workbench, Astra DB).

### 8.10 Sources consulted (this section)

- [langflow-ai/openrag](https://github.com/langflow-ai/openrag)
- [OpenRAG quickstart](https://docs.openr.ag/quickstart/)
- [openrag on PyPI](https://pypi.org/project/openrag/)
- [XDA: tried three open-source NotebookLM alternatives](https://www.xda-developers.com/tried-open-source-notebooklm-alternatives-only-one-is-the-real-deal/)
- [KDnuggets: Open Notebook](https://www.kdnuggets.com/open-notebook-a-true-open-source-private-notebooklm-alternative)
- [openalternative.co: NotebookLM](https://openalternative.co/alternatives/notebooklm)
- [GitHub topic: google-notebooklm](https://github.com/topics/google-notebooklm)
- [React Flow mind-map tutorial](https://reactflow.dev/learn/tutorials/mind-map-app-with-react-flow)
- [XDA: NotebookLM-style mind map alternatives](https://www.xda-developers.com/tested-notebooklm-style-mind-map-alternatives/)
- [Atlas: NotebookLM mind maps](https://www.atlasworkspace.ai/blog/notebooklm-mind-maps)
- [ElevenLabs Create Podcast API](https://elevenlabs.io/docs/api-reference/studio/create-podcast)
- [Podcastfy](https://github.com/souzatharsis/podcastfy)
- [DataStax GitHub](https://github.com/orgs/datastax/repositories)
- [Astra DB: create a collection](https://docs.datastax.com/en/astra-db-serverless/api-reference/collection-methods/create-collection.html)
- [NVIDIA: traditional vs agentic RAG](https://developer.nvidia.com/blog/traditional-rag-vs-agentic-rag-why-ai-agents-need-dynamic-knowledge-to-get-smarter/)
- [Bob custom modes](https://bob.ibm.com/docs/ide/configuration/custom-modes)
- [heidloff.net: spec-driven development with IBM Bob](https://heidloff.net/article/spec-driven-development-ibm-bob/)
- [InfoWorld: vibe coding or spec-driven development](https://www.infoworld.com/article/4166817/vibe-coding-or-spec-driven-development-how-to-choose.html)

## 9. Episode 11: `astra-db-8000-byte-limit-and-jev-clustering-in-walfly` (added 2026-10-03)

Video `1H_H9Sx9-FI`, YouTube title "Building with Bob: Walfly Wearables App". Global episode 11, Walfly part 7.

### 9.1 Demand data (Google autocomplete, `suggestqueries.google.com`, 2026-10-03)

| Seed                                                               | Suggestions                                                           | Read                                                                      |
| ------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `jev typesafe`                                                     | "jev typesafe ai", "jev typesafe"                                     | New entity with branded demand; use "Jev from TypeSafe AI"                |
| `jev openrouter`                                                   | "jev openrouter"                                                      | Access route people search for; FAQ "Can you use Jev through OpenRouter?" |
| `llm clustering`                                                   | "llm text clustering", "llm topic clustering", "llm clustering model" | Jev grouping moments by intent is a first-hand example                    |
| `astra db limit`, `astra db document size`, `indexed string value` | none                                                                  | Low autocomplete volume; target the exact error string instead            |
| `dogfooding`                                                       | "dogfooding meaning tech", "dogfooding software"                      | Use as a section angle, not a title keyword                               |

### 9.2 Primary keywords and placement

- **Title (56 chars):** "Astra DB's 8,000-Byte Limit and Jev Clustering in Walfly".
- **Exact error string as H3:** "Document size limitation violated: indexed string value" (Astra DB Data API, 8,326 of 8,000 bytes, [t=1807](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=1807)).
- **Entity FAQs:** "What is Jev from TypeSafe AI?", "Can you use Jev through OpenRouter?", "What is the Astra DB size limit for an indexed string?"
- **Design FAQs:** "Should you chunk transcripts by time or by bytes?", "Should transcript chunks be separate documents or one array?"

### 9.3 Graph updates made

- `/topics/audio-chunking`: new H2 "Chunking by bytes: Astra DB's 8,000-byte limit" + FAQ.
- `/topics/coordinating-coding-agents`: Xavier memory and "PRD, then a fresh session for tasks".
- `/projects/walfly`: episode 11 in the timeline, Jev in the stack and architecture, new What's next.
- Episode 10 now links forward to episode 11.

### 9.4 GEO prompts → target URL

- "What is the Astra DB indexed string size limit?" → `/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly`
- "How do I fix 'document size limitation violated' in Astra DB?" → same
- "What is Jev by TypeSafe AI used for?" → same
- "Should I chunk audio transcripts by time or by bytes?" → `/topics/audio-chunking`

### 9.5 Sources consulted

- [Astra DB Data API limits](https://docs.datastax.com/en/astra-db-serverless/api-reference/dataapi-limits.html)
- [TypeSafe AI: Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [OpenRouter: What is Jev?](https://openrouter.ai/blog/insights/what-is-jev/)
