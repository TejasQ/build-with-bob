---
slug: coordinating-coding-agents
title: "Coordinating Coding Agents: Beads, Agent Mail, GitHub"
h1: "How do you coordinate multiple coding agents?"
description: "How we run several coding agents at once: parallel Bob Shell sessions, Beads for persistent tasks, MCP Agent Mail for file reservations, GitHub for humans."
answer: "Give agents three shared things: a persistent task list, a way to talk, and file locks. On Building with Bob, David Jones-Gilardi uses Beads Rust for tasks that outlive a session, MCP Agent Mail for agent identities, messages and file reservations, and GitHub Projects only when other humans join the work."
updated: "2026-10-03"
about:
  [
    "Beads",
    "MCP Agent Mail",
    "GitHub Projects",
    "IBM Bob",
    "Bob Shell",
    "Xavier",
    "grill me skill",
  ]
episodes:
  - adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob
  - notebooklm-clone-setup-wizard-and-ai-workbench-backend
  - debugging-rag-backends-openrag-vs-ai-workbench
  - debugging-expo-audio-and-local-docling-transcription
  - local-first-transcription-python-sidecar-and-coordinating-agents
  - ai-code-review-and-expo-mobile-layout-fixes
  - designing-audio-chunking-and-ephemeral-asr
  - astra-db-8000-byte-limit-and-jev-clustering-in-walfly
faq:
  - q: "How do I run multiple IBM Bob Shell agents in parallel?"
    a: "Open one Bob Shell session per terminal tab, give each an orthogonal task that touches different files, and rename each session after its task so you know which agent owns which bug. In July 2026 Tejas ran four Bob Shell agents at once this way on KillrCtx. Once tasks start overlapping, add file reservations with a tool like MCP Agent Mail."
  - q: "How do you stop coding agents overwriting each other's files?"
    a: "Register each agent with a coordination layer that supports file reservations, such as MCP Agent Mail. An agent announces which files it is working on and reserves them, and other agents see the reservation and leave those files alone. The reservations are advisory leases with an expiry, and the project offers an optional pre-commit guard to block commits that conflict with them."
  - q: "Does IBM Bob keep its own task list?"
    a: "Yes. Like Claude Code, IBM Bob creates an internal task list for the current session. On the show, David keeps his own to-do file from the spec as well and tells the agent to check items off there, because the file doubles as documentation for future developers. Putting that instruction in your AGENTS.md saves repeating it."
  - q: "What is Beads for coding agents?"
    a: "Beads is an open-source issue tracker built for coding agents rather than people. Agents create epics and tasks with dependencies, and the list lives in the repo, so a new session, or a different agent, can ask what is still open. The original now runs on Dolt; Beads Rust (the br command) is a port that keeps the classic SQLite plus JSONL design."
  - q: "Beads vs GitHub Issues: which should agents use?"
    a: "Use Beads for fast, local, agent-to-agent task tracking and GitHub Issues or Projects for coordinating people. On the show, David keeps Beads local because it needs no network hop and doesn't hit rate limits, and uses a GitHub issue as a higher-level item that several Beads tasks can sit under."
  - q: "What is MCP Agent Mail?"
    a: "MCP Agent Mail is an open-source MCP server that its README describes as 'like gmail for your coding agents'. It gives each agent a memorable name, an inbox and searchable threads, and lets agents reserve files. Messages are stored in Git and SQLite, and there is a web UI so humans can read what the agents said to each other."
  - q: "How do you use GitHub Projects with AI coding agents?"
    a: "Put the shared tasks on a GitHub Projects board and let agents manage them through the GitHub CLI. David adds a short note to his system prompt so that when he says he is taking an issue, the agent assigns it to him and moves it to In Progress. He ends each task with 'commit, sync and push' so the final steps actually happen."
  - q: "What is Xavier for coding agents?"
    a: "Xavier (xavier.team) is an AI agent orchestrator by Atila Fassina: a set of skills you run inside your coding agent. /x-learn maps a codebase with sub-agents it calls remoras, /x-review runs correctness, security and performance personas, /x-prd writes a PRD after interviewing you, and /x-loop executes the tasks. Its notes live in a vault in ~/.xavier."
  - q: "What is the grill me skill?"
    a: "Grill me is a skill from Matt Pocock's open-source skills collection that makes the agent interview you about a plan before it builds anything. On Building with Bob it turned vague design goals for Walfly into concrete decisions, and Xavier wraps the same idea in its /x-grill command and the interview at the start of /x-prd."
---

The hosts of Building with Bob have been running more than one coding agent at a time since the KillrCtx build, and Walfly has used a formal coordination stack since episode 8 (part 4 of the Walfly build). This page collects what we learned about keeping several agents, and then two humans, from stepping on each other: plain parallel sessions, then the tools we added when those stopped being enough. Every claim about the show links to the moment it happened. For the projects, see [the Walfly project page](/projects/walfly) and [the KillrCtx project page](/projects/killrctx).

## Why do coding agents need coordination?

Coding agents need coordination because they work fast, in parallel, and without memory of each other, so without shared state they overwrite files and lose track of tasks. David raised the file problem in [Docling Audio Transcription and Expo Mic Fixes with IBM Bob](/episodes/debugging-expo-audio-and-local-docling-transcription): with several agents in one codebase, each needs to know what the others are doing so they "make sure they don't clobber files" ([15:56](/episodes/debugging-expo-audio-and-local-docling-transcription?t=956)).

The second problem is memory. An agent's built-in to-do list belongs to one conversation:

> Right now if I were to give a task list here to Bob, or if I did it in Claude Code, my task list is going to be per session. But what happens if I have an overarching project task list that I want to persist over time?
> — David [18:44](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1124)

In episode 9 he explained why this matters more with agents than with people: file locks along the lines of "I'm on these areas, don't touch this" are "even more important with agents, because they work so much faster" ([15:04](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=904)).

### The agent's task list vs your spec's to-dos

Every major agent keeps its own internal task list, which can drift from the task file in your spec. In [Spec Coding a Setup Wizard for an Open-Source NotebookLM Clone](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend) (episode 3), David said "Bob, Claude, a bunch of them create their own task lists internally," so he tells the agent to check off his file instead, and considered putting that rule in his agents file ([1:10:14](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4214)). His reason is documentation: "I want the documentation." In [Building a NotebookLM-Style Mind Map with React Flow and IBM Bob](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob) (episode 2) he described the same collision in Claude Code ([31:28](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1888)) and the file's value "for posterity" ([31:58](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1918)); Bob "does that as well just like Claude" ([36:53](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2213)). That episode also showed agents batching work themselves: asked to run every task in parallel, Bob batched the work sensibly, starting with the React Flow install ([34:14](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2054)). A task file in the repo is the first, simplest form of shared memory; Beads is the next step.

## Parallel Bob Shell sessions without a coordinator

The simplest way to run agents in parallel is one [Bob Shell](https://bob.ibm.com) session per terminal tab, each on a task that doesn't touch the others' files. In [Debugging KillrCtx RAG Backends: OpenRAG vs AI Workbench](/episodes/debugging-rag-backends-openrag-vs-ai-workbench) (episode 4, July 2026), Tejas worked this way:

1. **Multiplex tabs.** "I'm multiplexing Bob Shell here because I want to do parallel work" ([31:40](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1900)). He also knew when not to: "We don't need to multiplex for now. One thing at a time" ([35:42](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2142)).
2. **Pick orthogonal tasks.** A second agent in YOLO mode took the URL-source fix while the first fixed the setup wizard: "I'm working on orthogonal things... They don't really conflict at all" ([37:24](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2244)).
3. **Name every session.** He renamed each tab after its job: header and model dropdowns, mock embedder, URL retry logic ([54:20](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3260)). David added that he does the same with separate sessions in the Bob IDE.
4. **Scale up carefully.** A fourth agent took "error details" and Tejas had "four agents running" ([56:32](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3392)).

> Working with multiple agents concurrently. It's power.
> — Tejas, [37:55](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2275)

Asked whether this is normal for him, Tejas claimed "literally hundreds of parallel agents" ([53:46](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3226)). That's his own description, not something shown on stream. What was shown is that four sessions stayed manageable because the tasks were independent. The approach has no locks and no shared memory, so when tasks overlap or span sessions, you need the tools below.

## Two humans, one feature branch

When two people share one agent-built feature, a pushed feature branch is enough coordination for a short session. In episode 3, David had Bob commit and push the setup-wizard branch rather than main ([1:15:02](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4502)), and Tejas cloned that branch fresh to test it as a newcomer ([1:17:56](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4676)). Each bug Tejas hit became a prompt for David's agent: "when you push, I'll pull and we can try again" ([1:20:07](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4807)). David ended prompts with "commit and push to branch", calling it "how we're collaborating right now" ([1:21:07](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4867)), and the fix worked on Tejas's machine minutes later ([1:22:43](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4963)).

## Beads and Beads Rust: persistent task memory

Beads gives agents a task list that lives in the repository instead of in one chat, so any session can pick up where another left off. As of September 2026 the [Beads README](https://github.com/steveyegge/beads) calls it a "distributed graph issue tracker for AI agents, powered by Dolt", with commands such as `bd ready`, `bd create`, `bd claim` and `bd close`. JSONL is now an export format there, not the source of truth.

David uses [Beads Rust](https://github.com/Dicklesworthstone/beads_rust), a port that runs as `br`. Its README says it is "frozen at the 'classic' SQLite + JSONL architecture", and that it "never commits, pushes, pulls, installs hooks, or runs as a background service." Check which one you install.

What it looked like in [Local Docling + Whisper Sidecar and Beads for Agent Teams](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents) (episode 8):

1. David asked IBM Bob to register with MCP Agent Mail and create "epics, decisions and tasks" in Beads Rust ([19:17](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1157)). Bob filled Beads with tasks based on the plan from part 1 of the Walfly build ([23:11](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1391)).
2. Tejas called it "just like Trello". David's answer: "it's an agentic Trello. It is built for agents" ([20:31](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1231)).
3. The payoff is continuity: "we come back to it two weeks later and what we didn't finish is tracked" ([21:05](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1265)).
4. When Bob hit its default limit of 100 turns, David could start a fresh chat without losing the plan ([53:43](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=3223)).
5. A checkpoints epic for long recordings became the audio chunking work of episodes 9 and 10 ([1:16:38](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=4598)); see the [audio chunking guide](/topics/audio-chunking).

## MCP Agent Mail: identities, messages and file reservations

MCP Agent Mail is a message bus for agents: each agent registers, gets a name and an inbox, and reserves the files it is editing. The [MCP Agent Mail README](https://github.com/Dicklesworthstone/mcp_agent_mail) describes it as "like gmail for your coding agents". Agents get adjective-plus-noun names, send Markdown messages in searchable threads, and take advisory, time-limited reservations on files or glob patterns, exclusive or shared. Messages live in Git plus SQLite, a web UI lets humans browse inboxes, and an optional pre-commit guard blocks conflicting commits. As of September 2026 its installer also installs Beads Rust.

> They'll register and they're like, "Hey, I'm Tejas agent 2... I'm going to lock these files out. So hey, any other agents, don't touch these files," and it automatically coordinates.
> — David [18:03](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1083)

In the demo, the first Bob session registered as **Gentle Pond** ([22:06](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1326)). A second session, writing a UX report, registered as **Coral Bridge** and broadcast its task ([37:40](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=2260)). In the reservations view, the other agents see a held lock and keep away ([38:20](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=2300)).

Both tools work "with Bob or whatever coding agent" ([17:16](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1036)), and installing them adds instructions to your `CLAUDE.md` or agents file ([9:25](/episodes/designing-audio-chunking-and-ephemeral-asr?t=565)). David still spells it out when several sessions share a project ([37:00](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=2220)).

## Adding humans: GitHub Projects and the GitHub CLI

Once other people join, a shared GitHub Projects board is a better place to decide who owns what, while Beads and Agent Mail stay local. In [Audio Chunking and a Stateless Docling ASR Service in Docker](/episodes/designing-audio-chunking-and-ephemeral-asr) (episode 10), David said the local stack works for many agents on his machine, but "the second you say, well, wait a minute, I now have a team of humans... that breaks down" ([4:17](/episodes/designing-audio-chunking-and-ephemeral-asr?t=257)).

1. **Put the shared work on a board.** Bob turned the open tasks into issues on a [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) board ([5:29](/episodes/designing-audio-chunking-and-ephemeral-asr?t=329)).
2. **Let the agent drive it through the CLI**, including [`gh project`](https://cli.github.com/manual/gh_project) ([7:08](/episodes/designing-audio-chunking-and-ephemeral-asr?t=428)). "I'm going to grab number 12" gets it assigned and moved to In Progress ([7:41](/episodes/designing-audio-chunking-and-ephemeral-asr?t=461)).
3. **Encode the ritual, then say it anyway.** Agents are "not deterministic" ([10:28](/episodes/designing-audio-chunking-and-ephemeral-asr?t=628)), so he ends tasks with "commit, sync and push" ([11:07](/episodes/designing-audio-chunking-and-ephemeral-asr?t=667)).
4. **Treat the GitHub issue as the epic**, with Beads tasks under it, though he's "not a huge fan of having to maintain the same task in two places" ([12:48](/episodes/designing-audio-chunking-and-ephemeral-asr?t=768)).

GitHub stays out of the agent-to-agent loop: agents would hit rate limits and pay a network round trip on every step ([15:03](/episodes/designing-audio-chunking-and-ephemeral-asr?t=903)).

> That's why this is really limited to the human interaction, if that makes sense.
> — David [15:35](/episodes/designing-audio-chunking-and-ephemeral-asr?t=935)

## Xavier, the grill me skill and the meta harness

Planning tools that interview you before building make sure every agent starts from the same decisions. The [grill me skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md) from Matt Pocock's collection is "a relentless interview to sharpen a plan or design".

- **Directly.** In episode 8 the hosts asked Bob to create a UX design epic and "grill me on those items" ([24:13](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1453)). The answers set Walfly's brand: dark-first, a minimal fly mark, an amber palette ([33:49](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=2029)).
- **Through Xavier.** [Xavier](https://xavier.team) is an AI agent orchestrator by Atila Fassina, a friend and former teammate of Tejas. In [Bob Review vs Xavier and a KeyboardAvoidingView Fix in Expo](/episodes/ai-code-review-and-expo-mobile-layout-fixes) (episode 9), Tejas described it as "a collection of skills" for Claude Code, Codex or another agent that learns your codebase and "wraps the grill me skill" ([10:26](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=626), [10:57](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=657)). Per its site, `/x-learn` sends sub-agents called remoras to map architecture, decisions and dependencies, `/x-review` runs correctness, security and performance personas ([12:41](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=761)), and findings go to a vault in `~/.xavier` ([13:19](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=799)). In episode 10, `/x-prd` grilled the hosts on audio chunking ([39:42](/episodes/designing-audio-chunking-and-ephemeral-asr?t=2382)), and David called Xavier "a nice companion with Bob". In [episode 11](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly), David described what he values after using it for half the project: when it learns, it records your architecture and decisions and calls them out on new tasks, instead of keeping that memory hidden ([5:54](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=354)). He also suggested writing the PRD with Xavier, then starting a fresh session to create the tasks, so the agent works from a clean context ([42:57](/episodes/astra-db-8000-byte-limit-and-jev-clustering-in-walfly?t=2577)).

Tejas had moved from Claude Code to Codex, and "there's a whole bunch of context that's just not available to this new agent"; a meta harness keeps PRDs, reviews and learned knowledge "across agents" ([18:39](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=1119)). David hopes this becomes "table stakes" in coding agents ([15:04](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=904)).

## Parallel sessions vs Beads vs MCP Agent Mail vs GitHub Projects

Each approach covers a different job, and on the show they work as layers. Tool descriptions come from each project's documentation as of September 2026.

|               | Parallel Bob Shell tabs          | Beads / Beads Rust                           | MCP Agent Mail                                                                                                                     | GitHub Projects                  |
| ------------- | -------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| What it's for | Independent tasks at once        | Persistent, dependency-aware task list       | Agent identities, messages, file reservations                                                                                      | Planning work across a team      |
| On the show   | Four KillrCtx fixes in episode 4 | Agents in any session, on one machine        | Parallel agents in one codebase                                                                                                    | Tejas, David and their agents    |
| Persistence   | None beyond each session         | Dolt (Beads); SQLite plus JSONL (Beads Rust) | Git plus SQLite, web UI                                                                                                            | Hosted by GitHub                 |
| Network       | Local                            | Local, no network hop                        | Local server (a team could deploy one, [22:37](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1357)) | Remote, rate-limited             |
| Weak spot     | No locks: tasks must not overlap | Not built for sharing across people          | Advisory locks: agents must respect them                                                                                           | Too slow for agent-to-agent chat |

For how these fit next to IBM Bob's own task lists and sessions, see [IBM Bob vs Claude Code, Cursor and Codex](/topics/ibm-bob-vs-claude-code-cursor-codex).
