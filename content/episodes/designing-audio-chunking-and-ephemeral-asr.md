---
slug: designing-audio-chunking-and-ephemeral-asr
videoId: eUZacfuVVDU
title: "Audio Chunking and a Stateless Docling ASR Service in Docker"
description: "Walfly's plan: 30-second audio chunks that wait for a pause (VAD), sequence indexes for out-of-order chunks, and a stateless Docling ASR service in Docker."
tldr: "Tejas and David finally start on audio chunking for Walfly. They debate privacy and recording consent, turn their chunking requirements into a PRD with Xavier, let it build a separate, stateless ASR service, then run that service locally in Docker and find the first bugs in how chunks are processed."
project: walfly
topics:
  [
    "audio chunking",
    "ephemeral asr",
    "recording consent",
    "prd",
    "human and agent coordination",
    "github projects",
    "code review",
    "docker",
  ]
tools:
  [
    "IBM Bob",
    "Xavier",
    "Beads",
    "MCP Agent Mail",
    "GitHub Projects",
    "GitHub CLI",
    "Docling",
    "Astra DB",
    "Docker",
    "Fly.io",
    "Render",
    "DigitalOcean",
    "ngrok",
  ]
takeaways:
  - "Local tools like Beads and MCP Agent Mail work well for coordinating several agents on one machine, but once other humans join, a shared board such as GitHub Projects is a better place to track who owns which task."
  - "Agents follow system-prompt instructions most of the time, not every time, so a short ritual like 'commit, sync and push' makes sure the end-of-task steps actually happen."
  - "An ASR service that stores no audio and no transcripts is much easier to host, because it removes the question of a server holding people's recordings."
  - "Write PRD requirements as outcomes, not implementations: 'process hours-long conversations fully and reliably' leaves room for a better approach than the one you had in mind."
  - "Chunks can arrive out of order over a flaky network, so each chunk needs to carry its own ordering information, and ordering should never depend on trusting the client."
  - "A fixed chunk length combined with voice activity detection avoids cutting a speaker off mid-sentence."
  - "Even when agents write most of the code, it is worth reviewing critical files like the Dockerfile and taking over for precise, finishing changes."
faq:
  - q: "How do you coordinate AI coding agents with human teammates?"
    a: "In this episode David keeps Beads and MCP Agent Mail for local, parallel agent work and uses GitHub Projects for coordination between people. A short note in the system prompt tells the agent to assign an issue and mark it in progress when work starts, using the GitHub CLI. GitHub is not used for agent-to-agent messaging because of rate limits and the network round trip."
  - q: "What is an ephemeral ASR service?"
    a: "It is a speech recognition service that stores nothing. For Walfly it receives an audio chunk, transcribes it with Docling's ASR pipeline, returns the result to the app and deletes the audio. Finished transcripts stay in the app's own Astra DB storage, not on the ASR server."
  - q: "Why chunk audio instead of uploading the whole recording?"
    a: "The goal is to process hours-long conversations fully and reliably. Sending one huge file takes a long time to process and may need to be loaded into memory all at once. Smaller chunks can be processed as the recording goes, including on smaller machines."
  - q: "How do you handle audio chunks that arrive out of order?"
    a: "Each chunk carries information about its position, such as a sequence index, so the server can stitch the transcripts back together. The hosts ruled out relying on client-side ordering and leaned toward a design that processes chunks in parallel, which also makes it more robust to network interruptions."
  - q: "How long should audio chunks be for speech recognition?"
    a: "Walfly's plan uses a 30-second baseline and relies on voice activity detection, so a chunk ends only once the speaker pauses. That way nobody gets cut off in the middle of a phrase."
  - q: "Do developers still need to read AI-generated code?"
    a: "Tejas and David both think so. Tejas asked to review the generated Dockerfile. David said agents are great for the base code and boilerplate, but he still goes into the code himself for precise changes and finishing work."
  - q: 'What does "Unrecognized audio container, expected wav/mp3" mean in Docling?'
    a: "It means Docling's ASR pipeline received audio in a container format it doesn't accept; it expects WAV or MP3. In this episode the error appeared when the new ASR service processed a chunk from the web app. The hosts logged it as a format issue to fix next."
  - q: "Where can you host a Docling ASR service?"
    a: "Walfly's PRD asks for a container that is easily deployable to DigitalOcean, Render, Fly.io or similar. Because the service is stateless, it only receives audio, transcribes it and deletes it. The team chose to test the Docker container locally first and leave deploying to Fly.io for later."
  - q: "Why doesn't an audio chunk upload while someone is still talking?"
    a: "Because the rule is 30 seconds and a pause, not just 30 seconds. The baseline is 30 seconds, but the chunk only closes once a speaker stops talking, so continuous speech delays the checkpoint. That keeps chunks from cutting someone off mid-phrase."
  - q: 'What does "commit, sync and push" do with Beads?'
    a: "It is David's end-of-task ritual for coding agents. The agent reads it as: commit the changes locally, sync Beads, then push. Because agents follow system-prompt instructions most of the time but not always, saying it explicitly makes the final steps happen reliably."
---

Episode 10 of Building with Bob, part 6 of the Walfly build, is where Walfly's audio chunking work finally starts. Tejas Kumar and David Jones-Gilardi wrap up a round of UX polish, talk through the privacy and consent questions behind recording conversations, and use IBM Bob and [Xavier](https://xavier.team), Atila's AI agent orchestrator, to plan and build a separate, stateless ASR service. By the end, that service is running locally in Docker and processing audio from the app, and a first test turns up bugs to fix next time.

## How do you coordinate AI agents with human teammates?

Use local tools for agent-to-agent coordination and a shared, human-facing board for coordination between people. David opened the episode with a problem he'd been thinking about: Beads and MCP Agent Mail work well when he runs several agents in parallel on his own machine, but they break down "the second you say, well, wait a minute, I now have a team of humans" [3:46](?t=226).

His fix was GitHub Projects. With Bob, he turned the leftover UX tasks and the audio chunking tasks from previous episodes into issues on a project board [5:29](?t=329). GitHub already has a CLI that agents handle well, so he can say "I'm going to grab number 12" and the agent assigns it to him and moves it to In Progress.

|                    | Beads + MCP Agent Mail              | GitHub Projects                                                |
| ------------------ | ----------------------------------- | -------------------------------------------------------------- |
| Who it coordinates | Multiple agents on one machine      | Humans (and their agents) across a team                        |
| Where it runs      | Local, fast, no network hop         | Remote, over the network                                       |
| Weak spot          | Not built for sharing across people | Rate limits and latency if agents use it to talk to each other |

### How do tasks sync between local agents and GitHub?

A short note in the system prompt, backed up by a habit. When David starts a task, the instructions tell the agent to assign the GitHub issue and mark it in progress. Because agents are "not deterministic at the end of the day," he finishes work by saying "commit, sync and push," which the agent reliably reads as: commit locally, sync Beads, push [11:07](?t=667). The GitHub issue works more like an epic, and several Beads tasks can sit underneath it.

Tejas asked what happens when GitHub is down. A quick look at githubstatus.com showed plenty of red, mostly on Actions [14:30](?t=870). That's part of why David keeps GitHub out of the agent-to-agent loop (we compare the options in [coordinating coding agents](/topics/coordinating-coding-agents)):

> That's why this is really limited to the human interaction, if that makes sense.
> — David [15:35](?t=935)

## What UX improvements shipped in Walfly?

A batch of smaller changes that close out the UX backlog. Among them: a magnifying-glass icon and "search your moments" placeholder, status icons and colors that show when a recording is still processing in the background, adding and removing tags, and inline title editing. Search now waits for at least three characters before running, and it uses Astra DB's vector search, so it matches more than titles [16:12](?t=972). They also noted a later idea, linking chat answers back to the moments they came from, and parked it as post-MVP.

## What is an ephemeral ASR service, and why build one?

An ephemeral ASR service transcribes audio and keeps nothing: no audio files and no transcripts. A service like that avoids the hardest hosting question: who is holding people's recordings? Right now Walfly runs its automatic speech recognition pipeline locally, which isn't portable to a watch or phone. Tejas proposed a cloud instance that's completely stateless [19:26](?t=1166):

> By stateless I mean it doesn't host any audio files. It doesn't store transcripts. It does nothing.
> — Tejas [19:26](?t=1166)

That led into a longer discussion of consent. David pointed out that even if the person across from you agrees to be recorded, the people around you at a conference haven't. He floated a DIY option where users host the service themselves and expose it with something like ngrok. Tejas, who lives in Germany, brought up GDPR and Apple's approach: Apple leaves out diarization, so speech can't be tied to a specific person, and relies on beamforming microphones that focus on the person in front of you [24:01](?t=1441).

Their conclusions:

- Walfly being open source and testable is a big part of its privacy case.
- End-to-end encryption is on the wish list, and David added tasks for it to the board [25:29](?t=1529).
- They decided hosting is fine, since the server only receives a job, does it and deletes everything.
- Skipping diarization fits Walfly too, since the value is in the content (tasks and summaries), not in who said what.

## How do you design reliable audio chunking?

Start from what the pipeline has to handle, then pick a chunk length and an ordering strategy, because chunking and the ASR pipeline are "two parts of one comprehensive system" [26:21](?t=1581). Our [audio chunking guide](/topics/audio-chunking) collects the design across episodes. David played devil's advocate: what if the network gets worse and chunk two arrives before chunk one? And since the recording is still going, the pipeline can't know when the end will come [28:06](?t=1686).

Instead of settling it themselves, they asked Xavier, which already knows the codebase, to turn the existing audio checkpoint tasks into a PRD [29:53](?t=1793). Xavier's PRD command (`/x-prd`) interviews you, grill-me style, before writing anything. Some decisions from that interview:

1. **Scope the requirement as an outcome.** David's first draft said "reliably chunk them" and mentioned live intermediate transcripts. Tejas pushed back on both.
2. **Handle ordering on the server.** Xavier offered several approaches, including a sequential index per chunk [37:23](?t=2243). They ruled out the client-trusted option ("we never trust client side ever") and leaned toward the parallel-processing option [37:57](?t=2277).
3. **Set the chunk length to 30 seconds, plus voice activity detection.** Without VAD, a chunk could cut someone off mid-phrase, so each chunk waits for a pause after 30 seconds [39:09](?t=2349).
4. **Make the ASR a separate, single-responsibility service.** Walfly already spawns a Docling ASR sidecar on demand. The PRD now calls for an independent service that deletes audio the moment it's processed [40:48](?t=2448). Transcripts keep living in Astra DB [43:13](?t=2593).
5. **Make it easy to deploy** to DigitalOcean, Render, Fly.io or similar [44:54](?t=2694).

> That breaks separation of concerns, because we don't want to think about transcribing. That's the ASR pipeline's job. We just want to create reliable chunks and have them sent somewhere.
> — Tejas [34:32](?t=2072)

The rewritten requirement became: record hours-long conversations and have them processed fully and reliably by the ASR pipeline [35:05](?t=2105). David added the efficiency angle. A single hours-long file takes a long time to process and might need to be loaded into memory all at once, so chunking also helps with speed and with running on smaller devices.

## Turning a PRD into an implementation plan

The PRD came out with user stories and a containerized architecture, then turned into tasks stored in Xavier's vault. Tejas noticed the planning-heavy rhythm [44:14](?t=2654):

> Once again, David, we're doing like more planning than coding. Don't you think that's interesting? The role of engineering is so different now.
> — Tejas [44:14](?t=2654)

David then started Xavier's execution loop (`/x-loop`), which he'd never used before [49:31](?t=2971). It went through each phase, committed as it went and marked tasks done. The first pass built the backend endpoints, and a second "finish him" prompt got it to finish the remaining work. David said he usually prefers to set his own checkpoints, but commits at least make each step easy to revert [1:01:22](?t=3682).

## How much should developers still review code?

Still quite a bit, especially for critical files and precise changes. Tejas asked to see the generated Dockerfile, knowing that's "going to be controversial because a lot of people say they don't read the code anymore" [46:39](?t=2799). David agreed and said Bob's review could also check it. His own approach:

> I've definitely found that the agents are really wonderful at creating the base, obviously the boilerplate, a lot of the code. But for finessing, for more precise changes, I go into the code.
> — David [50:15](?t=3015)

For more on running Bob Review and Xavier's `/x-review` side by side, see [episode 9](/episodes/ai-code-review-and-expo-mobile-layout-fixes).

## Running the Docling ASR service locally in Docker

The key check was making sure the app actually used the new service and not the old sidecar. After asking Bob "how do I run it?" [1:05:55](?t=3955), Tejas suspected that without the new service running, the app would quietly fall back to the local sidecar [1:08:02](?t=4082). So they:

- Changed the sidecar URL in `.env.local` from port 8888 to 4321 [1:09:07](?t=4147)
- Built the ASR service's Docker image from its package directory, after fixing a command pasted over two lines
- Ran the container with `-p` mapped to 4321 and watched `docker stats`

The image build took a long time on a machine that was also running the stream. Tejas asked how much developer time now goes to waiting. David's answer: keep several tasks running and switch between them while one builds.

## Testing audio chunks and finding bugs

The separate service worked as the ASR pipeline, but the chunking itself didn't behave as expected yet. After a recording on the native mobile app, the container logs showed it detecting language, transcribing and enriching the audio [1:21:12](?t=4872). But the log keys looked identical, so they couldn't tell whether it had processed the whole file or individual chunks [1:23:39](?t=5019). Searching Astra DB by date wasn't much help either, since semantic search matched on "September" in general. They asked Bob how to confirm the audio had been chunked [1:26:39](?t=5199).

A second test in the web app with the browser's network tab open made things clearer [1:29:26](?t=5366). Chunk requests appeared, then an error.

### "Unrecognized audio container, expected wav/mp3"

The container logs showed `Error processing chunk` with a Docling error: "Unrecognized audio container, expected wav/mp3" [1:31:07](?t=5467). The chunk reached the ASR service in a container format Docling's pipeline doesn't accept, so it's a format issue rather than a problem with the service itself. More Docling ASR errors and fixes are collected in our [Docling audio transcription guide](/topics/docling-audio-transcription).

Other findings from the test:

- The logs need to be more verbose and useful.
- It's still unclear whether failed chunks were retried.

Even so, the backend now runs as its own service, separate from the app, and processes audio. That's the piece that makes hosting Walfly possible. Earlier steps are in [episode 7](/episodes/debugging-expo-audio-and-local-docling-transcription) and [episode 8](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents), and the full project is at [/projects/walfly](/projects/walfly).

## What's next

Next time, the hosts plan to fix the chunk processing bugs, starting with the audio container format that Docling rejects, then get chunking solid on web and make sure mobile does it too. They'll also add better debugging and logging so it's clear when a recording has been chunked. As homework, they want to record a real long call, such as a Zoom meeting, to see whether Walfly processes the whole thing reliably. After that come deploying the ephemeral ASR service to a host like Fly.io and the end-to-end encryption tasks already on the board.
