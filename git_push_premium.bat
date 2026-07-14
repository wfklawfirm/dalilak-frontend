@echo off
cd /d "%~dp0"

echo === Staging all frontend changes ===
git add .

echo === Commit: Frontend premium polish — restore truncated files + utility CSS + UX improvements ===
git commit -m "feat: premium frontend polish — restored pages + design system upgrade

RESTORED TRUNCATED FILES (3 pages, previously broken mid-JSX):
  app/faq/page.tsx:
  - Completed SVG clear button, category filter pills (10 categories),
    FAQ accordion with expand/collapse, answer text display,
    Ask AI button per item, BottomNav integration

  app/forms/page.tsx:
  - Completed curated form card (icon, title, ministry, type/category badges,
    PDF badge), Ask AI + Download action buttons, BottomNav integration

  app/procedures/page.tsx:
  - Completed enriched view PDF download links, Ask AI button in expanded panel,
    full detailed procedures view (expand/collapse, steps, required docs,
    estimatedDuration, complexity badge), ServiceModal integration, BottomNav

DESIGN SYSTEM (app/globals.css):
  + @keyframes fadeInUp + .page-enter entrance animation
  + .section-header utility class (consistent section headings)
  + .badge, .badge-brand, .badge-green, .badge-amber, .badge-neutral
  + .btn-primary (gradient CTA with hover lift + shadow)
  + .btn-ghost (outlined ghost button)
  + .skeleton shimmer animation
  + .empty-state (centered empty state layout)
  + .search-wrap:focus-within brand ring highlight
  + .card-hover translateY + brand border transition

SERVICES PAGE (app/services/page.tsx):
  - Full rewrite: srv-fade entrance animation, proc-grid mobile class,
    search icon inside input, status dot on active procedures,
    authority row with building SVG icon, two-line -webkit-line-clamp on title/summary,
    hover transitions on all interactive elements

MODE SELECTOR (components/MobileModeSheet.tsx):
  - Restored: MobileModeSheet, DesktopModeSelector, ModeSelector default export
  - Mobile button: icon + label + chevron, opens bottom sheet
  - Desktop: pill row with brand active state, whiteSpace nowrap

COLD GREY AUDIT COMPLETE:
  login/page.tsx: eye icon #9ca3af -> #9C8E80
  page.tsx: active doc chip close #6B7280 -> #9C8E80
  Zero cold grey tokens remaining across entire src/

HOMEPAGE (app/page.tsx):
  - Reduced quick-q pills to 3, removed redundant 'عرض الكل' button
  - Cleaned dead CSS (SUGGESTION_POOL, wlc-most-req, stale animations)
  - Moved CTAs into hero section

TOP NAV (components/TopNav.tsx):
  - Improved visual hierarchy and spacing
  - Language toggle removed from mobile (cleaner mobile header)

GLOBAL CSS polish:
  - input focus-within brand ring
  - .card-hover consistency across pages
  - .send-btn active scale 0.95
  - Minimum tap target 36px on mobile"

echo === Push to GitHub ===
git push origin main

echo.
echo Done. Vercel will rebuild in ~1 min.
pause
