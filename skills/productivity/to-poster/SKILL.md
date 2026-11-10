---
name: to-poster
description: Turn an architecture, plan, release scope, or benchmark into a one-page image for teammates. Renders about 12 distinct candidates in a monochrome house style with subagents, scores them with a judge panel, and puts the best 8 on a board for you to pick; exports PNG and PDF.
disable-model-invocation: true
---

# To Poster

A **poster** is a single image that lets a teammate who missed the discussion get the point in ten seconds: what was decided, how the parts connect, or which option won. Make many **candidates**, let a **panel** of judge subagents score them, and put the best on a **board** for the user to pick.

Vocabulary:

- **Fact sheet**: the only facts a candidate may use. Format in [FACT-SHEET.md](FACT-SHEET.md).
- **Format**: the visual grammar that carries the facts (architecture, swimlane, comparison, scope, decision, timeline, key numbers). Catalog in [FORMATS.md](FORMATS.md).
- **Concept**: a format, a headline, and a section plan, before rendering.
- **Candidate**: one rendered concept, an HTML page and its PNG.
- **Panel**: judge subagents with distinct roles. Roles and scoring in [JUDGES.md](JUDGES.md).
- **House style**: the look and copy rules every candidate follows. In [STYLE.md](STYLE.md).

`<skill>` is the folder holding this file (`${CLAUDE_SKILL_DIR}` in Claude Code). `<run>` is the folder the user names, or `to-poster/<slug>-<YYYYMMDD-HHMM>/` under the OS temp directory; give the user its absolute path. Needs Node 22+ and Chrome, Chromium, or Edge.

## Process

### 1. Write the fact sheet

Collect the facts from the conversation and from the PRs, docs, data, or links the user points to. Write `<run>/fact-sheet.md` in the FACT-SHEET.md format, then show it and wait for corrections. A finished fact sheet handed over by the user counts as confirmed.

Completion criterion: every number has a unit and a source, audience and purpose are set, the quiz has 3–5 questions with answers, and the user confirmed.

### 2. Brainstorm concepts

Copy `<skill>/assets/style.css` to `<run>/style.css`. Spawn the four brainstorm subagents from FORMATS.md § Brainstorm in parallel, one per lens, with this prompt: "Read `<skill>/FORMATS.md` § Brainstorm and follow it. Lens: `<lens>`. Fact sheet: `<run>/fact-sheet.md`. Write your JSON to `<run>/brainstorm/<lens>.json`."

Merge the 16. Two concepts are duplicates when swapping their headlines would go unnoticed; keep the stronger one. Pick 12 by the **mix rule**: at most 2 per format, and as many formats as the facts genuinely support (aim for 4 or more), preferring concepts whose format fits per FORMATS.md. Give them letters A–L and write `<run>/concepts.json` as `{"concepts": [{"id": "A", ...concept}]}`.

Completion criterion: `concepts.json` holds 12 concepts, or fewer with the reason stated (the facts support fewer distinct ones).

### 3. Render candidates

Spawn one render subagent per concept, all in parallel, with this prompt: "Read `<skill>/STYLE.md` § Render brief and follow it. Skill folder: `<skill>`. Concept: entry `<id>` in `<run>/concepts.json`. Fact sheet: `<run>/fact-sheet.md`. Write `<run>/candidates/<id>/index.html`."

Completion criterion: every candidate folder has `page.png` and a clean `lint.json`, or its subagent reported what it could not fix.

### 4. Judge

Spawn the panel in parallel as JUDGES.md describes: one fact checker per 4 candidates, one reader, one designer, one decider. Give each judge the PNG paths in a different order (rotate the list by one position per judge) and nothing about concepts or authorship. Then grade the reader's answers into `judging/quiz.json`.

Fix pass: send each candidate with fact errors back to a render subagent once, with its error list, and re-check it with a fact checker.

Completion criterion: `<run>/judging/` holds fact, reader, designer, decider, and quiz results covering every rendered candidate.

### 5. Show the board

Run `node <skill>/scripts/board.mjs <run>`. It scores the candidates, picks the shortlist (up to 8, at most 2 per format), and writes `shortlist.json` and `board.html`. Open the board (`open` on macOS, `xdg-open` on Linux, `start` on Windows), give its path, and ask which number to keep and what to change.

Completion criterion: the user named a candidate.

### 6. Polish the pick

Spawn one render subagent with this prompt: "Read `<skill>/STYLE.md` § Render brief and follow it, editing `<run>/candidates/<id>/index.html` in place. Skill folder: `<skill>`. Fact sheet: `<run>/fact-sheet.md`. Changes: `<the user's comments>`; `<the designer's top_issue for this candidate>`. Render with `--pdf`." Copy `page.png` and `page.pdf` to `<run>/final/<slug>.png` and `.pdf` and give the user both paths. Repeat for further comments.

Completion criterion: the final PNG and PDF exist and the user has their paths.

## Smaller runs

When the user asks for a quick run: two lenses (Absent teammate, Decider), 6 renders, and the panel without the decider. The board shows every candidate.
