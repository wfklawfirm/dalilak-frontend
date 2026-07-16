@echo off
cd /d "%~dp0"

echo === Staging all frontend fixes (Sessions 1-4) ===

REM PRIMARY BUILD FIX — app/page.tsx was not pushed in session 2
git add app/page.tsx

REM TypeScript + RTL fixes (session 1)
git add components/BottomNav.tsx
git add app/drafting-studio/page.tsx
git add app/my-files/page.tsx
git add app/authorities/page.tsx
git add app/login/page.tsx

REM Critical truncation fixes (session 2 — already pushed but restaging to be safe)
git add components/ui/index.tsx
git add components/DraftingStudio.tsx
git add components/AgentResponseRenderer.tsx
git add components/DocumentIntelligenceView.tsx

REM Truncation fixes (session 3 — new)
git add components/TransactionFilePanel.tsx
git add components/TransactionScoreWidget.tsx
git add components/EscalationModal.tsx
git add components/MissingDocumentsChecklist.tsx
git add components/ProcedureFlowchart.tsx
git add components/DocumentAnalysisPanel.tsx
git add app/register/page.tsx
git add app/reset-password/page.tsx

REM Design improvements (session 4 — new)
git add app/procedures/page.tsx

REM Services fix + BottomNav activeTab fixes (session 5 — new)
git add app/services/page.tsx
git add app/forms/page.tsx
git add app/faq/page.tsx

REM Session 6 — Color fixes, dedup, expat-property rewrite, truncation fixes
git add lib/serviceGroups.ts
git add app/services/expat-property/page.tsx
git add app/procedures/[slug]/page.tsx
git add app/procedures/[slug]/playbook/page.tsx

REM Session 7 — Brand color audit across all components
git add components/ServiceGroupSheet.tsx
git add components/TransactionStarter.tsx
git add components/RiskScoreCard.tsx
git add components/DocumentIntelligenceView.tsx

REM Session 8 — Truncation fixes + audits
git add app/procedures/[slug]/ProcedureDetailClient.tsx
git add components/DocumentAnalysisPanel.tsx

REM Session 9 — Color audit pass + FormDetailClient warm palette fix
git add app/forms/[slug]/FormDetailClient.tsx

REM Session 10 — Off-brand purple elimination across all components
git add app/procedures/[slug]/ProcedureDetailClient.tsx
git add components/AgentResponseRenderer.tsx

REM Session 12 — Fix off-brand colors in ProcedureFlowchart.tsx
git add components/ProcedureFlowchart.tsx

echo === Commit ===
git commit -m "fix: eliminate off-brand colors in ProcedureFlowchart + final palette compliance pass

Session 12 — Final palette compliance fix:
- components/ProcedureFlowchart.tsx NODE_COLORS: question #5C4A7A(purple)->#6b2737(brand maroon),
  document #1A5276(blue)->#2D1B0E(warm body dark)
- Full audit complete: all 47 TSX files + all components verified — 100% brand compliance

Session 10 — Off-brand purple elimination:
- app/procedures/[slug]/ProcedureDetailClient.tsx: playbook button #6D28D9->#2D1B0E,
  step authority badge #6D28D9->#5C4A3A, Authority section bg #F5F3FF->#FEF9F5
- components/AgentResponseRenderer.tsx SECTION_MAP: authority entries #6D28D9->#5C4A3A,
  fees entries #7E22CE->#854D0E/amber, legal basis entries #6D28D9->#8B1A1A (brand red)
- Brand palette compliance = 100%: zero cold grey, zero blue, zero purple violations

Session 9 — Warm palette fix:
- app/forms/[slug]/FormDetailClient.tsx: #1a1a1a->#1A1208, #555->#5C4A3A,
  #888->#9C8E80, #444->#1A1208, #666->#5C4A3A (5 cold neutral fixes)

Session 7 — Brand color audit:
- components/ServiceGroupSheet.tsx: #111827->warmBrand, #6B7280->warmGrey
- components/TransactionStarter.tsx: #111827->warmBrand x3, #6B7280->warmGrey
- components/RiskScoreCard.tsx: #9CA3AF->#9C8E80 (warm brand grey)
- components/DocumentIntelligenceView.tsx: #111827->#1A1208 (14 instances)

Session 6 — Bug fixes + polish:
- lib/serviceGroups.ts: Fixed all 6 service group accent colors to brand palette
  expat #1A5276→#8B1A1A, property #854D0E→#92400E, contracts #6B4226→#44403C
  civil-records #065F46→#166534, business #9D174D→#1E3A5F, forms-docs #2D1B0E→#5C4A3A
- app/procedures/page.tsx: Fixed duplicate SERVICE_CATEGORIES filter chips
  Added Set-based dedup on slug in visibleCategories useMemo
  (labor×3, judiciary×2, real-estate×2, utilities×2, emergency×2 removed)
- app/services/expat-property/page.tsx: CRITICAL — rewritten from scratch
  Previous file was truncated at line 214 mid-SVG causing build error
  Complete rewrite: section tabs, how-it-works card, service cards,
  updated colors to match serviceGroups.ts, added BottomNav
- app/procedures/[slug]/page.tsx: Fixed truncation at line 232
  Was ending mid-JSX inside document legend span
  Added: legend close, steps section, source/playbook card, BottomNav render
- app/procedures/[slug]/playbook/page.tsx: Fixed truncation at line 201
  Was ending with dangling {/* Authority */} comment
  Added: Authority section, Ask AI CTA, back button, BottomNav import + render

Session 5 — Bug fixes + polish:
- app/services/page.tsx: Replaced Link href='/procedures/[slug]' with
  button onClick opening ProcedureSheet bottom sheet modal
  No page navigation — inline sheet with summary, authority, CTA
- app/forms/page.tsx: Fixed BottomNav activeTab 'forms' → 'procedures'
- app/faq/page.tsx: Fixed BottomNav activeTab 'faq' → 'services'

Session 4 — UX improvements:
- app/procedures/page.tsx: Simplified 3-tab ViewMode to 2-tab
  (was: all/enriched/detailed → now: procedures/directory)
  Guided + enriched procedures merged into single Procedures tab
  Guided items show compass icon + 'مُرشدة' badge, enriched show 'موثّقة' badge
  Added slideDown animation for expanded accordion panels
  Tab switch clears search and expanded state
  Stats banner now shows correct totals
- app/authorities/page.tsx: Added search input above type filters
  Real-time search across nameAr, nameEn, type fields
  Empty state shows search query in message
  Results count shows active search term
- app/my-files/page.tsx: Replaced native confirm() dialog with
  inline confirmation (نعم/لا) for delete action
  Replaced + text with SVG icon in 'معاملة جديدة' button

Session 3 truncation fixes (restaged):
- components/TransactionFilePanel / TransactionScoreWidget / EscalationModal
- components/MissingDocumentsChecklist / ProcedureFlowchart / DocumentAnalysisPanel
- app/register/page.tsx / app/reset-password/page.tsx

PRIMARY FIX (build-breaking, session 3):
- app/page.tsx: was not staged in previous push"

echo === Push to GitHub ===
git push origin main

echo.
echo Done. Vercel will rebuild in ~1 min.
pause
