---
slug: planning-walfly-wearable-app-mvp-with-ibm-bob
videoId: PSAbjcEsn-Q
title: "IBM Bob Plan Mode: Scoping a Real App MVP, Live"
description: "Watch IBM Bob's plan mode turn a whiteboard diagram into an MVP plan with clarifying questions and numbered subtasks, then build a working Expo app."
tldr: "Tejas and David kick off Walfly, an open-source take on wearable conversation recorders. They sketch the architecture, dictate a build prompt, spend most of the stream refining the MVP in IBM Bob's plan mode, then let Bob implement it. They finish with a working Expo web UI with a big record button, not yet wired to any backend services."
project: walfly
topics:
  [
    "planning mode",
    "mvp scoping",
    "architecture diagrams",
    "speaker diarization",
    "hybrid search",
    "expo",
    "agent permissions",
    "spec-driven development",
  ]
tools:
  [
    "IBM Bob",
    "Expo",
    "Docling",
    "Astra DB",
    "Vercel",
    "Vercel Blob",
    "Next.js",
    "React",
    "OpenAI API",
    "OpenRouter",
    "Whisper",
    "Git",
    "Xcode",
    "React Native Progress",
  ]
takeaways:
  - "Hand the agent a hand-drawn architecture diagram along with the prompt, then ask it to explain the diagram back to you before any code is written."
  - "Planning mode's clarifying questions are where the real product decisions get made: auth, deployment target, blob storage, search strategy and LLM provider were all settled there."
  - "When reviewing an agent's plan, ask how each step actually works; one question about diarization exposed a gap the plan had glossed over."
  - "Read plans for failure timing, not just features: capturing location on stop could fail a 20-minute recording, so the permission request moved to the moment you tap record, with graceful degradation."
  - "Keep the raw source data (here, audio files) so you can re-transcribe and regenerate insights when better models arrive."
  - "Agents can be confidently wrong about the current state of the ecosystem; Bob scaffolded Next.js 14 and React 18 and claimed Next.js 16 did not exist until corrected, so tell it to save the fix to memory."
  - "Split unrelated work, like initializing Git, into a separate Bob task so it runs in parallel without disrupting the main implementation."
faq:
  - q: "What is Walfly?"
    a: "Walfly is an open-source app Tejas Kumar and David Jones-Gilardi are building with IBM Bob. It records conversations passively, uploads them for transcription with Docling, stores them in Astra DB, and turns them into summaries, key takeaways and action items. The name comes from being a fly on the wall."
  - q: "What does IBM Bob's plan mode do?"
    a: "Plan mode discusses and designs before writing code. In this episode it read the architecture diagram, asked multiple-choice clarifying questions whose answers could be edited inline, researched open questions on its own, and produced a plan with numbered subtasks, a data schema and API contract. After approval, Bob switched itself to agent mode to implement."
  - q: "Should speaker diarization be part of an MVP transcription pipeline?"
    a: "In this episode the team deferred it. Diarization is expensive and slow, and Tejas noted it happens as a separate step immediately after recording, before transcription. Since the recordings are processed asynchronously anyway, they recorded it as a post-MVP task rather than blocking the first version on it."
  - q: "Why does IBM Bob keep asking for permission to run commands?"
    a: "Bob starts from a restrictive security model on purpose, because it is aimed at building enterprise, production-quality applications. You can approve commands individually, add them to an allow list for the current project, or open the global settings and make it more permissive."
  - q: "Why did git fail with exit code 69 on macOS?"
    a: "On macOS, Git ships with Xcode's developer tools. After a fresh Xcode install, Git is gated behind Xcode's license agreement, so commands fail until you accept it in a terminal."
  - q: "Does IBM Bob switch from plan mode to agent mode automatically?"
    a: "Yes, in this episode it did. Once the hosts approved the plan, Bob switched itself into agent mode and started implementing the subtasks. As David put it, plan mode is for planning, not for code implementation."
  - q: "Can I give IBM Bob an architecture diagram?"
    a: "Yes. Tejas drew the architecture on a whiteboard canvas, and the hosts exported it as an image and attached it to the build prompt. Instead of describing the diagram in words, they asked Bob to explain it back, and plan mode confirmed it had read the architecture before asking its clarifying questions."
  - q: "How do I stop IBM Bob using outdated framework versions?"
    a: "Tell it to update its memory. In this episode Bob scaffolded Next.js 14 and React 18 and insisted Next.js 16 didn't exist. The hosts had Bob save a memory rule to always search the web for the latest information, which it keeps for future sessions."
  - q: "Is IBM Bob's plan mode spec-driven development?"
    a: "David described it as very similar to regular spec coding. The plan came back with subtasks that have IDs (ST1 to ST9), a data schema and an API contract, which he contrasted with vibe coding. You settle the decisions first and then let the agent work through the numbered tasks."
---

Walfly is an open-source app that passively records your conversations and turns them into searchable transcripts, summaries and action items. In episode 5 of Building with Bob, the first episode of the Walfly build (the show's first four episodes built [KillrCtx](/projects/killrctx), an open-source NotebookLM clone), Tejas and David come up with the idea, sketch the architecture, spend most of the stream shaping an MVP in IBM Bob's plan mode, and end with a running Expo app that has a big record button. If you're new to the tool, start with our overview of [what IBM Bob is](/topics/ibm-bob); this episode works as a hands-on IBM Bob tutorial for going from idea to plan to code.

## What is Walfly and where did the idea come from?

Walfly is a do-it-yourself version of wearable conversation recorders like the Bee, which Tejas shows off at [1:05](?t=65). That device records conversations when you press a button, syncs them to your phone over Bluetooth and then uploads them to the cloud for AI summaries and recaps ([3:14](?t=194)). Bee is owned by Amazon, and Tejas would rather not hand over that much audio, so he suggests building their own.

He also doesn't want to buy another wearable. At [4:16](?t=256) he explains the name ("like a fly on the wall, or on your wrist") and the plan to use a watch he already owns. David suggests a phone mode too, which would be handy for interviews. They agree to build the phone app first, because it's the main engine, and to connect other devices to it later.

The backend is built from tools the hosts' team already works with: **Docling** for audio transcription and **Astra DB** for storing and searching transcripts ([5:25](?t=325)). Tejas wants it to be a proper open-source project that developers can "just clone, put some environment variables in and fly" ([9:20](?t=560)).

## How do you design the architecture before prompting an agent?

They draw it first, then hand the drawing to Bob. At [10:24](?t=624) Tejas sketches the system on a whiteboard canvas:

- **Write path (red):** a UI with a big record button uploads the audio to an API service, which sends it to the Docling SaaS for transcription as SRT files. The transcripts are then chunked, vectorized and stored in Astra DB ([11:38](?t=698)).
- **Read path (green):** the API searches and retrieves directly from Astra DB. Once a recording has been processed, Docling never needs to see it again ([12:49](?t=769)).
- **Metadata:** David points out that conversations recorded at a conference need to say who was speaking, and where and when. Tejas adds date, time, location and diarization (labels like "speaker 1" and "speaker 2") at [14:36](?t=876). The app should let users attach real names to those speakers later.

David calls the idea of exporting the diagram as a PNG and attaching it to the prompt "specing, but with pictures."

## What goes into a good build prompt?

The prompt says what the product does and which technologies to use, and leaves the diagram to explain itself. Tejas dictates while David types, starting at [16:49](?t=1009). Rather than describing the diagram in words, David suggests asking Bob to explain it back to them. That way they find out whether Bob understood it.

The final prompt includes:

1. The project name and its job: record conversations passively and upload them following the attached architecture.
2. **Expo** as the framework ([18:04](?t=1084)), starting with a web interface but eventually running on phones and Apple Watch. Tejas specifically doesn't want Swift.
3. An Apple Watch UI that's just a record button: tap to start, tap again to stop. Stopping kicks off the processing workflow straight away.
4. Two tabs in the phone and web UI ([19:26](?t=1166)): **Record** and **My Recordings**, where you can search with keywords, vector similarity or both.
5. Recordings saved with metadata: date, time, location and diarization.
6. A detail view for each recording, showing a summary, key takeaways and action items, with the transcript collapsed but expandable.
7. Editable metadata, plus a chat interface for filling in missing details after the conversation ([22:33](?t=1353)).

They decide against user authentication at [21:55](?t=1315). David argues that a shared Astra database with one endpoint and key is enough for the MVP, and that multi-tenancy can come later.

## How does IBM Bob's plan mode help define an MVP?

Plan mode turns the prompt into a conversation. Bob asks clarifying questions, and each answer becomes a design decision before any code gets written. David switches it on at [25:33](?t=1533). Tejas mentions a habit of his: saving the opening prompt as `genesis.md` in the project so he always remembers where it started. For more on how plan mode, memory and permissions behave across the whole build, see [IBM Bob features in practice](/topics/ibm-bob-features-in-practice).

Bob confirms it read the diagram, then asks a series of multiple-choice questions. The hosts can edit the options inline, which they hadn't realized was possible ([28:23](?t=1703)). Here's what got decided:

| Question from Bob                           | Decision                                                      |
| ------------------------------------------- | ------------------------------------------------------------- |
| Where should the API service run?           | Vercel serverless (they removed the Express option)           |
| Where do summaries and takeaways come from? | An LLM call ([29:27](?t=1767))                                |
| Do we need user auth?                       | No auth for now, multi-user post-MVP ([29:57](?t=1797))       |
| Location format?                            | Reverse geocoding ([31:33](?t=1893))                          |
| Where should raw audio live?                | Vercel Blob storage ([32:36](?t=1956))                        |
| Keyword vs. vector search?                  | Hybrid: both run in parallel, results merged and ranked       |
| Chat scope?                                 | Both per-recording chat and global chat across all recordings |

The raw audio question gets the most discussion. Bob points out that Astra DB isn't built for binary blobs. The hosts briefly consider dropping the raw audio, since the SRT already captures what was said, but they decide to keep it. If Docling improves or a better model comes out, they'll want the original audio to re-transcribe from. If Blob storage turns out to be expensive, they can drop the feature later.

David explains why this step matters:

> Notice that as the humans in this loop, Tejas and I have agency here. We are ensuring that the agent and all of us are on the same page. I look at them as another team member.
> — David, [30:58](?t=1858)

## What should you look for when reviewing an agent's plan in spec-driven development?

Look for questions the plan doesn't answer, and for things that would fail in real use. Bob's plan arrives at [34:35](?t=2075) as a rendered document. It includes a Mermaid diagram, subtasks with IDs (ST1 to ST9), a monorepo layout, a data schema and an API contract ([37:46](?t=2266)). David points out that numbered subtasks are what make this spec-driven development rather than vibe coding ([35:06](?t=2106)). David also has Bob note that the LLM backend should be OpenAI API-compatible and use the Responses and Conversations APIs, so it works with OpenAI, OpenRouter or anything else that speaks that API, and that responses should stream ([36:09](?t=2169)).

### Catching the diarization gap

At [39:26](?t=2366) Tejas asks a simple question: _how_ is the plan doing diarization? The plan mentions speaker labels but never says where they come from. Without being asked, Bob goes off and researches it ([39:58](?t=2398)). It finds that Docling uses Whisper for transcription and lays out options for adding diarization. David asks whether diarization could be an optional step that runs asynchronously. Tejas explains that it normally comes first, because it separates speakers by pitch and timbre in the raw audio. Since it's expensive and processing already happens in the background, they choose to defer diarization until after the MVP ([42:57](?t=2577)).

They also have a small piece of feedback for the Bob team: after you answer a question, all the options stay visible but grayed out, and it's hard to tell which one you picked ([44:02](?t=2642)).

> This is what product development looks like in 2026.
> — Tejas, [45:54](?t=2754)

### Catching the location permission bug

Reading the "expected outcomes" section, Tejas spots a problem at [49:47](?t=2987):

> You may record for like 20 minutes and then realize, I don't have location permissions, and then it just crashes.
> — Tejas, [49:47](?t=2987)

The plan captured location when a recording _stopped_. They change it so the app asks for location permission when you tap record, and stores empty location metadata if you decline, so the recording still works. David also asks for Braille-style dot spinners as progress indicators ([51:26](?t=3086)). They're glad to see the Apple Watch companion listed as future, post-MVP work ([53:04](?t=3184)).

## What happens when Bob switches from planning to implementation?

Once the plan is approved, Bob switches itself from plan mode to agent mode and works through the subtasks one at a time ([54:56](?t=3296)). Along the way they learn a few things about how Bob behaves.

- **Permissions are strict by default.** David explains at [55:59](?t=3359) that this is deliberate: Bob is aimed at enterprise and production apps, so it asks before running commands. You can allow commands for the current project ([58:10](?t=3490)) or loosen the global settings.
- **Watch for outdated defaults.** At [1:03:20](?t=3800) Tejas notices Bob scaffolding Next.js 14 and React 18. When they ask for Next.js 16 and React 19, Bob claims Next.js 16 doesn't exist ([1:03:51](?t=3831)). They correct it and have Bob update its memory ([1:04:25](?t=3865)). Tejas suggests a broader rule: always search the web for the latest information.
- **Use separate tasks for side work.** Bob can run several tasks at once. David opens a new task to initialize Git at [1:12:29](?t=4349) so the main build isn't interrupted.
- **The Xcode surprise.** The Git setup fails with exit code 69 ([1:13:00](?t=4380)). Tejas recognizes the cause: on macOS, Git comes with Xcode's developer tools, and after a fresh Xcode install it won't run until you accept Xcode's license agreement. Once that's accepted, Bob adds a `.gitignore` and makes the initial commit ([1:15:18](?t=4518)).
- **Bob pushes back when it should.** Bob flags that the Braille spinner library doesn't suit the mobile UI and suggests alternatives. They go with React Native Progress for mobile ([1:21:49](?t=4909)).

David also says that when it's time to create the database, Bob could do it through the Astra MCP server instead of the Astra dashboard ([1:22:54](?t=4974)).

## What does the first Walfly demo look like?

The first demo is a running Expo web app with a big record button, with no services connected yet. The API came up in the terminal, but the UI was at `localhost:8081` ([1:28:26](?t=5306)), not on port 3000, where David already had another app running. The record screen appears at [1:29:00](?t=5340).

Tapping record in Bob's built-in browser gives a permission error, probably because that browser doesn't have microphone access. In Chrome the permission prompt appears and recording starts ([1:29:32](?t=5372)). Docling, Astra DB and the LLM aren't connected yet, so no recordings show up in the library and chat does nothing. The app is clearly laid out as a mobile app, though, and all the planned screens are there ([1:30:07](?t=5407)).

## What's next

Connecting the app to real services starts in [episode 6, part 2 of the Walfly build](/episodes/walfly-record-button-redesign-and-astra-db-setup). The hosts redesign the record button, create the Astra DB database and a vectorized `recordings` collection, and get recordings uploading into it, then chase a chain of Docling errors that keeps audio from becoming a transcript. You can follow the whole build on the [Walfly project page](/projects/walfly).
