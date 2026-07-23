#!/bin/bash
# ================================================================
# Batch #215-223 — Procedure UX + chat improvements + homepage
#   #215 ProcedureQuickAskChips     — 4 pre-composed question chips
#   #216 ProcedureExternalLinks     — gov portal links by ministry
#   #217 ChatTypingIndicator        — pre-stream animated dots
#   #218 ProcedureRelatedMinistries — ministry contact strip
#   #220 ChatMessageActions         — copy / share / bookmark bar
#   #221 ProcedureOfTheWeek        — featured procedure card
#   #222 LiveBeirutClock            — live Lebanon time + gov open/closed
#   #223 ProcedureBookmarks         — panel of saved AI answer snippets
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "feat: batch #215-223 — quick ask chips, portal links, typing indicator, ministry strip, message actions, proc of week, Beirut clock, bookmarks"
git push origin main
echo "✅ Done"
