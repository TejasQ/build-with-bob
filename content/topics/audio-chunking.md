---
slug: audio-chunking
title: "Audio Chunking for Speech-to-Text: 30s Chunks + VAD"
h1: "How to chunk audio for speech-to-text"
description: "How to chunk long recordings for Whisper-style ASR: chunk length, voice activity detection, ordering chunks that arrive out of order, and stateless hosting."
answer: "Split long recordings into chunks of about 30 seconds, and use voice activity detection to close each chunk at the next pause so nobody is cut off mid-sentence. Give every chunk a sequence index so the server can reorder them, and send them to a stateless ASR service that transcribes each chunk, returns the text and deletes the audio."
updated: "2026-11-03"
about:
  [
    "audio chunking",
    "voice activity detection",
    "Whisper",
    "Docling",
    "ephemeral ASR service",
    "Xavier",
    "Walfly",
    "Astra DB",
  ]
episodes:
  - walfly-record-button-redesign-and-astra-db-setup
  - local-first-transcription-python-sidecar-and-coordinating-agents
  - ai-code-review-and-expo-mobile-layout-fixes
  - designing-audio-chunking-and-ephemeral-asr
  - astra-db-8000-byte-limit-and-jev-clustering-in-walfly
faq:
  - q: "Should you chunk transcripts by time or by bytes?"
    a: "Chunk by the limit that actually constrains you. Walfly started with about 30 seconds plus a pause, but Astra DB caps an indexed string at 8,000 bytes, so in episode 11 the hosts switched to byte-based chunks of about 7,500 bytes, each stored as its own document with a recording ID."
  - q: "Should transcript chunks overlap?"
    a: "A little overlap is cheap insurance when chunks are stored as separate documents, because each one is searched on its own. In episode 11 the hosts agreed overlap only matters if chunks live apart, and IBM Bob targeted about 7,500 bytes per chunk to leave room for it under Astra DB's 8,000-byte cap."
  - q: "How long should audio chunks be for Whisper transcription?"
    a: "Around 30 seconds is a good baseline, because Whisper was trained on 30-second inputs and the WhisperX paper found merging speech segments up to that length gave the best speed and accuracy. Walfly uses 30 seconds plus a pause detected by voice activity detection, so a chunk never ends mid-phrase."
  - q: "How do you handle audio chunks that arrive out of order?"
    a: "Give each chunk its own ordering information, such as a sequence index, and let the server stitch transcripts back together by that index rather than by arrival time. Don't rely on the client to deliver chunks in order. A design that processes chunks in parallel handles network hiccups naturally."
  - q: "What is an ephemeral ASR service?"
    a: "It's a speech recognition service that keeps nothing. It receives an audio chunk, transcribes it, returns the result and deletes the audio right away. It doesn't store audio files or transcripts, so the transcripts live in the app's own database instead."
  - q: "Where can you host a stateless transcription service?"
    a: "Anywhere that runs a long-lived container. Walfly's plan targets DigitalOcean, Render or Fly.io. A serverless platform without long-running processes won't fit, and on-demand sandboxes such as Daytona are another option the hosts discussed. Test the container locally first."
  - q: "Why not just upload the whole recording at the end?"
    a: "A single hours-long file takes a long time to process, may need to fit in memory all at once, and is lost entirely if something fails. On stream, a long recording made a laptop shut down from heat. Chunks keep failures small and allow near-real-time updates."
  - q: "Why does my Expo audio upload work on iPhone but not on the web?"
    a: "Expo's file system package doesn't support the web. In August 2026, Walfly's upload worked on native once IBM Bob sent base64 and byte arrays instead of a URI reference, but still failed in the browser. The fix was to branch on platform so both paths send a real Blob that the server accepts."
  - q: "Where should recordings be stored during development?"
    a: "Somewhere disposable. Walfly makes storage switchable by environment variable: when BLOB_READ_WRITE_TOKEN is empty, recordings go to the operating system's temp directory, and when it's set, they go to Vercel Blob. That keeps test recordings out of paid storage and fits the later ephemeral design."
  - q: "Is it legal or ethical to record conversations for transcription?"
    a: "That depends on where you are and who is in the room, and this isn't legal advice. On stream, the hosts pointed out that you can get consent from the person you're talking to but rarely from everyone around you. They chose an open-source, stateless design with no speaker diarization and planned end-to-end encryption."
---

Walfly records meetings on a phone or wearable and turns them into transcripts, summaries and action items. Its first version transcribed one long file at the end, which broke down as soon as recordings got long. This guide follows the redesign around chunks across episodes 6 to 11 of Building with Bob (parts 2 to 7 of the Walfly build): the reasoning, the numbers we picked, what failed, and why storage limits later forced chunks to be cut by bytes instead of seconds. For the transcription side itself, see our [Docling audio transcription guide](/topics/docling-audio-transcription).

## Why chunk audio at all?

Chunking turns one large, fragile job into many small ones that can run as the recording goes. We saw four reasons on stream:

1. **Losing less when something fails.** In [Local Docling + Whisper Sidecar and Beads for Agent Teams](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents), David first proposed "checkpoints" while Tejas was recording an entire livestream ([14:52](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=892)). His point was that you end up with "this huge file" that "you could potentially lose if something happened" ([15:26](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=926)). When a long recording failed at the end of that episode (the cause turned out to be a port conflict), Tejas said: "the case for checkpointing has never been more clear" ([1:27:57](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=5277)).
2. **Hardware limits.** In [Bob Review vs Xavier and a KeyboardAvoidingView Fix](/episodes/ai-code-review-and-expo-mobile-layout-fixes), David recalled that recording and processing one long file made his laptop "thermally shut down" ([24:10](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=1450)). In episode 10 he added that a big enough file might have to be loaded into memory all at once, which rules out smaller devices ([36:43](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2203)).
3. **Speed.** An hours-long file "is going to take forever" when it's sent in one go ([35:44](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2144)).
4. **Near-real-time updates.** David's first draft processed chunks as they arrived, so the app could show updates during the recording ([8:04](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=484)).

## Before chunking: the first single-file upload path

Walfly's first end-to-end path sent one whole recording from the device to the API, and most of its bugs were about serializing audio, not transcribing it. In [Astra DB Setup and a Better Record Button with IBM Bob](/episodes/walfly-record-button-redesign-and-astra-db-setup) (episode 6, part 2 of the Walfly build), the path was record, upload as multipart form data, store, then hand to Docling. The errors came in this order:

| Error on stream                                                                                                            | Cause                                                       | Fix                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Failed to parse multipart form fields" ([38:11](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2291))       | The recording package sent a URI reference, not the audio   | Send base64 and byte arrays ([42:11](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2531))                                                        |
| Works on iPhone and Apple Watch, fails on web ([42:42](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2562)) | "Expo file system doesn't support web"                      | Branch on platform so both paths produce a real Blob ([43:49](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2629))                               |
| Upload fails with no storage bucket                                                                                        | No [Vercel Blob](https://vercel.com/docs/vercel-blob) store | OS temp directory when `BLOB_READ_WRITE_TOKEN` is empty, Vercel Blob when it's set ([47:02](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2822)) |

The storage switch seeded the later ephemeral design: otherwise Vercel Blob would fill with "50 recordings of some dude saying Walfly" ([48:13](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=2893)). The episode ended with recordings in the database but no transcript, and a suspected problem "between the microphone and the file" ([1:32:26](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5546)), a theme that returned when chunks hit the ASR service.

## How long should audio chunks be?

Use about 30 seconds as a baseline, then wait for the speaker to pause before closing the chunk. In episode 9, David was still weighing "30 seconds, 60 seconds, what makes sense" ([8:43](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=523)). In [Audio Chunking and a Stateless Docling ASR Service in Docker](/episodes/designing-audio-chunking-and-ephemeral-asr), the hosts settled on 30 seconds ([38:38](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2318)). They kept voice activity detection (VAD) after seeing the risk: without it, a chunk "could cut somebody off in the middle of a phrase" ([39:09](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2349)).

> The baseline's 30 seconds, but then it will wait to see if one of us stops talking.
> — on stream, [1:29:57](/episodes/designing-audio-chunking-and-ephemeral-asr?t=5397)

Outside research backs up the 30-second choice. Whisper was trained on 30-second inputs, and the [WhisperX paper](https://arxiv.org/abs/2303.00747) (Bain et al., INTERSPEECH 2023) uses a "VAD Cut & Merge" step. It splits audio at voice activity boundaries, then merges segments up to a threshold. The authors found the best threshold was the input length Whisper was trained on, 30 seconds, which "provides the fastest transcription speed and lowest WER." In November 2026, the [WhisperX README](https://github.com/m-bain/whisperX) still says VAD preprocessing "reduces hallucination" and enables batching "with no WER degradation". It also announces a 2026 "Context-Aware Batching" release that enables `condition_on_previous_context` inside batched transcription, "improving punctuation and proper noun adherence". That eases a known cost of chunking: each chunk losing the context of the one before it.

One side effect: while someone keeps talking, no chunk is sent, which confused the hosts in the first test ([1:20:03](/episodes/designing-audio-chunking-and-ephemeral-asr?t=4803)).

## Handling out-of-order chunks

Give every chunk its own position, and let the server put the transcript together. Don't assume chunks arrive in order. David raised the problem: if the network degrades, "chunk two actually makes it to the pipeline before chunk one" ([28:06](/episodes/designing-audio-chunking-and-ephemeral-asr?t=1686)). He added an explicit task: "ensure that we don't run into audio chunk race conditions in case chunks are processed at different rates, out of order" ([31:38](/episodes/designing-audio-chunking-and-ephemeral-asr?t=1898)).

[Xavier](https://xavier.team), the AI agent orchestrator by Atila Fassina that the hosts use alongside IBM Bob, ran its `/x-prd` command, which interviews you before writing a PRD. It offered several strategies, including a sequential index per chunk ([37:23](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2243)). The hosts ruled one out immediately:

> Option three, absolutely not. We never trust client side, ever.
> — Tejas, [37:57](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2277)

They chose the parallel-processing option. As David put it, if you build in parallel handling from the start, "you naturally harden yourself against network interruptions."

In practice, that means:

- Tag every chunk with a recording ID and a sequence index when it's created.
- Transcribe chunks independently and in parallel.
- Assemble the transcript on the server by index, not by arrival time.
- Treat each chunk as retryable, so one failed chunk doesn't sink the whole recording.

## Write chunking requirements as outcomes

Describe what the system must achieve, not how chunking should work. David's first draft of the PRD said "reliably chunk them" and asked for live intermediate transcripts ([33:58](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2038)). Tejas pushed back on both. Live transcription "breaks separation of concerns", because the recorder's job is to create reliable chunks and send them somewhere ([34:32](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2072)). The rewrite:

> We want to be able to record hours-long conversations and have them processed fully and reliably by the ASR pipeline.
> — Tejas, [35:05](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2105)

Chunking went in as the suggested approach, "but maybe there's something better", leaving an agent or teammate room to improve on it.

## An ephemeral ASR service

An ephemeral ASR service is a speech recognition server that stores nothing. It receives audio, transcribes it, returns the result and deletes the audio. Tejas proposed it because local transcription isn't portable to a watch or phone:

> By stateless I mean it doesn't host any audio files. It doesn't store transcripts. It does nothing.
> — Tejas, [19:26](/episodes/designing-audio-chunking-and-ephemeral-asr?t=1166)

In the PRD, the ASR became a separate, single-responsibility service instead of an app-spawned sidecar ([40:48](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2448)), audio "should be ephemeral and removed the moment it is processed" ([41:58](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2518)), and transcripts stay in Walfly's Astra DB storage ([43:13](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2593)).

### Where to host it

It needs a host that runs long-lived containers: "DigitalOcean, Render, Fly.io or similar", per the PRD ([44:54](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2694)). In episode 9, the hosts ruled out Vercel for that reason ([1:18:18](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=4698)). Tejas also floated Daytona, which spins up a sandbox on demand to run Docling ASR, save the result and throw the container away ([1:18:54](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=4734)). For the first run, the hosts skipped deployment and tested locally ([1:07:31](/episodes/designing-audio-chunking-and-ephemeral-asr?t=4051)). They pointed the app's sidecar URL at port 4321 and ran the Docker image there, which proved the app used the new service and not the old sidecar ([1:08:35](/episodes/designing-audio-chunking-and-ephemeral-asr?t=4115)).

|                            | App-spawned sidecar (episode 8)       | Ephemeral ASR service (episode 10) |
| -------------------------- | ------------------------------------- | ---------------------------------- |
| Lifecycle                  | Started by `npm run dev` with the app | Independent container              |
| Runs on                    | The developer's machine               | Any container host                 |
| Stores audio               | On the local machine                  | Deleted once processed             |
| Portable to phone or watch | No                                    | Yes, over the network              |

## Privacy and consent when recording conversations

Chunking and hosting decide where people's voices travel, so privacy is part of the design. David raised the hard case: at a conference you may have consent from the person across from you, "but you don't have the consent of all the people around you" ([20:31](/episodes/designing-audio-chunking-and-ephemeral-asr?t=1231)). Tejas, who lives in Germany, brought up GDPR and described Apple's approach to a similar feature: no speaker diarization, plus beamforming microphones ([24:01](/episodes/designing-audio-chunking-and-ephemeral-asr?t=1441)). Where the hosts landed ([25:29](/episodes/designing-audio-chunking-and-ephemeral-asr?t=1529)):

- Walfly's case rests on being open source and testable.
- End-to-end encryption went onto the task board.
- Hosting is acceptable, because the server "receives a job, does the job and deletes everything."
- Skipping diarization suits Walfly, whose value is tasks and summaries, not who said what.

Check the recording laws where you and your users are. This isn't legal advice.

## What broke in the first test

The separate ASR service worked, but chunking didn't yet behave as designed. On native, identical log keys meant the hosts couldn't tell chunks from the whole file ([1:23:39](/episodes/designing-audio-chunking-and-ephemeral-asr?t=5019)). On web, chunk requests appeared in the network tab ([1:29:26](/episodes/designing-audio-chunking-and-ephemeral-asr?t=5366)), followed by this error:

> Error processing chunk. Docling error: unrecognized audio container, expected WAV/MP3.
> — log line read by Tejas, [1:31:07](/episodes/designing-audio-chunking-and-ephemeral-asr?t=5467)

Lessons for your own pipeline:

- Record each chunk in a container your ASR accepts, or convert it before upload. Docling's audio formats are covered in the [Docling guide](/topics/docling-audio-transcription).
- Log chunk index and recording ID on every line, so you can tell chunks from whole files.
- Make retries visible. The hosts couldn't tell whether failed chunks had been retried ([1:30:34](/episodes/designing-audio-chunking-and-ephemeral-asr?t=5434)).
- Test with a real long call, as the hosts did in episode 11.

## Chunking by bytes: Astra DB's 8,000-byte limit

When chunks go into a database, the database's size limits decide where to cut, not the clock. In [Astra DB's 8,000-Byte Limit and Jev Clustering in Walfly](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly) (episode 11, part 7 of the Walfly build), the hosts recorded the entire livestream with Walfly. Within minutes it was dropping chunks ([10:10](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=610)). The error was "document size limitation violated" on the indexed `transcript` field: 8,326 bytes sent, 8,000 allowed ([30:07](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=1807)). Astra DB's [Data API limits](https://docs.datastax.com/en/astra-db-serverless/api-reference/dataapi-limits.html) cap an indexed string at 8,000 UTF-8 bytes and a whole document at 4 million characters.

What changed in the design:

- **Split by bytes, not seconds.** The time-based rule "doesn't really apply or need to be enforced" ([35:45](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=2145)). Bob targeted about 7,500 bytes, leaving room for overlap ([40:03](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=2403)).
- **One document per chunk.** An all-day conference recording could pass the 4-million-character document limit, so chunks became separate documents rather than an array in one document ([39:30](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=2370)).
- **Overlap only where chunks live apart.** The hosts weighed it on stream: with one document holding every chunk, overlap adds nothing, but with separate documents "100% I agree" a little context overlap helps, and "data is cheap" ([37:23](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=2243), [37:53](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=2273)).
- **Sentence boundaries matter less for stored text.** The hosts suspected that refusing to split sentences was "a bit of overengineering", since the transcript is read back "as one big set of context" ([35:14](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=2114)). VAD still helps the audio side, where a cut word is lost to the ASR model.
- **A recording ID on every chunk**, so a conversation's chunks can be found again ([55:31](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=3331)).
- **Stitch on read, never on write.** A bug concatenated each new chunk onto the previous transcript, so the stored text grew about 200 characters per chunk until it passed 8,000 bytes again ([1:25:50](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=5150)).

> We shouldn't be storing stitched chunks. We should only be reading stitched chunks.
> — Tejas, [1:27:32](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=5252)

Removing the old 15-second window mattered too: until it was gone, chunks were only 200 to 400 bytes, which meant thousands of tiny rows ([1:12:38](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=4358)). Smaller audio chunks did make the app feel "a lot more real time" while recording ([1:03:22](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=3802)).

An alternative the hosts didn't use: in November 2026, Astra DB's [collection indexing docs](https://docs.datastax.com/en/astra-db-serverless/api-reference/collection-indexes.html) say non-indexed properties "can support larger quantities of data", so you can `deny` a long text field from indexing when you create the collection. A denied field can't be filtered or sorted on, and Walfly needed its transcript searchable.

Follow the rest of the build on the [Walfly project page](/projects/walfly).
