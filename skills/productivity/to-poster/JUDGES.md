# Judges

Each judge is a subagent with one role. Judges see candidate PNGs labeled by letter, in an order rotated per judge, and never the concepts, brainstorm notes, or who rendered what: models favor their own output and whatever comes first. Each judge writes its JSON to `<run>/judging/<role>.json` (fact checkers: `fact-1.json`, `fact-2.json`, ...; a later file overrides an earlier one for the same candidate). Free-text fields are written in the fact sheet's language, because they appear on the board the user reads.

## Fact checker

Inputs: the fact sheet, up to 4 candidate PNGs, and each candidate's `lint.json` (`unknownNumbers`).

Read every label, number, arrow, and claim. Flag each one the fact sheet does not support: a number that differs, a relation drawn wrong (arrow direction, who calls whom), something open shown as decided, a dropped qualifier (most, up to, etc.) that makes a claim broader than the sheet, an invented detail or framing (calling something a cost the sheet never calls one). Rounding is fine when the value is still correct to the shown precision.

```json
{"judge": "fact", "results": [{"id": "A", "errors": [{"where": "section 2, second bar", "says": "97×", "sheet": "97.4×", "fix": "show 97.4×"}]}]}
```

An empty `errors` list is a pass.

## Reader

Inputs: all candidate PNGs and the quiz questions, without answers and without the fact sheet.

Persona: a teammate who missed every discussion, glancing at each image for ten seconds in a chat thread. For each candidate: the one-sentence takeaway, an answer to each quiz question from the image alone ("can't tell" is allowed), clarity from 1 to 5 (5: understood at a glance), and the most confusing spot.

```json
{"judge": "reader", "results": [{"id": "A", "takeaway": "...", "answers": ["...", "..."], "clarity": 4, "confusing": "..."}]}
```

## Designer

Inputs: all candidate PNGs and STYLE.md.

Score each candidate from 1 to 5 on:

- **hierarchy**: the headline and main visual read first; the reading order is obvious
- **layout**: aligned edges, even spacing, a full canvas without crowding or hollow boxes
- **legibility**: readable at 800 px wide; nothing clipped or touching
- **style**: follows the house style; line meanings stay consistent

Add `best` (one phrase) and `top_issue` (the single change that would help most). Use the whole scale (3 is acceptable, 5 ships as is) and compare candidates with each other.

```json
{"judge": "designer", "results": [{"id": "A", "hierarchy": 4, "layout": 3, "legibility": 5, "style": 4, "best": "...", "top_issue": "..."}]}
```

## Decider

Inputs: all candidate PNGs and the fact sheet's Audience, Purpose, Decisions, and Open sections.

Persona: the lead who has to act on this. Score from 1 to 5: after ten seconds, does the page deliver what the Purpose promises? Measure against the Purpose: when it asks how something works, I can trace the path and see what is blocked; when it asks what was decided, I see the choice, its cost or risk, and what happens next. A page that is clear about something the Purpose does not ask for scores 3 at most. Add `missing`: the one thing I would still have to ask.

```json
{"judge": "decider", "results": [{"id": "A", "score": 4, "missing": "..."}]}
```

## Quiz grading

The orchestrator counts, per candidate, the reader's answers that match the fact sheet's quiz answers in meaning, and writes `judging/quiz.json`:

```json
{"A": {"correct": 3, "of": 4}}
```

## Scoring and shortlist

`scripts/board.mjs` computes, per candidate:

- reader = 0.7 × quiz share + 0.3 × (clarity − 1) / 4
- designer = (mean of the four scores − 1) / 4
- decider = (score − 1) / 4
- total = 0.4 × reader + 0.3 × designer + 0.3 × decider

Candidates with remaining fact errors stay off the board. The shortlist takes the highest totals, at most 2 per format, up to 8.
