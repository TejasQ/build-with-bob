---
slug: ibm-bob-features-in-practice
title: "IBM Bob Plan Mode, Bob Review and Bob Shell in Practice"
h1: "How IBM Bob's plan mode, Bob Review and Bob Shell work on a real project"
description: "How we used IBM Bob's plan mode, spec-coding mode, skills, Bob Review, Bob Shell, YOLO and auto-approve on two real apps, with timestamped examples."
answer: "On real projects, IBM Bob's plan mode asks clarifying questions and writes a spec with numbered subtasks, then switches itself to agent mode. A custom spec-coding mode and project skills make features repeatable. Bob Review lists findings you fix one by one with Fix with Bob. Bob Shell shares sessions with the IDE and runs several agents in parallel."
updated: "2026-09-30"
about: ["IBM Bob", "Bob Shell", "Bob Review", "plan mode", "custom modes", "skills"]
episodes:
  - killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob
  - adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob
  - notebooklm-clone-setup-wizard-and-ai-workbench-backend
  - debugging-rag-backends-openrag-vs-ai-workbench
  - planning-walfly-wearable-app-mvp-with-ibm-bob
  - walfly-record-button-redesign-and-astra-db-setup
  - debugging-expo-audio-and-local-docling-transcription
  - local-first-transcription-python-sidecar-and-coordinating-agents
  - ai-code-review-and-expo-mobile-layout-fixes
faq:
  - q: "How does IBM Bob's plan mode work?"
    a: "Plan mode reads your prompt and any attached files, such as an architecture diagram, and asks multiple-choice clarifying questions before writing code. You can edit the answer options inline. It then produces a plan with numbered subtasks, a schema and an API contract, and researches open questions on its own."
  - q: "Does IBM Bob support skills and custom modes?"
    a: "Yes. Skills are reusable SKILL.md instruction sets stored in .bob/skills/ in a project or ~/.bob/skills/ globally, and custom modes live in .bob/custom_modes.yaml or a global file. On stream, David created a spec-coding mode by pointing Bob at a repo describing the process, and gave Bob an OpenRAG SDK skill that let it build a model picker almost in one shot."
  - q: "How do I turn on YOLO or auto-approve in Bob Shell?"
    a: "IBM documents two ways: the approval key in ~/.bob/settings/settings.json, and the /permissions slash command during a session. On stream in July 2026 the hosts toggled YOLO mode inside Bob Shell with Shift+Tab and trusted the project folder when asked. Auto-approve can cause data loss, so use it in folders you trust."
  - q: "What is Bob Review and Fix with Bob, and how good is it?"
    a: "Bob Review is IBM Bob's built-in code reviewer. It lists issues in a Bob Findings panel, and Fix with Bob creates a task to address one finding. In our test it caught real visibility issues that another reviewer missed, but a later review told us to reintroduce a prop we had just removed to fix a bug, so check its advice."
  - q: "What's the difference between Bob Shell and the Bob IDE?"
    a: "The Bob IDE is a VS Code-based editor with Bob built in; Bob Shell brings the same agent to the terminal, with slash commands such as /mode and /permissions. Since August 2026 they share task history. Tejas uses Bob Shell daily and never the IDE; David prefers the IDE for larger codebases and the shell for deployments and system work."
  - q: "How do you save tokens with IBM Bob?"
    a: "David runs Bobby Talk, a Bob skill inspired by the Caveman skill that makes the agent answer tersely and cuts output tokens, which is where much of the cost is. He also runs git commands through RTK, a tool that trims extraneous git output before it reaches the agent's context."
  - q: "Why does IBM Bob keep asking me to approve commands?"
    a: "Bob starts with a restrictive permission model on purpose, because it targets enterprise, production-quality work. It asks before running new commands and whenever it reaches outside your workspace. You can approve a command type for the current task, allow commands for the project, loosen the global settings, or configure auto-approve per action type."
---

This guide is the hands-on companion to [What is IBM Bob?](/topics/ibm-bob). It walks through the IBM Bob features we actually leaned on while building [KillrCtx](/projects/killrctx) and [Walfly](/projects/walfly) on Building with Bob, across ten episodes numbered in the order they aired. Every example links to the moment it happened.

## Plan mode: from a whiteboard diagram to numbered subtasks

Plan mode turns a prompt into a conversation that ends in a plan, before any code is written. IBM describes it as the mode that "analyzes requirements, researches and designs implementation steps" ([docs](https://bob.ibm.com/docs/ide/features/modes)). Here is how we used it in [IBM Bob Plan Mode: Scoping a Real App MVP, Live](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob), part 1 of the Walfly build:

1. **Attach the diagram and ask Bob to explain it back.** David suggested: "Why don't we have Bob explain to us what's in that diagram?" ([18:04](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=1084)).
2. **Save the opening prompt.** Tejas keeps each project's first prompt as `genesis.md` ([25:33](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=1533)).
3. **Answer the questions.** Bob asked multiple-choice questions about accounts, hosting, auth, storage and search ([27:45](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=1665)), with options you can edit inline ([28:23](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=1703)).
4. **Read the plan like a spec.** It had a Mermaid diagram and subtasks with IDs, "different from vibe coding" ([35:06](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=2106)).
5. **Ask how, not just what.** Asked about diarization, Bob researched it unprompted ([39:58](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=2398)).

When David wants Bob to think without touching files, he says "let's discuss" in plan mode ([29:25](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=1765)). Once you approve a plan, Bob moves into agent mode on its own: "I'm glad that Bob switched that on its own" ([54:56](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=3296)). IBM's [modes docs](https://bob.ibm.com/docs/ide/features/modes) confirm Bob "can switch modes autonomously during a task when the work evolves." You can also switch with `⌘ + .` on macOS or `Ctrl + .` elsewhere.

## Spec-coding mode: requirements, design and tasks

A spec-coding mode goes further than plan mode: it writes requirements, a design and a task list into your repo, and checks that each links back to the last. David built one for KillrCtx and used it for every feature; his case for it is that it takes "an LLM that by nature is non-deterministic and make[s] it deterministic" ([14:28](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=868)). The workflow in [Building a NotebookLM-Style Mind Map with React Flow and IBM Bob](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob):

1. **Requirements with IDs.** "Every requirement must have [a] unique identifier" ([15:31](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=931)).
2. **Design, then to-dos** linked back to those requirements ([16:03](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=963)).
3. **A validate step** that maps design and to-dos to requirements: "that's the key thing that keeps the agent on the rails" ([21:05](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1265)).
4. **Human review** before implementation. In the setup-wizard episode, David reviewed the spec because "this is where we come into play" ([41:03](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2463)).

Bob recognises new features and offers the process itself: "hey, should we be using the spec coding process for this?" ([14:59](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=899)). Tested without a hint, it started a spec anyway ([18:47](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1127)). The `specs/` folder became, in David's words, "essentially a database" of past features ([5:27](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=327)), and a whole AI Workbench backend came out of it "pretty much oneshot" ([6:03](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=363)). For small visual fixes, the hosts happily skipped it: pasting a screenshot and vibing is "totally okay" ([21:59](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1319)).

## Skills and custom modes

Skills and custom modes are how you teach Bob your own workflows. IBM defines a [skill](https://bob.ibm.com/docs/ide/tutorials/use-skills) as "a reusable instruction set that teaches Bob a specialized, repeatable workflow," stored in `.bob/skills/` for the project or `~/.bob/skills/` globally; Bob uses one when you invoke it by slash command or when its description matches your request. [Custom modes](https://bob.ibm.com/docs/ide/configuration/custom-modes) live in `.bob/custom_modes.yaml` or `~/.bob/settings/custom_modes.yaml`. The skills we saw on stream:

- **A spec-coding mode and skill, created from a repo.** David pointed Bob at a repo describing his process and told it, "I want to create a custom mode" ([14:28](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=868)); Bob "went there and created its skill" ([21:05](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1265)). He keeps it at project level ([28:01](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1681)), and Bob announces when it loads a skill ([26:53](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1613)).
- **An SDK skill.** With an OpenRAG SDK skill, one prompt produced a model picker Bob "almost one shot" ([36:48](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2208), [37:22](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2242)).
- **A coding-style skill.** David built a devrel skill from one of Tejas's repos that keeps generated code commented, simple and modular ([36:51](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2211), [1:13:59](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4439)).
- **A token-saving skill.** Bobby Talk, "inspired by Caveman," makes Bob terse to cut output tokens, "where a lot of the cost is" ([28:52](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1732)). David pairs it with RTK, which trims git output ([1:15:38](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4538)).

The [IDE changelog](https://bob.ibm.com/docs/ide/changelog) added Skills and Modes tabs in version 2.0.0 (June 2026), and the [Bob Shell changelog](https://bob.ibm.com/docs/shell/changelog) added skills to the terminal in Shell 2.0.0 (August 2026).

## Bob Review, Bob Findings and "Fix with Bob"

Bob Review is a built-in code reviewer that turns its results into a list of findings, each with a one-click fix. Per [IBM's code review docs](https://bob.ibm.com/docs/ide/features/code-reviews), it reviews the diff between branches (optionally with uncommitted changes), puts issues in the Bob Findings panel, and "Fix with Bob" creates a task per finding.

In [Bob Review vs Xavier and a KeyboardAvoidingView Fix in Expo](/episodes/ai-code-review-and-expo-mobile-layout-fixes), the hosts ran Bob Review alongside the review command of [Xavier](https://xavier.team), an AI agent orchestrator by Atila, on the same three commits. Bob found things that could end up out of the viewport plus a magic number ([37:12](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=2232)); Xavier, looking for bugs, security and performance, found nothing actionable.

|          | What IBM documents                                  | What we saw on Walfly                                                                                   |
| -------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Input    | Diff between branches, optional uncommitted changes | The last three commits                                                                                  |
| Output   | Findings in the Bob Findings panel                  | Viewport and keyboard visibility warnings, a magic number                                               |
| Fixing   | Fix with Bob creates a task per finding             | Applied one finding per session ([48:51](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=2931)) |
| Accuracy | Not stated                                          | One follow-up finding would have reintroduced a fixed bug                                               |

David applied findings one at a time "to keep each of the fixes specific" ([40:48](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=2448)), yet one was still hidden under the tab bar, "exactly the thing it claimed to fix" ([41:53](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=2513)). A follow-up review then suggested re-adding the prop they had removed to fix the keyboard bug ([1:20:49](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=4849)). Use it as a second pair of eyes.

## Bob Shell vs the Bob IDE

Bob Shell and the Bob IDE are two front ends to the same agent, and the hosts split on which to use. Tejas: "I actually never use the Bob IDE ever… I live in the command line" ([43:40](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2620)); he compares Bob Shell to Claude Code in the terminal ([20:02](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1202)). David uses the shell for deployments and system work but prefers the IDE as codebases grow ([25:07](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1507)). Tejas's summary of IBM's intent: "we want to meet you as a developer where you are" ([11:30](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=690)).

IBM's [August 2026 release](https://bob.ibm.com/blog/august-2026-release/) made them share task history: "Tasks started in Shell appear in the IDE." David saw it work: "the session was just sitting there. I could just continue on" ([59:12](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=3552)). Sign-in stayed separate ([23:22](/episodes/debugging-expo-audio-and-local-docling-transcription?t=1402)).

**Bob Shell versions matter.** In July 2026 Bob Shell auto-upgraded Tejas on restart ([15:40](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=940)), and the jump from 1.0.4 to 1.0.6 was "crazy," with a much cleaner experience ([16:50](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1010)). The shell's context indicator ("98% tokens left… is it context fullness?") confused him ([25:48](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1548)). Shell 2.0.0 shipped in August 2026, and 2.0.4 restored automatic updates on npm 12, per the [changelog](https://bob.ibm.com/docs/shell/changelog). Mode switching also changed: in August 2026 Shift+Tab didn't cycle modes for Tejas ([54:06](/episodes/debugging-expo-audio-and-local-docling-transcription?t=3246)); the [Bob Shell docs](https://bob.ibm.com/docs/shell/features/modes) list `/mode`. The IDE, meanwhile, lacked VS Code's Live Share ([30:39](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=1839)).

## Memory: teaching Bob to search the web

Bob's memory lets a correction stick across sessions; its best use for us was fixing stale version knowledge. After Bob claimed Next.js 16 didn't exist ([1:03:51](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=3831)), the hosts asked it to "update your memory" ([1:04:25](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=3865)), approved the write because memory lives outside the project ([1:05:11](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=3911)), and broadened the rule to always search the web ([1:07:25](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=4045)). It isn't a complete fix: Bob later picked Expo 52 on an Expo 57 project ([1:20:43](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=4843)), so the hosts put the version straight into prompts ([21:19](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=1279)). Bob also reads [global and workspace rules](https://bob.ibm.com/docs/ide/configuration/rules) and `AGENTS.md`.

## Permissions, YOLO mode and approve-for-this-task

Bob starts locked down on purpose, and you loosen it deliberately. David explained that Bob targets enterprise, production-quality apps, so "they want you to think about those permissions" ([56:30](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=3390)). The options we used, from tightest to loosest:

- **Approve once.**
- **Approve for this task.** Pick a command type, such as `gh` commands, and Bob stops asking for it in this task while other commands still prompt ([56:16](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3376)). IBM documents these as [task-level overrides](https://bob.ibm.com/docs/ide/features/auto-approving-actions).
- **Allow for this project** ([58:10](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=3490)).
- **Auto-approve by category** (read, edit, execute, MCP, skill, subagent and more), with IBM's warning that it "can result in data loss, file corruption, or worse."
- **YOLO in Bob Shell.** In July 2026 the hosts toggled it inside the shell with Shift+Tab, and Tejas trusted the folder when prompted ("it's all red because it's dangerous") ([11:46](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=706), [12:17](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=737)). IBM's [Bob Shell auto-approve docs](https://bob.ibm.com/docs/shell/features/auto-approving-actions) describe the `approval` key in `~/.bob/settings/settings.json` and the `/permissions` command, and don't use the word YOLO, so check the current control.

The knobs move between releases. In June 2026 David couldn't find the old full YOLO switch after an update ([35:48](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2148)); once permissions were opened up, Bob asked far less ([51:06](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3066)). Per the [Shell changelog](https://bob.ibm.com/docs/shell/changelog), 2.0.1 (August 2026) made writes to Bob's own settings files always need one-time approval, even with auto-approve on. Expect prompts whenever Bob reaches outside the workspace ([35:30](/episodes/ai-code-review-and-expo-mobile-layout-fixes?t=2130)), and keep API keys in a credential store rather than chat ([54:42](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=3282)).

## Parallel tasks and parallel Bob Shell sessions

Bob can run several tasks at once, so move unrelated work out of the main task. David opened a new task to initialise Git while the main task built the API ([1:12:29](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=4349)), did the same while Bob committed in [Astra DB Setup and a Better Record Button with IBM Bob](/episodes/walfly-record-button-redesign-and-astra-db-setup) ([24:18](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=1458)), and finds about three tasks is his limit ([1:08:36](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=4116)).

Inside one task, Bob can batch. Asked to do all the mind-map to-dos in parallel from agent mode, it grouped the work sensibly ([33:42](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2022), [34:14](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2054)); IDE 2.0.0 added [subagents](https://bob.ibm.com/docs/ide/changelog) for this.

In the terminal, Tejas multiplexes Bob Shell tabs on "orthogonal things" that don't conflict ([37:24](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=2244)), renames each session to track it ([54:20](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3260)), and had "four agents running" at once ([56:32](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=3392)). When files start to collide, see [coordinating coding agents](/topics/coordinating-coding-agents).

## Long sessions: the 100-turn limit

When a Bob task runs long, start a fresh one and carry state in something that outlives the session. Bob's default stops at 100 turns because accuracy "might start to drop" ([1:10:53](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4253), [52:06](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=3126)). David has asked the team for a "start new session with context" option that condenses the thread ([1:11:28](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4288)). Workarounds we used:

- **Start clean with just the error** ([53:43](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents?t=3223)), with tasks kept in Beads.
- **Point Bob at an older repo that solved the problem**; it cloned it with `gh` to read it ([1:13:38](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4418), [1:15:18](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=4518)).
- **Keep your own task file.** Bob keeps an internal task list, so David tells it to update his `to-do.md` ([36:53](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2213)).
- **Maintain a context wiki** that Bob updates after architecture changes, so "the next time it loads up in any session, it has that context" ([1:29:18](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=5358)).

IBM's [context window guide](https://bob.ibm.com/docs/ide/core-concepts/context-window-management) agrees: start a new task when the topic changes, since automatic compaction is lossy. For how these features compare with other agents, see [IBM Bob vs Claude Code, Cursor and Codex](/topics/ibm-bob-vs-claude-code-cursor-codex).
