#!/bin/bash
# ================================================================
# Batch #215-218 — Procedure UX enhancements + chat improvements
#   #215 ProcedureQuickAskChips     — 4 pre-composed question chips
#   #216 ProcedureExternalLinks     — gov portal links by ministry
#   #217 ChatTypingIndicator        — pre-stream animated dots
#   #218 ProcedureRelatedMinistries — ministry contact strip
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "feat: batch #215-218 — quick ask chips, portal links, typing indicator, ministry contact strip"
git push origin main
echo "✅ Done"
