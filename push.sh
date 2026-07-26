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
#   Skipped HomepageMinistrySpotlight's prev/next carousel buttons in
#   #332: they're stacked with only 4px gap, and a uniform hit-area
#   expansion would make the two invisible tap zones overlap and risk
#   mis-taps between them.
#
#   FOLLOW-UP (batch #333): fixed HomepageMinistrySpotlight properly.
#   Math: button size 26px, target ~44px needs +9px expansion per side
#   (.tap-hit-9, already built). To avoid two 44px hit zones overlapping,
#   center-to-center distance must be >= 44px, i.e. the gap between
#   button edges must be >= 2×9=18px. Bumped the stack's gap from 4px to
#   20px (small, deliberate safety margin over the 18px minimum) and
#   applied .tap-hit-9 to both buttons. Minor, justified visual change —
#   the two arrow buttons now sit slightly further apart — versus leaving
#   a real mobile mis-tap risk unfixed.
#
#   BUG FIX (batch #334): user-reported — switching the UI language
#   toggle to English left AI chat replies in Arabic. Root cause: the
#   backend's system prompt always answers "in the same language as the
#   question," detected purely from the raw message text (system_prompt.txt
#   line 58, "أجب بنفس لغة السؤال") — /chat/stream's request body has no
#   language field at all (confirmed in backend/main.py's ChatRequest
#   model). So if a user types in Arabic (their habit) while the UI
#   toggle is set to English, the backend has zero visibility into that
#   toggle and just answers in Arabic regardless. Backend APIs are off
#   limits per standing constraints, so fixed it entirely on the frontend:
#   app/page.tsx's sendMessage now prepends an explicit, unambiguous
#   language directive ("[IMPORTANT: Respond only in English regardless
#   of the language used in this message.]" / Arabic equivalent) ahead of
#   the existing mode-prefix and message text, for both /chat/stream and
#   /analyze/stream. This uses the same "bracketed meta-instruction"
#   mechanism the mode prefixes (quick/detailed/research) already rely on
#   successfully in production — no backend change needed. Side benefit:
#   the localStorage answer cache is keyed off this same prefixed string,
#   so cached answers are now correctly language-scoped too (previously
#   the same question asked in two different toggle states could return
#   a cross-language cache hit). Verified with tsc — clean.
#
#   MOBILE RE-AUDIT (batch #335): user asked for a fresh, dedicated re-audit
#   of layout/shape/organization on mobile across every page. Ran 3 parallel
#   focused audits (chat/core pages, services/content pages, account/utility
#   pages) instead of relying on memory of earlier sweeps. Fixed the
#   concrete findings:
#   - app/page.tsx hero search bar: once the "Enhance" button appears
#     (as soon as the user has typed 4+ chars — i.e. exactly while typing),
#     it plus the voice/search buttons could eat 200px+ of a ~340px bar on
#     360-390px phones, squeezing the actual input to a sliver. Enhance
#     button now drops to icon-only below 420px (.hero-enhance-label /
#     .hero-enhance-btn classes in globals.css) — same "hide label, keep
#     icon" pattern already used for GlobalSearch/KeyboardShortcutsHelp.
#   - app/page.tsx homepage widget stack: "My Documents" and "My
#     Appointments" sections now default to collapsed (defaultOpen=false),
#     matching "At a glance"/"Suggestions" — previously 4 of 6 sections
#     were open by default (14+ nested widgets), an unnecessarily long
#     pre-scroll experience on mobile. "Alerts" and "Today's tasks" stay
#     open since they're the most universally relevant. Per-user open/
#     closed state still persists via each section's storageKey either way.
#   - app/globals.css .fgrid (footer): was hard-coded to 2 columns even at
#     360px, cramming brand text + 2 link lists into ~148px columns. Now
#     starts at 1 column, widens at 480px+.
#   - app/services/expat-property/page.tsx: the Expat/Property/Contracts
#     tab row had no flexWrap or overflowX fallback (every comparable chip
#     row elsewhere in the app has one) — added horizontal scroll +
#     flexShrink:0 so it can't overflow the sticky header on narrow phones.
#   - app/professional/page.tsx: Overview tab's 4 stat cards were a fixed
#     2x2 grid at every width; at 360px, ~55-60px was left for labels like
#     "طلبات مراجعة"/"Review Requests" after the icon, causing uneven
#     wrapping. New .prof-stat-grid class collapses to 1 column only below
#     400px.
#   - components/DraftingStudio.tsx: the 3-segment stage-indicator pill had
#     no minHeight, so a wrapped 2-line label produced uneven segment
#     heights next to single-line siblings. Added minHeight:34 + flex
#     centering so all 3 stay visually uniform whether or not text wraps.
#   Audited and found already correctly mobile-aware (no changes needed):
#   /procedures, /procedures/[slug], /services, /forms, /forms/[slug],
#   /authorities, /faq, /my-files, /settings, /drafting-studio, /login,
#   /register, /forgot-password, /reset-password. Verified with tsc after
#   every change — clean throughout.
#
#   FOLLOW-UP (batch #336): extended the mobile re-audit to /admin and
#   /admin/content, which weren't in the first pass. Found one genuine,
#   visible bug in both: the sticky header row (logo + title/welcome-text
#   + action buttons) used `justifyContent:'space-between'` with no
#   flexWrap. On 360-390px phones that's more content than fits on one
#   line, causing horizontal page scroll or clipped buttons — the header
#   is sticky, so this was on-screen on every scroll position. Added
#   flexWrap to both the outer row and the button group, minWidth:0 +
#   ellipsis truncation on the title/welcome-text so long usernames don't
#   force overflow, and flexShrink:0 on the back-link so it can't get
#   squeezed to nothing first. Everything else in both admin pages (users
#   table, pipeline grid, filter/tab rows) was already correctly
#   responsive. tsc clean.
#
#   BATCH #337 — cross-page mobile CONSISTENCY pass. User reported the
#   mobile shape still felt "غير متناسق" (uneven) across pages even after
#   #335/#336's per-page fixes. Root cause: every page hand-copies its own
#   sticky maroon header + main-content wrapper instead of sharing one
#   component/class, so the numbers had silently drifted from each other
#   over many batches. Ran a dedicated full-repo audit of all 20 page
#   files (header padding, container maxWidth, H1 size, bottom-nav
#   clearance) and standardized every page back to the majority pattern:
#   header padding 13px 16px, container maxWidth 720, H1 15px, bottom
#   clearance 100px above the fixed BottomNav. Concretely:
#   - authorities/page.tsx: maxWidth 760 → 720 (both header + main)
#   - forms/[slug]/FormDetailClient.tsx: maxWidth 680 → 720, header
#     padding 14px 16px → 13px 16px, main padding 20px 16px → 16px 14px
#   - procedures/[slug]/ProcedureDetailClient.tsx: header padding
#     12px 16px → 13px 16px
#   - faq/page.tsx: header padding 14px 16px → 13px 16px, main top
#     padding 14px → 16px
#   - services/expat-property/page.tsx: header padding 14px 16px 18px →
#     13px 16px 16px, H1 14px → 15px (was the smallest in the app);
#     removed a dead local `.bottom-nav-padding{padding-bottom:68px}`
#     override with no media query — it had zero effect on mobile (the
#     global !important rule in globals.css always won there) but was
#     silently adding unwanted bottom padding on desktop/tablet widths
#     where BottomNav isn't even rendered. Deleting it is a pure fix,
#     not just a style alignment.
#   - my-files/page.tsx: page title was a plain <div>, not a heading —
#     promoted to <h1> (same visual style, fixes a11y + consistency);
#     bottom clearance 80px → 100px, matching every other BottomNav page
#     (was the least clearance of any nav-bearing page).
#   - professional/page.tsx: was reserving 100px of bottom padding as if
#     BottomNav were rendered there, but this page never renders it —
#     dead space. Reduced to a normal 32px page-end margin.
#   - settings/page.tsx: <BottomNav> wasn't wrapped in the standard
#     `.bottom-nav-wrapper` class every other page uses to hide the fixed
#     nav above the 767px breakpoint — settings was the one page where it
#     could stay visible outside mobile. Wrapped it to match.
#   - drafting-studio/page.tsx, procedures/[slug]/playbook/page.tsx: main
#     top padding (20px→16px) and bottom clearance (120px→100px)
#     normalized to the same values used everywhere else.
#   - login/page.tsx: logo H1 24px → 22px, matching register/
#     forgot-password/reset-password (same auth-card template family).
#   tsc clean after every edit. No routes, APIs, or auth logic touched —
#   pure layout-consistency alignment.
#
#   BATCH #338 — design-token hardening (foundation phase of the mobile-
#   first UI/UX request). Audited app/globals.css first: a real design-
#   token system already exists (colors, 8px spacing scale, radius,
#   shadows, z-index, a full typography scale .text-display→.text-label,
#   and .container-sm/md/lg/xl classes) — the gap was that pages weren't
#   using it, hardcoding their own literal values instead (root cause of
#   #337's drift). Rather than risk a full mass-migration of every page
#   to shared components in one pass, did the safe, zero-visual-diff
#   version: replaced the literal duplicated values with CSS custom
#   properties that resolve to the exact same output, so future edits
#   only touch one place instead of N files:
#   - Added --header-gradient (the sticky maroon header background) —
#     was a hand-typed linear-gradient() literal duplicated across 14
#     files (procedures, forms, faq, authorities, drafting-studio,
#     services, admin, admin/content, my-files, both [slug] detail
#     clients, playbook, expat-property, components/ui/index.tsx's
#     PageHeader). All 14 now reference var(--header-gradient) instead.
#   - Added --bottom-nav-clearance (100px) and pointed all 10 pages that
#     reserve exactly 100px above the fixed BottomNav at it instead of
#     the literal number, including the 4 outliers just aligned to
#     100px in #337 (my-files, playbook, drafting-studio, services).
#   - Along the way found + fixed 2 more drifted values from the same
#     family #337 covered: forms/page.tsx main top padding (14px→16px)
#     and services/page.tsx main top padding (18px→16px), both now
#     matching the 16px baseline every sibling page uses.
#   Verified the substitution didn't touch look-alike-but-different
#   values (e.g. admin's 2-stop `linear-gradient(135deg,#741622,#8F1D2C)`
#   button-active-state background, which is visually and semantically
#   different from the 3-stop header gradient) — confirmed via grep
#   before and after. tsc clean.
#   NOTE on scope: the user's original ask was a full Playwright/
#   Lighthouse-verified mobile-first rebuild across 36 areas. This
#   sandbox cannot reliably run `npm run dev` or Playwright (confirmed
#   earlier this session), so that verification layer isn't available
#   here — code-level review + live-deployment inspection (curl/Chrome
#   MCP against the deployed site) is the substitute used throughout.
#   Foundation-phase work (this batch + #337) is done; page-by-page
#   migration to the shared component/token system continues in future
#   batches on request.
#
#   BATCH #339 — continued token hardening, 1-hour focused session.
#   - maxWidth: 720 (a literal number, 35 occurrences across 21 files —
#     9 page containers + 12 homepage widget components like
#     DocExpiryBanner/QuickContacts/SmartSuggestions/SavedItemsPanel/
#     DailyTip/GovCalendar/AppointmentTracker/RecentlyViewedPanel) → all
#     now read maxWidth: 'var(--container-md)'. Same 720px output,
#     single source of truth going forward.
#   - Added --header-padding: 13px 16px token; applied to all 9 real
#     sticky page headers (procedures, forms, faq, authorities,
#     drafting-studio, services, both [slug] detail clients, and
#     components/ui/index.tsx's PageHeader) — carefully matched only the
#     `position:'sticky',top:0,zIndex:50` header block via its exact
#     surrounding string, NOT the several *unrelated* buttons/list-rows/
#     cards elsewhere in settings.tsx, GuidedFlow.tsx,
#     DocumentIntelligenceView.tsx, LanguagePreferenceCard.tsx,
#     MobileModeSheet.tsx, WelcomeBackBanner.tsx that coincidentally
#     share the same "13px 16px" numeric value but aren't page headers —
#     those were deliberately left as local literals since tying them to
#     a header-specific token would be semantically wrong even though
#     numerically identical today.
#   - Found + fixed one more real outlier while doing this: my-files
#     header top padding was still 14px (hadn't been caught in #337) —
#     now 13px via the same token, matching all siblings.
#   - services/page.tsx and expat-property/page.tsx both have 2-3 more
#     "13px 16px"-valued paddings that are tab/card elements, not the
#     header — confirmed via grep context before touching anything, left
#     alone on purpose.
#   tsc clean after every step (ran ~4 times this batch).
#
#   BATCH #340 — floating-button touch-target sweep (part of the same
#   1-hour focused session as #339). Grepped every `height: 40/42,` in
#   app+components, then manually read each match's surrounding context
#   to separate real `<button>` elements from decorative icon `<div>`s
#   inside larger cards (most matches were decorative — e.g. authorities/
#   page.tsx:388, page.tsx:2299/2302, DraftingStudio.tsx:280/293,
#   ServiceGroupSheet.tsx:100, DocumentIntelligenceView.tsx:796,
#   MobileModeSheet.tsx:128 are all non-interactive icon containers,
#   correctly left alone). Found 6 genuine sub-44px interactive buttons
#   and fixed each with the existing tap-hit-N invisible-touch-zone
#   pattern (added tap-hit-1 and tap-hit-2 to the family in globals.css,
#   which previously only went 5/6/7/8/9/11/14):
#   - ProcedureBackToTopButton.tsx (40px) + ChatScrollToBottomButton.tsx
#     (40px): both tap-hit-2. Verified against the documented 10px gap
#     between this button and FeedbackWidget in the fixed floating stack
#     — after both expansions the two invisible hit-zones still clear
#     each other by 7px, no overlap.
#   - FeedbackWidget.tsx toggle (42px): tap-hit-1.
#   - TopNav.tsx language-toggle button (40px tall, was already ≥46px
#     wide so only height needed the fix): tap-hit-2.
#   - MobileMenu.tsx drawer close button (40px): tap-hit-2 — isolated
#     inside the slide-out drawer, no neighboring fixed elements, no
#     overlap risk to check.
#   - The trickiest one: the global MinistryQuickDial/AccessibilityBar/
#     GlobalLangSwitch fixed-button stack (present on every page,
#     8px real gaps between each pair by design). AccessibilityBar
#     (40px) got tap-hit-2; GlobalLangSwitch (34px, the smallest button
#     in the app) got tap-hit-5. Did the full arithmetic before touching
#     anything: AccessibilityBar's top gap to GlobalLangSwitch and
#     bottom gap to MinistryQuickDial are both exactly 8px; with both
#     expansions applied the tightest resulting clearance is 1px — thin
#     but confirmed non-overlapping, not a guess. MinistryQuickDial
#     itself was already 44px, untouched.
#   tsc clean after every edit (ran 2 more times this batch, both exit 0).
#
#   BATCH #341 — auth-page (login/register/forgot-password/reset-password)
#   visual consistency fix, closing out the same 1-hour session. These 4
#   pages share one visual template (logo circle, card, form) but were
#   built across different past batches and had drifted on ~12 numeric
#   dimensions. Ran an Explore-agent line-by-line diff of all 4 files
#   first, then picked the value already shared by 3-of-4 (or resolved
#   the couple of 2-vs-2 splits toward the more compact/mobile-friendly
#   value) as the canonical one and aligned the outlier(s):
#   - Font-family: forgot-password and reset-password were missing
#     'IBM Plex Sans Arabic' (only had Cairo/Inter as fallback) — this is
#     a real Arabic-rendering regression, not just a style nitpick, since
#     login/register already had the Arabic-optimized font. Added to both.
#   - .auth-input padding: login was 13px 16px vs 12px 16px everywhere
#     else — aligned to 12px 16px.
#   - Logo circle: login was 80×80/radius22/border2px/margin 0 auto 14px —
#     the other 3 all agree on 72×72/radius20/margin 0 auto 12px (register
#     differed only on border width, 2px vs the other two's 1.5px).
#     Aligned login AND register down to 72×72/radius20/border1.5px/mb12.
#   - Logo image: login was 56×56 vs 50×50 elsewhere — aligned to 50×50.
#   - Logo block marginBottom: login was 28 vs 20 elsewhere — aligned to 20.
#   - Brand subtitle: login was fontSize12.5/marginTop4 vs 12/3 elsewhere —
#     aligned.
#   - Card padding: split 2-vs-2 (login+forgot-password used 28px 24px,
#     register+reset-password used 24px 22px). Standardized all 4 to the
#     more compact 24px 22px.
#   - Card title h2: login was fontSize18/margin '0 0 20px' vs the other
#     3's fontSize17 (register's margin was '0 0 4px', forgot/reset's was
#     '0 0 6px') — aligned all 4 to fontSize17/margin '0 0 6px'.
#   - Error box marginBottom: login was 16 vs 14 elsewhere — aligned.
#   - Form gap: split 2-vs-2 (login+forgot-password used 14, register+
#     reset-password used 12) — standardized all 4 to 12.
#   - Field label: login was fontSize12.5/marginBottom6 vs 12/5 elsewhere
#     — aligned (both username and password labels).
#   - "Back to login/register" link marginTop: 3-way split (login 20,
#     register 16, forgot-password/reset-password 14) — standardized all
#     4 to 14.
#   - Footer disclaimer marginTop: login was 20 vs 18 everywhere else —
#     aligned.
#   Deliberately left alone: register's "free for 3 days" badge block
#   (structurally unique to that page, not a drift) and the submit
#   button's optional marginTop:4 (present on register/reset-password
#   only, ~4px difference, negligible visual impact not worth 2 more
#   edits for). tsc --noEmit clean after all 4 files.
#
#   BONUS FIX (same batch): audited every maroon-gradient primary-CTA
#   button app-wide (37 instances across 24 files) for the same class of
#   drift as the auth-page audit. Finding: unlike the auth pages, there
#   is genuinely no dominant pattern here — 33 distinct (padding/radius/
#   fontSize/shadow) combinations across 37 buttons, each contextually
#   sized to its own compact list-row/card/standalone-CTA container.
#   Mass-normalizing all 37 without live visual verification (not
#   possible in this sandbox) would be real, unverifiable regression
#   risk for near-zero user-facing benefit — same judgment already
#   applied earlier this session to border-radius and breakpoint-scheme
#   normalization, so deliberately left alone. Fixed only the one clear,
#   narrow exception found: error.tsx and global-error.tsx both render
#   the literal same "Try Again" button (same role, near-identical
#   trigger condition — route-level vs root-layout-level crash) but had
#   drifted to different radius/fontSize/shadow (12/13/0.25 vs
#   10/14/0.28). Aligned global-error.tsx to error.tsx's values. Did NOT
#   add the icon or restructure global-error.tsx to match error.tsx's
#   markup — global-error.tsx intentionally avoids importing shared
#   components/LanguageContext since it's the last-resort fallback that
#   must still render if even the root layout crashes; that's a
#   deliberate resilience choice, not a bug. tsc clean.
#
#   BATCH #342 — "world-class additions" session (new standing directive:
#   3-hour continuous improvement pass). Verified the skip-to-content link
#   (WCAG 2.2 AA) was already correctly implemented from an earlier batch —
#   no fix needed there. New additive work this batch:
#   - NEW components/Breadcrumbs.tsx + lib/breadcrumbJsonLd.ts: a reusable,
#     bilingual (AR/EN), RTL-aware breadcrumb trail component, plus a shared
#     BreadcrumbList JSON-LD builder. Applied to the two highest-traffic
#     detail-page templates: procedures/[slug] and forms/[slug] — both now
#     show a visible "الرئيسية › الإجراءات/النماذج › [العنوان]" trail (new
#     UX, improves wayfinding on deep pages) AND emit matching BreadcrumbList
#     structured data via the existing server page.tsx wrapper pattern
#     (same approach already used for procedures' HowTo schema). Purely
#     additive — no existing back-button/header navigation removed.
#   - NEW: Organization + WebSite/SearchAction JSON-LD added to
#     app/layout.tsx (site-wide, invisible). Built only from real, already-
#     verified data — the real support WhatsApp number wired in batch #327,
#     and the homepage's actual `?q=` query param, which already triggers a
#     genuine AI search on load (see app/page.tsx's existing ?q= handler) —
#     not a placeholder endpoint. This is what lets Google potentially show
#     a Knowledge Panel / sitelinks search box; standard for any
#     "world-class" production site.
#   - Considered and declined: FAQPage JSON-LD on /faq. The real Q&A data
#     in lib/serviceFAQ.ts exists (48 real entries) but its `title` fields
#     are topic headings ("رخصة البناء - الإجراءات والرسوم"), not phrased
#     as literal questions — forcing them into FAQPage's Question/Answer
#     schema would be a content-type mismatch even though the underlying
#     data is real, not mock. Skipped rather than force a technically
#     questionable schema onto real content.
#   - ACCESSIBILITY: audited every modal/sheet/drawer overlay in the app for
#     Escape-to-close (WAI-ARIA APG requirement for any dialog). Found 3
#     with a "fragile" Escape handler — attached directly to the dialog
#     `<div>` via onKeyDown, but nothing ever moves keyboard focus into that
#     div on open, so on a real keyboard-only visit Escape silently does
#     nothing until the user has already tabbed inside once. Fixed
#     ServiceGroupSheet.tsx, MobileModeSheet.tsx, and
#     ProcedureFilterDrawer.tsx by adding a document-level `keydown`
#     listener (useEffect + window.addEventListener), matching the already-
#     robust pattern used elsewhere in the app (GuidedFlow, MobileMenu,
#     GlobalSearch, KeyboardShortcutsHelp, EscalationModal, etc — 10 of 13
#     audited overlays already did this correctly). Also found 2 floating
#     panels with zero Escape handling at all — AccessibilityBar's options
#     panel and MinistryQuickDial's ministry-directory sheet — added the
#     same document-level listener to both. Deliberately left
#     UserOnboarding.tsx untouched: it's a forced first-run wizard, and
#     whether Escape should skip a first-run flow is a product decision,
#     not an accessibility bug — not something to silently decide unasked.
#   - Verified in passing: the homepage chat region already has
#     aria-live="polite" on its message container (app/page.tsx:1862) — a
#     real "world-class" chat-a11y pattern already correctly in place, no
#     fix needed.
#   tsc --noEmit clean after every step in this batch.
#
#   BATCH #343 — canonical URL / metadataBase fix (same "world-class"
#   session). Audit found only 3 of ~20 routes had `alternates.canonical`
#   set (root layout, procedures/[slug], forms/[slug]) — AND none of them
#   had `metadataBase` configured on the root layout, which Next.js needs
#   to resolve any *relative* canonical/OG path to a real absolute URL.
#   Without it, the two existing canonical tags from earlier batches
#   couldn't be trusted to render correctly in production (silent
#   fallback/warning). Fixed the root cause first — added `metadataBase:
#   new URL('https://dalilak-frontend.vercel.app')` to app/layout.tsx —
#   then added `alternates: { canonical: '/<route>' }` to the 7 public,
#   search-indexable list pages that were missing it entirely: services,
#   services/expat-property, procedures, forms, faq, drafting-studio,
#   authorities. Deliberately skipped the 8 routes that already carry
#   `robots: { index: false }` (login, register, forgot-password,
#   reset-password, settings, professional, my-files, admin) — a canonical
#   tag on a page search engines are already told not to index adds no
#   real value, so left those alone rather than doing low-value busywork.
#   tsc clean after every edit.
#
#   BATCH #344 — form-field labeling audit (continuing "world-class"
#   session, part of the same standing directive). Ran a dedicated
#   Explore-agent audit for every `<input>`/`<textarea>`/`<select>` in the
#   app lacking BOTH a `<label htmlFor>` and an `aria-label`/
#   `aria-labelledby` (a placeholder alone does not count — screen readers
#   don't reliably announce placeholders, and they vanish once the user
#   starts typing). Found 19 genuine gaps across 13 files and fixed all of
#   them with a bilingual `aria-label` (or, for the 2 professional/page.tsx
#   fields that already had a *visible* `<label>` sitting unassociated next
#   to the input, added the missing `htmlFor`/`id` pair instead of a
#   redundant aria-label):
#   - app/page.tsx — the homepage's main hero search/chat input (the
#     single most-used control in the whole app) had no aria-label at all.
#   - Search bars: ChatMessageSearchInThread, MinistryQuickDial,
#     ProcedureComparator, HomepageWeeklyGoalWidget, DocChecklistBuilder,
#     ProcedureSearchModal.
#   - Notes/comment fields: my-files notes textarea, QuickNotepad,
#     ProcedureNotesPanel, FeedbackWidget's optional comment box.
#   - Date/number pickers: ProcedureStepTimer, ProcedureCountdownTimer,
#     ProcedureReminderBell, ProcedureDocumentStatus (label includes the
#     specific document name per-row, not a generic "date"), SmartReminder
#     (title + date), procedures/page.tsx's per-procedure deadline picker.
#   - components/AppointmentTracker.tsx — the entire add/appointment form
#     (title, location, date, time, note — 5 fields) had zero programmatic
#     labels.
#   - app/professional/page.tsx — client-name and matter-subject fields had
#     a visible `<label>` that was never actually wired to its `<input>`
#     (no htmlFor/id pair) — fixed the association, not just added a
#     duplicate aria-label.
#   Also fixed one unrelated but related-class defect found while auditing
#   images: app/page.tsx:2298's attached-file preview thumbnail had
#   `alt="preview"` — a generic/unhelpful placeholder alt text (same
#   anti-pattern as a missing label). Now uses the real attached filename.
#   tsc --noEmit clean after every edit in this batch.
#
#   BATCH #345 — UX_AUDIT.md Phase 1+2: floating-button consolidation +
#   4-item Bottom Nav. First real-implementation batch against the new
#   "Principal Product Designer" UX-redesign brief (full audit trail now
#   lives in UX_AUDIT.md at the repo root — read that file for the complete
#   problem/location/impact/priority/solution/status breakdown; this is
#   just the commit-log summary).
#   - Removed GlobalLangSwitch and AccessibilityBar from the global floating
#     stack (app/layout.tsx). Zero functionality lost: language toggle
#     already lives in TopNav (visible at every breakpoint, verified via
#     code audit — the old "hidden on mobile" premise was stale) and in
#     MobileMenu; accessibility toggles already live in full on /settings
#     (confirmed same localStorage keys as the removed AccessibilityBar).
#   - MinistryQuickDial: removed its persistent FAB trigger only. The sheet
#     (20 government/emergency phone numbers, searchable) is unchanged and
#     now opens via a `dalilak-open-ministry-dial` window event, triggered
#     by a new "أرقام الوزارات والطوارئ" row in MobileMenu.
#   - FloatingHelpButton: removed entirely from app/page.tsx. Its emergency
#     numbers are functionally covered by MinistryQuickDial's sheet (same
#     numbers plus more); its FAQ link duplicate was already a MobileMenu
#     nav item.
#   - KeyboardShortcutsHelp: removed its corner "?" FAB only. The "?"
#     keyboard shortcut itself still works identically — this was a
#     desktop-only power-user feature whose only real discovery path was
#     always the key itself, documented in the modal's own footer.
#   - Cleaned up now-dead CSS (.kbd-shortcuts-fab rule) and repositioned
#     FeedbackWidget / AppointmentReminder's toast, which had hardcoded
#     offsets to clear a FAB stack that no longer exists.
#   - Also fixed a MobileMenu.tsx data bug found during this audit: the nav
#     list had "Authorities" (/authorities) listed twice under two
#     different labels ("الجهات الحكومية" and "الجهات المختصة") — removed
#     the duplicate.
#   - BottomNav.tsx: reduced from 5 items to exactly 4 (Home / Procedures /
#     Chat-FAB / Account), per the brief's explicit requirement. Dropped
#     "Services" from the bar specifically — not deleted, /services remains
#     fully reachable via MobileMenu and the homepage's search + category
#     grid. Mechanical, low-risk change: the nav is `flex:1`-per-item, so
#     removing one entry re-balances automatically with no layout code
#     changes needed.
#   Net result: the always-on floating-button stack that used to have up to
#   3 persistent items in one corner (plus a 4th colliding with a 5th on
#   desktop) is now empty by default — only genuinely contextual,
#   auto-hiding elements remain (scroll-to-bottom/back-to-top, which only
#   appear during active scrolling, and FeedbackWidget, which is gated
#   behind real usage signals).
#   tsc --noEmit clean after every edit. Full remaining-scope tracking
#   (homepage rebuild, design-system audit, procedure-page restructure,
#   chat redesign, full WCAG pass, responsive/performance work) is in
#   UX_AUDIT.md's "بنود مؤجَّلة" table — nothing there is silently dropped,
#   it's explicitly tracked as not-yet-done.
#
#   BATCH #346 — dead-code removal in app/page.tsx, found while auditing
#   the homepage structure for the simplification pass. A ~110-line block
#   of ~30 "homepage widget" components (WelcomeBackBanner, SmartReminder,
#   GovCalendar, 11x SectionCollapseToggle groups, etc.) was 100%
#   unreachable: it was gated by `messages.length===0` but nested INSIDE
#   the `messages.length>0` (chat-view) branch of the page's main ternary
#   — verified by manually tracing the bracket structure (ternary opens
#   line 1373, chat-view branch starts 1859, dead block at 1946-2055,
#   ternary closes 2158) before touching anything. This code never
#   rendered for any user, ever — so removing it is a pure bundle-size/
#   performance win with zero visible or functional change. Removed the
#   dead JSX plus every import used exclusively by it (~20 eager imports
#   + a whole next/dynamic-based lazy section of ~30 more, verified via
#   `grep -c` on every single name before deleting anything; the one
#   exception, `saveChatSession` from ChatHistoryPanel.tsx, is a separate
#   named import genuinely still used elsewhere in the file and was left
#   untouched). None of the underlying component files were deleted —
#   SmartReminder.tsx, GovCalendar.tsx etc. all still exist and remain
#   available if the new homepage design wants to reuse any of them; only
#   the dead call site was removed. app/page.tsx: 2770 -> 2602 lines.
#   Also incidentally confirmed via this audit that the *visible* homepage
#   (hero + 6 procedure cards + 10 category chips + life-journey grid +
#   3-step explainer + trust grid + footer, 4 primary CTAs) is already
#   much closer to the brief's "simple homepage" target than assumed —
#   full details + what's still pending in UX_AUDIT.md.
#   tsc --noEmit clean; grep-verified zero leftover references to any
#   removed identifier.
#
#   BATCH #347 — FeedbackWidget: last remaining floating-button exception,
#   closed out. Converted from a fixed-position corner FAB to an inline
#   card rendered within the chat message flow (same placement/style
#   pattern as ChatSummaryCard: collapsed row that expands in place, no
#   floating popover). Same appear-after-usage trigger logic untouched
#   internally (3+ messages or 5+ min session). One honest behavioral
#   note: since it now mounts only inside the active-chat view (same as
#   ChatSummaryCard), the "5 min of homepage browsing with zero messages
#   sent" trigger path no longer fires — intentional trade-off, not an
#   oversight (asking for feedback during real engagement beats
#   interrupting silent homepage browsing, and keeps the homepage free of
#   extra elements per the simplification goal). Full reasoning in
#   UX_AUDIT.md. With this, zero floating-button exceptions remain
#   app-wide. tsc --noEmit clean.
#
#   BATCH #348 — WCAG 2.2 AA contrast audit (computed, not guessed) + a
#   critical regression fix caught in the process of doing it.
#
#   Contrast audit: extracted every text-color design-token hex value from
#   globals.css and computed real WCAG contrast ratios via the official
#   relative-luminance formula (Python script, not eyeballing). Found two
#   real failures: --text-3 (#918B82) was 3.18:1 on --bg / 3.38:1 on
#   --surface, failing the 4.5:1 normal-text AA threshold despite being
#   used as genuine small-caption/meta text (not large text) across 27+
#   files; --text-4 (#B8B2AA) was 1.98:1/2.10:1, failing even the 3:1
#   non-text threshold, and grep confirmed 89 real usages across 32 files
#   were genuine readable text (empty states, counts, timestamps at
#   10-12.5px), not the placeholder-only use its own comment claimed.
#   Fixed: darkened --text-3 to #76716A (4.55:1/4.84:1, same hue) — one
#   token edit, cascades everywhere. Bulk-migrated (via targeted sed on
#   every file grep confirmed had a real content usage) all 89 var(--text-4)
#   text-color usages to var(--text-3); left --text-4's own token value
#   unchanged since its only remaining uses (::placeholder, scrollbar-thumb)
#   are legitimately exempt from text-contrast requirements. One deliberate
#   exception not touched: Breadcrumbs.tsx's aria-hidden separator glyph,
#   which conveys no information and is correctly exempt.
#
#   Regression found + fixed while doing the above: removing
#   AccessibilityBar's floating FAB in batch #345 also silently broke the
#   actual visual effect of high-contrast/large-text/reduce-motion, because
#   the CSS rules for .dalilak-high-contrast/.dalilak-large-text/
#   .dalilak-reduce-motion lived ONLY inside that component's own inline
#   <style> tag — nowhere else, not in globals.css. /settings kept toggling
#   the classes on <html> correctly, but with the defining component
#   unmounted, those classes had zero CSS backing them = zero visible
#   effect for anyone who turned the toggle on after batch #345. Fixed by
#   moving the three CSS rules permanently into globals.css and creating
#   components/AccessibilityEffects.tsx — a render-nothing component,
#   mounted in app/layout.tsx exactly where AccessibilityBar used to be,
#   whose only job is applying the stored localStorage preference to
#   <html> on every page load (plus a storage-event listener for
#   cross-tab sync). Zero floating button re-added; the "one floating
#   button app-wide" rule from batch #345-347 stays fully intact — only
#   the underlying functionality (not the FAB) was restored. Full incident
#   writeup in UX_AUDIT.md. tsc --noEmit clean.
#
#   BATCH #349 — WCAG 2.2 AA heading-hierarchy audit + fixes, 6 files.
#   Ran a dedicated sub-agent audit across every literal <h1>-<h5> tag on
#   19 route files, tracking conditional/empty/selected states (not just
#   the happy path). Real findings, all fixed:
#   - app/page.tsx: zero headings anywhere once a chat is active (the
#     page's only h1 lives in the welcome-screen branch, which fully
#     unmounts once messages.length>0) -> added a visually-hidden
#     `<h1 className="sr-only">` at the top of the chat view.
#   - ProcedureDetailClient.tsx: "not found" state had only an h2 (no h1
#     for what is the entire page content in that state) -> promoted to
#     h1. Normal state jumped h1 straight to h3 (the shared `Section`
#     component used for Documents/Steps/Authority/Fees headings) with no
#     h2 anywhere -> promoted Section's heading to h2.
#   - services/page.tsx, my-files/page.tsx, admin/content/page.tsx: same
#     recurring pattern — a grid/list of card titles rendered as h3 sits
#     directly under the page h1 with no h2 section label wrapping it ->
#     added a visually-hidden `<h2 className="sr-only">` (with a live
#     result count) immediately before each grid/list.
#   - admin/page.tsx: "create user" and "reset codes" tab panels used h3
#     directly under the page h1 -> promoted both to h2 (no other h2
#     exists in those tab states, so this was a safe direct promotion,
#     not an addition).
#   Verified via the same audit that 13 other files (procedures/page.tsx,
#   forms/page.tsx, FormDetailClient.tsx, faq/authorities/settings/
#   professional/drafting-studio pages, all 4 auth pages) already had
#   correct single-h1/no-skipped-level structure — left untouched.
#   Technical note: since this codebase is 100% inline-style (no CSS
#   classes drive heading size/weight), every h-tag swap here is a pure
#   semantic fix with zero visual change — verified safe by construction,
#   not just by inspection. tsc --noEmit clean.
#
#   BATCH #350 — homepage density pass against the UX brief's explicit
#   numeric targets ("max 4 popular-transaction cards", "limited category
#   grid"). Audited the actual hero first: it already matched the brief
#   (2 CTAs only — "Ask Dalilak" primary + "Browse Procedures" secondary —
#   plus a prominent search bar as the primary element), so no hero change
#   was needed. Two sections below it did exceed the brief's limits:
#   - "Most Requested Procedures" grid: 6 cards -> 4 (kept Passport, Civil
#     Registry Extract, Company Registration, Vehicle Registration; moved
#     Driver's License Renewal and Residency Renewal off the homepage).
#     Both removed procedures stay fully reachable via /procedures (the
#     section's existing "All" link), search, categories, and life
#     journeys — no functionality removed, purely a homepage display cut.
#   - "Browse by Category" chip row: 10 chips -> 6 (kept Personal Status,
#     Travel & Residency, Business, Vehicles & Transport, Real Estate,
#     Municipalities; moved Notary Public, Education, Labor & Social
#     Security, Legal Procedures off the homepage). Added a new "All
#     categories" link next to the section heading (same visual pattern
#     as the procedures section's "All" link) pointing to /services,
#     which was independently verified to have its own complete
#     category-filter system (SERVICE_CATEGORIES with per-category
#     service counts) — the link lands on a fully functional page, not a
#     dead end.
#   Deliberately left untouched this batch: the "How it works" 3-step
#   section and the 4-card "Trust" grid below it. The brief calls for a
#   single "small trust line", but collapsing either section means either
#   deleting real descriptive copy or making a non-trivial content-
#   placement decision — flagged in UX_AUDIT.md as the explicit remaining
#   scope for the homepage item rather than rushed this batch. tsc --noEmit
#   clean.
#
#   BATCH #351 — WCAG 2.2 SC 1.4.1 "use of color" audit. Ran a dedicated
#   sub-agent sweep of every status/risk/priority/difficulty badge in the
#   app (~15 components) for information conveyed by color alone. Most were
#   already compliant (text or icon alongside color: RiskScoreCard,
#   ProcedureDifficultyBadge, ProcedurePriorityTag, MinistryOpenHoursWidget,
#   TransactionFilePanel, TopNav online dot, NotificationBell,
#   ProcedureLastUpdatedBadge, HomepageProgressRing, ProcedureCompletionBadge,
#   admin status chips). Two real, fixed issues:
#   - QuickContacts.tsx: collapsed contact chip's open/closed dot was color
#     only (green/red, no text, not even for screen readers). Now: filled
#     circle = open, hollow ring = closed (shape, not just color) + a
#     visually-hidden "— Open now"/"— Closed now" label added to the button.
#   - HomepageCalendarWidget.tsx: calendar-grid deadline vs reminder dots
#     were identical circles differing only in red vs. purple. Reminder dot
#     is now a rotated square (diamond), matching a shape change also
#     applied to the legend swatch below; each day's aria-label now states
#     which event type(s) it has instead of just a count.
#   Deliberately left alone: ProcedureVersionTag's compact freshness dot —
#   it already has a full text alternative (persistent aria-label + hover/
#   focus/click tooltip) and conveys secondary/decorative info (last-update
#   recency), not something needed to complete a task; forcing a permanent
#   visible label would fight the component's documented purpose (compact
#   badge for space-constrained list rows). Also verified in passing: every
#   auth page (login/register/forgot-password/reset-password) already uses
#   role="alert" on its error box — no change needed. tsc --noEmit clean.
#
#   BATCH #352 — real mislabeled-button bug found while auditing the
#   procedure detail page for "one primary + one secondary CTA". The
#   action row next to "Ask Dalilak" had a button labeled "المعالج"/
#   "Wizard" whose onClick was `router.push('/')` — it only ever went to
#   the homepage, never opened any guided wizard for that specific
#   procedure (confirmed: GuidedFlow has no per-procedure deep-link
#   mechanism, it's a homepage-only modal). Rather than build a new
#   deep-link feature (bigger, separate-decision scope), fixed the
#   dishonest label to match the real behavior: now says "الرئيسية"/
#   "Home" with a home icon + clear aria-label. Zero behavior change,
#   pure clarity fix — the button now does what it says. tsc --noEmit
#   clean.
#
#   BATCH #353 — started "simplify the chat interface" (a mega-prompt item
#   untouched all session). Audit found the single highest-frequency
#   clutter spot in the whole app: every assistant message rendered 10
#   separate clickable controls below it (ChatMessageActions' copy/share/
#   save = 3, ChatPinButton, ChatVoicePlayback, ChatEmojiReactions' 4
#   always-visible emoji buttons, ChatSaveToNotes) — this repeats per
#   message, so it compounds far worse than any once-per-page clutter
#   fixed earlier this session. Kept ChatMessageActions (copy/share/save)
#   always visible, added one new "•••" (More) toggle per message
#   (expandedMsgActions: Set<number> state keyed by message index) that
#   reveals the other 7 controls on demand. Zero components changed,
#   zero functionality removed — same props, same behavior, one extra
#   tap for secondary actions. Default visible controls per message:
#   10 -> 4. Remaining chat-simplification scope (input toolbar row,
#   top-of-chat widget row) is lower priority since those render once
#   per session, not once per message — left for a follow-up batch.
#   tsc --noEmit clean.
#
#   BATCH #354 — real performance fix, following the still-open
#   "performance optimization" backlog item. app/page.tsx imported
#   TX_ALL/TX_WITH_FORMS/TX_MINISTRIES (lib/allTransactions.ts, ~400KB
#   source), ENRICHED_PROCEDURES (lib/enrichedProcedures.ts, ~256KB), and
#   ALL_SERVICES (lib/allServices.ts, ~1MB) — verified via grep that each
#   identifier appears exactly once in the entire file: the import line
#   itself. 100% dead imports, ~1.7MB of unused data bundled into the
#   homepage's JS for zero reason. Deleted both import lines. tsc --noEmit
#   clean confirms nothing else in the file depended on them (a real
#   usage would have failed the build immediately). Pages that actually
#   use this data (/procedures, /services, /forms, etc.) import it
#   directly from the same source files and are completely unaffected.
#
#   BATCH #355 — user reported the mobile interface "didn't look changed
#   as expected." Verified the deployment itself was current (checked the
#   live site, confirmed batch #350's 6-chip category row + "All
#   categories" link were showing). Root cause found by reading code, not
#   guessing: every homepage section's vertical padding used
#   clamp(desktop-floor, Nvw, desktop-max) — but at real phone widths the
#   vw term (e.g. 5vw at 390px = 19.5px) is always far below the floor
#   (32-48px), so every section ALWAYS rendered at its full desktop-sized
#   padding on mobile too. Total section padding stacked up to ~536px of
#   pure whitespace on a single mobile pageload — this is almost
#   certainly the dominant reason nothing felt different despite this
#   session's other fixes (which mostly reduced content counts, not
#   spacing). Lowered the floor only (not the desktop max) on all 7
#   sections + footer: hero 48->28/56->32, procedures 48->28, categories
#   32->20, life-journeys 48->28, how-it-works 48->28, trust 40->24,
#   footer 40->28/24->20. Verified by construction that desktop is
#   unaffected: at 1280-1440px widths the vw term is well above both the
#   old and new floor, so clamp() still resolves to the same vw-based
#   value as before — this is a mobile-only change. New mobile section
#   padding total: ~316px (down ~40%). tsc --noEmit clean. Could not
#   capture an actual narrow-viewport screenshot this session (the
#   available browser resize tool did not actually change the page's
#   viewport width in this sandbox) — asked the user to confirm on a
#   real phone after this deploys.
#
#   BATCH #356 — audited TopNav.tsx header height against the brief's
#   56-64px spec. Found it's a fixed height:64 (line 112) — already at
#   the top of the allowed range. No code change needed; documented in
#   UX_AUDIT.md so this isn't re-audited from scratch later.
#
#   BATCH #357 — perf: GuidedFlow/TransactionStarter/ServiceGroupSheet
#   were eager-imported into app/page.tsx even though all three are
#   modals that only mount after an explicit user action (most visits
#   never open them). Converted all three to next/dynamic with
#   ssr:false (verified each returns null / is gated by a `{show &&}`
#   wrapper when closed, so lazy mounting is safe). The type-only
#   `StarterResult` import stayed a static import (types are erased at
#   build time, no need to route it through dynamic()). tsc clean.
#
#   BATCH #358 — chat input-toolbar declutter. Audited every control
#   above the message box (ModeSelector, ChatResponseLength,
#   ChatContextBar, ChatKeyboardSendHint, ChatInputCharCounter,
#   ChatDraftAutosave, ChatQuickReplies): most already self-hide when
#   irrelevant (ChatContextBar hides when empty, ChatInputCharCounter
#   hides under 200 chars, ChatKeyboardSendHint hides entirely on touch
#   devices, ChatDraftAutosave renders nothing visible at all). The one
#   real offender: ChatResponseLength renders a permanent 3-button
#   full-text toggle right next to ModeSelector's already-compact
#   single-button-plus-sheet mobile pattern, creating an asymmetric,
#   crowded row on phones. Added a 640px breakpoint (matching
#   ModeSelector's own breakpoint) that hides the text labels under
#   640px, keeping icons + explicit aria-label/title per button (a
#   small extra accessibility win, since the accessible name no longer
#   depends solely on visible text). Zero functionality removed — same
#   3 length options, just narrower on mobile. tsc clean.
#
#   BATCH #359 — WCAG 2.2 "Bypass Blocks" landmark-region audit via an
#   Explore agent covering every app/**/page.tsx and all <nav>/<header>/
#   <footer> usage. Found: (1) app/professional/page.tsx and
#   app/settings/page.tsx had no id="main-content" at all — the global
#   skip-link in app/layout.tsx was a dead link on both pages. Fixed by
#   converting each page's content wrapper to <main id="main-content">,
#   matching the same header-outside/BottomNav-outside pattern already
#   used in procedures/page.tsx. All other 18 checked pages already had
#   exactly one correctly-placed <main id="main-content">. (2) All <nav>
#   elements already have distinct aria-labels — no fix needed. (3) The
#   homepage (app/page.tsx) renders two <footer> landmarks
#   simultaneously in the welcome state — the marketing footer and the
#   always-mounted chat-input toolbar (which uses a <footer> tag despite
#   being an input bar, not page contentinfo) — neither had a
#   distinguishing aria-label. Added aria-label to both ("Page footer" /
#   "Message input bar") without changing either element's tag (avoids
#   any risk from CSS selectors keyed on the footer tag). tsc clean.
#
#   BATCH #360 — keyboard tab-order audit. grep confirmed zero positive
#   tabIndex values anywhere (no anti-pattern). But found all 13
#   role="dialog" components in the app (GlobalSearch, MobileMenu,
#   ServiceGroupSheet, MobileModeSheet, GuidedFlow, TransactionStarter,
#   ProcedureSearchModal, ProcedureFilterDrawer, PrintProcedureModal,
#   EscalationModal, DocumentIntelligenceView, AccessibilityBar,
#   FloatingHelpButton) handle Escape-to-close and body-scroll-lock but
#   none trap Tab — a keyboard user can Tab straight out of an open
#   dialog into hidden background content (WCAG 2.4.3 gap). Built a
#   reusable lib/useFocusTrap.ts hook (cycles Tab/Shift+Tab within a
#   container ref, focuses the first focusable element on open, restores
#   focus to the trigger on close) and wired it into the two
#   highest-traffic dialogs: GlobalSearch (Cmd+K) and MobileMenu (the
#   primary mobile nav drawer). The other 11 components are a mechanical
#   follow-up (same 2-line wiring each) — deferred to a future batch
#   rather than editing 11 files unverified in one pass. tsc clean.
#
#   BATCH #361 — finished the focus-trap rollout from batch #360: wired
#   useFocusTrap into the remaining 11 role="dialog" components
#   (ServiceGroupSheet, MobileModeSheet, GuidedFlow, TransactionStarter,
#   ProcedureSearchModal, ProcedureFilterDrawer, PrintProcedureModal,
#   EscalationModal, DocumentIntelligenceView's GenerateDraftModal,
#   AccessibilityBar, FloatingHelpButton). For each, checked whether the
#   parent always keeps it mounted only while open (`{show && <X/>}` —
#   trap is simply always-active) vs. an internal `open` state (trap
#   tied to that state) rather than assuming one pattern for all 13.
#   FloatingHelpButton reused its existing panelRef (previously only
#   used for outside-click detection) since it already wraps both the
#   trigger button and the panel — the correct trap boundary. Verified
#   effect ordering in components that explicitly focus a specific
#   element on open (GuidedFlow/TransactionStarter/EscalationModal's
#   closeRef.current?.focus()) — the explicit focus call is declared
#   after useFocusTrap's own auto-focus-first-element effect, so it always
#   wins and nothing changed about where focus lands on open. All 13
#   dialog components in the app now correctly trap Tab. tsc clean.
#
#   BATCH #362 — ChatSessionTimer perf fix: was ticking every 1s with
#   HH:MM:SS display, forcing a re-render every single second for the
#   entire duration any chat stayed open. Changed to minute-granularity
#   display ("Xm"/"Xد") updated every 30s — 30x fewer re-renders, same
#   visible feature, zero functionality removed. Also audited the rest
#   of the top-of-chat widget row (ChatSummaryCard, HomepageChatSuggestionsBar,
#   ChatSessionSummaryChip, ChatPinnedBanner, ChatLanguageToggleChip) —
#   all already self-gate correctly, no changes needed there. tsc clean.
#
#   BATCH #363 — two more lazy-load perf fixes, continuing batch #357's
#   work: (1) DocumentIntelligenceView.tsx (944 lines, the single largest
#   component in the app) was eager-imported in ChatMessage.tsx even
#   though it only renders when msg.documentAnalysis is set — true for a
#   small minority of messages (only ones from an uploaded-document
#   analysis). (2) UserOnboarding.tsx (433 lines) was eager-imported in
#   app/page.tsx despite being fully self-gated (`if (!show) return null`,
#   show derived from localStorage — only true for genuine first-time
#   visitors). Both converted to next/dynamic with ssr:false (pure
#   client-side, no SEO content in either). KeyboardShortcutsHelp (168
#   lines) and AppointmentReminder (188 lines) are smaller further
#   candidates, deferred to avoid an oversized batch. tsc clean.
#
#   BATCH #364 — top-of-chat widget row follow-up to batch #362's audit.
#   ChatLanguageToggleChip renders from the very first message onward and
#   had NO dismiss control at all — the only way to make it stop
#   reappearing was to actually trigger a language-switch prompt, even for
#   a user who never wants that feature. Added a "✕" dismiss button next
#   to the chip (same pattern ChatSessionSummaryChip already uses), with
#   its own `dismissed` state. Clicking the chip itself still behaves
#   exactly as before — only the "ignore it without using it" path is new.
#   components/ChatLanguageToggleChip.tsx. tsc clean.
#
#   BATCH #366 — "Calm Government Digital Service" v4.0 rebuild. User
#   rejected the incremental polish approach entirely (screenshot showed
#   the mobile app "still looks the same") and gave a full 29-section
#   design brief demanding a from-scratch mobile-first visual rebuild —
#   same brand (name/logo/maroon), fully new calm/minimal execution, no
#   gradients, no shadows, exact color/type/spacing/radius tokens, and a
#   literal 10-section homepage order. This batch executes the highest-
#   priority items from that brief (mobile visual quality > clarity >
#   simplicity, per the user's explicit priority order):
#   - globals.css: new v4.0 token block — brand #9F1D2F (hover #861827,
#     soft #F8ECEF), bg #F8F8F6, surface #FFFFFF, text #181817/#65635F,
#     border #E5E2DD, radius 12/14/20, all shadows flattened to near-zero,
#     every gradient token redefined as a flat-color alias (gradients are
#     explicitly banned by the brief). .btn-primary/.ds-card/.pcard
#     updated to match (no radius/shadow-lift hovers, border-color-only
#     hover feedback).
#   - TopNav.tsx: mobile header rebuilt to logo + hamburger only (was
#     logo + bell + search + new-chat pill + language toggle + divider +
#     hamburger, all fighting for a 56-64px row) — the other controls
#     moved into MobileMenu's drawer, not deleted. Hamburger 44x44->40x40,
#     bars normalized to uniform 16px/var(--text-1), safe-area-inset-top
#     padding added.
#   - MobileMenu.tsx: absorbed the header's search + notifications (both
#     reused as live embedded components, not reimplemented) plus new
#     Accessibility/Help/About/Privacy rows so nothing lost functionality.
#   - NEW app/privacy/page.tsx: simple, technically-accurate privacy page
#     (localStorage/account/AI-chat data behavior only — no invented legal
#     claims) since the drawer now links to one.
#   - app/page.tsx homepage, rebuilt to the brief's literal 10-section
#     order:
#     · Hero: replaced badge+two-tone-H1+dual-CTA+chips block with a
#       single H1 ("ما المعاملة التي تبحث عنها؟"), one search bar (no
#       separate submit button — search/clear/AI-enhance/mic all live
#       inside the 56px input), and exactly 2 quick-action buttons.
#     · "الأكثر بحثاً": 4-card grid -> a single bordered list of 4 full-
#       width rows (icon+name+arrow), same 4 real procedures.
#     · "تصفح حسب الفئة": pill row -> a fixed 2-column grid of 6 cards,
#       same 6 real categories, new inline line-icons per category.
#     · Removed from homepage render (data/logic NOT deleted — Life
#       Journeys stays reachable via search/menu's onJourneySelect):
#       the Life-Journeys grid, the 3-step "How it works" explainer, and
#       the 4-card Trust grid — replaced by the brief's required single
#       trust line ("المعلومات مرتبطة بمصادر رسمية...").
#     · Footer: 3-column dark (#191713) footer with 8 links + inline lang
#       toggle -> one compact light row (brand mark, copyright, About/
#       Privacy links, legal line). Dropped links (Services/Procedures/
#       Authorities/Forms/FAQ/My Files/Drafting Studio) all remain one
#       tap away via the hamburger drawer — nothing removed, consolidated.
#     · Home tab's onClick (BottomNav + MobileMenu) updated to run the
#       exact save-session+clear-chat sequence the old header "new chat"
#       button used to run, since that button no longer exists in the
#       header.
#   - BottomNav.tsx: removed the raised circular gradient FAB for the
#     chat tab (had a colored box-shadow, translateY(-10px) lift, and its
#     own bounce transition — all banned by the "no size change, no
#     raised position, no shadow, no long top-bar" spec). Now a plain 4th
#     flat tab like the other three, var(--brand) tint when active, min-
#     height 64px, no top active-indicator bar (color/weight alone signal
#     active state, matching the other 3 tabs' existing pattern). Chat
#     tab relabeled "اسأل دليلك" per the brief's literal nav-label list.
#   Known deliberate scope cuts this batch (tracked, not forgotten): the
#   brief's per-component extraction (MobileHeader/SearchInput/
#   ServiceCategoryCard/etc. as standalone files — everything above is
#   still inline in page.tsx/TopNav.tsx), the /procedures and procedure-
#   detail page rebuilds, and the chat-interface rebuild are NOT done
#   yet — continuing in the next batch. No backend/API/auth/route/env
#   changes; no real content deleted (only default-visibility/placement
#   changed, with reachability re-verified for everything moved). tsc
#   --noEmit clean after every file this batch.
#
#   BATCH #367 — continuing the v4.0 rebuild onto /procedures
#   (app/procedures/page.tsx), starting with the highest-visibility,
#   lowest-risk part: the header, stats strip, ministry filter chips, and
#   search bar, plus the collapsed (non-expanded) state of every procedure
#   row. Same token substitution pattern as batch #366: gradient maroon
#   header -> flat surface header with border-bottom (language toggle
#   dropped, already reachable via MobileMenu); gradient/shadow stat cards
#   -> 3 uniform flat cards; heavy-bordered ministry chips -> flat pills
#   (brand-soft fill only when active); search field shadow/double-ring
#   focus -> flat 1px border + 14px radius; procedure-card borders/icon
#   badges/status pills all switched from rgba(143,29,44,*) one-offs to
#   var(--brand-soft)/var(--bg)/var(--border) tokens.
#   Explicitly NOT done this batch (documented in UX_AUDIT.md, not
#   silently skipped): the enriched-procedure row's expanded-state
#   internals (35+ sub-components per card, already grouped via
#   ProcedureSectionGroup in earlier batches) were left untouched — too
#   large/risky to rebuild unverified in one pass. Also left as a known,
#   flagged gap: the *collapsed* enriched-procedure row still stacks ~10
#   badges/chips (ministry, doc count, step count, difficulty, priority,
#   view count, form flag, fee, version tag, reminder bell, progress
#   badge) in violation of the brief's "no crowded chip rows" rule for
#   list rows — fixing this means moving most of those badges behind the
#   expanded state, a bigger scope decision deferred to its own batch.
#   Filtering/search logic itself was not touched. tsc --noEmit clean.
#
#   BATCH #368 — v4.0 rebuild of the procedure detail page
#   (app/procedures/[slug]/ProcedureDetailClient.tsx), completing the
#   flat-token pass on the app's primary 3-screen path (home -> procedure
#   list -> procedure detail). Same substitution pattern as #366/#367:
#   gradient sticky header + language toggle -> flat header showing the
#   procedure's own title (title no longer duplicated as a second large
#   heading inside the hero card below); hero card border/shadow flattened;
#   primary "Ask Dalilak" + secondary "Home" CTAs de-gradiented; the
#   "Playbook" button now matches the secondary-button style instead of a
#   third distinct visual treatment; Required Documents / Steps section
#   frames flattened; step-number circles lost their gradient+shadow (flat
#   var(--brand) fill); the collapsed "More details" accordion (authority,
#   fees, closing ask-AI banner) fully flattened. Left untouched: all data/
#   logic, the not-found empty state (already neutral-toned, no change
#   needed), and the SectionCollapseToggle mechanism itself. tsc --noEmit
#   clean.
#
#   BATCH #369 — v4.0 pass on the chat interface (app/page.tsx). Found a
#   real, non-cosmetic bug while auditing: the chat screen's local <style>
#   block defines its own --red/--red-dark/--red-light aliases, and these
#   were still hard-pinned to the OLD pre-v4.0 maroon (#8F1D2C/#741622)
#   even after every other page in the app switched to the real v4.0
#   brand tokens (#9F1D2F/#861827) in batch #366-368. That means the send
#   button, active mic/recording state, and the focused-input border were
#   silently still rendering the old color the whole time — a likely
#   contributor to the user's "still looks old" report, since chat is the
#   screen they spend the most time on. Fixed by repointing the local
#   aliases at var(--brand)/var(--brand-hover)/var(--brand-soft) instead
#   of literal hex, which corrects every usage in the file at once.
#   Also flattened: input-toolbar fade backdrop color (matched to the new
#   #F8F8F6 bg), recording-indicator/enhance-suggestion/voice-enhance-hint
#   chip backgrounds (gradient -> flat), input-box border+shadow, typing-
#   indicator bubble shadow, active mic/send button gradient+colored
#   shadow, per-message "More" toggle colors. Left untouched (flagged in
#   UX_AUDIT.md, not silently skipped): the conditional widget stack above
#   the message list (ChatSummaryCard, session timer, suggestion chips,
#   pinned banner, etc.) — already decluttered in batches #362/#364, and
#   collapsing it further to the brief's literal "3 starter suggestions
#   only" would mean removing/merging real features, a bigger call than a
#   safe color pass. Composer buttons (attach/enhance/mic, 38x38) were
#   already reasonably sized, not the "oversized" pattern the brief warns
#   about — no change needed there. tsc --noEmit clean.
#
#   BATCH #370 — CRITICAL BUG FIX: bottom nav buttons unresponsive on real
#   phones. User reported tapping any of the 4 BottomNav tabs did nothing
#   at all. Root cause confirmed: BottomNav.tsx's tab buttons use
#   className="bn-tab-btn tap-hit-8" but the .tap-hit-N CSS family (in
#   globals.css) requires the host element to have position:relative set
#   inline, so its ::before touch-target-expansion overlay anchors to the
#   button itself. The buttons had no `position` in their inline style at
#   all, so the browser walked up to the nearest positioned ancestor —
#   the <nav>, which is position:fixed — meaning all 4 buttons' invisible
#   hit-expansion overlays anchored to the full-width nav bar instead of
#   their own button, badly breaking their individual tap zones on touch
#   devices (@media (pointer:coarse), i.e. exactly phones). Swept every
#   tap-hit-N usage added this session and found 2 more instances of the
#   same bug in app/procedures/page.tsx (ministry filter chips, search-
#   clear button) — fixed all 3 by adding position:'relative' to their
#   inline style objects. Confirmed TopNav.tsx/MobileMenu.tsx already did
#   this correctly (compared directly). tsc --noEmit clean. No visual,
#   logic, or route change — one line per button.
#
#   BATCH #371 — continued the v4.0 flat-design pass onto three more
#   pages: /faq, /authorities, /forms (app/faq/page.tsx,
#   app/authorities/page.tsx, app/forms/page.tsx). Same substitution
#   pattern as #367 (/procedures): gradient header -> flat surface header
#   (language toggle dropped, following the same convention as
#   /procedures), stat cards de-gradiented to uniform flat cards, search
#   bars lost their double box-shadow glow, filter/category chips moved
#   to 1px borders + 999px radius + brand-soft fill only when active,
#   card borders/shadows flattened (no more colored drop-shadows or
#   hover translateY lift on /authorities cards), all CTA buttons
#   (gradient -> flat var(--brand)). /authorities' TYPE_COLORS map had
#   its 'council' entry still pinned to the pre-v4.0 maroon hex - fixed
#   to use the real brand tokens. Left untouched: all data/filtering
#   logic, TYPE_COLORS entries for ministry/court/union/bank (meaningful
#   amber semantic color, not the brand color, left as-is per the brief's
#   allowance for meaningful non-decorative color). /services (909 lines)
#   deliberately deferred to its own batch given its size - not silently
#   skipped, tracked as a follow-up task. tsc --noEmit clean across all
#   three files.
#
#   BATCH #372 — v4.0 flat-design pass on /services (909 lines), the last
#   deferred page from #371, completing the token migration across every
#   primary page in the app. Flat header (dropped gradient banner + language
#   toggle, matches /procedures/faq/authorities/forms), flat search bar (no
#   double box-shadow glow), uniform flat stat cards inside the collapsible
#   "overview & nearby offices" section (removed the gradient "featured"
#   card distinction), category chips flattened (1px border, brand-soft fill
#   only when active, no colored shadow), service-card grid flattened (no
#   hover translateY lift or colored shadow, hover now recolors the border
#   only; icon tiles de-gradiented). ServiceSheet bottom-sheet modal: icon
#   tile and primary "Ask Dalilak" CTA flattened from gradient to solid
#   var(--brand). Left untouched, on purpose: the WhatsApp share button's
#   #25D366 (real third-party brand color, out of scope), the bottom sheet's
#   neutral black backdrop shadow (not brand-colored, acceptable elevation
#   per the brief's modal allowance), and the AI-flowchart-generation
#   loading spinner's brand-tinted track ring (functional loading state, not
#   decorative). This completes the v4.0 flat-token pass across every
#   primary page (home, procedures, procedure detail, chat, faq, authorities,
#   forms, services). tsc --noEmit clean.
#
#   BATCH #373 — fixed a real, verified UX regression: batches #367/#371/#372
#   removed the language-toggle button from the flat headers of /procedures,
#   /faq, /authorities, /forms, /services on the assumption it was "still
#   reachable via MobileMenu." Actually checking the code (not assuming)
#   showed none of these 5 pages render TopNav or MobileMenu at all — each
#   builds its own standalone header — so there was literally no way to
#   switch language from any of them, mobile or desktop. Fixed by adding a
#   compact EN/AR toggle button to each page's header (same visual weight as
#   the existing back button: 1.5px border, 38px height, tap-hit-2 touch
#   expansion). No change to useLanguage()/toggleLang logic itself — purely
#   restoring a reachable control. tsc --noEmit clean on all 5 files.
#
#   BATCH #374 — reduced badge clutter on /procedures' enriched-procedure
#   collapsed card row, closing out the follow-up flagged since batch #367.
#   Direct code inspection found the clutter was worse than the old comment
#   described: ministry name shown 3x (top chip + plain-text line + a
#   hashtag chip), fees shown 2x (inline badge + ProcedureEstimatedFeeChip),
#   doc-count and step-count as 2 separate chips. Merged doc+step into one
#   chip, dropped the redundant inline fee badge (kept the more detailed
#   ProcedureEstimatedFeeChip), and dropped the duplicate ministry
#   plain-text line + hashtag chip (kept the top ministry chip). Removed the
#   now-unused ProcedureHashtagChips import. Every collapsed-only or
#   interactive badge (difficulty, priority tag, view count, form flag,
#   version tag, reminder bell, progress badge) is untouched — no data or
#   functionality lost, purely deduplication of repeated display info.
#   Card went from 4 crowded sub-rows to 2. tsc --noEmit clean.
#
#   BATCH #375 — WCAG AA numeric contrast audit of v4.0 design tokens
#   (audit only, no code changes). Computed exact relative-luminance
#   contrast ratios for every text/background token pairing: all PASS
#   (text-1/2/3, brand, brand-hover all clear 4.5:1+ against surface/bg/
#   brand-soft). Found one real, unfixed gap: --border (#E5E2DD) on
#   --surface is only 1.29:1, well under the 3:1 minimum WCAG 1.4.11
#   requires for interactive UI-component boundaries (input fields, card
#   edges) — confirmed this affects 6 main search bars + ~52 input fields
#   across 32 files, and that --bg vs --surface (~1.04:1) doesn't provide a
#   meaningful secondary boundary cue either. Mitigating factor: every
#   interactive field already gets a var(--brand) focus border + halo, so
#   this only affects pre-interaction scanning, not actual usability.
#   Deliberately NOT auto-fixed: --border is a shared token used on nearly
#   every card/input/divider in the app, changing it needs live visual
#   verification (not available in this sandbox) and is a design call the
#   user should approve given the brief's explicit "very light borders,
#   calm" requirement. Documented as an open, actionable finding rather
#   than silently left out of the audit.
#
#   BATCH #376 — motion audit: removed spring/bounce easing + one purely
#   decorative infinite pulse, per the brief's "calm, no bounce/float"
#   requirement. Full sweep of every transition/@keyframes/infinite
#   animation app-wide (~50+ keyframes, nearly all one-shot calm entrance
#   fades already using the standard cubic-bezier(0.22,1,0.36,1) ease-out
#   token — left untouched). Fixed the 3 genuine violations found: progress
#   bars in ReadinessChecker.tsx and ProcedureTimeline.tsx, and the hero
#   carousel dot indicator in app/page.tsx all used a spring/overshoot
#   curve (cubic-bezier(0.34,1.56,0.64,1)) — swapped to the standard calm
#   ease-out. TopNav.tsx's desktop-only "Online" status dot had a
#   continuous 2.5s infinite pulse animation running the entire time it's
#   on screen with no functional purpose beyond decoration — removed the
#   animation, kept the static dot + soft glow. Deliberately left alone:
#   loading spinners/shimmer/typing-dots (functional), NotificationBell's
#   urgent pulse, ProcedureVersionTag's "new" ping, ProcedureReminderBell's
#   active-reminder wobble, ProcedureFlowchart's current-step glow — all
#   convey real, changing state rather than pure decoration — and the
#   one-shot completion-celebration animation (rare achievement moment, not
#   continuous motion). No scroll-linked/parallax effects found anywhere.
#   tsc --noEmit clean.
#
#   BATCH #377 — closed out the last minor consistency gap flagged since
#   batch #372: /services still had 4 spots at border: 1.5px (overview
#   card, ServiceSheet close button, "show all services" button, service
#   grid card) while every other v4.0-rebuilt page had already moved to
#   1px. Normalized all 4. Also replaced the remaining literal #fff
#   backgrounds (ServiceSheet, overview card, ServiceCardSkeleton, service
#   card's onTouchEnd reset) with var(--surface). Left untouched on
#   purpose: the header's back-button and language-toggle borders (1.5px
#   is the deliberate, consistent convention for those two specifically
#   across every page since batch #367) and white button-text colors
#   (unrelated to the card/background border token system). tsc --noEmit
#   clean.
#
#   BATCH #378 — extracted the shared page-header markup that /procedures,
#   /faq, /authorities, /forms, /services had all been hand-rolling
#   identically (back button + title + language toggle) into a new
#   components/MobileHeader.tsx, per the original design brief's section-22
#   request for named reusable components (MobileHeader, AppLogo,
#   SearchInput, etc.) rather than fully-inline markup everywhere. Swapped
#   all 5 pages over to it. Zero visual diff intended: /services'
#   pre-existing 1024px maxWidth (vs the other 4 pages' var(--container-md)/
#   720px) and its distinct "Go back" vs "Home" back-button aria-label were
#   preserved exactly via explicit maxWidth/backLabelAr/backLabelEn props
#   rather than silently unified as a side effect of this refactor — that's
#   a separate, deliberate follow-up if wanted, not bundled in here.
#   Confirmed no naming collision with the pre-existing (and still used,
#   on the playbook page only) legacy gradient PageHeader component in
#   components/ui/index.tsx. tsc --noEmit clean.
#
#   BATCH #379 — extracted components/SearchInput.tsx from the near-identical
#   "search-wrap" markup duplicated in /faq, /authorities, /forms, /services
#   (absolutely-positioned icon + input + 36px round clear button). The
#   component now owns its own focus state internally, so the per-page
#   `searchFocused`/`setSearchFocused` useState in all 4 files was removed as
#   dead code post-migration. Deliberate exception: /procedures' search bar
#   was NOT migrated — it uses a structurally different flex-row layout with
#   two extra buttons (advanced-search, filter-drawer) embedded in the same
#   bar, and forcing it into this component would risk a real layout
#   regression; documented, not silently skipped. Side effect of unifying
#   4 pages into 1 component (called out explicitly, not accidental): minor
#   pre-existing visual drift between the 4 pages got normalized too — icon
#   size (15 vs 16px), icon color (some had a literal #B0A090 instead of
#   var(--text-3)), clear-button background (var(--border) vs var(--bg) in
#   /forms), and a stray unexplained 36px left-padding in /forms. Most
#   visible change: /services previously lacked the "search-wrap" class
#   entirely so it had no focus glow ring like its siblings — it now gets
#   the same one. tsc --noEmit clean on all 4 files.
#
#   BATCH #380 — extracted components/StatsRow.tsx from the duplicated
#   "N stat cards in a grid" strip in /procedures, /faq, /authorities,
#   /services. Accepts a {value,label}[] array and an optional columns prop
#   (/authorities passes columns={2} for its 4-card 2x2 layout, others
#   default to stats.length). Normalized minor pre-existing drift as a
#   documented side effect: border-radius (14 on /procedures vs 12
#   elsewhere -> 12 everywhere), entrance animation (missing entirely on
#   /procedures -> now animates like the other 3), and label size/color
#   (/procedures was 11px, /services used var(--text-3) -> both aligned to
#   the majority 9.5px/var(--text-2)). Removed /services' now-unused
#   svcStatsIn keyframe post-migration (faqEnter/authEnter kept — still used
#   elsewhere in their respective files). tsc --noEmit clean.
#
#   BATCH #381 — extracted components/AppLogo.tsx from 6 duplicated copies of
#   the "دليلك" brand mark: TopNav.tsx desktop+mobile brand buttons,
#   MobileMenu.tsx drawer header, all 4 auth pages (login/register/
#   forgot-password/reset-password), the homepage auth-loading splash, and
#   the homepage footer logo. Props cover every real difference (badge
#   size/radius, row vs stacked layout, tagline none/short/long/custom text
#   for the splash's distinct wording, title tag h1 vs div/span, badge
#   present or not for the bare footer icon). Real functional fix found and
#   corrected as a side effect: the 4 auth pages' logo title was hardcoded
#   Arabic text with no language condition (unlike every other occurrence),
#   so English-mode users always saw the Arabic wordmark there — now
#   switches correctly via AppLogo's built-in isAr check. Normalized as a
#   documented side effect: decorative icon alt text was inconsistently
#   alt="دليلك" (redundant next to visible text) vs alt="" aria-hidden in
#   different spots -> unified to alt="" aria-hidden="true" everywhere
#   (avoids duplicate screen-reader announcement, matches WCAG best
#   practice); MobileMenu.tsx's hardcoded pre-v4.0 hex colors migrated to
#   design tokens (var(--brand-soft)/--brand-ring/--text-1/--text-3),
#   matching the batch #377 precedent. No size/layout changes to any of the
#   6 occurrences — each keeps its exact original dimensions via props.
#   tsc --noEmit clean on all 8 modified files.
#
#   BATCH #382 — extracted components/SectionHeader.tsx from 4 duplicated
#   "title + trailing action, space-between" rows: the homepage's "Browse by
#   Category" header (title + 'All categories' chevron link) and 3 admin
#   dashboard tab headers (reset codes / feedback / escalations, each title
#   [+ optional icon/count] + a 'تحديث' refresh button). Investigated a
#   QuickAction extraction first per the design brief's component list, but
#   found only 1 live occurrence (homepage's 2-button row) with no real
#   duplication to justify it — skipped rather than force a single-usage
#   component. Admin's pre-v4.0 hardcoded hex colors (#191713/#741622) were
#   deliberately preserved as-is via explicit props rather than migrated to
#   design tokens, since the rest of admin/page.tsx (cards, badges, borders)
#   is still on the same hardcoded palette and hasn't been through a v4.0
#   pass yet — patching just the header colors would have made it visually
#   inconsistent with its own immediate surroundings. Also removed
#   components/HomepageQuickActionsBar.tsx, confirmed via repo-wide grep to
#   be orphaned dead code (defined, never imported or rendered anywhere) left
#   over from a pre-batch-#366 homepage design. tsc --noEmit clean.
#
#   BATCH #383 — investigated PopularTransactionRow/ServiceCategoryCard (both
#   named in the design brief's component list) but found each is written
#   exactly once in app/page.tsx via .map(), with no hand-duplicated copy
#   elsewhere matching real style values (the visually-similar cards in
#   /services, /authorities, /faq use different grids/animations/badges) —
#   skipped both, consistent with the batch #382 QuickAction decision, rather
#   than force single-usage extractions. Instead extracted
#   components/AskDalilakButton.tsx from the "Ask Dalilak" pill CTA
#   (chat-bubble icon + label, brand-red fill) duplicated with a byte-for-byte
#   identical SVG path and near-identical style values across 4 separate
#   empty-state blocks: /services, /authorities, /procedures, /faq. Accepts a
#   per-page onClick (router.push to chat vs local askAI/handleAsk calls) and
#   an optional searchTerm prop that swaps in "Ask about: {term}" wording
#   (only /procedures and /faq did this originally; /services and
#   /authorities always showed the plain label, preserved as-is). Normalized
#   minor pre-existing padding/fontSize/gap drift to the majority values, and
#   removed /services' redundant manual onTouchStart/onTouchEnd tap-feedback
#   handlers in favor of the btn-primary class the other 3 pages already used
#   (same visual effect via CSS :active, now consistent app-wide). tsc
#   --noEmit clean on all 4 files.
#
#   BATCH #384 — extracted components/LoadingSpinner.tsx from the near-
#   identical ring spinner + "Loading..." text pattern duplicated in
#   app/procedures/[slug]/loading.tsx and app/forms/[slug]/loading.tsx (every
#   numeric/color value matched exactly; only the local @keyframes name
#   differed). Component auto-generates a unique keyframe name per instance
#   via useId() so multiple spinners can coexist on one page, and accepts a
#   fullPage prop for the route-level 100vh-centered wrapper vs inline
#   embedding. Also migrated the exact-match inline spinner in
#   app/my-files/page.tsx (removed its now-unused mf-spin keyframe) and the
#   close-but-not-identical variant in
#   app/procedures/[slug]/playbook/page.tsx (26px/2.5px border/custom label,
#   same vertical layout) via explicit size/borderWidth/label props.
#   Deliberately left FormDetailClient.tsx's 14px inline-in-button spinner
#   untouched — structurally different (horizontal row inside a button, not
#   a centered column), so forcing it into this component would need a new
#   layout variant for one caller. Color values kept as literal hex defaults
#   (not migrated to design tokens) to avoid any visual change in this batch;
#   flagged as an open follow-up for these still-pre-v4.0 pages. tsc
#   --noEmit clean on all 4 modified files.
#
#   BATCH #385 — extracted components/ModalCloseButton.tsx from the near-
#   identical round "X" close button duplicated across admin/page.tsx's
#   edit-user modal (28px), admin/content/page.tsx's content-detail panel
#   (26px, no transition), and its create-content modal (28px) — accepts
#   size/iconSize props to preserve the small existing per-instance
#   variance. Also extracted components/PageBackHeader.tsx from the
#   byte-identical back-button+title(+subtitle) header row duplicated in
#   /settings and /privacy; the one real difference between them is color
#   source (/settings is a pre-v4.0 page still on hardcoded hex, /privacy
#   already uses design tokens) — added a variant:'legacy'|'tokens' prop to
#   preserve each page's exact existing look rather than forcing a token
#   migration as a side effect, same precedent as batch #382's admin-header
#   exception. /settings keeps its distinct subtitle/icon/bold title weight
#   via optional props. Investigated and rejected 3 more candidates this
#   batch (error-state blocks, retry buttons, chip/pill filter rows) — each
#   had only superficial visual similarity, not real value-level duplication.
#   tsc --noEmit clean on all 5 modified files.
#
#   BATCH #386 — dead-code removal: found 49 component files (out of 183 in
#   components/, ~8,700 lines total) that are defined but never imported or
#   rendered anywhere in the app — confirmed each individually via grep
#   across app/, components/, lib/, and every next/dynamic() lazy-import call
#   site (which a plain static-import grep would miss). Full list is deleted
#   by this script (see rm -f block above): mostly leftover homepage widgets
#   (HomepageStreakCounter, HomepageLiveStats, HomepageWeatherBanner, etc.)
#   and procedure-detail widgets (ProcedureComparator, ProcedureBookmarks,
#   ProcedureHashtagChips, etc.) from design iterations that were superseded
#   by later batches but never cleaned up. One of the 49 (EscalationModal)
#   was also incorrectly listed in lib/useFocusTrap.ts's doc-comment as one
#   of the 13 dialogs with a focus trap — it never actually rendered
#   anywhere, so that comment was corrected too (13 -> 12 real dialogs,
#   noting EscalationModal's removal). Spot-verified ~15 of the 49 by hand in
#   addition to the automated grep sweep before deleting. tsc --noEmit clean
#   (no file in the app referenced any of the 49, so removing them changes
#   nothing observable — smaller bundle graph, less TypeScript compile
#   surface, no false "is this actually used?" confusion going forward).
#
#   BATCH #387 — dead CSS removal: app/globals.css (built in batch #116)
#   contained a full unused "design system" — typography scale, button
#   variants, badges, alerts, cards, form elements, grid helpers, welcome-
#   screen leftovers — that this 100%-inline-style app never actually
#   adopted. Extracted every class selector in the file and grep-matched
#   each against real className usage across app/, components/, lib/
#   (confirmed no clsx/classnames/template-literal dynamic class
#   construction exists anywhere in the repo, so a plain string grep is
#   reliable). Removed ~65 confirmed-zero-usage classes (~430 lines): full
#   typography scale (.text-display/.text-h1-h3/.text-title/.text-body*/
#   .text-caption/.text-label), .container-sm/lg/xl (kept .container-md,
#   the only one actually used), dead entrance animations .page-enter/
#   .scale-in/.slide-up/.fade-in + their now-orphaned @keyframes (kept
#   .msg-in, the only live one), .btn-secondary/.btn-ghost/.btn-destructive/
#   .btn-icon (kept .btn-primary + the separate legacy .icon-btn/.mode-btn/
#   .send-btn which ARE used), .ds-input/.ds-textarea/.ds-label/.ds-card/
#   .ds-card-hover, legacy .card-hover, the full .badge + 8 variants and
#   .alert + 4 variants families, .section-header/.section-accent,
#   .skeleton + @keyframes shimmer, .empty-state, .divider/.divider-v,
#   .checklist-item, .source-card, .step-card/.step-number, .trust-bar,
#   welcome-screen leftovers .wlc-svc-grid/.wlc-svc-btn/.wlc-hero-band,
#   .hero-enhance-label/.hero-enhance-btn, and the old homepage-v3 grids
#   .pgrid/.pcard/.hwgrid/.tgrid/.fgrid (both declarations) plus
#   .cat-grid-mobile/.proc-page-content (defined only inside @media blocks
#   with no element ever using them). All of this predates the v4.0 flat-
#   design rebuild (batch #366+), which replaced every page's markup
#   without anyone going back to prune the now-orphaned CSS. Deletion is
#   safe by construction: a CSS rule with zero matching className cannot
#   affect anything rendered. Verified brace balance (125 open = 125 close)
#   after every edit and re-ran the full class-usage sweep at the end — all
#   23 remaining top-level classes confirmed live. tsc --noEmit clean.
#
#   BATCH #388 — /privacy was the only public route in the app with no
#   sibling layout.tsx exporting route-specific metadata (page.tsx is
#   'use client' so it can't export Metadata directly — every other route
#   in the app, faq/procedures/forms/authorities/services/login/etc., pairs
#   its client page with a layout.tsx that does this). Without one, /privacy
#   silently fell back to the root layout's homepage metadata (title/
#   description about passports, civil registry, company registration —
#   wrong and misleading for a privacy-policy page, and hurts how it shows
#   up in search results). Added app/privacy/layout.tsx matching the
#   existing app/faq/layout.tsx pattern exactly: privacy-specific title,
#   description, Open Graph, Twitter card, and a canonical URL (resolves
#   correctly off the metadataBase already set in app/layout.tsx since
#   batch #345). tsc --noEmit clean.
#
#   BATCH #389 — app/professional/page.tsx's API_URL fallback pointed at
#   'https://dalilak-backend.onrender.com' — every other file in the repo
#   (app/page.tsx, admin/page.tsx, admin/content/page.tsx, my-files/page.tsx,
#   EscalationModal.tsx, AgentResponseRenderer.tsx, lib/auth.ts — 7 files)
#   agrees on 'https://dalilak-backend-bvb9.onrender.com', the real deployed
#   backend. Copy-paste typo, missing the '-bvb9' suffix. Currently low-risk
#   since this constant isn't referenced anywhere else in professional/
#   page.tsx yet (page is still a "coming soon" shell), but it's a live trap
#   for whoever wires the first fetch() call there — it would silently hit
#   a dead host in any environment without NEXT_PUBLIC_API_URL set (local
#   dev, preview deploys). No backend code or route touched — pure frontend
#   fallback-constant correction. tsc --noEmit clean.
#
#   BATCH #390 — audit only, no code changed. Applied the same "compare
#   duplicated constants across files" method that found the #389 API_URL
#   bug to phone numbers: found MobileMenu.tsx's "Contact Us" card shows a
#   different number (+9613460608) than the WhatsApp support line wired in
#   batch #327 (9616694794, corroborated by ProcedureHelpRequest.tsx + the
#   Organization JSON-LD in layout.tsx). But that card is paired with
#   mailto:wissam@aijur.ai — the real site owner's own email — so it's very
#   likely a legitimate, distinct personal/office contact number, not a
#   copy-paste drift like API_URL was. No basis to conclude which number (if
#   either) is wrong, and editing real contact info on a guess isn't
#   something to do autonomously — flagging it in UX_AUDIT.md for the user
#   to confirm rather than touching it. Also checked and found already
#   correct (no fix needed): all 10 JSON.parse(localStorage...) call sites
#   already wrapped in try/catch, zero href="#" placeholder links anywhere,
#   every <img> has appropriate alt text, all 13 target="_blank" links have
#   rel="noopener noreferrer". Remaining TODO comments (lib/procedures.ts,
#   lib/analytics.ts, lib/plan.ts) are deliberate backend-integration notes,
#   out of scope per standing "no backend API changes" constraint.
#
#   BATCH #391 — fixed a real stale-closure bug in app/page.tsx. The
#   'dalilak_onboarding_question' event listener is registered in a
#   mount-only useEffect ([] deps) and was calling sendMessage(q) directly.
#   sendMessage is redefined every render and closes over lang/isAr
#   (including the langDirective fix from batch #334), so the mount-only
#   listener was permanently calling the FIRST render's sendMessage — stale
#   lang/isAr forever. Reachable in practice: UserOnboarding.tsx lets a
#   first-time user pick a language in step 1 (toggleLang()) then tap a
#   suggested question in step 3, which dispatches this exact event —
#   silently re-introducing the "AI replies in the wrong language" bug
#   batch #334 fixed via a completely different code path. Fixed with the
#   standard "always-fresh ref" pattern: added sendMessageRef (useRef) next
#   to the component's existing ref cluster, synced to the latest
#   sendMessage on every render right after its definition, and the
#   listener now calls sendMessageRef.current(q) instead of sendMessage(q)
#   directly. No change to any other call site (e.g. handleSubmit still
#   calls sendMessage directly, which is correct there since it's called
#   synchronously during the current render, not from a stale closure).
#   tsc --noEmit clean.
#
#   BATCH #392 — hunted for more instances of #391's stale-closure class
#   across DraftingStudio, GlobalSearch, ChatMessage, TopNav, MobileMenu,
#   NotificationBell, MinistryQuickDial, KeyboardShortcutsHelp, and other
#   stateful components — found one more, in app/admin/page.tsx. Its
#   mount-only effect ([] deps) calls loadStats()/loadUsers(), both of which
#   read isAr for their fallback error-toast text. An admin switching
#   language while the initial (possibly slow, cold-start-affected) request
#   is in flight would see a failure message worded in the pre-switch
#   language if it later fails. Lower-impact than #391 (only affects a
#   fallback error string, not core AI-response language) but same bug
#   class and a clean, isolated fix: added isArRef (useRef + sync effect)
#   and pointed loadStats/loadUsers' fallback error text at isArRef.current
#   instead of isAr directly. tsc --noEmit clean.
#
#   BATCH #393 — fixed an inaccurate user-facing stat. lib/allTransactions.ts's
#   TX_MINISTRIES array has 52 raw rows but only 24 unique slugs (each
#   ministry was split by sub-department/portal source during data
#   generation, never deduplicated — 'other' alone appears ~20 times).
#   app/procedures/page.tsx:276 rendered TX_MINISTRIES.length + '+' as the
#   "Authorities" stat, i.e. "52+ Authorities" instead of the real ~24.
#   app/forms/page.tsx already dedupes this same array by slug for its own
#   ministry list, confirming this was an oversight, not an intentional
#   inflated number. Added UNIQUE_AUTHORITY_COUNT (Set-based dedup, same
#   file-level-constant pattern as the existing PROCEDURES_TOTAL) and
#   pointed the stats strip at it. Also re-verified categories 1/3/4 from
#   the perf/data-integrity checklist across procedures/forms/authorities/
#   services (all search/filter logic already correctly memoized) — no
#   other issues found. tsc --noEmit clean.
#
#   BATCH #394 — fixed a real Arabic grammar bug in NotificationBell.tsx
#   (a live, globally-mounted component rendered unconditionally from
#   TopNav.tsx and MobileMenu.tsx — appears on effectively every page for
#   any user with an expiring document or upcoming appointment saved).
#   The Arabic day-count strings hardcoded singular "يوم" regardless of the
#   actual number (`خلال ${days} يوم`, in 3 places: two AI prompt strings
#   and the on-screen countdown label), while the parallel English string
#   correctly pluralized ("day"/"days"). E.g. a 5-day warning read "خلال 5
#   يوم" (grammatically wrong) instead of "خلال 5 أيام". Verified this
#   component is live (not one of the 49 dead files queued for deletion in
#   batch #386) via grep confirming real imports in TopNav.tsx/MobileMenu.tsx.
#   Fix: added an arDays(n) helper implementing standard Arabic numeral
#   agreement (1 -> "يوم واحد", 2 -> "يومين", 3-10 -> "N أيام", 11+ ->
#   "N يوماً") and used it in all 3 call sites. English strings unchanged
#   (already correct). tsc --noEmit clean.
#
#   BATCH #395 — same Arabic-agreement bug class as #394, found in a second
#   live component: components/ChatSessionSummaryChip.tsx (imported/rendered
#   in app/page.tsx, the main chat view — appears whenever a chat session
#   passes 10 messages). Hardcoded singular "رسالة" regardless of count
#   (`${messageCount} رسالة`); since the chip only shows once messageCount
#   >= threshold (default 10), its most common real-world render was the
#   grammatically wrong "10 رسالة" instead of "10 رسائل". Added arMessages(n)
#   helper (same pattern as arDays from #394: 1 -> "رسالة واحدة", 2 ->
#   "رسالتين", 3-10 -> "N رسائل", 11+ -> "N رسالة") and used it at the one
#   call site. English string unchanged (already correct). tsc --noEmit
#   clean.
#
#   BATCH #396 — third instance of the same Arabic-agreement bug class
#   (#394, #395), found in components/ProcedureCountdownTimer.tsx (live,
#   rendered per expanded procedure card in app/procedures/page.tsx:862;
#   users set a 1-365 day deadline and the display updates every minute, so
#   small counts 1-10 — exactly the range needing agreement — are the
#   common case). formatCountdown() hardcoded singular يوم/ساعة/دقيقة
#   regardless of count, e.g. a 3-day deadline read "3 يوم و 5 ساعة" instead
#   of "3 أيام و 5 ساعات", and 1 day read "1 يوم" instead of "يوم واحد".
#   Added a general arUnit(n, sing, dual, plural, many) helper (handles the
#   dual form too, unlike #394/#395's simpler singular/plural-only helpers)
#   plus arDaysUnit/arHoursUnit/arMinutesUnit wrappers, used at all 3 call
#   sites. English strings (Nd Nh / Nh Nm / Nm) already unaffected since
#   they use unit letters, not full words. tsc --noEmit clean.
#
#   BATCH #397 — fixed a numeral-system inconsistency in
#   components/ProcedureEstimatedFeeChip.tsx (live, rendered on every
#   low/mid/high-fee procedure card in app/procedures/page.tsx:645).
#   formatAmount() called n.toLocaleString('ar-EG') in Arabic mode, which
#   renders Eastern Arabic-Indic digits (e.g. 150000 -> "١٥٠٬٠٠٠"), not just
#   an Arabic thousands separator with Western digits. Every other
#   fee/number display in the app (CostEstimator, ProcedureFeeHistory, stat
#   chips) already uses Western digits even in Arabic mode, so this one
#   chip's numerals visually clashed with neighboring chips on the same
#   card. Fix: always format with 'en-US' regardless of isAr; only the
#   trailing unit label (ل.ل. vs LBP) still switches by language. tsc
#   --noEmit clean.
#
#   BATCH #398 — fixed lib/auth.ts's setToken/setUser calling
#   localStorage.setItem with no try/catch (unlike every other setItem call
#   in the codebase). Real reachable path: app/login/page.tsx and
#   app/register/page.tsx call apiLogin/apiRegister then setToken(...) +
#   setUser(...) + router.push('/') all inside one try block whose catch
#   shows a generic login-error toast. A throwing setItem (Safari
#   private-browsing's 0-byte quota -> QuotaExceededError is the classic
#   real-world case, also happens with storage disabled/full) would surface
#   as a false "login failed" even though the backend already accepted
#   valid credentials — and since setToken throws before setUser/
#   router.push run, the user is never actually navigated in despite
#   correct credentials. Wrapped setToken/setUser (and clearToken, for
#   consistency) in try/catch matching the codebase's existing protective
#   pattern elsewhere; a failed local write no longer blocks a successful
#   server-side login. tsc --noEmit clean.
#
#   BATCH #399 — found one more unguarded localStorage call the #398 sweep
#   missed: components/ProcedureHistoryLog.tsx (live, rendered per expanded
#   card on /procedures via app/procedures/page.tsx:873). Its mount effect's
#   "record viewed once per day" block called localStorage.getItem/setItem
#   directly with no try/catch, unlike every sibling call in the SAME file
#   (addHistoryEvent, loadHistory both already wrapped) and every other
#   setItem call site checked across the repo. A throwing localStorage call
#   here (same real scenario as #398: Safari private browsing, storage
#   disabled, quota exceeded) would be uncaught inside a useEffect and could
#   break the /procedures page for that user, instead of degrading quietly
#   like the rest of the app. Wrapped the block in try/catch matching the
#   file's own existing pattern. tsc --noEmit clean.
#
#   BATCH #400 — a research agent proposed fixing a real off-by-one bug in
#   components/AppointmentTracker.tsx (line 97: filtered upcoming
#   appointments with `daysUntil(a.date) >= -1` while the comment directly
#   above says the intent is a 30-day past window, i.e. should be `>= -30`).
#   Before implementing, verified this component is not actually live:
#   grep across app/ + components/ + lib/ (including next/dynamic calls)
#   found zero imports or JSX usage of AppointmentTracker anywhere — it was
#   never in the batch #386 dead-file list (it was still being actively
#   edited as late as batch #344's aria-label pass) but apparently lost its
#   only render call sometime during the v4.0 redesign batches without the
#   file itself being deleted. Its sole remaining "consumer",
#   HomepageTodayTasks.tsx (reads the same localStorage key), is itself
#   already in the #386 deletion queue. Fixing a bug inside code no user can
#   reach would be wasted effort, so instead queued
#   components/AppointmentTracker.tsx (502 lines) for deletion, matching the
#   #386 precedent. tsc --noEmit clean.
#
#   BATCH #401 — fixed a real cost-parsing bug in components/CostEstimator.tsx
#   (live, imported/rendered in app/procedures/page.tsx:712, fed real fee
#   strings from lib/enrichedProcedures.ts). parseFeesUSD()'s LBP regex
#   `([\d,]+)\s*(?:ل\.ل|...)` only allowed comma-grouped digits, but the real
#   fee data uses PERIOD-grouped thousands too (e.g. "1.500.000 ل.ل.",
#   lib/enrichedProcedures.ts:346). The regex couldn't cross the periods, so
#   it captured only the trailing "000" segment, parsed to 0, and — since the
#   function returns 0 (not null) — the `?? 20` fallback never kicked in,
#   silently showing "$0" as the official government fee for most
#   LBP-denominated procedures in the dataset instead of the correct amount
#   (~$17 for the example above). Verified via a standalone Node repro before
#   and after the fix. Widened the capture class to `[\d.,]+` and strip both
#   separators before parseFloat. tsc --noEmit clean.
#
#   BATCH #402 — fixed a real parsing-order bug in
#   components/ProcedureEstimatedCompletion.tsx (live, imported/rendered in
#   app/procedures/page.tsx:867). parseProcessingDays() checked the named
#   phrase "يوم واحد" ("one day") BEFORE any numeric day/week/month regex,
#   so it short-circuited to 1 whenever that phrase appeared anywhere in the
#   string — even when the same string also contains a larger, more
#   relevant number for a different tier. Real data in
#   lib/enrichedProcedures.ts hits this: line 807's tiered value
#   "فوراً | فوراً | يوم واحد | 3 – 4 أيام" returned 1 instead of 4, and
#   line 1474's range "يوم واحد — 3 أيام عمل" returned 1 instead of 3 —
#   verified with a standalone Node repro before/after. Impact: a user on
#   the highest-tier case saw an "expected completion" date 2-3 workdays too
#   early and could see the procedure incorrectly flagged overdue. Fix:
#   moved the numeric-regex checks (which already correctly find the
#   meaningful larger number via .match()'s first-match behavior, since
#   "يوم واحد" itself contains no digit) before the named-phrase shortcuts,
#   so explicit numbers win when present while digit-free strings still
#   fall through correctly to the named checks. tsc --noEmit clean.
#
#   BATCH #403 — same period-grouped-thousands root cause as #401, a
#   different failure mode, found in components/ProcedureEstimatedFeeChip.tsx
#   (live, app/procedures/page.tsx:645). Its "stamp only" guard
#   `!f.match(/\d{5,}/)` never fires on period-grouped LBP amounts (a
#   5-digit run never appears once thousands are split by periods into
#   3-digit chunks), and its number-extraction regex `[\d,]+` also missed
#   periods. Real example (lib/enrichedProcedures.ts:369, work-permit
#   renewal): fee string containing "1.800.000 ل.ل." was misclassified as
#   "طابع فقط / Stamp only" (~1,000 LBP) instead of the correct "high fee"
#   category (up to 1,800,000 LBP) — verified with a Node repro. Widened the
#   stamp-only guard to also accept period/comma-grouped digit runs
#   (\d{1,3}(?:[.,]\d{3})+) and the number-extraction regex to [\d.,]+,
#   stripping both separators before parseInt. Verified genuinely
#   stamp-only strings (bare "1000" with no grouping) still classify
#   correctly post-fix. tsc --noEmit clean.
#
#   BATCH #404 — fixed components/ProcedureCostBreakdown.tsx (live,
#   app/procedures/page.tsx:828). parseLines() split fee text on \n, |, and
#   em-dash — but not on a plain hyphen used as an inline bullet with no
#   newline/pipe/em-dash between items. Real data
#   (lib/enrichedProcedures.ts:346) uses exactly this pattern: a 4-tier fee
#   string ("1.500.000 ل.ل. ... - رسم بـ 800.000 ل.ل. ... - رسم بـ 400.000
#   ل.ل. ... - طابع أميري بقيمة 1000 ل.ل.") stayed as ONE unsplit segment,
#   and since classify() checks 'طابع'/stamp before 'fee', the whole
#   400K-1.5M LBP tiered fee was misclassified as stamp-only (implying a
#   nominal fee) — verified with a Node repro before/after. Added a split
#   on a hyphen preceded by a period/digit and followed by a new word,
#   mirroring the existing em-dash rule. Verified across all 60 real fee
#   strings in the dataset via a Node script — zero bad splits or
#   too-short fragments introduced. tsc --noEmit clean.
#
#   BATCH #405 — same "|"-delimited multi-value convention as `fees`
#   (batches #401-#404) exists on the `whereToApply` field too, but none of
#   its 3 live consumers split it: app/procedures/page.tsx:689 (per-card
#   meta chip + CopyBtn), components/PrintProcedureModal.tsx:189 (print
#   view MetaCell), components/ProcedureComparator.tsx:140 (comparison
#   table row). Real data (lib/enrichedProcedures.ts:188, 464 + their _en
#   counterparts) lists genuinely distinct locations, e.g.
#   "أقرب مخفر درك أو شرطة | الشعبة القانونية العسكرية" — rendered raw with
#   the pipe character inside a chip singularly labeled "Where to apply".
#   Added `.split(/\s*\|\s*/).filter(Boolean).join(isAr ? '، ' : ', ')` at
#   all 3 call sites, matching the multi-value handling already used for
#   fees; verified with a Node repro that the real example now reads as a
#   proper comma-separated list. tsc --noEmit clean.
#
#   BATCH #406 — found an incomplete application of #405's own fix: within
#   the SAME file (components/PrintProcedureModal.tsx, live via
#   app/procedures/page.tsx:1143), `whereToApply` got the "|"-split fix but
#   the two adjacent fields using the identical multi-value convention —
#   `fees` (line 42) and `processingTime` (line 43) — were left unsplit,
#   even though both fields already got this exact fix in their OTHER
#   consumers (CostEstimator/ProcedureEstimatedFeeChip/
#   ProcedureCostBreakdown for fees, ProcedureEstimatedCompletion for
#   processingTime) — just not here in the print view. Real example
#   (lib/enrichedProcedures.ts:369): printing that procedure's fee showed
#   the raw "480.000 ل.ل. فئة ثالثة | 960.000 ل.ل. فئة ثانية | ..." string
#   with literal pipe characters. Applied the same split/join pattern to
#   both fields, matching `where` in the same file. tsc --noEmit clean.
#
#   BATCH #407 — fee badge in ProcedureSearchModal.tsx (live via
#   app/procedures/page.tsx:1151, opened by the search button) was slicing
#   the raw `fees` string at 18 chars without knowing about the same
#   "|"-delimited multi-value convention fixed elsewhere (#401/#403-406) —
#   real example (lib/enrichedProcedures.ts:277) sliced to "طابع أميري بـ
#   1000" cutting the amount off right before its own currency unit "ل.ل."
#   and silently dropping the second fee tier entirely. Fixed by truncating
#   only the first pipe-segment (with an ellipsis marker) instead of the
#   raw multi-value string. tsc --noEmit clean.
#
#   BATCH #408 — real data bug: 5 procedures in lib/enrichedProcedures.ts
#   had hasForm:true with pdfUrls:[] (empty), while all other 57 hasForm
#   values agree perfectly with pdfUrls emptiness (0 exceptions among 9
#   hasForm:false entries) — confirming this was a data inconsistency, not
#   intentional. app/procedures/page.tsx shows a "Form" badge purely off
#   hasForm (line 642) but only renders the download section when pdfUrls
#   is non-empty (line 843), so users saw a "Form available" badge leading
#   to a dead end on expand, for these 5 procedures (disability card,
#   family social-safety-net support, degree equivalency, building permit,
#   road-excavation permit). Also affected the advanced hasForm filter.
#   Fixed at the data source (hasForm:false for these 5), which fixes both
#   the badge and filter with one consistent change. Verified via Node
#   that zero hasForm:true/pdfUrls:[] anomalies remain. tsc --noEmit clean.
#
#   BATCH #409 — applied #408's field-cross-check technique to ministrySlug
#   vs the lookup tables in ProcedureRelatedMinistries.tsx and
#   ProcedureExternalLinks.tsx (both live, imported+rendered in
#   app/procedures/page.tsx). Real data uses hyphenated slugs
#   'general-security'/'public-works' (verified via Node — same convention
#   as page.tsx's own ministry filter chips), but both lookup tables only
#   had no-hyphen keys 'security'/'publicworks', so 6 real procedures got
#   no "Responsible Ministry" contact card and no curated gov-portal links
#   (silently fell back to generic Dawlati links instead). Added hyphenated
#   aliases pointing at the SAME already-curated phone/hours/URLs (no new
#   data). Fixed 5 of 6 affected procedures (general-security x3,
#   public-works x2); the 6th (customs) deliberately left as-is since no
#   verified customs phone/URL exists anywhere in the codebase and
#   guessing real contact info is out of scope. tsc --noEmit clean.
#
#   BATCH #410 — continuing #408/#409's field-cross-check technique: found
#   6 real procedures in lib/enrichedProcedures.ts whose actual ministry
#   ('مجلس الجنوب' / Council of the South, or 'مصلحة ري الجنوب' / South
#   Irrigation Dept.) had ministrySlug wrongly set to 'education'/'social'/
#   'public-works' — real filter-chip slugs used by app/procedures/page.tsx
#   (live). This polluted the Education/Social/Public-Works filters with
#   unrelated Council-of-the-South results, and mislabeled their ministry
#   badge as the wrong government body entirely. Also found cots1-07's
#   ministry_en was 'Ministry of Tourism' while its 5 sibling entries all
#   agree on 'Council of the South' — fixed to match the verified pattern.
#   Reassigned the 6 entries to non-colliding slugs (council-south,
#   south-irrigation); both the badge and MinistryIcon already have safe
#   fallback behavior for unmatched slugs, so this fixes the mislabeling
#   without needing new UI. Verified zero mismatches remain via Node.
#   tsc --noEmit clean.
#
#   BATCH #411 — audit only, no code changed. Extended search beyond the
#   now-exhausted enrichedProcedures.ts field-cross-check vein: checked
#   lib/allTransactions.ts (2484 rows) hasForm/pdfUrl consistency and
#   ministrySlug coverage against TX_MINISTRIES (both clean), serviceFAQ.ts
#   consumers' guard logic (already correct), a broad unguarded-crash-risk
#   sweep (.reduce/.find/[0]/.split, all properly guarded), and the two
#   remaining enrichedProcedures.ts field-pairs suggested at the end of
#   #409 (requiredDocuments/steps array-length parity between AR/EN across
#   all 71 entries — verified 0 mismatches via Node). Also re-surfaced the
#   MobileMenu.tsx vs ProcedureHelpRequest.tsx/layout.tsx phone-number
#   mismatch already investigated in batch #390: paired with the site
#   owner's real email, so most likely a legitimate separate personal/
#   office contact rather than an error — left untouched per the standing
#   "never guess real contact info" rule, same as #390's conclusion.
#
#   BATCH #412 — real bug found in fresh territory: app/authorities/page.tsx
#   (live, full route) had a search filter that only ever matched against
#   Arabic name_ar/categories, regardless of the current language — even
#   though the same page's own card display already switches to name_en/
#   categories_en in English mode (line 285). Any English-language search
#   query (e.g. "General Directorate", a real authority_en value present on
#   dozens of lib/allServices.ts entries) matched nothing, showing "no
#   matching authorities" even when matches existed — English-mode search
#   was effectively non-functional, not just incomplete. Fixed the filter
#   to switch fields by isAr (matching the display logic already in the
#   file) and added the missing isAr dependency to the surrounding
#   useMemo. tsc --noEmit clean.
#
#   BATCH #413 — same bug class found in app/services/page.tsx (live, full
#   route): its search predicate (lines 435-446) only matched Arabic
#   name_ar/authority_ar/description/category regardless of isAr, while the
#   same file's own card display and ServiceSheet already switch to
#   name_en/authority_en/category_en/description_en in English mode. An
#   English query like "Marriage" for a card showing "Registration of
#   Marriage Contract" matched nothing — English-mode search was as broken
#   here as it was on /authorities before #412. Also checked GlobalSearch.tsx
#   (already language-aware) and app/forms/page.tsx (already language-aware)
#   — neither has this bug. Fixed with the same isAr-aware field-selection
#   pattern as #412, added missing isAr dependency to the memo. tsc --noEmit
#   clean.
#
#   BATCH #414 — real bug found in components/DraftingStudio.tsx (live,
#   imported+rendered in app/drafting-studio/page.tsx). Its buildPrompt()
#   was the only piece of the component not branching on isAr — every other
#   part (template titles, field labels, buttons) already switches by
#   language, but buildPrompt() always generated the AI prompt entirely in
#   Arabic, using Arabic field labels and ending with an explicit "write in
#   Arabic only" instruction, regardless of the user's selected language.
#   An English-mode user filling English-labeled fields got their document
#   request silently rewritten into an Arabic-only instruction before being
#   sent to the assistant. Fixed by branching every line of buildPrompt()
#   on isAr, matching the rest of the component's existing pattern; verified
#   titleEn/labelEn exist on all templates/field defs before use. tsc
#   --noEmit clean.
#
#   BATCH #415 — same "language-branching gap" class found in
#   components/GovHolidayAlert.tsx (live, imported+rendered in
#   app/procedures/page.tsx). Its checkAlert() computed a "days closed"
#   date label via toLocaleDateString('en-GB', ...) once, before isAr is
#   even known (called from a mount effect), then that hardcoded-English
#   string got interpolated straight into the Arabic sentence — e.g.
#   "تأكد من إنهاء معاملاتك قبل الغد (Friday, 24 Jul)" with an English
#   weekday/month embedded in otherwise-Arabic RTL text. Fixed by storing
#   the raw Date on AlertInfo instead of a pre-formatted string, and
#   formatting it at render time with the real isAr value (ar-LB vs
#   en-GB), matching the pattern already used by ArabicDateDisplay
#   elsewhere in the app. tsc --noEmit clean.
#
#   BATCH #416 — did a broad grep of every toLocaleDateString/
#   toLocaleTimeString/toLocaleString call in the app (60+) for the same
#   hardcoded-locale class as #415. Found app/admin/page.tsx's fmtDate()
#   (line 206-209, used for each user's last_login in the admin users
#   table) hardcoded 'ar-LB' while its sibling fmtTs() a few lines above
#   already branches correctly on isAr — in English mode every other
#   timestamp/label on the page switched but this one column stayed
#   Arabic-formatted. Fixed to match fmtTs()'s pattern. Also identified but
#   deliberately deferred (admin-only, lower user impact, needs its own
#   careful pass rather than bundling): app/admin/content/page.tsx (4
#   hardcoded 'ar-LB' calls) and app/admin/page.tsx:483 (recovery-code
#   expiry time) — flagged in UX_AUDIT.md for a future batch. tsc --noEmit
#   clean.
#
#   BATCH #417 — followed up on the 2 deferred items from #416. Verified
#   app/admin/content/page.tsx is genuinely bilingual (isAr used
#   throughout for dir/headers/buttons/aria-labels; only the content data
#   model itself, title_ar/body_ar, is Arabic-only by design, which is not
#   a bug). Fixed 5 hardcoded 'ar-LB' toLocaleDateString/toLocaleString
#   calls to branch on isAr: line 243 (list card date), 277/281/286
#   (detail panel Created/Last modified/Published, labels too), and 370
#   (audit log timestamp, found during the same read though not in #416's
#   original list) plus its adjacent "By:"/"From:" labels. Separately,
#   app/admin/page.tsx's "reset codes" tab (line 455-494) turned out to be
#   a bigger gap than #416's single flagged line: the whole block —
#   SectionHeader title/trailingLabel, an instructional paragraph, the
#   empty state, the "expires" label + toLocaleTimeString('ar-LB'), and
#   the "copy" button — was Arabic-only while the rest of this same file
#   (fmtTs, TABS, flash messages) already branches consistently on isAr.
#   Translated the whole block rather than fixing only the flagged date
#   call in isolation, to avoid leaving an inconsistent partial fix in the
#   same file. tsc --noEmit clean on both files.
#
#   BATCH #418 — found components/ProcedureRequiredDocsCounter.tsx is dead
#   code: fully implemented (reads the same dalilak_doc_ready_{code}_{i}
#   localStorage keys as its live replacement) but confirmed via
#   `grep -rn "ProcedureRequiredDocsCounter" app components --include=*.tsx`
#   to have zero import lines and zero JSX usage outside its own file —
#   fails the batch #400 liveness test on both counts. It was superseded
#   by components/ProcedureDocReadinessBar.tsx (live, imported+rendered in
#   app/procedures/page.tsx:65,740), which does the identical "X/Y docs
#   ready" job; the dead file's own doc comment even misattributed its
#   localStorage keys to the wrong sibling component. Queued for deletion
#   via rm -f (same pattern as batch #400's AppointmentTracker.tsx) since
#   files in the connected workspace folder can't be deleted directly from
#   the sandbox. tsc --noEmit clean.
#
#   BATCH #419 — applied the same dead-code grep technique from #418
#   across the rest of components/, found a whole unreachable chain:
#   TransactionFilePanel.tsx, DocumentAnalysisPanel.tsx, HumanReviewCTA.tsx
#   have zero imports anywhere in app/components/lib; RiskScoreCard.tsx and
#   MissingDocumentsChecklist.tsx are imported only from inside those two
#   dead panels, so they're unreachable transitively despite having an
#   import line. Confirmed app/my-files/page.tsx (the logical intended
#   caller) imports none of them, not even via next/dynamic. Likely a
#   "risk review" feature added in an early squashed batch (f96b51f,
#   #284-332) and never wired up or since removed. Queued all 5 files for
#   deletion via rm -f (same pattern as #400/#418). tsc --noEmit clean.
#
#   BATCH #420 — CRITICAL AUDIT FINDING, no code changed. The entire "My
#   Files" tracked-procedures feature (lib/auth.ts:405 startTracking-
#   Procedure, app/my-files/page.tsx:66/94/141 load/update/delete, and
#   SaveToMyFilesButton — all confirmed live: imported+used outside their
#   own files, reachable from BottomNav/MobileMenu/TopNav on every page)
#   calls POST/GET/PUT/DELETE /my-procedures on the backend. That route
#   does not exist anywhere in backend/main.py — verified via
#   `grep -n "@app\.(get|post|put|delete|patch)" backend/main.py` across
#   all ~70 registered routes, zero matches for my-procedures/my_procedures
#   (including the dalilak_AI_transfer backup copy). /transactions exists
#   with full CRUD as a plausible target, but repointing requires careful
#   response-shape verification this batch didn't have scope for, and
#   backend changes are out of bounds per the standing "don't change
#   Backend APIs" constraint without explicit user permission. Documented
#   in UX_AUDIT.md flagging real end-to-end breakage (every /my-files
#   visit and every "Save to My Files" tap fails) for a user decision:
#   add the missing backend route, or scope a dedicated batch to safely
#   repoint the 3 frontend call sites to /transactions.
#
#   BATCH #421 — extended #420's backend-route sweep to the rest of the
#   frontend's fetch() call sites and found a second, new mismatch:
#   app/admin/content/page.tsx (the "Content Governance" page, linked from
#   /admin) calls GET/POST /admin/content, POST /admin/content/{id}/
#   transition, and GET /admin/audit-log — none of which exist in
#   backend/main.py (verified against the full /admin/* route list:
#   users/stats/resets/feedback/content-gaps*/procedures/sources/
#   failed-questions/escalations — content-gaps is a different feature,
#   gap logging, not content items). Compounding bug fixed on the frontend
#   side: loadItems() called res.json() without checking res.ok first;
#   since FastAPI 404s still return valid JSON ({"detail":"Not Found"}),
#   the page silently rendered an empty-but-normal-looking list instead of
#   surfacing any error. Added a res.ok check that throws into the
#   existing loadError catch/render path, making the failure visible.
#   Adding the missing backend routes themselves is out of scope (same
#   constraint as #420); createItem/transition still fail silently and
#   are a smaller follow-up candidate. tsc --noEmit clean.
#
#   BATCH #422 — fixed a real race condition in app/page.tsx's chat
#   follow-up-question suggestions. sendMessage() fires an un-awaited
#   POST /suggest_followup after each answer streams, whose .then() calls
#   setFollowupQuestions() on state shared across the whole session, with
#   no AbortController/request ordering. Since loading=false runs (in
#   finally) before that fetch resolves, a user can ask a second question
#   before the first question's suggest_followup response arrives — when
#   it finally does, it silently overwrites the second question's already-
#   correct follow-up chips with stale ones from the earlier topic, fully
#   visible and clickable to the user. Fixed with a simple sequence guard:
#   sendSeqRef incremented per sendMessage() call, checked in the .then()
#   before applying the result. Two other /suggest_followup call sites
#   (lines ~661, ~2185) use a different state (setVisibleQ) and are
#   triggered by an explicit one-off user click rather than automatically
#   per message — lower risk, left untouched. tsc --noEmit clean.
#
#   BATCH #423 — found the same stale-response-overwrite pattern from #422
#   in a second spot inside the same sendMessage() function: the document-
#   analysis fetch (POST /documents/universal-analysis), fired un-awaited
#   when a file is attached, inserts its result into `messages` by finding
#   the currently-streaming assistant message via findIndex — with no
#   check that its own send is still the latest one. #422's sendSeqRef fix
#   only covered the suggest_followup call site, not this one. Failure
#   trace: attach+send a file, its analysis fetch is still pending when
#   the main stream finishes and loading resets to false, user sends a
#   second (fileless) message immediately, first file's analysis resolves
#   late and gets spliced next to the unrelated second exchange (or
#   appended at the very end if no streaming message is found). Applied
#   the same sendSeqRef.current === mySeq guard around this insertion.
#   tsc --noEmit clean.
#
#   BATCH #424 — process note: a first search attempt misidentified
#   RiskScoreCard.tsx as live (grep hit inside TransactionFilePanel.tsx/
#   DocumentAnalysisPanel.tsx was misread as evidence of liveness), but
#   both of those files are themselves part of #419's dead-code cluster
#   already queued for rm -f below — the edit was caught via independent
#   verification and reverted before tsc ran. Real fix: app/page.tsx's
#   "retry on connection error" chip (retryMsg && !loading) hardcoded
#   direction:'rtl' and the Arabic-only label "إعادة المحاولة" with no
#   isAr branching, unlike neighboring elements on the same page (e.g. the
#   voiceError dismiss button just above it). English-mode users hitting a
#   connection failure saw an Arabic-only retry button in an RTL-forced
#   box embedded in an otherwise-English page. Branched both on isAr.
#   tsc --noEmit clean. No dead-cluster files touched.
#
#   BATCH #425 — fixed a missing useEffect cleanup in components/
#   ProcedureNotesPanel.tsx (live: imported+rendered in app/procedures/
#   page.tsx:30,880, inside a ProcedureSectionGroup that genuinely unmounts
#   its children on collapse, not the dead #419 cluster). Its 900ms
#   debounced save (setTimeout -> persist(val) -> localStorage) was only
#   cleared on the next keystroke or blur, never on unmount. Failure
#   trace: user types a note, collapses the section before 900ms elapses,
#   the orphaned timeout still fires and writes localStorage against a
#   detached instance — if a fresher save already happened by then (re-
#   expand + new text), the late orphaned write can clobber it. Added a
#   cleanup useEffect (keyed on code) that clears the pending timeout on
#   unmount/code-change. tsc --noEmit clean.
#
#   BATCH #426 — found the same missing-cleanup class from #425 in a
#   second, independent component: components/ChatVoiceInputBtn.tsx (live:
#   imported+rendered in app/page.tsx:38,1453, inside the hero search form
#   that fully unmounts once messages.length > 0). showToast() scheduled a
#   3s setTimeout with no ref/cleanup; the existing unmount effect only
#   cleared pulseTimer, not this one. Failure trace: tap the mic on a
#   non-Chromium browser without SpeechRecognition support, showToast
#   fires, send a message within 3s (unmounting the hero form), the
#   orphaned timeout later fires setToast('') against a detached instance
#   — a real, reproducible unmounted-setState leak. Added a toastTimer ref
#   cleared before each new schedule and in the unmount effect alongside
#   the existing stopListening() call. tsc --noEmit clean.
#
#   BATCH #427 — audit only, no code changed. Completed the setTimeout/
#   setInterval cleanup sweep started by #425/#426 across ~70 remaining
#   call sites in ~40 files: all setInterval calls have matching
#   clearInterval in a useEffect cleanup; remaining setTimeout calls are
#   one-shot toast/confirmation dismissals fired from click handlers, none
#   reschedule without clearing, none write stale data over fresher data
#   — vein exhausted. Also checked non-null assertions (all logically
#   guarded by matching prior conditions / state machines / notFound() /
#   compile-time-constrained unions), as any casts (all on window.*
#   feature detection or safe fallback parsing), and remaining dir="rtl"
#   (only app/layout.tsx's intentional root default, not a per-component
#   bug). Nothing solid found — honest negative result, consistent with
#   #390/#411.
#
#   BATCH #428 — fixed components/ProcedureReminderBell.tsx's refresh()
#   (live: imported+rendered in app/procedures/page.tsx:71,647), which
#   matched saved reminders by `r.title.includes(titleAr)` only, while the
#   reminder-creation logic (same file's quickAdd, and sibling
#   ProcedureRemindMeLater.tsx, both live) saves the title in whichever
#   language is currently active. Failure trace: switch to English, add a
#   reminder (saved as English text), refresh() immediately filters by the
#   Arabic title and finds nothing, so remCount stays 0 and the pulsing
#   bell/badge never activates despite a successful save — same failure on
#   every later page load for any reminder created while in English mode,
#   defeating the badge's purpose and inviting duplicate reminders. Fixed
#   refresh() to match either language variant. tsc --noEmit clean.
#
#   BATCH #429 — found the same write/match-language-mismatch class from
#   #428 in components/ProcedureTagSearch.tsx (live: app/procedures/
#   page.tsx:45,561, drives enrichedMinistrySlug which filters
#   filteredEnriched at lines 204-206). Ministry-chip selection was stored
#   as the localized display label instead of a stable slug. Since the
#   app's language toggle is a pure setState with no remount, selecting a
#   chip in Arabic then switching to English recomputes chip labels in
#   English while the stored selection stays Arabic text — selectedMinistry
#   === label fails for every chip and "All" doesn't light up either
#   (stored string isn't empty), so no chip shows active while the actual
#   result filtering (also label-based) stays silently applied with zero
#   UI indication. Rewired selection to the existing stable ministrySlug
#   field on EnrichedProcedure instead of the translated label; renamed
#   the page's state to enrichedMinistrySlug and simplified the filter to
#   a slug equality check. Selection now survives language toggles by
#   construction. tsc --noEmit clean.
#
#   BATCH #430 — found a related but distinct bug in app/forms/page.tsx's
#   ministry-filter chip row (lines 156-186, live route /forms, linked
#   from TopNav.tsx:31 and MobileMenu.tsx:78). Unlike #428/#429, the
#   filter STATE here was already correct (ministryFilter compares against
#   the stable m.slug, not a translated label) — but the chip's rendered
#   TEXT hardcoded m.ar with zero isAr branching, unlike the adjacent
#   "All" chip and everything else on the page. Every ministry chip
#   (Economy, Labor, Interior, Finance, etc.) displayed Arabic inside an
#   otherwise fully English dir="ltr" page in English mode — reproducible
#   on every load, not just after a mid-session switch. Fixed to pick
#   isAr ? m.ar : m.en (m.en already existed in lib/allTransactions.ts's
#   MinistryItem type but was never read here) before truncating.
#   tsc --noEmit clean.
#
#   BATCH #431 — found a 4th instance of the isAr-branching-gap class in
#   app/authorities/page.tsx's "Ask Dalilak about..." button per authority
#   card. askAI() (line 169-170) already builds its query template
#   correctly per isAr, and the button's own aria-label already picked
#   isAr ? auth.name_ar : (auth.name_en || auth.name_ar) — but its onClick
#   hardcoded askAI(auth.name_ar) regardless of language, so in English
#   mode the generated AI question used a full English sentence template
#   with the Arabic authority name embedded inside it, mismatching what
#   the card and button actually displayed. Fixed onClick to pass the same
#   language-matched name already used by the aria-label. tsc --noEmit
#   clean.
#
#   BATCH #432 — found a 5th isAr-branching-gap instance in components/
#   GlobalSearch.tsx (live: imported+rendered in TopNav.tsx/MobileMenu.tsx,
#   TopNav rendered in app/page.tsx:1337 with onAsk={q => sendMessage(q)}).
#   buildIndex() built a single hardcoded-Arabic aiPrompt per search
#   result (enriched procedures, wizard items, life journeys) despite the
#   displayed result title already branching correctly on isAr; selectResult
#   called onAsk(r.aiPrompt) unconditionally. In English mode, clicking a
#   correctly-English-labeled search result injected a full Arabic sentence
#   as the visible user chat message in an otherwise all-English session —
#   same #431 pattern (correct bilingual display, hardcoded-language value
#   passed onward). Split into aiPromptAr/aiPromptEn (using title_en/
#   titleEn fields already present in the source data), selectResult now
#   picks isAr ? aiPromptAr : (aiPromptEn || aiPromptAr). FAQ results have
#   no English prompt field in lib/serviceFAQ.ts at all, so both variants
#   fall back to the same Arabic chatPrompt there — a documented data-file
#   limitation, out of scope. tsc --noEmit clean.
#
#   BATCH #433 — new category: components/ProcedureCompletionBadge.tsx
#   (live: imported+used in app/procedures/page.tsx:33,871) silently
#   ignored its own documented contract. Its docstring states "Not started
#   -> shows nothing (hides if no dalilak_started_{code} key either)", and
#   it even declared a const LS_STARTED = 'dalilak_started_' — but never
#   read it anywhere. The "Mark as completed" button rendered unconditionally
#   as soon as mounted was true, so a user who never clicked "Mark as
#   started" could still see and use a fully working "completed" button
#   right next to it (app/procedures/page.tsx:869-872 renders both
#   unconditionally), producing orphaned dalilak_completed_{code} entries
#   with no matching dalilak_started_{code} — inconsistent with other
#   progress widgets like ProcedureCompletionCelebration.tsx which checks
#   started > 0 && started === completed (can never be true for these).
#   Fixed by importing getStartDate from ProcedureStartButton.tsx, tracking
#   hasStarted state refreshed on mount + on dalilak_saved_change/storage
#   events (so it stays in sync with the sibling start button live), and
#   returning null when !hasStarted && !completedDate (still shows an
#   already-completed badge even without a recorded start date, only hides
#   the "mark as completed" CTA itself). tsc --noEmit clean.
#
#   BATCH #434 — same "docstring contract not implemented" category as
#   #433, but on a shared hook: components/ChatResponseLength.tsx's
#   useResponseLength() is called independently in 3 places (the toggle
#   chip UI itself, app/page.tsx:592 which builds the actual outgoing
#   [Detailed]/[Brief] prefix in sendMessage at line 993, and
#   app/settings/page.tsx:87). Each call created its own useState with a
#   mount-only localStorage read and no listener, even though setMode()
#   already dispatched a dalilak_response_length_change custom event that
#   nothing listened for. Result: tapping "Detailed"/"Brief" updated the
#   chip's own visual state (looked like it worked) but never updated the
#   separate page.tsx instance sendMessage actually reads from, so the
#   length prefix silently never got added to any message for the rest of
#   the session — only worked again after a full page reload, then broke
#   on the next toggle. Fixed by listening for dalilak_response_length_change
#   + storage inside the hook's useEffect so all mounted instances stay in
#   sync, same pattern as ProcedureReminderBell.tsx's refresh(). tsc
#   --noEmit clean.
#
#   BATCH #435 — documentation-only finding (no code changed), scope
#   exceeds a single-batch safe fix. components/ChatContextBar.tsx (live:
#   app/page.tsx:48,2260) documents + exports 3 producer helpers
#   (setActiveProcedureContext/setActiveMinistryContext/
#   setActiveJourneyContext) meant to populate sessionStorage keys
#   dalilak_active_proc/_ministry/_journey and surface them as dismissible
#   context chips above the chat input. Grepped the entire app/components/
#   lib tree: zero call sites for any of the 3 setters, zero writes to any
#   of the 3 sessionStorage keys anywhere else in the project. The chip
#   bar is live and rendered but this entire 3-chip half of its documented
#   behavior is permanently unreachable — only the separate "mode" chip
#   ever shows. Not fixed in this batch: wiring requires picking real
#   integration points in 3 unrelated files (procedure selection flow,
#   ministry filter application, journey-open flow) plus a design decision
#   on when each chip auto-clears — guessing wrong is worse than leaving
#   it inert, same reasoning as batch #420's documented-only call. Fully
#   documented in UX_AUDIT.md with a recommendation to either wire it up
#   in a dedicated future batch or remove the 3 unused branches/exports if
#   no longer wanted. tsc --noEmit clean (no code touched).
#
#   BATCH #436 — components/ProcedureRelatedSuggestions.tsx (live:
#   app/procedures/page.tsx:26,1092) violated its own documented "You may
#   also need" algorithm in 2 ways: (1) required only overlap.length >= 1
#   shared title word despite an adjacent code comment explicitly saying
#   "2+ word overlap"; (2) computed+merged the keyword-match fallback
#   unconditionally instead of only when sameMinistry.length < 2 as
#   documented, so it wasn't actually a "supplement" — it was always-on
#   noise. Since word filtering only checks length > 3 chars with no
#   stopword list, one generic shared word (e.g. an Arabic word meaning
#   "to obtain") was enough to surface a suggestion between two unrelated
#   procedures from different ministries even when good same-ministry
#   matches already existed. Fixed both: raised threshold to >= 2, and
#   gated keywordMatch behind sameMinistry.length < 2. Single-file fix,
#   no cross-file wiring needed. tsc --noEmit clean.
#
#   BATCH #437 — real, unambiguous bug in the hand-rolled QR generator
#   components/ProcedureQRShare.tsx (live: app/procedures/page.tsx:38,1043,
#   rendered with real code/titleAr/titleEn props). Building the format-info
#   bits (ECC level + mask pattern, required for any real scanner to decode
#   the rest of the code), the code declared fmtBits as the already-correct
#   final 15-bit BCH string (per its own comment), then declared a second
#   constant fmtXor with the exact same literal array and XORed fmtBits
#   against it — XORing any value against an identical copy of itself
#   always yields all-zero (b^b===0), so every generated QR code had
#   completely corrupted format info: visually looked like a QR code
#   (finder patterns intact) but was unscannable/undecodable by any real
#   phone camera, 100% of the time, for every procedure's "share via QR"
#   option. Fixed by removing the redundant self-XOR entirely and using
#   fmtBits directly. Single-file fix. Not a full audit of the rest of
#   this file's hand-rolled Reed-Solomon/data-placement logic — just this
#   one concrete, verified defect. tsc --noEmit clean.
#
#   BATCH #438 — follow-up on ProcedureQRShare.tsx (same live component as
#   #437) found a second, independent real bug: placeFinderPattern()'s
#   inBorder check used r/c === -1/7 (the coordinates of the white
#   separator ring just outside each 7x7 finder square) instead of the
#   finder square's own outer ring at r/c === 0/6, so every finder
#   pattern rendered inverted — the required solid black outer ring was
#   never drawn (stayed white) and a false black ring was drawn one cell
#   further out where the white separator must be. Finder-pattern
#   detection is the first thing any real QR scanner does, so this alone
#   would make every generated code unscannable independent of the #437
#   format-info fix. Verified the fix by hand-tracing every cell category
#   (border/inner/core/separator) against the standard 1:1:3:1:1 finder
#   shape. Fixed by scoping inBorder to within the actual 0-6 finder
#   square range. Single-file fix (same file as #437). tsc --noEmit
#   clean.
#
#   BATCH #439 — third independent real bug in the same file's QR
#   encoder. encodeBytes() wrote the full untruncated byte length into
#   the 8-bit "character count" header field before truncation, then
#   silently sliced the final codeword array down to V3_DATA_CW (44)
#   afterwards without ever correcting that already-written header. For
#   virtually every real Arabic procedure title (the app's primary
#   locale), the encoded URL (fixed 33-byte prefix + encodeURIComponent
#   of Arabic text, which expands ~6x) runs to 100+ bytes while only
#   ~42 bytes of actual payload fit — so the declared count field lied
#   about the real truncated payload, producing a structurally invalid
#   QR that fails to scan or decodes to garbage, on top of the #437/#438
#   bugs. Traced with a concrete real title from the RAG dataset (233
#   encoded bytes vs ~42 actual capacity) to confirm. Fixed by truncating
#   bytes to V3_DATA_CW - 2 BEFORE building the bitstream/writing the
#   count header, so the declared length always matches what's really
#   encoded. Did not touch the URL construction itself, only the QR
#   encoder's internal logic. Single-file fix (same file as #437/#438).
#   tsc --noEmit clean.
#
#   BATCH #440 — methodology note + real fix. First, a candidate "fix" to
#   components/ProcedureEstimatedCompletion.tsx's addWorkdays() (change
#   the Lebanese weekend assumption from Fri+Sat closed to Sunday-only
#   closed, based on an external news article) was investigated and
#   REJECTED: the current code's Fri+Sat-closed behavior is internally
#   consistent with its own comment AND matches 2 other live files in
#   this codebase (GovHolidayAlert.tsx, MinistryOpenHoursWidget.tsx) that
#   independently use the same assumption; only QuickContacts.tsx
#   disagrees (and its own comment doesn't even match its own code).
#   Changing one file would reduce consistency, not improve correctness —
#   this is a genuine cross-file business-rule ambiguity, not a clean bug,
#   same reasoning as batch #435. Not fixed, not re-proposed.
#   Then found and fixed a real, separate, well-verified bug in the same
#   file's parseProcessingDays(): the Arabic dual-form "two months"
#   (شهرين/شهران) both contain the substring شهر, so without an explicit
#   check (mirroring the existing أسبوعين "two weeks" special case one
#   line above) they fell through to the generic شهر -> 30 fallback and
#   were silently halved to 30 days instead of 60. Confirmed against real
#   shipped data in lib/enrichedProcedures.ts (agr132-02, agr132-03,
#   agr12-03 all use processingTime: 'شهران'). Fixed by adding an explicit
#   شهرين/شهران -> 60 check before the generic fallback. Single-file fix,
#   no weekend-logic changes. tsc --noEmit clean.
#
#   BATCH #441 — components/ProcedureCostBreakdown.tsx's parseLines() had
#   no split rule for the space-padded hyphen (" - "), the dominant
#   multi-item separator in fees_en throughout lib/enrichedProcedures.ts
#   (e.g. line 658 "Revenue stamp of 1,000 LBP - the transfer tax is
#   calculated..." and line 336's 4-tier worker-permit fee list). These
#   strings stayed merged as one segment, and because classify() checks
#   'stamp' before 'fee'/'variable', got mislabeled stamp-only with a
#   22-char-truncated summary, hiding a potentially much larger variable/
#   tiered fee. Also found and fixed the same root issue on the Arabic
#   em-dash separator (lookbehind was ASCII \w only, never matched Arabic
#   text) and a related pre-existing bug in the tight-hyphen rule (bare
#   digit in its lookbehind over-matched compound words like real data
#   "24-hour", incorrectly splitting it into "24"/"hour..."). Fixed all
#   three: added a new space-hyphen split rule, widened the em-dash rule's
#   lookbehind to include Arabic range + period, and narrowed the
#   tight-hyphen rule's lookbehind to period/Arabic only (dropped bare
#   digit). Verified quantitatively against all 142 real fees/fees_en
#   strings in lib/enrichedProcedures.ts via a Node script: 27 strings
#   changed (7 previously-mislabeled stamp-only now split correctly),
#   zero regressions (no string produces fewer segments than before).
#   Single-file fix. tsc --noEmit clean.
#
#   BATCH #442 — lib/arabicNormalize.ts's removeTashkeel() (the basis of
#   normalizeAr/normalizeForSearch/matchesAr/filterByQuery, used by every
#   Arabic search path in the app) used /[ً-ٰٟ]/g. Decoding the actual
#   codepoints: the range end ٰ is U+0670 (superscript alef), not U+065F
#   (ٟ) as the adjacent comment documents — a one-character typo that
#   silently widened the effective range to U+064B-U+0670, which also
#   swallows the Arabic-Indic digit block U+0660-U+0669 (٠-٩). Real data
#   in lib/lifeJourneys.ts uses these digits (e.g. subtitleAr: '٤ إجراءات
#   — ٣٠ يوماً', confirmed via grep -P). Any search query typed in Eastern
#   Arabic-Indic numerals (e.g. a year like ٢٠٢٤) got stripped to an empty
#   string by removeTashkeel, and String.prototype.includes('') always
#   returns true, so ProcedureSearchModal.tsx silently "matched" all 12
#   displayed results to any numeric query with total confidence, while
#   GlobalSearch.tsx (which has a post-normalization empty-query guard)
#   showed the opposite symptom - zero results despite real matching
#   content existing. Verified in Node: old regex strips all digits from
#   a real lifeJourneys.ts string; new regex preserves them while still
#   correctly stripping genuine diacritics (تشكيل on مُحَمَّد -> محمد
#   unaffected in both). Fixed by using explicit ً-ٟ escapes
#   instead of literal characters, to avoid the same copy-paste-typo
#   class of bug recurring. Single-file fix, benefits every consumer
#   (GlobalSearch.tsx, ProcedureSearchModal.tsx, any other Arabic
#   filtering built on this module). tsc --noEmit clean.
#
#   BATCH #443 — app/procedures/page.tsx: the raw " | " multi-value
#   separator fix already applied to displayWhereToApply
#   (.split(/\s*\|\s*/).filter(Boolean).join(...)) was never applied to
#   displayFees/displayProcessingTime, despite the adjacent code comment
#   explicitly stating fees uses "the same multi-value convention as
#   whereToApply". Confirmed real pipe-delimited records in
#   lib/enrichedProcedures.ts (2 processingTime, 4 fees records, e.g.
#   processingTime:'فوراً | فوراً | يوم واحد | 3 – 4 أيام'). Raw "|" was
#   rendered directly in the "Processing time" meta chip (right next to
#   the correctly-formatted "Where to apply" chip in the same row),
#   ProcedureFeeHistory's "Fee: ..." label, and ProcedureCopySummaryLine's
#   copied/shared text. Fixed by applying the same split/join treatment
#   to displayFees and displayProcessingTime, and switched
#   ProcedureFeeHistory's fees prop from raw proc.fees/fees_en to the
#   now-formatted displayFees. Verified CostEstimator's feesRaw-consuming
#   parseFeesUSD() is unaffected by the separator change since it just
#   regex-searches for the first $/ل.ل amount anywhere in the string,
#   independent of the separator character. Single-file fix. tsc --noEmit
#   clean.
#
#   BATCH #444 — app/services/page.tsx: same raw " | " multi-value
#   separator bug as batch #443, found independently on a different
#   dataset (lib/allServices.ts, 367 services) at 4 locations:
#   displayFees/displayProcessingTime (which also feed flowchartSource,
#   used for AI flowchart generation) and cardFees/cardProcessingTime
#   (service grid card meta badges). Verified real pipe-delimited data via
#   grep -c on lib/allServices.ts: 15 fees + 14 fees_en (29 total), 7
#   processing_time + 7 processing_time_en (14 total) records contain
#   " | ", e.g. passport_001's fees_en: 'Regular passport fee (...) |
#   Express service at the Public Relations Department: 4,900,000 LBP...'.
#   Raw "|" rendered in the expanded service detail sheet, the truncated
#   18-char card badge (risking mid-word cutoff), and the AI flowchart
#   source text. Fixed by applying the same
#   .split(/\s*\|\s*/).filter(Boolean).join(isAr ? '، ' : ', ') treatment
#   to all 4 variables. Single-file fix. tsc --noEmit clean.
#
#   BATCH #445 — app/services/page.tsx: ServiceSheet's WhatsApp-share
#   button read required_documents unconditionally (Arabic-only), even
#   though the same component already has the correct isAr-aware fallback
#   for the identical field in two other spots (displayRequiredDocuments,
#   cardDocs). Verified lib/allServices.ts: 368 required_documents_en
#   records, 351 non-empty. In English mode, sharing any of ~350 services
#   via WhatsApp produced an English "Required documents:" header
#   followed by Arabic document names. Fixed docs to use the same
#   isAr-aware fallback pattern already used elsewhere in the file.
#   Single-file fix. tsc --noEmit clean.
#
#   BATCH #446 — lib/allTransactions.ts + app/forms/page.tsx: TxItem's
#   fee/duration fields were hardcoded to '' for all 2,484 TX_ALL records
#   (fee:'',duration:'' in the sole constructor, no source array carries
#   fee/duration data at all), making the two conditional badges
#   {tx.fee && ...}/{tx.duration && ...} on the live /forms page (both
#   "PDF Forms" and "All transactions" tabs) permanently dead — they can
#   never render for any transaction. Verified hasForm/pdfUrl in the same
#   constructor are NOT affected by the same #408-style mismatch (0
#   inconsistencies). Since no real fee/duration data exists anywhere in
#   the generator inputs, removed the two dead badges and the unused
#   fee/duration fields (interface + constructor) rather than fabricating
#   data. No visual change (badges never rendered). tsc --noEmit clean.
#
#   BATCH #447 — lib/serviceFAQ.ts: 8 of 60 SERVICE_FAQ records
#   (faq_001-faq_008) have title/summary/type hardcoded to '' (lost during
#   data generation) while still carrying real steps/requiredDocuments/
#   authority data. searchFAQ('') (the default unfiltered view, run on
#   every /faq page load) returns these unfiltered, rendering 8 blank
#   clickable cards among the default 60-item list on the live /faq page,
#   and their chatPrompt is malformed ('اعطني معلومات عن:  في لبنان' with
#   no actual topic) if tapped. Same bug also silently affects
#   ProcedureFAQChips, GlobalSearch, and HomepageFeaturedFAQ, all of which
#   import the same SERVICE_FAQ export. Verified via grep: exactly 60
#   total records, exactly 8 with title:''. Since no title/summary data
#   exists anywhere to restore these records (same standard as #446, no
#   fabrication), renamed the raw literal to SERVICE_FAQ_RAW (unexported)
#   and made the exported SERVICE_FAQ a filtered view
#   (SERVICE_FAQ_RAW.filter(f => f.title)) — fixes all 4 real consumers
#   with one change at the shared source. tsc --noEmit clean.
#
#   BATCH #448 — components/ProcedureLastUpdatedBadge.tsx: PRE-EXISTING
#   POLICY FLAG (not introduced this batch) — this component shows a
#   "last reviewed" date that is entirely fabricated (hashed from the
#   procedure code, no real lastReviewed/updatedAt field exists anywhere
#   in lib/enrichedProcedures.ts, verified via grep), which conflicts with
#   the project's standing "no mock data in the final version" rule.
#   Whether to keep/redesign/remove this feature is a product decision
#   flagged for the user in UX_AUDIT.md, not resolved this batch. What WAS
#   fixed: getReviewDate()'s fake date was anchored to a hardcoded
#   '2025-01-01' base + up to 179-day offset, so the latest reachable fake
#   date was 2025-06-29; freshnessColor() compares that fixed ceiling
#   against real Date.now(), so ~90 days past that ceiling (~late Sept
#   2025), the green/amber tiers became mathematically unreachable
#   forever. Verified via Node repro against all 71 real procedure codes
#   at today's date (2026-07-25): 71/71 red, 0 green, 0 amber - the
#   feature has been permanently, universally "stale" for ~10 months.
#   Anchored the base to a rolling window off `new Date()` instead of a
#   fixed calendar date, keeping the same per-code deterministic behavior
#   but restoring reachability of all 3 tiers indefinitely. Does not
#   address the underlying mock-data concern above. tsc --noEmit clean.
#
#   BATCH #449 — components/GovHolidayAlert.tsx: 4 of 15 entries in
#   HOLIDAYS are lunar (Hijri) holidays (Eid Al-Fitr, Eid Al-Adha, Islamic
#   New Year, Prophet's Birthday) stored as a fixed {month,day} pair with
#   no year check, identical treatment to the 11 genuinely-fixed Gregorian
#   holidays. The Hijri calendar is ~354-355 days/year, so real Hijri
#   holidays shift ~10-11 days earlier every Gregorian year; these 4
#   values match only the real 2025 dates (confirmed: the dead sibling
#   GovCalendar.tsx self-documents "approximate 2025-2026 dates" for the
#   same values). checkAlert() had no year guard, so it fires the
#   role="alert" "offices closed tomorrow" banner on the WRONG day every
#   year going forward with growing drift — verified this year's Eid/Islamic
#   New Year cycle already drifted ~10-11 days past the hardcoded dates,
#   and the next hardcoded entry (Prophet's Birthday, Sept 4) will fire a
#   day early relative to the real ~Aug 2026 date while giving zero
#   warning on the actual closure day. Added an optional `year` field to
#   Holiday, pinned it to 2025 (the one verified-correct year) on the 4
#   lunar entries only, and updated checkAlert()'s match to skip
#   year-pinned entries outside their verified year (fails toward no
#   alert rather than a wrong-day alert, consistent with #448's
#   no-unverified-data precedent). Real Hijri conversions for 2026+ are a
#   separate follow-up requiring a real calendar source. tsc --noEmit
#   clean.
#
#   BATCH #450 — components/ProcedureDeadlineAlert.tsx: the "Snooze 1 day"
#   button was effectively non-functional for the entire day, every day.
#   scanDeadlines() (read path) computed its snooze lookup key via
#   `new Date(); .setHours(0,0,0,0); .toISOString().slice(0,10)` — local
#   midnight converted to a UTC ISO string, which rolls back into the
#   PREVIOUS UTC calendar day for any positive-UTC timezone (Lebanon is
#   UTC+2/+3, and this is a Lebanon-only app). snooze() (write path) used
#   `new Date().toISOString().slice(0,10)` directly (the real local date
#   for all but the ~2-3h window right after local midnight). The two
#   keys therefore almost never matched. Verified live with
#   TZ=Asia/Beirut right now: write key 2026-07-25, lookup key
#   2026-07-24 — mismatch confirmed in real time, not just theoretically.
#   Practical effect: tapping "Snooze 1 day" writes
#   dalilak_deadline_snoozed_{code}_{today}, but the refresh() called
#   immediately after looks up ..._{yesterday}, finds nothing, and the
#   alert banner reappears instantly as if never snoozed — for
#   essentially the whole day, every day. Fixed by making scanDeadlines()
#   use the same `new Date().toISOString().slice(0,10)` technique as
#   snooze() instead of routing through local setHours(0,0,0,0) first.
#   Single-file, two-call-site fix. tsc --noEmit clean.
#
#   BATCH #451 — resolved the #448 policy flag (user explicitly delegated
#   the decision, asked for the globally-correct choice): removed
#   ProcedureLastUpdatedBadge from app/procedures/page.tsx (import +
#   JSX call) and queued the component file for deletion. Standard UX/
#   trust-signal practice is to never present fabricated data as a real
#   factual claim to users, and the project's own standing rule explicitly
#   forbids mock data in the final product — a "last reviewed" date with
#   no real backing field met neither bar. Removing the feature (rather
#   than keeping the fake date, or swapping it for a vaguer-but-still-
#   fabricated placeholder) is the only option that doesn't display
#   invented information as fact. tsc --noEmit clean.
#
#   BATCH #452 — components/NotificationBell.tsx (live, global via
#   TopNav/MobileMenu): document-expiry alerts could never fire for any
#   real user. It read a flat 'dalilak_doc_expiry' JSON-object key
#   against a fixed 5-item doc taxonomy, but the only live writer of
#   per-doc expiry data, ProcedureDocumentStatus.tsx (live, the actual
#   "+ Set expiry" control on /procedures), writes a completely different
#   schema: one key per document, dalilak_doc_expiry_{code}_{index} ->
#   plain date string, for ANY real procedure document, no fixed
#   taxonomy. The flat key's only writer, DocExpiryBanner.tsx, is
#   confirmed dead code (zero imports/JSX anywhere via repo-wide grep) —
#   so the doc-expiry half of the bell was silently 100% non-functional
#   while the appointment half worked fine (AppointmentReminder.tsx does
#   write the key NotificationBell reads for appointments). Rewrote
#   loadItems()'s doc-scanning block to scan the real per-doc keys and
#   resolve the doc's display text via ENRICHED_PROCEDURES[code]
#   .requiredDocuments[index] — the same dataset app/procedures/page.tsx
#   builds ProcedureDocumentStatus's `docs` prop from, so the index lines
#   up correctly. Also queued the now-confirmed-dead DocExpiryBanner.tsx
#   for deletion. tsc --noEmit clean.
#
#   BATCH #453 — same bug class as #452: components/ProcedureProgressBadge.tsx
#   (live, per-card badge on /procedures) and the 'Started preparing'
#   advanced filter option in app/procedures/page.tsx (live, via
#   ProcedureFilterDrawer) both read localStorage key
#   'dalilak_checklist_{code}', whose only writer, DocChecklistBuilder.tsx,
#   is confirmed dead code (zero imports/JSX anywhere). The badge could
#   never render and the filter always returned zero results, regardless
#   of real user progress. The actual live doc-checklist writer,
#   ProcedureDocumentChecklist.tsx (live, on /procedures), uses a
#   different schema: one key per document, dalilak_doc_{code}_{index} ->
#   '1'/'0' — already the schema 2 other live components
#   (ProcedureChecklistExport.tsx, ProcedureDocumentShare.tsx) correctly
#   read from. Rewired both the badge and the filter to that real schema.
#   Also queued DocChecklistBuilder.tsx and its dependent
#   ProcedureProgressTracker.tsx (also dead, also keyed off the same dead
#   flat key) for deletion. tsc --noEmit clean.
#
#   BATCH #454 — same bug class again: components/ProcedureDocReadinessBar.tsx
#   is rendered directly above ProcedureDocumentChecklist.tsx in the same
#   "Required documents" ProcedureSectionGroup on /procedures, for the
#   identical doc list, but used its own isolated localStorage key prefix
#   (dalilak_doc_ready_{code}_{idx}) that no other live component read or
#   wrote — verified via grep returning zero matches outside this file.
#   Checking a doc in the readiness bar never reflected in the checklist
#   below it (or in WhatsApp share/PDF export/progress badge/'Started
#   preparing' filter), and vice versa: two disconnected checklists for the
#   same documents stacked in the same section. Realigned its key to the
#   real shared schema (dalilak_doc_{code}_{idx}) already agreed on by 5
#   other live components. While realigning, caught a second latent bug:
#   the component's read check was a truthy check (!!localStorage.getItem),
#   but ProcedureDocumentChecklist.tsx writes the literal string '0' (not
#   removeItem) for an unchecked doc, which is truthy in JS — so once
#   joined to the shared schema, every already-unchecked doc would have
#   shown as "ready". Fixed to a strict === '1' check to match every other
#   reader of this schema. A third, separate readiness system in the same
#   section (ReadinessChecker, key prefix dalilak_ready_enr-{code}, shared
#   with ProcedureTimeline) was left out of scope — it looks like an
#   intentionally distinct component, not an accidental duplicate. tsc
#   --noEmit clean.
#
#   BATCH #455 — same bug class as #454, for procedure STEPS instead of
#   documents: components/ProcedureStepHighlight.tsx and
#   components/ProcedureStepProgress.tsx both render in the same "steps"
#   section for the same procedure and same steps array, but tracked
#   "step done" state under two disconnected localStorage prefixes
#   (dalilak_step_done_{code}_{idx} vs dalilak_step_check_{code}_{idx}) —
#   verified via grep that neither prefix was read/written outside its own
#   file. Checking a step done in one widget never showed up in the other.
#   Realigned ProcedureStepHighlight.tsx to the dalilak_step_check_ schema
#   used by ProcedureStepProgress.tsx. No truthy-vs-strict-equality issue
#   here (both already used removeItem, not '0', for unchecked state), so
#   only the key prefix needed to change. ProcedureStepTimer.tsx (separate
#   dalilak_step_timer_ prefix, tracks a per-step countdown start time, not
#   a done/checked boolean) was left out of scope as a genuinely different
#   concept. tsc --noEmit clean.
#
#   BATCH #456 — a THIRD disconnected checklist in the same "Required
#   documents" section discovered while re-auditing #454's scope:
#   components/ReadinessChecker.tsx (rendered first, at the top of the
#   section) tracked the same proc.requiredDocuments list under yet
#   another isolated key, dalilak_ready_enr-{code} (single JSON-array of
#   checked indices), completely disconnected from the dalilak_doc_{code}_
#   {index} schema that ProcedureDocReadinessBar.tsx and
#   ProcedureDocumentChecklist.tsx were already synced on as of #454.
#   ReadinessChecker is also used on app/services/page.tsx and the
#   PROCEDURES_DATA guided-procedures view with no such conflict there, so
#   rather than changing its storage format globally (risking those two
#   call sites' saved state for no benefit), added an opt-in prop
#   docKeyPrefix?: string — when provided, the component reads/writes
#   per-document keys ({docKeyPrefix}_{index} -> '1'/'0', dispatching
#   dalilak_saved_change) instead of its default single JSON-array key.
#   Wired docKeyPrefix={`dalilak_doc_${proc.code}`} only at the enriched-
#   procedures call site in app/procedures/page.tsx, joining it to the
#   same real schema as its 5 sibling components. The other two call sites
#   are untouched. tsc --noEmit clean.
#
#   BATCH #457 — reminders vanish into the void: components/
#   ProcedureRemindMeLater.tsx and components/ProcedureReminderBell.tsx
#   (both live, on every expanded procedure card) write to
#   localStorage['dalilak_reminders'] and import getReminders from
#   SmartReminder.tsx, but SmartReminder's own default-exported component
#   — the only code anywhere that reads that key and renders "due today /
#   overdue" banners — is not mounted anywhere under app/ (it was
#   intentionally left dead when the homepage widget stack was
#   decluttered, per an earlier UX_AUDIT.md entry). So a reminder saved
#   via either live writer was never surfaced again by anything in the
#   live app. Rather than reintroducing SmartReminder as its own floating
#   widget, added a third alert source to components/NotificationBell.tsx
#   (the one live bell that already shows doc-expiry + appointment
#   alerts): it now also calls getReminders() and lists due/overdue
#   reminders (same date <= today definition SmartReminder used) in the
#   same dropdown, with a new 'reminder' NotiItem type. No change to
#   SmartReminder.tsx or the two writer components. tsc --noEmit clean.
#
#   BATCH #458 — the mirror image of #457: a live writer with NO reader at
#   all, for a feature whose display was already deliberately removed.
#   lib/savedItems.ts's trackView()/loadRecentItems() ("Recently Viewed",
#   dalilak_recently_viewed) was still being called live from
#   app/procedures/page.tsx (card expand) and app/services/page.tsx (card
#   click), but its only display surface, RecentlyViewedPanel.tsx, was
#   already intentionally deleted as UI clutter in the batch #386 mass
#   dead-file purge. Unlike #457 (where the display component was kept
#   around "for later" and never deliberately axed), reviving a widget
#   here would contradict an already-made declutter decision — so instead
#   of adding a reader, removed the orphaned trackView() calls (+ unused
#   imports) from both live call sites and deleted the now-truly-dead
#   RECENT_KEY/RecentItem/loadRecentItems/trackView code from
#   lib/savedItems.ts, with a comment explaining why. No visible feature
#   change (nothing displayed this data before or after). tsc --noEmit
#   clean.
#
#   BATCH #459 — SaveButton.tsx is live on both app/procedures/page.tsx and
#   app/services/page.tsx, correctly writing/reading per-item saved state
#   via lib/savedItems.ts (saveItem/unsaveItem/isSaved -> dalilak_saved_items),
#   and its own toggle correctly remembers state on revisit. But the only
#   component that lists ALL saved items together, SavedItemsPanel.tsx, was
#   not mounted anywhere reachable (grep confirmed zero app/ references) —
#   most likely lost when the homepage was rebuilt into the v4.0 chat-first
#   design, since it was still being actively polished for touch targets in
#   earlier batches right before a large dead-widget purge. Rather than
#   inserting it into the v4.0 homepage (deliberately minimal, with a
#   documented tight height budget for the hero/search/quick-actions/
#   category-grid stack), mounted the existing, already-complete
#   SavedItemsPanel component as-is on app/my-files/page.tsx — the page
#   already dedicated to "your saved stuff". The component self-guards
#   (renders null when there are no saved items), so this has zero effect
#   on users who've never used SaveButton. tsc --noEmit clean.
#
#   BATCH #460 — ChatMessageActions.tsx's "حفظ/Save" bookmark button (live,
#   under every assistant chat message) writes to dalilak_bookmarks via
#   addBookmark(), but grep confirmed getBookmarks()/dalilak_bookmarks_change
#   have zero consumers anywhere else in the app. Worse than #459's case:
#   the button doesn't even re-derive its own 'bookmarked' state from
#   storage on remount (unlike SaveButton, which calls isSaved() on mount),
#   so the only visible feedback is a 1.8s flash with nothing persisting
#   anywhere the user can find again. No historical record of this being
#   intentionally decommissioned (unlike #458's RecentlyViewedPanel), so
#   treated like #457/#459: added a compact "الردود المحفوظة"/"Saved
#   Replies" section to app/my-files/page.tsx (right after the #459
#   SavedItemsPanel section) that calls getBookmarks()/removeBookmark()
#   (already exported from ChatMessageActions.tsx) and lists/removes each
#   saved reply, syncing on dalilak_bookmarks_change. No changes to
#   ChatMessageActions.tsx itself. tsc --noEmit clean (exit 0).
#
#   BATCH #461 — components/ChatHistoryPanel.tsx's saveChatSession() is
#   called live from three spots in app/page.tsx (onNewChat/onHomeClick/
#   onHome), persisting up to 5 past chat sessions (up to 40 messages
#   each) to dalilak_chat_sessions on every "new chat"/"home" action — but
#   the default-exported component that lets a user browse/restore/delete
#   those sessions was never mounted anywhere (grep: only the named
#   saveChatSession import exists in app/, no JSX usage). Pure one-way
#   write of potentially sensitive chat content with zero way to view or
#   clear it via the UI. This is a separate feature from the existing
#   dalilak:chat:history auto-continue-last-session mechanism already in
#   app/page.tsx — ChatHistoryPanel additionally lets a user browse
#   multiple past sessions they explicitly left. Mounted
#   <ChatHistoryPanel onRestore={...} /> in the v4.0 welcome screen, right
#   below the two quick-action buttons; it self-guards (renders null with
#   no saved sessions) so it has zero effect on the minimal-design spec
#   for anyone who hasn't left a 3+-message chat before. No changes to
#   ChatHistoryPanel.tsx or the saveChatSession call sites. tsc --noEmit
#   clean (exit 0).
#
#   BATCH #462 — components/ChatDraftAutosave.tsx is mounted live in
#   app/page.tsx:2280, bound to the in-conversation composer's `input`/
#   `setInput` state, correctly saving/restoring a draft to
#   dalilak_chat_input_draft — but `messages` state is never persisted
#   (always starts empty on load), so any refresh/tab-reopen always lands
#   back on the welcome screen, which uses a completely separate state,
#   `heroInput`/`setHeroInput`, that the mounted instance never touches.
#   Confirmed via grep (app/page.tsx: line 553 `input`/`setInput`, line
#   574 `heroInput`/`setHeroInput`, line 2280 the only existing
#   ChatDraftAutosave mount) that the component's own documented purpose
#   ("survives an accidental refresh or tab close") never actually worked
#   in the one scenario it exists for. Fix: mounted a second, completely
#   unmodified <ChatDraftAutosave input={heroInput} setInput={setHeroInput} />
#   instance in the welcome screen (right after the #461 ChatHistoryPanel
#   mount) — safe because only one of the two screens ever renders at a
#   time and both share the same dalilak_chat_input_draft key. No change
#   to components/ChatDraftAutosave.tsx itself. tsc --noEmit clean
#   (exit 0).
#
#   BATCH #463 — audit only, no code change. Found components/
#   ProcedureOfTheWeek.tsx and components/SmartSuggestions.tsx are both
#   fully-built, real-data-driven, zero-TODO components with no live
#   import/JSX usage anywhere (grep-confirmed), most likely lost during
#   the v4.0 homepage rebuild (batch #366) — neither appears in the
#   batch #386 rm -f dead-file list, so there's no evidence either was
#   deliberately decommissioned. Unlike #457/#459/#461's orphaned
#   components (which self-guard to null with zero visual footprint for
#   users with no saved data), these two always render substantial
#   visible content to every visitor, which would directly conflict with
#   app/page.tsx's explicitly documented v4.0 homepage section-order
#   contract ("explicitly no hero banner, no life-journey grid, no
#   multi-card trust section on this screen" — the same discipline
#   behind batches #350/#354/#355 which shrank the homepage, not grew
#   it). Documented the conflict and 3 options (mount anyway / delete as
#   superseded / integrate via an already-reachable surface like
#   GlobalSearch, mirroring how batch #366 kept LIFE_JOURNEYS reachable)
#   in UX_AUDIT.md rather than unilaterally picking a side on what is a
#   genuine product/design decision — same honest-audit precedent as
#   batches #390/#420/#421/#435.
#
#   BATCH #464 — app/admin/content/page.tsx (live, linked from
#   app/admin/page.tsx, uses isAr 28+ times already) had 10 UI-chrome
#   strings hardcoded Arabic-only with no isAr branching: the "Change
#   status" section heading + its note textarea aria-label/placeholder,
#   and in the "Create new content" modal - the Title/Type/Content field
#   labels, their placeholders, the content-type select aria-label, and
#   all 5 <option> labels. A prior batch (#417) had verified this page as
#   "genuinely bilingual" but missed these specific chrome strings (only
#   title_ar/body_ar data fields are correctly Arabic-only by design).
#   Result: an English-mode admin got a fully-Arabic create/status-change
#   UI on an otherwise-English page. Branched all 10 strings on isAr,
#   matching the file own existing pattern. tsc --noEmit clean.
#
#   BATCH #465 - JourneySheet (defined inline in app/page.tsx, not its own
#   component file) is a live role="dialog" shown from TopNav/MobileMenu's
#   onJourneySelect -> getJourneyBySlug() (lib/lifeJourneys.ts, 8 real life
#   journeys) -> setActiveJourney -> conditional render. It was missing from
#   batch #360/#361's app-wide Tab-focus-trap sweep (that sweep's own doc
#   comment in lib/useFocusTrap.ts names 13 role="dialog" components by
#   name - JourneySheet, being inline rather than its own file, wasn't among
#   them). grep -n "useFocusTrap" app/page.tsx returned zero matches before
#   this fix: Tab/Shift+Tab could leak keyboard focus out of the open sheet
#   into the hidden page behind the overlay (WCAG 2.4.3). Added the same
#   useRef + useFocusTrap(dialogRef, true) pattern already used in
#   ServiceGroupSheet.tsx/MobileModeSheet.tsx. tsc --noEmit clean.
#
#   BATCH #466 - two more admin dialogs missed by the same JourneySheet
#   root cause (#465): app/admin/page.tsx's Edit-user modal and
#   app/admin/content/page.tsx's Create-content modal are both
#   role="dialog" with real interactive fields, defined inline in their
#   page files rather than named components, so batch #360/361's
#   component-name-based Tab-focus-trap sweep skipped both. grep for
#   useFocusTrap/dialogRef in either file returned zero matches before
#   this fix. Added useRef + useFocusTrap(ref, openCondition) to both,
#   matching the exact pattern used everywhere else in the app. tsc
#   --noEmit clean.
#
#   BATCH #467 - last remaining focus-trap gap: ServiceSheet, the
#   role="dialog" shown on /services when a service is selected, is
#   inline JSX in app/services/page.tsx (not its own component file) -
#   same root cause as JourneySheet (#465) and the two admin modals
#   (#466). grep -c useFocusTrap app/services/page.tsx was 0 before this
#   fix. Added useRef + useFocusTrap(dialogRef, true), kept the existing
#   closeRef auto-focus effect (non-conflicting). Ran a full-repo sweep
#   afterward - every file containing role="dialog" (16 files) now has a
#   matching useFocusTrap call; this gap class is fully closed app-wide.
#   tsc --noEmit clean.
#
#   BATCH #468 - considered fixing a stale formsCount (571->572) in
#   lib/allTransactions.ts's TX_MINISTRIES, but grep confirmed that field
#   is never read anywhere in the app (zero .tsx consumers), so it would
#   have had no live user-visible effect - skipped in favor of a real
#   live bug: lib/lifeJourneys.ts's vehicle-registration journey had two
#   fields describing the identical duration disagree - subtitleAr (line
#   600) correctly uses the plural Arabic form for '1-2 weeks', but
#   totalEstAr (line 604) used a grammatically wrong dual-nominative form
#   after a 1-2 range. Found the identical bug in a second, unrelated
#   journey's step (residency-expat, ID-card renewal step, line 712).
#   Both live - confirmed rendered in JourneySheet (app/page.tsx lines
#   383 and 498). Fixed both to the plural form already used
#   consistently elsewhere in the same file for this exact range
#   pattern. tsc --noEmit clean.
#
#   BATCH #469 - lib/lifeJourneys.ts: the 'newborn' journey's subtitleAr/
#   subtitleEn said the total duration was 30 days while its own
#   totalEstAr/totalEstEn (shown right below it in the same JourneySheet
#   header, app/page.tsx ~lines 375/383) said 3-4 weeks (21-28 days) for
#   the identical journey - a real numeric contradiction visible in one
#   screen. Cross-checked all 7 other journeys in the file: every one
#   already has subtitleAr matching totalEstAr exactly; newborn was the
#   sole outlier. Normalized subtitleAr/subtitleEn to match totalEstAr/
#   totalEstEn (3-4 weeks), consistent with every sibling journey.
#   tsc --noEmit clean.
#
#   BATCH #470 - app/faq/page.tsx's raw-Python-repr guard on item.fees
#   (added in an earlier batch to hide corrupted JSON->TS conversion
#   leftovers) only checked !startsWith('{'). Batch #411 verified this
#   guard against the 9 dict-shaped corrupted records but never checked
#   list-shaped ones - fee_001 through fee_004 (category 'jadwal
#   al-rusoom' / Fee Schedule) store fees as '[{...}, {...}]', so the
#   guard let them through and rendered raw truncated Python-repr text.
#   These 4 records are type:'fee_table' with every other field
#   deliberately empty, so fees is the only content the card shows -
#   all 4 Fee Schedule cards were unreadable. Widened the guard to
#   !/^[{[]/.test(...), matching how the dict-shaped cases are already
#   handled. No data changes. tsc --noEmit clean.
#   BATCH #471 — Playbook page procedure lookup fixed (hyphen normalization)
#   - app/procedures/[slug]/playbook/page.tsx: ENRICHED_PROCEDURES.find() only
#     stripped hyphens from route `slug` before .includes() against a still-
#     hyphenated `code` (e.g. 'interior-birth-certificate'), so only the
#     single-word 'passport' slug ever matched. Multi-word slugs like
#     birth-certificate, building-permit, vehicle-registration, criminal-record,
#     tax-registration all silently failed to find their procedure data.
#   - Impact: when lookup failed, the Required Documents section vanished and
#     the AI flowchart generator's flowchartSource lost all manually-curated
#     data (ministry, fees, duration, documents, description, steps).
#   - Reachable via the always-visible "دليل التنفيذ" button on every
#     procedure detail page (ProcedureDetailClient.tsx).
#   - Fix: normalize hyphens from BOTH sides (code and slug) before comparing.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #472 — ProcedureEstimatedFeeChip: legal-citation numbers misread as fees
#   - components/ProcedureEstimatedFeeChip.tsx: parseFeesAr grabbed every
#     digit sequence in the raw fees string and took the max as the fee
#     estimate, with no context awareness. Real fee text often embeds legal
#     citations (decree/law/circular numbers, dd/mm/yyyy dates) that aren't
#     fee amounts — e.g. imu11-01/imu11-05 (no fixed fee stated) showed
#     "up to 7,847 LBP" lifted from "Decree No. 7847/1961"; mnb10-01 (real
#     fee $400/year) showed "up to 1,993 LBP" lifted from citation date
#     18/6/1993; mnb10-02 (fee varies by region) showed "up to 2,490 LBP"
#     lifted from "Decision No. 2490".
#   - Verified against all 61 enrichedProcedures.ts fee strings: ~7 records
#     (~11%) affected; confirmed records with genuinely large real fees
#     (mnb12-11, mnb12-12, mnl13-02, interior-id-card) are unaffected.
#   - Always-visible on every procedure card header on /procedures.
#   - Fix: added stripLegalCitations() to remove decree/law/circular
#     citations and dd/mm/yyyy dates before extracting fee-amount candidates.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #473 — ProcedureFAQChips: blank expanded body for 14 FAQ records
#   - components/ProcedureFAQChips.tsx: expanded chip body rendered only
#     faq.summary. lib/serviceFAQ.ts's type:'procedure' records deliberately
#     leave summary:'' and put real content in steps/requiredDocuments/fees/
#     authority instead (app/faq/page.tsx already has this fallback chain;
#     this chip never did). 14 of 52 live FAQ records affected (mun_001-005,
#     real_001, for_005, fee_001-004, proc_001-003) — e.g. mun_001 ("رخصة
#     البناء") has 8 real steps that show fine on /faq but rendered blank
#     when expanded from inside the always-visible "Ask Dalilak" section on
#     every procedure card (app/procedures/page.tsx:940).
#   - Fix: added previewFor() with the same fallback chain used by /faq
#     (summary -> steps -> requiredDocuments -> guarded fees -> authority/
#     duration). Confirmed the 4 corrupted-fees fee_table records still stay
#     blank by design (same /^[{[]/ guard from batch #470), and the 38
#     records with real summary are unaffected.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #474 — ProcedureEstimatedCompletion: missing week-dual form halved estimate
#   - components/ProcedureEstimatedCompletion.tsx:61 checked اسبوعين/أسبوعين
#     (accusative/genitive dual "two weeks") -> 14 days, but not أسبوعان
#     (nominative dual, same meaning). Since 'أسبوعان'.includes('أسبوع') is
#     true, it fell through to the plain "week" -> 7 check, halving the
#     estimate. Same bug class already fixed one line below for شهرين/شهران.
#   - Two real records affected: mnl12-14 ("استرجاع شهادة إيداع",
#     processingTime:'أسبوعان.', processingTime_en:'Two weeks.') and the
#     civil-status name-correction procedure (processingTime:'أسبوعان
#     لمحضر إداري بسيط...', processingTime_en:'Two weeks for a simple
#     administrative record...'). Both showed a completion date 7 days
#     earlier than reality on app/procedures/page.tsx:874's live tracker.
#   - No other record contains أسبوعان; أسبوعين/اسبوعين unaffected.
#   - Fix: added أسبوعان to the 14-day check.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #475 — allServices.ts: 2 electronic services mismarked offline-only
#   - lib/allServices.ts fin_gen_002 ("submit complaint via electronic
#     portal") and fin_gen_003 ("pay judicial fees electronically") both had
#     online_available:false, contradicting their own name_ar/description
#     text, which explicitly describes them as fully electronic self-service
#     actions requiring no in-person visit. Sibling records fin_gen_001/004
#     (less clearly self-service) are correctly flagged true, confirming a
#     data-entry inconsistency.
#   - online_available drives 4 live UI spots: the green "Available Online"
#     badge on service cards/detail (app/services/page.tsx:137,772), the
#     homepage "Online services" stat count (:548), and the Ministry of
#     Finance online-service tally on the authorities directory
#     (app/authorities/page.tsx:58).
#   - Checked all 368 ALL_SERVICES records for the same contradiction; 8
#     other false-flagged records genuinely require in-person steps and were
#     correctly left unchanged (no false positives).
#   - Fix: online_available false -> true for fin_gen_002 and fin_gen_003.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #476 — ProcedureFeeHistory: broken Arabic number agreement
#   - components/ProcedureFeeHistory.tsx:90 used a bare `منذ ${days} يوم`
#     for every day count with no Arabic number-noun agreement (1 -> مفرد,
#     2 -> مثنى, 3-10 -> جمع, 11+ -> تمييز منصوب). Result: "منذ 2 يوم"
#     instead of "منذ يومين", "منذ 5 يوم" instead of "منذ 5 أيام" -- flatly
#     wrong grammar, not stylistic. Same agreement rule already correctly
#     applied elsewhere in this codebase (ProcedureCountdownTimer.tsx).
#   - Live on every visit to a procedure whose fee payment was recorded via
#     app/procedures/page.tsx:773's ProcedureFeeHistory (localStorage-backed,
#     real user action) 2-10 days ago -- a common window given the
#     component's own 30-day "recent" threshold.
#   - Fix: added arDaysAgo() with full singular/dual/plural/tamyiz agreement.
#     English branch untouched (already correct).
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #477 — ProcedureDocumentStatus: broken Arabic day-count agreement
#   - components/ProcedureDocumentStatus.tsx:45 used a bare `${days} يوم`
#     for document-expiry countdown, same missing-number-agreement bug
#     class already fixed twice (ProcedureFeeHistory #476, Procedure-
#     EstimatedCompletion #474). Only correct by coincidence at days===1;
#     wrong for 28 of 31 possible values in the 0-30 range (e.g. "2 يوم"
#     instead of "يومان", "5 يوم" instead of "5 أيام"). NotificationBell.tsx
#     already implements the correct rule for the same dalilak_doc_expiry_*
#     localStorage data, but this component (which writes that data) never
#     got the fix.
#   - Live in app/procedures/page.tsx:760 whenever a user sets a document
#     expiry date within 30 days and expands the expiry-dates section.
#   - Fix: added arDaysLeft() with full singular/dual/plural/tamyiz
#     agreement, matching the #476/NotificationBell.tsx convention.
#   - Flagged for follow-up: components/ProcedureDeadlineAlert.tsx:148 has a
#     similar-looking gap (`${daysLeft} أيام متبقية`, wrong at 2 and >=11) —
#     not fixed this batch, left as a lead for a future one.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #478 — ProcedureDeadlineAlert: daysLeft===2 dual-form fix
#   - components/ProcedureDeadlineAlert.tsx:148 (the lead flagged in #477)
#     used plural `${daysLeft} أيام متبقية` for every daysLeft not 0/1.
#     Since scanDeadlines() filters out daysLeft > 7, only values 2-7 ever
#     reach this branch; 3-7 are grammatically correct plural, but 2 needs
#     the dual form "يومان متبقيان", not "2 أيام" -- narrower bug than
#     initially suspected (only the single value 2 was wrong, no 11+ case
#     is reachable here).
#   - Live in app/procedures/page.tsx:275 for any procedure with a personal
#     deadline exactly 2 days out.
#   - Fix: added a daysLeft===2 special case. Values 3-7 and English
#     untouched.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #479 — TopNav: trial-days badge broken Arabic number agreement
#   - components/TopNav.tsx:241 used bare `${days_left}{isAr?' يوم':'d'}`
#     for the header trial-plan badge, same missing-agreement bug class as
#     #476-478. Unlike those trackers (which cap at <=7 days), days_left
#     has no upper bound here -- it counts down over the whole trial from
#     the backend (lib/auth.ts) -- so every trial user passes through the
#     2-10+ range at some point, exactly when the amber/red urgency styling
#     makes the badge most visible.
#   - Live in app/page.tsx:1347's TopNav for every user on plan==='trial'.
#   - Fix: added arTrialDays() with full singular/dual/plural/tamyiz
#     agreement, matching the #476-478 convention. English untouched.
#   - Flagged for future batches: app/admin/page.tsx:386 has the identical
#     unhandled pattern (admin-only table, lower priority); AppointmentReminder.tsx:89
#     has a similar hour-count pattern but dalilak_appointments has zero
#     writers anywhere in the app, so that path is currently unreachable.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #480 — admin/page.tsx: days_left column same Arabic agreement bug
#   - app/admin/page.tsx:386 (the lead flagged in #479) had the identical
#     unhandled bare `${days_left} يوم` pattern for the exact same
#     days_left field, just rendered in the admin users table instead of
#     the TopNav badge. Admin-only surface, lower reach than #479 but a
#     genuine live bug.
#   - Fix: added arDaysLeftAdmin() with the same full agreement rule used
#     in components/TopNav.tsx (#479).
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #481 — GovHolidayAlert: UTC/Beirut dismiss-key timezone mismatch
#   - components/GovHolidayAlert.tsx computed "tomorrow" using Beirut wall-
#     clock time (getBeyrouthTomorrow()) but the localStorage dismiss key
#     used `new Date().toISOString().slice(0,10)` -- UTC, not Beirut
#     (UTC+2/+3). This created a daily ~2-3h window right after Beirut
#     midnight where Beirut's date has advanced but UTC's hasn't yet: a
#     dismiss during that window is stored under the previous UTC day's
#     key, and once UTC catches up (~03:00 Beirut, same Beirut day) the
#     recomputed key no longer matches, so the already-dismissed alert
#     silently reappears for the rest of that day.
#   - Live, unconditional in app/procedures/page.tsx:272. Recurs every
#     Fri/Sat (Lebanon gov weekend) and on any of the 15 listed holidays.
#     Alert content itself was always correct (Beirut-based); only the
#     dismiss-persistence was affected.
#   - Fix: added getBeyrouthTodayKey() (Beirut-based, mirrors the existing
#     getBeyrouthTomorrow() pattern) and used it at both dismiss-key call
#     sites instead of toISOString().
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #482 — ProcedureVersionTag: bucket/label timezone mismatch
#   - components/ProcedureVersionTag.tsx claims to be a "deterministic"
#     badge, but getUpdateBucket() computed the this-month/last-month/etc
#     bucket using the viewer's LOCAL device timezone, while the adjacent
#     getDateLabel() explicitly formats the displayed month in Asia/Beirut.
#     Around any month boundary, or for any visitor outside Beirut's
#     UTC+2/+3 offset (real audience: Lebanese diaspora), the computed
#     bucket (which also gates visibility: bucket>=4 hides the badge, and
#     sets its color) could disagree with the Beirut month the label text
#     claims -- contradicting the file's own documented determinism.
#   - Live on every enriched procedure card via app/procedures/page.tsx:647.
#     Same underlying bug class as #481 (UTC/local vs Beirut mismatch), a
#     different concrete instance (month bucket vs a daily dismiss key).
#     Checked all other Asia/Beirut-using components -- no other instance
#     of this pattern remains.
#   - Fix: added getBeirutYearMonth() (Intl.DateTimeFormat, Asia/Beirut) and
#     used it in getUpdateBucket() instead of the local device clock.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #483 — CostEstimator: broken Arabic document-count agreement
#   - components/CostEstimator.tsx:127 used a bare `${docCount} وثيقة` for
#     the Notary/Authentication cost line -- new bug class discovered
#     (Arabic number-noun agreement for "وثيقة"/document, distinct from the
#     already-thoroughly-fixed "يوم"/day pattern).
#   - Checked all 71 real ENRICHED_PROCEDURES requiredDocuments counts:
#     distribution {1:3, 2:4, 3:6, 4:12, 5:19, 6:15, 7:2, 8:2, 9:2, 13:1,
#     14:1, 17:1, 18:1, 30:2}. 58 of 71 (82%) fall in the 2-10 range where
#     the bare form was grammatically wrong (e.g. "2 وثيقة" instead of
#     "وثيقتين", "5 وثيقة" instead of "5 وثائق").
#   - Live in app/procedures/page.tsx:719's CostEstimator, rendered whenever
#     docCount > 0 (true for all 71 procedures).
#   - Fix: added arDocsLabel() with full singular/dual/plural/tamyiz
#     agreement. Adjacent "Translation" line (docCount before "×", not
#     directly before a noun) confirmed unaffected/not applicable.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #484 — ProcedureStepProgress: broken Arabic step-count agreement
#   - components/ProcedureStepProgress.tsx:95 used a bare `${n} خطوة`, a
#     third noun found with the same Arabic number-noun agreement bug class
#     (after يوم [6 components] and وثيقة [CostEstimator.tsx, #483]).
#   - Checked all 71 real ENRICHED_PROCEDURES steps-array lengths:
#     {3:7, 4:21, 5:12, 6:22, 7:4, 8:1, 9:1, 10:2, 15:1} -- 70 of 71 (99%)
#     fall in the 3-10 plural-required range.
#   - Live in app/procedures/page.tsx:811's always-visible enriched
#     procedure panel.
#   - Grammar note: since the full sentence is "X من Y خطوة" (X out of Y),
#     the preposition "من" governs the genitive case, so the correct dual
#     here is "خطوتين" (not the nominative "خطوتان" used in the standalone
#     "يومان متبقيان" fix from #478) -- accounted for in the fix.
#   - Fix: added stepPhraseAr() with full singular/genitive-dual/plural/
#     tamyiz agreement.
#   - Flagged for follow-up: components/ProcedureFlowchart.tsx:150 has the
#     same bare `${n} خطوة` pattern but for a different, dynamically-built
#     data source (flowchart nodes) not yet verified against real data.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #485 — ProcedureFlowchart: same step-count agreement bug, follow-up
#   - components/ProcedureFlowchart.tsx:150 (the lead flagged in #484) had
#     the identical bare `${nodes.length} خطوة` pattern, same word, but for
#     dynamically-built flowchart nodes instead of the static steps array.
#   - Checked: all 6 static fallback flowcharts in lib/flowchartData.ts have
#     6-8 nodes; AI-generated flowcharts follow the same real-procedure step
#     distribution audited in #484 (dominated by the 3-10 plural range).
#   - Live in 3 pages: app/procedures/[slug]/playbook/page.tsx,
#     app/forms/[slug]/FormDetailClient.tsx, app/services/page.tsx (none
#     pass compact, so the progress bar always renders).
#   - Fix: added flowStepPhraseAr() matching ProcedureStepProgress.tsx's
#     agreement rule (including the genitive dual خطوتين for this context).
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #486 -- GuidedFlow: English-mode search only matched Arabic fields
#   - components/GuidedFlow.tsx's `filtered` useMemo (search filter for the
#     procedure picker) tested query text only against p.ar and p.authority
#     (both Arabic), never against p.en -- despite the component rendering
#     real English search inputs (English aria-label/placeholder, dir='ltr')
#     when isAr === false.
#   - Verified against real data: of 368 name_ar values in lib/allServices.ts,
#     313 (85%) are pure Arabic with zero Latin characters; the other 55
#     contain only a parenthetical Latin acronym (CNSS, NPTP, SARL/LLC, etc),
#     not a full translation -- so a genuine English-language query almost
#     never matches p.ar. English-mode search was effectively broken for
#     nearly the entire catalog.
#   - Verified reachability: dynamic import in app/page.tsx:15, JSX usage at
#     app/page.tsx:2516.
#   - Fix: added `p.en.toLowerCase().includes(q) ||` to the filter's OR
#     conditions (additive only, no existing condition removed).
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #487 -- allServices.ts: 'N/A' website sentinel rendered as dead link
#   - Only 2 of 367 service records (re_008, misc_006 in lib/allServices.ts)
#     used a truthy 'N/A'/'N/A (...)' string for "no website", instead of the
#     empty-string convention used correctly by the other 10 no-website
#     records. Both service-page.tsx and authorities/page.tsx only check
#     truthiness (no URL validation), so this rendered a live, clickable
#     "Official Website" link with href literally "N/A" -- for services whose
#     own data says there is no central website.
#   - authorities/page.tsx aggregation (line 63) additionally "locks in" the
#     first-seen website per authority, compounding the bug there.
#   - Verified via grep: exactly these 2 records deviate from the empty-
#     string convention across all 367; both are live, non-dead records.
#   - Fix: changed both to website: '' to match the file's own convention.
#     No render-logic changes needed -- fixes both consuming pages at once.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #488 -- authorities page: non-numeric phone text rendered as dead tel: link
#   - app/authorities/page.tsx built href={`tel:${auth.phone}`} with zero
#     validation. 18 of 367 lib/allServices.ts records have descriptive
#     Arabic prose (no digits) in `phone` (e.g. 'يتفاوت بحسب البلدية',
#     'يختلف حسب المنطقة', '-'). Same placeholder-treated-as-real class of
#     bug fixed for `website` in batch #487.
#   - Confirmed 2 authorities (real_003, mun_002) are the SOLE service for
#     their authority_ar key in deriveAuthorities(), so nothing overwrites
#     the placeholder -- both render a live "call" link with garbage tel: href.
#   - Verified /authorities is a primary-nav destination (TopNav, MobileMenu),
#     not orphaned.
#   - Fix: added isDialablePhone() (>=2 consecutive digits) guard; renders
#     plain text instead of a tel: link when not dialable, and strips
#     non-digit separators from real numbers before building the href.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #489 -- CostEstimator fabricates a fee for procedures stated as free
#   - components/CostEstimator.tsx's parseFeesUSD() only recognized "مجاني"/
#     "free"/"gratis" as a zero-fee signal. 3 real lib/enrichedProcedures.ts
#     records use "لا رسوم"/"لا يتوجب أي رسم" phrasing instead, which fell
#     through to the numeric fallback: 2 have no digits at all and got the
#     hard-coded $20 default; 1 (finance-tax-registration) had an unrelated
#     "11%" VAT figure misread as an $11 fee -- both contradicting the
#     procedure's own "no fee" statement.
#   - Verified live: CostEstimator is rendered in app/procedures/page.tsx:719
#     whenever displayFees is non-empty, which is true for all 3 records.
#   - Checked all other "مجاني" fee strings in enrichedProcedures.ts -- none
#     are affected, so this addition carries no regression risk.
#   - Fix: extended the zero-fee regex to also match لا رسوم / لا يتوجب أي رسم.
#   - Flagged for follow-up: ProcedureEstimatedFeeChip.tsx has the identical
#     gap (milder symptom -- wrong category badge, not a fabricated dollar
#     figure) for the same 3 records.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #490 -- follow-up: same 'لا رسوم' gap in ProcedureEstimatedFeeChip
#   - components/ProcedureEstimatedFeeChip.tsx's parseFeesAr() had the exact
#     same missing-phrasing gap fixed in CostEstimator.tsx (batch #489) for
#     the same 3 records -- milder symptom here (wrong "varies" badge
#     instead of "free", no fabricated number).
#   - Verified live in app/procedures/page.tsx and PrintProcedureModal.tsx.
#   - Fix: extended the free-fee check to also match لا رسوم / لا يتوجب أي رسم.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #491 -- serviceFAQ.ts: corrupted Python dict-repr leaked into summary
#   - ref_004 in lib/serviceFAQ.ts has a `summary` value that's a raw Python
#     dict repr fragment ("شركة_ذات_مسؤولية_محدودة: {'الاسم': 'SARL ...")
#     truncated at exactly 300 chars -- rendered with zero guard in
#     app/faq/page.tsx and components/ProcedureFAQChips.tsx.
#   - The old guard (/^[{[]/, used for `fees`) doesn't catch this because
#     the corruption appears after Arabic prefix text, not at string start.
#   - Built a broader isCorruptDictRepr() detecting the `{'...':` signature
#     anywhere in the string. Verified against all 60 real summary + 60 real
#     fees values (post quote-unescape, matching runtime semantics): matches
#     only ref_004's summary and the 13 already-known corrupted fees records.
#   - Fix: added isCorruptDictRepr() guard to both files' summary rendering,
#     and upgraded the old fees guard in app/faq/page.tsx to the same
#     detector (no behavior change on the known 13 cases).
#   - Flagged for follow-up: 16 records have summary truncated at exactly
#     300 chars mid-word (no ellipsis) -- lower severity, data-level issue.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #492 -- ProcedureEstimatedCompletion invents a date for a vague timeline
#   - parseProcessingDays()'s last fallback checked lower.includes('شهر')
#     ("month") to return 30 days. Arabic plural "أشهر" ("months") contains
#     "شهر" as a substring, so a digit-free, dual-free mention of "months"
#     (an intentionally vague/unspecified duration) was silently coerced to
#     exactly 30 days instead of falling through to null. Same flaw in the
#     English fallback ('month' matches inside 'months').
#   - Real data: justice-personal-status-court (filing a personal-status
#     lawsuit -- marriage/divorce/custody/alimony) has processingTime
#     'يتفاوت حسب نوع القضية: أسابيع إلى أشهر' ("varies by case: weeks to
#     months") with zero digits -- rendered a false, specific completion
#     date + overdue counter for a sensitive family-law matter.
#   - Checked all 7 "أشهر" occurrences in enrichedProcedures.ts: the other 6
#     all have an explicit digit and are correctly intercepted earlier by
#     the digit+unit regex; only this record has zero digits and hits the
#     bug.
#   - Fix: excluded the plural form -- `شهر && !أشهر` / `month && !months`.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #493 -- "وثيقة" agreement bug was only fixed in 1 file, not 6
#   - Correction to prior batch commentary: the "وثيقة" (document) number-
#     noun agreement rule (batch #483) was applied ONLY in CostEstimator.tsx
#     -- never actually rolled out to "6 components" as later comments
#     implied (conflating it with the "يوم" fix's real 6-component scope).
#     The same bare-singular-next-to-a-count pattern was still live and
#     unfixed in 6 more components.
#   - Verified via real data: 62 of 71 ENRICHED_PROCEDURES records (87%)
#     have a requiredDocuments length in the 2-10 range needing the dual or
#     plural form.
#   - Fixed 6 live sites (all confirmed imported+rendered in app/procedures
#     or app/services): ProcedureDocReadinessBar.tsx, ProcedureRelated
#     Suggestions.tsx, ProcedureSearchModal.tsx, ProcedureProgressBadge.tsx
#     (both compact and full modes), ProcedureChecklistExport.tsx (printable
#     export HTML), and ReadinessChecker.tsx (which had the INVERSE bug --
#     always hard-coded plural, wrong for the 3 records with 1 document).
#   - Fix: added a local arDocsUnit(n) helper (same rule as CostEstimator.tsx)
#     to each of the 6 files, replacing the bare literal.
#   - tsc --noEmit: clean (exit 0) after all 6 file edits.
#
#   BATCH #494 -- ProcedureDocumentStatus vs NotificationBell day-count mismatch
#   - ProcedureDocumentStatus.tsx's getStatus() computed days-until-expiry as
#     a raw epoch diff: Math.ceil((new Date(dateStr).getTime() - Date.now())
#     / 86_400_000). A bare 'YYYY-MM-DD' parses as UTC midnight per spec, so
#     this is NOT a calendar-day count for non-UTC users.
#   - NotificationBell.tsx reads the exact same dalilak_doc_expiry_{code}_{i}
#     keys but computes a true calendar-midnight-to-calendar-midnight diff
#     (daysUntil()) -- both widgets render simultaneously (global TopNav bell
#     + per-procedure status on /procedures) and disagreed by up to a full
#     day (and a different Arabic grammatical form) for the identical stored
#     date, for any Beirut-timezone user depending on time of day.
#   - Fix: anchored getStatus() on Asia/Beirut calendar days (matching the
#     timezone convention already used in GovHolidayAlert.tsx /
#     ProcedureVersionTag.tsx), eliminating the cross-widget contradiction.
#   - Also re-verified the still-open lead that serviceFAQ.ts's steps/
#     requiredDocuments arrays might have the same Python-dict-repr
#     corruption found in summary (batch #491) -- confirmed clean, no fix
#     needed, lead closed.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #495 -- ProcedureStartButton/ProcedureCompletionBadge stored UTC dates
#   - Both wrote new Date().toISOString().slice(0, 10) (UTC calendar date) to
#     localStorage instead of Beirut's local date -- same bug class as
#     batches #481/#482/#494. During the ~2-3h window after Beirut midnight
#     (before UTC midnight), a user tapping "start" or "complete" got the
#     PREVIOUS day's date stored/displayed permanently (e.g. "Started 1 day
#     ago" instead of "Started today", immediately after clicking).
#   - Confirmed live: both components rendered on every enriched procedure
#     card, app/procedures/page.tsx:871-872. ProcedureCompletionBadge.tsx's
#     own formatDate() already assumed Beirut time for display (timeZone:
#     'Asia/Beirut') while the write side used UTC -- an internal
#     inconsistency within the same file.
#   - Fix: added an exported todayLb() helper in ProcedureStartButton.tsx
#     (toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })), used at
#     both write sites in that file and imported into
#     ProcedureCompletionBadge.tsx for its two write sites.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #496 -- last unfixed UTC-vs-Beirut date instance: deadline picker
#   - app/procedures/page.tsx:904 used new Date().toISOString().slice(0,10)
#     (UTC) for the deadline <input type="date">'s min attribute -- during
#     the ~2-3h post-midnight Beirut window, this let users pick yesterday's
#     date as a "deadline", which ProcedureDeadlineAlert.tsx (correct local-
#     midnight math) then immediately flagged as an already-past deadline.
#   - Confirmed via repo-wide grep this is the last live, unfixed occurrence
#     of the toISOString()-for-a-date-key pattern after batches
#     #481/#482/#494/#495 fixed the other 5.
#   - Also checked ProcedureDeadlineAlert.tsx's own snoozeToday (line 62,
#     also toISOString()) -- confirmed intentionally self-consistent (write
#     and read both use the same UTC expression, per the file's own
#     comment); left unchanged, no live bug there.
#   - Fix: min={new Date().toLocaleDateString('en-CA', { timeZone:
#     'Asia/Beirut' })}, matching the pattern already used in
#     SmartReminder.tsx / ProcedureRemindMeLater.tsx.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #497 -- Arabic-only step.authority/step.duration leaking into English mode
#   - app/procedures/[slug]/ProcedureDetailClient.tsx:182-185 rendered
#     step.authority and step.duration chips with NO isAr conditional, unlike
#     every other field in this component (title/description all branch on
#     isAr ? x_ar : x_en).
#   - Root cause: lib/procedures.ts's ProcedureStep type (lib/types.ts:82-83)
#     has no authority_en/duration_en fields at all -- confirmed via grep
#     that all 38 authority values and all 100 duration values in
#     lib/procedures.ts are pure Arabic text (e.g. 'الأمن العام',
#     '1-2 أسابيع') with zero English counterparts.
#   - Effect: an English-mode user on any procedure page with these fields
#     (the majority) saw raw Arabic text embedded mid-sentence, e.g.
#     "...submit the file. [authority-icon] الأمن العام [clock-icon] 1 ساعة".
#   - Confirmed live/reachable: app/procedures/[slug]/page.tsx imports and
#     renders <ProcedureDetailClient /> for every slug via
#     generateStaticParams; isAr comes from the real, user-toggleable
#     LanguageContext.
#   - Fix: hide these two chips when !isAr (step.authority && isAr / 
#     step.duration && isAr) instead of inventing a translation -- the
#     complete fix (adding real authority_en/duration_en for all 138
#     instances) is a content task, not a code fix, and is left as a
#     follow-up.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #498 -- NotificationBell.tsx device-local vs Beirut day-count mismatch
#   - components/NotificationBell.tsx:49-53 daysUntil() used the device's
#     LOCAL timezone midnight (new Date(); setHours(0,0,0,0)), not Beirut's,
#     while ProcedureDocumentStatus.tsx (fixed in batch #494) reads the
#     SAME dalilak_doc_expiry_{code}_{i} keys anchored on Asia/Beirut --
#     exact contradiction that file's own comment warned about but never
#     got propagated here.
#   - Also found an internal inconsistency in the same file: line ~127
#     already computes `today` correctly via Asia/Beirut for the reminder
#     due-filter, but then fed dates into the device-local daysUntil() for
#     the displayed day count -- two different clocks in one function.
#   - Confirmed live: NotificationBell is imported+rendered in TopNav.tsx:287
#     and MobileMenu.tsx:366 (present on effectively every page); the 'doc'
#     data path has a confirmed live writer (ProcedureDocumentStatus.tsx).
#     The 'appt' path currently has no live writer for dalilak_appointments,
#     so not counted as additional evidence.
#   - Fix: todayLb = toLocaleDateString('en-CA', {timeZone:'Asia/Beirut'}),
#     diff against that instead of device-local midnight.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #499 -- ProcedureFeeHistory.tsx hardcoded summer-only Beirut offset
#   - components/ProcedureFeeHistory.tsx:27-29 daysDiff() parsed the stored
#     payment date as `iso + 'T00:00:00+03:00'` -- a literal +03:00 offset.
#     Beirut is only UTC+3 during DST (late March-late October); the rest
#     of the year (confirmed via ICU Asia/Beirut data for Jan/Mar/Nov/Dec)
#     it's UTC+2.
#   - Effect: during winter months, for the last hour of each Beirut
#     calendar day (23:00-24:00 local), the parsed "then" timestamp was an
#     hour off, so daysDiff() flipped forward a full day early -- "Paid
#     today" showed "1 day ago" an hour before local midnight, and the
#     30-day amber/green color threshold shifted with it.
#   - Confirmed live: ProcedureFeeHistory is imported+rendered in
#     app/procedures/page.tsx:773, inside every expanded enriched-procedure
#     card's "Record payment" flow.
#   - Fix: drop the hardcoded offset entirely; anchor both sides on the
#     Asia/Beirut calendar-date string (same pattern as NotificationBell.tsx
#     daysUntil()), which is immune to DST since it never touches a
#     wall-clock offset.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #500 -- 16 FAQ summaries truncated mid-sentence with no ellipsis
#   - lib/serviceFAQ.ts has 16 of 60 `summary` records truncated at exactly
#     300 chars by the original generation pipeline (confirmed: max summary
#     length across all 60 records is exactly 300), with no "..." marker.
#   - app/faq/page.tsx:258 renders item.summary raw and in full when
#     expanded (unlike ProcedureFAQChips.tsx's previewFor(), which already
#     re-truncates at 160 chars with its own ellipsis) -- so these 16
#     answers visibly cut off mid-word/mid-phrase for users on /faq.
#   - Fix: added displaySummary(s) in app/faq/page.tsx that appends '...'
#     only when length >= 300 (the confirmed truncation cutoff), without
#     altering any real content. Full fix (regenerating the 16 summaries)
#     is a content task, left as a follow-up.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #501 -- ProcedureReminderBell reminders could never be dismissed
#   - components/ProcedureReminderBell.tsx (live on every enriched procedure
#     card, app/procedures/page.tsx:648) adds entries to dalilak_reminders
#     via addReminder(), but has zero dismiss/delete UI -- add-only.
#   - components/NotificationBell.tsx (mounted globally in TopNav.tsx /
#     MobileMenu.tsx) reads the same store and surfaces due reminders in its
#     dropdown, but likewise had no dismiss control on reminder items.
#   - Confirmed exhaustively via grep for dismissed:true / removeReminder( /
#     deleteReminder( that the only two real dismiss/delete implementations
#     are: (1) SmartReminder.tsx's inline dismiss()/deleteReminder() --
#     correct logic, but its default-exported component is never mounted
#     anywhere live, so unreachable; (2) ProcedureRemindMeLater.tsx's
#     removeReminder('quick_'+code) -- fixed-id, can only cancel its own
#     reminder, never a ProcedureReminderBell entry (Date.now() id).
#   - Effect: any reminder added via the per-procedure bell became due,
#     showed up in the global notification dropdown, and stayed there
#     forever, re-appearing daily and inflating the badge count, with zero
#     way to clear it short of manually wiping localStorage.
#   - Fix: exported dismissReminderById(id) from SmartReminder.tsx (reusing
#     its existing correct logic, not reviving its dead UI); NotificationBell
#     now carries a rawId per reminder NotiItem and renders a separate "x"
#     dismiss button next to the existing ask-Dalilak button for
#     type==='reminder' items only (doc/appointment items already have
#     other resolution paths).
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #502 -- 61 lib/allTransactions.ts records show raw English/scrape
#   junk as their "Arabic" title
#   - lib/allTransactions.ts:3407 TX_ALL mapping: title===titleEn for 61 of
#     2484 scraped rows (confirmed via a Node scan of the file's own _R
#     array; 2 of the 61 have hasForm=1). Examples: 'GENSEC0213' (raw
#     service code), 'Illegal Birth Registration (Lebanese citizen living
#     abroad) - E-Services Detail' (raw English page title with a leftover
#     scrape-artifact suffix).
#   - Confirmed live: app/forms/page.tsx renders `isAr ? tx.title : ...`
#     with no data-quality guard at lines 223/272; the 'forms-tx' tab
#     containing these records is the DEFAULT tab on page load
#     (useState<ViewTab>('forms-tx')); the raw text even gets spliced into
#     an Arabic "Ask Dalilak" prompt sentence.
#   - Fix: strip the " - E-Services Detail" scrape suffix at the TX_ALL
#     build step; for the 61 records with no real Arabic content, prefix
#     the ministry's own (always-present) Arabic name instead of showing
#     bare English/code text as the Arabic-mode title. Only the mapping
#     function changed -- the raw _R data itself is untouched.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #503 -- ProcedureQRShare QR code pointed at a dead/foreign domain
#   - components/ProcedureQRShare.tsx:276 built its shared URL with
#     https://dalilak.app/... -- confirmed via web fetch that this domain
#     times out entirely (not the live app), while every other URL-
#     producing spot in the codebase (app/layout.tsx metadataBase,
#     app/sitemap.ts, app/robots.ts, ProcedureShareViaEmail.tsx,
#     ChatMessageActions.tsx) consistently uses the real production domain
#     dalilak-frontend.vercel.app. This file was the sole outlier.
#   - Confirmed live: imported+rendered in app/procedures/page.tsx:1050 on
#     every expanded procedure card; its own modal caption promises "scan
#     to open directly" -- a promise that could never be kept while
#     pointing at a dead host.
#   - Fix: corrected the domain to match every other reference in the app.
#   - Follow-up noted but out of scope: even post-fix, the link uses free-
#     text title search (?q=) rather than the stable proc.code identifier
#     already passed to the component, and app/procedures/page.tsx doesn't
#     currently read any ?q= URL param via useSearchParams() to apply a
#     filter on load -- full "direct access" would need a larger cross-file
#     change; this fix addresses the core dead-domain defect only.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #504 -- ProcedureShareViaEmail always sent Arabic steps even in
#   English mode
#   - components/ProcedureShareViaEmail.tsx:29 buildMailto(): `steps` was
#     the one field with no isAr branch -- title/ministry/fee/time/docs all
#     correctly fall back to their _en variant, but steps always used
#     proc.steps (Arabic).
#   - Confirmed live: app/procedures/page.tsx:34/1045 imports+renders this
#     in every procedure card's share section; Node check confirms
#     steps_en is populated for all 71 records in lib/enrichedProcedures.ts,
#     so this affected every procedure, not an edge case.
#   - Confirming evidence this was a miss, not intentional: the sibling
#     "Share via WhatsApp" button (app/procedures/page.tsx:1011) already
#     does `isAr ? proc.steps : (proc.steps_en?.length ? proc.steps_en :
#     proc.steps)` correctly.
#   - Effect: an English-mode user's "Share via Email" produced an email
#     with English subject/greeting/labels but Arabic step-by-step
#     instructions spliced into the middle.
#   - Fix: applied the same isAr/steps_en fallback pattern already used by
#     the WhatsApp share button.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #505 -- ProcedureHistoryLog never logs 'started'/'completed'
#   events, only 'viewed'
#   - components/ProcedureHistoryLog.tsx has full built-in support (labels,
#     icons, dedup) for 'viewed'/'started'/'completed' events via its
#     exported addHistoryEvent(code, event), but grep confirms exactly ONE
#     call site in the whole repo: its own internal 'viewed' auto-log.
#     ProcedureStartButton.tsx's setStartDate() and
#     ProcedureCompletionBadge.tsx's markCompleted() never called it.
#   - Confirmed live: ProcedureStartButton, ProcedureCompletionBadge, and
#     ProcedureHistoryLog are all imported+rendered adjacently in the same
#     expanded procedure card (app/procedures/page.tsx:871/872/880).
#   - Effect: a user clicking Start then Complete sees both buttons update
#     their own badges correctly, but the "Activity log" right below them
#     could never show either event -- it stays stuck on "Viewed" forever,
#     even after the user finishes the whole procedure.
#   - Fix: added addHistoryEvent(code, 'started') to setStartDate() and
#     addHistoryEvent(code, 'completed') to markCompleted(). No circular-
#     import risk (ProcedureHistoryLog.tsx imports neither file).
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #506 -- Advanced-filter "Processing Speed" silently dropped ~30%
#   of real procedures from every speed bucket
#   - app/procedures/page.tsx:216-224 advFilters.speed filter checked only
#     the singular Arabic forms (pt.includes('يوم') / pt.includes('أسبوع')) -- the
#     broken-plural forms 'أيام' (days) and 'أسابيع' (weeks) do NOT contain
#     the singular as a literal substring (confirmed: 'أيام'.includes('يوم')
#     === false), so every procedure whose processingTime used the plural
#     form matched none of fast/normal/slow.
#   - Confirmed live: app/procedures/page.tsx:27/1173 imports+renders
#     ProcedureFilterDrawer; filteredEnriched (which applies this filter) is
#     the actual rendered procedure list, and totalResults on the drawer's
#     button reflects the same undercount.
#   - Verified against all 71 real records in lib/enrichedProcedures.ts:
#     21 of 70 non-empty processingTime values matched zero speed buckets
#     before the fix (e.g. '3–5 أيام عمل', '4–8 أسابيع' x4). Singular/
#     dual/tanween forms (يوم واحد, يومان, 15 يوماً, أسبوعان) and شهر/أشهر
#     already matched correctly -- confirmed this is specific to the plural
#     gap, not a general failure.
#   - Fix: added the plural forms 'أيام' and 'أسابيع' to the fast/normal
#     checks. matchedNone dropped from 21 to 3 (the residual 3 are free-text
#     durations with no day/week/month unit -- 'فوراً', 'حسب جدول
#     الامتحانات الرسمية', and one rare no-hamza spelling variant -- out of
#     scope for a keyword-based fix, noted in UX_AUDIT.md for a future
#     batch).
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #507 -- Advanced-filter "Fees" defaulted 7 procedures with no
#   recorded fee data to "Paid", though one is literally titled "estate
#   transfer duty"
#   - app/procedures/page.tsx:209-214 advFilters.feeType filter: when
#     p.fees === '' (no fee text recorded at all), none of the
#     free-keyword checks match, so isFree=false and the record is always
#     bucketed as "paid" -- even though "no data" isn't the same as
#     "confirmed paid".
#   - Confirmed live: same advFilters/ProcedureFilterDrawer/filteredEnriched
#     path verified in batch #506.
#   - Verified against real data: `grep -c "fees:''" lib/enrichedProcedures.ts`
#     = 7 records. 6 are social-aid/scholarship procedures likely free
#     (e.g. 'طلب منح مدرسية لأولاد الشهداء'), but the 7th is titled
#     'إستكمال المستندات وتحرير التركة وتحقيق رسم الإنتقال' (estate
#     transfer duty) -- its own title implies a real fee exists. This
#     blocks any safe "empty = free" assumption; guessing the real fee
#     content/amount would violate the no-fabricated-content rule.
#   - Fix: excluded fees==='' records from the filtered results entirely
#     (neither asserted free nor paid) instead of defaulting them to
#     "paid". Removes the misleading "paid" classification for the 6
#     aid procedures without guessing they're free; "free" filter
#     behavior is unchanged (already excluded them). Populating the real
#     fee data for these 7 records (especially the transfer-duty one) is
#     left for a future batch with an authoritative source.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #508 -- "Guided procedures" section (27 items) completely ignored
#   the advanced-filter drawer, always shown unfiltered
#   - app/procedures/page.tsx:182-195 filteredGuided (sourced from
#     PROCEDURES_DATA, a separate data system from lib/enrichedProcedures.ts)
#     never read advFilters and didn't list it as a useMemo dependency --
#     only filteredEnriched (lines 197-238) applied hasForm/feeType/speed/
#     started. PROCEDURES_DATA has zero 'hasForm' fields at all
#     (grep -c "hasForm" lib/procedures.ts = 0), so that filter could never
#     even apply to it in principle.
#   - Confirmed live: filteredGuided.map(...) renders directly at line 442;
#     totalResults={filteredEnriched.length + filteredGuided.length} (line
#     1178) feeds ProcedureFilterDrawer's "Show N results" button.
#   - Verified against real data: grep -c "status: 'active'" lib/procedures.ts
#     = 27 guided procedures always shown regardless of filter. Concrete
#     example: 'property-transfer' (lib/procedures.ts:262) has real percentage-
#     based fees (5% + 0.5-1% of property value) yet stayed visible under
#     "Fees: Free" / "Speed: Fast" / "Has form" filters.
#   - Fix: since guided data has no equivalent fields to filter on, hide the
#     whole guided section while any advanced filter is active (using the
#     already-imported hasActiveFilters() helper) instead of silently
#     ignoring the filter for a third of the page's content.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #509 -- "Previous Chats" restore silently dropped the most recent
#   messages of any conversation over 40 turns
#   - components/ChatHistoryPanel.tsx:45 saveChatSession() stored
#     messages.slice(0, 40) -- the OLDEST 40 messages, since the array is
#     chronological (new messages appended via setMessages(prev =>
#     [...prev, ...])) -- while messageCount kept the true full length.
#   - Confirmed live: app/page.tsx:35 imports saveChatSession, called from
#     onNewChat (line 1352), onHomeClick (line 2507), onHome (line 2590)
#     with the live messages array; the panel's Restore button feeds
#     s.messages straight into setMessages (line 1511).
#   - Effect: a user with a 52-message chat taps "New Chat", later opens
#     Previous Chats (badge correctly shows "52 msgs"), taps Restore -- but
#     only gets the oldest 40 messages back, silently missing the most
#     recent 12+, with no indication anything was cut.
#   - Fix: changed slice(0, 40) to slice(-40) to keep the most recent 40
#     messages instead of the oldest 40.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #510 -- "Save to notepad" chat button shows a success checkmark but
#   the note is permanently unrecoverable (dead-end write, 3rd instance of
#   this bug class)
#   - components/ChatSaveToNotes.tsx:14/30 writes to
#     localStorage['dalilak_notepad'] and shows a green checkmark. The only
#     other file referencing that key, components/QuickNotepad.tsx, is (a)
#     never imported/rendered anywhere in app/ (confirmed via grep -- zero
#     JSX usage outside its own file), and (b) even if mounted, reads from
#     sessionStorage instead of localStorage -- a storage-API mismatch on
#     top of the orphaned-component problem.
#   - Confirmed live: app/page.tsx:32/1974 imports+renders ChatSaveToNotes
#     under every assistant chat message, right next to the "Save reply"
#     bookmark button fixed for the identical bug class in batch #460
#     (dalilak_bookmarks) and batch #461 (dalilak_chat_sessions) -- this is
#     the third sibling component with the same dead-write pattern that the
#     earlier audits missed.
#   - Fix: same pattern as batch #460 -- added a "Saved Notes" section to
#     app/my-files/page.tsx (the page already dedicated to saved content)
#     that reads localStorage['dalilak_notepad'] directly (matching the
#     live writer, not sessionStorage) with a Clear button. QuickNotepad.tsx
#     itself is untouched -- still an unmounted separate component, out of
#     scope for this fix which targets the live write path only.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #511 -- audit only, no code changed. AppointmentReminder.tsx and
#   NotificationBell.tsx both read localStorage['dalilak_appointments']
#   (both live/mounted -- AppointmentReminder in app/page.tsx:25/2489,
#   NotificationBell in the header on every page) but exhaustive grep across
#   app/, components/, lib/ found zero setItem('dalilak_appointments', ...)
#   call sites anywhere -- no "add appointment" form or other writer exists.
#   Unlike the dead-write bugs fixed in batches #460/#461/#510 (a live
#   button falsely confirms success), this is the reverse: both readers are
#   correct and live, but nothing ever produces the data, so the feature
#   fails silently (renders null) rather than misleading anyone. A real fix
#   means designing and building a full "add appointment" feature (form +
#   storage + validation) from scratch, which is a new feature, not a
#   surgical bug fix -- out of scope for this record. Left as a flagged
#   lead in UX_AUDIT.md for a future batch if that feature is ever built.
#
#   BATCH #512 -- Chat autocomplete suggestions: arrow-key navigation showed
#   no visual highlight, and Enter could silently swap the user's message
#   for an unrelated suggestion instead of sending it
#   - components/SmartInputSuggestions.tsx had TWO independent
#     implementations of the same activeIdx state: the default-exported
#     component (only updated via onMouseEnter, drives the visible
#     highlight/aria-selected) and the separately exported
#     useSmartSuggestionsKeyDown() hook (a second, disconnected activeIdx,
#     the one actually wired to the textarea's onKeyDown). The component's
#     own keyboard handler was dead code (explicitly void-ed with a comment
#     admitting the parent "must" wire it up, which never happened).
#   - Confirmed live: app/page.tsx:43/604-606/2322/2368 -- the hook drives
#     onKeyDown, the component renders the dropdown, but smartActiveIdx was
#     destructured and never passed as a prop (Props interface didn't even
#     accept it).
#   - Traced real flow: user types 3+ chars, hint text says '↑↓ navigate ·
#     Enter select' -- pressing ArrowDown moves the hook's activeIdx with
#     zero visual change (component's own activeIdx untouched), then Enter
#     satisfies the hook's `activeIdx >= 0` check, silently replaces the
#     typed message with an unrelated canned suggestion via onSelect(), and
#     preventDefault() blocks the real send handler from ever running --
#     always reproducible, not an edge case, and directly contradicts the
#     on-screen instructions for the same feature.
#   - Fix: made the component controlled -- activeIdx/onHover now passed
#     down from the hook (single source of truth for keyboard AND mouse
#     selection) instead of the component owning a disconnected duplicate;
#     removed the dead unused keyboard handler from the component.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #513 -- Daily-quota-remaining warning banner was hardcoded RTL
#   even in English mode
#   - app/page.tsx:2068-2073 quota-remaining banner container hardcoded
#     direction: 'rtl', textAlign: 'right' with no isAr branch, even though
#     the banner's own text already correctly branches on isAr ('Daily
#     quota exhausted' vs 'استنفذت حصتك اليومية'). The sibling retry-chip
#     banner directly above it (line 2047) was already fixed for the exact
#     same issue in batch #424 (direction: isAr ? 'rtl' : 'ltr') -- this
#     one never got the same treatment.
#   - Confirmed live: quotaRemaining (line 580) is populated from a real
#     backend SSE field (metaRemaining <- p.remaining, lines 1173-1237) on
#     every real chat response -- any user whose daily quota drops to <=10
#     triggers this banner in production, no synthetic path involved.
#   - Effect: an English-mode user running low on quota (especially <=3,
#     when the banner turns red) sees the warning pill rendered right-
#     aligned inside an RTL container while the rest of the English layout
#     is LTR/left-aligned -- visibly inconsistent at exactly the moment a
#     quota-limited user needs a clear warning.
#   - Fix: branched direction/textAlign on isAr, matching the sibling retry
#     chip's already-fixed pattern.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #514 -- Drafting Studio's long-text (textarea) fields were
#   hardcoded RTL even in English mode, unlike the sibling <input> fields
#   on the same form
#   - components/DraftingStudio.tsx:327 -- the shared <textarea> style
#     (used by all 14 textarea-type fields across the 8 document templates,
#     e.g. "Reason for Eviction", "Case Description", "Notes") hardcoded
#     direction: 'rtl' with no isAr branch, while the sibling <input> style
#     immediately below it (lines 332-348, same form, plain text fields)
#     has no direction override at all and correctly inherits the page's
#     dir={isAr ? 'rtl' : 'ltr'}.
#   - Confirmed live: app/drafting-studio/page.tsx:5/93 imports+renders
#     <DraftingStudio isAr={isAr} .../> on the live /drafting-studio route
#     with the app's real language state; grep -c "type: 'textarea'" = 14
#     fields all going through this one shared style block.
#   - Effect: an English-mode user filling in e.g. "Case Description" gets
#     a forced-RTL textarea while typing English, while the short-text
#     <input> field right next to it on the same form stays correctly LTR
#     -- same bug class just fixed in app/page.tsx (batch #513) but in a
#     completely different component.
#   - Fix: branched direction on isAr, matching the sibling <input>'s
#     correct (inherited) behavior.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #515 -- Attached-file preview card in the chat composer was
#   hardcoded right-aligned even in English mode (3rd instance of the same
#   RTL-hardcoding bug class as #513/#514)
#   - app/page.tsx:2142 -- the attached-file preview text container
#     (filename + size + "Ready to analyze" status) hardcoded
#     textAlign: 'right' with no isAr branch, even though isAr is in scope
#     and correctly used two lines below for the status text itself
#     (isAr ? 'جاهز للتحليل' : 'Ready to analyze').
#   - Confirmed live: app/page.tsx:554/556/566 -- Home() is the main chat
#     route at /, isAr is in scope, attachedFile is real state
#     (useState<AttachedFile | null>(null)) populated whenever a user
#     attaches a file via the composer's attach button; the page's own
#     top-level wrapper (line 1376) correctly sets
#     direction: isAr ? 'rtl' : 'ltr', so this block renders in a real LTR
#     context in English mode while its inner text stays force-right-
#     aligned.
#   - Effect: an English-mode user attaching a file sees the filename,
#     size, and "Ready to analyze" text jammed against the right edge of
#     the preview card instead of following the file-type icon naturally
#     on the left -- reversed reading order, inconsistent with the rest of
#     the English UI.
#   - Fix: branched textAlign on isAr, same pattern as #513/#514.
#   - tsc --noEmit: clean (exit 0).
#
#   BATCH #516 -- Document Intelligence View's 7 collapsible section headers
#   were hardcoded right-aligned even in English mode (4th instance of the
#   same RTL-hardcoding bug class as #513/#514/#515)
#   - components/DocumentIntelligenceView.tsx:51-57 sectionHeader() style
#     factory hardcoded textAlign: 'right' with no isAr branch; the
#     CollapsibleSection component (lines 763-766) didn't even accept isAr
#     as a prop despite being used 7 times for sections whose titles render
#     in English in English mode ("Extracted Data", "Related Procedures",
#     "Missing Requirements", "Potential Risks", "Suggested Templates",
#     "Next Steps", "Sources & Confidence").
#   - Confirmed live: components/ChatMessage.tsx:14/292-294 dynamically
#     imports and renders this component with a real isAr={ar} whenever
#     msg.documentAnalysis is set (after any uploaded-document analysis);
#     the component's own root wrapper (line 798) already correctly sets
#     direction: isAr ? 'rtl' : 'ltr', confirming the sectionHeader omission
#     was a miss, not intentional.
#   - Effect: an English-mode user analyzing an uploaded document sees all
#     7 section headers (e.g. "Extracted Data", "Potential Risks") pushed
#     to the right edge of the header bar against the collapse chevron,
#     instead of following the section icon naturally on the left --
#     reversed LTR reading order across all 7 sections at once.
#   - Fix: threaded isAr through CollapsibleSection -> sectionHeader() and
#     updated all 7 call sites to pass isAr={isAr}.
#   - tsc --noEmit: clean (exit 0).
#
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
rm -f components/HomepageQuickActionsBar.tsx
rm -f components/HomepageStreakCounter.tsx components/MinistryOpenHoursWidget.tsx \
      components/TransactionScoreWidget.tsx components/ProcedureFavoritesList.tsx \
      components/HomepageLiveStats.tsx components/HomepageCalendarWidget.tsx \
      components/ChatWelcomeMessage.tsx components/ProcedureAlertSummary.tsx \
      components/HomepageProcedureStats.tsx components/ProcedureCategoryIcon.tsx \
      components/ProcedureChatContext.tsx components/HomepageProgressRing.tsx \
      components/SearchHistoryPanel.tsx components/MultiDocumentConsistencyPanel.tsx \
      components/ProcedureShareButton.tsx components/HomepageWeatherBanner.tsx \
      components/HomepageNewProceduresBadge.tsx components/TransactionFilePanel.tsx \
      components/StatsBadgeStrip.tsx components/SavedCostSummary.tsx \
      components/ProcedureStatusBoard.tsx components/ProcedureComparator.tsx \
      components/QuickContacts.tsx components/HomepageMotivationalQuote.tsx \
      components/HomepageUserStats.tsx components/HomepageCompletionCTA.tsx \
      components/ProcedureHashtagChips.tsx components/RecentActivityFeed.tsx \
      components/EscalationModal.tsx components/DailyTip.tsx \
      components/GovCalendar.tsx components/HomepageWeeklyGoalWidget.tsx \
      components/HomepageTodaysTasks.tsx components/HomepageMinistrySpotlight.tsx \
      components/ProcedureRequiredDocsCounter.tsx components/LanguagePreferenceCard.tsx \
      components/HomepageRecentMinistries.tsx components/DocumentAnalysisPanel.tsx \
      components/ProcedureBookmarks.tsx components/ChatMessageTimestamp.tsx \
      components/DocExpiryCalendar.tsx components/HumanReviewCTA.tsx \
      components/LiveBeirutClock.tsx components/HomepageTodayTasks.tsx \
      components/HomepageWeatherWidget.tsx components/HomepageFeaturedFAQ.tsx \
      components/SmartHomeBanner.tsx components/HomepageMiniStats.tsx \
      components/HomepageProcedureOfTheDay.tsx components/WelcomeBackBanner.tsx \
      components/RecentlyViewedPanel.tsx
rm -f components/AppointmentTracker.tsx
rm -f components/ProcedureRequiredDocsCounter.tsx
rm -f components/TransactionFilePanel.tsx components/DocumentAnalysisPanel.tsx \
      components/RiskScoreCard.tsx components/HumanReviewCTA.tsx \
      components/MissingDocumentsChecklist.tsx
rm -f components/ProcedureLastUpdatedBadge.tsx
rm -f components/DocExpiryBanner.tsx
rm -f components/DocChecklistBuilder.tsx components/ProcedureProgressTracker.tsx
git add -A

# ================================================================
# مشروع أرشيف الوثائق الرسمية — دفعة منفصلة (خارج ترقيم batch # أعلاه)
#   تحديث: أكملنا OCR على كل الـ1598 ملف الممسوح ضوئياً الذي كان معلّقاً
#   (كانت مكتملة على 255 فقط سابقاً) بعد أن سأل المستخدم عن الفارق بين حجم
#   المصدر الحقيقي (8.75GB ضمن 05+06+07) وحجم الأرشيف المرفوع (1.8GB) —
#   اكتشفنا أن ~950 وثيقة حكومية حقيقية (وزارة العمل/الزراعة/التربية/
#   الداخلية/الطاقة) استُبعدت بسبب عدم اكتمال OCR فقط، لا لأنها بلا محتوى.
#   بعد إكمال OCR: الأرشيف النهائي صار 5303 وثيقة (بدل 4378)، من 19 جهة.
#   lib/archiveDocuments.ts   — 5303 وثيقة حكومية حقيقية (نص + عنوان + جهة
#                               + سنة + رابط PDF)، مستخرجة ومصنّفة من أرشيف
#                               6504 ملف (المجلدات 05+06+07)، بعد استبعاد
#                               353 ملف أرشيف زحف تالف، 122 ملف داخلي لجامعة
#                               AUB، 528 ملف تعذّر استخراج نص منه حتى بعد
#                               OCR كامل، و198 نسخة مكررة حرفياً. راجع
#                               forms_pipeline/ في مجلد المشروع الرئيسي
#                               لتفاصيل خط الاستخراج الكامل.
#   app/archive/page.tsx      — صفحة "أرشيف الوثائق الرسمية": بحث + تصفية
#                               حسب الجهة (19 جهة) + بطاقات بنفس نمط /forms
#   app/archive/layout.tsx    — metadata/SEO لصفحة /archive (محدّثة لـ5300+)
#   components/MobileMenu.tsx — رابط "أرشيف الوثائق الرسمية" لقائمة التنقّل
#                               الجانبية (أُضيف في الدفعة السابقة، بلا تغيير)
#
#   ملاحظة: ملفات PDF الأصلية (٣.١GB بعد التوسعة) مستضافة على مستودع منفصل
#   github.com/wfklawfirm/dalilak-forms-archive — المستودع منشأ مسبقاً
#   وتم رفع النسخة الأولى (4378 ملف) بنجاح. الدفعة الإضافية (925 ملف جديد
#   من استكمال OCR) لم تُرفع بعد؛ يجب تشغيل
#   forms_pipeline/archive_staging/push_archive.sh مرة أخرى (git add -A
#   يكتشف الملفات الجديدة تلقائياً).
#
#   نفس بيانات هذا الأرشيف (كامل الـ5303) مرفوعة بالكامل إلى Qdrant
#   (collection dalilak_ai_v2، domain=official_documents_archive) لإغناء
#   إجابات الشات بوت — عملية منفصلة عن الفرونتند، لم تُغيّر أي Backend API.
#
# تصحيح لاحق — تحسين جودة العناوين واستبعاد صفحات حجب WAF (2026-07-26)
#   بطلب المستخدم: "يوجد عناوين غير مقروءة حسنها". فحص عيّنة 25 وثيقة كشف
#   4 أنواع عناوين تالفة: (1) عناوين OCR بحروف لاتينية عشوائية بلا معنى،
#   (2) تشفير خط عربي تالف يظهر كرموز رياضية/سهمية غير مفهومة، (3) عناوين
#   مكرّرة لاسم الجهة نفسها بلا أي معلومة إضافية، (4) شذرات قصيرة بلا معنى.
#   أُعيدت كتابة looks_coherent()/derive_title() في forms_pipeline/
#   build_dataset.py بمعايير أدق (رفض نطاقات يونيكود رياضية/رمزية، اشتراط
#   3+ كلمات عربية حقيقية أو 4+ كلمات لاتينية مع كلمة وقف إنجليزية شائعة)،
#   بعد اختبار تكراري على عيّنات فعلية لتفادي رفض/قبول خاطئ.
#   اكتُشفت أيضاً 69 وثيقة كانت في الحقيقة صفحة حجب من جدار حماية/CDN
#   ("The requested URL was rejected") محفوظة كأنها الملف الأصلي — تم
#   استبعادها في forms_pipeline/merge_classify.py (فحصت النمط على كامل
#   المجموعة قبل اعتماده، وتأكدت أن أنماطاً أخرى مشابهة لم تظهر إطلاقاً
#   لتفادي حذف محتوى حقيقي بالخطأ).
#   النتيجة: الأرشيف صار 5234 وثيقة (بدل 5303)، لا يزال من 19 جهة. تم تحديث
#   عناوين كل الوثائق الـ5234 في Qdrant (payload فقط، بلا إعادة تضمين) وحذف
#   الـ69 نقطة الخاصة بصفحات الحجب من نفس القاعدة.
git add lib/archiveDocuments.ts app/archive/page.tsx app/archive/layout.tsx components/MobileMenu.tsx
git diff --cached --quiet || git commit -m "fix: تحسين جودة عناوين أرشيف الوثائق واستبعاد 69 صفحة حجب WAF — 5234 وثيقة نهائياً (19 جهة)، تحديث Qdrant"
#
# تصحيح لاحق — بحث بالذكاء الاصطناعي داخل /archive بدل بحث نصي بسيط (2026-07-26)
#   بطلب المستخدم: "اجعل البحث عبر الذكاء الاصطناعي و ليس محرك بحث عادة".
#   أُضيف components/ArchiveAISearch.tsx: يستدعي /chat/stream الموجود
#   مسبقاً على الباك-إند مع معامل domain=official_documents_archive
#   (موجود أصلاً في ChatRequest، لم يُضَف ولم يُعدَّل أي Backend API) لتضييق
#   الاسترجاع على وثائق الأرشيف فقط والحصول على إجابة مُصاغة بالذكاء
#   الاصطناعي بدل قائمة نتائج نصية. يطابق عناوين المصادر المُعادة محلياً مع
#   lib/archiveDocuments.ts لعرض روابط PDF حقيقية دون أي تغيير في شكل
#   استجابة الباك-إند.
#   app/archive/page.tsx يعرض الآن مبدّل وضعين: "بحث بالذكاء الاصطناعي"
#   (الافتراضي للمستخدمين المسجّلين، لأن /chat/stream يتطلب تسجيل دخول أصلاً
#   كما "اسأل دليلك" الرئيسي) و"بحث نصي سريع" (الافتراضي للزوار غير
#   المسجّلين — يبقى يعمل بلا أي تسجيل دخول جديد، فلا وظيفة موجودة تُحذف أو
#   تُقيَّد).
git add lib/archiveDocuments.ts app/archive/page.tsx components/ArchiveAISearch.tsx
git diff --cached --quiet || git commit -m "feat: بحث بالذكاء الاصطناعي في أرشيف الوثائق الرسمية (/chat/stream + domain=official_documents_archive)، مع بحث نصي سريع كخيار بديل بلا تسجيل دخول"
#
# تصحيح لاحق — دمج وثائق الأرشيف الرسمية داخل صفحات المعاملات (2026-07-26)
#   بطلب المستخدم: "ادمج النماذج التي تكون معملة إدارية أو رسمية في
#   المعاملات". أُضيف قسم "نماذج ووثائق رسمية ذات صلة" في
#   app/procedures/[slug]/ProcedureDetailClient.tsx (بعد قسم خطوات
#   الإجراء مباشرة) يطابق proc.authority.ministry_en/name_en نصياً مقابل
#   ArchiveDoc.institution من lib/archiveDocuments.ts — بدون أي تخمين:
#   إن لم تطابق الجهة المختصة أي جهة موجودة فعلاً في الأرشيف، لا يُعرض
#   القسم إطلاقاً. عند التطابق، تُرتَّب النماذج الفعلية (عناوين تحتوي
#   "نموذج"/"طلب"/"استمارة"/form/application) قبل غيرها من نفس الجهة، حتى
#   5 وثائق. تحقّق فعلي (سكريبت Python مستقل يوازي منطق TypeScript تماماً)
#   أثبت أن 13 من أصل 134 جهة معاملة فريدة (وزارة الداخلية، العدل، المالية،
#   العمل، الصناعة، الخارجية...) تطابق جهات حقيقية في الأرشيف — أي أن
#   القسم سيظهر فعلياً على معاملات حقيقية بعد النشر، وليس ميزة صامتة.
#   ملاحظة نطاق: هذا يغطي app/procedures/[slug]/page.tsx (المصدر
#   PROCEDURES_DATA عبر getProcedureBySlug) فقط — صفحة /playbook تقرأ من
#   ENRICHED_PROCEDURES (مصدر بيانات مختلف تماماً) ولم تُلمس، تفادياً
#   لتوسيع نطاق التغيير بلا ضرورة.
git add "app/procedures/[slug]/ProcedureDetailClient.tsx"
git diff --cached --quiet || git commit -m "feat: دمج وثائق الأرشيف الرسمية الحقيقية في صفحة تفاصيل المعاملة عبر مطابقة الجهة المختصة"
#
# تصحيح لاحق — إظهار مستند/نموذج مرتبط في رد "اسأل دليلك" مع رابط تحميل (2026-07-26)
#   بطلب المستخدم: "اذا سأل أي سؤال ولديك نموذج أو مستند مرتبط يظهر في
#   الإجابة ويمكن تحميله". بطاقة "المصادر المستخدمة" (TrustBadge في
#   AgentResponseRenderer.tsx) كانت موجودة أصلاً وتعرض src.url كرابط إن
#   وُجد — لم يكن ينقصها عرض، بل كان ينقصها أن المصادر القادمة من
#   /chat/stream (title/ministry/score فقط، بلا url) لا تُطابَق أبداً مع
#   ملف حقيقي قابل للتحميل. الحل بالكامل frontend، بدون أي تعديل Backend:
#   - lib/archiveDocuments.ts: أُضيفت findArchiveDocByTitle() (تصدير جديد،
#     مطابقة تامة ثم جزئية بالعنوان) — الملف نفسه لم يتغيّر في بنيته.
#   - app/page.tsx: بعد اكتمال الرد، إن وُجدت مصادر، يستورد
#     lib/archiveDocuments ديناميكياً (import() لا import ثابت في أعلى
#     الملف — الملف ~4MB خاماً بسبب حجم الأرشيف، فلا يجوز تحميله ضمن حزمة
#     الصفحة الرئيسية دائماً؛ يُحمَّل فقط عند وجود مصادر فعلية تحتاج فحصاً،
#     ويُخزَّن مؤقتاً في المتصفح بعد أول استدعاء) ويضيف src.url الحقيقي
#     لأي مصدر مطابق.
#   - components/ChatMessage.tsx: يمرّر defaultExpandSources لفتح بطاقة
#     "المصادر" تلقائياً فقط عند وجود رابط ملف حقيقي، بدل تركها مطويّة
#     دائماً — بلا أي زر أو مكوّن جديد (يخدم أيضاً هدف تقليل العجقة).
git add lib/archiveDocuments.ts app/page.tsx components/ChatMessage.tsx
git diff --cached --quiet || git commit -m "feat: إظهار رابط تحميل حقيقي لأي وثيقة أرشيفية مطابقة ضمن رد اسأل دليلك (بلا تعديل Backend، بلا زر جديد)"

# ================================================================
# Batch #498 — تدقيق شامل لتقليل العجقة والأزرار في كل الصفحات
#   طلب المستخدم: "حاول بإحترافية في الصفحات كلها تقليل العجقة و الازرار
#   للحد الادنى بإحترافية و بعملية و بذكاء حاد". تدقيق عبر Explore agent
#   (opus) عبر كل الصفحات الرئيسية، أعطى 15 نتيجة موثّقة بـ file:line،
#   ثم تحقّقتُ من كل نتيجة بقراءة الكود الفعلي قبل التنفيذ (رُفضت نتائج
#   كانت في الواقع قرارات تصميم مقصودة وموثّقة بتعليق سابق في الكود، مثل
#   صفّي "الإجراءات السريعة" في الصفحة الرئيسية — batch #342 — وزر
#   "Accessibility" في MobileMenu الموصوف بالتعليق كمدخل مباشر مقصود).
#   4 تكرارات حقيقية بلا أي مبرر مُوثَّق نُفِّذت:
#   - app/page.tsx: إزالة عدّاد أحرف مكرر (كان هناك عدّادان في صف واحد،
#     أحدهما به خطأ كمون — كان يُظهر تحذير "طويل جداً" عند 600 حرف بينما
#     الحد الفعلي 4000 حرف)، أُبقي على ChatInputCharCounter وحده مع
#     maxLength={MAX_INPUT} الصحيح.
#   - app/procedures/[slug]/ProcedureDetailClient.tsx: إزالة زر "الرئيسية"
#     الثانوي من صف الأزرار — كان يؤدي لنفس وجهة تبويب "الرئيسية" في
#     BottomNav المعروض أسفل الشاشة نفسها. زر "اسأل دليلك" الأساسي أصبح
#     بعرض كامل بمفرده.
#   - app/services/page.tsx: إزالة زر نصي "إغلاق" مكرر من أسفل الشيت،
#     كان يكرر زر X في الرأس (المعروض دائماً) + النقر خارج الشيت + Esc.
#   - components/MobileMenu.tsx: إزالة بند "المساعدة" المكرر (كان يؤدي
#     لنفس وجهة /faq الموجودة فعلاً كبند "أسئلة شائعة" في القائمة نفسها).
#   - app/professional/page.tsx: حذف تبويبَي "الملفات" و"المسودات" من
#     SECTIONS (6→4 تبويبات) + حذف الكتلتين البرمجيتين الميتتين
#     المرتبطتين بهما — كل ما فيهما زر واحد يؤدي إلى /my-files أو
#     /drafting-studio، وكلا الوجهتين متوفرة فعلاً بضغطة واحدة من قائمة
#     "الإجراءات السريعة" في تبويب "نظرة عامة" لنفس الصفحة.
#   لا حذف وظائف — كل وجهة كانت يمكن الوصول إليها تبقى متاحة بضغطة واحدة
#   من مكان آخر. تحقّق tsc --noEmit: بلا أخطاء.
git add app/page.tsx "app/procedures/[slug]/ProcedureDetailClient.tsx" app/services/page.tsx components/MobileMenu.tsx app/professional/page.tsx
git diff --cached --quiet || git commit -m "refactor: batch #498 — تقليل العجقة والأزرار المكررة في 5 صفحات (بلا حذف وظائف)"

# ================================================================
# Batch #499-501 — تدقيق وظيفي + ملخص خدمة + تنظيم شكل الردود
#   طلب المستخدم: "تأكد من عمل كل الأزرار والميزات (الإشعارات مثلاً)،
#   واجعل لكل سؤال عن معاملة أو مستند ملخص AI يشرح ما هي هذه الخدمة
#   ولماذا تُستخدم، واجعل شكل الجواب أكثر ترتيباً وعملية".
#
#   #499 — تدقيق وظيفي (Explore agent + تحقق يدوي من كل نتيجة):
#   - NotificationBell: فُحص بالكامل وتأكّد أنه حقيقي فعلاً (يقرأ مواعيد/
#     تذكيرات/تواريخ انتهاء وثائق حقيقية من localStorage) — لا تغيير.
#   - components/FeedbackWidget.tsx: كان تقييم 1-5 نجوم + تعليق يُخزَّن في
#     localStorage المحلي فقط ويعرض "شكراً على تقييمك" رغم أن الفريق لا
#     يرى شيئاً أبداً — لا يصل لأي واجهة إدارة. أصبح يُرسَل فعلياً لنقطة
#     /feedback الحقيقية نفسها المستخدمة في تقييم 👍/👎 على الردود (بلا أي
#     تعديل على شكل الـ Backend API، فقط إعادة استخدام حقولها الموجودة).
#   - app/professional/page.tsx: بطاقات إحصائية 4 كانت قيمتها "0" ثابتة
#     دائماً بلا أي مصدر بيانات — تبدو كلوحة تحكم حيّة رغم أنها أرقام
#     مكتوبة يدوياً. "ملفات مفتوحة" أصبحت تُحسَب من /transactions الحقيقية
#     (نفس ما تعرضه صفحة "ملفاتي")؛ الثلاث الأخرى (موكّلون/مسودات/طلبات
#     مراجعة) لا يوجد لها أي تخزين حقيقي في المشروع بعد، فأصبحت تعرض
#     "قريباً" بصراحة بدل رقم مضلِّل.
#
#   #500-501 — ملخص الخدمة + عناوين Markdown حقيقية (نفس الدفعة، backend
#   نصي بالكامل في system_prompt.txt — راجع push_backend_v8.sh):
#   - components/AgentResponseRenderer.tsx: SECTION_MAP (محرك تحويل عناوين
#     ## إلى بطاقات ملوّنة بأيقونات) كان موجوداً أصلاً منذ مراحل سابقة لكن
#     لم يكن يُستخدَم فعلياً لأن قالب الرد في الـ Backend كان يستخدم نص
#     عريض **كذا** لا عناوين ## — أُضيف مفتاحان جديدان فقط ('ما هي هذه
#     الخدمة' و'الخدمات المرتبطة') لتغطية القسمين الجديدين في القالب.
#   - لا تغيير في منطق الاسترجاع RAG ولا الاستيثاق ولا أي endpoint.
git add components/FeedbackWidget.tsx app/professional/page.tsx components/AgentResponseRenderer.tsx
git diff --cached --quiet || git commit -m "fix+feat: batch #499-501 — تدقيق وظيفي (تقييم الموقع + إحصائيات المحترفين) + دعم عناوين ## الملوّنة في الردود"

git diff --cached --quiet || git commit -m "feat: batch #284-364 — 31 new components + full mobile/desktop polish pass + settings page + PWA/SEO + reliability fixes + h1 + aria-label + focus-ring fixes + mobile floating-widget overlap fix + forms/[slug] bottom-padding fix + complete safe-area-inset-bottom coverage + ProcedureMinistryMap touch-target fix + declutter pass on procedure/services/form detail pages via SectionCollapseToggle + expat-property h1 fix + main-content landmark on ~20 pages + real WhatsApp support number for ProcedureHelpRequest + SectionCollapseToggle 44px touch target fix + GlobalSearch ⌘K hint hidden on mobile (gs-search-kbd) + SavedItemsPanel touch-visible remove/ask affordances + ProcedureVersionTag tap-to-reveal tooltip + SavedItemsPanel remove button 44px touch hit-area expansion + sitewide tap-hit-N utility sweep across 8 more components + HomepageMinistrySpotlight carousel button spacing fix + fix AI replies ignoring the UI language toggle + mobile re-audit + admin/admin-content sticky header overflow fix + batch #337 cross-page mobile consistency pass + batch #338 design-token hardening + batch #339 maxWidth/header-padding token migration + batch #340 floating-button touch-target sweep + batch #341 auth-page visual consistency fix + batch #342 world-class additions: Breadcrumbs + BreadcrumbList JSON-LD, Organization + WebSite/SearchAction JSON-LD, Escape-to-close fix across 5 modal/sheet components + batch #343 metadataBase + canonical URLs on 7 public pages + batch #344 form-field labeling audit: 19 unlabeled inputs fixed across 13 files + attached-file preview alt-text fix + batch #345 UX_AUDIT.md Phase 1+2: removed GlobalLangSwitch/AccessibilityBar/FloatingHelpButton floating widgets + MinistryQuickDial and KeyboardShortcutsHelp FABs converted to menu-triggered (zero functionality lost), fixed duplicate Authorities entry in MobileMenu, BottomNav reduced 5->4 items + batch #346 removed ~110-line dead/unreachable homepage-widget block (~30 components, verified via bracket trace) and its ~50 orphaned imports from app/page.tsx, zero visible/functional change, 2770->2602 lines + batch #347 converted FeedbackWidget from floating FAB to inline chat card (last floating-button exception, now zero exceptions app-wide) + batch #348 WCAG AA contrast audit (computed via relative-luminance formula): fixed --text-3 token (3.18:1->4.55:1) and migrated 89 real var(--text-4) text usages across 32 files to the fixed --text-3, plus fixed a critical regression where removing AccessibilityBar's FAB in batch #345 had silently broken the actual high-contrast/large-text/reduce-motion visual effect (CSS rules moved to globals.css + new render-nothing AccessibilityEffects.tsx restores it without re-adding a floating button) + batch #349 WCAG heading-hierarchy audit across 19 pages + fixes in 6 files: sr-only h1 for active chat view (app/page.tsx had zero headings during chat), h1 for ProcedureDetailClient not-found state + h3->h2 promotion for its Section component, sr-only h2 section labels before card grids/lists in services/my-files/admin-content pages, h3->h2 promotion for admin create-user/reset-codes tab panels + batch #350 homepage density pass: popular-procedures grid 6->4 cards, category chip row 10->6 chips + new 'All categories' link to /services (verified functional), hero confirmed already brief-compliant (2 CTAs + search-first), zero functionality removed + batch #351 WCAG 1.4.1 use-of-color audit across ~15 status/badge components: fixed QuickContacts open/closed dot (shape difference + sr-only label, was color-only even for screen readers) and HomepageCalendarWidget deadline/reminder markers (diamond vs circle shape + descriptive aria-label, was color-only), verified 12 other badge components already compliant, verified auth-page error boxes already use role=alert + batch #352 fixed mislabeled 'Wizard' button on procedure detail page that actually navigated to homepage (no wizard deep-link exists) — relabeled to 'Home' to match real behavior, zero functional change + batch #353 chat-interface declutter: per-message action row reduced from 10 always-visible controls to 4 (kept copy/share/save, folded pin/voice-playback/4-emoji-reactions/save-to-notes behind a new per-message 'More' toggle), zero components or functionality removed + batch #354 removed ~1.7MB of dead data imports (TX_ALL/TX_WITH_FORMS/TX_MINISTRIES/ENRICHED_PROCEDURES/ALL_SERVICES) from app/page.tsx, verified unused via grep + tsc, zero functional change + batch #355 fixed mobile section-padding density: all 7 homepage sections used clamp() floors tuned for desktop that never actually shrank at real phone widths, so every section always rendered at full desktop padding on mobile (~536px of stacked whitespace) — lowered floors only (verified desktop max unaffected), mobile total now ~316px (~40% less) + batch #356 verified TopNav header height (fixed 64px) already matches the 56-64px spec, no change needed + batch #357 lazy-loaded GuidedFlow/TransactionStarter/ServiceGroupSheet via next/dynamic ssr:false (modals only mounted after user action, were bloating the eager homepage bundle) + batch #358 chat input-toolbar declutter: ChatResponseLength now collapses to icon-only under 640px (matching ModeSelector's own compact-mobile pattern), other toolbar controls already self-hid correctly + batch #359 WCAG landmark audit: fixed dead skip-link on /professional and /settings (missing id=main-content, now wrapped in <main>), added distinguishing aria-labels to the two simultaneous <footer> landmarks on the homepage + batch #360 built reusable lib/useFocusTrap.ts (Tab/Shift+Tab cycling for the 13 role=dialog components that had none) and wired it into GlobalSearch + MobileMenu, remaining 11 dialogs are a mechanical follow-up + batch #361 finished the focus-trap rollout: wired useFocusTrap into the remaining 11 dialog components (ServiceGroupSheet, MobileModeSheet, GuidedFlow, TransactionStarter, ProcedureSearchModal, ProcedureFilterDrawer, PrintProcedureModal, EscalationModal, DocumentIntelligenceView, AccessibilityBar, FloatingHelpButton) — all 13 role=dialog components in the app now trap Tab correctly, verified no change to existing auto-focus-on-open behavior in any of them + batch #362 ChatSessionTimer perf fix: 1s ticking HH:MM:SS -> 30s ticking minute-granularity display, 30x fewer re-renders, zero functionality removed, rest of top-of-chat widget row confirmed already self-gating + batch #363 lazy-loaded DocumentIntelligenceView (944 lines, largest component in the app, only renders for the minority of messages with attached document analysis) and UserOnboarding (433 lines, already self-gated to first-time visitors only) via next/dynamic ssr:false + batch #364 ChatLanguageToggleChip had no dismiss control at all (rendered from message #1 onward forever until actually used) — added a '✕' dismiss button matching ChatSessionSummaryChip's existing pattern, zero change to its click-to-use behavior + batch #366 'Calm Government Digital Service' v4.0 mobile-first rebuild: new flat design tokens (brand #9F1D2F, bg #F8F8F6, zero gradients/shadows), TopNav mobile header reduced to logo+hamburger only (search/notifications/language/accessibility/help/about/privacy relocated into MobileMenu drawer, nothing removed), new /privacy page, homepage rebuilt to the brief's literal 10-section order (new minimal hero+search+2-quick-actions, popular-procedures list rows instead of cards, 2-col category grid, Life-Journeys/How-it-works/Trust-grid sections replaced by one trust line — all removed sections' data/logic kept reachable via search/menu, footer simplified from 3-column dark to one compact light row), BottomNav flattened (removed raised gradient chat FAB, now a plain 4th tab tinted on active, chat tab relabeled 'اسأل دليلك'). No backend/API/auth/route/env changes. tsc --noEmit clean. + batch #367 continued v4.0 rebuild onto /procedures: flat header (dropped gradient banner + language toggle, matches homepage header pattern), flat stats strip, flat ministry filter chips, flat search bar, flat collapsed-row styling for both guided and enriched procedure cards (borders/icon badges/status pills migrated to brand-soft/bg/border tokens). Expanded-card internals and the enriched row's still-crowded badge stack deliberately left untouched and flagged in UX_AUDIT.md as follow-up scope, not silently skipped. tsc --noEmit clean. + batch #368 v4.0 rebuild of the procedure detail page (ProcedureDetailClient.tsx): flat header showing the procedure's own title, flattened hero card/CTAs/playbook button, flattened Required-Documents and Steps section frames, flat step-number circles (no gradient/shadow), flattened 'More details' accordion (authority/fees/closing ask-AI banner). Completes the flat-token pass on the home -> procedures -> procedure-detail primary path. tsc --noEmit clean. + batch #369 v4.0 pass on the chat interface: fixed a real bug where the chat screen's local --red/--red-dark/--red-light aliases were still pinned to the pre-v4.0 maroon instead of the real brand tokens (send button, active mic/recording state, and focused-input border were silently rendering the old color) + flattened input-toolbar fade color, recording/enhance/voice-hint chip backgrounds, input-box border+shadow, typing-indicator shadow, active mic/send button gradient+shadow, per-message More-toggle colors. tsc --noEmit clean. + batch #370 CRITICAL fix: BottomNav's 4 tab buttons were unresponsive on real phones because tap-hit-8 requires position:relative on the host element (documented in globals.css) which was missing from their inline style, causing their invisible touch-hit-expansion overlay to anchor to the fixed-position <nav> ancestor instead of each button, breaking tap zones on touch devices. Found + fixed 2 more identical instances in app/procedures/page.tsx (ministry chips, search-clear button). tsc --noEmit clean. + batch #371 v4.0 flat-design pass on /faq, /authorities, /forms: flat headers (language toggle dropped, same convention as /procedures), uniform flat stat cards, search bars without double box-shadow glow, chips moved to 1px border + 999px radius + brand-soft active fill, card borders/shadows flattened (removed colored drop-shadows and hover lift on /authorities cards), CTA buttons flattened from gradient to solid brand fill, /authorities TYPE_COLORS 'council' entry repointed from pre-v4.0 maroon hex to real brand tokens. /services (909 lines) deliberately deferred to its own batch. tsc --noEmit clean on all three files. + batch #372 v4.0 flat-design pass on /services (909 lines): flat header, flat search bar, uniform flat stat cards, flattened category chips, flattened service-card grid (no hover lift/colored shadow), ServiceSheet modal icon tile + CTA flattened from gradient to solid brand. Completes the v4.0 flat-token pass across every primary page in the app. tsc --noEmit clean. + batch #373 fixed language-toggle reachability regression: /procedures, /faq, /authorities, /forms, /services had their header language toggle removed in earlier flat-design batches on the false assumption it was reachable via MobileMenu — verified none of these 5 pages render TopNav or MobileMenu at all, so there was no way to switch language on them. Added a compact EN/AR toggle button to each page's header matching the existing back-button style. tsc --noEmit clean on all 5 files. + batch #374 reduced /procedures enriched-card badge clutter: merged doc/step count chips into one, removed duplicate fee badge (kept ProcedureEstimatedFeeChip) and duplicate ministry name shown 3x (kept the top chip, dropped the plain-text line and hashtag chip), removed now-unused ProcedureHashtagChips import. No interactive/unique badges touched. tsc --noEmit clean. + batch #375 WCAG AA contrast audit (numeric, relative-luminance) of v4.0 tokens: all text-color pairings pass 4.5:1+; found --border on --surface is only 1.29:1 (below the 3:1 WCAG 1.4.11 minimum for UI-component boundaries), affecting 6 search bars + ~52 inputs across 32 files — documented as an open finding requiring a user-approved design-token change with live visual verification, not auto-fixed. No code changes this batch, audit + documentation only. + batch #376 motion audit: swapped 3 spring/overshoot cubic-bezier(0.34,1.56,0.64,1) transitions (ReadinessChecker, ProcedureTimeline, homepage hero carousel dots) for the standard calm ease-out token, and removed TopNav's purely decorative infinite 'online dot' pulse animation. Left all functional continuous animations (spinners, urgent-notification pulse, reminder-bell wobble, flowchart step glow) untouched as they convey real state, not decoration. No scroll-linked/parallax effects found. tsc --noEmit clean. + batch #377 normalized /services' last 4 border:1.5px spots to 1px (overview card, ServiceSheet close button, show-all-services button, service grid card) and replaced remaining literal #fff backgrounds with var(--surface), matching every other v4.0-rebuilt page. Left the header back/lang-toggle buttons' 1.5px borders untouched (deliberate site-wide convention). tsc --noEmit clean. + batch #378 extracted components/MobileHeader.tsx from the identical header markup duplicated across /procedures, /faq, /authorities, /forms, /services (per the design brief's request for named reusable components), preserving /services' distinct 1024px maxWidth and 'Go back' aria-label exactly via explicit props rather than silently unifying them. tsc --noEmit clean. + batch #379 extracted components/SearchInput.tsx from /faq, /authorities, /forms, /services' duplicated search-bar markup (component owns its own focus state internally, removing per-page searchFocused boilerplate); /procedures deliberately excluded due to its structurally different flex-row layout with embedded advanced-search/filter buttons. Normalized minor pre-existing drift as a documented side effect: icon size/color, clear-button background, a stray padding anomaly in /forms, and gave /services its first focus-glow ring (it lacked the search-wrap class before). tsc --noEmit clean. + batch #380 extracted components/StatsRow.tsx from the duplicated stat-card-grid strip in /procedures, /faq, /authorities, /services (accepts a columns prop, used by /authorities for its 4-card 2x2 layout). Normalized minor pre-existing drift as a documented side effect: border-radius, entrance animation presence, and label size/color, all aligned to the majority pattern; removed /services' now-unused svcStatsIn keyframe post-migration. tsc --noEmit clean. + batch #381 extracted components/AppLogo.tsx from 6 duplicated 'دليلك' brand-mark occurrences (TopNav desktop+mobile, MobileMenu drawer, all 4 auth pages, homepage splash, homepage footer); props cover every real size/layout/tagline/title-tag difference. Fixed a real bug found in the process: auth pages' logo title had no language condition, always showing Arabic even in English mode. Normalized decorative-icon alt text to alt=\"\" aria-hidden (was inconsistently redundant alt text in some spots) and migrated MobileMenu's hardcoded pre-v4.0 hex colors to design tokens. tsc --noEmit clean on all 8 files. + batch #382 extracted components/SectionHeader.tsx from 4 duplicated title+trailing-action rows (homepage category header, 3 admin tab headers); skipped a QuickAction extraction after finding only 1 live occurrence (no real duplication to justify it); preserved admin's pre-v4.0 hardcoded hex colors via explicit props rather than migrating to tokens since the rest of that page hasn't had a v4.0 pass yet; removed components/HomepageQuickActionsBar.tsx, confirmed orphaned dead code via repo-wide grep. tsc --noEmit clean. + batch #383 investigated PopularTransactionRow/ServiceCategoryCard from the design brief's component list, found each is written once via .map() with no real cross-file duplication, skipped both consistent with the #382 QuickAction decision; instead extracted components/AskDalilakButton.tsx from the 'Ask Dalilak' CTA duplicated with a byte-identical SVG and near-identical styling across 4 empty-state blocks (/services, /authorities, /procedures, /faq); normalized minor padding/size drift and unified /services onto the shared btn-primary tap-feedback class. tsc --noEmit clean. + batch #384 extracted components/LoadingSpinner.tsx from the near-identical ring-spinner pattern duplicated in procedures/[slug]/loading.tsx and forms/[slug]/loading.tsx (exact value match, only keyframe name differed) plus an exact-match inline spinner in my-files/page.tsx and a close variant in procedures/[slug]/playbook/page.tsx (via size/borderWidth/label props); uses useId() for collision-free per-instance keyframes; deliberately left FormDetailClient.tsx's structurally different inline-in-button spinner untouched; kept literal hex color defaults (no token migration) to avoid visual change this batch. tsc --noEmit clean. + batch #385 extracted components/ModalCloseButton.tsx from 3 near-identical round X close buttons in admin/page.tsx and admin/content/page.tsx (size/iconSize props preserve existing variance), and components/PageBackHeader.tsx from the identical back+title(+subtitle) header row in /settings and /privacy (variant:'legacy'|'tokens' prop preserves /settings' un-migrated hex colors rather than forcing normalization); rejected 3 more candidates (error blocks, retry buttons, chip filters) as not real duplication. tsc --noEmit clean. + batch #386 deleted 49 dead component files (~8,700 lines) confirmed unreferenced via grep + dynamic-import check + manual spot-checks; corrected a stale doc-comment in lib/useFocusTrap.ts that wrongly listed one of them (EscalationModal) as a live dialog. tsc --noEmit clean. + batch #387 deleted ~65 dead CSS classes (~430 lines) from globals.css's never-adopted design-system scaffold (typography scale, button/badge/alert/card variants, old homepage-v3 grids, welcome-screen leftovers) after grep-confirming zero className usage app-wide and no dynamic class construction anywhere in the repo; kept every class confirmed live. tsc --noEmit clean. + batch #388 added app/privacy/layout.tsx (title/description/OG/Twitter/canonical) — /privacy was the only public route with no route-specific metadata, silently falling back to the homepage's title/description, matching the existing layout.tsx pattern used by every other client-component page. tsc --noEmit clean. + batch #389 fixed app/professional/page.tsx's API_URL fallback host (was 'dalilak-backend.onrender.com', every other of 7 files in the repo agrees on 'dalilak-backend-bvb9.onrender.com') — copy-paste typo, currently unused in that file but a live trap for the first fetch() wired there. tsc --noEmit clean. + batch #390 audit only (no code change): found MobileMenu.tsx's Contact-Us phone number differs from the WhatsApp support number wired in batch #327, but it's paired with the site owner's real email and likely a legitimate separate contact — flagged in UX_AUDIT.md for user confirmation rather than guessed at; verified localStorage JSON.parse/href=#/img-alt/target=_blank+noopener are all already correct app-wide. + batch #391 fixed a real stale-closure bug: app/page.tsx's mount-only onboarding-question listener called sendMessage(q) directly, permanently using the first render's lang/isAr — reachable when a first-time user switches language then taps a suggested onboarding question, silently reintroducing the wrong-language-reply bug batch #334 fixed elsewhere. Fixed via an always-fresh sendMessageRef synced every render. tsc --noEmit clean. + batch #392 found and fixed the same stale-closure class in app/admin/page.tsx: loadStats/loadUsers, called from a mount-only effect, read isAr for their fallback error-toast text — fixed with an isArRef synced every render. tsc --noEmit clean. + batch #393 fixed app/procedures/page.tsx's 'Authorities' stat showing the raw (undeduplicated) TX_MINISTRIES.length ('52+') instead of the real distinct-authority count (~24, since many rows share the same slug); added a Set-based UNIQUE_AUTHORITY_COUNT constant, mirroring the dedup app/forms/page.tsx already does on the same array. tsc --noEmit clean. + batch #394 fixed a real Arabic grammar bug in NotificationBell.tsx (live, globally-mounted via TopNav/MobileMenu): day-count strings hardcoded singular 'يوم' regardless of the actual number in 3 places (two AI-prompt strings + the on-screen countdown label), e.g. '5 يوم' instead of the grammatically correct '5 أيام', while the parallel English string already pluralized correctly. Added an arDays(n) helper implementing standard Arabic numeral agreement and used it at all 3 call sites. tsc --noEmit clean. + batch #395 found the same Arabic-agreement bug class in ChatSessionSummaryChip.tsx (live, rendered in the main chat view once a session passes 10 messages): hardcoded singular 'رسالة' meant the chip's most common real-world render read '10 رسالة' instead of the correct '10 رسائل'. Added an arMessages(n) helper mirroring batch #394's arDays(n) pattern. tsc --noEmit clean. + batch #396 found a third instance of the same bug class in ProcedureCountdownTimer.tsx (live, per-card on /procedures, updates every minute for user-set 1-365 day deadlines): hardcoded singular يوم/ساعة/دقيقة regardless of count, e.g. '3 يوم و 5 ساعة' instead of '3 أيام و 5 ساعات'. Added a general arUnit() helper (also covers the dual form, e.g. 'يومين') and used it at all 3 call sites. tsc --noEmit clean. + batch #397 fixed ProcedureEstimatedFeeChip.tsx using toLocaleString('ar-EG') in Arabic mode, which renders Eastern Arabic-Indic digits (١٥٠٬٠٠٠) unlike every other fee/number display in the app (all use Western digits even in Arabic mode) — the fee chip's numerals visually clashed with neighboring chips on the same procedure card. Now always formats with 'en-US', only the unit label (ل.ل./LBP) still switches by language. tsc --noEmit clean. + batch #398 fixed lib/auth.ts's setToken/setUser calling localStorage.setItem with no try/catch (every other setItem call in the codebase already has one) — a throwing setItem (e.g. Safari private-browsing's 0-byte quota) in the login/register flow would surface a successful backend login as a false 'login failed' toast and leave the user un-navigated despite valid credentials, since setToken throws before setUser/router.push run. Wrapped setToken/setUser/clearToken in try/catch matching the codebase's existing pattern. tsc --noEmit clean. + batch #399 found one more unguarded localStorage call the #398 sweep missed, in ProcedureHistoryLog.tsx's mount effect (live, per-card on /procedures) — its 'viewed once per day' getItem/setItem pair had no try/catch unlike every sibling call in the same file. Wrapped it to match. tsc --noEmit clean. + batch #400 found AppointmentTracker.tsx is orphaned dead code (a real off-by-one bug was proposed inside it, but grep confirmed zero live imports/JSX usage anywhere in the app — it lost its only render call during the v4.0 redesign without the file being deleted, and its sole localStorage-key consumer HomepageTodayTasks.tsx is itself already queued for deletion). Queued the 502-line file for deletion instead of fixing a bug no user can reach. tsc --noEmit clean. + batch #401 fixed CostEstimator.tsx's LBP fee regex only matching comma-grouped digits while the real fee data (lib/enrichedProcedures.ts) uses period-grouped thousands too (e.g. '1.500.000 ل.ل.') — the regex captured only the trailing '000', parsing to $0 instead of the correct ~$17, silently misinforming users about real government fees for most LBP-denominated procedures. Widened the capture class to include periods and strip both separators before parseFloat; verified with a standalone Node repro. tsc --noEmit clean. + batch #402 fixed ProcedureEstimatedCompletion.tsx checking the named phrase 'يوم واحد' before any numeric regex, so tiered/range processingTime strings in lib/enrichedProcedures.ts (e.g. 'فوراً | فوراً | يوم واحد | 3 – 4 أيام') returned 1 day instead of the correct larger tier (4), causing an expected-completion date 2-3 workdays too early and false 'overdue' flags. Reordered to check numeric matches first; verified with a Node repro on 2 real dataset strings plus 2 unaffected digit-free strings. tsc --noEmit clean. + batch #403 fixed ProcedureEstimatedFeeChip.tsx's 'stamp only' guard never firing on period-grouped LBP amounts (same root cause as #401, different failure mode) — a fee string containing '1.800.000 ل.ل.' was misclassified as stamp-only (~1,000 LBP) instead of high-fee (up to 1,800,000 LBP), verified with a Node repro. Widened the guard and number-extraction regex to accept periods; verified genuinely stamp-only strings still classify correctly. tsc --noEmit clean. + batch #404 fixed ProcedureCostBreakdown.tsx's line-splitting regex missing plain-hyphen inline bullets (only \n/|/em-dash were split points) — a real 4-tier fee string (400K-1.5M LBP) stayed as one unsplit segment and got misclassified entirely as stamp-only because its trailing clause mentioned a revenue stamp, hiding the real substantial fee from users. Added a hyphen split point mirroring the existing em-dash rule; verified with a Node repro plus a full sweep of all 60 real fee strings in the dataset (zero bad splits introduced). tsc --noEmit clean. + batch #405 fixed the whereToApply field's '|'-delimited multi-value convention (same pattern already handled for fees) never being split by any of its 3 live consumers (app/procedures/page.tsx meta chip, PrintProcedureModal, ProcedureComparator) — real data lists genuinely distinct locations (e.g. 'أقرب مخفر درك أو شرطة | الشعبة القانونية العسكرية') rendered raw with the pipe character inside a singularly-labeled chip. Added the same split-and-join pattern at all 3 call sites; verified with a Node repro. tsc --noEmit clean. + batch #406 found the #405 fix was applied inconsistently within its own file: PrintProcedureModal.tsx split whereToApply but left the adjacent fees/processingTime fields (same '|' convention, already fixed in their OTHER consumers) unsplit — printing a procedure with a real tiered fee string showed literal pipe characters. Applied the same split/join to both fields for consistency. tsc --noEmit clean. + batch #407 fixed ProcedureSearchModal.tsx's fee badge (live search results) slicing the raw fees string at 18 chars with no awareness of the same '|'-delimited multi-value convention fixed in #401/#403-406 — real data (lib/enrichedProcedures.ts:277) sliced to 'طابع أميري بـ 1000', cutting the number off right before its own currency unit and silently dropping the second fee tier. Now truncates only the first pipe-segment with an ellipsis marker instead of the raw multi-value string; verified with a Node repro. tsc --noEmit clean. + batch #408 fixed a real data bug: 5 procedures in lib/enrichedProcedures.ts had hasForm:true with pdfUrls:[] empty, while all 57 other entries agree perfectly (0 exceptions) — confirmed data inconsistency via Node, not design. Users saw a 'Form available' badge on app/procedures/page.tsx that led nowhere on expand, and the advanced hasForm filter surfaced these 5 falsely too. Fixed at the data source (hasForm:false for the 5 affected procedures), fixing both the badge and the filter with one change; verified zero anomalies remain. tsc --noEmit clean. + batch #409 applied the same field-cross-check technique to ministrySlug vs the lookup tables in ProcedureRelatedMinistries.tsx and ProcedureExternalLinks.tsx (both live) — real data uses hyphenated slugs 'general-security'/'public-works' (same convention as page.tsx's own filter chips) but both lookup tables only had no-hyphen keys, so 6 real procedures silently lost their ministry contact card and curated gov-portal links. Added hyphenated aliases to the SAME already-curated data (no new/guessed info); fixed 5 of 6, left 'customs' unfixed since no verified contact info exists anywhere in the codebase for it. tsc --noEmit clean. + batch #410 found 6 real procedures whose actual ministry (Council of the South / South Irrigation Dept.) had ministrySlug wrongly set to real filter-chip slugs 'education'/'social'/'public-works', polluting those filters with unrelated results and mislabeling the ministry badge; also fixed cots1-07's ministry_en ('Ministry of Tourism') to match its 5 verified sibling entries ('Council of the South'). Reassigned to non-colliding slugs relying on existing safe fallback display logic; verified zero mismatches remain via Node. tsc --noEmit clean. + batch #411 audit only, no code changed (allTransactions.ts/serviceFAQ.ts consistency and a broad crash-risk sweep all came back clean; MobileMenu phone-number discrepancy re-confirmed as the same legitimate-uncertain case from batch #390, left untouched). + batch #412 fixed app/authorities/page.tsx's search filter only ever matching Arabic name/categories regardless of the current language, even though the page's own card display already switches to English fields in English mode — an English-language query matched nothing, making English-mode search on that page effectively non-functional. Fixed the filter to switch fields by isAr and added the missing isAr dependency to the memo. tsc --noEmit clean. + batch #413 found the same bug class in app/services/page.tsx's search filter (Arabic-only match regardless of isAr, while its own card/sheet display already switches to English fields) — an English query like 'Marriage' for a card showing 'Registration of Marriage Contract' matched nothing. Checked GlobalSearch.tsx and app/forms/page.tsx too — both already language-aware, no fix needed there. Fixed with the same isAr-aware pattern as #412. tsc --noEmit clean. + batch #414 fixed DraftingStudio.tsx's buildPrompt() — the only part of that component not branching on isAr — always generating the AI document-drafting prompt entirely in Arabic (Arabic field labels, explicit 'write in Arabic only' instruction) regardless of the user's selected language, silently overriding an English-mode user's language choice on every drafting request. Branched every line on isAr matching the rest of the component. tsc --noEmit clean. + batch #415 found the same bug class in GovHolidayAlert.tsx: its office-closure date label was formatted with a hardcoded 'en-GB' locale computed before isAr was known, then interpolated straight into the Arabic alert sentence — an English weekday/month name embedded mid-sentence in otherwise-Arabic text. Now stores the raw Date and formats it at render time with the real isAr value. tsc --noEmit clean. + batch #416 found the same class in app/admin/page.tsx's fmtDate() (last_login column in the admin users table) hardcoded 'ar-LB' while its sibling fmtTs() already branches on isAr — fixed to match; also flagged (not fixed, deferred to a future batch) 4 more hardcoded-locale calls in app/admin/content/page.tsx and one in app/admin/page.tsx:483, all admin-only/lower-impact. tsc --noEmit clean. + batch #417 followed up on both #416 deferrals: fixed 5 hardcoded 'ar-LB' date/time calls in app/admin/content/page.tsx (list card, detail-panel Created/Last-modified/Published, audit-log timestamp — the last one found during the same read, not in #416's original list) after confirming the page is genuinely bilingual; and translated app/admin/page.tsx's entire reset-codes tab section (title/refresh label, instructional paragraph, empty state, expires label + toLocaleTimeString, copy button) rather than fixing only the originally-flagged date line, since the rest of that file already branches consistently on isAr and a partial fix would have left an inconsistent block. tsc --noEmit clean on both files. + batch #418 found components/ProcedureRequiredDocsCounter.tsx is dead code — zero imports/JSX usage anywhere (grep-confirmed), fully superseded by the live components/ProcedureDocReadinessBar.tsx which does the identical job and is actually wired into app/procedures/page.tsx; the dead file's own doc comment misattributed its localStorage keys to the wrong sibling component. Queued for deletion via rm -f (workspace files can't be deleted directly from the sandbox). tsc --noEmit clean. + batch #419 applied the same dead-code grep technique across the rest of components/, found a whole unreachable 'risk review' chain: TransactionFilePanel.tsx, DocumentAnalysisPanel.tsx, HumanReviewCTA.tsx have zero imports anywhere; RiskScoreCard.tsx and MissingDocumentsChecklist.tsx are imported only from inside those two dead panels, unreachable transitively. Confirmed app/my-files/page.tsx (the logical intended caller) imports none of them. Likely added in an early squashed batch and never wired up. Queued all 5 files for deletion via rm -f. tsc --noEmit clean. + batch #420 CRITICAL audit finding, no code changed: the entire 'My Files' tracked-procedures feature (lib/auth.ts:405, app/my-files/page.tsx:66/94/141, SaveToMyFilesButton — all confirmed live and reachable from BottomNav/MobileMenu/TopNav on every page) calls /my-procedures on the backend, which does not exist anywhere in backend/main.py (verified against all ~70 registered routes) even though /transactions exists with full CRUD as a plausible target. Every /my-files visit and every 'Save to My Files' tap fails end-to-end in production. Not fixed this batch: adding the backend route is out of bounds per the standing no-backend-API-changes constraint without explicit permission, and repointing to /transactions needs response-shape verification beyond this batch's scope. Documented in UX_AUDIT.md for a user decision. + batch #421 found a second backend-route mismatch via the same sweep: app/admin/content/page.tsx calls 4 /admin/content* and /admin/audit-log routes that don't exist in backend/main.py (content-gaps is a different feature). Fixed the frontend-side compounding bug: loadItems() skipped the res.ok check, so FastAPI's JSON 404 body was silently treated as success and admins saw an empty-looking list with zero error indication; added a res.ok check that routes into the existing loadError UI, making the failure visible. Adding the missing backend routes is out of scope, same constraint as #420. tsc --noEmit clean. + batch #422 fixed a real race condition in app/page.tsx: the un-awaited POST /suggest_followup fired after each chat answer wrote into shared session-wide state with no request ordering, so a slower response from an earlier question could arrive after a newer question's chips were already set, silently overwriting them with stale, wrong-topic follow-up suggestions still fully clickable by the user. Added a sendSeqRef sequence guard so late responses from superseded questions are ignored; two other lower-risk suggest_followup call sites (explicit one-off user clicks, different state) were left untouched. tsc --noEmit clean. + batch #423 found the same stale-response pattern in a second spot in the same sendMessage() function: the un-awaited document-analysis fetch (POST /documents/universal-analysis) inserts its result by findIndex-searching for the currently-streaming assistant message, with no check that its own send is still current — attach+send a file, send a second fileless message before the first file's analysis resolves, and the late analysis card gets spliced next to the wrong exchange (or appended at the very end). Applied the same sendSeqRef guard from #422 to this insertion too. tsc --noEmit clean. + batch #424 fixed app/page.tsx's retry-on-connection-error chip: hardcoded direction:'rtl' and Arabic-only 'إعادة المحاولة' label with no isAr branching, unlike neighboring page elements — English-mode users hitting a connection failure saw an Arabic-only button in an RTL-forced box on an otherwise-English page. Branched both on isAr. (Process note: a first attempt misidentified RiskScoreCard.tsx, part of #419's dead-code cluster, as live and edited it; caught via independent verification and reverted before tsc ran, no dead file touched in the final result.) tsc --noEmit clean. + batch #425 fixed components/ProcedureNotesPanel.tsx's 900ms debounced note-save (live, in app/procedures/page.tsx, unmounts for real on section collapse): the pending setTimeout was only cleared on next keystroke or blur, never on unmount, so collapsing the section before the debounce fires lets an orphaned save write to localStorage against a detached instance, potentially clobbering a fresher save made after re-expanding. Added a cleanup useEffect clearing the timeout on unmount/code-change. tsc --noEmit clean. + batch #426 found the same missing-cleanup class in components/ChatVoiceInputBtn.tsx (live, in app/page.tsx's hero search form which fully unmounts once a message is sent): showToast()'s 3s setTimeout had no ref/cleanup, so tapping the mic on a non-Chromium browser without SpeechRecognition support and sending a message within 3s leaves an orphaned timeout that fires setToast('') against a detached instance. Added a toastTimer ref cleared before each reschedule and on unmount. tsc --noEmit clean. + batch #427 audit only, no code changed: completed the setTimeout/setInterval cleanup sweep from #425-426 across the remaining ~70 call sites, vein exhausted; also checked non-null assertions, as-any casts, and remaining dir=\"rtl\" instances, all found to be safe/intentional. Honest negative result. + batch #428 fixed components/ProcedureReminderBell.tsx's refresh() (live, app/procedures/page.tsx), which matched saved reminders against the Arabic title only while the reminder-creation logic (same file + sibling ProcedureRemindMeLater.tsx) saves whichever language is currently active — adding a reminder in English mode left remCount stuck at 0 and the badge never activated despite a successful save, same failure on every later page load. Fixed to match either language variant. tsc --noEmit clean. + batch #429 found the same class in components/ProcedureTagSearch.tsx (live, app/procedures/page.tsx): ministry-chip selection was stored as the translated display label, and since the language toggle doesn't remount, switching languages after selecting a chip recomputes labels while the stored selection stays in the old language, so no chip (including 'All') shows as active even though the actual filtering stayed silently applied. Rewired selection to the existing stable ministrySlug field instead of the translated label. tsc --noEmit clean. + batch #430 found a related bug in app/forms/page.tsx's ministry-filter chips (live, /forms): filter state was already correct (compares stable m.slug) but the chip's rendered text hardcoded the Arabic name with zero isAr branching, unlike everything else on the page, so every ministry chip showed Arabic inside an otherwise fully English UI in English mode. Fixed to pick isAr ? m.ar : m.en (m.en already existed but was never read at this call site). tsc --noEmit clean. + batch #431 found a 4th isAr-branching-gap instance in app/authorities/page.tsx's 'Ask Dalilak' button: askAI() and the button's aria-label already picked the language-matched authority name, but onClick hardcoded askAI(auth.name_ar) regardless of language, so English-mode users got an English question template with the Arabic authority name embedded inside it. Fixed onClick to use the same language-matched name as the aria-label. tsc --noEmit clean. + batch #432 found a 5th instance in components/GlobalSearch.tsx (live, via TopNav on the homepage): search results built a single hardcoded-Arabic AI prompt despite displaying correctly bilingual titles, so clicking a correctly-English result in English mode injected a full Arabic sentence as the chat message. Split into aiPromptAr/aiPromptEn selected by isAr; FAQ results have no English prompt field in the source data at all, documented as a data-file limitation. tsc --noEmit clean. + batch #433 found ProcedureCompletionBadge.tsx silently ignoring its own documented contract: it declared but never read a dalilak_started_{code} check, so the 'Mark as completed' button rendered unconditionally even when a procedure was never started, producing orphaned completions inconsistent with started===completed logic elsewhere. Added a hasStarted check via getStartDate() from ProcedureStartButton.tsx, synced live via dalilak_saved_change/storage listeners. tsc --noEmit clean. + batch #434 found useResponseLength() in ChatResponseLength.tsx called independently in 3 places (the toggle chip, app/page.tsx's sendMessage, app/settings/page.tsx) with no cross-instance sync despite already dispatching an unused dalilak_response_length_change event, so toggling Brief/Detailed updated the chip's own visuals but silently never affected the actual outgoing message prefix until a full page reload. Fixed by listening for that event + storage inside the hook. tsc --noEmit clean. + batch #435 documented (no code change) that ChatContextBar.tsx's 3 producer helpers (setActiveProcedureContext/Ministry/Journey) and their sessionStorage keys are never called/written anywhere else in the project, so 3 of its 4 documented context-chip types can never appear for any real user; wiring them requires design decisions across 3 unrelated integration points so it's flagged for a dedicated future batch instead of a guessed fix. tsc --noEmit clean. + batch #436 fixed ProcedureRelatedSuggestions.tsx violating its own documented algorithm: accepted a single shared title word (contradicting an adjacent '2+ word overlap' comment) and always merged keyword-matches instead of only supplementing when same-ministry matches were fewer than 2, causing unrelated cross-ministry suggestions triggered by generic shared words. Raised threshold to 2+ and gated the fallback. Single-file fix. tsc --noEmit clean. + batch #437 fixed a real functional bug in the hand-rolled QR generator ProcedureQRShare.tsx: format-info bits were XORed against an identical copy of themselves (b^b=0), silently corrupting the format info of every generated QR code so it was unscannable by real phone cameras 100% of the time, despite looking visually correct. Removed the redundant self-XOR. Single-file fix. tsc --noEmit clean. + batch #438 found and fixed a second independent bug in the same file: placeFinderPattern()'s inBorder check used the separator ring's coordinates (-1/7) instead of the finder square's own outer border (0/6), rendering every finder pattern inverted and undetectable by any real scanner. Fixed by scoping inBorder to the actual 0-6 range, verified by hand-tracing all cell categories against the standard finder shape. tsc --noEmit clean. + batch #439 found and fixed a third independent bug in the same file: encodeBytes() wrote the untruncated byte-length into the 8-bit count header before truncating the codeword array to the 44-codeword cap, so the declared length never matched the truncated payload for any overflowing text (virtually every real Arabic title once URL-encoded, traced with a real 233-byte example against ~42 bytes actual capacity). Fixed by truncating bytes to V3_DATA_CW-2 before building the bitstream. tsc --noEmit clean. + batch #440 rejected a candidate fix to ProcedureEstimatedCompletion.tsx's weekend assumption (Fri+Sat closed) after finding it's internally consistent with 2 other live files and changing it would reduce codebase consistency, not improve it - documented as a methodology note, no weekend logic changed. Instead fixed a real bug in the same file's parseProcessingDays(): Arabic dual 'two months' (شهرين/شهران) fell through to the generic شهر->30 fallback and was silently halved instead of returning 60, confirmed against real shipped data using processingTime:'شهران'. Added an explicit check mirroring the existing أسبوعين pattern. tsc --noEmit clean. + batch #441 fixed ProcedureCostBreakdown.tsx's parseLines() missing a split rule for the space-padded hyphen separator (' - '), the dominant multi-item separator in real fees_en data, causing multi-tier fee strings to merge into one segment and get mislabeled stamp-only (hiding larger variable/tiered fees) since classify() checks stamp before fee/variable; also fixed the Arabic em-dash split being ASCII-only and a pre-existing bug where the tight-hyphen rule's bare-digit lookbehind incorrectly split compound words like real data '24-hour'. Verified against all 142 real fee strings in lib/enrichedProcedures.ts: 27 changed (7 previously mislabeled now correct), zero regressions. tsc --noEmit clean. + batch #442 fixed lib/arabicNormalize.ts's removeTashkeel() regex, which had a one-character typo widening its range to also strip Arabic-Indic digits (٠-٩), so any numeric Arabic search query got normalized to an empty string and matched everything via includes(''); confirmed real data in lib/lifeJourneys.ts uses these digits, verified fix preserves digits while still stripping genuine diacritics. Single-file fix benefiting every consumer of this shared search module. tsc --noEmit clean. + batch #443 fixed app/procedures/page.tsx: the raw ' | ' separator fix already applied to displayWhereToApply was never applied to displayFees/displayProcessingTime despite an adjacent comment stating fees uses the same convention, so real pipe-delimited fee/processingTime records rendered the raw '|' character in the Processing time chip, ProcedureFeeHistory, and ProcedureCopySummaryLine. Applied the same split/join treatment to both and switched ProcedureFeeHistory to use the formatted value. tsc --noEmit clean. + batch #444 found the same raw ' | ' separator bug from #443 independently in app/services/page.tsx, on the lib/allServices.ts dataset (367 services): displayFees/displayProcessingTime (also feeding the AI flowchartSource) and cardFees/cardProcessingTime (service grid card badges) all rendered the raw pipe with zero treatment. Verified 29 fees + 14 processing_time real records contain ' | ' via grep, e.g. passport_001's fees_en listing regular vs express fee tiers. Applied the same split/join treatment at all 4 call sites. tsc --noEmit clean. + batch #445 fixed ServiceSheet's WhatsApp-share button in app/services/page.tsx reading required_documents unconditionally (Arabic-only) despite the same component already having the correct isAr-aware fallback for the identical field elsewhere (displayRequiredDocuments, cardDocs). Verified 351/368 required_documents_en records are non-empty in lib/allServices.ts. Fixed to match the existing fallback pattern. tsc --noEmit clean. + batch #446 found TxItem's fee/duration fields (lib/allTransactions.ts) were hardcoded '' for all 2,484 records, making two conditional badges on the live /forms page permanently dead code. Verified no fee/duration data exists in any generator input; removed the dead badges and unused fields rather than fabricating data. tsc --noEmit clean. + batch #447 found 8 of 60 records in lib/serviceFAQ.ts's SERVICE_FAQ (faq_001-faq_008) have title/summary/type hardcoded empty, rendering as blank clickable cards in the default unfiltered /faq view and firing a malformed AI prompt if tapped; same records also flow into ProcedureFAQChips/GlobalSearch/HomepageFeaturedFAQ. Fixed at the shared source by exporting a title-filtered view instead of the raw array. tsc --noEmit clean. + batch #448 flagged (pre-existing, not introduced this batch) that ProcedureLastUpdatedBadge.tsx's 'last reviewed' date is entirely fabricated with no real backing field anywhere in enrichedProcedures.ts, conflicting with the project's no-mock-data rule - documented for user decision, not resolved. Also fixed a math bug in the same fake-date logic: its hardcoded 2025-01-01 base meant every procedure has shown a permanently-red 'stale' badge for ~10 months (71/71 real codes verified red at today's date) since the green/amber tiers became unreachable; anchored the base to a rolling window off the real current date instead. tsc --noEmit clean. + batch #449 fixed GovHolidayAlert.tsx: 4 lunar Hijri holidays were stored as fixed month/day pairs matching only real 2025 dates, with no year check, so the office-closed alert drifts ~10-11 days off the real date every year going forward (already drifted this year, next hardcoded entry would fire on the wrong day for 2026). Added a year field pinned to 2025 on the 4 lunar entries and made checkAlert() skip them outside their verified year, failing toward no alert rather than a wrong-day alert. tsc --noEmit clean. + batch #450 fixed ProcedureDeadlineAlert.tsx's 'Snooze 1 day' button: its read-path and write-path localStorage keys used different UTC-conversion techniques that disagree by one day for essentially the entire day in Lebanon's timezone (verified live), so the alert reappeared immediately after every snooze tap. Aligned both to the same date-key technique. tsc --noEmit clean. + batch #451 resolved the #448 policy flag per explicit user delegation: removed ProcedureLastUpdatedBadge (fabricated 'last reviewed' date, no real backing data, conflicted with the project's no-mock-data rule) from app/procedures/page.tsx and queued the file for deletion, rather than keep displaying invented information as fact. tsc --noEmit clean. + batch #452 fixed NotificationBell.tsx's document-expiry alerts, which could never fire for any real user because it read a flat localStorage key that its only writer (DocExpiryBanner.tsx) is dead code, while the actual live writer (ProcedureDocumentStatus.tsx) uses a per-document key schema entirely. Rewrote the scan to read the real schema and resolve doc names from ENRICHED_PROCEDURES; queued DocExpiryBanner.tsx for deletion. tsc --noEmit clean. + batch #453 fixed the same bug class in ProcedureProgressBadge.tsx and the 'Started preparing' advanced filter, both reading a dead-code-only-written key while the real live doc-checklist writer uses a different per-document schema already correctly read by 2 other live components; rewired both to the real schema and queued DocChecklistBuilder.tsx + ProcedureProgressTracker.tsx (dead, same root cause) for deletion. tsc --noEmit clean. + batch #454 ProcedureDocReadinessBar.tsx used an isolated key prefix (dalilak_doc_ready_) unread/unwritten anywhere else, disconnecting it from ProcedureDocumentChecklist.tsx and 4 other live components stacked in the same section; realigned to the shared dalilak_doc_{code}_{idx} schema and fixed a self-caught truthy-vs-strict-equality bug in the same read path (=== '1' vs !!). tsc --noEmit clean. + batch #455 same disconnected-checklist bug class for procedure steps: ProcedureStepHighlight.tsx (dalilak_step_done_) and ProcedureStepProgress.tsx (dalilak_step_check_) tracked identical step-done state under two never-overlapping key prefixes despite rendering side by side for the same procedure; realigned to the shared dalilak_step_check_ schema. tsc --noEmit clean. + batch #456 found a third disconnected checklist in the same required-documents section: ReadinessChecker.tsx used its own dalilak_ready_enr-{code} JSON-array key, isolated from the dalilak_doc_{code}_{index} schema its 5 sibling components already share; added an opt-in docKeyPrefix prop (per-document keys instead of a single JSON key) and wired it only at the enriched-procedures call site, leaving ReadinessChecker's other two call sites (services page, guided-procedures view) untouched. tsc --noEmit clean. + batch #457 reminders written by ProcedureRemindMeLater.tsx/ProcedureReminderBell.tsx into dalilak_reminders were never surfaced anywhere: SmartReminder.tsx's default component, the only code reading that key for due/overdue display, is not mounted anywhere live; added a third alert source (due/overdue reminders) to NotificationBell.tsx instead of reviving SmartReminder as its own widget. tsc --noEmit clean. + batch #458 the mirror case: lib/savedItems.ts's trackView()/loadRecentItems() Recently Viewed system was still called live from procedures/page.tsx and services/page.tsx, but its only display (RecentlyViewedPanel.tsx) was already intentionally deleted in the batch #386 declutter; rather than reviving that widget, removed the orphaned writer calls and the now-dead code in savedItems.ts. No visible feature change either way. tsc --noEmit clean. + batch #459 SaveButton.tsx (live on procedures/services pages, writing dalilak_saved_items correctly) had no live aggregate display — SavedItemsPanel.tsx was unmounted anywhere reachable, likely lost in the v4.0 homepage rebuild; mounted the existing self-guarding component as-is on app/my-files/page.tsx instead of the deliberately minimal v4.0 homepage. tsc --noEmit clean. + batch #460 ChatMessageActions.tsx's chat-reply bookmark button wrote to dalilak_bookmarks with zero readers anywhere and didn't even remember its own saved state on remount; added a Saved Replies section to app/my-files/page.tsx using its already-exported getBookmarks/removeBookmark, no changes to ChatMessageActions.tsx itself. tsc --noEmit clean. + batch #461 ChatHistoryPanel.tsx's saveChatSession() wrote up to 5 past chat sessions live from app/page.tsx but the component to browse/restore/delete them was never mounted, a pure one-way write of potentially sensitive chat content; mounted ChatHistoryPanel in the welcome screen below the quick-action buttons (self-guarding, no effect for users without saved sessions). tsc --noEmit clean. + batch #462 ChatDraftAutosave.tsx was only mounted on the in-conversation composer (input/setInput), but messages is never persisted so every refresh/tab-reopen lands on the welcome screen's separate heroInput/setHeroInput state, meaning the documented refresh-survival feature never actually worked; mounted a second unmodified instance bound to heroInput/setHeroInput (both screens share the same dalilak_chat_input_draft key, only one ever renders at a time). tsc --noEmit clean. + batch #463 audit only: ProcedureOfTheWeek.tsx and SmartSuggestions.tsx are fully-built, real-data-driven, orphaned components (no live import/JSX usage anywhere) most likely lost in the v4.0 homepage rebuild, but unlike prior orphaned-component fixes they always render substantial content to every visitor, conflicting with app/page.tsx's explicitly documented v4.0 homepage section-order contract; documented the conflict and 3 resolution options in UX_AUDIT.md rather than unilaterally deciding a genuine product/design tradeoff. + batch #464 app/admin/content/page.tsx (live, linked from admin dashboard, uses isAr 28+ times) had 10 UI-chrome strings hardcoded Arabic-only despite the page being genuinely bilingual: the Change-status section heading + note field aria-label/placeholder, and in the Create-new-content modal the Title/Type/Content labels, placeholders, select aria-label, and all 5 option labels. A prior batch (#417) verified this page as bilingual but missed these specific chrome strings. Branched all 10 on isAr matching the file's existing pattern. tsc --noEmit clean. + batch #465 JourneySheet (inline in app/page.tsx, live via TopNav/MobileMenu onJourneySelect) was missing from batch #360/#361's app-wide Tab-focus-trap sweep since it is not its own component file; added useRef + useFocusTrap(dialogRef, true), matching ServiceGroupSheet.tsx/MobileModeSheet.tsx. tsc --noEmit clean. + batch #466 app/admin/page.tsx's Edit-user modal and app/admin/content/page.tsx's Create-content modal are both live role=\"dialog\" components missed by the same inline-JSX root cause as JourneySheet (#465); added useRef + useFocusTrap to both, matching the app-wide pattern. tsc --noEmit clean. + batch #467 ServiceSheet in app/services/page.tsx had the same inline-JSX focus-trap gap as JourneySheet/#465 and the admin modals/#466; added useRef + useFocusTrap. A full-repo sweep afterward confirmed every role=\"dialog\" file now has a matching useFocusTrap call - this bug class is fully closed app-wide. tsc --noEmit clean. + batch #468 lib/lifeJourneys.ts: vehicle-registration journey's totalEstAr and residency-expat's ID-card-renewal step estAr both used a grammatically wrong dual form for a 1-2 week range, disagreeing with the sibling subtitleAr field describing the identical duration in the same object; fixed both to the plural form already used consistently elsewhere in the file. Also audited and skipped a stale-but-unused formsCount field in lib/allTransactions.ts (zero live consumers, no user-visible effect). tsc --noEmit clean. + batch #469 lib/lifeJourneys.ts: the newborn journey's subtitle said 30 days total while its own totalEstAr said 3-4 weeks (21-28 days) for the same journey, shown together in the same JourneySheet header; cross-checked all 7 sibling journeys (all already consistent) and normalized newborn's subtitle to match. tsc --noEmit clean. + batch #470 app/faq/page.tsx's corrupted-fees guard only checked for a leading '{', missing 4 list-shaped Fee Schedule records (fee_001-004) whose fees field is the ONLY content those cards show; widened the guard to catch both { and [ prefixes. tsc --noEmit clean. + batch #471 app/procedures/[slug]/playbook/page.tsx's ENRICHED_PROCEDURES lookup stripped hyphens only from route slug before .includes() against a still-hyphenated code, so multi-word slugs (birth-certificate, building-permit, vehicle-registration, criminal-record, tax-registration, etc.) never matched their ministry-prefixed code, silently dropping Required Documents and AI flowchartSource data; normalized hyphens from both sides. tsc --noEmit clean. + batch #472 components/ProcedureEstimatedFeeChip.tsx's fee parser grabbed every digit sequence in the raw fees text and took the max, misreading embedded legal-citation decree/law/circular numbers and dd/mm/yyyy dates as the fee amount (e.g. imu11-01 showed 'up to 7,847 LBP' from Decree No. 7847/1961 when no fee is stated; mnb10-01 showed 'up to 1,993 LBP' from citation date 18/6/1993 when the real fee is $400/year); added stripLegalCitations() to remove citations/dates before extracting fee candidates, verified against all 61 real fee strings with no new false positives. tsc --noEmit clean. + batch #473 components/ProcedureFAQChips.tsx's expanded chip body rendered only faq.summary, silently blank for 14 of 52 live serviceFAQ.ts records whose real content lives in steps/requiredDocuments/fees/authority instead (type:'procedure' records deliberately leave summary empty, same shape app/faq/page.tsx already falls back through); added previewFor() with the same fallback chain, verified the 4 corrupted-fees fee_table records stay blank by design and the 38 summary-populated records are unaffected. tsc --noEmit clean. + batch #474 components/ProcedureEstimatedCompletion.tsx was missing the nominative dual form أسبوعان ('two weeks') in its week-duration check, so it fell through to the plain week->7-days check (أسبوع is a substring of أسبوعان), halving the estimated completion date for 2 real procedures (mnl12-14 and the civil-status name-correction record, both confirmed 'Two weeks.' in English) shown on the live procedure tracker; added أسبوعان to the 14-day check, matching the existing شهرين/شهران dual-month fix. tsc --noEmit clean. + batch #475 lib/allServices.ts fin_gen_002 (submit complaint via electronic portal) and fin_gen_003 (pay judicial fees electronically) had online_available:false despite their own text describing them as fully electronic self-service actions; sibling records fin_gen_001/004 are correctly flagged true, confirming a data-entry inconsistency that hid the online badge and undercounted the online-services stat and the Ministry of Finance online tally on /authorities; checked all 368 services for the same contradiction, found no other false positives; flipped both to true. + batch #476 components/ProcedureFeeHistory.tsx used a bare menzu-N-yawm string with no Arabic number-noun agreement, showing menzu-2-yawm instead of menzu-yawmayn and menzu-5-yawm instead of menzu-5-ayyam for every fee-payment record 2-10 days old (a common window given the components own 30-day recent threshold); added arDaysAgo() with full singular/dual/plural/tamyiz agreement, matching the rule already used in ProcedureCountdownTimer.tsx; English branch untouched. + batch #477 components/ProcedureDocumentStatus.tsx had the same missing-Arabic-number-agreement bug (bare N-yawm string) for document-expiry countdowns, wrong for 28 of 31 possible day values in the 0-30 range; NotificationBell.tsx already had the correct rule for the same dalilak_doc_expiry_* data but this writer component never got it; added arDaysLeft() with full agreement, matching the #476 convention. Flagged ProcedureDeadlineAlert.tsx:148 as a similar unfixed lead for a future batch. + batch #478 fixed that same ProcedureDeadlineAlert.tsx:148 lead: since scanDeadlines() filters out daysLeft>7, only values 2-7 ever reach the plural-days branch, and only daysLeft===2 was actually wrong (needs dual يومان متبقيان, not plural 2 أيام); added the daysLeft===2 special case, leaving 3-7 and English untouched. + batch #479 components/TopNav.tsx had the same missing-agreement bug in the header trial-days badge (bare N-yawm string), but with no upper-bound filter here every trial user passes through the 2-10+ range at some point, exactly when the amber/red urgency styling is most visible; added arTrialDays() with full agreement matching #476-478. Flagged app/admin/page.tsx:386 (same pattern, admin-only) as a lower-priority lead, and confirmed AppointmentReminder.tsx:89s similar pattern is currently unreachable (dalilak_appointments has zero writers anywhere in the app). + batch #480 app/admin/page.tsx:386 had the identical unhandled days_left agreement bug (same field as #479) in the admin users table; added arDaysLeftAdmin() matching the TopNav.tsx fix. + batch #481 components/GovHolidayAlert.tsx computed offices-closed-tomorrow using Beirut wall-clock time but the dismiss-key used UTC toISOString(), creating a daily ~2-3h window right after Beirut midnight where a dismissal gets stored under the wrong UTC day and the alert silently reappears later that same Beirut day; added getBeyrouthTodayKey() (Beirut-based, mirroring the existing tomorrow helper) at both dismiss-key sites. + batch #482 components/ProcedureVersionTag.tsx computed its this-month/last-month update bucket using the viewer local device clock while the adjacent label formats the displayed month in Asia/Beirut, so around a month boundary or for a non-Beirut viewer the bucket (which also gates visibility and color) could disagree with the Beirut month the label claims, contradicting the files documented deterministic design; added getBeirutYearMonth() and used it for the bucket calculation instead of the local clock. + batch #483 components/CostEstimator.tsx had a bare N-wathiqa string for the Notary/Authentication cost line, a new Arabic number-noun agreement bug class (for wathiqa/document, distinct from the already-fixed yawm/day pattern); checked all 71 real requiredDocuments counts, 58 of 71 (82%) fall in the 2-10 range where the bare form was grammatically wrong; added arDocsLabel() with full singular/dual/plural/tamyiz agreement. + batch #484 components/ProcedureStepProgress.tsx had a third instance of this noun-agreement bug class (for khutwa/step) with a bare N-khutwa string; checked all 71 real steps-array lengths, 70 of 71 (99%) fall in the 3-10 plural range; added stepPhraseAr() with full agreement, using the genitive dual khutwatayn (not the nominative khutwatan) since the sentence is governed by the preposition min. Flagged ProcedureFlowchart.tsx:150 as a similar unverified lead. + batch #485 fixed that same ProcedureFlowchart.tsx:150 lead: identical bare N-khutwa string for dynamically-built flowchart nodes; checked all 6 static fallback flowcharts (6-8 nodes each) and confirmed AI-generated ones follow the same real-procedure step distribution from #484; added flowStepPhraseAr() matching the ProcedureStepProgress.tsx agreement rule, live across 3 pages (playbook, forms detail, services). + batch #486 fixed GuidedFlow.tsx procedure-search filter only matching Arabic fields (p.ar/p.authority), never p.en, despite real English search UI (dir='ltr', English placeholders) when isAr===false; verified 85% of catalog name_ar values are pure Arabic with zero Latin chars (55/368 have only a parenthetical acronym), so English queries almost never matched; added p.en.toLowerCase().includes(q) to the filter, additive only. + batch #487 fixed 2 of 367 lib/allServices.ts records (re_008, misc_006) using a truthy 'N/A' string for website instead of the empty-string no-website convention, which rendered a live dead-link \"Official Website\" button on /services and /authorities; changed both to '' to match the file's own convention. + batch #488 fixed authorities page tel: links built from unvalidated phone text (18 of 367 records are descriptive prose with no digits, e.g. 'يتفاوت بحسب البلدية'); added isDialablePhone() guard rendering plain text instead of a dead tel: link when not dialable. + batch #489 fixed CostEstimator.tsx fabricating a $20 default fee (or misreading an unrelated 11% VAT figure as $11) for 3 enrichedProcedures.ts records whose fees text says \"لا رسوم\"/\"لا يتوجب أي رسم\" (no fee), by extending the zero-fee regex to catch that phrasing alongside 'مجاني'. + batch #490 applied the identical fix to ProcedureEstimatedFeeChip.tsx's parseFeesAr(), which had the same missing-phrasing gap (showed a 'varies' badge instead of 'free' for the same 3 records). + batch #491 fixed a leaked Python dict-repr fragment in serviceFAQ.ts's ref_004 summary field, rendered raw on /faq and ProcedureFAQChips.tsx; added a broader isCorruptDictRepr() detector (catches the pattern anywhere in the string, not just at the start) guarding both files. + batch #492 fixed ProcedureEstimatedCompletion.tsx inventing a false 30-day completion date (justice-personal-status-court's processingTime 'يتفاوت حسب نوع القضية: أسابيع إلى أشهر' has zero digits) by excluding the unquantified plural 'أشهر'/'months' from the single-month fallback. + batch #493 fixed the 'وثيقة' (document) number-noun agreement bug in 6 more components (ProcedureDocReadinessBar, ProcedureRelatedSuggestions, ProcedureSearchModal, ProcedureProgressBadge, ProcedureChecklistExport, ReadinessChecker) that were never actually covered by the batch #483 fix despite prior notes implying they were -- 87% of real procedures render a grammatically wrong document count without this. + batch #494 fixed ProcedureDocumentStatus.tsx computing document-expiry day-counts via raw UTC-epoch diff while NotificationBell.tsx (reading the same localStorage keys) uses a true Beirut calendar-day diff, causing the two simultaneously-rendered widgets to show contradictory day-counts for the same date; anchored both on Asia/Beirut calendar days. + batch #495 fixed ProcedureStartButton.tsx and ProcedureCompletionBadge.tsx storing UTC calendar dates (via toISOString()) for start/completion tracking instead of Beirut's local date, causing a wrong 'started/completed N days ago' count during the daily UTC-vs-Beirut offset window; added a shared todayLb() helper anchored on Asia/Beirut. + batch #496 fixed the last unfixed instance of this same pattern -- app/procedures/page.tsx's deadline-picker min attribute used UTC toISOString(), letting users pick an already-past date as a deadline during the nightly offset window; confirmed via repo-wide grep this was the final live occurrence. + batch #497 fixed app/procedures/[slug]/ProcedureDetailClient.tsx rendering Arabic-only step.authority/step.duration chips with no isAr check, leaking raw Arabic text into English-mode pages since the data model has no _en counterpart for these fields; hid the chips in English mode as the safe fix. + batch #498 fixed NotificationBell.tsx daysUntil() using device-local timezone midnight instead of Asia/Beirut for the same dalilak_doc_expiry keys ProcedureDocumentStatus.tsx (fixed in #494) reads with the correct Beirut anchor, causing two simultaneously-visible widgets to show different day-counts for the identical stored expiry date; also fixed an internal inconsistency where the file already computed a Beirut-anchored today for reminder filtering but fed dates through the device-local daysUntil() for display. + batch #499 fixed ProcedureFeeHistory.tsx daysDiff() hardcoding a summer-only +03:00 Beirut offset instead of the real IANA Asia/Beirut zone, causing the paid-date day-count to flip a day early during the last hour of each winter calendar day (Beirut is UTC+2 outside DST); replaced with the same Beirut-calendar-string anchor pattern used elsewhere. + batch #500 fixed 16 of 60 lib/serviceFAQ.ts summary records that were truncated at exactly 300 chars mid-sentence with no ellipsis, visibly cut off when rendered raw/full on app/faq/page.tsx; added a displaySummary() helper that appends an ellipsis at the confirmed truncation cutoff without altering real content. + batch #501 fixed ProcedureReminderBell reminders having no dismiss path anywhere live -- exported dismissReminderById() from SmartReminder.tsx and added a dismiss button to NotificationBell.tsx reminder items, since the only existing dismiss logic lived in a component that is never mounted. + batch #502 fixed 61 lib/allTransactions.ts records where title===titleEn (raw English/scrape-artifact text shown as the Arabic label on the default /forms tab); stripped the scrape suffix and fell back to the ministry's Arabic name for records with no real Arabic content. + batch #503 fixed ProcedureQRShare.tsx's QR code pointing at a dead/foreign domain (dalilak.app instead of the real dalilak-frontend.vercel.app used everywhere else in the app), so scanning the shared QR previously led nowhere. + batch #504 fixed ProcedureShareViaEmail.tsx always sending Arabic steps regardless of language mode -- every other field (title/ministry/fee/time/docs) correctly fell back to its _en variant except steps, confirmed by the sibling WhatsApp share button doing it correctly right next to it. + batch #505 fixed ProcedureHistoryLog.tsx never logging 'started'/'completed' events (only 'viewed') because setStartDate() and markCompleted() never called the already-built addHistoryEvent() helper -- the activity log stayed stuck on Viewed forever even after a user finished a procedure. + batch #506 fixed the Advanced Filters 'Processing Speed' filter dropping 21 of 70 real procedures from every bucket because Arabic broken-plural forms (أيام/أسابيع) didn't match the singular substring checks (يوم/أسبوع) it was using. + batch #507 fixed the 'Fees' advanced filter defaulting 7 procedures with no recorded fee data to 'Paid' by default, even though one of them is literally titled 'estate transfer duty' -- excluded unknown-fee records from the filter instead of guessing. + batch #508 fixed the 27-item Guided Procedures section on /procedures completely ignoring the advanced-filter drawer (no matching fields, no useMemo dependency) -- now hides that section while any advanced filter is active instead of showing unfiltered contradictory results. + batch #509 fixed ChatHistoryPanel.tsx's saveChatSession() keeping the oldest 40 messages instead of the newest 40 (slice(0,40) vs slice(-40)), so restoring a long saved chat silently dropped its most recent turns. + batch #510 fixed ChatSaveToNotes.tsx's 'Save to notepad' button showing a false success checkmark while writing to a localStorage key that had zero live readers (QuickNotepad.tsx, the only other file referencing it, isn't mounted anywhere and reads sessionStorage instead) -- added a Saved Notes section to my-files reading the real write path. + batch #511 audit-only: AppointmentReminder.tsx/NotificationBell.tsx both read localStorage['dalilak_appointments'] but nothing in the app ever writes that key -- no code changed, flagged as a future feature-build lead since a real fix means designing a whole new 'add appointment' feature. + batch #512 fixed SmartInputSuggestions.tsx's chat autocomplete having two disconnected activeIdx state machines (mouse-driven display vs keyboard-driven hook), so arrow-key navigation showed no highlight and Enter could silently swap the user's typed message for an unrelated suggestion instead of sending it -- made the component controlled by the hook's state. + batch #513 fixed the daily-quota-remaining warning banner in app/page.tsx being hardcoded RTL/right-aligned even in English mode, while its sibling retry-chip banner right above it had already been fixed for the same issue in batch #424 -- branched direction/textAlign on isAr to match. + batch #514 fixed the same hardcoded-RTL bug in components/DraftingStudio.tsx -- all 14 textarea-type form fields across its 8 document templates were forced RTL even in English mode while sibling <input> fields on the same form correctly inherited LTR. + batch #515 fixed a 3rd instance of the same hardcoded-RTL bug class in app/page.tsx's attached-file preview card (filename/size/status text jammed right-aligned in English mode instead of following the file icon on the left). + batch #516 fixed a 4th instance in components/DocumentIntelligenceView.tsx -- all 7 collapsible section headers ('Extracted Data', 'Potential Risks', etc.) were hardcoded right-aligned even in English mode; threaded isAr through CollapsibleSection to fix all 7 at once."
git push origin main
echo "✅ Done"
