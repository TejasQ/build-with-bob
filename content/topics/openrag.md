---
slug: openrag
title: "What Is OpenRAG? Langflow, Docling and OpenSearch in One"
h1: "What is OpenRAG?"
description: "OpenRAG explained from a real build: how Langflow, Docling and OpenSearch fit, the TypeScript SDK, agentic RAG, notebook filters and common errors."
answer: "OpenRAG is an open-source, Apache-2.0 retrieval-augmented generation platform from the Langflow team at IBM. One install bundles Docling for document parsing, Langflow for the ingestion and agent flows, and OpenSearch for vector storage, then exposes it all through an API, Python and TypeScript SDKs and an MCP server. We built KillrCtx, a NotebookLM clone, on it."
updated: "2026-09-30"
about:
  ["OpenRAG", "Langflow", "Docling", "OpenSearch", "KillrCtx", "DataStax AI Workbench"]
episodes:
  - killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob
  - adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob
  - notebooklm-clone-setup-wizard-and-ai-workbench-backend
  - debugging-rag-backends-openrag-vs-ai-workbench
faq:
  - q: "OpenRAG vs OpenSearch: what's the difference?"
    a: "OpenSearch is one component inside OpenRAG. It is the search engine that stores the vectors and runs similarity search. OpenRAG wraps it together with Docling for parsing and Langflow for the ingestion and agent flows, and adds an API, SDKs and a UI, so you get a whole RAG pipeline rather than just a vector store."
  - q: "Does OpenRAG have an MCP server?"
    a: "Yes. As of September 2026 the OpenRAG README says every instance ships a built-in MCP server over streamable HTTP at /mcp, authenticated with the same API key as the REST API. It exposes tools for chat, semantic search, ingestion, knowledge filters and settings. The older standalone openrag-mcp package is deprecated."
  - q: "Is OpenRAG open source?"
    a: "Yes. The langflow-ai/openrag repository is licensed Apache-2.0, and its three main components are open source too: Langflow, Docling (MIT, started at IBM Research) and OpenSearch (Apache-2.0, a Linux Foundation project). You run the whole stack yourself, locally or on your own servers."
  - q: "How do I install OpenRAG?"
    a: "The quickstart runs uvx --python 3.13 openrag in an empty folder. That launches a terminal UI which asks for OpenSearch and Langflow admin passwords and then starts the containers. If you're developing OpenRAG itself, clone the repo and use its Makefile instead. You need Docker or Podman either way."
  - q: "Why are all my OpenRAG document ingests failing?"
    a: "Check that docling-serve is running. In episode 4 every source failed because OpenRAG hadn't started docling-serve, so nothing could be converted. Starting it fixed ingestion at once. The OpenRAG troubleshooting docs also flag docling-serve version mismatches and low container memory as common causes."
  - q: "Can one vector index hold embeddings from different models?"
    a: "In OpenRAG, yes. David Jones-Gilardi explained on stream that OpenRAG stores metadata about which embedding model produced each vector. You can ingest one document with one model, switch models at runtime and ingest the next, and the agent picks the right model at query time."
  - q: "What is the difference between agentic RAG and traditional RAG?"
    a: "Traditional RAG runs one similarity search for your query and hands the results to the model in a single shot. Agentic RAG gives an agent the search tools and lets it run its own searches and iterate through the documents before answering. OpenRAG's query flow is agentic: the Langflow agent treats OpenSearch and the embedding model as tools."
---

We built our first app on the show, [KillrCtx](/projects/killrctx), on top of [OpenRAG](https://github.com/langflow-ai/openrag), and spent four livestreams using it and occasionally breaking it. This guide collects what we learned about how OpenRAG works, how to call it from a Next.js app, and what went wrong. Every observation links to the moment in the episode where it happened. One disclosure: Tejas Kumar and David Jones-Gilardi both work at IBM, and OpenRAG comes from IBM's Langflow team, so take our enthusiasm with that in mind.

Also note the name clash. "OpenRAG" is also the name of an academic RAG benchmark and dataset. This page is about the software platform at `langflow-ai/openrag`.

## What is OpenRAG?

OpenRAG is a single-install platform that combines three existing open-source projects into a working retrieval-augmented generation pipeline. The repo describes it as "a comprehensive, single package Retrieval-Augmented Generation platform built on Langflow, Docling, and Opensearch" and it is licensed Apache-2.0 ([GitHub](https://github.com/langflow-ai/openrag)). The [docs](https://docs.openr.ag/) call it "an open-source package for building agentic RAG systems."

In episode 1, David explained why the bundle matters. A real RAG pipeline has to parse messy PDFs with tables and images, turn them into something an LLM can read, embed the text, store the vectors and run an agent over them. "OpenRAG really is a platform... that does all of that for you in a single install" ([9:02](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=542), [9:40](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=580)). When Tejas called it a wrapper, David pushed back:

> "It wraps them, but it's a bit more than that. It is not just a wrapper... There's an SDK." (David Jones-Gilardi, [10:44](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=644))

In September 2026, the [`openrag` package on PyPI](https://pypi.org/project/openrag/) was at version 0.7.1 (released 31 August 2026) and required Python 3.13 or newer. The repo had about 4,600 GitHub stars.

## How Langflow, Docling and OpenSearch divide the work

Langflow runs two flows, one for ingestion and one for queries, and calls Docling and OpenSearch from inside them. Tejas drew the architecture live in [KillrCtx: An Open-Source NotebookLM Clone on OpenRAG and IBM Bob](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob) ([11:19](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=679)):

- **Ingestion flow.** An upload goes through OpenRAG to Langflow, and Langflow sends it to [Docling](https://github.com/docling-project/docling), which "converts it into formats ready for LLMs, like Markdown or JSON" ([12:25](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=745)). The text is then embedded, and "these vectors go live in OpenSearch" ([12:59](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=779)).
- **Query flow.** A question goes through OpenRAG to an agent running in [Langflow](https://docs.langflow.org/). David corrected the first version of the diagram: the agent is "essentially using everything as tools", including OpenSearch and the embedding provider ([14:03](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=843)).

Tejas repeated the plain-English version at the start of episode 2: the app talks to OpenRAG through the SDK, queries go to a Langflow agent, and uploads go through Docling into [OpenSearch](https://opensearch.org/) ([2:39](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=159)). The official [architecture overview](https://docs.openr.ag/) lists the same pieces as containers: the OpenRAG backend, a Langflow container, Docling Serve, external connectors and the OpenRAG frontend.

| Component  | Job inside OpenRAG                                           | Upstream project                                                                               |
| ---------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Docling    | Parses PDFs, slides, HTML, audio and more into Markdown/JSON | [docling-project/docling](https://github.com/docling-project/docling) (MIT, from IBM Research) |
| Langflow   | Runs the ingestion flow and the agentic query flow           | [Langflow](https://docs.langflow.org/) (open source, Python)                                   |
| OpenSearch | Stores vectors and runs semantic and hybrid search           | [OpenSearch](https://opensearch.org/) (Apache-2.0, Linux Foundation)                           |

## Agentic RAG vs traditional RAG

OpenRAG does agentic RAG: an agent decides which searches to run and iterates through them, instead of making one retrieval call per question. David drew the line clearly in episode 1:

> "Agentic RAG is wholly different from traditional RAG. This is not a case where you're just getting a one-shot response from a query that you asked against a vector store... It's going to do underlying searches on its own. It's going to iterate through stuff to give you the best answer." (David Jones-Gilardi, [14:34](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=874), [15:12](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=912))

There is a practical side effect. The KillrCtx code comments note that OpenRAG's agent decides for itself when to call its retrieval tool, and a short prompt like "explain" may not trigger it. The app wraps every notebook prompt with an explicit "use the retrieval tool first" instruction ([KillrCtx README](https://github.com/TejasQ/killrctx#3-the-retrieval-trick)).

## Embedding models: switch at runtime, mix in one index

OpenRAG lets you change the embedding model at runtime and keep vectors from several models in the same index. The embedding models on offer depend on the provider you connect (OpenAI, Ollama, Anthropic, watsonx and so on), and "you could upload one document using one embedding model... and then change it, and then... ingest another set using another one" ([12:59](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=779)). David said this is usually hard without the plumbing OpenRAG provides ([10:44](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=644)). It works because OpenRAG stores metadata about which model made each vector, so the agent "will automatically... kick off the correct one" at query time ([14:34](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=874)).

## Using the OpenRAG TypeScript SDK from Next.js

KillrCtx talks to OpenRAG only through the official `openrag-sdk` package, which calls the OpenRAG API for it. On the diagram, the SDK sits between the app and the API ([16:14](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=974)). When Tejas asked whether it was TypeScript, David answered: "TypeScript, Python. Yeah, there's MCP as well" ([16:45](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1005)).

In September 2026, the [TypeScript SDK](https://github.com/langflow-ai/openrag/tree/main/sdks/typescript) installs with `npm install openrag-sdk`. It reads `OPENRAG_API_KEY` and `OPENRAG_URL` (default `http://localhost:3000`), and exposes `chat.create()`/`chat.stream()`, `search.query()`, `documents.ingest()`/`documents.delete()`, `knowledgeFilters.create()`/`delete()` and `settings`. KillrCtx's [`src/lib/openrag.ts`](https://github.com/TejasQ/killrctx/blob/main/src/lib/openrag.ts) uses most of these. Three patterns are worth copying:

- **One knowledge filter per notebook.** Creating a notebook automatically creates an OpenRAG [knowledge filter](https://docs.openr.ag/knowledge-filters/), so chat and generated notes only see that notebook's documents ([21:39](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1299), [3:47](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=227)). The docs describe a filter as capturing "a specific subset of documents" by data source, document type, owner, connector, result limit and score threshold.
- **Cascade deletes.** Deleting a document or notebook in the app removes the matching data in OpenRAG "to keep OpenRAG nice and clean" ([5:59](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=359)).
- **Runtime model lists.** The model picker reads the available models from OpenRAG, so users can switch models without opening the OpenRAG UI ([36:14](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2174)). The code comment notes that the SDK has no models endpoint yet, so this call uses a raw fetch.

### Give your coding agent an OpenRAG SDK skill

David gave IBM Bob a skill describing the OpenRAG SDK and where it lives. Then he told it "I know the SDK does this... Go get all my models. Let's make a picker", and Bob "almost one shot this" ([36:48](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2208), [37:22](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2242)). If your agent keeps guessing at a young SDK's API, write a skill like this. For more on Bob skills, see [IBM Bob features in practice](/topics/ibm-bob-features-in-practice).

## Running OpenRAG: uvx vs make

Run OpenRAG with `uvx` unless you're changing OpenRAG itself. The [quickstart](https://docs.openr.ag/quickstart/) (September 2026) needs Python 3.13, `uv` and an OpenAI API key for onboarding. You make an empty workspace folder and run `uvx --python 3.13 openrag`, which opens a terminal UI, asks for OpenSearch and Langflow admin passwords, and starts the services. Per the [install docs](https://docs.openr.ag/install-options/), `uvx` installs Docker or Podman if neither is present.

The hosts run it differently. At the end of episode 2, Tejas restarted his source checkout with the Makefile, and David said: "If I'm doing dev, I use make, but if I'm not deving on it, I'll just use uvx" ([1:13:10](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4390)). Running from `main` pulled a new Docker image that "kind of broke my thing", which Tejas took as a reason to prefer `uvx` ([1:13:42](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4422)).

Two details from the streams:

- **Warm-up errors are normal.** Right after a restart, the health checks were "all 500ing because they're not yet ready" (Tejas thought 503 would be more accurate) before everything came up ([1:14:49](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4489)).
- **Port 3000 is the default.** KillrCtx's wizard looks for OpenRAG on port 3000 because "that's where OpenRAG installs itself by default" ([22:30](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1350)). That's why KillrCtx itself runs on 3001.

## Troubleshooting: every ingest fails, or SDK calls are refused

Most OpenRAG errors we hit came from a supporting service that wasn't running, not from OpenRAG itself.

### Every ingest failed: docling-serve wasn't running

In [Debugging KillrCtx RAG Backends: OpenRAG vs AI Workbench](/episodes/debugging-rag-backends-openrag-vs-ai-workbench), every source failed to ingest. The cause was that "OpenRAG decided to not start docling-serve", so "it wouldn't be able to ingest anything" ([1:06:05](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3965)). David noted that running `uvx openrag` gives you an option to start docling-serve ([1:08:23](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4103)). Once it was up, retries indexed and "the whole problem was docling-serve" ([1:09:25](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4165)). They also had Bob surface the upstream error in the app in a friendlier way ([1:06:37](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3997)). The official [troubleshooting page](https://docs.openr.ag/support/troubleshoot/) adds two causes: a docling-serve version that doesn't match your OpenRAG version, and containers with less than 8 GB of RAM.

### No API key, no SDK calls

The SDK needs an OpenRAG API key: "If you don't have that, it's not going to be able to talk to OpenRAG" ([51:00](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3060)). In episode 2, OpenSearch also "rejected my credential" until the stack was restarted ([1:12:39](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4359)). The docs note that `OPENSEARCH_PASSWORD` has to meet OpenSearch's complexity rules.

## OpenRAG vs DataStax AI Workbench as a RAG backend

Both give you a complete agentic RAG pipeline. In July 2026, OpenRAG was the more mature of the two. DataStax AI Workbench is a tool from the Astra team that sits on [Astra DB](https://docs.datastax.com/en/astra-db-serverless/index.html) and adds agents and "knowledge bases". David explained that if you create a knowledge base, "it will create all of the artifacts in Astra I need. All I need to do is give it a key" ([45:29](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2729), [46:00](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2760)). In KillrCtx, a Workbench notebook lists Workbench agents where an OpenRAG notebook lists models ([7:11](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=431)).

The differences we saw, dated to July 2026:

- **Maturity.** Workbench was version 0.5, "not like a GA release thing" ([55:44](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3344)), and "not SaaS-ified yet", so you host it yourself ([46:55](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2815)).
- **Configuration.** Workbench settings wanted a reference to an environment variable rather than the token itself, which Tejas called "pretty hostile developer experience" ([1:02:54](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3774), [1:03:26](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3806)). A notebook also ended up on a mock embedder and returned 502s ([44:57](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2697)). David's fair summary: "it hasn't quite matured yet" ([1:13:19](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4399)).
- **Portability.** Neither has one API that other RAG backends share, so every backend you support needs its own code ([1:14:11](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4451)).

## Beyond notebooks: OpenRAG as a policy source for an LLM judge

OpenRAG works as a general knowledge base for agents, not only as a notebook backend. At the end of episode 2, Tejas showed a talk demo about LLM-as-a-judge. A judge got better once it was given the relevant policy, and "OpenRAG is the best thing to serve policies to judges" because it can hold "everything in my company" and fetch the policy that fits the question ([1:12:08](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4328)). After he uploaded a refund policy, OpenRAG answered with the 14-day rule and cited it ([1:15:20](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4520)).

To see how the rest of the app sits on OpenRAG, read [how to build an open-source NotebookLM clone](/topics/build-notebooklm-clone). For the tool that wrote most of the code, see [What is IBM Bob?](/topics/ibm-bob). The spec-driven setup wizard is in [Spec Coding a Setup Wizard for an Open-Source NotebookLM Clone](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend).
