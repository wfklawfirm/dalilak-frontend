#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git commit -m "fix+design: zero tsc, bilingual services prompt, globals.css warm-sand sync, divSection anim"
git push origin main
echo "✅ Done"
