@echo off
cd /d "%~dp0"

echo === Removing stale git lock ===
if exist ".git\index.lock" (
    del /f ".git\index.lock"
    echo Lock removed.
) else (
    echo No lock found.
)

echo === Staging all frontend changes ===
git add .

echo === Commit: Premium frontend polish — Big Four standards ===
git commit -m "design: premium frontend — Big Four standards, homepage declutter, dead-code purge

Homepage (app/page.tsx):
- Moved 2 primary CTAs (ابدأ مساراً / حلّل مستنداً) INTO hero band
- Removed wlc-most-req section, desktop-cols grid wrapper
- Simplified content area + CSS dead-code cleanup
- ~12 fewer interactive elements, cleaner visual hierarchy

globals.css: dead-code removal (404 -> 216 lines), restored .bottom-nav-wrapper

ChatMessage: assistant avatar replaced with /logo.PNG image

Admin + shared components: inline-styles migration (Tailwind eliminated)

procedures/page.tsx: replaced proc.icon emoji with inline SVG clipboard-check
services/page.tsx: added hover CSS, removed duplicate conflicting !important rules

All: zero emoji, zero Tailwind, all SVG inline, parchment bg, Cairo font, brand maroon"

echo === Push to GitHub ===
git push origin main

echo.
echo Done. Vercel will rebuild in ~1 min.
pause
