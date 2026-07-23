#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "redesign: white header + full homepage rebuild v3 — hero/procedures/categories/how-it-works/trust/footer + design tokens"
git push origin main
echo "✅ Done"
