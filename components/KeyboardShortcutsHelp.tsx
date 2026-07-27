'use client'

/**
 * KeyboardShortcutsHelp — modal showing all keyboard shortcuts.
 * Opens on `?` key (when not typing in an input).
 *
 * Previously also rendered a persistent `?` FAB in the corner. Removed as
 * part of the UX consolidation pass (UX_AUDIT.md — "one floating button
 * app-wide"): this was a desktop-only power-user feature whose only real
 * discovery path is the `?` key itself (documented in the modal's own
 * footer), so the redundant always-visible button added clutter without
 * adding reach. The keyboard shortcut still works exactly as before.
 */

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { useFocusTrap } from '@/lib/useFocusTrap'

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
  const { isAr, toggleLang } = useLanguage()
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
      // batch #539: the shortcuts list below has always advertised "Alt+L"
      // to toggle Arabic/English, but no handler for it existed anywhere in
      // the codebase (confirmed via a full-repo grep for altKey/'L' checks)
      // -- the modal was documenting a shortcut that silently did nothing.
      // Wired it to the same toggleLang() used by GlobalLangSwitch.tsx.
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        toggleLang()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleLang])

  // batch #517: another real role="dialog" left out of the useFocusTrap.ts
  // audit trail (see MinistryQuickDial's batch #516 fix for the same gap) —
  // Tab could leak past this centered modal into the page behind it.
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, open)

  const categories = ['search', 'chat', 'navigation'] as const

  return (
    <>
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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}
            tabIndex={-1}
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
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
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
                                {ki > 0 && <span style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: '20px' }}>+</span>}
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
              fontSize: 11, color: 'var(--text-3)', textAlign: 'center',
            }}>
              {isAr ? 'دليلك AI — مساعد المعاملات الحكومية اللبنانية' : 'Dalilak AI — Lebanese Government Procedures Assistant'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
