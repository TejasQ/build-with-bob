---
slug: killrctx
name: KillrCtx
title: "KillrCtx: Open-Source, Self-Hosted NotebookLM Alternative"
tagline: "A self-hosted, open-source NotebookLM clone: upload sources, chat with citations, and generate podcasts and mind maps on top of OpenRAG."
description: "KillrCtx is an open-source, self-hosted NotebookLM alternative for developers, built on OpenRAG or DataStax AI Workbench: cited chat, podcasts, mind maps."
status: "Shipped"
started: "2026-06-20"
repo: "https://github.com/TejasQ/killrctx"
order: 1
stack:
  - IBM Bob
  - Next.js
  - OpenRAG
  - Langflow
  - Docling
  - OpenSearch
  - ElevenLabs
  - React Flow
  - DataStax AI Workbench
  - Astra DB
---

KillrCtx (pronounced "killer context") is an open-source, self-hosted alternative to Google's NotebookLM. You create a notebook, add PDFs, Markdown, text or URLs, chat with them with cited sources, and generate notes: a two-host podcast, a mind map, a summary, an outline or a Q&A. Tejas and David built it live across the first four episodes of **Building with Bob**, with IBM Bob as their coding partner. The code is on GitHub at [TejasQ/killrctx](https://github.com/TejasQ/killrctx) under the MIT license. For the build explained step by step, read [how to build an open-source NotebookLM clone](/topics/build-notebooklm-clone).

## How KillrCtx works

KillrCtx is deliberately a thin Next.js app. [OpenRAG](https://github.com/langflow-ai/openrag) does the retrieval-augmented generation ([what OpenRAG is](/topics/openrag)):

- **Ingestion:** uploads go to OpenRAG, where [Docling](https://github.com/docling-project/docling) parses and chunks them and [OpenSearch](https://opensearch.org/) stores the vectors.
- **Scoping:** every notebook gets its own OpenRAG knowledge filter, so chat and generated notes only see that notebook's documents.
- **Chat:** OpenRAG's agent answers with retrieved, cited chunks.
- **Podcasts:** OpenRAG drafts a two-host script and [ElevenLabs](https://elevenlabs.io/) voices each turn; the MP3s are joined into one episode.
- **Mind maps:** a graphical, drill-down mind map rendered with [React Flow](https://reactflow.dev/) ([how the AI mind map works](/topics/ai-mind-map-react-flow)).
- **Backends:** OpenRAG or [DataStax AI Workbench](https://github.com/SonicDMG/ai-workbench) on Astra DB, chosen by an `npm run init` setup wizard.

## How it was built

1. **The kickoff** ([episode 1](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob)): a tour of the architecture, how notebooks map to OpenRAG knowledge filters, and a first live fix with Bob.
2. **Mind maps** ([episode 2](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob)): Bob recommends React Flow, [spec coding](/topics/spec-driven-development-ibm-bob) produces requirements, design and to-dos, and a prompt rewrite turns flat maps into nested ones.
3. **A setup wizard and a second backend** ([episode 3](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend)): DataStax AI Workbench joins OpenRAG, and most of the stream goes into specifying and testing `npm run init`.
4. **Debugging RAG backends** ([episode 4](/episodes/debugging-rag-backends-openrag-vs-ai-workbench)): parallel Bob Shell agents fix the wizard, URL ingestion hits 502s until Docling Serve is running, and the idea that becomes [Walfly](/projects/walfly) is pitched.

## Architecture at a glance

| Layer        | Choice                                                     |
| ------------ | ---------------------------------------------------------- |
| App          | Next.js (TypeScript, Tailwind CSS), local SQLite metadata  |
| RAG platform | OpenRAG: Langflow flows, Docling parsing, OpenSearch store |
| Alt backend  | DataStax AI Workbench on Astra DB                          |
| Audio        | ElevenLabs text-to-speech, one MP3 per script turn         |
| Mind maps    | React Flow                                                 |
| Agent        | IBM Bob (IDE and Bob Shell)                                |

## An open-source alternative to NotebookLM

KillrCtx covers NotebookLM's core loop (sources, grounded chat, generated notes and audio overviews) while running on infrastructure you control. Google's product has no self-hosted version: it was renamed [Gemini Notebook in July 2026](https://workspaceupdates.googleblog.com/2026/07/notebooklm-now-gemini-notebook.html), and even its Enterprise edition [runs inside Google Cloud](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/overview). If you want the same workflow on your own machine, you need an open-source alternative.

| Feature                  | KillrCtx                                                                | Google NotebookLM (Gemini Notebook) |
| ------------------------ | ----------------------------------------------------------------------- | ----------------------------------- |
| Hosting                  | Self-hosted; your RAG backend runs where you choose                     | Google-hosted only                  |
| Sources                  | PDFs, Markdown, text, URLs, whole directories                           | Uploads, links and web search       |
| Chat with citations      | Yes, answers show the retrieved chunks                                  | Yes                                 |
| Mind map                 | React Flow map with collapsible nodes and drill-down chats              | Yes                                 |
| Podcast / audio overview | Two-host script voiced by ElevenLabs                                    | Yes                                 |
| Summary, outline, Q&A    | Yes                                                                     | Yes (study guides and more)         |
| Code                     | [MIT on GitHub](https://github.com/TejasQ/killrctx), readable by design | Closed source                       |

### KillrCtx vs Open Notebook and other alternatives

KillrCtx is a developer learning tool, not the most complete NotebookLM replacement. Tejas says so directly: "I expect people to use KillrCtx exactly the way I just did, right? To learn. It's a learning tool" ([episode 4, 1:15:30](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4530)). The README calls it a teaching project where the source code "is not scary", and most files carry a header comment explaining why they exist.

If you want a polished end-user app, look at the established projects first (figures checked in September 2026):

- **[Open Notebook](https://github.com/lfnovo/open-notebook)** is the alternative most roundups name first (for example [KDnuggets](https://www.kdnuggets.com/open-notebook-a-true-open-source-private-notebooklm-alternative)), with about 40,000 GitHub stars and an MIT license. It supports 18+ AI providers, including Ollama for local models, runs with Docker, and generates podcasts with 1 to 4 speakers.
- **[SurfSense](https://github.com/MODSetter/SurfSense)** describes itself as an "air gapped, privacy focused open source NotebookLM alternative" and can generate two-host podcasts with a local voice model.

Where KillrCtx differs is the architecture. It is a thin Next.js front end over a full RAG platform (OpenRAG with Langflow, Docling and OpenSearch, or DataStax AI Workbench on Astra DB), and every step of building it is on video. That makes it the one to read if you want to learn how a NotebookLM clone works, or to build your own on an open RAG stack. To try it, start OpenRAG (or DataStax AI Workbench), clone the repo, run `npm install` and `npm run init`.
