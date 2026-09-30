---
slug: ai-mind-map-react-flow
title: "AI Mind Map From Your Sources: React Flow + LLM Guide"
h1: "How do you build an AI mind map from your sources with React Flow?"
description: "Turn RAG output into a real mind map with React Flow: prompting for hierarchy, stripping LLM leakage, node weighting, drill-down chats and styling."
answer: "Ask your RAG backend for a strict hierarchy, not prose: a prompt that demands more than one level of nesting, weights important nodes and strips citations, JSON fragments and search queries. Render that tree with React Flow custom nodes styled with your design tokens. Then make nodes collapsible and link each one to its own drill-down conversation."
updated: "2026-09-30"
about: ["React Flow", "KillrCtx", "NotebookLM", "OpenRAG", "IBM Bob", "D3"]
episodes:
  - killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob
  - adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob
  - notebooklm-clone-setup-wizard-and-ai-workbench-backend
  - debugging-rag-backends-openrag-vs-ai-workbench
faq:
  - q: "Can I edit an AI-generated mind map?"
    a: "Not in NotebookLM itself: Google's help page lets you expand, collapse and download the map, and in August 2025 XDA noted there were no customization options and only PNG downloads. If you build your own with React Flow, nodes are ordinary React components, so editing, collapsing and drill-down conversations are yours to add, as KillrCtx did."
  - q: "What is the best React library for mind maps?"
    a: "For an interactive, styleable map, React Flow is the usual choice; it was IBM Bob's first recommendation on Building with Bob, with D3 second. React Flow renders and handles interaction but doesn't lay out nodes itself, so pair it with dagre or d3-hierarchy for tree positions. Use D3 alone if you want full control of SVG rendering."
  - q: "How do I make a mind map from a PDF with AI?"
    a: "Ingest the PDF into a RAG pipeline (KillrCtx uses OpenRAG, which parses documents with Docling and stores embeddings in OpenSearch), then prompt the LLM for a nested outline of the retrieved content. Parse that outline into nodes and edges and render it with React Flow. The quality of the map depends mostly on the prompt."
  - q: "Why is my AI-generated mind map flat or full of citations?"
    a: "Because the renderer draws whatever hierarchy the LLM returns. In our build, a minimal default prompt produced one level of nesting plus leaked source citations, JSON fragments and search queries as leaf nodes. Rewriting the prompt to require several levels and to strip that leakage fixed it."
  - q: "Can you drill into a NotebookLM-style mind map?"
    a: "Yes. Google says NotebookLM (renamed Gemini Notebook in July 2026) lets you select a node to ask about it in chat. In KillrCtx, clicking a node's drill-down icon opens a new conversation linked to that node, which uses the node's place in the tree plus your documents; deleting the conversation unlinks it."
---

Most "AI mind map" features start life as an outline with a nicer name. This guide is how the hosts of Building with Bob turned a Markdown-only mind map note in [KillrCtx](/projects/killrctx), their open-source NotebookLM clone, into an interactive map rendered with [React Flow](https://reactflow.dev/), built live with IBM Bob. Most of the work happened in episode 2, [Building a NotebookLM-Style Mind Map with React Flow and IBM Bob](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob), with follow-ups in episodes 3 and 4. For the rest of the app, see [how to build a NotebookLM clone](/topics/build-notebooklm-clone). The short version here: the renderer took minutes, and the prompt took the rest of the stream.

## Why many "mind map" features are just an outline

A mind map feature is often only a Markdown outline, because the LLM returns text and nothing turns it into a graph. In episode 1, [KillrCtx: An Open-Source NotebookLM Clone on OpenRAG and IBM Bob](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob), David Jones-Gilardi pointed out that the mind map note type was "just text" and "not graphically a mind map at all" ([17:53](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1073)). By episode 2 the diagnosis was blunter: "it's literally just markdown, man" ([9:47](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=587)).

The commercial reference point has limits too. Google's [mind map help page](https://support.google.com/notebooklm/answer/16212283?hl=en) (the product was [renamed Gemini Notebook](https://workspaceupdates.googleblog.com/2026/07/notebooklm-now-gemini-notebook.html) on July 16, 2026) describes zooming, expanding and collapsing branches, selecting nodes to ask questions, and downloading. What it doesn't offer is editing: in August 2025, [XDA](https://www.xda-developers.com/notebooklm-mindmap-extractor-extension/) wrote that NotebookLM "offers absolutely no customization options for its Mind Maps" and only downloads PNGs. Owning the renderer is what lets you fix that.

## Choosing a library: React Flow vs D3 vs mind-map renderers

React Flow is the pragmatic default for an interactive AI mind map in a React or Next.js app. When David asked Bob which tools to use for "a graphical and visual mind map" in Next.js ([13:16](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=796)), Bob recommended React Flow first and D3 second ([16:35](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=995)), with a dedicated mind-map renderer as the third option ([17:06](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1026)). The tiebreaker was Langflow: Tejas Kumar checked that Langflow's canvas "100% is built with React Flow" (same timestamp), and David added, "we also know what its capabilities are then too." As of September 2026, Langflow's [frontend package.json](https://github.com/langflow-ai/langflow/blob/main/src/frontend/package.json) does depend on `@xyflow/react`.

| Option                       | What it gives you                                                                                                              | What you still build                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| React Flow (`@xyflow/react`) | Pan, zoom, selection, edges; [custom nodes](https://reactflow.dev/learn/customization/custom-nodes) are plain React components | Layout ([dagre, d3-hierarchy or elkjs](https://reactflow.dev/learn/layouting/layouting)), theming |
| D3 (`d3-hierarchy`)          | [Tree and cluster layouts](https://d3js.org/d3-hierarchy) that compute positions for hierarchical data                         | Rendering, interaction, React integration                                                         |
| Dedicated mind-map library   | A mind-map look out of the box                                                                                                 | Whatever the library doesn't expose                                                               |

Two details from the React Flow docs matter for mind maps. First, the [layouting guide](https://reactflow.dev/learn/layouting/layouting) says "We have not implemented our own layouting solution yet", and it notes that d3-hierarchy "assigns the same width and height to _all_ nodes", which fights against weighted nodes. Second, React Flow's own [mind map tutorial](https://reactflow.dev/learn/tutorials/mind-map-app-with-react-flow) builds a hand-edited map with Zustand; it's a good base, but it isn't LLM-driven.

## The map is only as good as the LLM's hierarchy

The single biggest quality lever is the hierarchy the LLM returns, not the renderer. Bob's React Flow renderer worked on the first pass: the first real map showed OpenRAG, Docling, OpenSearch, external connectors and a front end ([44:04](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2644)). But a regenerated map was vague ("containerized components, core layers, a bunch of nonsense", in Tejas's words, [54:28](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3268)), and Tejas's instinct was to feed Bob a screenshot and correct facts about OpenRAG.

The better question was why the map looked like that. The hosts opened the raw LLM response and asked whether the map was simply "the hierarchy that the LLM is returning" ([56:33](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3393)). It was. The mind map prompt was "very lightweight" and came from the original note type, not from anything they had written for this feature ([57:07](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3427)). So they asked Bob to fix the prompt, not the diagram.

The first prompt rewrite still came back flat: "Nothing's nested" ([1:01:30](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3690)). Two more rules went in:

1. **Require depth.** The mind maps were "just one level of nesting, which is kind of lame", so the prompt now asks for more than one level ([1:02:37](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3757)).
2. **Weight the nodes.** Tejas wanted "big ones and small ones", because a mind map should show where to pay attention ([1:02:01](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3721)); he had first raised weighting nodes by importance in the styling to-do list ([47:21](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2841)).

## Strip LLM leakage: citations, JSON fragments and search queries

RAG answers carry retrieval artifacts, and a mind map turns each one into a node unless you filter it out. The first map had a column of small boxes on the right that turned out to be sources ([44:35](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2675)). David called it "leak from the LLM" and said he already has other note types parse it out ([52:21](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3141)). Given a screenshot, Bob named the problem precisely:

> The LLM is leaking source citations, JSON fragments, and long prose descriptions as deeply nested leaf nodes.
> — IBM Bob, read out on stream at [58:45](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3525)

After both fixes, the map finally named Langflow, Docling and the other real components, in color: "Those are all legit" ([1:05:20](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3920)). One leak remained, a "search query" node from the agentic retrieval step, so that went on the filter list too ([1:05:52](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3952)). A practical rule set for your prompt, all taken from this session:

- Return a single root with at least two levels of children.
- Mark relative importance so the renderer can size nodes.
- Short labels only; no prose paragraphs as leaves.
- No citations, source lists, JSON fragments or search queries.

## Styling React Flow to match your app

React Flow ships its own look, so plan to override it with your app's design tokens. Before any code was written, Tejas flagged the design spec for hard-coded hex colors and a div with a fixed 500-pixel height: "we can just use proper design tokens from Tailwind CSS" ([26:29](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1589), [27:31](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1651)). After the first render, the to-do list grew: white nodes on a dark background were hard to read, so follow the app's note-card styling ([45:08](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2708)), add a full-screen view, use color strategically, and "search the web for best practices here and apply" ([46:50](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2810), [47:21](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2841)).

Bob's plan noted that React Flow injects its own default styles, which have to be overridden ([49:06](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2946)). React Flow's [theming docs](https://reactflow.dev/learn/customization/theming) give you the options: import `@xyflow/react/dist/base.css` instead of `style.css` for structural styles only, override CSS variables such as `--xy-node-background-color-default` under `.react-flow`, or use the `colorMode` prop for dark mode. The result was a big jump ("Wow, that was a nice change", [52:21](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3141)), though David still wanted React Flow's control buttons restyled to fit the app ([1:07:34](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=4054)). In episode 4, [Debugging KillrCtx RAG Backends: OpenRAG vs AI Workbench](/episodes/debugging-rag-backends-openrag-vs-ai-workbench), one more fix surfaced: nodes need to fit their text properly ([1:12:12](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4332)).

## Making it useful: collapsible nodes, drill-down chats and layouts

A mind map earns its place when you can act on a node, not just look at it. Between streams, David made the nodes collapsible and animated, then added the feature he was proudest of, a drill-down icon: "I can see a mind map but, okay, great. What do I do with it?" ([11:51](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=711)). As he showed in episode 3, [Spec Coding a Setup Wizard for an Open-Source NotebookLM Clone](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend):

- **Drill-down conversations.** Clicking a node creates a new conversation linked to that item, which "uses its location in the tree and its context with your other documents" ([12:24](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=744)).
- **Linked navigation.** Going back to a node takes you straight to its conversation ([12:56](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=776)).
- **Any level.** Drill down from a parent, not just a leaf; deleting a conversation unlinks it so no orphans hang around ([13:28](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=808)).
- **Layouts.** A basic horizontal/vertical toggle (same timestamp).

If you want expand and collapse out of the box, React Flow has an [expand-and-collapse example](https://reactflow.dev/examples/layout/expand-collapse) using dagre, but in September 2026 it's a Pro example behind a subscription.

## Grounding the map in your sources, per notebook

The map is only trustworthy if it's generated from the right documents, so scope retrieval per notebook. In KillrCtx, creating a notebook creates an [OpenRAG](https://github.com/langflow-ai/openrag) knowledge filter (more in our [OpenRAG guide](/topics/openrag)) through the SDK, and generating a mind map runs against that filter, so "that's actually what's happening here" when you ask for a map ([24:01](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1441)). The inverse lesson came in episode 2: a notebook with no sources still produced a map, built from a web search and the conversation so far ([53:24](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3204)). Check which context your prompt is actually seeing.

How the feature was specified before any code, with requirements, design and tasks, is covered in [spec-driven development with IBM Bob](/topics/spec-driven-development-ibm-bob). For Bob's modes and review tools, see [IBM Bob features in practice](/topics/ibm-bob-features-in-practice).
