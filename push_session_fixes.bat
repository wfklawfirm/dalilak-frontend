@echo off
cd /d "%~dp0"

echo === Push Session UI Fixes ===
echo.

git add "app/procedures/[slug]/page.tsx"
git add app/drafting-studio/page.tsx
git add app/procedures/page.tsx
git add components/DraftingStudio.tsx
git add components/TransactionFilePanel.tsx
git add app/services/expat-property/page.tsx
git add components/DocumentIntelligenceView.tsx
git add components/ServiceGroupSheet.tsx
git add components/GuidedFlow.tsx
git add components/AgentResponseRenderer.tsx
git add app/my-files/page.tsx
git add app/globals.css
git add components/BottomNav.tsx
git add components/MobileMenu.tsx
git add components/MobileModeSheet.tsx
git add app/forms/page.tsx
git add app/faq/page.tsx
git add app/authorities/page.tsx
git add "app/procedures/[slug]/ProcedureDetailClient.tsx"
git add "app/forms/[slug]/FormDetailClient.tsx"
git add components/HumanReviewCTA.tsx
git add app/admin/content/page.tsx
git add components/ui/index.tsx
git add app/page.tsx
git add app/admin/page.tsx
git add components/ProcedureFlowchart.tsx
git add .gitignore

git status --short

git commit -m "fix: restore 5 OneDrive-truncated files + S4 brand color sweep (Vercel build fix)"

echo.
echo === Pushing to GitHub ===
git push origin main

echo.
echo Done. Vercel will rebuild in ~30s.
echo Check: https://vercel.com/wfklawfirms-projects/dalilak-frontend
pause
