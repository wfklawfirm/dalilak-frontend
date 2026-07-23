#!/bin/bash
# ================================================================
# Batch #257-263 — Step timer, ministry map, weekly goal, printable
#                  card, history log, mini stats, tag search
#   #257 ProcedureStepTimer          — per-step countdown timers
#   #258 ProcedureMinistryMap        — static ministry location visual
#   #259 HomepageWeeklyGoalWidget    — "هدف الأسبوع" weekly goal tracker
#   #260 ProcedurePrintableCard      — print-ready card via window.open
#   #261 ProcedureHistoryLog         — per-procedure activity event log
#   #262 HomepageMiniStats           — 4-stat completed/started/reminders/saved strip
#   #263 ProcedureTagSearch          — enriched ministry label tag cloud filter
#   #264 TSC clean (0 errors) + push
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "feat: batch #257-263 — step timer, ministry map, weekly goal, printable card, history log, mini stats, tag search"
git push origin main
echo "✅ Done"
