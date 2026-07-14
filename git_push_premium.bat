@echo off
cd /d "%~dp0"

echo === Staging all frontend changes ===
git add .

echo === Commit: Complete Big Four inline-styles migration ===
git commit -m "design: complete Tailwind-to-inline-styles migration across all pages — admin/page.tsx (108 classes, PLAN_STYLE CSSProperties, brand gradient header, 7 tabs inline), admin/content/page.tsx (STATUS_CONFIG CSSProperties, workflow viz, audit log), DocumentAnalysisPanel.tsx (CONF_STYLE/WARN_CSS/RISK_CLAUSE_STYLE/STRENGTH_STYLE CSSProperties, 62 classes), TransactionFilePanel.tsx (STATUS_STYLE CSSProperties), MissingDocumentsChecklist.tsx (PRIORITY_STYLE CSSProperties), FormDetailClient.tsx (brand gradient header) — zero Tailwind utilities remain in any component, all SVG icons inline, parchment #FAFAF8 bg, Cairo font, maroon #8B1A1A/#6b2737 brand throughout"

echo === Push to GitHub ===
git push origin main

echo.
echo Done. Vercel will rebuild in ~1 min.
pause
