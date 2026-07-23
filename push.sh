#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git commit -m "design: warm sand bg complete — all pages/loadings/error/404 unified to #F2EDE6"
git push origin main
echo "✅ Done"
