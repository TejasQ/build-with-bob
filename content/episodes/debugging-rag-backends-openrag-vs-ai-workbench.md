---
slug: debugging-rag-backends-openrag-vs-ai-workbench
videoId: hOpIIVHJheE
title: "Debugging RAG Backends: OpenRAG vs AI Workbench Onboarding"
description: "Finishing KillrCtx's MVP: read-only offline mode, a gated setup wizard, four parallel Bob Shell agents, and a docling-serve outage behind failed ingests."
tldr: "In the final on-stream KillrCtx episode, the app gains a read-only mode for when a RAG backend goes down, and Tejas clones the repo fresh and finds that npm run init let him launch the app without configuring a backend. While fixing that with several Bob Shell agents in parallel, URL ingestion fails with 502s in both backends; the OpenRAG culprit turns out to be docling-serve not running. They end by debating backend-agnostic design and pitching the wearable recorder idea that becomes the next project."
project: killrctx
topics:
  [
    "developer onboarding",
    "rag backends",
    "environment configuration",
    "parallel agents",
    "bob shell",
    "openrag ingest failed",
    "error surfacing",
    "vibe coding",
  ]
tools:
  [
    "IBM Bob",
    "Bob Shell",
    "KillrCtx",
    "OpenRAG",
    "DataStax AI Workbench",
    "Astra DB",
    "docling-serve",
    "ElevenLabs",
    "Next.js",
    "Docker",
    "uv",
    "iTerm2",
    "arXiv",
  ]
takeaways:
  - "Test onboarding the way a newcomer would: a fresh clone exposed that npm run init offered to launch the app before any backend was configured."
  - "When a setup script and a running app disagree about whether a service is up, compare where each reads its config; here init fell back to localhost defaults while the app read only runtime environment variables."
  - "Gate launch on 'at least one backend configured', not 'every detected backend configured'; the first fix blocked users who only wanted AI Workbench."
  - "Split unrelated fixes across parallel agent sessions and name each one, so you always know which agent owns which bug."
  - "A 502 from your app often means an upstream dependency is down; the OpenRAG ingestion failures came from docling-serve not running, not from KillrCtx or the websites being indexed."
  - "Ask the agent to surface upstream errors in the UI or console; clear error details are what turned a vague 'ingest failed' into a one-line fix."
  - "Supporting several RAG backends keeps a project modular but means per-platform setup logic for each one, so detecting existing configuration is more sustainable than provisioning everything."
faq:
  - q: "What does npm run init do in KillrCtx?"
    a: "It is KillrCtx's interactive onboarding script. It detects whether OpenRAG or DataStax AI Workbench is running locally, walks you through configuring one or both (API keys, workspace, chunking strategy), writes .env.local and then launches the app. After this episode it refuses to launch until at least one backend is configured."
  - q: "Why did KillrCtx show AI Workbench as offline when it was running?"
    a: "The init script probed localhost defaults and found AI Workbench, but the Next.js app only reads runtime environment variables and has no fallback defaults. Because Tejas skipped the configure step on a fresh clone, there was no .env.local, so the app had no URL to check and reported the backend as offline."
  - q: "Why does OpenRAG fail to ingest URLs or files with a 502 error?"
    a: "In this episode the cause was that docling-serve, the document conversion service OpenRAG uses for ingestion, was not running. OpenRAG itself answered requests and returned model lists, but every ingest failed upstream. Once Bob started docling-serve, URLs and files indexed normally, and the app now shows the upstream error instead of a bare failure."
  - q: "How do you start docling-serve for OpenRAG?"
    a: "On stream, Tejas had Bob start docling-serve directly. David pointed out that OpenRAG's uvx launcher can also start docling-serve for you. docling-serve has a health endpoint you can check to confirm it is up."
  - q: "What happens to my notebooks if the RAG backend goes down?"
    a: "KillrCtx polls each backend's health, about every 10 seconds by David's estimate, and marks affected notebooks read-only when one goes offline. Notes, generated content and podcasts live in a local SQLite database, so you can still read and play them; only chat and new notes are disabled."
  - q: "OpenRAG vs DataStax AI Workbench: which backend should KillrCtx use?"
    a: "Both are supported, but on this stream OpenRAG was the smoother path. AI Workbench had a knowledge base stuck on a mock embedder that could not be changed, and its settings required token values as environment variable references rather than raw values. Tejas gave up on it for the day and finished the demo on OpenRAG."
  - q: "Can you run multiple IBM Bob agents at the same time?"
    a: "Yes. Tejas ran several Bob Shell sessions side by side in iTerm, each in YOLO mode, fixing unrelated things: model dropdowns, the mock embedder default, URL retry logic and error details. He renamed each session after its task to keep track of them."
  - q: "Can an AI agent run KillrCtx's setup without the interactive menu?"
    a: "David added command-line options for exactly that reason. Running npm run shows scripts for status, OpenRAG, workbench, launch and onboarding, with flags such as --status and --launch, so an agent can drive setup without the selector menu."
  - q: "What project comes after KillrCtx on Building with Bob?"
    a: "At the end of the episode Tejas pitches a wearable meeting recorder that stores audio on device, uploads it to your own backend, chunks and embeds it for search, and exposes it as an MCP server. That idea became Walfly, which starts in episode 5."
chapters:
  - start: 0
    title: "Wrapping up KillrCtx, the open-source NotebookLM clone"
  - start: 186
    title: "RAG backend health checks and read-only offline mode"
  - start: 568
    title: "Fresh clone: testing npm run init onboarding"
  - start: 675
    title: "Why the app says DataStax AI Workbench is offline"
  - start: 1868
    title: "Gating launch with parallel Bob Shell agents"
  - start: 2665
    title: "502 ingest errors and the AI Workbench mock embedder"
  - start: 3456
    title: "Creating an Astra DB database for AI Workbench"
  - start: 3870
    title: "OpenRAG ingest failed: docling-serve wasn't running"
  - start: 4199
    title: "Testing summaries and mind maps on arXiv papers"
  - start: 4399
    title: "Supporting multiple RAG backends, and what's next"
---

This is the last KillrCtx episode streamed live. Tejas and David polish the onboarding for their open-source NotebookLM clone, fix a gap in `npm run init` that let people launch the app with no backend configured, and track 502 ingestion errors down to a stopped Docling Serve process. It's episode 4 of Building with Bob and part 4 of the [KillrCtx build](/projects/killrctx), and it closes with the idea that becomes the next project. The [open-source NotebookLM clone build guide](/topics/build-notebooklm-clone) covers all four parts.

## What is KillrCtx and why is this the last episode?

[KillrCtx](https://github.com/TejasQ/killrctx) is an open-source, self-hosted clone of NotebookLM that the hosts built with [IBM Bob](https://bob.ibm.com) across four episodes. You add sources, chat with them, generate notes and mind maps, and create two-host podcasts with [ElevenLabs](https://elevenlabs.io). It runs on one of two RAG backends: [OpenRAG](https://github.com/langflow-ai/openrag) or DataStax AI Workbench, which is backed by [Astra DB](https://www.datastax.com/products/datastax-astra).

Tejas opens at [2:14](?t=134) by saying the goal is to "put a bow on" the MVP. KillrCtx will stay open source on GitHub and keep getting work, just not on stream. David says it has already become his go-to tool for developer relations research ([1:02](?t=62)).

## What changed in KillrCtx since the last episode?

KillrCtx now checks RAG backend health and has a read-only offline mode. The app knows which backends are available and falls back to a read-only mode when one disappears. In the [previous episode](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend) the hosts started a setup wizard that tried to detect or install backends, and it got complicated quickly. David's demo at [3:06](?t=186) shows where he took it that week:

- **Status badges.** Each notebook shows which backend it uses. When David stops AI Workbench, the app notices within a polling interval (he thinks about 10 seconds) and marks those notebooks read-only ([5:54](?t=354)).
- **Read-only mode.** Notes and generated content live in a local SQLite database, so you can still read old notes and play podcasts while a backend is down ([6:29](?t=389)). Only actions that need the backend, like chat or new note types, are disabled.
- **An `npm run init` selector.** A small menu that auto-detects backends and offers to configure them ([7:08](?t=428)). David deliberately chose detection over automatic installation.

## How does `npm run init` onboarding work, and where did it break?

`npm run init` detects running backends, collects API keys, writes `.env.local` and launches the app. The flaw: it also offered to launch _before_ anything was configured. To test it "for maximum empathy," Tejas clones the repo into a new folder at [9:28](?t=568). He finds a small bug in the README right away: the example `git clone` command points to the wrong repository ([10:12](?t=612)).

Init correctly reports that AI Workbench is running and OpenRAG isn't ([10:44](?t=644)). Tejas picks "launch app," and the app says AI Workbench is offline ([11:15](?t=675)).

### Why did the init script and the app disagree?

They read configuration from different places. Tejas has Bob Shell (in YOLO mode, which he prefers) investigate, and at [16:50](?t=1010) it finds the root cause:

- The init script reads URLs from `.env.local` and `.env`, and **falls back to localhost defaults** when they're missing.
- The Next.js app's health check reads **only runtime environment variables**, with no fallbacks ([18:44](?t=1124)).
- On a fresh clone that skips the configure step, there's no `.env.local`, so the app has nothing to check.

David realizes the problem at [17:24](?t=1044): he had always configured first, so he never saw what happens when you launch straight away. They agree it's "a miss in the onboarding flow" ([31:08](?t=1868)).

### Bob Shell along the way

Tejas has some complaints about [Bob Shell](https://bob.ibm.com), several of which are tracked in [IBM Bob features in practice](/topics/ibm-bob-features-in-practice). Its thinking output "is like leaking syntax" ([16:16](?t=976)), and he can't tell what its context percentages mean ([25:48](?t=1548)). Upgrading from 1.0.4 to 1.0.6 improves things noticeably. David explains that Bob Shell usually upgrades itself the next time you start it after a new version comes out ([15:40](?t=940)). Tejas still says, "I would marry Bob Shell."

## When is vibe coding the right call?

For small visual fixes, the hosts agree it's fine. Tejas pastes a screenshot of an ugly backend "pill" badge and tells Bob to fix it, and Bob spots the doubled, clipped border itself ([21:29](?t=1289)). He swaps a low-resolution logo for the SVG markup copied from the Astra site. He pastes the markup rather than a link, because a model can copy syntax directly and a URL might hit bot detection ([25:15](?t=1515)). A grid-ruler browser extension then shows the Create button is off by one pixel ([28:59](?t=1739)).

> When fixing something minor like this, you're just making kind of like a quick adjustment. We're not making a whole new feature right now. I think that's perfect for that, honestly.
> — David, [21:59](?t=1319)

## How do you run parallel agents in Bob Shell?

To run several IBM Bob agents in parallel, open several Bob Shell sessions, give each one an unrelated task, and name them. Tejas runs multiple sessions in iTerm at [31:40](?t=1900) and works through the fixes:

1. **Launch gating.** Init must not offer to launch until a backend is configured ([36:19](?t=2179)).
2. **Unified sources.** A URL is just another source type, so it moves into the "Add sources" dropdown instead of having its own button ([37:55](?t=2275)).
3. **Comma-separated URLs.** Add several URLs at once, each becoming its own source ([41:31](?t=2491)).

> Honestly, this is the magic, right? Working with multiple agents concurrently.
> — Tejas, [37:55](?t=2275)

The first launch-gating fix goes too far. It requires _both_ OpenRAG and AI Workbench to be configured ([38:59](?t=2339)), which is wrong because you only need one. After another round it shows "Launch blocked. Configure at least one backend first" ([41:00](?t=2460)). Configuring AI Workbench then picks up the `production` workspace, and the app's model and agent selectors fill in.

By [54:56](?t=3296) Tejas has renamed three sessions after their jobs (fix header model dropdowns, mock embedder fix, retry logic for URLs), and a fourth, "error details," follows ([56:32](?t=3392)). He says he keeps "literally hundreds" of agents going; David usually does the same with sessions in the Bob IDE. For when parallel agents start touching the same files, see [coordinating coding agents](/topics/coordinating-coding-agents).

## Why did OpenRAG ingestion fail with 502 errors?

Every ingest failed because an upstream service, docling-serve, wasn't running, though that took a while to find. Tejas grabs five recent AI papers from [arXiv](https://arxiv.org) as HTML and adds them. Every one fails, and the logs show `POST /api/notebooks` returning **502** ([44:57](?t=2697)). The same thing happens with an OpenRAG notebook ([48:16](?t=2896)), and with David's personal site.

The hosts check several suspects before finding the real cause:

| Suspect                    | What they found                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| arXiv blocking scrapers    | No. Other sites failed the same way                                                                                             |
| AI Workbench mock embedder | The knowledge base used a mock embedder that can't be changed afterwards; you have to create a new workspace ([57:36](?t=3456)) |
| OpenRAG not configured     | Also true, since init had only configured AI Workbench ([48:47](?t=2927))                                                       |
| Missing model dropdowns    | A bug David admits he introduced that week ([52:43](?t=3163)); Bob restored them                                                |
| Retry button               | Opened a file picker for URL sources, then threw "ID is not defined" ([1:08:54](?t=4134))                                       |

### AI Workbench configuration friction

To get off the mock embedder, Tejas creates a new serverless vector database in Astra DB ([58:08](?t=3488)). While he waits for its API endpoint, he tries to paste the token into AI Workbench's settings and finds they expect a _reference_ to an environment variable, not the value itself ([1:03:26](?t=3806)). He calls it hostile developer experience and gives up on AI Workbench for the day ([1:03:58](?t=3838)). David notes it's still an early, pre-GA project.

### The real culprit: docling-serve wasn't running

OpenRAG was connected and its API key worked, since the model lists came back. David's own OpenRAG returned 200s, but Tejas's showed "ingest status failed" ([1:04:30](?t=3870)). At [1:05:33](?t=3933) Tejas finds it: [docling-serve](https://github.com/docling-project/docling-serve), which OpenRAG uses to convert documents during ingestion, wasn't running. He has Bob start it and surface the error "in a very friendly way to developers" ([1:06:37](?t=3997)). David mentions that OpenRAG's uvx launcher can also start docling-serve for you ([1:08:23](?t=4103)).

The [OpenRAG guide](/topics/openrag) keeps this and other OpenRAG setup errors in one troubleshooting section.

After that, all five URLs index ([1:09:25](?t=4165)). David sums it up: it "ends up being one little tiny thing."

## What does KillrCtx produce once ingestion works?

Grounded chat, summaries and mind maps that cite their sources. Tejas asks for an ELI5 and then a novice-friendly summary of the papers ([1:10:30](?t=4230)). One paper, on compacting noisy terminal output with regex patterns, catches his eye because Bob Shell could use exactly that ([1:11:40](?t=4300)). The answers show the source chunks they came from. He'd like links back to arXiv, and the mind map nodes need to fit their text better ([1:12:12](?t=4332)).

## Should an open-source RAG app support every backend?

Supporting many backends keeps the project modular, but each one needs its own setup logic. David raises the question at [1:13:19](?t=4399). NotebookLM runs on a single stack that Google controls, while KillrCtx lets you choose.

> For every new platform you then expand to support, you then have to have all of this logic to handle specific cases to that platform.
> — David, [1:14:46](?t=4486)

This is why David chose detection over provisioning. Tejas's answer is that KillrCtx is a learning tool for developers, not a piece of RAG infrastructure:

> I expect people to use KillrCtx exactly the way I just did, right? To learn. It's a learning tool.
> — Tejas, [1:15:30](?t=4530)

Bundling OpenRAG or AI Workbench would add bloat ([1:17:05](?t=4625)). Developers can set up a backend themselves, and a lean `npm run init` plus a `.env.local` is enough. Tejas's one criticism is that an interactive init can't be driven by an agent. David has already covered that with CLI options: running `npm run` lists status, OpenRAG, workbench, launch and onboarding scripts with flags like `--status` and `--launch` ([1:18:19](?t=4699)).

## What's next

KillrCtx continues on GitHub, and the stream moves to a new project. At [1:20:05](?t=4805) Tejas pitches something like the meeting notetaker [Granola](https://www.granola.ai), but for in-person conversations. It's a wearable app, on something like an Apple Watch, that records meetings securely on the device with no cloud middleman. When your backend is reachable (on localhost, over Tailscale or ngrok, or in the cloud), it uploads the recording and runs a KillrCtx-style pipeline: chunking, vector embeddings and search. It's also exposed as an MCP server, so your agent can bring up something "you talked about some time ago" ([1:21:24](?t=4884)). David wants to search across many conversations at once, for example interviews at a conference ([1:22:27](?t=4947)). Tejas compares it to Kent C. Dodds's [Kody](https://github.com/kentcdodds/kody), a self-owned personal agent.

They take a summer break and plan to return in August, possibly twice a week, maybe even recording their own stream on the wearable ([1:24:20](?t=5060)). That idea became Walfly. Its first episode, [planning the Walfly MVP in IBM Bob's plan mode](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob), is episode 5 and part 1 of the [Walfly build](/projects/walfly).
