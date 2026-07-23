#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "redesign: compact hero — shorter padding, pre-line headline, 2 pills, tighter content"
git push origin main
echo "✅ Done"
