---
slug: local-first-transcription-python-sidecar-and-coordinating-agents
videoId: tH5-O5iKzM8
title: "Local Docling + Whisper Sidecar and Beads for Agent Teams"
description: "Walfly runs open-source Docling with Whisper Turbo in a Python sidecar next to Next.js and Expo, then coordinates IBM Bob agents with Beads and Agent Mail."
tldr: "Tejas and David make Walfly's transcription fully local by running open-source Docling with Whisper Turbo in a small Python sidecar next to the Next.js and Expo apps. They then use IBM Bob, Beads Rust and MCP Agent Mail to plan and coordinate a full UX and brand overhaul, fight through an Expo SDK upgrade, and leave with web recording working and native iOS as homework."
project: walfly
topics:
  [
    "local-first transcription",
    "python sidecar",
    "asr pipeline",
    "agent coordination",
    "ux design system",
    "brand identity",
    "expo sdk upgrade",
    "recording checkpoints",
  ]
tools:
  [
    "IBM Bob",
    "Bob Shell",
    "Docling",
    "Whisper Turbo",
    "Python",
    "uv",
    "Uvicorn",
    "Next.js",
    "Expo",
    "React Native",
    "CocoaPods",
    "iOS Simulator",
    "Astra DB",
    "Beads Rust",
    "MCP Agent Mail",
    "GPT-5",
    "Fraunces",
    "Playfair Display",
    "Inter",
  ]
takeaways:
  - "Docling as a hosted service is built for documents like Word, Excel and PowerPoint; audio needs an ASR pipeline, which in August 2026 meant running open-source Docling locally."
  - "A Python sidecar lets a JavaScript app use a Python-only tool without building and bridging a full Python backend: it is just a small service on its own port that the main app calls when needed."
  - "Starting the sidecar, the Next.js server and the Expo app from one npm run dev command keeps a three-service local setup manageable."
  - "Beads Rust gives agents a persistent, project-wide task list that survives sessions, while MCP Agent Mail lets parallel agents announce their work and reserve files so they don't overwrite each other."
  - "Asking the coding agent to 'grill me' before building turns vague design goals into concrete decisions like dark-first, an ultra-minimal mark and a single amber palette."
  - "Coding agents handle boilerplate and even creative work well, but precise spacing and layout are often faster and cheaper to fix by hand than to describe in prompts."
  - "Tell your agent to check for the latest versions of frameworks like Expo; its defaults may be out of date."
faq:
  - q: "Can Docling transcribe audio files?"
    a: "Open-source Docling running locally can transcribe audio through its ASR (automatic speech recognition) pipeline, and it uses Whisper for this on its own. In August 2026, the hosted Docling deployment the hosts used was focused on documents and didn't support their audio use case, so they switched to running Docling locally."
  - q: "What is a Python sidecar in a Next.js or Expo app?"
    a: "It is a small, separate Python service running on its own port next to the JavaScript app. The Next.js backend sends recordings to it when it needs transcription and gets the results back, so the main app never has to embed or bridge Python. In Walfly it is started together with Next.js and Expo from npm run dev."
  - q: "How do you stop multiple AI coding agents from overwriting each other's files?"
    a: "David uses MCP Agent Mail, an open-source tool that registers each agent, lets them message each other and reserve the files they are working on. Combined with Beads Rust as a shared, persistent task list, agents in different sessions can see what is open and avoid clobbering each other's work."
  - q: "What is Beads Rust used for?"
    a: "Beads Rust is a Rust reimplementation of Beads, a task tracker built for coding agents and stored in a local database. It keeps epics and tasks across sessions, so you can come back weeks later and ask the agent what is still unfinished. It has a terminal UI rather than a web UI."
  - q: "Why does an Expo iOS build fail after upgrading the Expo SDK?"
    a: "After a major SDK upgrade the native iOS project and its CocoaPods usually need rebuilding, and lock files can keep pinning older package versions. In this episode the fixes included running npx expo run:ios against the existing dev server and deleting the corrupted ios folder so Expo could regenerate it."
  - q: "Is local Docling transcription fast on a Mac?"
    a: "It was for David. Docling makes good use of Apple silicon, and he was surprised that even long recordings transcribed quickly on his Mac. That speed is part of why the local Python sidecar became Walfly's default transcription path."
  - q: "Do Bob Shell and the Bob IDE share sessions?"
    a: "Yes, according to David's experience in this episode. A recent IBM Bob release syncs sessions between Bob Shell and the IDE: he started something in Bob Shell, came back to the IDE, and the session was waiting there to continue. He said it worked great."
  - q: "When should I start a fresh chat with a coding agent?"
    a: "When a session gets long, start a new chat seeded with the current problem. In this episode Bob hit its default limit of 100 turns, and Tejas suggested clearing context and starting a new chat with just the latest error. Because the tasks lived in Beads, nothing was lost by starting over."
  - q: 'What is the "grill me" skill?'
    a: "It is a skill that makes the coding agent question you until your requirements are concrete, instead of building from a vague prompt. In this episode it turned the brand brief into decisions like dark-first, an ultra-minimal fly mark and an amber palette. Later in the stream it was used to define recording checkpoints, and Bob logged the result as a checkpoints epic in Beads."
---

Walfly now transcribes conversations entirely on your own machine. In episode 8 of Building with Bob, part 4 of the Walfly build, Tejas and David explain why hosted Docling isn't the right fit for audio, show the Python sidecar that runs open-source Docling locally, and then use IBM Bob, Beads Rust and MCP Agent Mail to plan and coordinate a full design overhaul of the app.

It's also an honest look at what shipping a real mobile app with coding agents is like: an Expo SDK upgrade eats a good chunk of the stream, and the hosts talk about where a human with a flexbox is still faster than an agent. If you're new to the project, start at the [Walfly project page](/projects/walfly) or the previous episode, [episode 7: debugging Expo audio and local Docling transcription](/episodes/debugging-expo-audio-and-local-docling-transcription).

## Why doesn't hosted Docling work for Walfly's audio?

Hosted Docling is built for documents, and Walfly needs to process audio. IBM's hosted product is called Docling for IBM watsonx; the hosts refer to it as Docling SaaS. As Tejas explains at [1:59](?t=119), the hosted service delivers Docling's original promise: turning Word documents, Excel sheets and PowerPoint slides into something LLMs can read. Walfly does the same thing for rich media, which needs an ASR (automatic speech recognition) pipeline. In August 2026, the hosted deployment we used didn't support that yet, which matched what the hosts saw in [episode 7](/episodes/debugging-expo-audio-and-local-docling-transcription).

That's a hard constraint, so the team switched to running open-source Docling locally. David had come to the same conclusion. He'd chosen the hosted service at first because it's fast and he didn't have to deal with any of the plumbing, but it was "the wrong tool for the wrong use case" ([0:31](?t=31)).

## What is a Python sidecar in a Next.js app, and how does it run Docling with Whisper?

The sidecar is a small Python service on its own port that handles the whole Docling pipeline, so the Next.js app never has to host Python itself. Docling is mainly a Python tool, and Walfly is a Next.js and Expo app. At [3:31](?t=211) David describes weighing a full Python backend before settling on a sidecar.

> I don't want the extra complexity of having a Python back end that I then have to bridge and stuff. The sidecar means that I can just have this nice little kind of compact Docling service that handles the whole pipeline.
> — David, [4:04](?t=244)

Here's how the flow works in the demo ([5:43](?t=343)):

1. The Expo app records audio. When recording stops, the app produces an MP4 file.
2. The recording goes to the sidecar, which hands it to local Docling.
3. Docling runs Whisper Turbo on its own, with no extra setup, and returns a timestamped transcript.
4. The Next.js backend takes it from there: summaries, takeaways, tags, and storage.

At [6:51](?t=411) David shows that a single `npm run dev` starts all three services: the Expo mobile app, the sidecar and the Next.js backend. He was surprised by the speed, too. Docling makes good use of Apple silicon, and even long recordings transcribe quickly on his Mac ([9:08](?t=548)). For the full local setup, including Whisper on a Mac and the errors to expect, see our [Docling audio transcription guide](/topics/docling-audio-transcription).

## What already works, and what's still missing?

The core pipeline works end to end: transcripts with timecodes, summaries, takeaways, tags, and chat about one recording or across all of them. At [11:33](?t=693) David shows that recordings are stored in Astra DB, which powers the vector search behind the chat. He also added a basic Markdown renderer for chat replies, though he isn't sure that's the right choice for mobile.

Here's what's still missing:

- **Remote audio storage.** The audio files stay on the device that made them, so Tejas can't play David's recording ([10:19](?t=619)).
- **Diarization.** Walfly doesn't know who is speaking yet ([10:53](?t=653)). Both hosts expect it to be heavy work that could fill a whole episode ([13:47](?t=827)).
- **UX.** Tejas describes the current look as Material Design on the web, and David says it's "like a 2005 iOS" ([12:38](?t=758)).

Together they settle on an order: polish the UX first, then host the app (Render is one option mentioned) so there's a real deployed version to use on future streams, and only then take on diarization ([13:13](?t=793)).

> What we want is for developers to be able to git clone this and get something working locally, but the thing that works locally has to be like a high happiness thing.
> — Tejas, [12:06](?t=726)

### The idea for recording checkpoints

While Tejas starts recording the livestream in Walfly, David spots a risk: recording runs until you press stop, which leaves one huge file at the end ([14:52](?t=892)). He suggests **checkpoints** that stop and restart recording seamlessly, sending each chunk off to be transcribed. You'd get closer to real-time results, smaller files to process, and less to lose if something fails. That idea comes back more than once during the episode.

## How do you coordinate multiple coding agents with Beads Rust and MCP Agent Mail?

David pairs two open-source tools: Beads Rust as a persistent, agent-friendly task list, and MCP Agent Mail as a messaging and file-reservation layer between agents. He introduces them at [16:05](?t=965) and says he now uses them in almost all his projects, including with Bob. We compare these tools with GitHub Projects in [coordinating coding agents](/topics/coordinating-coding-agents).

| Tool           | What it does                                                                                                      | Why it matters                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Beads Rust     | A Rust reimplementation of Beads. It tracks epics, decisions and tasks in a local database and has a terminal UI. | Tasks outlive a single agent session, so you can come back weeks later and ask what's still open ([21:05](?t=1265)). |
| MCP Agent Mail | Registers agents, lets them message each other and reserves the files each one is working on.                     | Parallel agents don't overwrite each other's files ([18:03](?t=1083)).                                               |

Tejas calls Beads "just like Trello", and David agrees with a caveat: it's an agentic Trello, built for agents to use ([20:31](?t=1231)). David also notes that Bob keeps its own task list per session, but another session can't see it. Beads is what lets separate sessions coordinate ([40:59](?t=2459)).

In the demo:

1. David asks Bob to register with MCP Agent Mail and create epics, decisions and tasks in Beads Rust ([19:17](?t=1157)). Bob registers as an agent named **Gentle Pond** and fills Beads with tasks based on the original spec from earlier episodes ([22:37](?t=1357)).
2. In a second session he asks for a report on Walfly's current UX. That agent registers as **Coral Bridge** and sends a broadcast about what it's working on ([37:40](?t=2260)).
3. If either agent reserves files, the other can see the lock and leave those files alone ([38:20](?t=2300)).

This pays off later. When Bob reaches its default limit of 100 turns ([52:06](?t=3126)), Tejas points out that David can start a fresh chat without losing anything, because the tasks live in Beads ([53:43](?t=3223)).

## How did Bob build Walfly's brand and visual identity?

Bob wrote the brand from a single detailed prompt, then asked the hosts "grill me" questions before building anything. At [24:13](?t=1453) the hosts ask Bob to create a UX design epic and to search the web for the most praised interfaces in similar apps. Tejas adds a link from the Expo docs about native tabs so the iOS app can drop its "ugly tabs" ([26:07](?t=1567)). Then he raises the stakes ([27:14](?t=1634)): build a brand with a design system, colors and typography, and tell the story of "the perfect companion app to record and document important moments of your life, like a fly on a wall", with the fly as a core design element.

Bob's first draft had an unexpected tone. Its tagline, "Every room has secrets", made it sound like a spy app ([31:38](?t=1898)). Tejas steered it away, and it came back with "The moment you were there for" ([38:53](?t=2333)). The amber metaphor won both hosts over right away: memories "preserved in amber" ([32:12](?t=1932)).

Their answers to Bob's grill-me questions ([33:49](?t=2029)) locked in the design:

- **Dark-first** theme.
- An **abstract, ultra-minimal** fly mark. As Tejas put it, "nobody wants to see a detailed insect."
- A **minimal record interaction**, with no wings unfolding every time you start recording.
- A **lowercase** treatment.
- An **amber** color direction.
- An upgrade to the newer Expo SDK. Tejas's answer: "you should know what SDK we're on and set the right one."

Tejas also asks Bob to write the full brand guidelines to a brand document in the repo ([44:35](?t=2675)). The chosen serif, Fraunces, doesn't survive the day, though. Once it appears on screen, both hosts decide they don't like it and switch to the alternative in the brand doc, Playfair Display, with Inter alongside it ([1:12:13](?t=4333)).

## Where does human precision still beat coding agents?

Fine visual placement is still often faster and cheaper to do by hand. While Bob works, Tejas admits he wrote code by hand that week for the first time in a while ([41:31](?t=2491)).

> I needed like the right spacings and the right paddings and the right margins and the right sizes for my elements. And the coding agent always messed this up. All I had to do was put a flex box in the right place.
> — Tejas, [42:06](?t=2526)

David works the same way: let the agent get the work most of the way, then take over for the details.

> I found that it does most the toil and then I can go in there and I can really turn the key on the precision part.
> — David, [43:13](?t=2593)

Later, in the middle of the Expo upgrade, he pushes back on "coding is done" posts on social media. Once you move past the MVP or demo and start building a real app, "there's still plenty for humans to do. It's not a one-shot thing at all" ([1:23:36](?t=5016)).

## What happened during the Expo SDK upgrade?

The design overhaul included an Expo SDK upgrade, and most of the second half of the stream goes to getting the native iOS build running again. It's a very normal React Native experience, which Tejas says is where developers "used to rage quit building mobile apps" before they could paste errors into an agent ([1:03:08](?t=3788)).

The main problems and fixes:

- **Static rendering error.** A `DynamicColorIOS is not a function` error on the web build, which Bob diagnosed ([47:16](?t=2836)).
- **Native rebuild.** After a major upgrade, the iOS app has to be rebuilt and its CocoaPods reinstalled. Tejas describes CocoaPods as Apple's equivalent of npm ([55:56](?t=3356)).
- **Port confusion.** Expo serves one JavaScript bundle on port 8081 to every client. Running `npx expo run:ios` skips the dev server that's already running and builds only the iOS app ([1:01:59](?t=3719)).
- **Corrupted native project.** Deleting the `ios` folder entirely lets Expo regenerate it ([1:19:03](?t=4743)).
- **Outdated versions.** Bob recommended SDK 56 when 57 was available, and a lock file kept pinning an older package version ([1:19:37](?t=4777)). David's advice is to tell your agent to check for the latest versions from the start ([1:20:43](?t=4843)).

Tejas would have liked a `/goal`-style loop, where the agent keeps running the build, reads the logs and fixes errors until the build succeeds, instead of a human copying and pasting each error ([1:07:11](?t=4031)). David mentions that a recent Bob release syncs sessions between Bob Shell and the IDE, and says it worked well for him ([59:12](?t=3552)). More on Bob Shell and the IDE in [IBM Bob features in practice](/topics/ibm-bob-features-in-practice).

## Web vs. native recording and the checkpoints epic

The hosts decide Walfly needs separate recording mechanisms for web and native, with the app detecting which one to use ([1:16:00](?t=4560)). On the web, if the device sleeps or you switch tabs, the recording stops without warning and never uploads, which makes the case for checkpoints even stronger. David adds a checkpoints epic to Beads. Its goal is to record, store and transcribe long recordings over time, so users get closer to real-time updates and long recordings survive failures ([1:16:38](?t=4598)).

While David fights the native build, Tejas gets web recording working in parallel. His first test fails with "transient sidecar request failed", because something else was already using the sidecar's port ([1:27:57](?t=5277)). That leads to a good question: should the server restart the sidecar if it isn't there? ([1:29:01](?t=5341)). After freeing the port and restarting the sidecar with uv and Uvicorn, the first run downloads Docling's local models ([1:32:19](?t=5539)). A leftover temperature setting then fails with GPT-5, which doesn't accept a temperature parameter ([1:32:50](?t=5570)). After that, the local web UI works ([1:33:23](?t=5603)).

## What's next

The homework is clear: Walfly has to work on both web and native ([1:25:13](?t=5113)). At the close ([1:34:36](?t=5676)), Tejas sets the targets for next time: a working iOS flow, the web flow that already works, the new design looking great, and then hosting the app. The checkpoints epic is also waiting in Beads. Tejas wants a stable app in time for conference season so he can take it with him ([1:26:53](?t=5213)).

Continue with episode 9: [AI code review and Expo mobile layout fixes](/episodes/ai-code-review-and-expo-mobile-layout-fixes).
