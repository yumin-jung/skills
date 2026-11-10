# House style

Every candidate follows these rules, so a team's posters read as one series. The rules live here; the classes that implement them live in `assets/style.css`; complete pages live in `assets/examples/`.

## Look

- **Canvas**: `.page` is 1600 px wide. Height by class: `.short` 800, `.wide` 900, default 1000, `.a4` 1131, or an inline height between 760 and 1131. Renders at 2× (3200 px wide).
- **Monochrome**: ink `#1a1a1a`, the grays in `style.css`, white. Emphasis comes from weight, size, fill, and position, so the page carries no color, gradients, shadows, emoji, or decorative icons.
- **Type**: Pretendard (loaded by `style.css`). Eyebrow 15, title 38–46 bold, dek 18, section heading 21, box title 22–24, body 16–18, captions and footer 14. Nothing under 13: teammates first see the page about 800 px wide, where 14 px reads as 7. When text does not fit, cut words or a block, or take a taller canvas; type keeps its size.
- **Lines carry meaning**, the same meaning everywhere on the page:
  - solid 2 px border: decided, included, exists
  - dashed: undecided, excluded, optional, future
  - gray fill: a boundary or context (a machine, a phase that happens once)
  - black fill: emphasis (the included list's header, a "chosen" or "new" tag)
  - black numbered circle: reading order, referred to in text as ① ② or "step 2"
  - 2 px rule under the header, 1.5 px under section headings, 1 px light rule between rows
- **Grid**: 64 px side margins, 24–36 px between blocks, every edge aligned. Boxes hold their text with room to breathe and no more; a box should be at least about 40% text. Boxes side by side start their titles on one line.
- **Full canvas**: content runs close to the footer. Close an empty band by giving the main visual larger type and spacing, adding a genuinely useful block, or choosing a shorter canvas; boxes keep their natural height.

## Copy

- **Headline** = the conclusion, decision, or answer: "B reads receipts more accurately than A on all four sets", "This release: shared link → read-only page", "Who does what: sign-up in 3 steps, export in 4". For an explainer: "**Name** — what it is".
- **Eyebrow** = topic · setting or scope · source (PR, run, meeting) · date.
- **Dek** = 1–2 sentences that add what the headline leaves out: the deciding numbers as "from → to", a condition, or a caveat. Explain the page only where its marks cannot be guessed (what gray or dashed means), in one clause; the layout shows the reading order.
- **Labels** are short noun phrases in plain words. One idea per line, up to 4 lines per box, one term per thing across the page. Shortening keeps the fact's qualifiers (most, up to, etc.) and its actor, and adds no framing the sheet lacks (calling something a cost or a risk).
- **Once**: each fact appears in one place on the page; only the header's point (headline and dek) comes back in the body.
- **Numbers** carry units, share precision within a series, and bind to their unit with a non-breaking space (`2,140&nbsp;MB`). The winning value is bold.
- **Footer** = method, sample, conditions, caveats, source, in small gray text. Plans can use one plain line.
- **Language**: write in the fact sheet's language. Korean and other CJK text keeps `word-break: keep-all`; labels end as noun phrases ("~함", "~음" or bare nouns), the dek uses plain "~다" sentences, and "·" joins short phrases. Fix a lonely last word by rewording.

## Charts and tables

- **Bars** compare: label column on the left (bold name, gray condition under it), the value printed at the end of each bar, baseline series light gray (`.bar`), focus series black (`.bar.s3`), a third series mid gray (`.bar.s2`). Set `--v` and `--max` on each bar; share one `--max` per section unless rows have different units.
- **Legend** sits top-right of its section; the subtitle names the unit and direction ("%, lower is better").
- **Dot plots** show where a difference comes from; **tables** hold categorical facts with numbers right-aligned; the recommended row gets `.rec` and a black tag.

## Diagrams

- **Boxes** are things (systems, people, files); **arrows** are actions or data, labeled on top (what or protocol) and under (constraint). `.arrow.both` for request and response.
- **Boundaries** are `.group`s with their property on the right of the header (always on, read-only, one container).
- Up to 5 boxes in a row and 3 levels of nesting. Numbered circles follow reading order: left to right, top to bottom.

## Components

| Class | Use |
|---|---|
| `.page` `.short` `.wide` `.a4` | canvas |
| `.eyebrow` `.title` `.title-row` `.meta` `.dek` `.rule` `.footer` `.footer.plain` | header and footer |
| `.content` | the block between header and footer |
| `.sec-h` `h2` `.sub` `.sec-ruled` | section heading, with or without a rule |
| `.grid-2` `.grid-3` `.grid-4` `.divided` `.row` `.stack` | layout |
| `.box` `.box.dash` `.box.soft` `.box.tight` `.group` `.group-h` | boxes and boundaries |
| `.dash-list` `.en-list` `.steps` `.num` `.num.sm` `.num.lg` `.num.line` | lists and step numbers |
| `.tag` `.tag.line` `.tag.dash` `.tag.mute` `.pill` `.pill.dash` `.check` | markers |
| `.link` `.arrow` `.arrow.both` `.arrow.dash` `.arrow-down` `.to` | connectors |
| `.lanes` `.ph` `.band` `.actor` `.cell` `.card` `.card.dash` | swimlane |
| `.legend` `.bars` `.lab` `.vals` `.bar` `.s2` `.s3` `.best` | bar chart |
| `.dots` `.track` `.seg` `.dot` | dot plot |
| `.tbl` `.n` `.rec` | table |
| `.in` `.out` `.hd` `.cols` | scope lists |
| `.flow` `.stage` `.split` | stages |
| `.kpis` `.kpi` `.timeline` `.tl` `.next` `.later` | key numbers and timeline |
| `.path` `.code` `.label` `.mono` `.defaults` | paths, snippets, defaults row |

## Render brief

For render subagents.

1. Read this file, your format's recipe in `<skill>/FORMATS.md`, `<skill>/assets/style.css`, the fact sheet, and the matching example in `<skill>/assets/examples/`: open its `.png` to see the target look and its `.html` to see how the components build it.
2. Write `index.html` in your candidate folder: `<link rel="stylesheet" href="../../style.css">` and one `<div class="page ...">` holding the header, a `.content` block, and the footer. Build from the components; a short `<style>` block is for layout specific to this page. Every word and number comes from the fact sheet.
3. Render: `node <skill>/scripts/render.mjs index.html --facts <run>/fact-sheet.md`. It writes `page.png` and `lint.json` and prints the issues and any numbers missing from the fact sheet.
4. Open `page.png` and run the visual self-check below. Fix what lint and the check found, then render again, up to 4 renders.
5. Reply with the format, headline, canvas, lint status, and anything still unfixed.

Completion criterion: lint is clean, every printed number traces to the fact sheet, and every self-check item passes; otherwise the reply lists what does not.

## Visual self-check

Look at the PNG at full size, then as it would appear 800 px wide in a chat thread.

- The headline and the main visual read first, and the reading order is obvious.
- Every label and number is legible at 800 px; no text touches a border or sits on a line.
- Edges align, gaps are even, boxes are filled with text rather than air, and no empty band sits above the footer.
- Solid, dashed, gray, and black mean the same thing everywhere on the page.
- Numbers match the fact sheet, carry units, and the winning values are bold.
- Every claim traces to the fact sheet with its qualifiers, and each fact appears once.
