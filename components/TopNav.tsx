'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAdmin, type User } from '@/lib/auth'
import { useLanguage } from '@/lib/LanguageContext'

interface TopNavProps {
  // isAr و onLangToggle أصبحا اختياريين — إن لم يُمرَّرا، يقرأ المكوّن اللغة
  // المشتركة مباشرة من LanguageContext (حتى لا تُضطر كل صفحة لتمرير حالة لغة
  // محلية خاصة بها، وهو ما كان يسبب رجوع اللغة للعربية عند تغيير الصفحة).
  isAr?: boolean
  currentUser: User | null
  messages?: unknown[]
  onLangToggle?: () => void
  onNewChat?: () => void
  onMenuOpen?: () => void
  onStartGuide?: () => void
  showGuideBtn?: boolean
}

const NAV_LINKS = [
  { href: '/',           ar: 'الرئيسية',  en: 'Home'       },
  { href: '/services',   ar: 'الخدمات',   en: 'Services'   },
  { href: '/procedures', ar: 'المعاملات', en: 'Procedures' },
  { href: '/forms',      ar: 'النماذج',   en: 'Forms'      },
  { href: '/faq',        ar: 'أسئلة',     en: 'FAQ'        },
]

export default function TopNav({
  isAr: isArProp, currentUser, messages = [], onLangToggle: onLangToggleProp,
  onNewChat, onMenuOpen, onStartGuide, showGuideBtn,
}: TopNavProps) {
  const router  = useRouter()
  const pathname = usePathname()
  const hasChat  = messages.length > 0
  const { isAr: ctxIsAr, toggleLang } = useLanguage()
  const isAr = isArProp ?? ctxIsAr
  const onLangToggle = onLangToggleProp ?? toggleLang

  return (
    <>
      <style>{`
        @keyframes tn-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes tn-drop { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        /* ── Nav link hover ── */
        .tn-link { transition: background 0.14s, color 0.14s; }
        .tn-link:hover { background: rgba(255,255,255,0.13) !important; color: #fff !important; }
        .tn-link-active { background: rgba(255,255,255,0.17) !important; }

        /* ── Icon button hover ── */
        .tn-ibtn { transition: background 0.14s; }
        .tn-ibtn:hover { background: rgba(255,255,255,0.20) !important; }

        /* ── Responsive breakpoint ── */
        @media (min-width: 768px) {
          .tn-nav-links  { display: flex !important; }
          .tn-desk-only  { display: flex !important; }
          .tn-hamburger  { display: none  !important; }
          .tn-mobile-brand { display: none !important; }
          .tn-desk-brand { display: flex !important; }
        }
        @media (max-width: 767px) {
          .tn-nav-links  { display: none  !important; }
          .tn-desk-only  { display: none  !important; }
          .tn-hamburger  { display: flex  !important; }
          .tn-mobile-brand { display: flex !important; }
          .tn-desk-brand { display: none  !important; }
          .tn-lang-btn   { display: none  !important; }
        }
      `}</style>

      <header style={{
        flexShrink: 0,
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(80,10,10,0.35)',
        zIndex: 50,
        animation: 'tn-drop 0.28s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{
          maxWidth: 960, margin: '0 auto',
          padding: '0 16px',
          height: 58,
          display: 'flex', alignItems: 'center', gap: 0,
        }}>

          {/* ══ DESKTOP BRAND (left) ══════════════════════════════════ */}
          <button
            type="button"
            className="tn-desk-brand"
            aria-label={isAr ? 'الصفحة الرئيسية — دليلك' : 'Home — Dalilak'}
            onClick={() => onNewChat ? onNewChat() : router.push('/')}
            style={{
              display: 'none',
              alignItems: 'center', gap: 9,
              background: 'none', border: 'none',
              cursor: 'pointer', padding: '0 0', flexShrink: 0,
              marginInlineEnd: 28,
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 26, height: 26, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <div style={{
                fontSize: 16, fontWeight: 900, color: '#fff',
                lineHeight: 1, letterSpacing: '-0.3px', whiteSpace: 'nowrap',
              }}>
                دليلك
              </div>
              <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', marginTop: 1.5, whiteSpace: 'nowrap' }}>
                {isAr ? 'دليل المواطن اللبناني' : 'Lebanese Citizens Guide'}
              </div>
            </div>
          </button>

          {/* ══ DESKTOP NAV LINKS (center-left) ═════════════════════ */}
          <nav className="tn-nav-links" aria-label={isAr ? 'روابط التنقل' : 'Navigation links'} style={{ display: 'none', alignItems: 'center', gap: 2, flex: 1 }}>
            {NAV_LINKS.map(link => {
              const active = pathname === link.href
              return (
                <button
                  key={link.href}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => link.href === '/' && onNewChat ? onNewChat() : router.push(link.href)}
                  className={`tn-link${active ? ' tn-link-active' : ''}`}
                  style={{
                    height: 34, padding: '0 13px', borderRadius: 8,
                    border: 'none',
                    background: active ? 'rgba(255,255,255,0.17)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.68)',
                    fontSize: 12.5, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {isAr ? link.ar : link.en}
                  {active && (
                    <span style={{
                      position: 'absolute', bottom: 0, left: '20%', right: '20%',
                      height: 2, background: 'rgba(255,255,255,0.75)', borderRadius: 2,
                    }} />
                  )}
                </button>
              )
            })}
          </nav>

          {/* ══ MOBILE: left gap ═════════════════════════════════════ */}
          <div className="tn-mobile-brand" style={{ display: 'none', flex: 1 }} />

          {/* ══ MOBILE BRAND (center, absolute) ═════════════════════ */}
          <button
            type="button"
            className="tn-mobile-brand"
            aria-label={isAr ? 'الصفحة الرئيسية — دليلك' : 'Home — Dalilak'}
            onClick={() => onNewChat ? onNewChat() : router.push('/')}
            style={{
              display: 'none',
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{
              fontSize: 17, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.3px', lineHeight: 1,
            }}>
              دليلك
            </div>
          </button>

          {/* ══ RIGHT ACTIONS ════════════════════════════════════════ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginInlineStart: 'auto', flexShrink: 0 }}>

            {/* Online pill — desktop */}
            <div className="tn-desk-only" style={{
              display: 'none', alignItems: 'center', gap: 5,
              background: 'rgba(34,197,94,0.12)', borderRadius: 20,
              padding: '4px 10px', border: '1px solid rgba(34,197,94,0.25)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#4ade80',
                boxShadow: '0 0 6px #4ade80', animation: 'tn-pulse 2.5s infinite',
              }} />
              <span style={{ fontSize: 10.5, color: '#4ade80', fontWeight: 600 }}>
                {isAr ? 'متصل' : 'Online'}
              </span>
            </div>

            {/* Trial badge — desktop */}
            {currentUser?.plan === 'trial' && currentUser?.days_left !== undefined && (
              <div className="tn-desk-only" style={{
                display: 'none', fontSize: 10.5, fontWeight: 700,
                whiteSpace: 'nowrap', borderRadius: 20, padding: '4px 10px',
                color: currentUser.days_left <= 1 ? '#fca5a5' : '#fde68a',
                background: 'rgba(255,255,255,0.07)',
                border: `1px solid ${currentUser.days_left <= 1 ? 'rgba(252,165,165,0.3)' : 'rgba(253,230,138,0.3)'}`,
              }}>
                <span style={{display:'inline-flex',alignItems:'center',gap:4}}><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/></svg>{currentUser.days_left}{isAr ? ' يوم' : 'd'}</span>
              </div>
            )}

            {/* Start guide CTA — desktop, welcome screen */}
            {showGuideBtn && (
              <button
                type="button"
                onClick={onStartGuide}
                className="tn-ibtn tn-desk-only"
                style={{
                  display: 'none', alignItems: 'center', gap: 5,
                  height: 32, padding: '0 13px', borderRadius: 9,
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  background: 'rgba(255,255,255,0.09)',
                  color: '#fff', fontSize: 11.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/>
                </svg>
                {isAr ? 'ابدأ معاملة' : 'Start'}
              </button>
            )}

            {/* New chat — in conversation */}
            {hasChat && (
              <button
                type="button"
                aria-label={isAr ? 'محادثة جديدة' : 'New conversation'}
                onClick={onNewChat}
                className="tn-ibtn"
                onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
                onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  height: 32, padding: '0 12px', borderRadius: 9,
                  border: '1.5px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.09)',
                  color: '#fff', fontSize: 11.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
                }}
              >
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                <span style={{ display: 'none' }} className="tn-desk-only">{isAr ? 'جديد' : 'New'}</span>
              </button>
            )}

            {/* Language toggle */}
            <button
              type="button"
              aria-label={isAr ? 'تغيير اللغة إلى الإنجليزية' : 'Switch to Arabic'}
              onClick={onLangToggle}
              className="tn-ibtn tn-lang-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 32, width: 46, borderRadius: 9,
                border: '1.5px solid rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.09)',
                color: '#fff', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.5px',
              }}
            >
              {isAr ? 'EN' : 'AR'}
            </button>

            {/* Account — desktop */}
            <button
              type="button"
              onClick={() => router.push('/my-files')}
              className="tn-ibtn tn-desk-only"
              aria-label={isAr ? 'حسابي' : 'My account'}
              title={isAr ? 'حسابي' : 'Account'}
              style={{
                display: 'none', alignItems: 'center', justifyContent: 'center',
                height: 32, width: 32, borderRadius: 9,
                border: '1.5px solid rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.09)',
                color: '#fff', cursor: 'pointer',
              }}
            >
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>

            {/* Admin — desktop */}
            {isAdmin() && (
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="tn-ibtn tn-desk-only"
                aria-label={isAr ? 'لوحة الإدارة' : 'Admin panel'}
                style={{
                  display: 'none', alignItems: 'center', justifyContent: 'center',
                  height: 32, width: 32, borderRadius: 9,
                  border: '1.5px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.09)',
                  color: '#fff', cursor: 'pointer',
                }}
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </button>
            )}

            {/* Divider — desktop only, before hamburger boundary */}
            <div className="tn-hamburger" style={{
              display: 'none', width: 1, height: 20,
              background: 'rgba(255,255,255,0.18)', margin: '0 2px',
            }} />

            {/* Hamburger — mobile */}
            <button
              type="button"
              className="tn-ibtn tn-hamburger"
              onClick={onMenuOpen}
              onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
              onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
              aria-label={isAr ? 'القائمة' : 'Menu'}
              style={{
                display: 'none', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 4.5,
                height: 34, width: 36, borderRadius: 9,
                border: '1.5px solid rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.09)',
                cursor: 'pointer', transition: 'background 0.12s',
              }}
            >
              <span style={{ width: 15, height: 1.5, background: '#fff', borderRadius: 2, display: 'block' }} />
              <span style={{ width: 11, height: 1.5, background: 'rgba(255,255,255,0.65)', borderRadius: 2, display: 'block' }} />
              <span style={{ width: 15, height: 1.5, background: '#fff', borderRadius: 2, display: 'block' }} />
            </button>
          </div>

        </div>
      </header>
    </>
  )
}
