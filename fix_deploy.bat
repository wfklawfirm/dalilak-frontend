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
git commit -m "fix: comprehensive link audit + global AR/EN language toggle fix - fixed 15 dead .gov.lb domains in allServices.ts (interior/mof/isa/moc/moyslebanon/pressorder/refugees/regie/southcouncil/conseilideal/cadastre/mfa) with verified live replacements (moim/finance/insurancecommission/tra/minijes/pressorderlebanon/ministryofdisplaced/regie.com.lb/councilforsouth/statecouncil), fixed 2 malformed concatenated-URL fields, fixed mislabeled water-ministry link; fixed 3 dead domains + 1 dead PDF attachment in curated FORMS_DATA (procedures.ts); added 1 verified missing form link (MBK9-08) to allTransactions.ts; WAYBACK AUDIT COMPLETE (2026-07-17): all 770 unique Wayback form links individually re-verified against Internet Archive (CDX + availability API, fully serial, no rate-limit violations) - 688 confirmed FAKE (~89%%), 81 confirmed REAL, 1 non-Wayback dead link found; WAYBACK FIX APPLIED (2026-07-17): replaced all 695 fake/dead pdfUrl entries in allTransactions.ts (_P dict, backup saved as allTransactions.ts.bak_before_wayback_fix_*) with verified-live official ministry forms/e-services pages (27 domains across 35 ministry categories, each individually fetch-verified) rather than deleting the hasForm feature - hasForm flags and _R array left untouched; 0 REAL wayback links touched; LANGUAGE TOGGLE FIX (2026-07-18): root cause was every page keeping its own local useState('ar') with no shared state, so switching to English reset to Arabic on every navigation, plus several pages (authorities/my-files/services) hardcoded isAr={true} with no toggle at all, and the mobile language button was hidden in TopNav with no working replacement on BottomNav-only pages; added lib/LanguageContext.tsx (shared context persisted to localStorage 'dalilak_lang', syncs document.documentElement lang/dir) + components/GlobalLangSwitch.tsx (floating toggle rendered globally in app/layout.tsx, reachable on every single page including login/register/admin); migrated all 18 affected files (app/page.tsx, faq, forms, procedures + [slug] + playbook, services + expat-property, authorities, my-files, drafting-studio, forms/[slug]/FormDetailClient, login, register, forgot-password, reset-password, admin, admin/content, plus TopNav/BottomNav/MobileMenu components) off local/broken lang state onto the shared context; esbuild+UTF8 verified clean on all touched files; total 367 services across 58 categories"

REM 6. Push to trigger Vercel rebuild
echo.
echo === Pushing to GitHub ===
git push origin main

echo.
echo Done. Vercel will rebuild in ~30s.
echo Check: https://vercel.com/wfklawfirms-projects/dalilak-frontend
pause
