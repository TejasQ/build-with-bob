---
slug: adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob
videoId: fesh8hfeMjw
title: "Adding a React Flow Mind Map to a NotebookLM Clone"
description: "IBM Bob picks React Flow, writes a spec, and turns a markdown outline into a visual mind map in KillrCtx, plus ElevenLabs podcasts and LLM-judge bias."
tldr: "In part 2 of the KillrCtx build, Tejas and David turn a plain Markdown mind map note into a real visual mind map. IBM Bob recommends React Flow, writes a spec with requirements, design and to-dos, and builds the renderer. They then fix styling, LLM source leakage and flat hierarchies by rewriting the mind map prompt, ending with a colorful, nested map of OpenRAG's architecture."
project: killrctx
topics:
  [
    "react flow mind map",
    "ai mind map generator",
    "spec coding",
    "react flow",
    "llm prompt design",
    "tailwind design tokens",
    "rag",
    "llm as a judge",
  ]
tools:
  [
    "IBM Bob",
    "Bob Shell",
    "KillrCtx",
    "OpenRAG",
    "Langflow",
    "Docling",
    "OpenSearch",
    "ElevenLabs",
    "React Flow",
    "D3",
    "Next.js",
    "Tailwind CSS",
    "NotebookLM",
    "uv",
  ]
takeaways:
  - "Ask the agent which library to use before asking it to build; Bob suggested React Flow first and D3 second for a mind map in a Next.js app."
  - "Picking a library you already rely on pays off: Langflow is built with React Flow, so the team already knew what it could do."
  - "Spec coding makes a non-deterministic LLM more predictable: numbered requirements, a design mapped to them, and to-dos mapped back, with a validate step at every stage."
  - "Review the design, not just the code; Tejas caught hard-coded hex colors and fixed pixel heights and had Bob switch to Tailwind design tokens before any code was written."
  - "A good-looking renderer can't fix a bad hierarchy. The mind map only improved once the app's own LLM prompt asked for real nesting, node weights and no citation leakage."
  - "When the agent's output looks wrong, show it a screenshot and describe exactly what you expected to see."
  - "Keep the agent's task list in a file in the repo so future contributors can see why each feature was built the way it was."
faq:
  - q: "How do you generate a mind map with an LLM?"
    a: "In this episode, the LLM returns a hierarchy of topics and the app renders it as a graph with React Flow. The first results were weak because the prompt was a generic leftover, so the LLM returned a document summary with inline citations. Rewriting the prompt to ask for multiple levels of nesting, weighted nodes and no source citations produced a much better map."
  - q: "Which library should I use for a mind map in React or Next.js?"
    a: "IBM Bob recommended React Flow first and D3 as a second option. The hosts chose React Flow, partly because Langflow is built with it, so they already knew its capabilities. One catch: React Flow injects its own default styles, which Bob had to override to match the app's theme."
  - q: "Why was the AI-generated mind map flat?"
    a: "A React Flow map mirrors whatever hierarchy the LLM returns, and the first rewritten prompt produced topics with only one level of nesting. The hosts then asked for more than one level of nesting and for node weights, so important topics render bigger, which produced a nested, colorful map."
  - q: "Can IBM Bob run to-dos in parallel?"
    a: "Asked to do every to-do in the mind map spec in parallel, Bob batched the work sensibly instead of starting everything at once, which Tejas called exactly what he expected. David noted Claude Code had answered a similar request the same way, batching the parts that can run in parallel."
  - q: "How does KillrCtx make NotebookLM-style podcasts?"
    a: "The podcast script comes from the same agentic RAG pipeline in OpenRAG that answers chat questions, and ElevenLabs voices it. For this episode David cloned Tejas's voice in ElevenLabs from some of his videos, so the podcast host sounds like him."
  - q: "Does KillrCtx have a mind map like NotebookLM?"
    a: "It does after this episode. Before, the mind map note type in KillrCtx was just Markdown. By the end of the stream it rendered a visual, colored, nested map, although the hosts noted that some React Flow controls still needed restyling."
  - q: "What is spec coding with IBM Bob?"
    a: "Spec coding is David's process for building features: the agent writes numbered requirements with acceptance criteria, then a design, then to-dos, and each stage is validated against the previous one. David loaded the process into Bob as a custom mode, and Bob recognized the mind map as a new feature and started the spec process without being told."
  - q: "Why did the mind map show sources and citations as nodes?"
    a: "The LLM was leaking source citations, JSON fragments and long prose into the hierarchy, which ended up rendered as deeply nested leaf nodes. The fix was to rewrite the mind map prompt and have the app parse that leakage out before rendering."
  - q: "How does KillrCtx use OpenRAG?"
    a: "KillrCtx talks to OpenRAG through its SDK. Creating a notebook automatically creates an OpenRAG filter so queries only touch that notebook's documents, uploads go through Docling into OpenSearch, and deleting a notebook cascades the deletion in OpenRAG."
  - q: "Why use OpenRAG for LLM-as-a-judge evals?"
    a: "Tejas showed that LLM judges have biases toward positive, first-listed and self-generated answers. Giving the judge the relevant policy in a rubric makes it more reliable, and OpenRAG can retrieve that policy from a company knowledge base automatically."
chapters:
  - start: 0
    title: "Recap: KillrCtx, an open-source NotebookLM clone"
  - start: 125
    title: "KillrCtx on OpenRAG and the ElevenLabs podcast demo"
  - start: 587
    title: "From a Markdown mind map to asking Bob for a library"
  - start: 837
    title: "Spec coding with IBM Bob: requirements, design, to-dos"
  - start: 995
    title: "Choosing React Flow (the library behind Langflow)"
  - start: 1551
    title: "Design review: Tailwind design tokens, not magic numbers"
  - start: 1990
    title: "Parallel tasks in Bob and the first React Flow mind map"
  - start: 2708
    title: "Styling the React Flow mind map: theme, color, weights"
  - start: 3301
    title: "Fixing the AI mind map prompt: hierarchy and LLM leakage"
  - start: 3986
    title: "Final mind map and an LLM-as-a-judge bias teaser"
---

In part 2 of the KillrCtx build (episode 2 of Building with Bob), Tejas and David turn the mind map note in their open-source NotebookLM clone from plain Markdown into a real, interactive visual mind map. IBM Bob recommends [React Flow](https://reactflow.dev/), runs David's spec coding process to plan the feature, and builds the renderer. The last half hour goes into the thing that actually decides quality: the prompt that tells the LLM what hierarchy to return.

## What is KillrCtx and how does it use OpenRAG?

[KillrCtx](https://github.com/TejasQ/killrctx) is an open-source NotebookLM clone that uses [OpenRAG](https://github.com/langflow-ai/openrag) as its retrieval and context backend. Tejas walks through the diagram at [2:05](?t=125). The app talks to OpenRAG through its SDK. Queries go to an agent running in [Langflow](https://www.langflow.org/), and ingestion runs uploaded sources through [Docling](https://github.com/docling-project/docling), which converts almost any format into LLM-ready text, before storing embeddings in [OpenSearch](https://opensearch.org/).

David shows how notebooks map onto OpenRAG ([3:47](?t=227)):

- **Creating a notebook creates an OpenRAG filter** through the SDK, so each notebook only queries its own documents.
- **Uploading a source** sends it through OpenRAG's Docling ingestion pipeline automatically.
- **Deleting a document or notebook cascades** in OpenRAG, which keeps the backend clean ([6:32](?t=392)).

The [OpenRAG guide](/topics/openrag) goes deeper on filters, the SDK and the ingestion pipeline.

The Studio panel has several note types. The podcast note plays audio from [ElevenLabs](https://elevenlabs.io/), this time in a cloned version of Tejas's voice ([7:02](?t=422)). Its script comes from the same agentic RAG pipeline that answers chat questions ([8:06](?t=486)), and David had improved the outline note with collapsible sections during the week. The mind map, though, was "literally just markdown," as Tejas put it at [9:47](?t=587). If you missed the start of the project, watch [part 1, the KillrCtx intro](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob).

## Which library should you use for a React Flow mind map in Next.js?

For a mind map in a Next.js app, Bob recommended React Flow, with [D3](https://d3js.org/) as the second option, and the hosts went with React Flow. Before prompting, Tejas points out at [10:19](?t=619) that you can use Bob two ways: the IDE, which David prefers, or [Bob Shell](/topics/ibm-bob-features-in-practice), the terminal interface Tejas likes, apart from how often it makes him log in. David then asks Bob what tools it recommends for "a graphical and visual mind map representation" in a Next.js app ([12:43](?t=763)).

When the answer comes back at [16:35](?t=995), React Flow tips the balance for a practical reason:

> Langflow 100% is built with React Flow. And I think it would be kind of like embracing IBM to use the same thing that builds Langflow.
> — Tejas, [17:06](?t=1026)

David adds that because Langflow sits underneath OpenRAG, they already know what React Flow can do. Looking at a Langflow canvas, Tejas says it looks like a mind map "if I squint."

## How does spec coding work with IBM Bob?

Spec coding runs every feature through three documents: numbered requirements, a design, and a to-do list. Each one is validated against the one before. David explains it at [13:57](?t=837) while Bob is still answering the library question. He calls it a way to take an LLM that "by nature is non-deterministic and make it deterministic."

The process David loaded into Bob as a custom mode ([19:51](?t=1191)):

1. **Requirements.** Each one has a unique ID and acceptance criteria.
2. **Design.** Based on the existing codebase and tech stack, with an OpenAPI spec where it applies.
3. **To-dos.** Each task links back to a requirement.
4. **Validate at every step.** The design maps to the requirements and the to-dos map back to both ([21:05](?t=1265)).
5. **Fix failing tests.** A final prompt has the agent run the tests and clean up.

To test it, David doesn't tell Bob to use the process. Bob recognizes a new feature, offers the spec coding flow on its own, and creates a spec directory for the mind map ([18:47](?t=1127)). It stops for approval before moving from one step to the next. David says that on his own projects he has spent "a good solid hour" on this stage for a single feature, because an agent that heads the wrong way can produce a lot of code very quickly.

Bob also writes its to-dos to a file in the repo instead of keeping them in memory ([31:28](?t=1888)). David does that deliberately:

> The reason why I do this is for posterity, because later on this now is all context to future feature development, and to developers or anybody else who's working on this project.
> — David, [31:58](?t=1918)

The [spec-driven development with IBM Bob guide](/topics/spec-driven-development-ibm-bob) follows this process across the whole KillrCtx build.

## What should you catch when reviewing an agent's design?

Look for things that will be expensive to fix later. Here that meant styling that ignored the project's design system. The design looked sensible overall ([25:16](?t=1516)): a `MindMapRenderer` component that followed existing conventions, a visually distinct root node, and an expanded view. Tejas had two problems with it, though ([26:29](?t=1589)).

The node styling used arbitrary Tailwind classes with raw hex colors, and the renderer used fixed heights like 500 and 300 pixels:

> We can just use proper design tokens from Tailwind CSS. We have a Tailwind config. Let's update the Tailwind config if we need to, but not have random arbitrary hex codes.
> — Tejas, [27:31](?t=1651)

Once David passed that on, Bob checked the existing [Tailwind CSS](https://tailwindcss.com/) config and rewrote the design to use tokens ([28:36](?t=1716)). Tejas's follow-up point is that Bob should have checked the config before writing the design. David agrees and suggests making it a project-wide rule in Bob for Next.js and Tailwind apps. He also admits the opening prompt was vague, and says his best feature prompts get real thinking time up front ([29:46](?t=1786)).

## What happened when Bob built the mind map?

Bob built the feature quickly, but the first version didn't render, and it took a screenshot and a bug report to fix it. Tejas asked Bob to work through the to-dos in parallel. After a quick back-and-forth about whether agent mode can do that, Bob batched the work sensibly, which was "exactly what I expected," Tejas said ([34:14](?t=2054)). A few other things came up along the way:

- **Permissions.** Auto-approve was on, but Bob still asked for approval. David was still finding his way around the permission settings after a recent update ([35:48](?t=2148)). Once they opened up permissions, Bob asked much less often ([51:06](?t=3066)).
- **Builds.** Bob kept running `npm run build` even though a dev server was already running. Tejas found that unnecessary. David regularly clears his Next.js cache anyway, after losing hours to stale-cache bugs.
- **Two task lists.** Bob keeps its own internal task list, so David reminds it to update the repo's to-do file too ([36:21](?t=2181)).

After a server restart, the first generated mind map note wouldn't expand ([37:56](?t=2276)). David gave Bob a screenshot and a description. Bob worked through a few theories, repeatedly announcing "now I see the issue," and eventually fixed it. A map rendered at [40:07](?t=2407), but it didn't fill its panel.

For a more realistic test, David had a notebook search the web for information about OpenRAG, then generated "the architecture of OpenRAG" as a mind map ([43:31](?t=2611)). The result had real nodes (Docling, OpenSearch, external connectors, frontend), plus a column of small boxes on the right that turned out to be sources ([44:04](?t=2644)).

## How do you make a React Flow mind map match your app?

Give the agent concrete references: screenshots of your existing UI, your design tokens, and a short list of goals. After committing a clean baseline on a feature branch, the hosts added four to-dos at [45:08](?t=2708):

1. Follow the app's theme, using the existing note type styling as a reference and the Tailwind design tokens ([46:12](?t=2772)).
2. Add a full-screen view.
3. Use color strategically instead of a monochrome map.
4. Think about layout and node weighting, so some nodes are bigger than others, and about the role of sources in the map ([47:21](?t=2841)).

Tejas then adds the line he gives all his coding agents: "search the web for best practices here and apply." Bob split the list into more detailed to-dos and pointed out that React Flow injects its own default styles, which would need overriding ([49:06](?t=2946)). The restyled map at [52:21](?t=3141) was a clear improvement, and Tejas asked whether it was Langflow.

## Why does the LLM prompt matter more than the React Flow renderer?

An AI mind map generator is only as good as its prompt, because the renderer can only draw the hierarchy the LLM gives it. When the output was generic ("containerized components, core layers") and still full of sources ([54:28](?t=3268)), David opened the raw LLM response and the prompt behind it ([56:33](?t=3393)). The mind map prompt was a lightweight leftover from the original Markdown note type, with nothing telling the model how to build a good mind map ([57:07](?t=3427)).

David asked Bob to rewrite that prompt for a better hierarchy and to strip out leakage. Bob pinpointed the problem: the LLM was "leaking source citations, JSON fragments, and long prose descriptions as deeply nested leaf nodes" ([58:45](?t=3525)). The next map was clean but flat, with no nesting at all ([1:01:30](?t=3690)), so they asked for more than one level of nesting and for node weights.

| Iteration           | What changed                            | Result                                          |
| ------------------- | --------------------------------------- | ----------------------------------------------- |
| First render        | React Flow renderer, default prompt     | Didn't expand, then rendered small              |
| Theme pass          | App styling, color, layout, full screen | Much better looking, but sources leaked in      |
| Prompt rewrite      | New mind map prompt, leakage parsed out | Clean but flat, one level deep                  |
| Nesting and weights | Multi-level hierarchy, weighted nodes   | Colorful, nested, accurate OpenRAG architecture |

At [1:05:20](?t=3920) the map shows Langflow, Docling and OpenSearch, which Tejas said were "all legit." One remaining "search query" node was another leak, so they asked Bob to filter that out too ([1:05:52](?t=3952)). The prompt rules and styling steps are collected in the [AI mind map with React Flow guide](/topics/ai-mind-map-react-flow).

## What's left to polish, and what's the real-world use case?

The feature works, but David wants to restyle React Flow's built-in control buttons, which don't match the app, and clean up some UX rough edges ([1:07:34](?t=4054)). To test it properly, Tejas suggests collecting real sources on a topic they only half understand, such as how the global economy works, and seeing whether the mind map actually helps them learn it ([1:06:26](?t=3986)). That also answers a viewer who asked for a real-world use case: both hosts prepare conference talks by gathering a lot of context and learning at their own pace ([35:16](?t=2116)).

### Bonus: OpenRAG for LLM-as-a-judge evals

In the last few minutes, Tejas previews his AI Engineer World's Fair talk on evals ([1:09:58](?t=4198)). His demo shows that LLM judges prefer the positive answer, the answer listed first, and answers generated by their own model ([1:11:04](?t=4264)). Adding the refund policy to a rubric makes the judge more reliable ([1:12:08](?t=4328)), and OpenRAG can retrieve that policy from a company knowledge base automatically. After OpenSearch rejected his credentials and he restarted OpenRAG (David mentions he usually runs it with `uvx` from [uv](https://docs.astral.sh/uv/) instead of building from source), the query returned the 14-day policy with its source ([1:15:20](?t=4520)).

## What's next

[Part 3 of the KillrCtx build](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend) comes back to the app after this mind map pass, with a setup wizard and an AI Workbench backend. Viewers are invited to leave mind map feature ideas in the comments for David to work on before then. Follow the whole build on the [KillrCtx project page](/projects/killrctx).
