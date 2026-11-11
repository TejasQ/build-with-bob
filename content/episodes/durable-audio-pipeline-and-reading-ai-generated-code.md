---
slug: durable-audio-pipeline-and-reading-ai-generated-code
videoId: IpfFp5Nrji4
title: "Walfly's Durable Audio Pipeline and When to Read AI Code"
description: "Walfly moves audio chunks into their own Astra DB table, turns the app into a thin streaming client with chunks persisted to disk, and debugs a useEffect bug."
tldr: "David fixes Walfly's long-recording bug by moving audio chunks out of the vectorized recordings collection into their own Astra DB table. Tejas reads the code, finds the client doing too much, and rebuilds the pipeline so the app only streams audio and saves chunks to disk. A React useEffect bug is the last thing standing in the way."
project: walfly
topics:
  [
    "data modeling",
    "audio chunking",
    "durable audio pipeline",
    "thin client",
    "reading ai-generated code",
    "voice activity detection",
    "react useeffect",
  ]
tools:
  [
    "IBM Bob",
    "Astra DB",
    "Apache Cassandra",
    "Docling",
    "Whisper",
    "Next.js",
    "Expo",
    "React",
    "Bee",
    "Gemini Flash",
    "Jev",
  ]
takeaways:
  - "Don't store growing per-chunk data inside a vectorized Astra DB collection: collections index every field by default, and an indexed string can't pass 8,000 bytes."
  - "Raw conversation chunks are poor vectors because they are full of filler words; Walfly vectorizes the summary instead and keeps chunks in a plain, non-vector table."
  - "Lots of small chunk rows are not a data modeling smell in Astra DB, which runs on Apache Cassandra and is built for very large tables."
  - "Read the code when something breaks or when using the product raises a new constraint, such as a phone going to sleep mid-recording."
  - "A durable audio pipeline keeps the client thin: it streams audio bytes to the server and keeps a rolling buffer of chunks on disk, deleting each one only after the server confirms it."
  - "Whisper produces text from silence, so some voice activity detection before transcription saves bandwidth and avoids garbage, as long as it doesn't cost much battery."
  - "AI lets you build faster, but the hosts argue you should still ship to customers at the same careful pace and test before pushing to main."
faq:
  - q: "Why did Walfly hit Astra DB's 8,000-byte limit on long recordings?"
    a: "Each recording document kept a chunks array in a vectorized collection, where every field is indexed by default, and each new chunk appended the whole previous transcript. The indexed value grew until it passed Astra DB's 8,000-byte limit for an indexed string. Moving chunks into their own non-indexed table fixed it."
  - q: "Should you vectorize raw transcript chunks?"
    a: "Not in Walfly's experience. Raw conversation is full of 'ums' and small talk, which makes semantic search noisy. Walfly summarizes the stitched transcript first, vectorizes the summary, and stores the raw chunks in a plain table that has no vectors."
  - q: "Is it bad to store every audio chunk as its own row in Astra DB?"
    a: "No. Astra DB is built on Apache Cassandra, which can handle billions of rows in a table, so one row per chunk is fine at Walfly's scale. At processing time the app reads all chunks for a recording, stitches them together and summarizes them."
  - q: "Should developers read AI-generated code?"
    a: "The hosts' answer is: at the right moments. Reading every line an agent writes doesn't scale, but you should dig in when something breaks or when using the product raises a constraint. In this episode, reading the code exposed a blocking transcription request, an in-memory queue and audio that was never persisted."
  - q: "Does Whisper hallucinate on silence?"
    a: "Yes. David found that Whisper produces gibberish when given silence because it needs speech to anchor to. That is why the hosts kept some voice activity detection on the device, at least until they can measure whether streaming everything costs much battery."
  - q: "What caused Walfly's 'No transcript available for recording' error?"
    a: "Several things at once after merging the new streaming branch: a missing npm module, a missing WebSocket secret environment variable, stale sidecar code and a Next.js cache, and the Whisper model never reporting ready. The last bug was a React useEffect whose dependency was a new object every render, so the teardown ran on every rerender."
  - q: "Can you connect a Bee Pioneer to a third-party app?"
    a: "In October 2026 Tejas couldn't. His build of Walfly could not find the Bee Pioneer over Bluetooth, and once in pairing mode even Bee's own app couldn't see it. David suspects Bee gates the device to its own app."
---

Episode 12 of Building with Bob, part 8 of the [Walfly build](/projects/walfly), starts with a fix and ends with a rebuilt audio pipeline. David Jones-Gilardi explains how moving audio chunks into their own [Astra DB](https://www.datastax.com/products/datastax-astra) table ended the long-recording failures from [episode 11](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly). Tejas Kumar then shows what he found by reading the code: a client that does too much, and a pipeline that can lose audio. Most of the stream is about when developers should still read code that IBM Bob writes.

## Why did long Walfly recordings fail?

Long recordings failed because transcripts were stored in a way that kept growing inside an indexed field. Walfly records 15-second chunks for resilience, so a failure doesn't lose a whole conversation [6:29](?t=389). Each recording kept a chunks array in the `recordings` collection, and every new entry appended the previous transcript as well, so the array kept getting bigger [7:01](?t=421).

That array was indexed. Walfly's recordings live in a vectorized collection, and in that setup every field is indexed by default, with an 8K ceiling on the index [9:25](?t=565). Astra DB's docs confirm that [collections index all fields by default](https://docs.datastax.com/en/astra-db-serverless/databases/manage-collections.html) and that an indexed string is limited to [8,000 bytes](https://docs.datastax.com/en/astra-db-serverless/api-reference/dataapi-limits.html). David also concluded that storing chunks in the recordings collection at all was the real mistake [9:25](?t=565).

## Moving audio chunks into their own Astra DB table

The fix was a separate table for chunks that isn't vectorized at all. David showed new `recordings v2` and `recording chunks v2` structures, where the chunks one is a table rather than a vector-enabled collection [10:01](?t=601). Astra DB's docs describe the difference: collections hold documents with a dynamic schema, while [tables use fixed schemas and store data in rows](https://docs.datastax.com/en/astra-db-serverless/databases/manage-collections.html).

Why not vectorize the chunks? Most conversation is "ums" and filler, which makes semantic search noisy, so Walfly summarizes first and vectorizes the summary in the recordings collection [10:33](?t=633). David also answered a worry from the previous week about having one row per chunk: Astra DB runs on Apache Cassandra, which handles billions of rows in a table, so scale isn't a concern here [11:40](?t=700). At processing time, the app reads every chunk for a recording, stitches them together and summarizes them [12:13](?t=733). The logs stayed clean while the stream was being recorded [13:17](?t=797).

> With the right guidance, the AI agent did an excellent job of modifying the data model, but I had to dig in. I had to figure out what was going on and then I could guide it properly.
> — David [20:12](?t=1212)

### Music detection: Shazam-style matching didn't pay off

David also tried to detect music in recordings. A free recognition service only matched clean song files from its own library, and Gemini Flash could name songs from microphone audio but often guessed wrong before getting it right [14:55](?t=895). A reliable option would have been a paid service, and he didn't think it was worth it [15:31](?t=931). The code is still there, along with voice activity detection (VAD), which helps keep nearby voices and drop room noise [16:37](?t=997).

## Should developers read AI-generated code?

Yes, at the right moments: when something breaks, or when using the product raises a constraint the code may not handle. Tejas framed it as a question many developers now face, since an agent can produce thousands of lines faster than anyone can read them [19:13](?t=1153). David's data model fix came from the first case, a real failure. Tejas's investigation came from the second: he was thinking about how people would use Walfly, like leaving a phone on a desk at a conference while a wristband captures audio [27:07](?t=1627).

> It's not about writing code. It's about understanding architecture now.
> — Tejas [29:21](?t=1761)

David pushed back on the idea that this is new. No team gets every architectural decision right the first time; with agents, a bad decision just travels faster, and so does the fix [30:29](?t=1829). The hosts agreed that building faster doesn't mean shipping faster, especially for a business rather than a low-stakes open-source project [32:04](?t=1924). David added that with tests so cheap to generate, there's "no excuse" not to test, though Walfly itself doesn't have a test harness yet [33:12](?t=1992).

## What was wrong with the old audio pipeline?

Reading the code showed that the client knew too much and that audio could be lost. Tejas listed the problems [21:53](?t=1313):

1. **The UI decides what is speech.** It records 15-second chunks behind a naive silence gate [22:56](?t=1376).
2. **Transcription is blocking.** Each chunk is POSTed to the API, and the request waits for the sidecar to transcribe it with Whisper, so every chunk waits on the one before [23:26](?t=1406).
3. **Audio is never persisted.** Good for privacy, but if the network dies, that audio is gone [23:26](?t=1406).
4. **The queue lives in memory.** If the app closes or the phone sleeps, queued chunks disappear [24:02](?t=1442).
5. **Only five retries.** After five failures a chunk is dropped, which is what happened with the 8,000-byte errors [24:59](?t=1499).

> The UI knows more than it should.
> — Tejas [22:24](?t=1344)

Walfly also stopped recording at exactly 15 minutes on its own. Bob confirmed a hard-coded 15-minute constraint, and David planned to move it into an environment variable [48:36](?t=2916).

### An engineering pop quiz: what would you fix first?

Tejas turned the list into a pop quiz [35:18](?t=2118). David's order put making processing asynchronous first, since every chunk already knows which recording it belongs to [36:29](?t=2189). Second, persist chunks locally until the server confirms they're processed [39:46](?t=2386). VAD came last, and he argued for keeping some of it:

> Whisper will hallucinate the complete crap out of silence.
> — David [37:37](?t=2257)

This matches what others report: Whisper has no built-in voice activity detection, and the usual fix is to [run VAD before Whisper](https://www.dograh.com/feeds/blog/whisper-hallucination-silence) so it never sees empty stretches.

## The new architecture: a thin client and a durable pipeline

Tejas, who comes from front-end engineering, put the client first [40:55](?t=2455). His design has the app act as a proxy that receives an input stream of audio bytes from a Bluetooth or phone microphone and forwards it [41:35](?t=2495). Like a dash cam, it keeps a rolling buffer and saves chunks to disk while streaming [42:16](?t=2536).

| Concern             | Old pipeline                    | New pipeline                                   |
| ------------------- | ------------------------------- | ---------------------------------------------- |
| Client role         | Detects speech, cuts 15s chunks | Streams audio bytes, keeps a rolling buffer    |
| Transcription       | Blocking, one chunk at a time   | Queued and processed in parallel on the server |
| Lost network        | Chunks dropped after 5 retries  | Chunks on disk, deleted after success          |
| Phone goes to sleep | In-memory queue is lost         | Next.js keeps working and fills Astra DB       |

The Next.js server asks the Python [Docling](https://github.com/docling-project/docling) sidecar for transcripts and writes them to Astra DB [43:47](?t=2627), so the phone can sleep and the transcript is ready when you open the app [44:46](?t=2686). David wants battery measurements before dropping VAD on the device entirely [42:49](?t=2569). Tejas had built all of it on a branch during the week but hadn't proven it worked [50:20](?t=3020).

### The Bee Pioneer wouldn't pair

Tejas also wanted Walfly to stream from his Bee Pioneer wristband, which he chose for its long battery life [1:08](?t=68). His build showed a "Stream from Bee Pioneer" option, but the phone couldn't find the device [45:57](?t=2757). David suspected Bee gates its hardware to its own app [48:03](?t=2883), and later even Bee's app couldn't see it [1:09:09](?t=4149). In October 2026 Amazon, which owns Bee, announced the [Bee Frontier](https://www.aboutamazon.com/news/devices/amazon-personal-ai-bee-frontier-bee-eclipse) as "the next generation" of its AI wearable.

## Merging the branch and debugging "No transcript available"

The hosts asked Bob to pull the remote branch, merge it into local main, review and test, and Bob picked the right branch without being told which [56:33](?t=3393). When it offered to push, David stopped it: test locally first [57:07](?t=3427). The fixes came one at a time:

- A missing npm module behind the audio PCM worklet [1:00:52](?t=3652).
- A missing `WALFLY_WS_SECRET` environment variable [1:02:31](?t=3751), after which chunks showed as queued in parallel [1:03:35](?t=3815).
- "No transcript available for recording," with errors too terse to act on, so they asked Bob for more verbose logs [1:11:23](?t=4283). They also noted they had skipped a review of the big merge [1:11:55](?t=4315).
- Port confusion between 3030 and 3000, then a cleared Next.js cache after Bob noticed old sidecar code still running [1:19:34](?t=4774).
- Whisper's model never reporting ready [1:18:31](?t=4711), until a worker loaded the small model and transcripts appeared [1:23:36](?t=5016).

The final bug was in React. A mount effect captured a dependency that was a new object on every render, so the teardown and crash recovery ran again on each rerender [1:24:40](?t=5080). As the hosts put it once it worked, the problem was never the architecture but a front end handing over a new teardown function reference every time [1:26:14](?t=5174). The new pipeline now persists chunks to disk, retries, and deletes them once they succeed.

## Defining "done" for Walfly

The hosts' definition of done is using Walfly at a conference all day [53:45](?t=3225). Because their team shares one Astra DB database, they also imagined pooled conference summaries, searched with Astra DB's vector, BM25 lexical search and NVIDIA reranker [54:19](?t=3259), and chat across everyone's conversations [54:52](?t=3292).

## What's next

Tejas expects Walfly to be production ready next week, meaning the app as a thin proxy on infrastructure you run, not a hosted service [1:21:45](?t=4905). David wants to prove the pipeline's durability with a developer dashboard that shows each asynchronous request and its processing step [1:26:51](?t=5211), and the 15-minute recording limit still needs to become configurable. For the chunking background, see [the audio chunking guide](/topics/audio-chunking) and how the hosts [coordinate coding agents](/topics/coordinating-coding-agents). Follow the build at [/projects/walfly](/projects/walfly).
