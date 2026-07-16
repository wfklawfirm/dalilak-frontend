@echo off
cd /d "%~dp0"

echo === Fix Vercel Build — Force rebuild on latest commit ===
echo.
echo Current HEAD:
git log --oneline -1
echo.
echo Remote HEAD:
git ls-remote origin HEAD
echo.

REM Make an empty commit to force Vercel to pick up the latest (correct) code
REM The fix is already committed in ad5ed74 — this just triggers the webhook
git commit --allow-empty -m "chore: trigger Vercel rebuild on fixed HEAD

All fixes are already in ad5ed74:
- app/page.tsx: restored 15 missing lines (canSend/isAr/MAX_INPUT/showCharCount
  + authChecked loading spinner) — fixes Vercel build error at line 609/672
- components/ProcedureFlowchart.tsx: brand colors (maroon/warm dark)
- lib/serviceGroups.ts: business group #1E3A5F -> #B8860B
- lib/documentIntelligence.ts: notarial/expat_consular #1A5276 -> brand colors
- lib/plan.ts: admin tier #6D28D9 -> #8B1A1A
- app/admin/page.tsx: add missing edit user modal"

echo.
echo === Pushing to GitHub (triggers Vercel auto-deploy) ===
git push origin main

echo.
echo Done. Vercel will start a new build in ~30 seconds.
echo Check: https://vercel.com/wfklawfirms-projects/dalilak-frontend
pause
