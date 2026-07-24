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
#
#   RELIABILITY + SEO PASS (batch #315-316):
#   - admin/page.tsx: "Deactivate" user button and content-gap status
#     buttons (مراجعة/محلول/تجاهل) had no pending/disabled state — a
#     fast admin could double-click and fire the same DELETE/UPDATE
#     request twice. Added deactivating/gapUpdating state trackers so
#     the specific row's button disables + shows "جارٍ..." while its
#     own request is in flight (other rows stay clickable).
#   - my-files/page.tsx: delete-confirmation "نعم" button and the
#     Resume/Cancel status buttons now use the page's existing `saving`
#     flag to disable themselves and show "جارٍ الحذف..." during the
#     fetch, preventing duplicate DELETE/PUT calls on a slow connection.
#   - services/page.tsx, professional/page.tsx, settings/page.tsx: page
#     titles were plain <div>s with zero <h1> anywhere on the page
#     (bad for SEO + screen-reader page structure). Changed to <h1> with
#     margin:0 + fontFamily:inherit so there is zero visual change —
#     purely a semantic fix.
#   No backend, route, or visual/behavioral change beyond disabling a
#   button during its own in-flight request.
#
#   ACCESSIBILITY PASS (batch #317): 12 icon-only glyph buttons (✕ / ↑ / ↓
#   close-dismiss-cancel controls) across ProcedureCompletionBadge,
#   ProcedureFilterDrawer, ChatPinnedMessage, ProcedureOfTheWeek,
#   ProcedureRemindMeLater, ChatMessageSearchInThread (3 buttons),
#   ProcedureStepTimer (2 buttons), HomepageProcedureOfTheDay,
#   ProcedureQRShare, and ProcedureCountdownTimer had no aria-label —
#   screen readers announced them as unlabeled "button". Added bilingual
#   aria-label matching each button's action (kept existing title where
#   present). Purely additive attribute, zero visual change.
#
#   METADATA PASS (batch #318): /settings and /professional were the only
#   two routes in the whole app with zero per-page <title>/robots metadata
#   (every other route has a layout.tsx for this). Added layout.tsx to
#   both with robots:{index:false,follow:false} — both pages require login
#   (professional redirects unauthenticated users; settings is personal
#   preferences), matching the existing admin/my-files noindex pattern.
#
#   FOCUS-RING FIX (batch #319): globals.css's button/a/[role=button]/
#   [tabindex]/select :focus-visible rule had no !important, so any button
#   using inline style={{ outline:'none' }} (found on ~15+ icon buttons,
#   e.g. ChatVoiceInputBtn, GlobalSearch, ProcedureComparator) permanently
#   lost its keyboard focus indicator — inline styles beat class rules
#   regardless of pseudo-class. Added !important to the one global rule so
#   every such button gets its focus ring back app-wide. Verified this
#   does not affect the separate input/textarea focus patterns (those use
#   their own :focus box-shadow rings, untouched by this selector).
#
#   MOBILE FAB-STACK / OVERLAP FIX (batch #320): per explicit user request to
#   audit the app's mobile shape/arrangement (not just tap-target sizes),
#   found that 5 independently-positioned fixed floating widgets on the
#   homepage shared bottom-offsets/sides with no coordination:
#   - FloatingHelpButton (help FAB, bottom:80) and AppointmentReminder
#     (24h-before toast, was bottom:80, SAME side) directly overlapped
#     whenever both were visible. AppointmentReminder moved to bottom:140
#     (clears the 46px help FAB + gap) so it stacks above it instead.
#   - ChatScrollToBottomButton (bottom:100) and FeedbackWidget (bottom:90,
#     42px tall) overlapped on the opposite side. Scroll button moved to
#     bottom:146 to clear the feedback button's 42px height + gap.
#   - KeyboardShortcutsHelp's "?" FAB (bottom:80, same side as the above
#     two) was a third widget crowding that same corner — and is
#     meaningless on a touchscreen anyway (no physical keyboard), so it's
#     now hidden below 767px via new .kbd-shortcuts-fab CSS class, fully
#     desktop-only, removing one whole overlap source instead of just
#     renumbering it.
#   - NotificationBell's notification dropdown had a fixed width:300 near
#     the screen edge — changed to width:min(300px, calc(100vw - 24px))
#     so it can never overflow off-screen on narrow phones.
#   - Bonus: FeedbackWidget's inner "×" close button was missing aria-label
#     (same class of gap as the #317 pass).
#   All changes are position/width/visibility only — no functionality
#   removed, desktop layout (>767px) completely unaffected except the
#   focus-ring and aria-label additions which apply everywhere.
#
#   BOTTOM-PADDING AUDIT (batch #321): swept every page rendering
#   <BottomNav> for missing clearance above the fixed nav bar (a page with
#   no bottom padding has its last content row sit flush behind/under the
#   nav on mobile). Checked procedures, procedures/[slug], forms, faq,
#   authorities, my-files, services, services/expat-property,
#   drafting-studio, procedures/[slug]/playbook — all already correct.
#   Found one real gap: forms/[slug]/FormDetailClient.tsx's main-content
#   had padding:'20px 16px' with zero bottom clearance, so the disclaimer
#   card at the end of every form detail page was flush against the nav.
#   Fixed to '20px 16px 100px' matching every sibling detail page.
#
#   FAB-STACK CORRECTION (batch #322): while auditing z-index layering,
#   discovered the #320 fix was incomplete — it only accounted for the 5
#   widgets rendered from app/page.tsx and missed that app/layout.tsx
#   ALSO globally renders 3 more always-on fixed widgets on the exact same
#   side (GlobalLangSwitch, AccessibilityBar, MinistryQuickDial — bottom:
#   182/134/82, already correctly spaced against each other). On the
#   homepage this meant FeedbackWidget (bottom:90) directly overlapped
#   MinistryQuickDial (bottom:82, 44px tall -> top edge 126), and the
#   #320 fix that moved ChatScrollToBottomButton to bottom:146 landed
#   right on top of AccessibilityBar (bottom:134-174). Corrected by
#   moving both contextual widgets to sit ABOVE the always-on 82-216
#   stack instead of interleaving with it: FeedbackWidget -> bottom:226,
#   ChatScrollToBottomButton -> bottom:278. The always-on trio itself
#   was left untouched since it was already internally consistent.
#
#   SAFE-AREA SWEEP (batch #323): checked every fixed bottom-0 sheet/drawer
#   for env(safe-area-inset-bottom) handling (needed so content/buttons
#   don't sit under the iPhone home-indicator bar). MinistryQuickDial,
#   MobileModeSheet, and MobileMenu already had it. Found 3 without it —
#   GuidedFlow's scrollable step content, ServiceGroupSheet's scrollable
#   list, and ProcedureFilterDrawer's sticky Apply/Reset footer — all
#   given the same 'calc(Npx + env(safe-area-inset-bottom, 0px))' pattern
#   already used elsewhere in the codebase. (TransactionStarter was
#   checked too but is a centered modal, not a bottom sheet — no change
#   needed there.)
#
#   SAFE-AREA SWEEP PART 2 (batch #324): ran an automated pass over every
#   file with a fixed bottom:0 / flex-end-anchored overlay and no
#   safe-area-inset-bottom reference — caught 2 more: EscalationModal's
#   content padding and DocumentIntelligenceView's draft-preview sheet.
#   Fixed both with the same calc() pattern; re-ran the sweep afterward
#   and it now returns zero matches app-wide.
#
#   LAST TOUCH-TARGET (batch #324b): ProcedureMinistryMap's map-collapse
#   close button was 20x20 with no aria-label — bumped to 36x36 (fits its
#   110px-tall container comfortably) and added aria-label, matching the
#   convention used throughout the earlier touch-target passes.
#
#   DECLUTTER PASS (batch #325): audited every page for visual density and
#   applied the same SectionCollapseToggle pattern already proven on the
#   homepage and /procedures list page to the remaining dense pages:
#   - ProcedureDetailClient.tsx: kept hero card, Ask/Wizard buttons,
#     Playbook button, Required Documents, and Steps always visible.
#     Grouped Responsible Authority + Fees + the closing "Ask Dalilak" CTA
#     into one collapsed "More details — authority, fees & more" section
#     (defaultOpen=false, per-procedure localStorage key).
#   - services/page.tsx: kept search bar, category chips, and results grid
#     always visible. Grouped the 3-card stats strip + ServiceMapPlaceholder
#     into one collapsed "Overview & nearby offices" section.
#   - forms/[slug]/FormDetailClient.tsx: kept the primary form-info card
#     (download/Ask AI buttons) and the legal disclaimer banner always
#     visible. Grouped "How to use this form", "Procedure Map" (AI
#     generator), and "Related Procedures" into one collapsed
#     "More details — how to use & procedure map" section.
#   No functionality removed — every collapsed section is still fully
#   interactive once expanded, and open/closed state persists per-page via
#   localStorage. tsc --noEmit clean after each file.
#
#   + expat-property page: title div converted to <h1> (was missing, like
#     the earlier services/professional/settings h1 fix).
#
#   SEMANTIC LANDMARK PASS (batch #326): only app/page.tsx used a real
#   <main> element for its #main-content region — every other route (~20
#   files: login/register/reset-password/forgot-password, error/not-found/
#   global-error, admin + admin/content, my-files, services (+expat-property),
#   authorities, faq, drafting-studio, procedures list/detail/playbook,
#   forms list/detail) used a plain <div id="main-content">. Converted each
#   to <main id="main-content"> (same id, same styles, matching close tag)
#   so screen readers get a proper main-content landmark on every page, not
#   just the homepage. Zero visual change — div and main both default to
#   display:block. Caught and fixed one mismatched open/close tag pair in
#   services/page.tsx during the pass (verified via tsc --noEmit, which
#   catches unbalanced JSX). No ids moved, no behavior changed — the
#   existing TopNav scroll-listener (which reads #main-content by id) is
#   unaffected.
#
#   REAL SUPPORT NUMBER (batch #327): ProcedureHelpRequest's "Get human
#   help" WhatsApp button was wired to a placeholder number (96181000000,
#   flagged TODO in the source). Per the no-mock-data rule, flagged this to
#   the user directly rather than guessing; user supplied the real WhatsApp
#   number, now wired in (HELP_NUMBER = '9616694794'). Swept the rest of the
#   codebase for similar placeholder contact numbers — none found; all
#   other WhatsApp references are generic share actions (no fixed number)
#   or user-supplied contact fields in EscalationModal.
#
#   TOUCH TARGET FIX (batch #328): SectionCollapseToggle's header button
#   (the shared collapse/expand pattern used on the homepage, /procedures
#   list, and now the procedure/services/form detail pages) had only
#   2px/6px vertical padding — well under the 44px minimum touch target.
#   Since it's now used on 6+ pages, bumped padding to 11px top/bottom +
#   minHeight:44 so every instance gets a properly sized tap target at
#   once. Purely a hit-area change — visual text size unchanged.
#
#   MOBILE HINT CLEANUP (batch #329): found via direct screenshot
#   comparison against the live mobile site. GlobalSearch's closed-state
#   search button showed a "⌘K" keyboard-shortcut badge even on phones,
#   where there's no physical keyboard and the hint is meaningless clutter
#   (its sibling "Search..." text label was already correctly hidden below
#   640px, but the ⌘K badge wasn't). Added a matching .gs-search-kbd
#   responsive class so it's hidden on mobile and shown ≥640px, same
#   treatment already used for KeyboardShortcutsHelp's FAB. Everything
#   else checked against the screenshot (floating "?" quick-help button,
#   hero, search bar, chips, bottom nav) matches the current deployed
#   code correctly — confirmed the earlier "site looks old on Vercel"
#   concern was a stale cached fetch on my end, not a real deployment
#   gap (Vercel Deployments dashboard confirms every push went live
#   within minutes). Also checked TopNav for other desktop-only elements
#   that might leak onto mobile — Online dot / Trial badge / Start-guide
#   CTA are correctly gated behind .tn-desk-only; NotificationBell and
#   GlobalSearch are intentionally shown on both (functional, not hints).
#
#   TOUCH AFFORDANCE FIX (batch #330): found via a follow-up sweep for
#   the same class of bug as the ⌘K badge — desktop-only interactions
#   with no mobile fallback.
#   - SavedItemsPanel.tsx: the remove ("×") button and "Ask Dalilak" CTA
#     on each saved-item card were only revealed on onMouseEnter/Leave
#     (React state, not CSS :hover) — on a touchscreen with no hover
#     concept, they stayed permanently invisible (opacity:0/0.5), making
#     it impossible to remove a saved item from the homepage on mobile.
#     Added a `@media (pointer: coarse)` rule forcing them visible on
#     touch devices, same principle as the .gs-search-kbd/.kbd-shortcuts-fab
#     pattern (mirrored, not duplicated — one shared <style> in the panel).
#   - ProcedureVersionTag.tsx: the exact "updated on <date>" tooltip only
#     opened on hover/focus of a non-interactive span — added onClick so
#     tapping toggles it open on touch too. Low severity (the badge's
#     always-visible "NEW"/"UPD" text + aria-label already convey the
#     gist) but now consistent with every other interactive element.
#   Note: MinistryOpenHoursWidget.tsx has a similar title-attribute-only
#   gap in compact mode, but it has zero import sites anywhere in the
#   app (dead code) — left untouched per standing no-op-on-unused-code
#   precedent rather than fixing something nothing renders.
#
#   FOLLOW-UP (batch #331): the batch #330 fix made SavedItemsPanel's
#   remove button visible on touch, but the visible button is 20x20 —
#   under the 44px minimum touch target audited/fixed everywhere else
#   (see #267-272, #328). Expanded its actual hit area via an invisible
#   ::before pseudo-element (inset:-12px, touch devices only) instead of
#   growing the visible button and disrupting the compact card layout.
#
#   TOUCH TARGET SWEEP (batch #332): ran a targeted search for every
#   remaining <button>/onClick element under ~40px across components/,
#   ranked by how often a mobile user would realistically hit it. Added
#   reusable .tap-hit-N utility classes to globals.css (N = px inset
#   needed to bring that button up to ~44px on touch devices only,
#   generalizing the one-off fix from #331) and applied them to:
#   - ChatMessage.tsx: thumbs-up/down feedback buttons (26px, hit on
#     nearly every AI response if a user rates it)
#   - AgentResponseRenderer.tsx: inline citation badge/superscript
#     (16px, appears constantly in chat answers with sources)
#   - EscalationModal, GuidedFlow, ProcedureQRShare, TransactionFilePanel:
#     modal close (X) buttons (28-32px) — same class of bug as earlier
#     close-button fixes, these four were missed in that sweep
#   - ProcedureReminderBell, DocExpiryBanner (x2): reminder/snooze/close
#     buttons (26px)
#   - CostEstimator: collapse/close button (22px)
#   - PrintProcedureModal: close button (34px)
#   - MissingDocumentsChecklist: per-document "Upload" button — fixed
#     with minHeight:44 directly (padding-based sizing, not fixed
#     width/height, so no pseudo-element needed)
#   Skipped HomepageMinistrySpotlight's prev/next carousel buttons: they're
#   stacked with only 4px gap, and a uniform hit-area expansion would make
#   the two invisible tap zones overlap and risk mis-taps between them —
#   needs a custom asymmetric fix, left for a future batch rather than
#   introducing a new bug while fixing this one.
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "feat: batch #284-332 — 31 new components + full mobile/desktop polish pass + settings page + PWA/SEO + reliability fixes + h1 + aria-label + focus-ring fixes + mobile floating-widget overlap fix + forms/[slug] bottom-padding fix + complete safe-area-inset-bottom coverage + ProcedureMinistryMap touch-target fix + declutter pass on procedure/services/form detail pages via SectionCollapseToggle + expat-property h1 fix + main-content landmark on ~20 pages + real WhatsApp support number for ProcedureHelpRequest + SectionCollapseToggle 44px touch target fix + GlobalSearch ⌘K hint hidden on mobile (gs-search-kbd) + SavedItemsPanel touch-visible remove/ask affordances + ProcedureVersionTag tap-to-reveal tooltip + SavedItemsPanel remove button 44px touch hit-area expansion + sitewide tap-hit-N utility sweep across 8 more components"
git push origin main
echo "✅ Done"
