#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "redesign: light hero, procedures grid, how-it-works, sticky nav blur, design tokens"
git push origin main
echo "✅ Done"
