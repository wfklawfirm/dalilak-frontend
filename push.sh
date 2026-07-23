#!/bin/bash
# ================================================================
# Batch #264-271 — Document checklist, POTD, chat language toggle,
#                  cost breakdown, AI assist button, suggestions bar,
#                  remind-me-later, live stats
#   #264 ProcedureDocumentChecklist     — interactive doc checkbox list
#   #265 HomepageProcedureOfTheDay      — daily featured procedure card
#   #266 ChatLanguageToggleChip         — one-tap AI reply language switch
#   #267 ProcedureCostBreakdown         — expandable fee line-item breakdown
#   #268 ProcedureAIAssistButton        — preset question CTA on procedure cards
#   #269 HomepageChatSuggestionsBar     — horizontal quick-prompt chip bar
#   #270 ProcedureRemindMeLater         — 1-click reminder in 1/3/7/14 days
#   #271 HomepageLiveStats              — animated counter strip (procs/ministries/forms)
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "feat: batch #264-271 — doc checklist, POTD, chat lang toggle, cost breakdown, AI assist, suggestions bar, remind-later, live stats"
git push origin main
echo "✅ Done"
