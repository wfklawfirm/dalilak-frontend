#!/bin/bash
# ================================================================
# Batch #209-213 — Procedure tracking + sharing enhancements
#   #209 ProcedureCompletionBadge       — "أنهيت هذه المعاملة"
#   #210 MinistryQuickDial              — phone FAB + bottom sheet
#   #211 ProcedureEstimatedCompletion   — expected finish date
#   #212 HomepageProgressRing           — SVG completion ring
#   #213 ProcedureShareViaEmail         — mailto: share button
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "feat: batch #209-213 — completion badge, ministry dial, estimated completion, progress ring, email share"
git push origin main
echo "✅ Done"
