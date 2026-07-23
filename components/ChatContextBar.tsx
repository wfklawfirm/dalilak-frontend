'use client'

/**
 * ChatContextBar — thin bar above the chat input showing active context chips.
 *
 * Context items that can be active:
 *   - Active procedure being discussed (from sessionStorage dalilak_active_proc)
 *   - Active ministry filter (from sessionStorage dalilak_active_ministry)
 *   - Active life journey (from sessionStorage dalilak_active_journey)
 *   - Current AI mode (detailed / normal)
 *
 * Each chip is dismissible (clears the sessionStorage key).
 * Emits a custom event 'dalilak_context_change' when items are cleared.
 * Hidden when no active context chips.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const SS_PROC     = 'dalilak_active_proc'
const SS_MINISTRY = 'dalilak_active_ministry'
const SS_JOURNEY  = 'dalilak_active_journey'

export interface ContextChip {
  key: string
  ssKey: string
  icon: string
  labelAr: string
  labelEn: string
  color: string
  bgColor: string
  borderColor: string
}

interface Props {
  /** Current AI mode — shown as a non-dismissible chip */
  mode?: string
  modeAr?: string
  modeEn?: string
}

function readChips(): ContextChip[] {
  const chips: ContextChip[] = []
  try {
    const proc = sessionStorage.getItem(SS_PROC)
    if (proc) {
      chips.push({
        key: SS_PROC,
        ssKey: SS_PROC,
        icon: '📋',
        labelAr: `معاملة: ${proc}`,
        labelEn: `Procedure: ${proc}`,
        color: '#7c2d12',
        bgColor: 'rgba(143,29,44,0.08)',
        borderColor: 'rgba(143,29,44,0.2)',
      })
    }

    const ministry = sessionStorage.getItem(SS_MINISTRY)
    if (ministry) {
      chips.push({
        key: SS_MINISTRY,
        ssKey: SS_MINISTRY,
        icon: '🏛️',
        labelAr: ministry,
        labelEn: ministry,
        color: '#1e40af',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      })
    }

    const journey = sessionStorage.getItem(SS_JOURNEY)
    if (journey) {
      chips.push({
        key: SS_JOURNEY,
        ssKey: SS_JOURNEY,
        icon: '🗺️',
        labelAr: `رحلة: ${journey}`,
        labelEn: `Journey: ${journey}`,
        color: '#065F46',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
      })
    }
  } catch {}
  return chips
}

export default function ChatContextBar({ mode, modeAr, modeEn }: Props) {
  const { isAr } = useLanguage()
  const [chips, setChips] = useState<ContextChip[]>([])
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(() => {
    setChips(readChips())
  }, [])

  useEffect(() => {
    setMounted(true)
    refresh()

    // Listen for storage changes and custom context change events
    window.addEventListener('storage', refresh)
    window.addEventListener('dalilak_context_change', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('dalilak_context_change', refresh)
    }
  }, [refresh])

  function dismissChip(ssKey: string) {
    try { sessionStorage.removeItem(ssKey) } catch {}
    window.dispatchEvent(new Event('dalilak_context_change'))
    refresh()
  }

  if (!mounted) return null

  // Nothing to show if no chips and no mode
  if (chips.length === 0 && !mode) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        padding: '5px 12px 5px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        animation: 'fadeUp 0.15s ease both',
      }}
    >
      {/* Mode chip (non-dismissible) */}
      {mode && (modeAr || modeEn) && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 6,
          background: 'rgba(143,29,44,0.08)',
          border: '1px solid rgba(143,29,44,0.2)',
          fontSize: 10, fontWeight: 700, color: '#8F1D2C',
        }}>
          ⚙️ {isAr ? (modeAr || mode) : (modeEn || mode)}
        </span>
      )}

      {/* Context chips */}
      {chips.map(chip => (
        <span
          key={chip.key}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 4px 2px 8px', borderRadius: 6,
            background: chip.bgColor,
            border: `1px solid ${chip.borderColor}`,
            fontSize: 10, fontWeight: 600, color: chip.color,
            maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          <span style={{ flexShrink: 0 }}>{chip.icon}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isAr ? chip.labelAr : chip.labelEn}
          </span>
          <button
            type="button"
            aria-label={isAr ? 'إزالة' : 'Remove'}
            onClick={() => dismissChip(chip.ssKey)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: chip.color, fontSize: 12, lineHeight: 1,
              padding: '0 2px', flexShrink: 0, opacity: 0.7,
            }}
          >
            ×
          </button>
        </span>
      ))}

      {/* Label hint */}
      <span style={{ fontSize: 9.5, color: 'var(--text-4)', marginInlineStart: 'auto', whiteSpace: 'nowrap' }}>
        {isAr ? 'السياق النشط' : 'Active context'}
      </span>
    </div>
  )
}

/**
 * Helper to set active procedure context (call from procedure detail views)
 */
export function setActiveProcedureContext(titleAr: string) {
  try { sessionStorage.setItem(SS_PROC, titleAr) } catch {}
  window.dispatchEvent(new Event('dalilak_context_change'))
}

/**
 * Helper to set active ministry context
 */
export function setActiveMinistryContext(ministry: string) {
  try { sessionStorage.setItem(SS_MINISTRY, ministry) } catch {}
  window.dispatchEvent(new Event('dalilak_context_change'))
}

/**
 * Helper to set active journey context
 */
export function setActiveJourneyContext(title: string) {
  try { sessionStorage.setItem(SS_JOURNEY, title) } catch {}
  window.dispatchEvent(new Event('dalilak_context_change'))
}
