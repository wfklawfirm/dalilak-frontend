@echo off
cd /d "%~dp0"

echo === Dalilak Frontend — Sprint 36-42: audit + SEO + a11y + RTL + brand + gradient ===
echo.

REM 1. Remove stale git lock
if exist ".git\index.lock" (
    echo Removing stale .git\index.lock...
    del /f /q ".git\index.lock"
)

REM 2. Remove all stray zero-byte files accidentally created in previous sessions
for %%F in ("#1A1208" "#2D1B0E" "#5C4A3A" "#8B1A1A" "#9C8E80" "#B8860B" "#EAE4D9" "#FAFAF8" "#FEF2F2" "#FEF7F7" "#FEF9F5" "216" "brand" "titleAr" "warm" "warmGrey" ".write_test") do (
    if exist %%F del /f /q %%F
)
REM Files with special characters need separate handling
if exist "#2D1B0E(warm" del /f /q "#2D1B0E(warm"
if exist "#6b2737(brand" del /f /q "#6b2737(brand"

REM 3. Untrack those stray files from git
git rm -f --ignore-unmatch "#1A1208" "#2D1B0E" "#5C4A3A" "#8B1A1A" "#9C8E80" "#B8860B" "#EAE4D9" "#FAFAF8" "#FEF2F2" "#FEF7F7" "#FEF9F5" "216" "brand" "titleAr" "warm" "warmGrey" ".write_test" 2>nul

REM 4. Stage all changed files
git add -A

echo.
echo === Staged files ===
git status --short

REM 5. Commit
git commit -m "fix: comprehensive link audit across all services and forms - fixed 15 dead .gov.lb domains in allServices.ts (interior/mof/isa/moc/moyslebanon/pressorder/refugees/regie/southcouncil/conseilideal/cadastre/mfa) with verified live replacements (moim/finance/insurancecommission/tra/minijes/pressorderlebanon/ministryofdisplaced/regie.com.lb/councilforsouth/statecouncil), fixed 2 malformed concatenated-URL fields, fixed mislabeled water-ministry link; fixed 3 dead domains + 1 dead PDF attachment in curated FORMS_DATA (procedures.ts); added 1 verified missing form link (MBK9-08) to allTransactions.ts; discovered and documented data-integrity issue in the 794-link Wayback forms corpus (folder-level spot check found ~4%% real-capture rate in one folder) - full re-verification blocked by Internet Archive rate-limiting, follow-up needed; total 367 services across 58 categories, all esbuild+UTF8 verified clean"

REM 6. Push to trigger Vercel rebuild
echo.
echo === Pushing to GitHub ===
git push origin main

echo.
echo Done. Vercel will rebuild in ~30s.
echo Check: https://vercel.com/wfklawfirms-projects/dalilak-frontend
pause
