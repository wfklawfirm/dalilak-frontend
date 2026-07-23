'use client'

/**
 * FloatingHelpButton — Floating action button for emergency contacts + quick help.
 *
 * Shows a ❓ FAB (bottom-left). On click expands to:
 *   - Lebanese emergency numbers (112, 140, 175, 1735)
 *   - Link to /faq
 *   - "Ask Dalilak" button
 *
 * Persists open/closed state in sessionStorage.
 * Closes on Escape or outside click.
 */

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface EmergencyEntry {
  icon: string
  nameAr: string
  nameEn: string
  number: string
  color: string
}

const EMERGENCY: EmergencyEntry[] = [
  { icon: '🚨', nameAr: 'طوارئ عامة',       nameEn: 'General Emergency', number: '112',  color: '#dc2626' },
  { icon: '🚑', nameAr: 'إسعاف',            nameEn: 'Ambulance',         number: '140',  color: '#059669' },
  { icon: '🚒', nameAr: 'إطفاء',            nameEn: 'Fire Brigade',      number: '175',  color: '#d97706' },
  { icon: '🛡️', nameAr: 'قوى الأمن',       nameEn: 'Internal Security', number: '1735', color: '#1a56db' },
  { icon: '⚡', nameAr: 'كهرباء',           nameEn: 'Electricity',       number: '1480', color: '#7c3aed' },
  { icon: '💧', nameAr: 'مياه',             nameEn: 'Water Authority',   number: '1650', color: '#0891b2' },
]

interface Props {
  onAsk?: (q: string) => void
}

export default function FloatingHelpButton({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  if (!mounted) return null

  const side = isAr ? 'right' : 'left'

  return (
    <div
      ref={panelRef}
      dir={isAr ? 'rtl' : 'ltr'}
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 80,
        [side]: 14,
        zIndex: 8500,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: isAr ? 'flex-end' : 'flex-start',
        gap: 8,
      }}
    >
      {/* FAB toggle button */}
      <button
        ref={btnRef}
        type="button"
        aria-label={isAr ? 'مساعدة سريعة' : 'Quick Help'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: open ? '#8F1D2C' : '#fff',
          border: `2px solid ${open ? '#8F1D2C' : '#D5CEC4'}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 18,
          transition: 'all 0.18s ease',
          color: open ? '#fff' : '#4B3B3B',
          flexShrink: 0,
        }}
      >
        {open ? '×' : '?'}
      </button>

      {/* Expanded panel */}
      {open && (
        <div
          role="dialog"
          aria-label={isAr ? 'أرقام الطوارئ والمساعدة' : 'Emergency & Help'}
          style={{
            background: '#fff',
            border: '1px solid #E6E2DC',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
            width: 230,
            overflow: 'hidden',
            animation: 'fadeUp 0.15s ease both',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '10px 14px 8px',
            background: '#8F1D2C',
            color: '#fff',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              {isAr ? '🚨 أرقام الطوارئ' : '🚨 Emergency Numbers'}
            </div>
            <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
              {isAr ? 'متاحة 24 ساعة' : 'Available 24/7'}
            </div>
          </div>

          {/* Emergency numbers */}
          <div style={{ padding: '6px 0' }}>
            {EMERGENCY.map(entry => (
              <a
                key={entry.number}
                href={`tel:${entry.number}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 14px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F8F5F2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{entry.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#1A1A2E' }}>
                    {isAr ? entry.nameAr : entry.nameEn}
                  </div>
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 800, color: entry.color,
                  fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                  letterSpacing: '0.02em',
                }}>
                  {entry.number}
                </span>
              </a>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#E6E2DC', margin: '4px 0' }} />

          {/* Quick actions */}
          <div style={{ padding: '6px 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a
              href="/faq"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 9,
                background: '#F8F5F2', border: '1px solid #E6E2DC',
                textDecoration: 'none', color: '#4B3B3B', fontSize: 12, fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 15 }}>❓</span>
              {isAr ? 'الأسئلة الشائعة' : 'Browse FAQ'}
            </a>

            {onAsk && (
              <button
                type="button"
                onClick={() => {
                  onAsk(isAr ? 'كيف يمكنني استخدام دليلك؟' : 'How can I use Dalilak?')
                  setOpen(false)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 9,
                  background: 'rgba(143,29,44,0.07)', border: '1px solid rgba(143,29,44,0.15)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#8F1D2C',
                  fontFamily: 'inherit', width: '100%',
                }}
              >
                <span style={{ fontSize: 15 }}>💬</span>
                {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
