---
slug: build-notebooklm-clone
title: "How to Build an Open-Source NotebookLM Clone (KillrCtx)"
h1: "How do you build an open-source NotebookLM clone?"
description: "How we built KillrCtx, a self-hosted NotebookLM alternative: OpenRAG for RAG, a React Flow mind map, ElevenLabs podcasts and a one-command setup."
answer: "Build it as a thin web app on top of a RAG backend. KillrCtx, our open-source NotebookLM clone, is a Next.js app that sends uploads and questions to OpenRAG (Docling, Langflow and OpenSearch), gives each notebook its own knowledge filter, generates notes and a React Flow mind map from grounded answers, and voices podcasts with ElevenLabs."
updated: "2026-09-30"
about:
  [
    "KillrCtx",
    "NotebookLM",
    "OpenRAG",
    "ElevenLabs",
    "React Flow",
    "DataStax AI Workbench",
    "IBM Bob",
  ]
episodes:
  - killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob
  - adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob
  - notebooklm-clone-setup-wizard-and-ai-workbench-backend
  - debugging-rag-backends-openrag-vs-ai-workbench
faq:
  - q: "Is there an open-source NotebookLM?"
    a: "Yes, several. Open Notebook (MIT, about 40k GitHub stars in September 2026) and SurfSense are the most complete end-user apps, with many model providers and multi-speaker podcasts. KillrCtx is smaller: an MIT-licensed teaching project that shows how a NotebookLM clone is wired on top of OpenRAG, so you can read and change the code."
  - q: "Can I self-host NotebookLM?"
    a: "No. Google's NotebookLM, renamed Gemini Notebook on 16 July 2026, is a hosted service only, available at notebooklm.google and in Google Workspace. To keep sources on your own machines, run an open-source alternative such as KillrCtx on OpenRAG, Open Notebook or SurfSense."
  - q: "How do I build a local NotebookLM?"
    a: "Run a RAG backend locally (we used OpenRAG, started with uvx), then put a small web app on top that creates notebooks, uploads sources, calls the backend's chat endpoint and stores notes. KillrCtx does this with Next.js, SQLite and the OpenRAG TypeScript SDK, and npm run init connects it to a running backend."
  - q: "How does KillrCtx keep each notebook's sources separate?"
    a: "Creating a notebook automatically creates an OpenRAG knowledge filter through the SDK, and the filter's data sources are kept in sync with that notebook's files. Chat and note generation pass the filter, so they only see that notebook's documents. Deleting a notebook deletes the filter and its documents too."
  - q: "How do you generate a NotebookLM-style podcast with ElevenLabs?"
    a: "In KillrCtx, OpenRAG first drafts a two-host script grounded in the notebook's sources. The app splits it into turns, calls the ElevenLabs text-to-speech endpoint once per turn with alternating voices, and concatenates the MP3 chunks into one file. ElevenLabs also has a separate Create Podcast API if you'd rather let it write the script."
  - q: "Is KillrCtx production-ready?"
    a: "No, and it isn't meant to be. Its README calls it a teaching project with no auth, rate limiting or multi-tenancy. On stream Tejas Kumar called it a learning tool for indie developers. Use it to understand how a NotebookLM clone works, or as a starting point."
---

Google's NotebookLM lets you drop sources into a notebook, chat with them with citations, and generate study aids and podcasts. On 16 July 2026 [Google renamed it Gemini Notebook](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/). It is still at notebooklm.google, and it is still hosted only. Over the first four episodes of Building with Bob, Tejas Kumar and David Jones-Gilardi built an open-source, self-hosted version called [KillrCtx](/projects/killrctx) (pronounced "killer context"), with IBM Bob writing most of the code. This guide walks through the architecture and the decisions behind it, with a timestamp for each one. The code is MIT-licensed at [TejasQ/killrctx](https://github.com/TejasQ/killrctx). Disclosure: both hosts work at IBM, which makes OpenRAG.

## What a NotebookLM clone needs

A NotebookLM clone needs three things: sources you upload, chat that is grounded in those sources with citations, and notes generated from them. Tejas opened episode 1 with a tour of NotebookLM. He added "Attention Is All You Need", got a study guide, generated a German debate-style podcast, and asked questions that came back with cited sources ([1:02](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=62), [2:05](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=125)). Google's [Workspace page](https://workspace.google.com/products/gemini-notebook/) lists the same core: answers that cite your uploaded sources, audio overviews and mind maps.

KillrCtx covers that core. It is "basically a self-hosted, meaning you can host it yourself, NotebookLM" ([4:41](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=281)). You create a notebook, add sources, chat with chunk-level citations, and generate a mind map, summary, outline, Q&A or podcast ([6:57](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=417)).

| Feature                  | NotebookLM / Gemini Notebook | KillrCtx (July 2026)                                                                                             |
| ------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Hosting                  | Google-hosted only           | Self-hosted, MIT                                                                                                 |
| Chat with citations      | Yes                          | Yes, with retrieved chunks shown                                                                                 |
| Podcast from sources     | Audio Overviews              | Two-host script voiced by ElevenLabs                                                                             |
| Mind map                 | Yes                          | React Flow map with drill-down conversations                                                                     |
| Summary, outline, Q&A    | Reports and study guides     | Yes                                                                                                              |
| Web research for sources | Yes                          | Not yet ([planned in episode 1](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=347)) |

## The architecture: a thin Next.js app on a RAG backend

Keep the app thin and let a RAG backend do the hard work. On the episode 1 diagram, KillrCtx either uploads or queries, and both paths go through the OpenRAG SDK to the OpenRAG API ([16:14](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=974)). Tejas summed it up: "our app, Killer Context, is actually really lean because it's just a thin wrapper around OpenRAG" ([16:45](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1005)). The front end "is just a big Next.js app" ([17:17](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1037)).

[OpenRAG](/topics/openrag) handles parsing (Docling), embedding and vector storage (OpenSearch) and an agentic query flow (Langflow). The app keeps its own state locally. David liked that "it's all like local storage, you have an SQL-like database that's local... but then it syncs automatically with what's going on in OpenRAG" ([35:39](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2139)). The [README](https://github.com/TejasQ/killrctx) says the API routes are mostly 30 to 50 lines each. They store metadata in SQLite and hand everything else to OpenRAG or ElevenLabs.

## One notebook = one knowledge filter

Scope retrieval per notebook with a filter, not with a separate index. When you create a notebook, KillrCtx uses the SDK to create an OpenRAG [knowledge filter](https://docs.openr.ag/knowledge-filters/) with the same name, so each notebook only searches its own documents ([21:39](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1299), [3:47](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=227)). You can narrow it further by selecting individual sources. Deleting a document or notebook "will actually cascade delete everything it needs to" in OpenRAG ([5:59](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=359)). In the code, [`src/lib/openrag.ts`](https://github.com/TejasQ/killrctx/blob/main/src/lib/openrag.ts) debounces the sync of the filter's data sources, because concurrent uploads could otherwise overwrite each other's view of the filter.

## Picking models at runtime

Read the model list from the backend so users can switch models inside your app. David asked Bob to use the OpenRAG SDK to "go get all my models" and build a picker, and Bob "almost one shot this" ([36:48](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2208)). When DataStax AI Workbench was added as a second backend, the same picker lists Workbench agents instead of models, because Workbench configures agents rather than raw models ([7:11](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=431)).

## Generated notes: summary, outline, Q&A and mind map

Each note type is a prompt to the grounded chat endpoint, followed by formatting on your side. The note types run asynchronously, so you can generate them all at once ([7:28](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=448)). At first they were "pretty bare-bones". The outline improved once David added collapsible sections and styling rather than relying "on whatever came back from the LLM" ([8:06](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=486), [8:38](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=518)). A later pass fixed the "wall of text" in summaries and Q&A with sections and tables ([10:42](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=642)).

The mind map started as "literally just markdown" ([9:47](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=587)). In [Building a NotebookLM-Style Mind Map with React Flow and IBM Bob](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob), Bob recommended [React Flow](https://reactflow.dev/) with D3 as a second choice, and the hosts picked React Flow partly because Langflow is built on it ([16:35](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=995), [17:06](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1026)). The first map came out flat because it just mirrors the hierarchy the LLM returns. The fix was in the prompt, not the renderer: ask for more than one level of nesting ([56:33](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3393), [1:02:37](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3757)). By episode 3, clicking a node opens a new conversation about that item, using its place in the tree and your documents as context ([12:24](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=744)). The full walkthrough is in our [AI mind map with React Flow guide](/topics/ai-mind-map-react-flow).

## Podcasts from your sources with ElevenLabs

Draft the script with RAG, then synthesize it turn by turn. KillrCtx "uses ElevenLabs to generate a podcast" from your sources ([7:02](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=422)). The script comes from the same agentic RAG pipeline as chat ([8:06](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=486)). For the demo, David cloned Tejas's voice from his videos, and Tejas's reaction was "You stole my voice. That's me" ([7:02](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=422), [7:33](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=453)).

The repo explains how it works. [`src/lib/podcast.ts`](https://github.com/TejasQ/killrctx/blob/main/src/lib/podcast.ts) asks OpenRAG for a HOST/GUEST script, splits it into turns, and calls the [ElevenLabs text-to-speech endpoint](https://elevenlabs.io/docs/api-reference/text-to-speech/convert) (`POST /v1/text-to-speech/{voice_id}`) once per turn with alternating voices. It then concatenates the `mp3_44100_128` chunks byte for byte, with no ffmpeg. The README also warns that ElevenLabs can move "default" voices into the paid library, so voice IDs that worked on a free key can start returning `402 paid_plan_required`. If you'd rather hand the whole job to ElevenLabs, its [Create Podcast API](https://elevenlabs.io/docs/api-reference/studio/create-podcast) generates and voices a two-speaker conversation from text or a URL.

## Swappable backends: OpenRAG or DataStax AI Workbench

Support more than one RAG backend only if you're ready to write code for each one. In episode 3 David added DataStax AI Workbench on Astra DB as a second backend, and each notebook shows which backend it uses ([2:38](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=158), [4:09](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=249)). From the notebook's point of view "the interface is identical", apart from agents replacing models ([7:11](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=431)).

The cost showed up in episode 4. "There's no like universal" API across Workbench, OpenRAG, Pinecone or Chroma, so "for every new platform you then expand to support, you then have to have all of this logic to handle specific cases" ([1:14:11](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4451), [1:14:46](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4486)). The [OpenRAG guide](/topics/openrag) compares the two backends in detail.

## Getting it running locally: npm run init

Don't bundle the backend. Ask for its URL and key, and ship a wizard. In episode 3 the hosts decided KillrCtx should not be a monolith. It takes optional pairs of environment variables (an OpenRAG URL and API key, and/or an AI Workbench URL and key), "we'll just ship a baby" ([26:49](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1609), [27:37](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1657)). They then spec-coded an `npm run init` wizard with Bob ([31:10](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1870)). The spec asked it to detect Docker, Colima or another runtime and offer to install one if none existed, and on stream it started Colima by itself ([1:00:00](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3600), [1:22:43](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4963)).

By episode 4, David had "focused less on trying to auto install things" ([4:12](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=252)). The current [`scripts/setup.mjs`](https://github.com/TejasQ/killrctx/blob/main/scripts/setup.mjs) says it "does NOT install anything". It detects OpenRAG and AI Workbench, collects keys and writes `.env.local`. Two details are worth copying:

- **Gate the launch.** The wizard refuses to launch until at least one backend is configured ([41:00](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2460)).
- **Add flags for agents.** Tejas asked for non-interactive options "then an agent can do it" ([1:13:27](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4407)). The result is `--status`, `--configure openrag|workbench|all` and `--launch` ([1:18:19](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4699)).

As of the July 2026 code, setup is: start OpenRAG (default `http://localhost:3000`), then `git clone https://github.com/TejasQ/killrctx`, `npm install`, `npm run init`, and open `http://localhost:3001`.

## Staying useful offline: read-only mode

When the backend goes down, keep showing what's stored locally. KillrCtx polls backend health, and if a backend disappears, its notebooks switch to read-only ([4:46](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=286)). "The information is local. There's no reason I should not be able to access that just because something is gone." Saved notes and podcasts still play, while chat and new notes are disabled ([6:29](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=389)).

## Hosting: the front end is easy, the backend is hard

The Next.js front end deploys anywhere. The RAG backend is what makes hosting hard. Tejas pointed out that KillrCtx "is just a front end", so it could go to Vercel, Netlify or Cloudflare, "but a system like Workbench or OpenRAG is somewhat more challenging to deploy" ([49:06](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2946)). In July 2026, AI Workbench had no hosted version, and you had to run it yourself ([46:55](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2815)). The hosts left the hosting question for later ([50:09](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3009)).

Be clear about what you're building. Asked how people should use it, Tejas said: "I expect people to use Killer Context exactly the way I just did, right? To learn. It's a learning tool" ([1:15:30](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4530)). If you want a polished end-user app today, [Open Notebook](https://github.com/lfnovo/open-notebook) supports 18+ model providers including Ollama, 1 to 4 podcast speakers and a REST API. [SurfSense](https://github.com/MODSetter/SurfSense) is another privacy-focused option. If you want to see how the pieces fit, the four episodes and [Debugging KillrCtx RAG Backends: OpenRAG vs AI Workbench](/episodes/debugging-rag-backends-openrag-vs-ai-workbench) show every step, including the bugs. For how Bob was used along the way, see [What is IBM Bob?](/topics/ibm-bob) and [coordinating coding agents](/topics/coordinating-coding-agents).
