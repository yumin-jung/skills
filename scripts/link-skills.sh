#!/usr/bin/env bash
set -euo pipefail

# Links all skills in this repo into local skill directories:
#   - ~/.claude/skills  — Claude Code
#   - ~/.agents/skills  — Codex and other Agent Skills-compatible harnesses
# Each entry is a symlink, so `git pull` keeps installed skills up to date.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DESTS=("$HOME/.claude/skills" "$HOME/.agents/skills")

for DEST in "${DESTS[@]}"; do
  mkdir -p "$DEST"
  find "$REPO/skills" -name SKILL.md -print0 | while IFS= read -r -d '' skill_md; do
    src="$(dirname "$skill_md")"
    name="$(basename "$src")"
    ln -sfn "$src" "$DEST/$name"
    echo "linked $name -> $src ($DEST)"
  done
done
