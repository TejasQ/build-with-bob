---
slug: spec-driven-development-ibm-bob
title: "Spec-Driven Development With IBM Bob: A Real Workflow"
h1: "How do you do spec-driven development with IBM Bob?"
description: "Spec coding in IBM Bob on a live build: a custom mode and skill for requirements, design and tasks, numbered IDs, validation, and when to just vibe."
answer: "Give IBM Bob a written spec-coding process and have it turn that into a custom mode and skill. For each new feature, Bob writes requirements with numbered IDs and acceptance criteria, then a design, then a task list, validating each against the requirements and pausing for your review. You implement only after the spec is right."
updated: "2026-09-30"
about: ["IBM Bob", "spec-driven development", "custom modes", "skills", "KillrCtx"]
episodes:
  - killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob
  - adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob
  - notebooklm-clone-setup-wizard-and-ai-workbench-backend
  - debugging-rag-backends-openrag-vs-ai-workbench
  - planning-walfly-wearable-app-mvp-with-ibm-bob
  - walfly-record-button-redesign-and-astra-db-setup
faq:
  - q: "Does IBM Bob support spec-driven development?"
    a: "Yes, through its extension points rather than a single spec button. Bob's custom modes and skills let you encode a requirements, design and tasks process, and David Jones-Gilardi did exactly that by pointing Bob at his spec-coding process repo. Bob's built-in plan mode is also spec-like: it asks questions and returns subtasks with IDs."
  - q: "Is spec-driven development just waterfall?"
    a: "It can drift that way if you write one huge spec up front and never revisit it, which is the critique from Thoughtworks' Birgitta Böckeler and others. On Building with Bob, specs are per feature and small, Bob stops for review after each step, and review comments go straight back into the spec before any code is written."
  - q: "What is the difference between spec coding and vibe coding?"
    a: "Vibe coding goes prompt to prompt and is great for demos and small fixes. Spec coding agrees requirements, a design and a task list with the agent first, with every task traced to a numbered requirement, so the agent stays on the rails for full features. The hosts use both, depending on the size of the change."
  - q: "How do I create a custom mode in IBM Bob?"
    a: "Use Settings, then the Modes tab, or define it in YAML: `.bob/custom_modes.yaml` in the project root for a project mode, or `~/.bob/settings/custom_modes.yaml` for a global one. A mode has a slug, name and role definition, plus optional instructions and tool groups. You can also ask Bob to create one from a written process."
  - q: "Where do IBM Bob skills live?"
    a: "In a folder containing a `SKILL.md` file, under `.bob/skills/` in your project or `~/.bob/skills/` globally; the project copy wins on a name clash. The file's front matter needs a name and a description, and Bob uses the description to decide when to activate the skill."
---

Spec-driven development is the most-discussed way to keep coding agents on track, and IBM Bob doesn't ship a single "spec" button for it. What it does have is [custom modes](https://bob.ibm.com/docs/ide/configuration/custom-modes) and [skills](https://bob.ibm.com/docs/ide/features/skills), and on Building with Bob David Jones-Gilardi used them to run every [KillrCtx](/projects/killrctx) feature through a requirements, design and tasks loop. This guide collects that workflow from four KillrCtx streams, mostly [Building a NotebookLM-Style Mind Map with React Flow and IBM Bob](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob) (episode 2) and [Spec Coding a Setup Wizard for an Open-Source NotebookLM Clone](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend) (episode 3). Bob's built-in plan mode is a different, lighter tool; it's covered in [IBM Bob features in practice](/topics/ibm-bob-features-in-practice).

## What spec coding is, vs vibe coding

Spec coding means agreeing a written spec with the agent (requirements, design, tasks) before it writes code, instead of steering it prompt by prompt. David's definition in episode 3: vibe coding goes "from prompt to prompt to prompt" and is "really great for demos", but if you want an app that works and an agent that stays "on the rails", the spec process is "the way to go" ([39:29](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2369)). In episode 2 he pitched it as a way to "significantly level up your game" ([13:57](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=837)) and to take "an LLM that by nature is non-deterministic and make it deterministic" ([14:28](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=868)).

The shape matches the wider field. [GitHub Spec Kit](https://github.com/github/spec-kit) says to "define what and why before deciding how to build it", and [Kiro specs](https://kiro.dev/docs/specs/) generate `requirements.md`, `design.md` and `tasks.md`. In Birgitta Böckeler's [October 2025 taxonomy](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html), David's approach is "spec-anchored": "the spec is kept even after the task is complete". IBM's Niklas Heidloff describes a Bob-based variant in [Spec-driven Development with IBM Bob](https://heidloff.net/article/spec-driven-development-ibm-bob/) (May 2026).

## Setting it up in Bob: a custom mode and a skill from a process repo

The fastest setup is to point Bob at a written process and ask it to build the mode for you. David keeps his spec-coding process in a repo he uses for workshops: "you can literally point to the repo and you can tell it, hey, I want to create a custom mode. I want you to follow this process" ([14:28](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=868)). Bob read it and "created its skill" ([21:05](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1265)). In episode 1 he explained that he has "those skills set at the project" level, and that he told Bob to use the process "anytime I'm talking about creating new feature" ([27:29](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1649), [28:01](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1681)).

Where those pieces live, per IBM's docs in September 2026:

| Piece       | Project scope                                 | Global scope                        | What decides when it's used                                                         |
| ----------- | --------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| Custom mode | `.bob/custom_modes.yaml` (takes precedence)   | `~/.bob/settings/custom_modes.yaml` | You pick it; optional `whenToUse` guides task coordination                          |
| Skill       | `.bob/skills/<name>/SKILL.md` (wins on clash) | `~/.bob/skills/<name>/SKILL.md`     | The skill's `description` ("skills without descriptions are automatically ignored") |
| Mode rules  | `.bob/rules-{mode-slug}/`                     | n/a                                 | Loaded with that mode                                                               |

Sources: [custom modes](https://bob.ibm.com/docs/ide/configuration/custom-modes), [skills](https://bob.ibm.com/docs/ide/features/skills). Committing the project-level files means everyone on the repo gets the same process.

## Requirements with numbered IDs and acceptance criteria

The requirements document is where the spec earns its keep: every requirement gets a unique ID so later steps can point back to it. David's process prompt insists on "numbered IDs for requirements" and "acceptance criteria" ([20:25](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1225)), and "every requirement must have unique identifier" ([15:31](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=931)). He calls this the step where "we as humans, we take some of the control back."

It's also where he spends the most time ([21:48](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1308)). Bob asks before moving to each next step, and on a feature for one of his games, David spent "a good solid hour" on it, because "the AIs can move so fast" that a wrong direction costs more later ([23:29](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1409)).

## Design, tasks and the validate step that links them back

After requirements come a design and a task list, and a validate step ties both back to the requirement IDs. The design uses your real stack and conventions ([16:03](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=963)); for the mind map it proposed installing React Flow and a renderer component following the Next.js conventions already in the repo ([24:43](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1483), [25:16](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1516)). Then:

> There's always a validate step that says when you create the design, map those to the requirements. When you create the to-do, map those back, because that's the key thing that keeps the agent on the rails.
> — David Jones-Gilardi, [21:05](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1265)

The same process prompt includes a step for running tests and fixing failures. With the mode in place, Bob runs validation on its own: "because I have a spec coding mode, it already did it" ([40:29](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2429)). Tejas Kumar added a point from a talk at AI Engineer World's Fair: agents do better work when you explain not just what to do "but why it's important to do it", and specs capture the why ([41:33](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2493)). For the mind map feature itself, see [AI mind maps with React Flow](/topics/ai-mind-map-react-flow).

## Reviewing the spec is where humans add value

Reviewing the generated spec catches mistakes while they're a sentence long, not a pull request long. Three catches from the show:

- **Design: Tailwind magic numbers.** Tejas spotted hard-coded hex colors and fixed heights in the mind map design: "we can just use proper design tokens from Tailwind CSS" ([26:29](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1589), [27:31](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1651)). Bob fixed it in the design before any code existed, which David called "the verify step" ([29:46](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1786)). Tejas's follow-up: Bob only checked the Tailwind config after being told, and David suggested making that a standing project instruction ([28:36](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1716)); Bob supports [workspace rules](https://bob.ibm.com/docs/ide/configuration/rules) for that.
- **Requirements: a wrong localhost assumption.** The setup-wizard spec detected a backend by sending a GET to `localhost:3000`, which "could be some Next.js app" ([42:04](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2524)). The fix: require environment variables in `.env.local` first ([42:35](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=2555)).
- **Requirements: scope.** Requirement 4 assumed the repo bundles OpenRAG; the hosts rewrote it to "we should not bundle OpenRAG" ([50:40](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3040), [51:46](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=3106)).

By the end of episode 3, the hosts reckoned "80% of this episode was just specking" ([1:33:44](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=5624)).

## Bob recognises new features and proposes spec mode itself

Once the mode and skill exist, Bob tends to reach for them without being asked. David said Bob "will recognize when I am creating a new feature" and ask whether to use the spec process, then create a feature branch and a spec directory ([14:59](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=899)). He tested it on stream by deliberately not mentioning spec coding, and Bob went straight to creating a feature under `specs/` ([18:47](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1127)). IBM's [modes docs](https://bob.ibm.com/docs/ide/features/modes) note that Bob "can switch modes autonomously during a task when the work evolves."

## Task files vs the agent's internal task list

Keep your own task file in the spec folder, and tell the agent to update it, because agents also keep a private list. David's process writes a to-do file per feature "for posterity": it becomes context for future features and for anyone asking what was done ([31:28](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1888), [31:58](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1918)). The catch is that Bob, like Claude Code, "does maintain its own task list", so he has to prompt it to "update the to-do MD" ([36:21](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2181), [36:53](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=2213)). He repeated the point in episode 3 and suggested putting it in an `AGENTS.md`-style instruction ([1:10:14](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=4214)). For task tracking across several agents, see [coordinating coding agents](/topics/coordinating-coding-agents).

## Does it pay off?

On KillrCtx, the payoff showed up as near one-shot features and a searchable history. David added DataStax AI Workbench support between streams through the same process, and Bob "pretty much one-shot the capability"; the remaining bugs were mostly UX ([6:03](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=363), [6:40](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=400)). The `specs/` folder is now "essentially a database" of every feature's requirements and design ([5:27](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=327)). He also finds it keeps him out of "downward model spirals" where agents loop on themselves ([50:34](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=3034)). A next step he recommends: have Bob maintain a context wiki and update it when a spec changes the architecture ([1:29:18](/episodes/notebooklm-clone-setup-wizard-and-ai-workbench-backend?t=5358)).

## When vibe coding is fine

Vibe coding is fine for small, visual, easily checked changes; specs are for features. In episode 4, [Debugging KillrCtx RAG Backends: OpenRAG vs AI Workbench](/episodes/debugging-rag-backends-openrag-vs-ai-workbench), David fixed a layout from a pasted screenshot and said it was "totally okay to vibe code" a minor adjustment ([21:59](/episodes/debugging-rag-backends-openrag-vs-ai-workbench?t=1319)). The limits show up with vague prompts: in episode 1, a deliberately vague request to align three panel headers only worked once Bob was told the cause (a select component) and to give all three headers the same fixed height ([30:22](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=1822)). David's verdict: "I would argue we just vibe coded that", and exact instructions did "much better" ([33:52](/episodes/killrctx-open-source-notebooklm-clone-with-openrag-and-ibm-bob?t=2032)). And in episode 6, [Astra DB Setup and a Better Record Button with IBM Bob](/episodes/walfly-record-button-redesign-and-astra-db-setup), David noted the record-button redesign would normally have been specified with a designer ahead of time ([12:08](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=728)).

Not everyone works this way. Asked whether he discusses first or lets the agent run, Tejas said: "I just let it do its thing and then correct afterwards" ([7:05](/episodes/walfly-record-button-redesign-and-astra-db-setup?t=425)); in episode 2 he admitted David was "slowly" warming him up to spec coding ([32:36](/episodes/adding-a-mind-map-to-a-notebooklm-clone-with-ibm-bob?t=1956)). Outside critics make the same case more strongly: Böckeler found Spec Kit's Markdown "very verbose and tedious to review" and would "rather review code", and [Marmelab](https://marmelab.com/blog/2025/11/12/spec-driven-development-waterfall-strikes-back.html) argues SDD revives waterfall's big design up front. Small per-feature specs with a review at each step are the show's answer to both. If you only need a quick plan, Bob's plan mode already returns subtasks with IDs, which David called "very similar" to spec coding in episode 5, [IBM Bob Plan Mode: Scoping a Real App MVP, Live](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob) ([29:57](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=1797), [35:06](/episodes/planning-walfly-wearable-app-mvp-with-ibm-bob?t=2106)).
