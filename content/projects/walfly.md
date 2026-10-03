---
slug: walfly
name: Walfly
tagline: "An open-source, local-first conversation recorder that turns what you hear into transcripts, summaries and action items."
title: "Walfly: Open-Source, Local-First Conversation Recorder"
description: "Walfly is an open-source, local-first conversation recorder built live with IBM Bob: record, transcribe locally with Docling and search with Astra DB."
status: "In progress"
started: "2026-08-14"
repo: "https://github.com/SonicDMG/walfly"
order: 2
stack:
  - IBM Bob
  - Expo
  - React Native
  - Next.js
  - Docling
  - Whisper
  - Astra DB
  - Jev
  - OpenRouter
  - Beads
  - MCP Agent Mail
  - Xavier
  - Docker
---

Walfly is an open-source alternative to wearable conversation recorders. You tap one large record button, and Walfly turns what was said into a transcript, a summary and a list of action items you can search and chat with later. Tejas and David are building it live on **Building with Bob**, using IBM Bob as their AI coding partner in every session, starting with episode 5 after the show's first project, [KillrCtx](/projects/killrctx). The code is open source at [github.com/SonicDMG/walfly](https://github.com/SonicDMG/walfly).

## What Walfly does

- **Records conversations** on the web and on iOS through an Expo app, with location captured only when you allow it.
- **Transcribes locally** with open-source Docling and Whisper, not a hosted API, so audio doesn't have to leave infrastructure you control.
- **Summarizes and extracts action items** with an OpenAI-compatible LLM.
- **Searches everything** with hybrid keyword and vector search in Astra DB, and lets you chat with one recording or all of them.

## An open-source alternative to Bee, Limitless and Plaud

Walfly is an open-source, do-it-yourself alternative to AI wearable recorders like Bee, the Limitless Pendant and Plaud, but it is an app, not a device. It records on your phone or in the browser and transcribes with open-source Docling and Whisper on infrastructure you run, so you don't have to send every conversation to a vendor's cloud.

The idea came straight from Bee. In [episode 5](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=65), the Walfly kickoff, Tejas shows his Bee: press the button and it passively records conversations. It connects to your phone over Bluetooth, stores recordings there first and then syncs them to the cloud, where AI summaries and recaps are generated ([3:14](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=194)). Bee is owned by Amazon, and Tejas liked the idea "minus the privacy concerns", so the hosts decided to build their own. Later, Apple announced a similar meeting-notes feature for the Apple Watch, which the hosts saw as a closed version of what Walfly wants to be ([episode 9](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=198)).

|                   | Hardware?                                                                                                                            | Where your audio goes                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Walfly            | No. An open-source Expo app for phone and web                                                                                        | Transcribed by open-source Docling and Whisper, locally or on a stateless ASR service you host                                                                                                                                                  |
| Bee (Amazon)      | Yes, a wrist-worn device with a button and microphones ([Bee](https://www.bee.computer/))                                            | Amazon says Bee "processes conversations in real-time and no audio is ever stored" ([Amazon](https://www.aboutamazon.com/news/devices/bee-amazon-wearable-ai-device-new-features))                                                              |
| Limitless Pendant | Yes, a pendant. Limitless has been acquired by Meta and no longer sells it to new customers ([Limitless](https://www.limitless.ai/)) | Full recordings stay in your Limitless account until you delete them ([Limitless privacy](https://www.limitless.ai/privacy))                                                                                                                    |
| Plaud             | Yes, devices such as the Plaud Note and NotePin ([Plaud](https://www.plaud.ai/))                                                     | A cloud sync feature stores recordings, transcriptions and summaries in your Plaud "Private Cloud", and content you submit to AI features is shared with its LLM service providers ([Plaud privacy](https://www.plaud.ai/pages/privacy-policy)) |

The trade-off is real: Walfly has no dedicated hardware and is still a work in progress. What you get is code you can read, run and change, and control over where your recordings are processed.

## How it has evolved

1. **Kickoff and MVP plan** ([episode 5](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob)): whiteboarding a write path (record, upload, transcribe, vectorize) and a read path (search, chat), then Bob's plan mode turns it into an MVP with numbered subtasks.
2. **Record button and Astra DB** ([episode 6](/episodes/walfly-record-button-redesign-and-astra-db-setup)): the record button becomes a pulsing red circle, Bob creates a `recordings` collection with vectorize in a new `walfly` Astra DB database through the Data API, and upload fixes get recordings into the database, though transcription still fails.
3. **First real transcript** ([episode 7](/episodes/debugging-expo-audio-and-local-docling-transcription)): native microphone permissions, multipart uploads, and a pivot from hosted Docling to local Docling produce the first working transcript, summary and action items.
4. **Local-first and a new brand** ([episode 8](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents)): a Python sidecar runs Docling with Whisper Turbo, Beads and MCP Agent Mail coordinate several coding agents, and Walfly gets a dark, amber-toned identity.
5. **Reviews and mobile polish** ([episode 9](/episodes/ai-code-review-and-expo-mobile-layout-fixes)): Bob Review and [Xavier](https://xavier.team)'s `/x-review` run side by side, and safe-area and keyboard layout bugs are fixed on mobile.
6. **Chunked, ephemeral ASR** ([episode 10](/episodes/designing-audio-chunking-and-ephemeral-asr)): a PRD for 30-second, pause-aware audio chunks becomes a stateless ASR service in Docker, and testing exposes the next round of bugs.
7. **Dogfooding, byte-based chunks and Jev** ([episode 11](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly)): Walfly records the whole livestream, hits Astra DB's 8,000-byte limit on indexed strings, and moves to byte-sized chunk documents linked by a recording ID. Recorded moments are grouped by intent with Jev, TypeSafe AI's System One model.

## Architecture at a glance

| Layer            | Choice                                                      |
| ---------------- | ----------------------------------------------------------- |
| Client           | Expo (React Native) for iOS and web                         |
| API              | Next.js backend in a monorepo                               |
| Speech-to-text   | Docling ASR with Whisper, run as a stateless Docker service |
| Storage & search | Astra DB (hybrid keyword and vector search)                 |
| Grouping moments | Jev via OpenRouter (classification, not text generation)    |
| Agent workflow   | IBM Bob, Xavier, Beads, MCP Agent Mail, GitHub Projects     |

## What's next

As of episode 11 (October 2026), Walfly records long conversations in byte-sized chunks. Next, the team wants each chunk to use the bytes Astra DB allows instead of hundreds of tiny documents, to stitch transcripts together only when a recording is read, and to review the chunk data model against Astra DB and Cassandra best practices ([episode 11](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=5550)).
