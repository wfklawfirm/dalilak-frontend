'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

interface BottomNavProps {
  isAr?: boolean
  activeTab?: string
  onHomeClick?: () => void
  onChatClick?: () => void
}

/* ── Icons ───────────────────────────────────── */
const HomeIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9"/>
  </svg>
)
const HomeFillIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.03 2.59a1.5 1.5 0 011.94 0l7.5 6.363A1.5 1.5 0 0121 10.097V19.5a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5v-4.5a.5.5 0 00-.5-.5h-2a.5.5 0 00-.5.5V19.5a1.5 1.5 0 01-1.5 1.5h-4A1.5 1.5 0 013 19.5V10.097a1.5 1.5 0 01.53-1.144l7.5-6.363z"/>
  </svg>
)
const ProcIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
  </svg>
)
const ChatIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
)
const ChatFillIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 5.925 2 10.75c0 2.605 1.32 4.942 3.412 6.542L4 22l4.29-1.98A11.6 11.6 0 0012 20.5c5.523 0 10-3.925 10-8.75S17.523 2 12 2z"/>
  </svg>
)
const AccountIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
)
const AccountFillIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
)

// Reduced from 5 to exactly 4 items per UX_AUDIT.md ("one screen — one
// primary action" / "exactly 4 bottom-nav items"). "Services" (الخدمات) was
// dropped from this bar — not deleted: /services stays fully reachable via
// MobileMenu's nav list and via the homepage's search + category grid. It
// was the right item to drop because it's a *browse* surface, while Home,
// Procedures, Chat and Account are the four *do-a-task* surfaces the brief
// prioritizes (clarity/task-ease over exhaustive browsing).
//
// v4.0 (batch #366): flattened per the "Calm Government Digital Service"
// spec — the chat tab is no longer a raised circular FAB with a gradient
// and colored shadow; it's now a plain 4th tab like the other three, just
// tinted with --brand when active. Removed the top active-indicator bar
// too ("no long top bar") — active state is communicated by icon+label
// color alone, matching how Home/Procedures/Account already indicated it.
const TABS = [
  { id: 'home',       label_ar: 'الرئيسية',   label_en: 'Home',       Icon: HomeIcon,  FillIcon: HomeFillIcon,  route: '/' },
  { id: 'procedures', label_ar: 'المعاملات',   label_en: 'Procedures', Icon: ProcIcon,  FillIcon: ProcIcon,      route: '/procedures' },
  { id: 'chat',       label_ar: 'اسأل دليلك',  label_en: 'Ask Dalilak',Icon: ChatIcon,  FillIcon: ChatFillIcon,  route: '/' },
  { id: 'account',    label_ar: 'حسابي',       label_en: 'Account',    Icon: AccountIcon,FillIcon: AccountFillIcon,route: '/my-files' },
] as const

export default function BottomNav({ isAr: isArProp, activeTab = 'home', onHomeClick, onChatClick }: BottomNavProps) {
  const router = useRouter()
  const { isAr: ctxIsAr } = useLanguage()
  const isAr = isArProp ?? ctxIsAr

  const handleTab = (id: string) => {
    if (id === 'home'  && onHomeClick) { onHomeClick(); return }
    if (id === 'chat'  && onChatClick) { onChatClick(); return }
    // batch #526: on every page except the homepage itself (the only place
    // that passes onHomeClick/onChatClick above), Home and Ask Dalilak both
    // used to fall back to this same bare '/' — reported: "الرئيسية و اسأل
    // دليلك نفس الصفحة" (Home and Ask Dalilak are the same page). They now
    // mirror the distinct behavior the homepage's own onHomeClick/onChatClick
    // already give: '?reset=true' clears the conversation for a fresh
    // landing view (same pattern as onNewChat/onHomeClick/onHome in
    // app/page.tsx), '?focusChat=true' leaves it as-is and just focuses the
    // input. Handled in app/page.tsx's existing ?q=/?draft= mount effect.
    const routes: Record<string, string> = { home:'/?reset=true', services:'/services', procedures:'/procedures', chat:'/?focusChat=true', account:'/my-files' }
    router.push(routes[id] || '/')
  }

  return (
    <>
      <style>{`
        .bn-tab-btn { transition: color 0.15s; }
        .bn-tab-btn:active { opacity: 0.65; }
      `}</style>
      <nav
        aria-label={isAr ? 'التنقل الرئيسي' : 'Main navigation'}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'stretch',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 100,
          minHeight: 64,
        }}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTab(tab.id)}
              aria-current={active ? 'page' : undefined}
              aria-label={isAr ? tab.label_ar : tab.label_en}
              className="bn-tab-btn tap-hit-8"
              style={{
                position: 'relative',
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '8px 4px',
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: active ? 'var(--brand)' : 'var(--text-3)',
                fontFamily: 'inherit',
              }}
            >
              {active ? <tab.FillIcon /> : <tab.Icon />}
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 500 }}>
                {isAr ? tab.label_ar : tab.label_en}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
