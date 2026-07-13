'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { clearToken, type User } from '@/lib/auth'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  isAr: boolean
  lang: 'ar' | 'en'
  onLangToggle: () => void
  onHome: () => void
  currentUser: User | null
}

const NAV_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9"/>
      </svg>
    ),
    label_ar: 'الرئيسية',
    label_en: 'Home',
    route: 'home',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
    label_ar: 'المعاملات',
    label_en: 'Procedures',
    route: '/procedures',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4"/>
      </svg>
    ),
    label_ar: 'النماذج',
    label_en: 'Forms',
    route: '/forms',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    label_ar: 'أسئلة شائعة',
    label_en: 'FAQ',
    route: '/faq',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
      </svg>
    ),
    label_ar: 'ملفاتي',
    label_en: 'My Files',
    route: '/my-files',
  },
]

export default function MobileMenu({ isOpen, onClose, isAr, lang, onLangToggle, onHome, currentUser }: MobileMenuProps) {
  const router = useRouter()

  const handleNav = (route: string) => {
    if (route === 'home') { onHome(); onClose(); return }
    router.push(route)
    onClose()
  }

  const handleLogout = () => {
    clearToken()
    router.push('/login')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 300,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0, bottom: 0,
        [isAr ? 'right' : 'left']: 0,
        width: 'min(280px, 82vw)',
        background: '#fff',
        zIndex: 301,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isAr
          ? '-8px 0 32px rgba(0,0,0,0.15)'
          : '8px 0 32px rgba(0,0,0,0.15)',
        animation: `drawerIn${isAr ? 'Right' : 'Left'} 0.25s cubic-bezier(0.34,1.1,0.64,1)`,
      }}>
        <style>{`
          @keyframes drawerInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes drawerInLeft  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        `}</style>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7a1a1a 0%, #8B1A1A 100%)',
          padding: '48px 20px 20px',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14,
              [isAr ? 'left' : 'right']: 14,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, fontWeight: 700,
            }}
          >×</button>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>👤</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {currentUser?.username || 'مستخدم'}
              </div>
              {currentUser?.plan && (
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  background: currentUser.plan === 'paid' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)',
                  color: currentUser.plan === 'paid' ? '#6EE7B7' : '#FDE68A',
                  border: `1px solid ${currentUser.plan === 'paid' ? 'rgba(52,211,153,0.4)' : 'rgba(251,191,36,0.4)'}`,
                  borderRadius: 20, padding: '2px 8px',
                }}>
                  {currentUser.plan === 'paid' ? (isAr ? '✨ مشترك' : '✨ Paid') : (isAr ? '⏱️ تجريبي' : '⏱️ Trial')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {NAV_ITEMS.map((item, i) => (
            <button
              key={i}
              onClick={() => handleNav(item.route)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 20px', border: 'none', background: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                textAlign: isAr ? 'right' : 'left',
                color: '#1A1208', fontSize: 14, fontWeight: 500,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2' }}
              onTouchEnd={e => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ color: '#8B1A1A', flexShrink: 0 }}>{item.icon}</span>
              <span>{isAr ? item.label_ar : item.label_en}</span>
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: '#F0EBE0', margin: '8px 20px' }} />

          {/* Language toggle */}
          <button
            onClick={() => { onLangToggle(); onClose() }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 20px', border: 'none', background: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              textAlign: isAr ? 'right' : 'left',
              color: '#1A1208', fontSize: 14, fontWeight: 500,
            }}
            onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'none' }}
          >
            <span style={{ color: '#8B1A1A', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
              </svg>
            </span>
            <span>{isAr ? 'التبديل إلى English' : 'التبديل إلى العربية'}</span>
            <span style={{ marginRight: 'auto', marginLeft: 'auto' }} />
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#8B1A1A',
              background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)',
              borderRadius: 20, padding: '2px 10px',
            }}>
              {isAr ? 'EN' : 'AR'}
            </span>
          </button>

          {/* Contact */}
          <div style={{ margin: '8px 20px', padding: '12px', background: '#FAFAF8', borderRadius: 12, border: '1px solid #F0EBE0' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#5C3A1A', margin: '0 0 8px' }}>
              {isAr ? '📞 تواصل معنا' : '📞 Contact Us'}
            </p>
            <a href="tel:+9613460608" style={{ display: 'block', fontSize: 12, color: '#8B1A1A', textDecoration: 'none', fontWeight: 600, marginBottom: 4, direction: 'ltr', unicodeBidi: 'isolate' }}>
              +961 3 460 608
            </a>
            <a href="mailto:wissam@aijur.ai" style={{ display: 'block', fontSize: 12, color: '#8B1A1A', textDecoration: 'none' }}>
              wissam@aijur.ai
            </a>
          </div>
        </div>

        {/* Logout */}
        <div style={{ padding: '12px 16px 24px', borderTop: '1px solid #F0EBE0' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              background: '#FEF2F2', border: '1.5px solid #FECACA',
              color: '#dc2626', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {isAr ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </div>
    </>
  )
}
