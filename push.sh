#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "redesign: elegant homepage — remove stats band, add quick-action cards, cleaner hero"
git push origin main
echo "✅ Done"
