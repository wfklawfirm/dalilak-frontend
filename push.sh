#!/bin/bash
# ================================================================
# Batch #284-300 — Extended feature set
#   #284 ProcedureChecklistExport    — print/export doc checklist to A4 HTML
#   #285 ChatVoicePlayback           — TTS playback of AI responses
#   #286 ProcedureViewCount          — local view count per procedure
#   #287 HomepageFeaturedFAQ         — date-seeded featured FAQ card on homepage
#   #289 ProcedureLastUpdatedBadge   — "last reviewed" freshness badge on procedures
#   #290 ChatEmojiReactions          — emoji reactions on AI messages
#   #291 HomepageWeatherWidget       — live Beirut weather via Open-Meteo
#   #292 ProcedureHelpRequest        — WhatsApp "get human help" button
#   #293 ChatSaveToNotes             — save AI snippet to personal notepad
#   #294 ProcedureStepHighlight      — interactive per-step checklist
#   #295 HomepageMotivationalQuote   — daily rotating motivational quote card
#   #296 ProcedureFeeHistory         — log fee payment + days since
#   #297 ChatAIBadge                 — AI-generated disclaimer on first message
#   #298 ProcedureCountdownTimer     — user-set global deadline countdown
#   #299 HomepageRecentMinistries    — recently browsed ministry quick chips
#   #300 ProcedureAlternativeOffices — alternative submission offices per ministry
#   #301 ChatInputCharCounter        — live char counter on chat input (>200 chars)
#   #302 HomepageUserStats           — "your activity" stats card (started/done/saved/views)
#   #303 ProcedureOfficeMap          — "open in Google Maps" quick link per ministry
#   #304 ProcedureNeedHelpToggle     — "I'm stuck on this" status flag per procedure
#   #305 HomepageQuickActionsBar     — 4-shortcut nav row (procedures/forms/faq/authorities)
#   #306 ProcedureLanguageToggleHint — one-time dismissible language-switch tip on procedure page
#   #307 ChatScrollToBottomButton    — floating jump-to-latest-message button in chat
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "feat: batch #284-307 — 23 new components: checklist export, TTS, FAQ card, emoji react, weather, help, save-to-notes, step highlight, motivation, fee history, AI badge, countdown, recent ministries, alt offices, char counter, user stats, office map, need-help toggle, quick actions bar, language hint, scroll-to-bottom"
git push origin main
echo "✅ Done"
