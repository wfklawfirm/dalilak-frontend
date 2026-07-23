#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "redesign: no wave, no greeting, popular procedures grid, how-it-works, hide footer on homepage"
git push origin main
echo "✅ Done"
