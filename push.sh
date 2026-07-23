#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "i18n: bilingual mode prefixes + FAQ category translations"
git push origin main
echo "✅ Done"
