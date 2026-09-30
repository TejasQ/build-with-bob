---
slug: walfly-record-button-redesign-and-astra-db-setup
videoId: zLrhBlgXsiA
title: "Record Button UX and Astra DB Vector Setup With IBM Bob"
description: "Walfly gets a pulsing red record button, then Bob creates an Astra DB collection with vectorize via the Data API. Upload and Docling errors, debugged."
tldr: "In part 2 of the Walfly build, Tejas and David turn the gray record button into a solid red one that pulses while recording, create an Astra DB database, and have IBM Bob set up a vectorized recordings collection. They then work through a chain of upload, storage and Docling errors. Recordings reach the database, but the stream ends before any audio turns into a transcript."
project: walfly
topics:
  [
    "record button ux",
    "vector database setup",
    "astra db create collection",
    "astra db vectorize",
    "audio upload debugging",
    "expo web vs native",
    "docling transcription",
    "debugging with logs",
  ]
tools:
  [
    "IBM Bob",
    "Astra DB",
    "Astra DB Data API",
    "Apache Cassandra",
    "NVIDIA nv-embedqa-e5-v5",
    "Expo",
    "expo-av",
    "Expo FileSystem",
    "Vercel Blob",
    "Docling",
    "docling-serve",
    "Ollama",
    "gpt-oss",
    "Chrome DevTools",
    "GitHub CLI",
  ]
takeaways:
  - 'Say "let''s discuss" when you want an agent to propose options instead of writing code; Bob came back with three record-button designs and the hosts combined two of them.'
  - 'Be specific about what an animation should do: the hosts had to spell out that "pulse" meant a change in opacity, not size, and that the white inner glyph should go entirely.'
  - "Before asking an agent to design a database schema, search the codebase; Bob had already defined the recordings collection during last week's planning."
  - "Astra DB's vectorize feature generates embeddings on insert, so the collection definition only needs the provider and model, not a vector dimension."
  - 'When an error is vague, have the agent make the logs verbose, then paste the exact log lines back to it; a bare 400 became "missing or invalid audio field" and then a fixable serialization bug.'
  - "Make infrastructure switchable by environment variable: Walfly falls back to the OS temp directory when BLOB_READ_WRITE_TOKEN is empty, and Docling can run locally or hosted."
  - "Check your API keys before debugging the integration; part of the Docling trouble came from a key that had expired on its default time-to-live."
faq:
  - q: "How should a record button show it's recording?"
    a: "Asked to discuss options first, IBM Bob offered a shape shift, a pulsing ring and color inversion. The hosts settled on a solid red circle that pulses in opacity rather than size, with no inner glyph and the same shape in both states."
  - q: "How do you create an Astra DB database for a vector search app?"
    a: "In this episode David logged into astra.datastax.com, clicked Create Database, kept the default serverless vector type, named it walfly, and chose AWS us-east-2. It took a few minutes to initialize, after which the API endpoint and a one-time application token were available to put in the app's .env.local file."
  - q: "Can IBM Bob create an Astra DB collection for you?"
    a: "Yes. The hosts never told Bob how the Astra DB Data API works, but it updated a seed script that creates the recordings collection with vectorize enabled. David ran the script from his terminal to save tokens, and Bob fixed the script when it couldn't find the .env.local file."
  - q: "Which embedding model does Walfly use in Astra DB?"
    a: "Bob first proposed an older NVIDIA embedding model. After David asked for a comparison, Bob checked IBM documentation and confirmed that nvidia/nv-embedqa-e5-v5 was the newer, better option, so the collection uses that model through Astra's built-in NVIDIA vectorize integration. No dimension field was needed because the provider sets it."
  - q: "Do you need to set a vector dimension with Astra DB vectorize?"
    a: "No. When a collection uses vectorize, Astra DB generates the embeddings with the chosen provider and model, and the provider sets the dimension. The collection Bob created for Walfly only names the NVIDIA provider and model, with no dimension field."
  - q: "Why does Expo audio upload work on iPhone but fail on the web?"
    a: "Walfly's upload used Expo's file system package, which doesn't support the web. After Bob switched to base64 and byte arrays, the upload worked on native but failed in the browser. The fix was to branch on platform: expo-av's recording on the web and the file system package on native, both producing a proper blob for the server."
  - q: "Can Walfly run without Vercel Blob?"
    a: "Yes. When the upload failed because no Vercel Blob store existed, the hosts had Bob add a local option. If the BLOB_READ_WRITE_TOKEN environment variable is empty, recordings are stored in the operating system's temp directory; if it's set, they go to Vercel Blob."
  - q: "Why did Docling transcription fail in this episode?"
    a: "Several things went wrong in turn. The hosted service couldn't fetch a file URL on localhost, Bob had guessed a transcribe endpoint that didn't exist, the Docling API key had expired, and the browser recorded WebM, which Docling rejected. The last failure pointed to a problem between the microphone and the saved audio file, which became homework."
---

Part 2 of the Walfly build is about going from a pretty mockup to real plumbing. Tejas Kumar and David Jones-Gilardi fix the record button, create an [Astra DB](https://www.datastax.com/products/datastax-astra) database, and have [IBM Bob](/topics/ibm-bob) set up a vectorized `recordings` collection. Then they spend most of the hour chasing audio through upload, storage and [Docling](https://github.com/docling-project/docling). By the end, recordings land in the database, but no transcript comes out yet.

This is episode 6 of Building with Bob and the second week of [Walfly](/projects/walfly), the open-source "fly on the wall" recorder for wearables. If you missed the kickoff, [part 1](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob) covers how the hosts planned the MVP in Bob's plan mode. The code is at [github.com/SonicDMG/walfly](https://github.com/SonicDMG/walfly).

## How does Walfly's architecture fit together?

Walfly records a conversation, uploads it through an API, transcribes it with Docling, and stores it in a vector database you can search by meaning. Tejas walks through the diagram at [1:43](?t=103): a big record button uploads audio to an API on a write path, Docling transcribes it (ideally to SRT so every line has a timestamp), and the result goes into Astra DB. On the read path, a search tab queries the same API, which retrieves matching recordings.

David didn't touch the app during the week. Instead of clicking around, he starts by asking Bob, "give me a summary of where this application stands" ([3:38](?t=218)). His reason: last week's plan had subtasks ST1 through ST8, and he wanted a code-level view of what was done and what was missing ([4:12](?t=252)). Tejas called the summary "really accurate" ([4:44](?t=284)).

## How should a record button show it's recording?

A good record button makes its state obvious at a glance. Walfly's became a solid red circle that pulses in opacity while recording, with no inner dot and no change in shape. The starting point was a gray circle with a white dot in the middle, which Tejas didn't think anyone would recognize as a record button ([5:15](?t=315)).

> I feel like the main differentiator with AI, especially now that almost anyone can build almost anything, is: is the product actually really good and tasteful?
> — Tejas, [5:15](?t=315)

### Discuss first, then build

David asked Bob to discuss before coding. He often starts a prompt with "let's discuss" when he wants to agree on an approach first ([6:28](?t=388)). Tejas prefers to let the agent build and correct it afterwards ([7:05](?t=425)). Bob offered three options:

1. **Shape shift:** the circle becomes a square while recording.
2. **Pulsing ring:** a halo pulses around the button.
3. **Color inversion.**

They picked a hybrid of the first two, but asked for the button itself to pulse instead of a ring ([7:37](?t=457)).

### Getting to exactly what they wanted

It took a few passes:

- They clarified that "pulse" meant **opacity**, not size ([9:11](?t=551)).
- The white dot survived because it was a glyph. Bob's first fix just made it smaller ([10:25](?t=625)), so they asked it to remove the inner indicator entirely ([10:58](?t=658)).
- With the opacity pulse in place, the square was redundant. They told Bob to keep the same circle in both states ([12:08](?t=728)).

David's note on this: with a designer or a proper spec, these details would be decided up front and "spec'd in". Here they were working it out as they went ([12:49](?t=769)). The [spec-driven development with IBM Bob guide](/topics/spec-driven-development-ibm-bob) covers when a spec is worth it and when vibing a small UI change is fine. Once the button was done, he had Bob commit it and started a new task for the database work, so the two changes stayed separate ([24:18](?t=1458)).

## How do you create an Astra DB database for Walfly?

You create a serverless vector database in the Astra dashboard, wait a few minutes for it to initialize, then copy the API endpoint and an application token into the app's environment. Pressing record exposed the next gap: `/api/recordings/upload` returned a 400, and Tejas followed the code to a `getDb` function that needed environment variables that weren't set ([14:21](?t=861)).

David's steps, starting at [15:28](?t=928):

1. Go to astra.datastax.com (still the URL, even after IBM's acquisition of DataStax) and click **Create Database**.
2. Keep the default **serverless vector** type. He picked it for **vectorize**, which generates embeddings automatically on insert ([16:00](?t=960)).
3. Name it `walfly`, pick AWS and `us-east-2`. Multi-region is possible but not needed yet.
4. Wait for it to initialize, then generate a token. The token is only shown once ([22:55](?t=1375)).

David stopped screen sharing while he copied the token into `.env.local` ([16:45](?t=1005)). David pointed out that a token shown on stream used to need someone to pause the video and copy it; now "they could literally just take a screenshot" and hand it to an agent ([17:17](?t=1037)). While it spun up, David explained that Astra runs on [Apache Cassandra](https://cassandra.apache.org/), and creating a database starts a three-node cluster underneath ([22:25](?t=1345)).

## How do you create an Astra DB collection with vectorize via the Data API?

You define a collection with a vectorize provider and model, and Astra DB generates embeddings on insert; here IBM Bob wrote the Data API script. The `recordings` collection stores each recording with its metadata and uses Astra's vectorize feature so transcripts can be searched semantically. David's prompt asked Bob to create a collection, work out a schema for recordings and metadata, and use vectorize with transcripts as the main search target ([25:28](?t=1528)).

Tejas bet the schema already existed, and a search for "collection" found a `getRecordingsCollection` function from last week's planning ([26:04](?t=1564)). Astra DB collections are schemaless, but as David said, "you're still going to tell it you need some structure" ([23:46](?t=1426)).

### Choosing an Astra DB vectorize embedding model

Bob proposed an NVIDIA embedding model hosted inside Astra. David knew there was a newer one and asked Bob to compare ([28:42](?t=1722)). Bob looked this up in IBM product documentation and even opened docs pages through Chrome DevTools ([30:55](?t=1855)). It confirmed that `nvidia/nv-embedqa-e5-v5` was the newer, better choice. Astra's [NVIDIA embedding provider](https://docs.datastax.com/en/astra-db-serverless/integrations/embedding-providers/nvidia.html) makes that model the default and is only available in `us-east-2`, which is where the database lives. No dimension field is needed because the provider sets it ([32:01](?t=1921)).

### Running the seed script

Bob updated a seed script that creates the collection through the [Data API](https://docs.datastax.com/en/astra-db-serverless/api-reference/collection-methods/create-collection.html). Tejas suggested running it from the terminal instead of through Bob to save tokens ([32:38](?t=1958)). The first run failed because the script in `packages/db` couldn't find `.env.local`, which lives in the app directory. Bob fixed the path and the `recordings` collection appeared in the dashboard ([35:54](?t=2154)).

> At no point did I tell Bob how to use the Data API from Astra, right? But it created the collection.
> — David, [1:32:57](?t=5577)

## How did they debug the audio upload?

They made the logs verbose, then pasted each error back to Bob until the audio reached the server as a real blob. The first recording still returned a 400 ([36:27](?t=2187)). Tejas's approach is to copy the useless log line and tell the agent "this needs to give me more details" ([37:36](?t=2256)).

| Symptom                                                       | Cause                                                                   | Fix                                                                                              |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Bare 400 on upload                                            | No detail in the logs                                                   | Verbose logging ([36:27](?t=2187))                                                               |
| "Failed to parse multipart form fields" / "got object Object" | Recording package wasn't serializing the file for the network           | Send base64 and byte arrays instead of a URI reference ([42:11](?t=2531))                        |
| Works on native, fails on web                                 | Expo's file system package doesn't support the web                      | Branch on platform: expo-av on the web, file system on native ([43:49](?t=2629))                 |
| Upload fails with no store                                    | No [Vercel Blob](https://vercel.com/docs/vercel-blob) store was created | Local fallback to the OS temp directory when `BLOB_READ_WRITE_TOKEN` is empty ([47:02](?t=2822)) |

The base64 change was a milestone of its own. Tejas noted at [42:42](?t=2562) that it would already have worked on an iPhone or Apple Watch, just not in the browser. The storage fallback came from a practical worry: Tejas didn't want Vercel Blob to fill up with "50 recordings of some dude saying Walfly" during development ([48:13](?t=2893)).

> We're using it, where it breaks we're saying "fix it". This is the way to build, to me, because then we make sure we have a nice, smooth, seamless, tried and tested experience.
> — Tejas, [48:13](?t=2893)

At [49:44](?t=2984) the recording was created in the database for the first time, and the pipeline moved on to transcription.

## Why didn't transcription work yet?

Transcription stalled on a series of separate problems, and the stream ended with the root cause still open. Here they are in order:

- **Docling couldn't reach the file.** The hosted Docling service was given a URL on `localhost`, which it can't fetch ([50:50](?t=3050)). David mentioned he also had Docling running locally on port 5001, the default for [docling-serve](https://github.com/docling-project/docling-serve) ([51:24](?t=3084)).
- **A 401 and an invented endpoint.** Bob changed the auth header to `X-API-Key` ([55:19](?t=3319)) and then checked the hosted docs and Swagger page. It turned out Bob had made up a `transcribe` endpoint ([1:03:52](?t=3832)). David had Bob support both local and hosted Docling behind an environment variable, and default to local for now ([1:01:30](?t=3690)).
- **No LLM for enrichment.** The pipeline tried to call OpenAI for summaries and metadata without a key ([1:04:25](?t=3865)). Since the app speaks the OpenAI-compatible API, they pointed it at [Ollama](https://ollama.com/)'s cloud models running [gpt-oss](https://ollama.com/library/gpt-oss) ([1:06:04](?t=3964)). Enrichment later reported complete ([1:14:47](?t=4487)), but the transcript was still zero characters.
- **Borrowing a known-good approach.** Bob hit its default 100-turn limit, which David explained is there because quality can drop in long sessions ([1:10:53](?t=4253)); [IBM Bob features in practice](/topics/ibm-bob-features-in-practice) covers how the hosts handle long sessions. He suggested a "start new session with context" option to the Bob team. Then he pointed Bob at an older project of his, which had already solved Docling audio transcription. Bob pulled it with the GitHub CLI and moved local mode from the docling-serve REST API to the Docling library ([1:15:18](?t=4518)).
- **An expired key.** When David checked his hosted Docling account, the API key had expired on its default time-to-live ([1:19:10](?t=4750)). With a fresh key, they switched back to the hosted service ([1:24:05](?t=5045)).
- **WebM.** Hosted Docling talked to the app this time, but conversion failed on the browser's WebM recording ([1:25:50](?t=5150)). They asked Bob to save MP4 instead, and Bob replied that the browser can't record MP4 ([1:27:36](?t=5256)).

Meanwhile, Tejas tried uploading audio in the hosted Docling UI and found it wouldn't accept MP4 or MP3 files there, though the API might ([1:23:30](?t=5010)). The final test after one more key check still failed ([1:31:51](?t=5511)). Their best guess was a problem "between the microphone and the file": David's older app transcribed downloaded YouTube videos that were already in a standard format, not live microphone audio ([1:32:26](?t=5546)).

The [Docling audio transcription guide](/topics/docling-audio-transcription) covers which audio formats Docling accepts and how the hosted and local options compare.

### A note on agents and secrets

At one point an API key showed up on screen in Bob's work. David admits he had loosened Bob's default permissions earlier:

> It is kind of like a security hole, right, to allow your AI coding agents to work regularly. You should probably put that in a store, like a credential or something.
> — David, [54:42](?t=3282)

He rotated the key afterwards.

## What's next

The homework: come back next week with a working pipeline, where you record, the audio lands in Astra DB, and it's ready to search ([1:28:09](?t=5289)). [Part 3](/episodes/debugging-expo-audio-and-local-docling-transcription) picks up with native microphone permissions, the WebM problem, and a clear answer on why hosted Docling wouldn't transcribe audio, ending with Walfly's first real transcript. Follow the whole build on the [Walfly project page](/projects/walfly).
