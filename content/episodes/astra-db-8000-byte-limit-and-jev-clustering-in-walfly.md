---
slug: astra-db-8000-byte-limit-and-jev-clustering-in-walfly
videoId: 1H_H9Sx9-FI
title: "Astra DB's 8,000-Byte Limit and Jev Clustering in Walfly"
description: "Walfly records its own livestream, hits Astra DB's 8,000-byte indexed string limit, moves to byte-based chunk documents and clusters moments with Jev."
tldr: "Tejas and David record the whole livestream with Walfly to test their new audio chunking. David shows moments grouped by intent with Jev, TypeSafe AI's System One model. The test then hits Astra DB's 8,000-byte limit on indexed strings, so they switch to byte-based chunks stored as separate documents and track down a transcript that kept growing."
project: walfly
topics:
  [
    "audio chunking",
    "astra db limits",
    "data modeling",
    "jev",
    "classification",
    "dogfooding",
    "code review",
  ]
tools:
  [
    "IBM Bob",
    "Xavier",
    "Astra DB",
    "Apache Cassandra",
    "Jev",
    "OpenRouter",
    "Ollama",
    "gpt-oss-20b",
    "Whisper",
    "Docling",
  ]
takeaways:
  - "Recording your own meetings with the app you're building finds real bugs fast: within ten minutes of recording the stream, Walfly was dropping chunks."
  - "Astra DB caps an indexed string at 8,000 UTF-8 bytes, so a long transcript in a vectorized field fails once it grows past that, even though a whole document can hold up to 4 million characters."
  - "When storage is the constraint, split transcripts by byte size instead of by time; Walfly now targets about 7,500 bytes per chunk to leave room for overlap."
  - "Design for the longest real session, not the demo: an all-day conference recording rules out keeping one growing document per conversation."
  - "Store each chunk as its own document with a parent recording ID, and stitch chunks together when you read a recording back, never when you write it."
  - "A decision model like Jev fits classification jobs such as grouping recordings by intent, where an LLM would cost more tokens and be slower; it doesn't generate text, so it's not a chatbot."
  - "Asking a coding agent to search the web and the vendor docs before changing code surfaced the exact Astra DB limits, which then became constants in the codebase."
faq:
  - q: 'What does "document size limitation violated" mean in Astra DB?'
    a: "It means a document broke one of the Data API's size limits. In this episode the field was `transcript`, an indexed string, and Walfly sent 8,326 bytes when the limit is 8,000. The fix was to keep every indexed string under 8,000 bytes by splitting transcripts into smaller chunk documents."
  - q: "What is the Astra DB size limit for an indexed string?"
    a: "8,000 UTF-8 bytes per indexed string property, according to the Astra DB Data API limits page. A whole document can hold up to 4 million characters, but every indexed string inside it still has to stay under 8,000 bytes."
  - q: "What is Jev from TypeSafe AI?"
    a: "Jev is a System One model from TypeSafe AI. Instead of generating text, it reads your input and returns a typed decision with a probability. In Walfly, David uses it through OpenRouter to group recorded moments by intent, by work and life, or into clusters it finds on its own."
  - q: "Should you chunk transcripts by time or by bytes?"
    a: "Chunk by whatever limit actually constrains you. Walfly first cut audio into 15 to 30 second chunks that waited for a pause. Once Astra DB's 8,000-byte indexed string limit became the binding constraint, the hosts switched to splitting by byte size, targeting about 7,500 bytes."
  - q: "Should transcript chunks be separate documents or one array?"
    a: "Separate documents, if recordings can run long. One document per conversation hits the 4-million-character document limit on an all-day recording. Walfly stores each chunk as its own document with a recording ID, so a conversation's chunks can be found and stitched together on read."
  - q: "Why did Walfly's transcript keep growing past 8,000 bytes?"
    a: "For each processed chunk, the code concatenated the previous transcript with the new chunk and wrote the result back. Each chunk added about 200 characters, so after enough chunks the stored transcript passed 8,000 bytes and Astra DB rejected every upload."
  - q: "Can you use Jev through OpenRouter?"
    a: "Yes. In October 2026 David accessed Jev through OpenRouter because TypeSafe AI's own access had a waitlist. That let Walfly use one interface for both Jev and gpt-oss-20b, which handles the chat feature."
chapters:
  - start: 0
    title: "Dogfooding Walfly: recording the stream live"
  - start: 388
    title: "A website that turns streams into guides"
  - start: 704
    title: "Jev as an AI slop detector"
  - start: 1050
    title: "Grouping moments by intent with Jev"
  - start: 1513
    title: "Astra DB's 8,000-byte indexed string limit"
  - start: 2145
    title: "Chunking transcripts by bytes, not time"
  - start: 3135
    title: "Chunk documents and a recording ID"
  - start: 3872
    title: "Xavier review and storage-attached indexes"
  - start: 4287
    title: "Tiny chunks and a transcript that keeps growing"
  - start: 5550
    title: "Recap and what's next"
---

Episode 11 of Building with Bob, part 7 of the Walfly build, is the first time Walfly records a whole livestream. Tejas Kumar and David Jones-Gilardi hit record at the start to test last week's [audio chunking](/topics/audio-chunking) work, and within minutes it was dropping chunks. Along the way, David shows recordings grouped by intent with Jev, and the hosts use IBM Bob to rework how transcripts are stored in [Astra DB](https://www.datastax.com/products/datastax-astra).

## Dogfooding Walfly by recording the stream

The fastest way to test chunking was to record the 90-minute stream itself. Tejas pressed the record button on his device at [2:09](?t=129), and the app showed "streaming audio checkpoints." David could see the live recording appear on his side right away [2:40](?t=160). Chunks were still built the way [episode 10](/episodes/designing-audio-chunking-and-ephemeral-asr) planned them: about 30 seconds, then wait for a pause, then upload while recording continues. A minute later the first transcript text arrived [3:44](?t=224).

The reason for chunking, as David put it, is that one long recording becomes "an absolutely huge file" that has to be processed in one go, and a single failure loses all of it [1:36](?t=96).

## A website that turns 90-minute streams into guides

Tejas's surprise for David was this website: episode recaps, guides that combine several episodes, and search. He framed it as getting a return on each stream: "how can we make the 90 minutes we do this for... return on investment for the next 90 weeks or days" [6:28](?t=388). Each episode gets a TL;DR, chapters and timestamp links back into the video [8:16](?t=496), and guides such as [coordinating coding agents](/topics/coordinating-coding-agents) draw on several episodes [14:50](?t=890).

Search runs on Astra DB's hybrid search with its reranker [15:22](?t=922). Tejas was clear that the content is curated, not generated blindly:

> It's not hey Bob make stuff. It's hey Bob, I care about this as a developer. My peers care about that as a developer.
> — Tejas [11:44](?t=704)

## What is Jev, and how does Walfly use it?

[Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) is a System One model from TypeSafe AI: it returns typed decisions with probabilities instead of generating text. David first described using it as an AI slop detector for his own writing. It doesn't rewrite anything, it just tells him whether a passage reads as slop by the criteria he gives it [13:34](?t=814).

### Grouping recorded moments by intent

In Walfly, David added grouping to the moments screen [18:00](?t=1080). One click runs Jev and caches the result:

- **By intent:** decision and commitment, status and updates, exploration and learning, casual and social [18:50](?t=1130)
- **Work and life:** work and projects, personal and family, ideas and brainstorming, logistics [19:20](?t=1160)
- **Smart clusters:** fully dynamic groups Jev comes up with on its own

The grouping uses the full transcripts as context, not just titles and tags, and results are cached with a 10-minute TTL [20:05](?t=1205). David said an LLM could do the same job, "but think of what I'm gonna pay in those tokens," and LLMs aren't as good at this kind of classification [20:40](?t=1240). The feature took him about an hour [21:11](?t=1271).

### Jev through OpenRouter

David uses Jev through [OpenRouter](https://openrouter.ai/) because TypeSafe AI's own access had a waitlist. Walfly switched from calling Ollama directly to OpenRouter, so one interface serves both Jev and gpt-oss-20b, which powers chat [21:45](?t=1305). He also built and then reverted a page that scored LLM RAG answers against Jev. Jev's decisions were near instant, but the extra judging step added about half a second to a second for little value [23:31](?t=1411):

> It would be overengineered in that case.
> — David [24:07](?t=1447)

Tejas pointed out a common misunderstanding: Jev's onboarding asks you to confirm you understand it doesn't generate language [24:42](?t=1482).

## Astra DB's 8,000-byte indexed string limit

Astra DB's Data API caps an indexed string at 8,000 UTF-8 bytes, and Walfly's transcripts went over it. Tejas spotted dropped chunks in his logs at [10:10](?t=610), and by [24:07](?t=1447) the recording had stopped producing new chunks at all. The error named the field:

### "Document size limitation violated: indexed string value"

The `transcript` field was 8,326 bytes, and only 8,000 are allowed [30:07](?t=1807). The limit applies to each indexed field, not the whole row, and you can only vectorize a field that's 8,000 bytes or less [30:46](?t=1846). Astra DB's [Data API limits](https://docs.datastax.com/en/astra-db-serverless/api-reference/dataapi-limits.html) page lists 8,000 bytes per indexed string and 4 million characters per document.

Tejas suggested telling Bob to search the web for Astra's limits before changing anything [31:20](?t=1880). Bob opened a browser, found the docs page, and later added a constants file based on those documented limits [43:30](?t=2610).

## Chunking transcripts by bytes, not time

Once storage became the constraint, the chunk boundaries had to follow bytes. The hosts agreed that avoiding mid-sentence splits was overengineering, since the text is processed as one context later anyway [35:14](?t=2114), and they told Bob the time-based rule no longer needed to be enforced: "split based on bytes alone" [35:45](?t=2145).

Bob raised two questions: whether to overlap chunks, and whether to store chunks as separate documents or as an array inside one document [36:50](?t=2210). The deciding factor was the longest real session:

> We don't want to optimize for an hour and a half discussion. We want to optimize for all day usage... if I'm at a conference, I'm on the whole day.
> — Tejas [39:30](?t=2370)

| Option                           | Upside                                  | Problem                                                                               |
| -------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- |
| One document, chunks in an array | Everything for a recording in one place | An all-day recording can pass the 4-million-character document limit [38:58](?t=2338) |
| Separate chunk documents         | No size ceiling per conversation        | Needs a way to link chunks to their recording                                         |

They went with separate documents. Bob targeted about 7,500 bytes per chunk, leaving room for overlap [40:03](?t=2403). David also suggested a better habit for the next change of this size: have [Xavier](https://xavier.team) write a PRD first, then start a fresh session to create the tasks [42:57](?t=2577).

## Chunk documents need a recording ID

Separate documents need a link back to their conversation. The first run failed because the keyspace already had a `recordings` collection, and the new data model needed another one [52:15](?t=3135). Once the collection existed, Tejas noticed the chunks didn't say which conversation they belonged to [55:31](?t=3331). They asked Bob for a foreign-key-like relationship, and David corrected it when it reached for a relational design: "this is not the right database for that" [58:28](?t=3508). The result was a recording ID column on every chunk [1:00:38](?t=3638). Lots of small chunk rows are fine for Astra DB, which is built for many small rows [1:01:42](?t=3702).

With smaller chunks, transcripts showed up closer to real time [1:03:22](?t=3802). One more bug appeared on Tejas's machine, "Network error uploading chunk 0. Failed to fetch," because a cached base URL pointed at port 3000 instead of 3030 when an environment variable wasn't set [1:06:53](?t=4013).

## Reviewing the data model with Xavier

David asked Xavier to review the new data model and indexing against Astra DB and Apache Cassandra best practices, and to make an infographic [1:04:32](?t=3872). Xavier's review spins off several reviewer personas, such as security, performance and UX [1:05:14](?t=3914). David explained storage-attached indexing (SAI), Cassandra's newer indexing approach: Astra DB collections create these indexes for you, so you get flexible, fast indexing without managing it [1:10:18](?t=4218). We compare more review setups in [episode 9](/episodes/ai-code-review-and-expo-mobile-layout-fixes).

## Tiny chunks and a transcript that keeps growing

The next test turned up two problems. First, chunks were only 200 to 400 bytes despite 8,000 bytes of headroom [1:12:38](?t=4358), because a 15-second time window was still in place. They told Bob to remove the duration limit entirely and split by bytes [1:15:49](?t=4549).

Second, chunks started failing again at 8,617 bytes, then 8,921, growing with every chunk [1:16:57](?t=4617). The hosts suspected each processed chunk was being concatenated with the previous transcript, and David asked Bob to check [1:22:20](?t=4940). Bob confirmed it was stitching them together [1:25:50](?t=5150). The rule they settled on:

> We shouldn't be storing stitched chunks. We should only be reading stitched chunks.
> — Tejas [1:27:32](?t=5252)

David also talked about what this way of working feels like: asking the app questions about code he would once have known by heart, and the reading fatigue that comes from reviewing what agents produce [1:18:37](?t=4717). When Bob started circling after the long review, he compacted its context [1:28:38](?t=5318).

## What's next

Walfly can now record a long conversation on two machines at once, which wasn't possible before [1:31:06](?t=5466). Next, the hosts want chunks that use the available bytes instead of thousands of tiny documents, transcripts that are only stitched together on read, and a recording of the entire next stream with takeaways, a recap and Jev grouping [1:32:30](?t=5550). David is also researching more efficient ways to model chunks in Astra DB and Cassandra [1:33:50](?t=5630). Follow along at [/projects/walfly](/projects/walfly).
