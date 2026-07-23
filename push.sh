#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git commit -m "fix: tsc errors — type fields + view/type alignment (12 files)"
git push origin main
echo "✅ Done"
