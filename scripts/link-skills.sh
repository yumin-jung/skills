#!/usr/bin/env bash
set -euo pipefail

# Links skills into local skill directories:
#   - ~/.claude/skills  — Claude Code
#   - ~/.agents/skills  — Codex and other Agent Skills-compatible harnesses
# Each entry is a symlink, so `git pull` keeps installed skills up to date.
#
# Everything under skills/ is mine and gets linked automatically. VENDOR lists
# the third-party skills I use, living in the upstream repos under vendor/.
# RETIRED lists the ones I stopped using: they stay under vendor/ for
# reference, are never linked, and links left by earlier runs are removed.
# To pull the latest upstream versions:
#   git submodule update --remote && ./scripts/link-skills.sh

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DESTS=("$HOME/.claude/skills" "$HOME/.agents/skills")

VENDOR=(
  vendor/mattpocock-skills/skills/engineering/code-review
  vendor/mattpocock-skills/skills/engineering/tdd
  vendor/mattpocock-skills/skills/engineering/grill-with-docs
  vendor/mattpocock-skills/skills/engineering/implement
  vendor/mattpocock-skills/skills/engineering/improve-codebase-architecture
  vendor/mattpocock-skills/skills/engineering/to-spec
  vendor/mattpocock-skills/skills/engineering/to-tickets
  vendor/mattpocock-skills/skills/productivity/grilling
  vendor/mattpocock-skills/skills/productivity/writing-for-agents
)

RETIRED=(
  vendor/make-interfaces-feel-better/skills/make-interfaces-feel-better
)

srcs=()
while IFS= read -r -d '' skill_md; do
  srcs+=("$(dirname "$skill_md")")
done < <(find "$REPO/skills" -name SKILL.md -print0)

for v in "${VENDOR[@]}"; do
  if [ ! -f "$REPO/$v/SKILL.md" ]; then
    echo "missing $v — run: git submodule update --init --remote" >&2
    exit 1
  fi
  srcs+=("$REPO/$v")
done

for DEST in "${DESTS[@]}"; do
  mkdir -p "$DEST"
  for r in "${RETIRED[@]}"; do
    link="$DEST/$(basename "$r")"
    # Only a link this script made; anything else at that path is left alone.
    if [ -L "$link" ] && [ "$(readlink "$link")" = "$REPO/$r" ]; then
      rm "$link"
      echo "unlinked retired $(basename "$r") ($DEST)"
    fi
  done
  for src in "${srcs[@]}"; do
    name="$(basename "$src")"
    # A skills.sh install leaves a real directory here; the symlink is the source of truth.
    if [ -d "$DEST/$name" ] && [ ! -L "$DEST/$name" ] && [ -f "$DEST/$name/SKILL.md" ]; then
      rm -rf "$DEST/$name"
      echo "removed copy $DEST/$name"
    fi
    ln -sfn "$src" "$DEST/$name"
    echo "linked $name -> $src ($DEST)"
  done
done
