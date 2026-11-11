---
slug: docling-audio-transcription
title: "Docling Audio Transcription: ASR, Whisper and Fixes"
h1: "How to transcribe audio with Docling"
description: "Transcribe audio with open-source Docling's ASR pipeline and Whisper: hosted vs local, docling-serve, MLX Whisper on Mac, VTT output and common errors."
answer: 'Install open-source Docling with the ASR extra (pip install "docling[asr]"), make sure ffmpeg is on your PATH, and convert the file with Docling''s AsrPipeline in Python. Docling runs Whisper for you, using MLX Whisper on Apple silicon. In August 2026 the hosted deployment we used had no ASR pipeline, so we ran Docling locally.'
updated: "2026-11-11"
about:
  [
    "Docling",
    "Docling ASR pipeline",
    "Whisper",
    "hosted Docling (Docling for IBM watsonx)",
    "docling-serve",
    "OpenRAG",
    "Walfly",
  ]
episodes:
  - killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob
  - debugging-rag-backends-openrag-vs-ai-workbench
  - walfly-record-button-redesign-and-astra-db-setup
  - debugging-expo-audio-and-local-docling-transcription
  - local-first-transcription-python-sidecar-and-coordinating-agents
  - designing-audio-chunking-and-ephemeral-asr
  - astra-db-8000-byte-limit-and-jev-clustering-in-walfly
  - durable-audio-pipeline-and-reading-ai-generated-code
faq:
  - q: "Can Docling transcribe audio?"
    a: 'Yes. Open-source Docling has an ASR (automatic speech recognition) pipeline that transcribes WAV, MP3, M4A, AAC, OGG and FLAC files with Whisper and returns a DoclingDocument with timestamped segments. You install it with pip install "docling[asr]" and need ffmpeg on your PATH.'
  - q: "Does hosted Docling (Docling for IBM watsonx) support audio?"
    a: "IBM's product page mentions audio files among the inputs it processes, but its FAQ list of supported formats didn't include audio when we checked in September 2026. In August 2026, the hosted deployment we used accepted Walfly's audio upload and then failed with an ASR capability gap error. Check the current docs for your own deployment before relying on it."
  - q: "Why did hosted Docling transcription keep failing?"
    a: "In our first attempt, in August 2026, several things went wrong in a row: IBM Bob called a transcribe endpoint that doesn't exist, the service couldn't fetch a file from localhost, the API key had expired on its default time-to-live, and the browser recorded WebM, which conversion rejected. Check your key and the real API reference before debugging anything else."
  - q: "Does docling-serve transcribe audio?"
    a: "In our August 2026 test, docling-serve running locally in Docker returned the same ASR error as the hosted service, and the flag suggested for enabling ASR did not exist. Its API reference lists audio as an input format and vtt as an output format, but an open issue reports that the default image lacks openai-whisper and ffmpeg, so we called Docling from Python instead."
  - q: "Why does every document fail to ingest in OpenRAG?"
    a: "Check that docling-serve is running. OpenRAG uses Docling to convert every source before embedding it, so when docling-serve is down, nothing can be ingested. On stream in July 2026, every URL we added to KillrCtx failed until docling-serve was started, after which the same URLs indexed normally."
  - q: "Does Docling use Whisper, and does it use MLX on a Mac?"
    a: "Yes to both. Docling's ASR pipeline transcribes with OpenAI Whisper and picks a backend for your hardware: mlx-whisper on Apple silicon and native Whisper everywhere else. The WHISPER_TURBO model spec does this selection for you."
  - q: "Does Docling output SRT or VTT?"
    a: "Docling can export a DoclingDocument to WebVTT, but it still had no SRT exporter in October 2026 (v2.145); its docs suggest the openai-whisper CLI if you need SRT. For Walfly that was fine: the app only needed a transcript with timestamps, which Docling's default Markdown output and its VTT export both provide."
  - q: "Which audio formats does Docling accept?"
    a: "Docling's docs list WAV, MP3, M4A, AAC, OGG and FLAC for the audio pipeline. WebM is listed under video, not audio. An M4A MIME-type bug was reported and closed in September 2026, so keep docling-core up to date if you record M4A on phones."
  - q: "Do I need a GPU to transcribe audio with Docling?"
    a: "No. On stream, David explained that Docling can fall back to the CPU and uses better hardware when it's there. It ran quickly on his Apple silicon Mac, but a CPU-only cloud server will be slower."
---

[Walfly](/projects/walfly), the open-source meeting recorder we build on Building with Bob, sends every recording through [Docling](https://github.com/docling-project/docling)'s speech recognition pipeline. We didn't get there on the first try. Across the Walfly build we tried hosted Docling twice, then docling-serve, and ended up importing Docling in a small Python service. Before that, Docling was already part of our earlier project, KillrCtx, as the parser inside OpenRAG. This guide collects what worked, what failed, and the exact errors we hit, so you can skip the detours.

## Can Docling transcribe audio?

Yes: open-source Docling ships an ASR pipeline that runs Whisper and returns a timestamped transcript as a `DoclingDocument`. According to Docling's [audio and video processing guide](https://docling-project.github.io/docling/usage/processing_audio_media/), audio files go through the ASR pipeline, while video files use a separate video pipeline that can also sample frames.

Setup, per the official docs (re-checked October 2026, Docling v2.145.0):

- Install the extra: `pip install "docling[asr]"` (or `uv add "docling[asr]"`).
- Install ffmpeg and make sure it's on your `PATH`. The docs say Whisper's audio decoding requires it.
- The first run downloads the Whisper model, so expect it to be slow. Tejas's first run of the sidecar sat downloading models ([1:32:19](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=5539)).

This is the basic example from the [official docs](https://docling-project.github.io/docling/usage/processing_audio_media/) (also the [minimal ASR pipeline example](https://docling-project.github.io/docling/_generated/examples/minimal_asr_pipeline/)):

```python
from pathlib import Path
from docling.datamodel import asr_model_specs
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import AsrPipelineOptions
from docling.document_converter import AudioFormatOption, DocumentConverter
from docling.pipeline.asr_pipeline import AsrPipeline

pipeline_options = AsrPipelineOptions()
pipeline_options.asr_options = asr_model_specs.WHISPER_TURBO

converter = DocumentConverter(
    format_options={
        InputFormat.AUDIO: AudioFormatOption(
            pipeline_cls=AsrPipeline,
            pipeline_options=pipeline_options,
        )
    }
)

result = converter.convert(Path("recording.mp3"))
print(result.document.export_to_markdown())
```

The Markdown output has one line per segment with a time range, such as `[time: 0.0-4.0]`, followed by the text.

### What's new in Docling ASR (September-October 2026)

Docling's speech pipeline changed more in October 2026 than in the months before, per the [release notes](https://github.com/docling-project/docling/releases):

| Release         | ASR change                                                                          |
| --------------- | ----------------------------------------------------------------------------------- |
| v2.139 (14 Oct) | `docling-tools` can download Whisper artifacts, and ASR can run from that directory |
| v2.140 (16 Oct) | Transcribe with a remote OpenAI-compatible server                                   |
| v2.143 (26 Oct) | Transformers and MLX presets for the ASR pipelines, plus offline WhisperS2T presets |
| v2.144 (28 Oct) | Temperature and anti-hallucination options for mlx-whisper                          |

The [audio guide](https://docling-project.github.io/docling/usage/processing_audio_media/) now also covers transcribing with a remote Whisper server (it needs `enable_remote_services=True`), non-Whisper presets such as `granite_speech_5_0_2b` and `parakeet_ctc_1_1b`, and speaker attribution with Resemblyzer. Offline artifacts matter for a service like Walfly's, which otherwise downloads the model on first run.

## Hosted Docling vs local Docling for audio

In August 2026, the hosted deployment we used, hosted Docling (Docling for IBM watsonx), could not transcribe audio, so we moved to local, open-source Docling. That's a dated observation, not a permanent limit. IBM's [product page](https://www.ibm.com/products/docling) mentions "audio files" among the inputs it processes, though its FAQ list of formats doesn't, so check what your deployment supports today.

### The first attempt: an invented endpoint and an expired key

Our earliest try was in [Astra DB Setup and a Better Record Button with IBM Bob](/episodes/walfly-record-button-redesign-and-astra-db-setup), episode 6 and part 2 of the Walfly build (21 August 2026). The failures stacked up:

1. **It couldn't fetch the file.** The app handed hosted Docling a `localhost` URL, which a cloud service can't reach ([50:50](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3050)).
2. **Bob read the wrong docs.** Asked to check the hosted docs, Bob first landed on the open-source project's docs, and David had to steer it ([57:28](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3448)).
3. **Bob invented an endpoint.** "It looks like it made up transcribe," David said, "and that was failing on the SaaS" ([1:03:52](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3832)).
4. **The key had expired.** David found his hosted API key had lapsed, because the service "by default sets a TTL on it" ([1:19:10](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4750)).

David's fallback was local Docling for the MVP, since it "does a really nice job" on Apple silicon ([59:20](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3560)), with an environment variable to switch between local and hosted ([1:02:12](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3732)). With a fresh key, the hosted service finally talked to the app, and conversion failed on the recording itself (see the WebM errors below). The episode ended without a transcript.

### "Non-audio documents convert normally on this deployment. So this is an ASR capability gap."

A week later, in [Docling Audio Transcription and Expo Mic Fixes with IBM Bob](/episodes/debugging-expo-audio-and-local-docling-transcription) (episode 7), the upload worked and returned a 200. The failure appeared once processing started ([11:24](/episodes/debugging-expo-audio-and-local-docling-transcription?t=684)), with this text, as Tejas read it aloud:

> Not a payload problem. No client flag or container change fixes it. Transcription needs a deployment with the ASR pipeline enabled or a dedicated speech-to-text provider.
> — error text read by Tejas, [11:56](/episodes/debugging-expo-audio-and-local-docling-transcription?t=716)

Resending the audio differently won't help. In [Local Docling + Whisper Sidecar and Beads for Agent Teams](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents) (episode 8), Tejas framed it generously: the hosted product is "really wonderful" for Word, Excel and PowerPoint, but "hasn't yet grown to support" rich media like audio ([1:59](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=119)).

|                    | Hosted Docling (what we saw, Aug 2026)            | Local open-source Docling                                      |
| ------------------ | ------------------------------------------------- | -------------------------------------------------------------- |
| Audio in           | Upload accepted, then an ASR capability gap error | `AsrPipeline` with Whisper                                     |
| Timestamped output | Not for audio                                     | Markdown with time ranges; VTT export                          |
| API keys           | Expire on a default TTL                           | None needed                                                    |
| Hardware           | IBM runs it                                       | Your machine or your server (CPU works, Apple silicon is fast) |

## Why docling-serve returned the same error for us

Running [docling-serve](https://github.com/docling-project/docling-serve) locally in Docker didn't fix transcription. Tejas pointed Walfly at it on port 5001 and got the same "non-audio documents convert normally" message ([25:47](/episodes/debugging-expo-audio-and-local-docling-transcription?t=1547)). Bob suggested a startup flag to enable ASR; the help output said "No such option" ([29:57](/episodes/debugging-expo-audio-and-local-docling-transcription?t=1797)).

> So we have to actually write code. We can't use a server.
> — Tejas, [28:54](/episodes/debugging-expo-audio-and-local-docling-transcription?t=1734)

As of October 2026 (docling-serve v1.38.2, released 27 October), the [API reference](https://github.com/docling-project/docling-serve/blob/main/docs/usage.md) lists `audio` as an input format and `vtt` as an output format, but documents no ASR options, and the README doesn't mention ASR. An issue that was still open at the end of October 2026, [ASR doesn't work with URLs](https://github.com/docling-project/docling-serve/issues/397), reports that the default image errors on missing `openai-whisper` and ffmpeg. If you try docling-serve for audio, build an image with both.

## Docling inside OpenRAG: nothing ingests without docling-serve

If you meet Docling through [OpenRAG](/topics/openrag), it's the parser at the front of every ingest, and when docling-serve is down, every source fails. In [KillrCtx: An Open-Source NotebookLM Clone on OpenRAG and IBM Bob](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob) (episode 1), Tejas summed up its role: Docling takes a PowerPoint or whatever you give it and "converts it into formats ready for LLMs, like Markdown or JSON" ([12:25](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=745)).

In [Debugging KillrCtx RAG Backends: OpenRAG vs AI Workbench](/episodes/debugging-rag-backends-openrag-vs-ai-workbench) (episode 4, July 2026), every URL added to a notebook failed ([48:16](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2896)). The cause: "OpenRAG decided to not start Docling Serve" ([1:06:05](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3965)). David pointed out that `uvx openrag` gives you an option to start it ([1:08:23](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4103)), and once it was up, the same URLs indexed ([1:09:25](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=4165)). Tejas also had Bob surface the upstream error to developers instead of a bare failure.

## The working setup: Docling in a Python sidecar

What worked was a small Python service that imports Docling directly. In episode 7 both hosts landed on it at once: "not Docling serve, but like an actual Python file that imports Docling" ([39:47](/episodes/debugging-expo-audio-and-local-docling-transcription?t=2387)). Episode 6 had already moved local mode from docling-serve's REST API to the Docling library, borrowing from an older project of David's ([1:20:46](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4846)).

In episode 8, David walked through the design ([4:04](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=244)):

1. The sidecar is a "very small microservice on its own port" whose only job is Docling.
2. `npm run dev` starts the sidecar, the Next.js API and the Expo app together ([6:51](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=411)).
3. When a recording stops, the app sends the file to the sidecar, and Docling runs Whisper Turbo ([5:43](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=343)).

One trap: check that Docling is really doing the transcribing. In episode 7, Tejas's "working" setup had quietly moved to the OpenAI Whisper API; Bob confirmed the pulled changes had "moved away from Docling entirely" ([50:40](/episodes/debugging-expo-audio-and-local-docling-transcription?t=3040)).

## Which Whisper does Docling use?

Docling uses OpenAI Whisper and picks the backend for your hardware: MLX Whisper on Apple silicon and native Whisper elsewhere.

> It will invoke the correct version of Whisper depending on the architecture that you're on.
> — David, [34:17](/episodes/debugging-expo-audio-and-local-docling-transcription?t=2057)

Docling's [minimal ASR example](https://docling-project.github.io/docling/_generated/examples/minimal_asr_pipeline/) documents the same: `WHISPER_TURBO` selects "MLX Whisper Turbo for Apple Silicon" when `mlx-whisper` is installed. David was "pretty surprised" how fast long recordings transcribed on his Mac ([9:08](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=548)), and Docling can also run on the CPU ([58:28](/episodes/debugging-expo-audio-and-local-docling-transcription?t=3508)).

## VTT vs SRT: you probably just need timestamps

If your app only needs to know what was said and when, any timestamped output will do. Walfly's original requirement was "put audio in and get SRT out" ([13:09](/episodes/debugging-expo-audio-and-local-docling-transcription?t=789)); Bob then reported that Docling exports VTT but not SRT ([54:38](/episodes/debugging-expo-audio-and-local-docling-transcription?t=3278)).

> We don't need SRT or VTT. We just need timestamps.
> — Tejas, [1:04:11](/episodes/debugging-expo-audio-and-local-docling-transcription?t=3851)

docling-core has a [WebVTT serializer](https://github.com/docling-project/docling-core/blob/main/docling_core/transforms/serializer/webvtt.py) behind `export_to_vtt()` and `save_as_vtt()`. As of October 2026 there's still no SRT serializer, and Docling's [media guide](https://docling-project.github.io/docling/usage/processing_audio_media/) points you to the openai-whisper CLI for SRT.

## Audio formats and the errors we hit

Send Docling WAV, MP3, M4A, AAC, OGG or FLAC, the audio formats its [docs](https://docling-project.github.io/docling/usage/processing_audio_media/) list. WebM is listed under video. Most of our errors came from format mismatches.

### "File format not allowed" for recording.ogg

In episode 6, while Walfly was pointed at local Docling, the logs showed "File format not allowed" for an `.ogg` recording ([1:16:59](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4619)). Separately, the hosted Docling web UI refused MP4 and MP3 uploads, though the API might accept them ([1:23:30](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5010)).

### "The browser can't actually record as MP4"

With a fresh key, hosted conversion failed on the browser's WebM recording ([1:25:50](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5150)). Asked to save MP4 instead, Bob replied that the browser can't ([1:27:36](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5256)). The hosts' diagnosis: the problem sat "between the microphone and the file" ([1:32:26](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=5546)). In episode 7, Tejas changed the app to produce a file the pipeline could handle, because "not everything can parse WebM" ([7:24](/episodes/debugging-expo-audio-and-local-docling-transcription?t=444)).

### "Unrecognized audio container, expected wav/mp3"

In [Audio Chunking and a Stateless Docling ASR Service in Docker](/episodes/designing-audio-chunking-and-ephemeral-asr) (episode 10), chunks from the web app failed with "Error processing chunk", then this Docling error ([1:31:07](/episodes/designing-audio-chunking-and-ephemeral-asr?t=5467)). The string didn't appear in Docling's own repositories when we checked in September 2026, so it most likely comes from the service's format check. Record, or convert, each chunk to WAV or MP3 before upload.

### "Transient sidecar request failed"

In episode 8 a recording failed with this message ([1:27:57](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=5277)). The sidecar had died because something already held its port ([1:28:30](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=5310)); killing the stale process fixed it.

### "Network error uploading chunk 0. Failed to fetch"

In [Astra DB's 8,000-Byte Limit and Jev Clustering in Walfly](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly) (episode 11, October 2026), the first chunk of a recording never reached the service on Tejas's machine ([1:06:53](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=4013)). It wasn't Docling at all: a cached base URL pointed at port 3000 instead of 3030 because an environment variable wasn't set. When an upload fails before transcription starts, check the URL the client is actually calling.

### "No transcript available for recording"

In [Walfly's Durable Audio Pipeline and When to Read AI Code](/episodes/durable-audio-pipeline-and-reading-ai-generated-code) (episode 12, October 2026), recordings showed as queued but never produced text after a big merge ([1:03:35](/episodes/durable-audio-pipeline-and-reading-ai-generated-code?t=3815)). The error was too terse, so the hosts asked IBM Bob for more verbose logs ([1:11:23](/episodes/durable-audio-pipeline-and-reading-ai-generated-code?t=4283)). Those logs showed the Whisper model never reporting ready ([1:18:31](/episodes/durable-audio-pipeline-and-reading-ai-generated-code?t=4711)). After clearing the Next.js cache and killing old sidecar code that was still running ([1:19:34](/episodes/durable-audio-pipeline-and-reading-ai-generated-code?t=4774)), a worker loaded Whisper's small model and transcripts appeared ([1:23:36](/episodes/durable-audio-pipeline-and-reading-ai-generated-code?t=5016)). If Docling's ASR seems silent, check that the model actually loaded before debugging anything else.

The same episode is a reminder that Whisper needs speech to anchor to: given silence, it produces gibberish ([37:37](/episodes/durable-audio-pipeline-and-reading-ai-generated-code?t=2257)). Running [voice activity detection before Whisper](https://www.dograh.com/feeds/blog/whisper-hallucination-silence) is the common fix.

### Known Docling issues

- [M4A rejected by MIME validation](https://github.com/docling-project/docling-core/issues/787): `audio/m4a` and `audio/mp4` failed validation in docling-core. Closed on 23 September 2026, so update docling-core if you record M4A.
- [Zero-duration Whisper segments](https://github.com/docling-project/docling/issues/3006): a segment where start equals end could fail a whole transcription. Closed in February 2026.

## Hosting Docling ASR as a stateless service

Once transcription works locally, the next problem is hosting. Tejas didn't want developers stuck with "a huge hosting burden" before they can run Walfly ([1:04:44](/episodes/debugging-expo-audio-and-local-docling-transcription?t=3884)). In episode 10 (part 6 of the Walfly build) the sidecar became a separate, containerized ASR service that stores no audio and no transcripts. The design is covered in our [audio chunking guide](/topics/audio-chunking).

The first real load test came in episode 11, when Walfly recorded the whole 90-minute livestream ([2:09](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=129)). Transcription itself worked: the first text arrived about a minute and a half after recording started ([3:44](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=224)), and each short chunk came back as roughly 300 characters ([1:18:01](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=4681)). The failures were downstream, in storage: Astra DB rejected transcripts over its 8,000-byte indexed string limit, so chunks are now sized by bytes and stored as separate documents. By the end, Walfly could record a long conversation, which "we couldn't have done before" ([1:31:06](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=5466)). The lesson for any Docling ASR service: the transcript is often the smaller problem; plan where its text lands.
