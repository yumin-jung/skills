# Skills For iOS Engineers

[![skills.sh](https://skills.sh/b/yumin-jung/skills)](https://skills.sh/yumin-jung/skills)

My agent skills for real iOS development, structured after [mattpocock/skills](https://github.com/mattpocock/skills).

These skills are designed to be small, easy to adapt, and composable. They work with any model. Hack around with them. Make them your own. Enjoy.

## Quickstart (30-second setup)

1. Run the skills.sh installer:

```bash
npx skills@latest add yumin-jung/skills
```

2. Pick the skills you want, and which coding agents you want to install them on.

3. Bam - you're ready to go.

## Install as a Claude Code plugin

Prefer a plug-and-play install you don't maintain by hand? These skills also ship as a native [Claude Code plugin](https://code.claude.com/docs/en/plugins). Instead of copying editable files into your repo, the plugin installs the whole skill set as a managed bundle that updates when I ship a new version — you subscribe rather than fork.

Inside Claude Code:

```
/plugin marketplace add yumin-jung/skills
/plugin install yumin-jung-skills@yumin-jung
```

Two ways to install, two philosophies:

- **[skills.sh](https://skills.sh/yumin-jung/skills)** copies the skills into your project so you can hack on them and make them your own.
- **The plugin** keeps them as a read-only, always-current bundle you don't edit — best when you just want my set to work and follow along as it evolves.

## Why These Skills Exist

I built these skills to fix common failure modes I see when agents build real apps.

### #1: The Agent Hijacks Your Mouse To Drive The Simulator

**The Problem**: Ask an agent to test an iOS app and it reaches for a computer-use / screen-control tool — taking over your real mouse, stealing focus, and breaking the moment the Simulator window is hidden or on another monitor. You can't touch your machine while it works.

**The Fix**: The Simulator has always had a headless control surface — `simctl` + `idb`. Screenshots, taps, swipes, and text input, all without moving your mouse or needing the window visible.

This is what **[computer-use-ios](./skills/ios/computer-use-ios/SKILL.md)** does. The agent reaches for it automatically whenever the target is a simulator, and it wraps the sharp edges for you: px→pt coordinate conversion, ambiguous `booted` targets, keyboard-layout-proof text entry.

### #2: Nobody Audits The Trust Boundaries

**The Problem**: Security reviews happen never, or once a year, or only after the incident. Meanwhile every new endpoint, parser, and dependency quietly widens the attack surface.

**The Fix**: Make the review cheap enough to run every few days. **[improve-codebase-security](./skills/engineering/improve-codebase-security/SKILL.md)** scopes your trust boundaries, traces each in-scope entry point to its sinks, and separates evidenced vulnerabilities from hygiene. It presents the results as a visual HTML report with coverage, concrete attack paths, severity and confidence, and before/after controls. Pick one, and it safely closes the boundary with a regression test.

## Reference

### iOS

Skills I use daily for iOS work.

**Model-invoked**

- **[computer-use-ios](./skills/ios/computer-use-ios/SKILL.md)** — Control the iOS Simulator headlessly via `simctl` + `idb` (screenshots, tap, swipe, text). Used _instead of_ a computer-use / screen-control MCP whenever the target is a simulator — no mouse takeover, no focus stealing, works even if the sim window is hidden or on another monitor.

### Engineering

**User-invoked**

- **[improve-codebase-security](./skills/engineering/improve-codebase-security/SKILL.md)** — Trace scoped entry points to security-sensitive sinks, report evidenced vulnerabilities and hardening opportunities with coverage and confidence, then safely fix the one you pick with a regression test.

## License

MIT
