@echo off
cd /d "%~dp0"

echo === Staging all frontend changes ===
git add .

echo === Commit: Premium frontend polish — Big Four standards ===
git commit -m "design: premium frontend — Big Four standards, homepage declutter, dead-code purge

Homepage (app/page.tsx):
- Moved 2 primary CTAs (ابدأ مساراً / حلّل مستنداً) INTO hero band
  → White solid button (primary) + ghost button (secondary) on dark gradient
  → Elevated hierarchy: hero now has headline + subtitle + chips + CTAs
- Removed 2 duplicate action chips from content area below hero
- Removed wlc-most-req section entirely (6 redundant pills; hero chips cover this)
- Removed wlc-desktop-cols 2-col grid wrapper (left col was wlc-most-req only)
- Simplified content area: service section now direct child (no grid wrapper)
- CSS cleanup: removed .wlc-most-req, .wlc-desktop-cols rules from inline style block
- Updated @media breakpoint for .wlc-svc-grid: 768px → 640px (sooner on desktop)
- Removed unused icon property from MODES array type + all 3 MODES entries
- Removed redundant inline style={{ display:'none' }} from .bottom-nav-wrapper div
- Fixed .wlc-most-req { display: none !important; } CSS specificity bug
  (inline style={{ display:'flex' }} was overriding class-level display:none)

Result: ~12 fewer interactive elements on homepage, cleaner visual hierarchy,
hero band carries both the question chips AND the primary CTAs.

globals.css (app/globals.css):
- Complete dead-code removal: 404 → 216 lines
- Removed dead classes: .cursor, .card-btn, .chip-btn, .input-wrap,
  .header-contacts, .topbar-*, .header-inner, .welcome-grid, .quick-list,
  .logo-welcome, .welcome-heading, .welcome-sub, .welcome-stats,
  .welcome-bottom-pad, .proc-stats-grid, .sub-page-root, .mobile-card-text,
  .status-badge, both legacy @media (min-width: 640px/1024px) blocks
- Restored .bottom-nav-wrapper CSS (was incorrectly removed — critical for BottomNav)
  Pattern: display:none default → display:block at max-width:767px

ChatMessage (components/ChatMessage.tsx):
- Assistant avatar: replaced 'AI' text with /logo.PNG image (white circle, brand border)

Homepage previous session (app/page.tsx):
- Removed SUGGESTION_POOL constant (12 items, no longer used)
- Removed visibleS state and setVisibleS from useEffect
- Removed showMorePopular dead state
- Removed .suggestion-card:hover + .action-card:hover/:active dead CSS
- Removed 3 large action cards (ابدا معاملة / حلل مستندا / اسال دليلك)
- Removed duplicate logo/wordmark + 'Available now' badge from hero
- Added rotating quick-question chips inside hero band

Admin (app/admin/page.tsx):
- Complete Tailwind-to-inline-styles migration (108 classes eliminated)
- PLAN_STYLE as Record<string, React.CSSProperties>

Content Admin (app/admin/content/page.tsx):
- STATUS_CONFIG, TRANSITION_CONFIG as React.CSSProperties

Shared components:
- DocumentAnalysisPanel.tsx: CONF_STYLE/WARN_CSS/RISK_CLAUSE_STYLE/STRENGTH_STYLE
- TransactionFilePanel.tsx: STATUS_STYLE CSSProperties
- MissingDocumentsChecklist.tsx: PRIORITY_STYLE CSSProperties

procedures/page.tsx:
- detailed view icon: replaced {proc.icon} emoji with inline SVG clipboard-check icon
- removed fontSize:22 from icon container, added color:'#8B1A1A'

services/page.tsx:
- added .proc-card + .proc-card:hover (border shadow translateY transition)
- added .cat-btn + .cat-btn:hover (border color background transition)
- removed duplicate conflicting !important hover rules (CSS conflict cleanup)

All: zero Tailwind utilities, all SVG icons inline, parchment #FAFAF8 bg,
Cairo font, maroon #8B1A1A/#6b2737 brand throughout"

echo === Push to GitHub ===
git push origin main

echo.
echo Done. Vercel will rebuild in ~1 min.
pause
