---
slug: notebooklm-clone-setup-wizard-and-ai-workbench-backend
videoId: xAfx7I8pHFY
title: "NotebookLM Clone Setup Wizard + DataStax AI Workbench"
description: "KillrCtx gains a DataStax AI Workbench backend on Astra DB and mind map drill-down, then a spec-coded npm run init wizard that finds Docker or Colima."
tldr: "David opens by showing work done between streams: DataStax AI Workbench on Astra DB as a second backend next to OpenRAG, plus a mind map drill-down feature. Tejas then shifts the focus to developer experience, and the pair spend most of the stream spec coding an interactive npm run init wizard with IBM Bob. They test it on a fresh clone, fix Colima detection and install paths live, and end with the app launching against AI Workbench, though adding a source still fails."
project: killrctx
topics:
  [
    "spec driven development",
    "developer experience",
    "setup wizard",
    "rag backends",
    "docker runtime detection",
    "agent approvals",
    "token reduction",
    "mind maps",
  ]
tools:
  [
    "IBM Bob",
    "Bob Shell",
    "KillrCtx",
    "OpenRAG",
    "DataStax AI Workbench",
    "Astra DB",
    "OpenRouter",
    "ElevenLabs",
    "Docker",
    "Colima",
    "Homebrew",
    "cac",
    "Commander.js",
    "npm",
    "TypeScript",
    "Git",
    "Caveman",
    "RTK",
    "Ollama",
    "Dia",
  ]
takeaways:
  - "Before adding setup automation, decide whether your app bundles its backend or just connects to one. KillrCtx chose to stay a lean frontend that takes a URL and API key for OpenRAG, AI Workbench, or both."
  - "Spec coding moves the effort to the start: about 80% of this stream went into shaping requirements, and review caught problems like probing localhost:3000, which could be any Next.js app, to detect a backend."
  - "Check for Docker-compatible runtimes, not only Docker. Some companies don't allow Docker Desktop, so the wizard looks for Colima on the PATH and starts it if it isn't running."
  - "Test onboarding the way a newcomer would: clone the feature branch into a new directory and run the wizard. That's how the hosts found that it tried to reinstall Colima and left AI Workbench without an .env file."
  - "Coding agents keep their own internal task lists. If you want your spec's to-do list checked off as a record of the work, say so in the prompt or in your agent instructions file."
  - "IBM Bob's command approvals can be granted per task, so routine gh commands run without prompts while other commands still need your approval."
  - "Output-token reducers like the Caveman skill and command-output filters like RTK cut agent costs without making the agent's answers hard to follow."
faq:
  - q: "What is KillrCtx?"
    a: "KillrCtx is an open-source NotebookLM clone built live on Building with Bob by Tejas Kumar and David Jones-Gilardi using IBM Bob. You add sources to notebooks, chat with them, and generate notes like summaries, outlines, Q&A, podcasts and mind maps. As of this episode it can use either OpenRAG or DataStax AI Workbench as its RAG backend."
  - q: "What is DataStax AI Workbench and how does it relate to Astra DB?"
    a: "DataStax AI Workbench (not NVIDIA AI Workbench) is an open-source tool built by the Astra team for document ingestion and agentic RAG on Astra DB. It adds agents, model provider configuration and knowledge bases on top of Astra, and creates the Astra collections a knowledge base needs. On stream it was at version 0.5, and it has no hosted version yet, so you run it yourself."
  - q: "Should an open-source RAG app bundle its backend?"
    a: "The hosts decided KillrCtx should not. It's a frontend that could be deployed to a platform like Vercel, Netlify or Cloudflare, while OpenRAG and AI Workbench are harder to deploy. So the app asks for a URL and API key for either backend, and the setup wizard installs one next to the repo only if neither is found."
  - q: "What does the KillrCtx npm run init wizard do?"
    a: "It checks whether OpenRAG or AI Workbench is running locally. If neither is, it checks for Docker or Colima, offers to install one, and then downloads the backend you choose. It then collects API keys such as OpenRouter and ElevenLabs, writes .env.local and starts the app."
  - q: "What is spec coding with IBM Bob?"
    a: "Spec coding means the agent writes a requirements document with numbered requirement IDs, a design and a to-do list before it writes any code. You review and revise the spec, then tell the agent to implement it. David uses a custom spec coding mode in IBM Bob that also validates its own requirements."
  - q: "How do you reduce token costs with coding agents?"
    a: "David uses the Caveman skill, and an IBM Bob skill inspired by it, to make agents reply tersely, which cuts output tokens. He also runs git through RTK, which removes unnecessary text from command output before the agent reads it."
  - q: "Which model does IBM Bob use?"
    a: "Asked on stream, David said Bob uses a combination of models, sometimes Granite and some Anthropic, and that it doesn't expose which one it is using. That matches coverage of Bob's April 2026 launch, which said it routes tasks across IBM Granite, Anthropic's Claude, Mistral and smaller distilled models."
  - q: "Why add command-line flags to an interactive setup wizard?"
    a: "So a coding agent can run setup without the interactive prompts. Reading the generated setup script, Tejas asked for options such as the OpenRAG URL and API key and the AI Workbench URL, so setup can run non-interactively. By part 4, npm run lists scripts with flags like --status and --launch."
  - q: "Can IBM Bob remember which commands it is allowed to run?"
    a: "Yes. When Bob asks for approval, you can expand the request and approve that type of command for the whole task, so similar commands run without asking again. David used this for gh commands while keeping approvals for everything else."
chapters:
  - start: 0
    title: "Intro: KillrCtx, the open-source NotebookLM clone"
  - start: 158
    title: "DataStax AI Workbench on Astra DB as a second RAG backend"
  - start: 491
    title: "Directory ingestion and mind map drill-down conversations"
  - start: 843
    title: "Chatting with notebook sources about a meetup tour"
  - start: 1297
    title: "Should an open-source RAG app bundle its backend?"
  - start: 1870
    title: "Spec-driven development: the setup wizard spec in IBM Bob"
  - start: 2688
    title: "DataStax AI Workbench vs Astra DB, and hosting"
  - start: 3040
    title: "Refining requirements: Docker and Colima detection"
  - start: 4130
    title: "Implementing the spec: task lists, approvals, RTK"
  - start: 4676
    title: "Testing npm run init on a fresh clone"
---

Part 3 of the KillrCtx build (episode 3 of Building with Bob) starts as a mind map episode and turns into a developer experience episode. David shows that [KillrCtx](https://github.com/TejasQ/killrctx), the hosts' open-source NotebookLM clone, now supports DataStax AI Workbench as a second backend next to OpenRAG. Then Tejas and David spend most of the stream spec coding an interactive `npm run init` setup wizard with IBM Bob and testing it on a fresh clone. If you missed it, [part 2 added the mind map](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob); the [NotebookLM clone build guide](/topics/build-notebooklm-clone) covers the whole project.

## What changed in KillrCtx since the last stream?

KillrCtx can now run against two RAG backends, and David polished several features between streams. The two hosts had agreed to save major features for the stream, and David admits at [2:06](?t=126) that he "slightly lied." Everything he changed, he specced with IBM Bob first.

- **DataStax AI Workbench backend.** At [2:38](?t=158) he shows that each notebook can now use either [OpenRAG](https://github.com/langflow-ai/openrag) or [DataStax AI Workbench](https://github.com/SonicDMG/ai-workbench). AI Workbench is an open-source tool from the Astra team ([4:09](?t=249)) that adds agents, model providers and knowledge bases on top of [Astra DB](https://www.datastax.com/products/datastax-astra). The model picker lists Workbench agents instead of OpenRAG models, and embeddings run inside Astra on NVIDIA GPUs ([7:11](?t=431)).
- **The spec history as a database.** Because every feature went through spec coding, the requirements and design for each one are saved in the repo ([5:27](?t=327)). David says the Workbench integration "pretty much one-shot the capability," and the bugs left over were mostly UX.
- **Smaller fixes.** The panel that kept extending off the right of the page is fixed ([8:11](?t=491)). You can add a whole directory of sources, and each source gets an icon for its type ([8:48](?t=528)). Summary, outline and Q&A notes are formatted better, and the notes panel has partial and full-screen controls.
- **Mind map drill-down.** The mind map got collapsible, animated nodes and a drill-down button ([11:51](?t=711)). Clicking a node starts a conversation linked to that node, using where it sits in the tree plus your other sources. Clicking the node again takes you back to that conversation, and deleting the conversation unlinks it ([13:28](?t=808)). The [AI mind map with React Flow guide](/topics/ai-mind-map-react-flow) covers how the map was built.

David had loaded the notebook with material about a meetup tour in New York and Cambridge. Tejas asks which companies IBM should partner with, and the answer is Unstructured, which is already booked for both events ([17:46](?t=1066)). Then he asks how many people will attend in total, and the answer is 218. The notebook also estimates the share likely to be interested in IBM Bob and shows its reasoning ([20:32](?t=1232)).

## Should an open-source RAG app bundle its backend?

The hosts decided it shouldn't. KillrCtx stays a lean frontend that connects to OpenRAG, AI Workbench or both through a URL and API key. At [21:37](?t=1297) Tejas says the user experience is in good shape but the developer experience isn't:

> I want a developer to be able to fork this repo, clone it and then immediately get it running locally.
> — Tejas, [22:50](?t=1370)

David points out the problem at [25:44](?t=1544). The quick start bundles a full OpenRAG install, so `.env.example` needs many variables that you don't need at all if you connect to a backend that's already running. Tejas explains the trade-off at [26:49](?t=1609): KillrCtx could be a monolith that ships with its backend, or a client that takes optional pairs of environment variables, one for OpenRAG and one for AI Workbench.

> I don't think we should bundle the baby with the bath water. We'll just ship a baby.
> — Tejas, [26:49](?t=1609)

Instead, they'd write an interactive start script that works like a wizard: it asks which backend you want, asks for its URL, and installs one for you if you don't have it.

## How do you spec a setup wizard with IBM Bob?

In spec-driven development, Bob turns a feature description into requirements, a design and to-dos before writing code. Tejas dictates the vision as a numbered list, and David types it into Bob's spec coding mode. Before starting, David makes sure `main` is clean. He also mentions that all his agents use the [Caveman](https://github.com/JuliusBrussee/caveman) skill, or "Bobby Talk," a Bob skill inspired by it, to cut output tokens ([28:52](?t=1732)). There's no Live Share-style remote control in Bob, so David types ([30:08](?t=1808)).

The prompt, starting at [31:10](?t=1870):

1. A developer clones the repo.
2. They run a start script, something like `npm run start` or `npm run init`.
3. An interactive wizard checks whether AI Workbench or OpenRAG is present and running locally.
4. If one is, the wizard asks for its API key, inferring the URL from the running container. If neither is, it offers a choice of which one to download and install.
5. Once the keys are in, the wizard writes `.env.local` and starts the app with everything connected. If it installed a backend, it goes back to step 5 afterwards.
6. The app is fully usable on localhost.
7. Braille-style terminal UX, with spinners and progress bars everywhere ([34:37](?t=2077)).
8. Update the README, with a focus on frictionless setup.

David also asks Bob to follow a DevRel coding skill he built from one of Tejas's repos. It keeps the generated code simple, modular and commented ([36:51](?t=2211)).

### Why review the spec before the agent writes code?

Reviewing the spec is where the humans' judgment goes into the result. Bob returns a requirements document, a design and a to-do list, and David's mode has already validated the requirements ([39:29](?t=2369)).

> Instead of just letting the agent go off in YOLO mode, it's best to actually review and come back, because this is where the abilities that humans have come into play.
> — David, [41:03](?t=2463)

See [spec-driven development with IBM Bob](/topics/spec-driven-development-ibm-bob) for every spec review in the build.

Tejas adds a point from a talk by the OpenAI team at AI Engineer World's Fair: you get better work from agents when you explain why something matters, not only what to do ([41:33](?t=2493)). The first flaw comes up right away at [42:04](?t=2524). Bob's backend detection sent a GET request to `localhost:3000`, and as Tejas points out, that could be any Next.js app. They change requirement 2 so the OpenRAG and Workbench URLs are set in `.env.local` first. The intended flow is now: clone, fill in environment variables, run the wizard.

A viewer asks whether they use the CLI or the IDE. Tejas never uses the Bob IDE. He works in [Bob Shell](/topics/ibm-bob-features-in-practice), and they agree to use it for testing ([43:40](?t=2620)).

## DataStax AI Workbench vs Astra DB: which should KillrCtx target?

For now they start with DataStax AI Workbench, because it provides the whole agentic RAG pipeline. Plain Astra DB would mean rebuilding that inside KillrCtx. Tejas asks the question at [44:48](?t=2688). David explains the layers: Astra has a full API with vectorize and reranking, while Workbench adds agents, model provider configuration and knowledge bases. When you create a knowledge base, Workbench creates everything it needs in Astra ([45:29](?t=2729)).

Tejas asks about production at [46:55](?t=2815). Astra is a hosted SaaS, but Workbench isn't yet ("not SaaS-ified," as David puts it), so you have to host it yourself.

| Option            | What you get                                         | Hosting                                                        |
| ----------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| OpenRAG           | Full local RAG pipeline                              | Self-hosted locally (a hosted OpenRAG was mentioned too)       |
| AI Workbench      | Agents, model providers, knowledge bases on Astra DB | Self-hosted, v0.5 at the time, no SaaS yet                     |
| Astra DB directly | Collections, CRUD, vectorize, reranking              | SaaS, but KillrCtx would have to reimplement the agentic layer |

David is concerned that taking on the agentic layer would make KillrCtx more complex ([48:02](?t=2882)). Tejas notes that KillrCtx itself is just a frontend that could go on Vercel, Netlify or Cloudflare, but the backends are harder to deploy ([49:06](?t=2946)). They agree to "cross the bridge of SaaS-ification when we come to it." For how OpenRAG compares as a backend, see [the OpenRAG guide](/topics/openrag).

## What changed in the install requirements?

Most of the revisions went into requirement 4, the install step. At [50:40](?t=3040) Bob's draft had chosen to run the OpenRAG that's bundled with the repo, and to only print instructions for AI Workbench because it has no automated installer. The hosts changed both:

- **Don't bundle OpenRAG.** Download it into a sibling directory instead.
- **Install, don't print instructions.** AI Workbench is a git clone, so the wizard can run the clone itself. Bob wasn't sure the repo existed until David pasted the link and pointed out it was at version 0.5 ([55:44](?t=3344)).
- **Detect a container runtime first** ([1:00:00](?t=3600)). Check for Docker, and also for [Colima](https://github.com/abiosoft/colima) and other Docker runtimes. If there's none, offer to install one. David explains at [1:02:23](?t=3743) that some companies don't allow Docker, but you can usually use Colima, and a check that only looks for Docker would miss it.
- **Use a small CLI framework.** Tejas wanted [Commander.js](https://github.com/tj/commander.js) at first, then remembered the lighter one he was thinking of: [cac](https://github.com/cacjs/cac), a zero-dependency argument parser ([1:06:41](?t=4001)).

> One of the things that I have found when doing spec coding is I will spend more time doing exactly what we're doing right now. Really hone in on those features.
> — David, [53:32](?t=3212)

David explains Bob's approvals at [56:16](?t=3376). You can expand an approval request and allow a command type, such as generic `gh` commands, for the whole task, while every other command still needs approval. Asked how he rates Bob, David says Bob V2 is on par with tools like Claude Code and GitHub Copilot for building apps like this, and notes that he works for IBM ([1:05:38](?t=3938)). Earlier he said Bob uses a mix of models it doesn't expose ([35:45](?t=2145)), which matches [launch coverage](https://venturebeat.com/orchestration/ibm-launches-bob-with-multi-model-routing-and-human-checkpoints-to-turn-ai-coding-into-a-secure-production-system) naming Granite, Claude and Mistral. For a broader comparison, see [IBM Bob vs Claude Code, Cursor and Codex](/topics/ibm-bob-vs-claude-code-cursor-codex).

## How does the agent implement the spec?

Once the spec is approved, Bob works through the to-do list and generates a `setup.mjs` entry script. At [1:09:43](?t=4183) Tejas asks why Bob doesn't show check marks. David explains that Bob, Claude and other agents keep their own internal task lists, so he explicitly asks agents to check off his spec's to-dos because he wants that record as documentation.

The hosts read the generated code together at [1:12:55](?t=4375). It has a banner, backend detection, and flags like skip-Docker and skip-launch. Tejas would also like flags for the OpenRAG and AI Workbench URLs and keys, so that another agent could run setup without the interactive prompts ([1:13:27](?t=4407)). When committing, David runs git through [RTK](https://github.com/rtk-ai/rtk), which removes unnecessary text from command output so the agent reads fewer tokens ([1:15:38](?t=4538)).

## Does the wizard work on a fresh clone?

Mostly, once tested like a newcomer would. Tejas clones the feature branch with `git clone -b` into a new directory ([1:17:56](?t=4676)), runs `npm install` and then `npm run init` ([1:19:04](?t=4744)). Each bug became a follow-up prompt, and Bob pushed a fix to the branch:

1. **Colima was already installed.** The wizard tried to install Colima through Homebrew even though Tejas had it ([1:19:35](?t=4775)). The fix: if the `colima` command is on the PATH but not running, start it. If it's running, continue. If it's missing, install it. On the next run it prints "Colima found but Docker is not reachable" and starts Colima ([1:22:43](?t=4963)).
2. **Install location and missing env.** Tejas picks AI Workbench. The wizard clones it into a sibling directory, which surprised Tejas at first, but the Workbench folder has no `.env` next to its Docker Compose file ([1:25:19](?t=5119)). The fix: populate it after download.
3. **Key collection works.** The wizard asks for an OpenRouter key (Workbench's default provider), then an optional Astra endpoint and token, an optional Workbench API key and an optional ElevenLabs key ([1:27:02](?t=5222)).
4. **The frontend still assumed OpenRAG.** The app's own onboarding screen checked for OpenRAG only. They prompt Bob to accept either backend ([1:28:06](?t=5286)).

David admits this last round is more YOLO than he'd normally go. Normally he would add each fix to the requirements, and have Bob update a "context wiki" so future sessions start with the latest architecture ([1:29:18](?t=5358)). On the final run KillrCtx starts, and Tejas creates a notebook ([1:31:05](?t=5465)). Workbench is running with its in-memory mock and has no model providers set up, so adding a URL source fails with "fetch failed" ([1:33:12](?t=5592)). David still counts it as progress: the wizard installed Workbench, collected keys and launched the app.

Tejas says about 80% of the episode was spec work. David points to an IBM Technology video on engineering roles shifting from a pyramid to a diamond as AI handles boilerplate ([1:34:19](?t=5659)).

## What's next

The setup wizard works up to launching the app. Adding sources through AI Workbench, which needs a provider, a real Astra connection and whatever Workbench still requires, is still broken. So is an inner/outer border-radius mismatch Tejas spotted at the very end. [Part 4](/episodes/debugging-rag-backends-openrag-vs-ai-workbench) picks up from here and debugs the OpenRAG and AI Workbench backends. Follow the whole build on the [KillrCtx project page](/projects/killrctx).
