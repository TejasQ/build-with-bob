---
slug: killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob
videoId: TvdoO55fG4g
title: "KillrCtx: An Open-Source NotebookLM Clone on OpenRAG"
description: "Meet KillrCtx, a self-hosted NotebookLM clone: how OpenRAG wires Langflow, Docling and OpenSearch, then a first IBM Bob fix, live."
tldr: "Tejas and David introduce KillrCtx, an open-source, self-hosted NotebookLM clone built with Next.js on top of OpenRAG. They compare it with Google NotebookLM, map out how OpenRAG's Langflow, Docling and OpenSearch pipeline powers ingestion and chat, then use IBM Bob to fix misaligned panel headers. The first vague prompt made things worse; a precise one fixed it."
project: killrctx
topics:
  [
    "open source notebooklm alternative",
    "self-hosted rag",
    "agentic rag",
    "rag pipeline architecture",
    "knowledge filters",
    "spec coding",
    "prompt precision",
    "css layout debugging",
  ]
tools:
  [
    "IBM Bob",
    "Bob Shell",
    "OpenRAG",
    "Langflow",
    "Docling",
    "OpenSearch",
    "Next.js",
    "TypeScript",
    "Google NotebookLM",
    "Gemini",
    "ElevenLabs",
    "OpenAI",
    "Ollama",
    "GitHub",
  ]
takeaways:
  - "A NotebookLM-style app can stay a thin client: KillrCtx is a Next.js app that hands ingestion, embeddings, vector search and the chat agent to OpenRAG through its TypeScript SDK."
  - "OpenRAG runs two Langflow flows: an ingestion flow (Docling converts files to LLM-ready Markdown or JSON, an embedding model vectorizes them, OpenSearch stores them) and a query flow driven by an agent."
  - "In agentic RAG the agent treats search and embeddings as tools and iterates over documents on its own, rather than returning a single one-shot vector lookup."
  - "Embedding models in OpenRAG aren't hardcoded: you can switch provider or model at runtime and even mix embedding models within the same index."
  - "One notebook maps to one OpenRAG knowledge filter, which scopes chat and generated notes to that notebook's documents without separate indexes."
  - "Vague prompts get vague fixes: Bob's first two attempts at aligning headers made the layout worse, and naming the cause (a taller select component) and the fix (one fixed height for all three headers) solved it."
  - "Giving the agent a skill for your SDK pays off: with an OpenRAG SDK skill, Bob almost one-shot a runtime model picker."
faq:
  - q: "What is KillrCtx?"
    a: "KillrCtx (pronounced 'killer context') is a fully open-source, self-hosted NotebookLM clone. You create notebooks, add sources, chat with them and get answers with the chunks they came from, and generate a mind map, summary, outline, Q&A or podcast. It is a thin Next.js app that uses OpenRAG as its RAG backend, and the code is at github.com/TejasQ/killrctx."
  - q: "Is there an open-source alternative to Google NotebookLM?"
    a: "Yes. KillrCtx is an open-source, self-hosted NotebookLM clone that Tejas Kumar and David Jones-Gilardi build on Building with Bob. You create notebooks, upload sources, chat with them with cited chunks, and generate a podcast, mind map, summary, outline or Q&A. It runs on OpenRAG for the RAG backend."
  - q: "What is OpenRAG?"
    a: "OpenRAG is an open-source agentic RAG platform from IBM that combines Langflow, Docling and OpenSearch into one install. It handles document parsing, embeddings, vector storage and an agent that answers questions, and it exposes TypeScript and Python SDKs plus an MCP server."
  - q: "How does OpenRAG's ingestion pipeline work?"
    a: "A file goes through OpenRAG into a Langflow ingestion flow. Docling converts it into LLM-ready formats such as Markdown or JSON, an embedding model turns the chunks into vectors, and the vectors are stored in OpenSearch. The embedding model depends on which provider you have configured."
  - q: "What is the difference between agentic RAG and traditional RAG?"
    a: "Traditional RAG runs one query against a vector store and returns a set of results. In agentic RAG, as David explains in this episode, an agent uses search and embeddings as tools, runs its own follow-up searches and iterates through documents to build the best answer."
  - q: "Can you mix embedding models in one vector index?"
    a: "In OpenRAG, yes. David explains that the embedding model isn't hardcoded: you can switch provider or model at runtime, ingest one batch of documents with one model and the next with another, and keep both in the same index. OpenRAG stores which model produced each document's vectors so the agent queries with the right one."
  - q: "How does KillrCtx keep each notebook's documents separate?"
    a: "Creating a notebook automatically creates a knowledge filter in OpenRAG. Chat and generated notes in that notebook only use documents matching the filter, and you can narrow it further by selecting specific sources."
  - q: "How do I get started with IBM Bob?"
    a: "Search for IBM Bob, download the IDE for your machine's architecture, or install Bob Shell, the command-line version. Tejas uses Bob Shell as his daily driver, while David prefers the IDE for larger codebases where he wants to view multiple diffs at once."
  - q: "Why did IBM Bob make my CSS fix worse?"
    a: "In this episode the first prompt only said the headers didn't align, so Bob adjusted vertical padding and made it worse. Once the hosts explained that a select component made one header taller and asked for all three headers to share a fixed height, Bob fixed it."
---

KillrCtx is an open-source NotebookLM clone you host yourself: you drop documents into a notebook, chat with them, and generate podcasts, mind maps and summaries, all running on infrastructure you control. In episode 1 of Building with Bob, which is also part 1 of the KillrCtx build, Tejas Kumar and David Jones-Gilardi tour the app, take apart the OpenRAG pipeline underneath it, and use IBM Bob to fix a layout bug live. It's a compact introduction to how a self-hosted NotebookLM alternative can be built as a thin app on top of a full RAG platform. For the whole build in one place, read [how to build an open-source NotebookLM clone](/topics/build-notebooklm-clone).

## What is IBM Bob?

[IBM Bob](https://bob.ibm.com/) is IBM's AI coding agent, in the same category as Codex, Claude Code and Cursor, as Tejas puts it in the first seconds of the stream ([0:00](?t=0)). The show is simple: the two hosts, both on IBM's watsonx.data developer advocacy team, build real open-source software with Bob and show what happens. If you want the longer version, read [what IBM Bob is](/topics/ibm-bob) and [how it compares with Claude Code, Cursor and Codex](/topics/ibm-bob-vs-claude-code-cursor-codex).

## What does Google NotebookLM do, and why clone it?

[NotebookLM](https://notebooklm.google/) is Google's research tool that grounds answers in sources you give it, and it's the product KillrCtx sets out to reproduce in the open. Tejas demos it at [1:02](?t=62): he creates a notebook, adds the ["Attention Is All You Need"](https://arxiv.org/abs/1706.03762) paper, and within seconds gets a study guide. He generates a podcast in the "debate" style, in German ([2:05](?t=125)), asks "who wrote this?" and gets a cited answer, then has NotebookLM search the web for more sources and import them all ([2:36](?t=156)).

The name follows from that. NotebookLM lets you pile up context and synthesizes it, "and so we're calling it killer context, because context is really everything here" ([3:40](?t=220)). The project is written KillrCtx and lives at [github.com/TejasQ/killrctx](https://github.com/TejasQ/killrctx). Tejas describes it at [4:41](?t=281) as fully open source and "basically a self-hosted NotebookLM."

## What does KillrCtx look like today?

KillrCtx already works end to end: notebooks, source upload, cited chat and a studio panel of generated notes. Tejas walks through it starting at [5:13](?t=313):

1. **Create a notebook.** He calls his "my machine learning journey."
2. **Add sources.** The same attention paper gets uploaded and indexed ([5:47](?t=347)). For now sources come only from your machine. Tejas would like a web-research flow like Google's, and David thinks OpenRAG has options for that.
3. **Chat.** Asking "who wrote this?" returns an answer along with the chunks it used ([6:25](?t=385)). The PDF now shows up as Markdown, which comes up again in the architecture discussion.
4. **Generate notes.** The studio has mind map, summary, outline, podcast and Q&A ([6:57](?t=417)). They run asynchronously and in parallel, so Tejas clicks every one.

David is upfront that these note types are "pretty bare-bones right now" ([7:28](?t=448)). The mind map, for example, is structured text rather than an actual graphical mind map. There's also a rainbow-gradient model selector, which Tejas thinks is a bit much and David is proud of.

The [repo README](https://github.com/TejasQ/killrctx) fills in the rest of the stack: Next.js and TypeScript on the front end, SQLite for local metadata, and [ElevenLabs](https://elevenlabs.io/) for synthesizing the two-host podcast audio.

## What is OpenRAG, and how does it power a self-hosted NotebookLM?

OpenRAG is the open-source RAG platform from the Langflow team at IBM (not the [OpenRAG research paper](https://arxiv.org/abs/2503.08398) on retriever training), and KillrCtx hands all of its RAG work to it. [OpenRAG](https://github.com/langflow-ai/openrag) bundles [Docling](https://github.com/docling-project/docling), [Langflow](https://www.langflow.org/) and [OpenSearch](https://opensearch.org/) into one agentic RAG pipeline. David explains it at [9:02](?t=542). A real RAG pipeline needs ingestion, parsing of tables, images and text, conversion into a format LLMs handle well, embeddings, a vector store and an agent:

> OpenRAG really is a platform, an open-source platform, that does all of that for you in a single install.
> — David, [9:40](?t=580)

He's clear that it isn't just a wrapper ([10:44](?t=644)). It couples its components tightly and ships an SDK. You configure embedding providers by choosing a model, and it can hold multiple embedding models in the same index, which normally takes a lot of plumbing. The [OpenRAG guide](/topics/openrag) collects everything the build taught us about it.

### The ingestion flow: Langflow, Docling and OpenSearch

Tejas redraws the diagram from an earlier session at [11:19](?t=679). Inside OpenRAG, Langflow runs two flows. The ingestion flow is what happens when you upload a file ([11:53](?t=713)):

1. A PDF, PNG, WebM, MP3 or other file goes to OpenRAG, then to Langflow.
2. Docling, running inside Langflow, converts it into LLM-ready formats such as Markdown or JSON ([12:25](?t=745)). That's why the uploaded PDF shows up as Markdown in the chat citations.
3. An embedding model turns the content into vectors.
4. The vectors are stored in OpenSearch.

Tejas assumes the embedding model is fixed. David corrects him: it depends on the configured provider. Tejas's instance uses OpenAI, but you could plug in Ollama, Anthropic or watsonx, and you can change the model at runtime, ingesting one batch of documents with one model and the next batch with another ([12:59](?t=779)).

### The query flow: agentic RAG vs traditional RAG

The query flow is the "who wrote this?" path ([13:32](?t=812)). The question goes through OpenRAG into Langflow, where an agent handles it. At [14:03](?t=843) David refines the diagram: the agent uses everything, including OpenSearch and the embedding providers, as tools, and stored metadata tells it which embedding model to use for each document.

> A big agentic RAG agent, and I make that distinction because agentic RAG is wholly different from traditional RAG.
> — David, [14:34](?t=874)

Agentic RAG differs from traditional RAG in who drives the search. As David explains at [15:12](?t=912), traditional RAG sends one query to a vector store and returns a set of results. An agentic RAG agent works through the documents, runs its own follow-up searches and iterates toward the best answer.

## Where does KillrCtx sit in the architecture?

KillrCtx is a thin Next.js app that talks to OpenRAG through the OpenRAG SDK. The final diagram ([15:44](?t=944)) goes user → KillrCtx → OpenRAG SDK → OpenRAG API, which then forks into the ingestion and query flows.

> Our app, Killer Context, is actually really lean because it's just a thin wrapper around OpenRAG.
> — Tejas, [16:45](?t=1005)

The SDK comes in TypeScript and Python, and there's an MCP server too. KillrCtx uses the TypeScript one ([OpenRAG API and SDK docs](https://docs.openr.ag/reference/api-sdk-overview)). Bob isn't in the diagram, and Tejas explains why at [17:17](?t=1037): the diagram shows how the app is used, and Bob belongs to the development workflow as the agent that writes the code.

### How notebooks map to OpenRAG knowledge filters

Each KillrCtx notebook corresponds to an OpenRAG [knowledge filter](https://docs.openr.ag/knowledge-filters). David shows this with the OpenRAG UI open beside the app ([21:39](?t=1299)). His test data is a set of RPG characters from a card-battling game he made. Creating the notebook "the story of Tejas" automatically created a matching filter, which limits the shared knowledge base to that notebook's documents. He asks for a table of every hero's stats ([22:54](?t=1374)), then selects just one source, Berserker Korg, and generates a mind map scoped to that character alone ([23:25](?t=1405)). Chat history and deletes sync between KillrCtx and OpenRAG. Later, at [35:39](?t=2139), David adds that the app keeps its state in fast local storage and a local database, and syncs it with OpenRAG automatically.

## How do you get started with IBM Bob?

To get started, search for IBM Bob, download the build for your machine, or install Bob Shell for the terminal ([19:32](?t=1172)). Tejas skips the "free trial vs. download" question and just downloads it. He mostly uses [Bob Shell](https://bob.ibm.com/) rather than the VS Code-based IDE: "this is my daily driver" ([20:02](?t=1202)).

David prefers the IDE for day-to-day coding ([25:07](?t=1507)). He uses Bob Shell for deployments and lower-level system work, and the IDE once a codebase gets bigger and he wants to view multiple diffs at once. Both have the same capabilities, so it comes down to preference. They also work differently: Tejas runs the CLI in YOLO mode, while David reads what Bob plans to do before granting permission ([28:48](?t=1728)).

## Live debugging: fixing misaligned headers with Bob

The first task is small on purpose. With about 20 minutes left, the mind map is too big, so Tejas points out that the Sources, Conversations and Studio panel headers don't line up ([18:24](?t=1104)). David takes a full-page screenshot, pastes it into Bob and deliberately keeps the prompt vague: the headers don't align, how can we fix that? ([25:48](?t=1548)).

It takes three attempts:

| Attempt | Instruction to Bob                                                   | Result                                                       |
| ------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1       | Screenshot plus "the headers don't align, how can we fix that?"      | Layout got worse ([29:50](?t=1790))                          |
| 2       | Sources and Studio should conform to the Conversations header height | Bob reduced vertical padding; worse again ([32:04](?t=1924)) |
| 3       | Give all three headers the same fixed height                         | Bob chose 37 pixels; headers aligned ([33:19](?t=1999))      |

The key clue comes from Tejas at [30:22](?t=1822): the model select component in one header takes up more vertical space than anything in the other two, which pushes the others out of line. His advice is to name that cause and ask for a deterministic height for all three headers. Once the instruction is that precise, the fix works first time. David takes the lesson:

> My first instruction was kind of vague. This is something I've definitely learned with agents. When we gave it exact instructions, it did much better.
> — David, [33:52](?t=2032)

He then asks Bob to commit and push to main ([34:23](?t=2063)).

## Why does David prefer spec coding over vibe coding?

David uses a spec coding process for every new feature, because it gets a complete feature built faster than vibe coding. Bob produces requirements, a design and a to-do list, talks the plan through with him, and creates a feature branch before writing code ([27:29](?t=1649)). He set this up as a project-level skill in Bob, which is why Bob reports using a skill even for the header fix ([26:53](?t=1613)). The header task was too small to need the full process, and the hosts count it as vibe coding. David's point is that for real features, the spec route gets to a complete feature faster ([28:01](?t=1681)). The full workflow is written up in [spec-driven development with IBM Bob](/topics/spec-driven-development-ibm-bob).

Skills also explain one of his favorite features. The rainbow model picker lets you switch OpenRAG's LLM at runtime from inside KillrCtx. He gave Bob an OpenRAG SDK skill, told it the SDK could list models, and asked for a picker with a rainbow gradient. Bob "almost one-shot this" ([36:48](?t=2208)). He demos it by switching to gpt-oss 120B cloud and refreshing ([37:22](?t=2242)). David says everything he has added to the project, from note types to full create-and-delete support, was built with Bob ([36:14](?t=2174)).

## What's next

The mind map is the next job. Both hosts want it to become an actual graphical mind map, and Tejas wants a long session to explore it properly rather than squeezing it into the last ten minutes ([34:23](?t=2063)). [Part 2 of the KillrCtx build](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob) takes on the mind map using David's spec coding process, and the [AI mind map with React Flow guide](/topics/ai-mind-map-react-flow) follows it to the finished feature. Follow the whole build on the [KillrCtx project page](/projects/killrctx).
