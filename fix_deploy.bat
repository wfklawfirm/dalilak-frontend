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
git commit -m "feat: add 101 comprehensive Ministry of Finance services (income tax, VAT, built-property tax, indirect taxes/stamp duty, improvement tax, inheritance duty, tax objections x3, pension dept x10, customs x10, land registry x2, cross-cutting x6) + new pensions category; sprint55 s2 stats strips->premium cards"

REM 6. Push to trigger Vercel rebuild
echo.
echo === Pushing to GitHub ===
git push origin main

echo.
echo Done. Vercel will rebuild in ~30s.
echo Check: https://vercel.com/wfklawfirms-projects/dalilak-frontend
pause
