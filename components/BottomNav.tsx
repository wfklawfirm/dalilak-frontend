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
const ChatFABIcon = () => (
  <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
)
const ServicesIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
)
const ServicesFillIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
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

const TABS = [
  { id: 'home',       label_ar: 'الرئيسية', label_en: 'Home',       Icon: HomeIcon,     FillIcon: HomeFillIcon,     route: '/' },
  { id: 'procedures', label_ar: 'المعاملات', label_en: 'Procedures', Icon: ProcIcon,     FillIcon: ProcIcon,         route: '/procedures' },
  { id: 'chat',       label_ar: 'محادثة',   label_en: 'Chat',       Icon: ChatFABIcon,  FillIcon: ChatFABIcon,      route: '/' }, // FAB center
  { id: 'services',   label_ar: 'الخدمات',  label_en: 'Services',   Icon: ServicesIcon, FillIcon: ServicesFillIcon, route: '/services' },
  { id: 'account',    label_ar: 'حسابي',    label_en: 'Account',    Icon: AccountIcon,  FillIcon: AccountFillIcon,  route: '/my-files' },
] as const

export default function BottomNav({ isAr: isArProp, activeTab = 'home', onHomeClick, onChatClick }: BottomNavProps) {
  const router = useRouter()
  const { isAr: ctxIsAr } = useLanguage()
  const isAr = isArProp ?? ctxIsAr

  const handleTab = (id: string) => {
    if (id === 'home'  && onHomeClick) { onHomeClick(); return }
    if (id === 'chat'  && onChatClick) { onChatClick(); return }
    const routes: Record<string, string> = { home:'/', services:'/services', procedures:'/procedures', chat:'/', account:'/my-files' }
    router.push(routes[id] || '/')
  }

  return (
    <>
      <style>{`
        @keyframes bnSlideUp { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
        .bn-tab-btn { transition: background 0.12s, transform 0.12s; }
        .bn-tab-btn:active { transform: scale(0.92); }
        .bn-fab:active { transform: translateY(-8px) scale(0.93); }
      `}</style>
      <nav
        aria-label={isAr ? 'التنقل الرئيسي' : 'Main navigation'}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(210,195,178,0.5)',
          boxShadow: '0 -4px 24px rgba(100,60,20,0.09)',
          display: 'flex', alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 100,
          minHeight: 56,
          animation: 'bnSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.id
          const isFAB = tab.id === 'chat'

          if (isFAB) {
            return (
              <div key={tab.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleTab(tab.id)}
                  aria-label={isAr ? 'فتح المحادثة' : 'Open chat'}
                  className="bn-fab"
                  style={{
                    width: 52, height: 52, borderRadius: 18,
                    background: active
                      ? 'linear-gradient(135deg,#741622 0%,#8F1D2C 100%)'
                      : 'linear-gradient(135deg,#8F1D2C 0%,#741622 100%)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(143,29,44,0.45), 0 1px 4px rgba(0,0,0,0.12)',
                    transform: 'translateY(-10px)',
                    transition: 'transform 0.18s cubic-bezier(0.34,1.6,0.64,1), box-shadow 0.18s',
                  }}
                >
                  <ChatFABIcon />
                </button>
                <span style={{
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  color: active ? '#8F1D2C' : '#B0A498',
                  marginTop: -2,
                }}>
                  {isAr ? tab.label_ar : tab.label_en}
                </span>
              </div>
            )
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTab(tab.id)}
              aria-current={active ? 'page' : undefined}
              className="bn-tab-btn"
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '7px 4px 5px',
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: active ? '#8F1D2C' : '#A89D92',
                fontFamily: 'inherit',
                position: 'relative', borderRadius: 8,
              }}
            >
              {active && (
                <span style={{
                  position: 'absolute', top: 0, left: '22%', right: '22%',
                  height: 3, borderRadius: '0 0 3px 3px',
                  background: 'linear-gradient(90deg,#741622,#8F1D2C)',
                }} />
              )}
              <span style={{
                color: active ? '#8F1D2C' : '#B0A498',
                transform: active ? 'scale(1.08)' : 'scale(1)',
                transition: 'color 0.18s, transform 0.2s cubic-bezier(0.34,1.6,0.64,1)',
              }}>
                {active ? <tab.FillIcon /> : <tab.Icon />}
              </span>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>
                {isAr ? tab.label_ar : tab.label_en}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
