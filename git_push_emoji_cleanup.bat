@echo off
cd /d "%~dp0"

git add ^
  components/DocumentIntelligenceView.tsx ^
  components/TransactionScoreWidget.tsx ^
  components/ServiceGroupSheet.tsx ^
  app/drafting-studio/page.tsx ^
  app/forgot-password/page.tsx ^
  app/reset-password/page.tsx ^
  app/admin/content/page.tsx ^
  app/admin/page.tsx ^
  components/TopNav.tsx ^
  app/authorities/page.tsx ^
  app/procedures/page.tsx ^
  app/page.tsx ^
  components/RiskScoreCard.tsx

git commit -m "refactor: replace all emoji with inline SVG icons (batches 3+4)"

git push origin main

echo Done.
pause
