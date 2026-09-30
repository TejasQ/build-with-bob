---
slug: ibm-bob
title: "What Is IBM Bob? A Hands-On Guide From Real Builds"
h1: "What is IBM Bob?"
description: "What IBM Bob is, how its plan mode, spec coding, Bob Review, Bob Shell and skills behave on real projects, and where it struggled, from ten livestreams."
answer: "IBM Bob is IBM's AI coding agent, available as an IDE and a terminal tool called Bob Shell, generally available since April 2026. We have used it across ten livestreamed episodes to build two open-source apps, KillrCtx and Walfly. Bob is strongest at planning, spec-driven features and web work, and weaker on mobile Expo code and current library versions."
updated: "2026-09-30"
about: ["IBM Bob", "Bob Shell", "Bob Review", "KillrCtx", "Walfly"]
episodes:
  - killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob
  - adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob
  - notebooklm-clone-setup-wizard-and-ai-workbench-backend
  - debugging-rag-backends-openrag-vs-ai-workbench
  - planning-walfly-wearable-app-mvp-with-ibm-bob
  - walfly-record-button-redesign-and-astra-db-setup
  - debugging-expo-audio-and-local-docling-transcription
  - local-first-transcription-python-sidecar-and-coordinating-agents
  - ai-code-review-and-expo-mobile-layout-fixes
  - designing-audio-chunking-and-ephemeral-asr
faq:
  - q: "Is IBM Bob an IDE or an agent?"
    a: "Both. IBM Bob is an AI coding agent that ships as its own IDE, which the hosts found is a VS Code fork, and as a terminal tool, Bob Shell. The agent plans, edits files, runs commands and reviews code, and since the August 2026 release the IDE and Bob Shell share task history, so you can start in one and continue in the other."
  - q: "Is IBM Bob good?"
    a: "In our experience, yes for planning, spec-driven features and web development, with caveats. It built a model picker and a whole second RAG backend for KillrCtx almost in one shot, and Bob Review found real issues on Walfly. It also claimed Next.js 16 didn't exist, invented a hosted Docling endpoint and struggled with native iOS layout in Expo, so you still need to read what it tells you."
  - q: "Which model does IBM Bob use?"
    a: "IBM says Bob routes each task to a suitable model based on accuracy, performance and cost, drawing on Anthropic Claude, Mistral open-source models, IBM Granite and specialised fine-tuned models. On stream, David described it as a combination of models that isn't exposed to you, and we found you can't pick the model yourself."
  - q: "Why does IBM Bob ask for permission so often?"
    a: "Because it starts from a restrictive security model on purpose. Bob is aimed at enterprise, production-quality software, so it asks before running commands or touching files outside your workspace. You can approve a command type for the current task or project, loosen the global settings, configure auto-approve per action type, or run Bob Shell in YOLO mode."
  - q: "Has anyone built a real app with IBM Bob?"
    a: "Yes. On the Building with Bob livestream, Tejas Kumar and David Jones-Gilardi built KillrCtx, an open-source NotebookLM clone on OpenRAG, over four episodes, entirely with Bob. They are now building Walfly, an open-source, local-first conversation recorder with an Expo app, a Next.js backend, local Docling transcription and Astra DB search. All ten episodes, failures included, are recorded."
  - q: "Is IBM Bob as good as Claude Code?"
    a: "David, who uses Claude Code, GitHub Copilot and Bob, said in July 2026 that with Bob V2 the experience is 'pretty much on par' with Claude Code for building apps. He also flagged that he works for IBM and is biased. We haven't run the same task in both tools; our cited comparison is at /topics/ibm-bob-vs-claude-code-cursor-codex."
  - q: "Can IBM Bob search the web?"
    a: "Yes, though it doesn't always do so unprompted. In our builds Bob used a Tavily search tool, drove Chrome to read the React Native and IBM docs, and drew on its IBM product knowledge, but it also answered from stale knowledge until told to search. We saved a memory rule telling it to search the web for current version information."
---

Most of what's written about IBM Bob comes from IBM itself or from short first impressions. This guide is different: it collects what we've seen across ten livestreamed episodes of Building with Bob, where Tejas Kumar and David Jones-Gilardi build two open-source apps with Bob: [KillrCtx](/projects/killrctx), a NotebookLM clone, and [Walfly](/projects/walfly), a conversation recorder. Every claim about how Bob behaved links to the exact moment in an episode, so you can watch it happen. Both hosts work at IBM, so weigh their opinions accordingly; the timestamps let you judge the behaviour yourself.

## What is IBM Bob?

IBM Bob is an AI coding agent from IBM that plans, writes, runs and reviews code from inside its own IDE or from the terminal through Bob Shell. IBM made it [generally available on 28 April 2026](https://newsroom.ibm.com/2026-04-28-introducing-ibm-bob-ai-development-partner-that-takes-enterprises-from-ai-assisted-coding-to-production-ready-software) as a SaaS offering with individual and enterprise plans, and positions it across the whole software lifecycle, "from planning and coding to testing, deployment, and modernization." The [official docs](https://bob.ibm.com/docs) cover both the IDE and Bob Shell.

The show's first episode opens with the plainest description we have: "Bob is IBM's coding agent. You may think of things like Codex, Claude Code, Cursor… Bob is that" ([0:00](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=0)). It works in three built-in [modes](https://bob.ibm.com/docs/ide/features/modes), Plan, Agent and Ask, and you can add [custom modes](https://bob.ibm.com/docs/ide/configuration/custom-modes) and [skills](https://bob.ibm.com/docs/ide/tutorials/use-skills). The IDE is, as the hosts put it on stream, "very clearly VS Code" underneath ([30:39](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1839)). IBM shipped a major update between our projects: the [IDE changelog](https://bob.ibm.com/docs/ide/changelog) lists version 2.0.0 in June 2026, with subagents, a Skills tab and a Modes tab, and the [Bob Shell changelog](https://bob.ibm.com/docs/shell/changelog) lists Shell 2.0.0 in August 2026.

## What we built with IBM Bob: KillrCtx and Walfly

We built both apps with Bob in the driver's seat. KillrCtx was "done with Bob" end to end ([36:14](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2174), [9:47](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=587)). Episodes are numbered in the order they aired:

**KillrCtx, an open-source NotebookLM clone (June-July 2026)**

1. [KillrCtx: An Open-Source NotebookLM Clone on OpenRAG and IBM Bob](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob): a tour of the app on OpenRAG, then a first Bob fix to the panel headers.
2. [Building a NotebookLM-Style Mind Map with React Flow and IBM Bob](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob): Bob picks React Flow and spec-codes a visual mind map.
3. [Spec Coding a Setup Wizard for an Open-Source NotebookLM Clone](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend): a DataStax AI Workbench backend and an `npm run init` wizard, specced before any code.
4. [Debugging KillrCtx RAG Backends: OpenRAG vs AI Workbench](/episodes/debugging-rag-backends-openrag-vs-ai-workbench): four Bob Shell agents in parallel and a docling-serve outage behind failed ingests.

**Walfly, a local-first conversation recorder (August-September 2026)**

5. [IBM Bob Plan Mode: Scoping a Real App MVP, Live](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob): a whiteboard diagram becomes an MVP plan, then a running Expo web UI.
6. [Astra DB Setup and a Better Record Button with IBM Bob](/episodes/walfly-record-button-redesign-and-astra-db-setup): a pulsing record button and an Astra DB collection created through the Data API.
7. [Docling Audio Transcription and Expo Mic Fixes with IBM Bob](/episodes/debugging-expo-audio-and-local-docling-transcription): native audio fixes, hosted Docling (Docling for IBM watsonx) hits an ASR gap, and the first transcript arrives.
8. [Local Docling + Whisper Sidecar and Beads for Agent Teams](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents): local Docling, a brand built by Bob, Beads and MCP Agent Mail, and a painful Expo SDK upgrade.
9. [Bob Review vs Xavier and a KeyboardAvoidingView Fix in Expo](/episodes/ai-code-review-and-expo-mobile-layout-fixes): Bob Review against [Xavier](https://xavier.team), an AI agent orchestrator by Atila, and a keyboard bug fixed by reading the code.
10. [Audio Chunking and a Stateless Docling ASR Service in Docker](/episodes/designing-audio-chunking-and-ephemeral-asr): a stateless ASR service in Docker, planned with Bob and Xavier together.

## What IBM Bob did well

Bob was at its best when the work started with thinking: planning, specs, research and review. These are the moments that stood out:

- **Plan mode asks before it builds.** Given a prompt and a hand-drawn architecture diagram, Bob asked multiple-choice questions about hosting, auth, storage and search ([27:45](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=1665)), and later researched speaker diarization without being told to ([39:58](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=2398)).
- **It chose spec coding on its own.** David deliberately didn't tell Bob to use his spec-coding mode for the mind map; Bob started a spec anyway ([18:47](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1127)).
- **Specs paid off.** With a spec in place, Bob "pretty much one-shot" KillrCtx's whole DataStax AI Workbench backend: "the core functionality worked right out of the gate" ([6:03](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=363)).
- **Skills made it fast.** Given an OpenRAG SDK skill and a one-line request, Bob "almost one shot" a runtime model picker ([37:22](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2242)).
- **It batched parallel work sensibly.** Asked to do all the mind-map tasks in parallel, Bob grouped what could run together instead of starting everything at once ([34:14](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2054)).
- **It knew IBM's own products.** Bob created Walfly's Astra DB collection through the Data API with no instructions on how ([1:32:57](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5577)), consulting IBM product docs and driving Chrome DevTools to check the embedding model ([29:50](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1790), [30:55](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1855)).
- **Bob Review found real issues.** On the same three commits, Bob Review flagged viewport and keyboard visibility problems and a magic number, while Xavier's review found nothing actionable ([37:12](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=2232)).
- **V2 is terser.** In July 2026 David said Bob V2's replies are "much more concise and exacting" ([10:11](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=611)).

The practical side of each is covered in [IBM Bob features in practice](/topics/ibm-bob-features-in-practice).

## Where IBM Bob struggled

Bob's weak spots were stale knowledge, vague prompts, native mobile layout and confident answers that turned out to be wrong. None stopped a build, but each cost time:

- **Outdated versions.** Bob scaffolded Next.js 14, then insisted Next.js 16 didn't exist ([1:03:51](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=3831)). Later it picked Expo 52 when the project was on 57 ([1:20:09](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=4809)).
- **Invented APIs.** Bob suggested a docling-serve flag that didn't exist ([29:57](/episodes/debugging-expo-audio-and-local-docling-transcription?t=1797)) and "made up" a `transcribe` endpoint for hosted Docling ([1:03:52](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3832)).
- **Vague prompts made layout worse.** "Fix the headers" made the UI worse ([29:50](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1790)); naming the cause fixed it. David's lesson: "when we gave it exact instructions, it did much better" ([33:52](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2032)).
- **It didn't check the project first.** Bob proposed hard-coded Tailwind colours and only read the Tailwind config after being asked ([28:36](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1716)).
- **Debugging loops.** "It keeps saying, 'Now I see the issue.' … And now I really see the issue" ([38:59](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2339)).
- **Mobile Expo is "a different beast."** David's words during a long round of keyboard fixes ([52:52](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=3172)), finally solved by a human commenting out one prop.
- **A review that undid a fix:**

> Number three is the exact thing that we removed to fix the issue, and so it's saying reintroduce that problematic prop. This then makes me question all the other review points.
> — Tejas, [1:20:49](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=4849)

- **Long sessions hit a ceiling.** Bob stops at a default of 100 turns ([52:06](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=3126), [1:10:53](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4253)).

Tooling had rough edges too. In July 2026, Bob Shell printed raw thinking syntax ([12:59](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=779)); auto-upgrading from 1.0.4 to 1.0.6 was "a crazy jump" better ([16:50](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1010)), though Tejas still called the leftover syntax "kind of unacceptable" for a 1.0 release ([16:16](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=976)). Bob Shell's frequent re-login was "the bane of my existence" for Tejas ([10:57](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=657), [37:53](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2273)); the IDE lacked VS Code's Live Share ([30:39](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1839)); and in August 2026 Tejas hit an "unexpected critical error" and a "budget exceeded" message ([16:28](/episodes/debugging-expo-audio-and-local-docling-transcription?t=988), [22:51](/episodes/debugging-expo-audio-and-local-docling-transcription?t=1371)).

## Which model does IBM Bob use?

IBM Bob doesn't use one fixed model; it routes each task to a model chosen by the platform. According to [IBM's launch announcement](https://newsroom.ibm.com/2026-04-28-introducing-ibm-bob-ai-development-partner-that-takes-enterprises-from-ai-assisted-coding-to-production-ready-software), Bob "dynamically routes tasks to a suitable model based on accuracy, performance, and cost," drawing on Anthropic Claude, Mistral open-source models and IBM Granite, alongside fine-tuned models for code reasoning, security and next-edit prediction.

Asked on stream in July 2026, David gave the user's-eye version: a combination of models, sometimes Granite, "some Anthropic in there," and "it's not something that it exposes to you" ([35:45](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2145)). The trade-off showed up while fighting iOS keyboard behaviour, when Tejas wanted a mobile-tuned model: "this is where Bob falls short because it doesn't let you choose the model" ([53:22](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=3202)). IBM's [FAQ](https://bob.ibm.com/docs/ide/faq) lists "Can I choose which model Bob uses?", so check it for your plan.

## Why IBM Bob asks for permission so often

Bob asks for approval a lot because it's designed to start locked down and let you open it up. David heard this from Bob's product team:

> Instead of just being super permissive, it starts the exact opposite way. And I was just recently talking to the PM team, and that's on purpose.
> — David, [55:59](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=3359)

Bob targets enterprise, production-quality apps, "different from when you're going in YOLO mode and you're vibing something" ([56:30](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=3390)). You can loosen it gradually: approve a command type "for the task" so Bob stops asking about, say, `gh` commands while other commands still prompt ([56:16](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3376)); allow commands per project; or use the per-category toggles on IBM's [auto-approve page](https://bob.ibm.com/docs/ide/features/auto-approving-actions), which warns that auto-approve "can result in data loss, file corruption, or worse." Tejas runs Bob Shell in YOLO mode ([11:46](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=706)).

Loosening has a cost. After David opened permissions up, an API key ended up in plain view in Bob's chat, and he called it "kind of like a security hole": keep secrets in a credential store ([54:42](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3282)).

## Is IBM Bob good? Our verdict so far

As of September 2026, after ten episodes, our verdict is that IBM Bob is a strong planning and spec-coding partner and a solid web developer that needs a human reading along. It took two developers from a whiteboard to a working NotebookLM clone and a multi-service recording app.

David's July 2026 view, with his own caveat:

> Especially with the latest IBM Bob V2, I feel like Bob is on par with something like the experience I get out of Claude Code, especially for building apps like this.
> — David, [1:05:38](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3938)

He added right away: "Yes, I work for IBM. Yes, I'm going to have a bit of a biased opinion" ([1:06:09](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3969)).

What we'd tell a team considering it:

- **Plan or spec first.** Plan mode's questions and a spec-coding mode were where the real decisions got made.
- **Be exact.** Vague prompts cost us rounds; named causes and constraints fixed things first time.
- **Assume its version knowledge is stale.** Tell it to search the web, and save that to memory on day one.
- **Treat Bob Review as a second opinion.** It caught real issues, and it also recommended reintroducing a bug.
- **Budget extra time for native mobile.** Web work went smoothly; Expo on iOS did not.
- **Keep Bob Shell updated.** Versions changed the experience noticeably within weeks.

As David put it, the agent "does most the toil" and he handles "the precision part" ([43:13](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=2593)). He has since paired Bob with Xavier, saying "it makes a nice companion with Bob" ([39:42](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2382)). How that fits with other agents is in [coordinating coding agents](/topics/coordinating-coding-agents), and Bob next to other tools is in [IBM Bob vs Claude Code, Cursor and Codex](/topics/ibm-bob-vs-claude-code-cursor-codex).
