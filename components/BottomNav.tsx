'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface BottomNavProps {
  isAr: boolean
  activeTab?: string
  onHomeClick?: () => void
  onChatClick?: () => void
}

const TABS = [
  {
    id: 'home',
    label_ar: 'الرئيسية',
    label_en: 'Home',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    id: 'procedures',
    label_ar: 'المعاملات',
    label_en: 'Procedures',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
  },
  {
    id: 'chat',
    label_ar: 'محادثة',
    label_en: 'Chat',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    ),
  },
  {
    id: 'services',
    label_ar: 'الخدمات',
    label_en: 'Services',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
  {
    id: 'account',
    label_ar: 'حسابي',
    label_en: 'Account',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
] as const

export default function BottomNav({ isAr, activeTab = 'home', onHomeClick, onChatClick }: BottomNavProps) {
  const router = useRouter()

  const handleTab = (id: string) => {
    if (id === 'home' && onHomeClick) { onHomeClick(); return }
    if (id === 'chat' && onChatClick) { onChatClick(); return }
    const routes: Record<string, string> = {
      home: '/',
      services: '/services',
      procedures: '/procedures',
      chat: '/',
      account: '/my-files',
    }
    router.push(routes[id] || '/')
  }

  return (
    <>
    <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }`}</style>
    <nav aria-label={isAr ? 'التنقل الرئيسي' : 'Main navigation'} style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid #EAE4D9',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 100,
      minHeight: 56,
      animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      {TABS.map(tab => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTab(tab.id)}
            aria-current={active ? 'page' : undefined}
            onTouchStart={e => {
              e.currentTarget.style.background = active ? 'rgba(139,26,26,0.06)' : 'rgba(0,0,0,0.04)'
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onTouchEnd={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '7px 4px 5px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: active ? '#8B1A1A' : '#A89D92',
              fontFamily: 'inherit', transition: 'background 0.12s, transform 0.12s',
              position: 'relative', borderRadius: 8,
            }}>
            {active && (
              <span style={{
                position: 'absolute', top: 0, left: '20%', right: '20%',
                height: 2.5, background: 'linear-gradient(90deg, #6b2737, #8B1A1A)',
                borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
              }} />
            )}
            <span style={{
              color: active ? '#8B1A1A' : '#B0A498',
              opacity: 1,
              transition: 'color 0.18s, transform 0.18s cubic-bezier(0.22,1,0.36,1)',
              transform: active ? 'scale(1.05)' : 'scale(1)',
            }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: active ? '-0.1px' : 0 }}>
              {isAr ? tab.label_ar : tab.label_en}
            </span>
          </button>
        )
      })}
    </nav>
    </>
  )
}
