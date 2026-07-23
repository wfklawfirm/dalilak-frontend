'use client'

/**
 * KeyboardShortcutsHelp — modal showing all keyboard shortcuts.
 * Opens on `?` key (when not typing in an input).
 * Also shows a small `?` button in the bottom-right corner.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Shortcut {
  keys: string[]
  descAr: string
  descEn: string
  category: 'navigation' | 'chat' | 'search'
}

const SHORTCUTS: Shortcut[] = [
  // Search
  { keys: ['⌘', 'K'], descAr: 'فتح البحث الموحّد', descEn: 'Open unified search', category: 'search' },
  { keys: ['/'], descAr: 'فتح البحث (خارج حقل الإدخال)', descEn: 'Open search (when not typing)', category: 'search' },
  { keys: ['Esc'], descAr: 'إغلاق البحث / النوافذ', descEn: 'Close search / modals', category: 'search' },
  // Chat
  { keys: ['Enter'], descAr: 'إرسال الرسالة', descEn: 'Send message', category: 'chat' },
  { keys: ['Shift', 'Enter'], descAr: 'سطر جديد في الرسالة', descEn: 'New line in message', category: 'chat' },
  { keys: ['↑'], descAr: 'تعديل آخر رسالة مُرسَلة', descEn: 'Edit last sent message', category: 'chat' },
  // Navigation
  { keys: ['?'], descAr: 'عرض اختصارات لوحة المفاتيح', descEn: 'Show keyboard shortcuts', category: 'navigation' },
  { keys: ['Alt', 'L'], descAr: 'تبديل اللغة عربي / إنجليزي', descEn: 'Toggle Arabic / English', category: 'navigation' },
]

const CAT_LABEL: Record<string, [string, string]> = {
  search:     ['🔍 البحث', '🔍 Search'],
  chat:       ['💬 المحادثة', '💬 Chat'],
  navigation: ['🧭 التنقل', '🧭 Navigation'],
}

export default function KeyboardShortcutsHelp() {
  const { isAr } = useLanguage()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const categories = ['search', 'chat', 'navigation'] as const

  return (
    <>
      {/* Floating ? button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={isAr ? 'اختصارات لوحة المفاتيح' : 'Keyboard shortcuts'}
        title={isAr ? 'اختصارات لوحة المفاتيح (?)' : 'Keyboard shortcuts (?)'}
        style={{
          position: 'fixed', bottom: 80, [isAr ? 'left' : 'right']: 16,
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text-3)', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'border-color 0.13s, color 0.13s',
          zIndex: 100,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)' }}
      >
        ?
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg)',
              borderRadius: 18,
              border: '1px solid var(--border)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
              width: '100%', maxWidth: 420,
              overflow: 'hidden',
              animation: 'fadeUp 0.18s ease',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
                  ⌨️ {isAr ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>
                  {isAr ? 'اضغط ? في أي وقت لفتح هذه القائمة' : 'Press ? anytime to open this panel'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={isAr ? 'إغلاق' : 'Close'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 18, padding: 4 }}
              >
                ×
              </button>
            </div>

            {/* Shortcuts list */}
            <div style={{ padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {categories.map(cat => {
                const catShortcuts = SHORTCUTS.filter(s => s.category === cat)
                const [labelAr, labelEn] = CAT_LABEL[cat]
                return (
                  <div key={cat}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-3)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isAr ? labelAr : labelEn}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {catShortcuts.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                            {isAr ? s.descAr : s.descEn}
                          </span>
                          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                            {s.keys.map((k, ki) => (
                              <React.Fragment key={ki}>
                                {ki > 0 && <span style={{ fontSize: 10, color: 'var(--text-4)', lineHeight: '20px' }}>+</span>}
                                <kbd style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  minWidth: k.length > 1 ? 'auto' : 22, height: 22,
                                  padding: k.length > 1 ? '0 6px' : '0',
                                  borderRadius: 5, fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                                  background: 'var(--surface-muted)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--text-1)',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                                }}>
                                  {k}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{
              padding: '10px 18px', borderTop: '1px solid var(--border)',
              fontSize: 11, color: 'var(--text-4)', textAlign: 'center',
            }}>
              {isAr ? 'دليلك AI — مساعد المعاملات الحكومية اللبنانية' : 'Dalilak AI — Lebanese Government Procedures Assistant'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
