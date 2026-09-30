---
slug: debugging-expo-audio-and-local-docling-transcription
videoId: TrJNkt1G6TA
title: "Docling Audio Transcription and Expo Mic Fixes with IBM Bob"
description: "Hosted Docling had no ASR pipeline for audio, so Walfly moved to local Docling with Whisper. Plus Expo mic permissions, multipart uploads and VTT vs SRT."
tldr: "Tejas and David pick up Walfly where the audio pipeline broke, fixing native microphone permissions and upload formats, then discover hosted Docling has no speech recognition pipeline enabled. They move transcription local, get their first working transcript, summary and action items, and set homework to decide between Docling SaaS and a local setup."
project: walfly
topics:
  [
    "expo audio recording",
    "audio transcription",
    "docling asr",
    "whisper",
    "analysis-driven debugging",
    "cross-platform react native",
    "async processing",
    "vtt vs srt",
  ]
tools:
  [
    "IBM Bob",
    "Bob Shell",
    "Expo",
    "expo-av",
    "react-native-svg",
    "Next.js",
    "Docling",
    "docling-serve",
    "Docling SaaS",
    "Whisper",
    "MLX Whisper",
    "OpenAI Whisper API",
    "Ollama",
    "Astra DB",
    "ffmpeg",
    "Docker",
    "Python",
    "MCP Agent Mail",
    "Nexa AI",
  ]
takeaways:
  - "Expo lets one codebase ship native and web apps, but media packages like expo-av use different audio APIs per platform, so a fix on native can quietly break the web."
  - "A native app has to request microphone permission explicitly; working on the web does not mean the phone will ever unlock the mic."
  - "Record audio into a container your downstream service can parse and upload it as multipart form data rather than base64; WebM caused parsing problems for Walfly."
  - "A successful 200 from an upload endpoint only proves the request landed. Hosted Docling accepted Walfly's audio and then failed because its deployment had no ASR pipeline enabled."
  - "When an agent suggests a CLI flag, check the tool's help output. The suggested docling-serve ASR flag did not exist."
  - "If you already solved a problem in another project, ask the agent for a gap analysis against that working code before writing new code."
  - "You rarely need a specific subtitle format. Walfly needs timestamped transcripts, and Docling's VTT export (not SRT) provides that."
faq:
  - q: "Can hosted Docling (Docling SaaS) transcribe audio files?"
    a: "In August 2026, the hosted Docling deployment we used accepted Walfly's audio upload but failed with an ASR capability gap error: non-audio documents converted normally, but audio needed the ASR pipeline enabled. This is a dated observation about one deployment, not a permanent limit of the product. The hosts made researching whether Docling SaaS can support audio their homework for episode 8."
  - q: "How do you transcribe audio with Docling locally?"
    a: "What worked on stream was importing Docling directly in Python code and using its transcription mode, which invokes Whisper. David ran this as a small sidecar service next to the app. Transcription also needs extra pieces such as ffmpeg and Whisper installed."
  - q: "Does Docling export SRT subtitles?"
    a: "Based on what the hosts found during the stream, Docling exports VTT but not SRT. David pointed out that Walfly only needs a transcript with timestamps, which VTT already provides, so SRT was dropped as a requirement."
  - q: "Which Whisper does Docling use on a Mac?"
    a: "David explained that Docling picks the right Whisper implementation for the hardware it runs on. On Apple silicon Macs it automatically uses MLX Whisper, and it can fall back to CPU elsewhere."
  - q: "Why does my Expo app record audio on the web but not on iOS?"
    a: "In Walfly's case the native app never requested microphone permission, while the web version did. Expo's audio package uses the device's native audio APIs on iOS and Android and browser APIs on the web, so each platform needs its own permission and format handling."
  - q: "Should audio transcription run asynchronously in a recording app?"
    a: "Yes, so users can start a new recording without waiting for the previous one to finish. Walfly turned out to be asynchronous already, because the API does the processing: the hosts killed the simulator mid-processing and the backend still finished the job."
  - q: 'What does Docling''s "ASR capability gap" error mean?'
    a: "It means the Docling deployment you are calling has no ASR (automatic speech recognition) pipeline enabled. In Walfly's case the upload succeeded with a 200, then the task failed with a message saying non-audio documents convert normally on this deployment, so this is an ASR capability gap, not a payload problem. No client flag fixes it; transcription needs a deployment with the ASR pipeline enabled."
  - q: "Does docling-serve transcribe audio?"
    a: "Not in this session. Running docling-serve locally in Docker returned the same ASR error, and the ASR flag Bob suggested for the server did not exist. Tejas concluded they had to call Docling from Python code rather than through the server."
  - q: "How can a coding agent reuse a pipeline I already built?"
    a: "Ask it for a gap analysis. David already had a working Docling and Whisper pipeline in another project, so he had Bob compare the two codebases and list what was missing. He then turned those gaps into a task list for the agent to work through."
  - q: "Does IBM Bob hide secrets in its output?"
    a: "David noticed that the Bob IDE actively cuts out PII, though he hadn't checked whether Bob Shell does the same. Treat this as an on-stream observation, not a guarantee, and keep secrets out of prompts and logs anyway."
---

Walfly finally produced a transcript in this episode. Tejas Kumar and David Jones-Gilardi fixed the native audio path in their Expo app, found that the hosted Docling deployment they were using had no speech recognition (ASR) pipeline enabled, and moved transcription to a local Docling setup. The first recording came back as a transcript with a summary and action items, stored in the shared database. Much of the hour went into working out what was actually running where.

This is episode 7 of Building with Bob and part 3 of the [Walfly build](/projects/walfly). It picks up straight after [episode 6](/episodes/walfly-record-button-redesign-and-astra-db-setup), where recordings first reached Astra DB but hosted Docling never returned a transcript. If you missed the kickoff, [episode 5](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob) covers how the hosts used IBM Bob to spec and scaffold the project.

## Where was Walfly at the start of episode 7?

Walfly already had a working UI, a connected database and a recording flow. What it couldn't do yet was turn audio into a transcript. Tejas describes it as a "real life style meeting recorder" for wearables: tap record on your watch or phone, and get back insights and action items, built on [Astra DB and Docling](?t=71).

Last week, in [episode 6](/episodes/walfly-record-button-redesign-and-astra-db-setup), the app was wired up and recordings were saved to the database, but transcription kept failing. Before the debugging started, David pointed out that [several features had been working since then](?t=201) without anyone noticing:

- **Geo-referencing:** each recording already stored the address where it was made, as requested in the original spec.
- **Error logging:** the pipeline errors from last week were being written to the database.
- **Chat:** the [chat over recordings was wired up](?t=303), and it correctly replied that there were no recordings yet.

## Why does Expo audio work on the web but not on iOS?

Expo lets you ship native and web apps from one codebase, but its audio package, expo-av, uses different audio APIs on each platform, so audio that records fine in the browser can fail on an iPhone. On an iPhone or Android device it uses the device's microphone APIs, and on the web it uses browser audio APIs. As Tejas put it, it [works on one platform some of the time and not the other](?t=136). Fixing one side can break the other, and that happened this week.

### What changed in the native app?

Between streams, Tejas focused on making the native app reliable, since a wearable needs a solid first step. The fixes were:

1. **Microphone permission.** The mobile app [had never requested microphone permission](?t=411). The web app did, which hid the problem.
2. **Audio container.** Last week's recordings were saved as WebM, which [not everything can parse](?t=444). The recording now produces a file the enrichment step can actually process.
3. **Upload format.** Files are now always uploaded as multipart form data rather than base64.
4. **API hardening.** General API stability work, at the cost of some regressions in the web UI.

Anyone pulling the repo fresh also ran into a missing peer dependency. [React Native SVG has to be installed manually](?t=552) (`npm install react-native-svg`) before the iOS simulator will run the app.

## Why did hosted Docling fail to transcribe audio?

In August 2026, the hosted Docling deployment we used accepted the upload but couldn't transcribe it, because that deployment didn't have the automatic speech recognition (ASR) pipeline enabled. IBM's hosted product is called Docling for IBM watsonx; on stream the hosts call it Docling SaaS. Treat what follows as a dated observation about one deployment, not a permanent limit of the product. The first error on David's simulator was a [source-type mismatch](?t=617): Walfly was sending the request in the open-source Docling format, which the hosted service doesn't accept. Tejas had already fixed that locally. On the next run the upload [returned a 200](?t=684), and then the task failed.

### "This is an ASR capability gap, not a payload problem"

The Docling error was clear about the cause. Tejas read it out on stream at [11:56](?t=716):

> Non-audio documents convert normally on this deployment. So this is an ASR capability gap, not a payload problem. No client flag or container change fixes it. Transcription needs a deployment with the ASR pipeline enabled.

In other words, the request was fine; the deployment simply had no Docling ASR pipeline to send audio to.

Tejas explained that hosted Docling [runs in a container on IBM Cloud](?t=749), and that container needs the right configuration. The hosts then argued briefly about what Docling is for in Walfly:

> Yeah, we want to take audio, we want to put audio in and get SRT out. That's it. That is Docling.
> — Tejas, [13:09](?t=789)

David's view was that Docling's value goes beyond raw transcription, because it also produces output that is easier for an LLM to use. They agreed to [split the work](?t=853): Tejas would get Docling working locally, and David would find out whether the SaaS version supports audio.

## Local Docling options compared

Walfly ended up trying four transcription setups in one session:

| Approach                                      | What happened on stream                                         |
| --------------------------------------------- | --------------------------------------------------------------- |
| Hosted Docling (SaaS)                         | Accepted audio, failed with the ASR capability gap error        |
| `docling-serve` in Docker on `localhost:5001` | [Same ASR error](?t=1583); the suggested ASR flag did not exist |
| Docling imported in Python (David's sidecar)  | Worked, using Docling's transcription mode and Whisper          |
| OpenAI Whisper API directly                   | Worked, but bypassed Docling entirely                           |

### Does docling-serve ASR work locally?

Tejas started [docling-serve locally in Docker](?t=886) and pointed Walfly at it. It still returned the "non-audio documents convert normally" error. Bob suggested restarting the server with an extra ASR option, but the CLI replied [no such option](?t=1797). As David put it, that one was "definitely hallucinated". The conclusion both hosts reached around the [28-minute mark](?t=1734) was that ASR needs Python code that imports Docling directly, not a server. Our [Docling audio transcription guide](/topics/docling-audio-transcription) collects the working setup and the errors from across the series.

## How did analysis-driven debugging help?

David already had a working Docling-plus-Whisper pipeline in an earlier project, so instead of prompting ad hoc he had Bob [compare the two codebases and list the gaps](?t=923). He explained why:

> I already had this worked out in another app. So I think a better approach would be to have it do the analysis: what are the gaps here, what's missing from what we implemented here that had this pipeline working. Then I could take that and create a task list, and have it go and march down those things.
> — David, [20:05](?t=1205)

He also added [verbose logging to every step in the pipeline](?t=1622). Setting up audio transcription needs extra pieces, such as [ffmpeg and Whisper](?t=1653). The logs made it much easier to see whether a slow request was actually transcribing or just hanging.

The session also had a few tooling detours:

- Tejas's Bob Shell [crashed with a JavaScript error](?t=988) and needed an upgrade and a fresh sign-in.
- He ran out of usage mid-stream ([budget exceeded](?t=1371)) and topped up by submitting feedback.
- Tejas recommended Bob Shell's [YOLO mode](?t=1131), and David noted that the Bob IDE [redacts PII](?t=1164) on its own.
- David mentioned he has been using MCP Agent Mail to coordinate several agents in one codebase so they don't clobber each other's files. More on that setup in [coordinating coding agents](/topics/coordinating-coding-agents).

## What was the first successful transcript?

The first end-to-end run arrived at about [37 minutes](?t=2227): Tejas's joke recording, "David is a very high temperature person", came back transcribed and summarized. Two small errors came first. The LLM step needed its own API key (David's setup [used Ollama](?t=2025)), and the model [rejected a temperature of 0.3](?t=2194).

David noted that the result included more than the stored transcript:

- The LLM [produced a summary](?t=2292), as the original spec asked.
- Because both hosts use a [shared database](?t=2325), David saw Tejas's recording in his own browser right away.
- Chat over the transcript worked. Audio playback was still missing.

David also pointed out a useful Docling detail: on Mac hardware it [automatically uses MLX Whisper](?t=2057), picking the right Whisper build for the machine's architecture.

## Was Docling actually doing the transcription?

Not at first. Tejas committed his changes, which he described as ["an actual Python file that imports Docling"](?t=2387). But when David pulled them, the app failed with a Whisper API 404. Setting the [`DOCLING_MODE=local`](?t=2609) environment variable didn't help. It turned out Tejas's version was [sending audio straight to OpenAI](?t=2873) with his OpenAI key. His transcript also [wasn't in SRT format](?t=3003), and when he asked Bob whether the app used Docling, [Bob said "almost no"](?t=3104).

David's version did use Docling. He ran a [Docling transcription sidecar](?t=3138) that imports Docling and uses its transcription mode to call Whisper. Tejas was fine with importing Docling but unsure whether it needs to be a separate sidecar. Speaker diarization isn't implemented yet; David expects it to [take noticeably longer](?t=3409).

### SRT or VTT?

Bob first said Docling couldn't produce SRT. After switching to advanced mode so it could search the web, it confirmed that [Docling exports VTT but not SRT](?t=3278). David then questioned whether SRT mattered at all:

> We don't need SRT or VTT. We just need timestamps.
> — Tejas, [1:04:11](?t=3851)

## How should Walfly host transcription?

This is still open. Local Docling works and [can run on CPU](?t=3508), so it could run on a host like Render, but the hosted SaaS is faster. Tejas [summed up the problems with SaaS](?t=3577): no ASR pipeline on the deployment they had tried, and in his view no SRT or VTT output either. Local transcription, on the other hand, adds a hosting burden for anyone running the project:

> What I want, and I think what we want, David, is for developers to git clone, put a few environment variables in, and go.
> — Tejas, [1:04:44](?t=3884)

The agreed plan:

1. **Research Docling SaaS first.** It is faster and any serverless API can call it. Since both hosts work at IBM, they also plan to ask internally what it would take to enable ASR there.
2. **Fall back to local only if SaaS is a hard no**, and work out what the local setup can provide.
3. **Consider on-device processing.** David suggested [Nexa AI](?t=3922), which targets NPUs on phones and edge devices. Tejas said Apple Intelligence's native transcription hasn't been accurate enough in his experience.

David's two-minute recording of this very discussion made a good test. Walfly returned a summary covering how to host Docling, key takeaways, and an [action item to evaluate whether the SaaS version meets their needs](?t=3626), which was exactly the plan. Asking across recordings for a [summary of the last three](?t=3689) also worked, though the chat needs Markdown rendering.

## Is Walfly's processing asynchronous?

Mostly, yes. David wanted [background processing](?t=4057) so a user can record several sessions in a row. Tejas thought the app already did this, because the API does the work, so they tested it by recording, stopping, and [killing the simulator](?t=4100) while processing was underway. The backend finished anyway, so what's left is a [UX issue](?t=4162). Streaming transcription during recording was put on the post-MVP list.

## What's next

The hosts closed by asking Walfly to [summarize the to-dos for next week](?t=4193) so David could spec them with Bob. The next goal is a [solid audio pipeline](?t=4026): settle the Docling SaaS question, decide how local transcription should run, and use Walfly to record an entire stream. UI, product feel and aesthetics are planned for the week after. Continue with [episode 8: local-first transcription, a Python sidecar and coordinating agents](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents).
