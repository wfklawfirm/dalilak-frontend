#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "redesign: color tokens + i18n cleanup across all inner pages v5"
git push origin main
echo "✅ Done"
