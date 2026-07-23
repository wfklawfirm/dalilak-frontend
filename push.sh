#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "redesign: light hero + scroll blur nav + mobile grid fixes + design tokens"
git push origin main
echo "✅ Done"
