# Fact sheet

The single source of truth for every candidate. Subagents never see the conversation: what is not written here does not exist for them, and what is written here is all they may show.

## Format

```md
# <topic>

- Audience: <who reads it, and what they already know>
- Purpose: <what the reader should know or decide after ten seconds>
- Language: <ko | en | ...>  (all copy is written in this language)
- Date: <YYYY-MM-DD> · Source: <PR, doc, benchmark run, meeting>
- Key messages: <2-3 candidate one-line conclusions>

## Facts
1. <one fact per line, in plain words> (source)
2. ...

## Numbers
| What | Value | Unit | Condition |
|---|---|---|---|
| Error rate, lectures, Engine A | 5.5 | % | lower is better |

## Decisions
- <what was decided> (who, when)

## Open
- <what is not decided yet>

## Out of scope
- <what is excluded> (next release | later | not doing)

## Quiz
1. <question a reader should answer from the image alone> → <answer>
```

## Rules

- **Exact values** with units, as the source states them. Copy may round; the sheet keeps the source value.
- **Numbered facts**: concepts cite them by number, and fact checkers trace every claim back to one.
- **Precise relations**: "the router opens a session over a socket", not "the router and sessions are connected". Direction and verb matter for arrows.
- **Open is not decided**: anything still being decided goes under Open, so no candidate draws it as settled.
- **Quiz**: 3–5 questions whose answers sit in the facts and that a good poster makes obvious (the decision, the winner, the order, the main number). The reader judge sees only the questions.
- Leave out what does not serve the purpose: the sheet is a brief, not a transcript.
