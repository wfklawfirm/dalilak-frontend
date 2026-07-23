#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "redesign: light theme complete — login/register/loading pages + design tokens v4"
git push origin main
echo "✅ Done"
