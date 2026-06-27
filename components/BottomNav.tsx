'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface BottomNavProps {
  isAr: boolean
  activeTab?: 'home' | 'procedures' | 'chat' | 'forms' | 'account'
  onHomeClick?: () => void
  onChatClick?: () => void
}

const TABS = [
  {
    id: 'home',
    label_ar: 'الرئيسية',
    label_en: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
  },
  {
    id: 'chat',
    label_ar: 'محادثة',
    label_en: 'Chat',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    ),
  },
  {
    id: 'forms',
    label_ar: 'النماذج',
    label_en: 'Forms',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4"/>
      </svg>
    ),
  },
  {
    id: 'account',
    label_ar: 'حسابي',
    label_en: 'Account',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      procedures: '/procedures',
      chat: '/',
      forms: '/forms',
      account: '/my-files',
    }
    router.push(routes[id] || '/')
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff',
      borderTop: '1px solid #EAE4D9',
      boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 100,
    }}>
      {TABS.map(tab => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => handleTab(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '8px 4px 6px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: active ? '#8B1A1A' : '#9C8E80',
              fontFamily: 'inherit', transition: 'all 0.15s',
              position: 'relative',
            }}>
            {active && (
              <span style={{
                position: 'absolute', top: 0, left: '25%', right: '25%',
                height: 2.5, background: '#8B1A1A',
                borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
              }} />
            )}
            <span style={{ color: active ? '#8B1A1A' : '#9C8E80', opacity: active ? 1 : 0.7 }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500 }}>
              {isAr ? tab.label_ar : tab.label_en}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
