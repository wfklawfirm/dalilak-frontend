#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git commit -m "design: warm sand bg across all pages + AI response white card"
git push origin main
echo "✅ Done"
