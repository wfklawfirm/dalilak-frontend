'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAdmin, type User } from '@/lib/auth'

interface TopNavProps {
  isAr: boolean
  currentUser: User | null
  messages?: unknown[]
  onLangToggle: () => void
  onNewChat?: () => void
  onMenuOpen?: () => void
  onStartGuide?: () => void
  showGuideBtn?: boolean
}

const NAV_LINKS = [
  { href: '/',           icon: '🏠', ar: 'الرئيسية',  en: 'Home'       },
  { href: '/services',   icon: '⚡', ar: 'الخدمات',   en: 'Services'   },
  { href: '/procedures', icon: '📋', ar: 'المعاملات', en: 'Procedures' },
  { href: '/forms',      icon: '📄', ar: 'النماذج',   en: 'Forms'      },
  { href: '/faq',        icon: '❓', ar: 'أسئلة',     en: 'FAQ'        },
]

export default function TopNav({
  isAr, currentUser, messages = [], onLangToggle,
  onNewChat, onMenuOpen, onStartGuide, showGuideBtn,
}: TopNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const hasChat = messages.length > 0

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: 34, borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.28)',
    background: 'rgba(255,255,255,0.10)', cursor: 'pointer',
    fontFamily: 'inherit', color: '#fff', transition: 'background 0.15s',
    flexShrink: 0,
  }

  return (
    <>
      <style>{`
        .tn-link:hover { background: rgba(255,255,255,0.15) !important; }
        .tn-btn:hover  { background: rgba(255,255,255,0.2) !important; }
        .tn-active     { background: rgba(255,255,255,0.18) !important; border-color: rgba(255,255,255,0.5) !important; }
        @media (max-width: 640px) {
          .tn-links { display: none !important; }
          .tn-desktop-only { display: none !important; }
          .tn-hamburger { display: flex !important; }
          .tn-new-chat-label { display: none !important; }
        }
        @media (min-width: 641px) {
          .tn-hamburger { display: none !important; }
        }
      `}</style>

      <header style={{
        flexShrink: 0,
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 55%, #7a1a1a 100%)',
        boxShadow: '0 2px 16px rgba(107,39,55,0.35)',
      }}>
        <div style={{
          maxWidth: 760, margin: '0 auto',
          padding: '0 14px',
          height: 56,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>

          {/* ── Brand ─────────────────────────────────── */}
          <button
            onClick={() => onNewChat ? onNewChat() : router.push('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
          >
            {/* Logo mark */}
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>⚖️</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.3px' }}>
                دليلك<span style={{ color: '#f5c842', marginRight: 3 }}>AI</span>
              </div>
              <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.2, marginTop: 1 }}>
                {isAr ? 'دليل المواطن اللبناني' : 'Lebanese Citizens Guide'}
              </div>
            </div>
          </button>

          {/* ── Center nav links (desktop) ─────────────── */}
          <nav className="tn-links" style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}>
            {NAV_LINKS.map(link => {
              const active = pathname === link.href
              return (
                <button
                  key={link.href}
                  onClick={() => link.href === '/' && onNewChat ? onNewChat() : router.push(link.href)}
                  className={`tn-link${active ? ' tn-active' : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    height: 32, padding: '0 12px', borderRadius: 9,
                    border: active ? '1.5px solid rgba(255,255,255,0.45)' : '1.5px solid transparent',
                    background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.75)',
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: 13 }}>{link.icon}</span>
                  <span>{isAr ? link.ar : link.en}</span>
                </button>
              )
            })}
          </nav>

          {/* ── Spacer on mobile ──────────────────────── */}
          <div style={{ flex: 1 }} className="tn-hamburger" />

          {/* ── Right actions ─────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

            {/* Online indicator — desktop */}
            <div className="tn-desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.15)', borderRadius: 20, padding: '4px 9px', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 5px #4ade80', animation: 'pulse 2.5s infinite' }} />
              <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 600 }}>{isAr ? 'متصل' : 'Online'}</span>
            </div>

            {/* Trial days */}
            {currentUser?.plan === 'trial' && currentUser?.days_left !== undefined && (
              <div className="tn-desktop-only" style={{
                fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 20, padding: '4px 9px',
                color: currentUser.days_left <= 1 ? '#fca5a5' : '#fde68a',
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid ${currentUser.days_left <= 1 ? 'rgba(252,165,165,0.35)' : 'rgba(253,230,138,0.35)'}`,
              }}>
                ⏱️ {currentUser.days_left} {isAr ? 'يوم' : 'd'}
              </div>
            )}

            {/* Start guided flow — only on home with no messages */}
            {showGuideBtn && (
              <button
                onClick={onStartGuide}
                className="tn-btn tn-desktop-only"
                style={{ ...btnBase, gap: 5, padding: '0 12px', fontSize: 11, fontWeight: 600 }}
              >
                <span>🗂️</span>
                <span>{isAr ? 'ابدأ معاملة' : 'Start'}</span>
              </button>
            )}

            {/* New Chat — when in conversation */}
            {hasChat && (
              <button
                onClick={onNewChat}
                className="tn-btn"
                style={{ ...btnBase, gap: 5, padding: '0 12px', fontSize: 11, fontWeight: 600 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                <span className="tn-new-chat-label">{isAr ? 'جديد' : 'New'}</span>
              </button>
            )}

            {/* Language toggle */}
            <button
              onClick={onLangToggle}
              className="tn-btn"
              style={{ ...btnBase, width: 44, fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}
            >
              {isAr ? 'EN' : 'AR'}
            </button>

            {/* Account — desktop */}
            <button
              onClick={() => router.push('/my-files')}
              className="tn-btn tn-desktop-only"
              style={{ ...btnBase, width: 34 }}
              title={isAr ? 'حسابي' : 'Account'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>

            {/* Admin — desktop */}
            {isAdmin() && (
              <button
                onClick={() => router.push('/admin')}
                className="tn-btn tn-desktop-only"
                style={{ ...btnBase, width: 34 }}
                title="Admin"
              >
                <span style={{ fontSize: 14 }}>🛡️</span>
              </button>
            )}

            {/* Hamburger — mobile */}
            <button
              className="tn-hamburger tn-btn"
              onClick={onMenuOpen}
              aria-label={isAr ? 'القائمة' : 'Menu'}
              style={{ ...btnBase, width: 36, flexDirection: 'column', gap: 4, padding: '0 9px' }}
            >
              <span style={{ width: 16, height: 1.5, background: '#fff', borderRadius: 2, display: 'block' }} />
              <span style={{ width: 12, height: 1.5, background: 'rgba(255,255,255,0.7)', borderRadius: 2, display: 'block' }} />
              <span style={{ width: 16, height: 1.5, background: '#fff', borderRadius: 2, display: 'block' }} />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
