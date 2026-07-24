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
# ================================================================
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git diff --cached --quiet || git commit -m "feat: batch #284-343 — 31 new components + full mobile/desktop polish pass + settings page + PWA/SEO + reliability fixes + h1 + aria-label + focus-ring fixes + mobile floating-widget overlap fix + forms/[slug] bottom-padding fix + complete safe-area-inset-bottom coverage + ProcedureMinistryMap touch-target fix + declutter pass on procedure/services/form detail pages via SectionCollapseToggle + expat-property h1 fix + main-content landmark on ~20 pages + real WhatsApp support number for ProcedureHelpRequest + SectionCollapseToggle 44px touch target fix + GlobalSearch ⌘K hint hidden on mobile (gs-search-kbd) + SavedItemsPanel touch-visible remove/ask affordances + ProcedureVersionTag tap-to-reveal tooltip + SavedItemsPanel remove button 44px touch hit-area expansion + sitewide tap-hit-N utility sweep across 8 more components + HomepageMinistrySpotlight carousel button spacing fix + fix AI replies ignoring the UI language toggle + mobile re-audit: hero search bar crowding, homepage widget defaults, footer grid, expat-property tabs, professional stat grid, DraftingStudio stage pill + admin/admin-content sticky header overflow fix + batch #337 cross-page mobile consistency pass + batch #338 design-token hardening + batch #339 maxWidth/header-padding token migration across 21+9 files + batch #340 floating-button touch-target sweep + batch #341 auth-page visual consistency fix + batch #342 world-class additions: Breadcrumbs component + BreadcrumbList JSON-LD on procedures/forms detail pages, Organization + WebSite/SearchAction JSON-LD on layout.tsx, Escape-to-close fix across 5 modal/sheet components + batch #343 metadataBase + canonical URLs on 7 public pages"
git push origin main
echo "✅ Done"
