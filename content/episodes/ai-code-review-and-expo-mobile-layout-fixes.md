---
slug: ai-code-review-and-expo-mobile-layout-fixes
videoId: bkPj3b8icH0
title: "Bob Review vs Xavier and a KeyboardAvoidingView Fix in Expo"
description: "Bob Review and Xavier's /x-review run on the same commits. Then a chat input floating above the iOS keyboard is fixed by removing keyboardVerticalOffset."
tldr: "Tejas and David meant to start chunked audio recording for Walfly, but first finished last week's mobile polish: safe-area insets, title overflow, bottom navigation and a stubborn chat-input keyboard bug. Along the way they ran Bob Review and Xavier's /x-review on the same commits and compared the results. They closed by planning chunking and on-demand hosting for the next episode."
project: walfly
topics:
  [
    "ai code review",
    "agent orchestration",
    "expo",
    "react native safe area",
    "keyboard avoiding view",
    "audio chunking",
    "open source",
    "mobile development with ai agents",
  ]
tools:
  [
    "IBM Bob",
    "Bob Review",
    "Xavier",
    "Expo",
    "React Native",
    "iOS Simulator",
    "CocoaPods",
    "react-native-keyboard-controller",
    "Chrome DevTools",
    "Tavily",
    "RTK",
    "Docling",
    "Daytona",
    "Ollama",
    "Vercel",
    "Render",
    "DigitalOcean",
    "Codex",
  ]
takeaways:
  - "Finish last week's task before starting a new one. The layout bugs Walfly carried into this episode were debt, and fixing them came first."
  - "Tell the agent your exact framework version and ask it to check the web, or it may use patterns from an older Expo SDK."
  - "Review scope depends on configuration. Xavier's default review personas cover correctness, security and performance, so it had nothing to say about the UX issues Bob Review flagged."
  - "Apply review fixes one at a time in separate sessions so each change stays tied to the finding that prompted it."
  - "Mobile Expo work is harder for agents than web work: native keyboard behaviour, safe areas and native-only packages break in ways a web build never shows."
  - "Reading the code yourself can beat another prompt. Commenting out one keyboardVerticalOffset line fixed a bug that several agent rounds had not."
  - "Check a review against what you already know. A later review told the team to add back the exact prop they had just removed to fix a bug."
faq:
  - q: "How do you fix safe-area inset issues in an Expo app?"
    a: "In the episode, Tejas and David asked Bob to fix safe-area insets across the whole app layout and to search the web for the current approach for their Expo SDK version (57). Naming the version was deliberate, because otherwise the agent might use a pattern from an older SDK. After the fix, the header no longer collided with the status bar and clock on iOS."
  - q: "Why is the chat input floating too high above the keyboard in React Native?"
    a: "In Walfly's chat screen, the cause was a KeyboardAvoidingView with keyboardVerticalOffset set to the top safe-area inset, which added extra space on top of the keyboard. Commenting out that single line made the input sit directly on the keyboard. Several agent attempts, including switching to a KeyboardStickyView, did not fix it before that manual change."
  - q: "What is the difference between Bob Review and Xavier's /x-review?"
    a: "Both reviewed the same recent commits. Bob Review ran in the IDE, used a sub-agent and listed 'Bob findings' with a one-click 'Fix with Bob' action; it flagged several viewport and keyboard visibility issues. Xavier's /x-review sent sub-agents called remoras through its default correctness, security and performance personas and found nothing actionable, mostly because none of its personas covered UX."
  - q: "What is Xavier for coding agents?"
    a: "Xavier (xavier.team) is an AI agent orchestrator made by Atila: a collection of skills you use inside your coding agent. /x-learn sends sub-agents called remoras to map a codebase's architecture, decisions and dependencies and saves the notes to a knowledge vault in ~/.xavier; /x-grill and /x-prd interview you before writing a PRD; /x-loop executes the resulting tasks; and /x-review runs persona reviewers over your changes. Tejas also described it as a kind of meta harness that keeps context when you switch between agents."
  - q: "Why is mobile Expo development hard for AI coding agents?"
    a: "David noted that Bob handles web apps well, but mobile iOS Expo work is 'a different beast'. Keyboard behaviour, safe areas, native-only packages that break the web build, and CocoaPods reinstalls all made the chat-input fix take far longer than expected. Tejas pointed out that a model trained specifically for mobile development exists, but Bob doesn't let you choose the model."
  - q: 'What is "Fix with Bob"?'
    a: "It is the one-click action on each item in the Bob Findings panel after a Bob Review in the IBM Bob IDE. Clicking it has Bob apply the fix for that finding. In this episode David applied the findings one at a time, each in its own session, so every change stayed tied to the finding that prompted it."
  - q: "Can you choose which model IBM Bob uses?"
    a: "Not in this episode. Tejas pointed to Apex, a model trained specifically for mobile app development and available on Hugging Face, and noted that this is where Bob falls short because it doesn't let you choose the model."
  - q: "Should you trust AI code review output?"
    a: "Check it against what you already know. A later review in this episode told the team to re-add the exact keyboardVerticalOffset prop they had removed to fix the keyboard bug. Tejas said that made him question all the other review points."
  - q: "Does KeyboardStickyView from react-native-keyboard-controller work with Expo web?"
    a: "Not in Walfly's case. Installing it meant reinstalling CocoaPods, and it broke the web build because the package is native-only. On mobile it also pushed the chat input below the visible screen, because KeyboardStickyView moves the view with translateY."
---

Episode 9 of Building with Bob, part 5 of the [Walfly](/projects/walfly) build, was supposed to start chunked audio recording. It turned into a full session of mobile polish and a direct comparison of two AI code reviewers: IBM Bob's built-in code review (Bob Review) and the `/x-review` command of [Xavier](https://xavier.team). By the end, the Expo app's layout was solid, one keyboard bug had been fixed by reading the code, and the plan for chunking and hosting was set.

This follows [episode 8](/episodes/local-first-transcription-python-sidecar-and-coordinating-agents), where the team upgraded Expo and restyled the app. Since then, David had carried the new styling through the moments section, so recording now works on both web and mobile.

## Why keep building Walfly after Apple's meeting-notes feature?

Walfly stays worth building because it's open source and runs locally, while Apple's version lives inside a closed ecosystem. Tejas had watched Apple's keynote, where an Apple Watch feature listens passively and uses Apple Intelligence to produce meeting notes, summaries and highlights ([3:18](?t=198)). It also keeps a rolling buffer of the last few minutes, so you can ask Siri what a waiter just said at a restaurant ([7:02](?t=422)).

Tejas argued the show's audience never really wanted a finished product. Developers want to see how it's built:

- **Open source:** a "how the sausage is made" example anyone can read and run.
- **Local-first:** you don't have to trust a company with your meetings.
- **Privacy:** David compared it to why people run local models with Ollama.

## How should real-time chunked transcription work?

The goal is to cut audio into chunks while recording and process each chunk right away, so the app can show near-real-time updates instead of transcribing a 30-minute file at the end ([8:04](?t=484)). David pointed out that this is close to Apple's "what did they just say?" example, and that the need for fast updates should set the chunk length. The open question was whether chunks should be 30 or 60 seconds ([8:43](?t=523)).

There's also a performance reason. During the previous episode's long recording, David's laptop overheated and shut down while it recorded and processed the whole file at once ([24:10](?t=1450)).

## What is Xavier and how does it orchestrate agents?

Xavier is an AI agent orchestrator: a collection of skills that you can use inside your coding agent of choice ([10:26](?t=626)). It is made by Atila, Tejas's friend and former teammate, who dropped into the live chat during the stream. We cover how it fits with Beads and MCP Agent Mail in [coordinating coding agents](/topics/coordinating-coding-agents). Its main commands, as described on the show:

1. **Learn (`/x-learn`).** Xavier studies your codebase with research sub-agents that map its architecture, decisions and dependencies. For Walfly it correctly identified a monorepo and set up a team around the project ([10:57](?t=657)).
2. **Grill, then PRDs.** It wraps Matt Pocock's "grill me" skill (`/x-grill`), so it asks you questions until it understands the project, then takes PRDs (`/x-prd`) and builds from them. David's setup also used this interview to pick the review personas.
3. **Orchestration.** David described its "shark" approach: a central orchestrator hands work to concurrent sub-agents called remoras, and each persona or research task gets its own, one looking at architecture, another at dependencies and so on ([12:41](?t=761)).
4. **Vault.** Findings go into a knowledge vault of Markdown notes in `~/.xavier`, so later reviews can compare changes against the known architecture ([13:19](?t=799)).
5. **Review (`/x-review`).** Its default review personas are correctness, security and performance ([40:18](?t=2418)).

David's larger hope is that coding assistants eventually build this kind of coordination in themselves:

> Being able to maintain, say, file locks — "hey, I'm going to work on this, I'm on these areas, don't touch this at the same time, we don't want to clobber each other" — is even more important with agents, because they work so much faster. — David ([15:04](?t=904))

Tejas asked whether Xavier had made Bob better. David's honest answer was that it's too early to say ([16:10](?t=970)). Tejas added that the "meta harness" idea matters when you switch agents. He had recently moved to Codex and lost context that the old agent had built up (see [how IBM Bob compares with other coding agents](/topics/ibm-bob-vs-claude-code-cursor-codex)). A tool that keeps PRDs, reviews and learned knowledge can carry that over ([18:39](?t=1119)).

## Fixing Walfly's safe-area insets in Expo

The first fix was asking Bob to correct the safe-area insets across the whole app layout. Tejas also told it to search the web for the current approach for the project's Expo SDK version ([21:19](?t=1279)). Otherwise, as he put it, Bob might use a pattern from an older SDK. They checked `package.json`, confirmed Expo SDK 57, and put that in the prompt ([21:52](?t=1312)).

> I think it's important that we finish the task from last week. — Tejas ([20:47](?t=1247))

The result was a clear improvement: the moments header stopped colliding with the iOS clock ([25:43](?t=1543)). Next came a small batch of polish:

- **Truncate overflowing titles** with ellipses, starting with the chat tab title ([26:16](?t=1576)).
- **Move web navigation to the bottom** for thumb reach.
- **Edit by hand when it's faster.** Bob's ellipsis didn't help, so Tejas suggested searching for "Chat with your recordings" and changing the title prop to "chat" directly. David then lowercased it to match "moments" and "walfly" ([30:02](?t=1802), [31:08](?t=1868)).

Along the way, David explained that RTK compresses git output into something more agent-friendly, which cuts token use ([29:26](?t=1766)). The team also noticed a subtle green animation when a recording finishes, which Bob had added without being asked.

## Bob Review vs Xavier's /x-review on the same commits

Both reviewers looked at the same last three commits. IBM Bob's code review found real UX issues and listed them as Bob Findings; Xavier's `/x-review`, running its three default personas (correctness, security and performance), found nothing actionable. David started Xavier's review on the commits and Tejas suggested running Bob Review in parallel ([33:51](?t=2031)).

Bob asked for approval several times because Xavier's vault lives in `~/.xavier` in David's home directory, outside the workspace. David called that Bob's "security-first" design ([35:30](?t=2130)).

|                   | Bob Review                                                                                     | Xavier `/x-review`                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Where it runs     | Built into the Bob IDE, using a sub-agent                                                      | Skill invoked from the agent, sending remoras through personas                             |
| Output            | "Bob findings" list with a "Fix with Bob" action per item                                      | Findings grouped by severity with a proposed plan                                          |
| Focus in this run | Defaults, including UX                                                                         | Correctness, security, performance (David kept the defaults and chose a balanced approach) |
| Result            | Several viewport and keyboard visibility warnings, plus a note about a hard-coded magic number | "Nothing actionable," zero bugs ([37:44](?t=2264))                                         |

Tejas scored this round for Bob because it flagged things that deserved warnings. David pushed back that the comparison wasn't fair: Xavier had no UX persona, so maybe it should ship with one by default ([39:35](?t=2375)). Both agreed that the habit matters more than the tool: review right after each set of changes.

David then applied Bob's findings with "Fix with Bob" one at a time, each in its own session. He wanted every change tied to the finding that prompted it so fixes wouldn't get mixed together ([48:51](?t=2931)). There's more on Bob Review and Fix with Bob in [IBM Bob features in practice](/topics/ibm-bob-features-in-practice).

## Why is there extra space above the keyboard? Remove keyboardVerticalOffset={insets.top}

The chat input floated too high above the iOS keyboard because the `KeyboardAvoidingView` in `ChatScreen.tsx` had `keyboardVerticalOffset` set to the top safe-area inset, which added extra padding on top of the keyboard. It was the hardest bug of the episode, and the fix turned out to be deleting one line. The first test after the review fixes showed that the last item in the moments list was still hidden under the tab bar, which one finding had claimed to fix ([41:53](?t=2513)). Opening the software keyboard in the simulator then showed far too much space between the keyboard and the input ([43:21](?t=2601)).

Here is how it went:

1. **Specific prompt with screenshots.** The input should "nestle nicely on top of the keyboard" to leave as much room as possible for the conversation. Spacing improved, but the input now visibly jumped into place.
2. **"Search the web."** Bob first said it knew the answer "from first principles" ([54:36](?t=3276)). When pressed, it drove Chrome to search and read the React Native docs. Tejas noted that a proper search tool, such as a Tavily API key, would make this smoother ([55:57](?t=3357)).
3. **KeyboardStickyView.** Bob proposed a sticky keyboard view and installed a package for it ([56:29](?t=3389)). That meant reinstalling CocoaPods, and it broke the web build because the package is native-only ([1:00:06](?t=3606)). Asking Bob to run `npm run build` and fix errors until it passed got things working again. The monorepo had been part of the confusion.
4. **The input disappeared.** On mobile, the input now sat below the visible screen because the sticky view moves it with `translateY` ([1:03:39](?t=3819)).
5. **Under the tabs.** Once it was back, the input was hidden behind the tab bar. David told Bob to reuse the approach from the moments-list fix ([1:09:29](?t=4169)).
6. **Read the code.** Tejas opened `ChatScreen.tsx`, found the `KeyboardAvoidingView` with `keyboardVerticalOffset` set to `insets.top`, and had David comment out line 69. It worked immediately ([1:13:59](?t=4439)), and the line was then deleted.

```tsx
// Before (ChatScreen.tsx): extra space between the input and the keyboard
<KeyboardAvoidingView
  keyboardVerticalOffset={insets.top}
>

// After: the prop is removed and the input sits on the keyboard
<KeyboardAvoidingView>
```

The snippet is trimmed to the relevant prop; the only change made on stream was removing `keyboardVerticalOffset`.

They then asked Bob, without making changes, what it could have done better ([1:15:42](?t=4542)).

> Something you thought was going to take five minutes ends up taking you a half day, and you're like, how did that possibly take a half day? — David ([1:07:38](?t=4058))

## Why is mobile Expo development hard for AI agents?

Mobile Expo work involves native behaviour that doesn't show up in web development, so agents that do well on web apps struggle more. David said Bob "does really well" on web apps, but "the second you go into mobile iOS Expo stuff, it's a different beast" ([52:52](?t=3172)).

Tejas mentioned a model called Apex that is trained specifically for mobile app development and available on Hugging Face. The catch is that Bob doesn't let you choose your model ([53:22](?t=3202)). David also suspected that part of the problem was fighting how iOS handles the keyboard, not a single bug.

## When the reviewer is wrong

A second review after all the fixes showed why you should check review output yourself. Its third point told them to add back the exact prop they had just removed to fix the keyboard bug ([1:20:49](?t=4849)).

> Number three is the exact thing that we removed to fix the issue, and so it's saying reintroduce that problematic prop. This then makes me question all the other review points. — Tejas ([1:20:49](?t=4849))

Tejas's verdict was blunt: "the review sucks," and "Xavier was right, actually" ([1:21:21](?t=4881)). The result from earlier in the episode was reversed.

## Planning audio chunking, hosting and the roadmap

With the app working, the remaining gaps are long recordings and a backend that doesn't depend on a laptop. (Our [audio chunking guide](/topics/audio-chunking) pulls together where this design ended up.) Tejas wanted to use Walfly at a conference the next day. David pointed out that there's still no chunking and no hosted service, so the phone would have to connect to a laptop ([1:16:55](?t=4615)).

The hosting discussion ([1:18:18](?t=4698)):

- **Vercel** is out, because the transcription service needs a long-running server.
- **Render or DigitalOcean** would work but add pricing complexity.
- **Daytona** is the current favourite. It spins up an on-demand sandbox, runs Docling ASR, saves the result and throws the container away ([1:18:54](?t=4734)).

Smaller items for the backlog:

- Make the "all moments" badge open a filter so you can chat with a selected subset of moments ([1:21:53](?t=4913)).
- Improve the pending-message UI with shimmering dots or a braille-style animation instead of an empty bubble ([1:23:03](?t=4983)).
- Add a fade-in transition on web to match iOS.

## What's next

The plan is to split the work: David builds chunked recording while Tejas sets up on-demand Daytona hosting for transcription, both in the same stream ([1:19:44](?t=4784)). Episode 10, [Designing audio chunking and ephemeral ASR](/episodes/designing-audio-chunking-and-ephemeral-asr), picks up there. Follow the whole build on the [Walfly project page](/projects/walfly).
