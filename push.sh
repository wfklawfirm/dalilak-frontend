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
#   #308 ProcedureStepsAudio         — "listen to the steps" TTS row on procedure detail
#   #309 ProcedureDocumentPhotoTips  — collapsible generic photo/scan tips for documents
#   #310 ChatKeyboardSendHint        — desktop-only "Enter to send" hint below chat input
#   #311 ProcedureBackToTopButton    — floating back-to-top for /procedures list
#
#   FIXES:
#   - Bottom-left floating buttons (language switch, accessibility, ministry
#     phone dial) were overlapping/scattered on mobile (each hardcoded its own
#     bottom/left offset). Now stacked into one clean column with consistent
#     spacing + safe-area-inset-bottom awareness.
#     Files: GlobalLangSwitch.tsx, AccessibilityBar.tsx, MinistryQuickDial.tsx
#   - "Generate AI procedure map" button called a backend route
#     (POST /flowchart/generate) that does not exist on the deployed backend,
#     so it always failed. Frontend now falls back to the working
#     GET /procedures/{slug}/flowchart route when the AI-generation route
#     is unavailable, instead of failing outright. No backend code touched.
#     File: lib/auth.ts (generateFlowchart)
#
#   #312 ChatDraftAutosave           — persists unsent chat input across refresh
#   #313 ChatMessageSearchInThread   — find & jump to text within current conversation
#
#   + AccessibilityBar: added third toggle "Reduce Motion" (disables animations/transitions)
#   + forgot-password page: now shows the backend's real response message
#     (was hardcoded "support will contact you in 24h" regardless of outcome)
#     — pairs with backend v6 (push_backend_v6.sh) which now actually emails
#     the reset code when SMTP env vars are configured.
#   #314 ProcedureCopyDeepLink       — copy a direct #proc-{code} link to a procedure card
#   #315 ProcedureCopySummaryLine    — copy a compact one-line summary (title — ministry — fees)
#
#   DECLUTTER PASS (professional look, less "عجقة"):
#   - app/page.tsx: merged ModeSelector + ChatResponseLength into one shared
#     row (was two stacked pill rows); merged ChatKeyboardSendHint +
#     ChatInputCharCounter into one row (was two stacked rows).
#   - components/ChatQuickReplies.tsx: chips now scroll horizontally in one
#     clean row instead of wrapping into a crowded two-row block.
#   - NEW components/ProcedureSectionGroup.tsx: labeled, collapsible section
#     wrapper — used to reorganize the procedures page. No component or
#     feature was removed; every widget still renders, just grouped under
#     a clear header with consistent spacing instead of ~35 widgets stacked
#     back-to-back with no visual hierarchy.
#   - app/procedures/page.tsx: expanded procedure card body regrouped into
#     6 labeled sections — "المستندات المطلوبة", "خطوات الإجراء",
#     "تتبع التقدم والتذكيرات", "اسأل دليلك", "مشاركة وطباعة" (+ contact/
#     cost/fees left inline). Primary sections (documents, steps, ask-AI)
#     open by default; secondary/power-user sections (tracking, share &
#     print — 9 and 8 widgets respectively) collapsed by default so the
#     card isn't showing 35+ widgets at once on first expand.
#   NOTE: this fixes the SAME FAB-overlap + control-duplication issue
#   reported again in a later screenshot — that screenshot was still
#   showing the OLD deployed frontend because this push.sh hadn't been
#   run since the earlier fix. Running this script now makes both live.
#
#   DECLUTTER PASS 2 — homepage (app/page.tsx):
#   44 homepage widgets (weather x2, stats x5, "today's tasks" x2,
#   "procedure of the day/week" x2, saved/favorites x4, etc.) were
#   rendered flat back-to-back above the chat box. Regrouped into 9
#   new labeled SectionCollapseToggle sections (reusing the existing
#   component already used elsewhere in this file) — Alerts & reminders,
#   Today's tasks, At a glance (stats), Suggestions for you, Saved &
#   favorites, Search & chat history, Extra tools — plus the 4 groups
#   that already existed. Only welcome banner + quick-actions bar stay
#   always visible; secondary groups (stats, suggestions, saved,
#   history, extra tools) start collapsed. No widget removed — same
#   pattern as the procedures-page fix above.
#
#   NEW: /settings page — centralizes preference toggles that were
#   previously only reachable via scattered floating widgets: language,
#   accessibility (high contrast / large text / reduce motion), default
#   chat response length, plus an About block. Reads/writes the SAME
#   localStorage keys as AccessibilityBar/ChatResponseLength/
#   GlobalLangSwitch, so it stays in sync — nothing removed or replaced,
#   just an easier-to-find home for the same settings. Linked from
#   MobileMenu ("الإعدادات") and TopNav's account dropdown.
#
#   NEW: app/robots.ts — was completely missing (only sitemap.ts existed),
#   so crawlers had no explicit policy. Allows all public pages, disallows
#   /admin + auth flows, points to /sitemap.xml. Does not touch any
#   existing metadata.
#   NEW: JSON-LD (HowTo schema) on procedure detail pages
#   (app/procedures/[slug]/page.tsx) — built only from real fields already
#   in PROCEDURES_DATA (title, description, ministry, steps), no invented
#   content. Invisible to users, helps search engines show step-by-step
#   rich results.
#   NEW: app/manifest.ts + public/icon-192.png + public/icon-512.png —
#   PWA support was missing entirely (no "Add to Home Screen" on mobile).
#   Icons are square, padded resizes of the existing logo-icon.png (same
#   real logo already used in TopNav), not new artwork. Also added
#   appleWebApp meta to layout.tsx for iOS home-screen support. No
#   existing metadata/route/env var touched.
#
#   NEW: print stylesheet (globals.css @media print) — hitting the
#   browser's native print (Ctrl/Cmd+P) used to print the fixed TopNav,
#   BottomNav, and every floating widget on top of the content. Added a
#   .no-print class (applied to GlobalLangSwitch, AccessibilityBar,
#   MinistryQuickDial, FloatingHelpButton, OfflineNotice,
#   ChatScrollToBottomButton, ProcedureBackToTopButton) + a print rule
#   hiding header/nav/.no-print. On-screen appearance unchanged — @media
#   print only. The dedicated PrintProcedureModal is unaffected.
#
#   NEW: lazy-load ~27 homepage widgets (app/page.tsx) — the components
#   used only inside the collapsed-by-default homepage sections (stats,
#   suggestions, saved/favorites, search & chat history, extra tools) now
#   use next/dynamic (ssr:false) instead of static imports, so their code
#   is fetched only when the user opens that section instead of bundled
#   into the initial homepage load. Same components, same behavior,
#   smaller first paint. tsc verified with 0 errors (generic dyn<P>()
#   helper preserves each component's prop types).
#
#   FIX: SectionCollapseToggle.tsx header text was var(--text-3)
#   (#918B82) on white/near-white backgrounds — only 3.38:1 contrast,
#   below the WCAG AA 4.5:1 minimum for text this size. Changed to
#   var(--text-2) (5.87:1, passes AA) and bumped the chevron icon to
#   var(--text-3) (was --text-4, even lower contrast). Affects every
#   section built with this component, old and new — pure color fix, no
#   layout/behavior change.
#
#   MOBILE TOUCH-TARGET PASS (site-wide, per user request for a full
#   professional mobile pass): found and fixed several controls sized
#   well under the ~40-44px comfortable tap-target minimum, and two
#   sheets/menus whose bottom padding didn't account for the iPhone
#   home-indicator safe area:
#   - TopNav.tsx: mobile hamburger 34x36 -> 44x44; language toggle
#     height 34 -> 40.
#   - MobileMenu.tsx: drawer close button 32x32 -> 40x40; logout button
#     row now uses paddingBottom: max(24px, env(safe-area-inset-bottom)).
#   - services/page.tsx: search-clear button 22x22 -> 36x36; detail
#     modal footer now uses env(safe-area-inset-bottom).
#   - authorities/page.tsx: search-clear button 20x20 -> 36x36.
#   - app/page.tsx: voice-banner dismiss button 20x20 -> 36x36 (+ added
#     missing aria-label); "clear active document" chip's hit area
#     enlarged via padding (was ~15x15 effective).
#   Desktop layout unaffected — all changes are to already-mobile-only
#   or size-only properties, no breakpoints removed.
#
#   MOBILE TOUCH-TARGET PASS 2 (remaining pages): forms/page.tsx,
#   faq/page.tsx search-clear buttons 20x20 -> 36x36; settings/page.tsx
#   back button 34x34 -> 38x38; procedures/page.tsx advanced-search and
#   advanced-filter toolbar buttons 30x30 -> 36x36. Audit confirmed no
#   missing aria-labels and no unsafe bottom-fixed padding remained
#   anywhere else in the app. Size-only changes, desktop unaffected.
#
#   DESKTOP PASS (per user request to cover computer + mobile equally):
#   - NEW shared CSS: .nav-home-btn:hover (globals.css) — the identical
#     header "Home" icon button on procedures/services/forms/faq/
#     authorities/my-files/drafting-studio only had onTouchStart/
#     onTouchEnd feedback; desktop mouse users got zero hover feedback.
#     Applied the class to all 7 occurrences.
#   - NEW .prof-header-btn / .prof-tab-btn (filter:brightness hover) —
#     professional/page.tsx's language toggle, back button, and section
#     tabs had no feedback of any kind (not even touch). Filter-based
#     hover works regardless of each button's own active/inactive
#     background, no !important conflicts.
#   - forms/page.tsx view-tab switcher + ministry filter chips, and
#     faq/page.tsx category filter chips: added onMouseEnter/onMouseLeave
#     mirroring their existing onTouchStart/onTouchEnd so desktop mouse
#     users get the same feedback touch users already had.
#   - settings/page.tsx: header row now shares the same maxWidth:560 +
#     margin:auto wrapper as the page content below it — on wide desktop
#     monitors the header no longer hugged the far edge while the panel
#     sat centered in a narrow column.
#   All mobile behavior unchanged — these are additive desktop-only
#   hover affordances plus one header-alignment fix.
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "feat: batch #284-315 — 31 new components + fix mobile FAB overlap + fix broken flowchart generation + reduce-motion toggle + dynamic forgot-password messaging + declutter chat controls, procedures page, and homepage into labeled sections + new /settings page"
git push origin main
echo "✅ Done"
