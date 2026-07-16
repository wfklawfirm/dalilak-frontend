'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
      </svg>
    ),
    label_ar: 'الخدمات',
    label_en: 'Services',
    route: '/services',
  },
  {
    icon: (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
    label_ar: 'المعاملات',
    label_en: 'Procedures',
    route: '/procedures',
  },
  {
    icon: (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
    ),
    label_ar: 'الجهات الحكومية',
    label_en: 'Authorities',
    route: '/authorities',
  },
  {
    icon: (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    label_ar: 'أسئلة شائعة',
    label_en: 'FAQ',
    route: '/faq',
  },
  {
    icon: (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  const pathname = usePathname()

  const handleNav = (route: string) => {
    if (route === 'home') { onHome(); onClose(); return }
    router.push(route)
    onClose()
  }

  const handleLogout = () => {
    clearToken()
    router.push('/login')
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 300,
          backdropFilter: 'blur(2px)',
          animation: 'mmFadeIn 0.2s cubic-bezier(0.22,1,0.36,1) both',
        }}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? 'القائمة' : 'Menu'}
        style={{
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
          @keyframes mmFadeIn { from { opacity:0; } to { opacity:1; } }
          @keyframes mmItem { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
        `}</style>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(155deg, #5a1515 0%, #8B1A1A 55%, #6b2737 100%)',
          padding: '0 0 20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />

          {/* Top bar: brand + close */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px 16px',
          }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <img src="/logo.PNG" alt="دليلك" style={{ width: 26, height: 26, objectFit: 'contain', display: 'block' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.3px' }}>دليلك</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                  {isAr ? 'دليل المواطن اللبناني' : 'Lebanese Citizens Guide'}
                </div>
              </div>
            </div>
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label={isAr ? 'إغلاق القائمة' : 'Close menu'}
              onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.26)' }}
              onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.8)', flexShrink: 0, transition: 'background 0.12s',
              }}
            ><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 16px 16px' }} />

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                {currentUser?.full_name || currentUser?.username || 'مستخدم'}
              </div>
              {currentUser?.plan && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: currentUser.plan === 'paid' ? 'rgba(255,255,255,0.15)' : 'rgba(251,191,36,0.2)',
                  color: currentUser.plan === 'paid' ? '#fff' : '#FDE68A',
                  border: `1px solid ${currentUser.plan === 'paid' ? 'rgba(255,255,255,0.35)' : 'rgba(251,191,36,0.35)'}`,
                  borderRadius: 20, padding: '2px 9px', letterSpacing: '0.2px',
                }}>
                  {currentUser.plan === 'paid' ? (isAr ? 'مشترك' : 'Paid') : (isAr ? 'تجريبي' : 'Trial')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {NAV_ITEMS.map((item, i) => {
            const isActive = item.route === 'home' ? pathname === '/' : pathname === item.route
            return (
            <button
              type="button"
              key={i}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handleNav(item.route)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 20px', border: 'none',
                background: isActive ? '#FEF2F2' : 'none',
                borderRight: isActive ? '3px solid #8B1A1A' : '3px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit',
                textAlign: isAr ? 'right' : 'left',
                color: isActive ? '#8B1A1A' : '#1A1208',
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                transition: 'background 0.12s, color 0.12s',
                animation: 'mmItem 0.22s cubic-bezier(0.22,1,0.36,1) both',
                animationDelay: `${0.15 + i * 0.04}s`,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#FEF9F9' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none' }}
              onTouchStart={e => { if (!isActive) e.currentTarget.style.background = '#FEF2F2' }}
              onTouchEnd={e => { if (!isActive) e.currentTarget.style.background = 'none' }}
            >
              <span style={{ color: isActive ? '#8B1A1A' : '#9C8E80', flexShrink: 0 }}>{item.icon}</span>
              <span>{isAr ? item.label_ar : item.label_en}</span>
              {isActive && (
                <span style={{ marginRight: 'auto' }}>
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              )}
            </button>
            )
          })}

          {/* Divider */}
          <div style={{ height: 1, background: '#EAE4D9', margin: '8px 20px' }} />

          {/* Language toggle */}
          <button
            type="button"
            onClick={() => { onLangToggle(); onClose() }}
            aria-label={isAr ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
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
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <div style={{ margin: '8px 16px', padding: '12px 14px', background: '#FAFAF8', borderRadius: 12, border: '1px solid #EAE4D9' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', margin: '0 0 9px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              {isAr ? 'تواصل معنا' : 'Contact Us'}
            </p>
            <a href="tel:+9613460608" style={{ display: 'block', fontSize: 12, color: '#8B1A1A', textDecoration: 'none', fontWeight: 600, marginBottom: 5, direction: 'ltr', unicodeBidi: 'isolate' }}>
              +961 3 460 608
            </a>
            <a href="mailto:wissam@aijur.ai" style={{ display: 'block', fontSize: 12, color: '#6B2737', textDecoration: 'none', fontWeight: 500 }}>
              wissam@aijur.ai
            </a>
          </div>
        </div>

        {/* Logout */}
        <div style={{ padding: '12px 16px 24px', borderTop: '1px solid #EAE4D9' }}>
          <button
            type="button"
            onClick={handleLogout}
            onTouchStart={e => { e.currentTarget.style.background = '#FEE2E2' }}
            onTouchEnd={e => { e.currentTarget.style.background = '#FEF2F2' }}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              background: '#FEF2F2', border: '1.5px solid #FECACA',
              color: '#8B1A1A', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.12s',
            }}
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {isAr ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </div>
    </>
  )
}
