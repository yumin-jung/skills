# Skills I Use

[![skills.sh](https://skills.sh/b/yumin-jung/skills)](https://skills.sh/yumin-jung/skills)

Every agent skill I actually use, in one place: the ones I wrote, and the ones I borrow from other authors. Borrowed ones stay in their authors' repos as git submodules under `vendor/`, so this repo points at the original instead of forking it. Structured after [mattpocock/skills](https://github.com/mattpocock/skills).

These skills are designed to be small, easy to adapt, and composable. They work with any model. Hack around with them. Make them your own. Enjoy.

## My setup

Clone with submodules, then link the whole set into your agents:

```bash
git clone --recurse-submodules https://github.com/yumin-jung/skills.git
cd skills && ./scripts/link-skills.sh
```

`link-skills.sh` symlinks every skill in `skills/`, plus the third-party ones I've whitelisted in the script, into `~/.claude/skills` (Claude Code) and `~/.agents/skills` (Codex and other Agent Skills-compatible harnesses). Symlinks, not copies — so a pull is the update. One line brings everything current: my skills, the authors' latest, and anything else [skills.sh](https://skills.sh) installed globally.

```bash
git pull && git submodule update --remote && ./scripts/link-skills.sh && npx skills@latest update -g -y
```

## Install my skills

Only what's in `skills/` is mine to publish. Two ways to get it:

```bash
npx skills@latest add yumin-jung/skills
```

Pick the skills you want and which coding agents to install them on. Or install the same set as a native [Claude Code plugin](https://code.claude.com/docs/en/plugins):

```
/plugin marketplace add yumin-jung/skills
/plugin install yumin-jung-skills@yumin-jung
```

Two ways to install, two philosophies:

- **[skills.sh](https://skills.sh/yumin-jung/skills)** copies the skills into your project so you can hack on them and make them your own.
- **The plugin** keeps them as a read-only, always-current bundle you don't edit — best when you just want my set to work and follow along as it evolves.

## Why I Wrote Mine

I built these skills to fix common failure modes I see when agents build real apps.

### #1: The Agent Hijacks Your Mouse To Drive The Simulator

**The Problem**: Ask an agent to test an iOS app and it reaches for a computer-use / screen-control tool — taking over your real mouse, stealing focus, and breaking the moment the Simulator window is hidden or on another monitor. You can't touch your machine while it works.

**The Fix**: The Simulator has always had a headless control surface — `simctl` + `idb`. Screenshots, taps, swipes, and text input, all without moving your mouse or needing the window visible.

This is what **[computer-use-ios](./skills/ios/computer-use-ios/SKILL.md)** does. The agent reaches for it automatically whenever the target is a simulator, and it wraps the sharp edges for you: px→pt coordinate conversion, ambiguous `booted` targets, keyboard-layout-proof text entry.

### #2: Nobody Audits The Trust Boundaries

**The Problem**: Security reviews happen never, or once a year, or only after the incident. Meanwhile every new endpoint, parser, and dependency quietly widens the attack surface.

**The Fix**: Make the review cheap enough to run every few days. **[improve-codebase-security](./skills/engineering/improve-codebase-security/SKILL.md)** scopes your trust boundaries, traces each in-scope entry point to its sinks, and separates evidenced vulnerabilities from hygiene. It presents the results as a visual HTML report with coverage, concrete attack paths, severity and confidence, and before/after controls. Pick one, and it safely closes the boundary with a regression test.

## Mine

### iOS

**Model-invoked**

- **[computer-use-ios](./skills/ios/computer-use-ios/SKILL.md)** — Control the iOS Simulator headlessly via `simctl` + `idb` (screenshots, tap, swipe, text). Used _instead of_ a computer-use / screen-control MCP whenever the target is a simulator — no mouse takeover, no focus stealing, works even if the sim window is hidden or on another monitor.

### Engineering

**User-invoked**

- **[improve-codebase-security](./skills/engineering/improve-codebase-security/SKILL.md)** — Trace scoped entry points to security-sensitive sinks, report evidenced vulnerabilities and hardening opportunities with coverage and confidence, then safely fix the one you pick with a regression test.

## Borrowed

Not mine — credit and copyright stay with their authors. `vendor/` holds a commit pointer to each upstream repo, nothing more, so these are never republished from here.

### [mattpocock/skills](https://github.com/mattpocock/skills)

| Skill | What it does |
| --- | --- |
| [tdd](./vendor/mattpocock-skills/skills/engineering/tdd/SKILL.md) | The red → green loop, and what makes a test worth keeping. |
| [grilling](./vendor/mattpocock-skills/skills/productivity/grilling/SKILL.md) | Relentless interview that walks the design tree before you build. |
| [grill-with-docs](./vendor/mattpocock-skills/skills/engineering/grill-with-docs/SKILL.md) | The same interview, writing ADRs and a glossary as it goes. |
| [implement](./vendor/mattpocock-skills/skills/engineering/implement/SKILL.md) | Build a piece of work from a spec or a set of tickets. |
| [to-spec](./vendor/mattpocock-skills/skills/engineering/to-spec/SKILL.md) | Turn the conversation into a spec on the issue tracker. |
| [to-tickets](./vendor/mattpocock-skills/skills/engineering/to-tickets/SKILL.md) | Break a plan into tracer-bullet tickets with blocking edges. |
| [code-review](./vendor/mattpocock-skills/skills/engineering/code-review/SKILL.md) | Two-axis review of a diff: standards and spec, in parallel. |
| [improve-codebase-architecture](./vendor/mattpocock-skills/skills/engineering/improve-codebase-architecture/SKILL.md) | Find deepening opportunities, report them, grill the one you pick. |
| [writing-for-agents](./vendor/mattpocock-skills/skills/productivity/writing-for-agents/SKILL.md) | How to write a skill, an AGENTS.md, a CLAUDE.md. |

### [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better)

| Skill | What it does |
| --- | --- |
| [make-interfaces-feel-better](./vendor/make-interfaces-feel-better/skills/make-interfaces-feel-better/SKILL.md) | The small details — motion, surfaces, type, icons — that make UI feel finished. |

## License

MIT for what's in `skills/`. Everything under `vendor/` is governed by its own repo's license.
