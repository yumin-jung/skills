# Formats

A format is the visual grammar that carries the facts. Pick by what the facts are, not by variety. Each recipe names the components (classes in `assets/style.css`, described in STYLE.md) and an example page in `assets/examples/`. A candidate may borrow a block from another format, but one format dominates; that is the format it is filed under.

## architecture

Use when the point is how parts connect: services, machines, data flow, permissions.

Recipe: title row with "**Name** — what it is" and a gray right-side meta line, then the rule. Main row, left to right: who or what starts things (a `.box` with a dash list) → `.link` connector → the boundary (`.group`, gray, with its property in the header) holding 2–4 component boxes joined by `.arrow`s → `.link` → external systems stacked as boxes, each with its access level in gray. Below: `.grid-3.divided` of `.sec-ruled` columns, typically "one request, start to finish" (numbered `.steps`), safeguards, operations.

Example: `assets/examples/architecture.html`. Avoid unlabeled arrows, more than 5 boxes in a row, and boxes stretched taller than their text needs.

## swimlane

Use when the point is who does what, in which order, across 3 or more actors: setup and onboarding flows, request lifecycles, hand-offs.

Recipe: eyebrow, then a question-and-answer title ("Who does what: setup in 2 steps, use in 5"), a dek that says what the gray band and a dashed card mean and adds the one condition the title leaves out, the rule. `.lanes` with a phase header row (a `.band` for the one-time phase), one row per actor (name plus gray sublabel), and numbered `.card`s placed in (actor, column) cells; a dashed card marks a step still being decided. Optional detail row for the one step that needs it (cards with label, path, tag, code).

Example: `assets/examples/swimlane.html`. Avoid more than 7 columns, cards over 2 lines, and numbering that fights the reading order.

## comparison

Use when numbers decide between options: A vs B, before vs after, engines, vendors, plans.

Recipe: eyebrow (what · setting · sample · date), the verdict as title ("B is more accurate than A on all four sets"), a dek with the 2–4 deciding numbers as "from → to", the rule. `.grid-2` of numbered sections: bars for quality, bars for cost or speed, a table for categorical facts (support, limits), a dot plot for where the difference comes from. Legend top-right of each section, unit and direction in its subtitle. Footer: method, sample, conditions, caveats.

Example: `assets/examples/comparison.html`. Avoid bars without values, mixed units on one axis, and more than 3 series.

## scope

Use when the point is what ships now and what does not: release plans, MVP cuts, phase boundaries.

Recipe: title "This release: A → B", a gray line of constraints and the deciding quote, then a `.flow` of 2–4 numbered `.stage`s joined by `.to` arrows (a dashed `.pill` note under a stage for the hand-off). Below: the `.in` list (black header, check marks) beside the `.out` box (dashed, one column per "next release / later / not doing" with `.tag.line`, `.tag.dash`, `.tag.mute`). A `.defaults` row of pills for the settled defaults. One-line plain footer.

Example: `assets/examples/scope.html`.

## decision

Use when options were weighed and one was chosen.

Recipe: eyebrow, the decision as title, a dek with the deciding numbers, the rule. Option boxes side by side: the chosen one solid with a 3px border and a black tag, the others dashed with a muted tag; 3–4 bullets each, plus a cost or effort line when the fact sheet states one. Below: the expected effect as `.kpis` and the next steps as a `.timeline`, each when the sheet has them.

Example: `assets/examples/decision.html`.

## timeline

Use when the point is phases over time: roadmaps, migrations, incident sequences.

Recipe: title saying where things stand or when they land; a `.timeline` with done (filled), next (outlined), and later (dashed) markers; a box or short list per phase; a row of risks or dependencies. Components as in `assets/examples/decision.html`.

## key numbers

Use when 2–4 metrics carry the message: launch results, cost changes, adoption.

Recipe: title stating the headline metric; `.kpis` with the value large and its "from" value under it; supporting bars or a table below; footer with metric definitions. Components as in `assets/examples/comparison.html` and `decision.html`.

## Fit

- No comparison without numbers to compare.
- No swimlane with fewer than 3 actors: a `.flow` or scope page tells it better.
- No architecture for a sequence of steps: that is a swimlane.

## Brainstorm

Brief for brainstorm subagents. Read the fact sheet and this file, then propose 4 concepts through your lens: 3 that fit best, and 1 long shot (an unusual format choice that still tells the truth).

Lenses, one per subagent:

- **Builder**: the engineer who will build or run it; wants mechanisms, boundaries, exact names.
- **Absent teammate**: missed every discussion; wants the point first and an obvious reading order.
- **Decider**: the lead who approves; wants the decision, the trade-off, the cost, and what happens next.
- **Storyteller**: wants the single strongest visual idea, even if it is not the obvious format.

Rules: the headline states the conclusion, not the topic; every section cites the fact numbers it shows; use only the fact sheet; write in its language.

Write this JSON to the path you were given, and reply with that path:

```json
{"concepts": [{
  "format": "architecture | swimlane | comparison | scope | decision | timeline | key numbers",
  "headline": "the conclusion as the reader should remember it",
  "dek": "1-2 sentences: what the headline leaves out (key numbers, a condition, what gray or dashed means)",
  "canvas": "short | wide | default | a4",
  "sections": [{"title": "...", "shows": "what is drawn and how", "facts": [3, 4]}],
  "why": "one sentence: why this format fits these facts",
  "long_shot": false
}]}
```
