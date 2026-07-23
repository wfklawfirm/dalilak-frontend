'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAdmin, type User } from '@/lib/auth'
import { useLanguage } from '@/lib/LanguageContext'
import GlobalSearch from '@/components/GlobalSearch'
import NotificationBell from '@/components/NotificationBell'

interface TopNavProps {
  isAr?: boolean
  currentUser: User | null
  messages?: unknown[]
  onLangToggle?: () => void
  onNewChat?: () => void
  onMenuOpen?: () => void
  onStartGuide?: () => void
  showGuideBtn?: boolean
  /** Pass through to GlobalSearch so search results can trigger AI on homepage */
  onAsk?: (q: string) => void
  /** Pass through to GlobalSearch so journey results open the JourneySheet */
  onJourneySelect?: (slug: string) => void
}

const NAV_LINKS = [
  { href: '/',            ar: 'الرئيسية',  en: 'Home'        },
  { href: '/services',    ar: 'الخدمات',   en: 'Services'    },
  { href: '/procedures',  ar: 'المعاملات', en: 'Procedures'  },
  { href: '/authorities', ar: 'الجهات',    en: 'Authorities' },
  { href: '/forms',       ar: 'النماذج',   en: 'Forms'       },
  { href: '/faq',         ar: 'أسئلة',     en: 'FAQ'         },
]

export default function TopNav({
  currentUser, messages = [], onLangToggle: onLangToggleProp,
  onNewChat, onMenuOpen, onStartGuide, showGuideBtn,
  onAsk, onJourneySelect,
}: TopNavProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const hasChat  = messages.length > 0
  const { isAr, toggleLang } = useLanguage()
  const onLangToggle = onLangToggleProp ?? toggleLang

  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const el = document.getElementById('main-content')
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 8)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        @keyframes tn-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes tn-drop { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

        /* ── Nav link ── */
        .tn-link { transition: background 0.14s, color 0.14s; }
        .tn-link:hover { background: var(--surface-2) !important; color: var(--text-1) !important; }
        .tn-link-active { background: var(--brand-soft) !important; color: var(--brand) !important; }

        /* ── Icon / ghost button ── */
        .tn-ibtn { transition: background 0.14s, color 0.14s, border-color 0.14s; }
        .tn-ibtn:hover { background: var(--surface-2) !important; color: var(--text-1) !important; border-color: var(--border-strong) !important; }

        /* ── CTA button ── */
        .tn-cta { transition: background 0.14s, box-shadow 0.14s, transform 0.14s; }
        .tn-cta:hover { background: var(--brand-hover) !important; box-shadow: var(--shadow-brand-lg) !important; transform: translateY(-1px); }
        .tn-cta:active { transform: scale(0.97) !important; }

        /* ── Scroll shadow ── */
        .tn-scrolled { box-shadow: 0 2px 16px rgba(0,0,0,0.08) !important; }

        /* ── Responsive ── */
        @media (min-width: 768px) {
          .tn-nav-links    { display: flex !important; }
          .tn-desk-only    { display: flex !important; }
          .tn-hamburger    { display: none  !important; }
          .tn-mobile-brand { display: none  !important; }
          .tn-desk-brand   { display: flex  !important; }
        }
        @media (max-width: 767px) {
          .tn-nav-links    { display: none  !important; }
          .tn-desk-only    { display: none  !important; }
          .tn-hamburger    { display: flex  !important; }
          .tn-mobile-brand { display: flex  !important; }
          .tn-desk-brand   { display: none  !important; }
        }
      `}</style>

      <header
        dir={isAr ? 'rtl' : 'ltr'}
        className={scrolled ? 'tn-scrolled' : ''}
        style={{
          flexShrink: 0,
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'none',
          zIndex: 50,
          transition: 'box-shadow 0.22s ease',
          animation: 'tn-drop 0.24s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 clamp(16px,3vw,32px)',
          height: 64,
          display: 'flex', alignItems: 'center', gap: 0,
        }}>

          {/* ══ DESKTOP BRAND ══ */}
          <button
            type="button"
            className="tn-desk-brand"
            aria-label={isAr ? 'الصفحة الرئيسية — دليلك' : 'Home — Dalilak'}
            onClick={() => onNewChat ? onNewChat() : router.push('/')}
            style={{
              display: 'none', alignItems: 'center', gap: 9,
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, flexShrink: 0,
              marginInlineEnd: 32,
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'var(--brand-soft)',
              border: '1px solid var(--brand-ring)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 26, height: 26, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                {isAr ? 'دليلك' : 'Dalilak'}
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 1.5, whiteSpace: 'nowrap' }}>
                {isAr ? 'دليل المواطن اللبناني' : 'Lebanese Citizens Guide'}
              </div>
            </div>
          </button>

          {/* ══ DESKTOP NAV LINKS ══ */}
          <nav
            className="tn-nav-links"
            aria-label={isAr ? 'روابط التنقل' : 'Navigation links'}
            style={{ display: 'none', alignItems: 'center', gap: 2, flex: 1 }}
          >
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
                    height: 36, padding: '0 12px', borderRadius: 8,
                    border: 'none',
                    background: active ? 'var(--brand-soft)' : 'transparent',
                    color: active ? 'var(--brand)' : 'var(--text-2)',
                    fontSize: 13.5, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {isAr ? link.ar : link.en}
                  {active && (
                    <span style={{
                      position: 'absolute', bottom: -1, left: '20%', right: '20%',
                      height: 2, background: 'var(--brand)', borderRadius: 2,
                    }} />
                  )}
                </button>
              )
            })}
          </nav>

          {/* ══ MOBILE: spacer ══ */}
          <div className="tn-mobile-brand" style={{ display: 'none', flex: 1 }} />

          {/* ══ MOBILE BRAND (center) ══ */}
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
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--brand-soft)', border: '1px solid var(--brand-ring)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 22, height: 22, objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.3px', lineHeight: 1 }}>
              {isAr ? 'دليلك' : 'Dalilak'}
            </div>
          </button>

          {/* ══ RIGHT ACTIONS ══ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginInlineStart: 'auto', flexShrink: 0 }}>

            {/* Online dot — desktop */}
            <div className="tn-desk-only" style={{
              display: 'none', alignItems: 'center', gap: 5,
              background: '#f0fdf4', borderRadius: 20,
              padding: '4px 10px', border: '1px solid #bbf7d0',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
                boxShadow: '0 0 5px #22c55e66', animation: 'tn-pulse 2.5s infinite',
              }} />
              <span style={{ fontSize: 10.5, color: '#15803d', fontWeight: 600 }}>
                {isAr ? 'متصل' : 'Online'}
              </span>
            </div>

            {/* Trial badge — desktop */}
            {currentUser?.plan === 'trial' && currentUser?.days_left !== undefined && (
              <div className="tn-desk-only" style={{
                display: 'none', fontSize: 10.5, fontWeight: 700,
                whiteSpace: 'nowrap', borderRadius: 20, padding: '4px 10px',
                color: currentUser.days_left <= 1 ? 'var(--error)' : 'var(--warning)',
                background: currentUser.days_left <= 1 ? 'var(--error-bg)' : 'var(--warning-bg)',
                border: `1px solid ${currentUser.days_left <= 1 ? 'var(--error-border)' : 'var(--warning-border)'}`,
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/>
                  </svg>
                  {currentUser.days_left}{isAr ? ' يوم' : 'd'}
                </span>
              </div>
            )}

            {/* Start guide CTA — desktop, welcome screen */}
            {showGuideBtn && (
              <button
                type="button"
                onClick={onStartGuide}
                className="tn-cta tn-desk-only"
                style={{
                  display: 'none', alignItems: 'center', gap: 6,
                  height: 36, padding: '0 16px', borderRadius: 9,
                  border: 'none',
                  background: 'var(--brand)',
                  color: '#fff', fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-brand)',
                }}
              >
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/>
                </svg>
                {isAr ? 'ابدأ معاملة' : 'Start'}
              </button>
            )}

            {/* Notification Bell */}
            <NotificationBell onAsk={onAsk} />

            {/* Global Search — Cmd+K */}
            <GlobalSearch onAsk={onAsk} onJourneySelect={onJourneySelect} />

            {/* New chat — in conversation */}
            {hasChat && (
              <button
                type="button"
                aria-label={isAr ? 'محادثة جديدة' : 'New conversation'}
                onClick={onNewChat}
                className="tn-ibtn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  height: 34, padding: '0 12px', borderRadius: 9,
                  border: '1.5px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-2)', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                <span className="tn-desk-only" style={{ display: 'none' }}>{isAr ? 'جديد' : 'New'}</span>
              </button>
            )}

            {/* Language toggle */}
            <button
              type="button"
              aria-label={isAr ? 'تغيير اللغة إلى الإنجليزية' : 'Switch to Arabic'}
              onClick={onLangToggle}
              className="tn-ibtn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 40, minWidth: 46, padding: '0 12px', borderRadius: 9,
                border: '1.5px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-2)', fontSize: 11.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.5px',
              }}
            >
              {isAr ? 'EN' : 'AR'}
            </button>

            {/* Account — desktop: shows initials badge + dropdown */}
            <div style={{ position: 'relative' }} className="tn-desk-only">
              <button
                type="button"
                aria-label={isAr ? 'حسابي' : 'My account'}
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 34, minWidth: 34, padding: currentUser ? '0 10px 0 4px' : '0',
                  borderRadius: 9, border: '1.5px solid var(--border)',
                  background: userMenuOpen ? 'var(--surface-2)' : 'transparent',
                  cursor: 'pointer', gap: 6,
                }}
              >
                {currentUser ? (() => {
                  const initials = currentUser.full_name
                    ? currentUser.full_name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                    : currentUser.username?.slice(0, 2).toUpperCase() || '?'
                  return (
                    <>
                      <span style={{
                        width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                        background: 'linear-gradient(135deg, #8F1D2C, #741622)',
                        color: '#fff', fontSize: 10, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        letterSpacing: '0.5px',
                      }}>
                        {initials}
                      </span>
                      <span style={{
                        fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)',
                        maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {currentUser.full_name?.split(' ')[0] || currentUser.username}
                      </span>
                    </>
                  )
                })() : (
                  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                )}
              </button>

              {/* User menu dropdown */}
              {userMenuOpen && (
                <>
                  {/* Backdrop to close */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div
                    dir={isAr ? 'rtl' : 'ltr'}
                    style={{
                      position: 'absolute', top: 40, [isAr ? 'left' : 'right']: 0,
                      width: 200, zIndex: 9999,
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      overflow: 'hidden',
                      animation: 'tn-drop 0.15s ease both',
                    }}
                  >
                    {currentUser && (
                      <div style={{
                        padding: '12px 14px 10px',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>
                          {currentUser.full_name || currentUser.username}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 2 }}>
                          {currentUser.email}
                        </div>
                      </div>
                    )}
                    {[
                      { href: '/my-files', ar: '📁 ملفاتي', en: '📁 My Files' },
                      { href: '/procedures', ar: '📋 المعاملات', en: '📋 Procedures' },
                      { href: '/settings', ar: '⚙️ الإعدادات', en: '⚙️ Settings' },
                    ].map(item => (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => { router.push(item.href); setUserMenuOpen(false) }}
                        style={{
                          display: 'block', width: '100%', padding: '9px 14px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          textAlign: isAr ? 'right' : 'left',
                          fontSize: 12.5, color: 'var(--text-2)', fontFamily: 'inherit',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        {isAr ? item.ar : item.en}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        router.push('/login')
                        setUserMenuOpen(false)
                      }}
                      style={{
                        display: 'block', width: '100%', padding: '9px 14px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: isAr ? 'right' : 'left',
                        fontSize: 12.5, color: '#dc2626', fontFamily: 'inherit',
                        fontWeight: 600,
                      }}
                    >
                      {isAr ? '🚪 تسجيل الخروج' : '🚪 Sign Out'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Admin — desktop */}
            {isAdmin() && (
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="tn-ibtn tn-desk-only"
                aria-label={isAr ? 'لوحة الإدارة' : 'Admin panel'}
                style={{
                  display: 'none', alignItems: 'center', justifyContent: 'center',
                  height: 34, width: 34, borderRadius: 9,
                  border: '1.5px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-2)', cursor: 'pointer',
                }}
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </button>
            )}

            {/* Divider before hamburger */}
            <div className="tn-hamburger" style={{
              display: 'none', width: 1, height: 20,
              background: 'var(--border)', margin: '0 2px',
            }} />

            {/* Hamburger — mobile */}
            <button
              type="button"
              className="tn-ibtn tn-hamburger"
              onClick={onMenuOpen}
              aria-label={isAr ? 'القائمة' : 'Menu'}
              style={{
                display: 'none', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 4.5,
                height: 44, width: 44, borderRadius: 9,
                border: '1.5px solid var(--border)',
                background: 'transparent',
                cursor: 'pointer', transition: 'background 0.12s',
              }}
            >
              <span style={{ width: 15, height: 1.5, background: 'var(--text-1)', borderRadius: 2, display: 'block' }} />
              <span style={{ width: 11, height: 1.5, background: 'var(--text-3)', borderRadius: 2, display: 'block' }} />
              <span style={{ width: 15, height: 1.5, background: 'var(--text-1)', borderRadius: 2, display: 'block' }} />
            </button>

          </div>

        </div>
      </header>
    </>
  )
}
