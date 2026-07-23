'use client'

/**
 * SaveButton — reusable bookmark toggle for procedures/services/FAQ/journeys.
 * Tracks save state in localStorage via savedItems utility.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { saveItem, unsaveItem, isSaved, type SavedItem } from '@/lib/savedItems'

interface SaveButtonProps {
  item: Omit<SavedItem, 'savedAt'>
  /** 'icon' = just the bookmark icon; 'pill' = icon + label */
  variant?: 'icon' | 'pill'
  size?: 'sm' | 'md'
  onSaveChange?: (saved: boolean) => void
}

export default function SaveButton({
  item, variant = 'icon', size = 'sm', onSaveChange,
}: SaveButtonProps) {
  const { isAr } = useLanguage()
  const [saved, setSaved] = useState(false)
  const [flash, setFlash] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    setSaved(isSaved(item.id))
  }, [item.id])

  const toggle = useCallback(() => {
    const next = !saved
    if (next) {
      saveItem(item)
      setFlash(true)
      setTimeout(() => setFlash(false), 600)
    } else {
      unsaveItem(item.id)
    }
    setSaved(next)
    onSaveChange?.(next)
    // Notify other tabs / panels
    window.dispatchEvent(new CustomEvent('dalilak_saved_change'))
  }, [saved, item, onSaveChange])

  const h = size === 'md' ? 32 : 26
  const iconSize = size === 'md' ? 14 : 12

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={e => { e.stopPropagation(); toggle() }}
        aria-label={saved
          ? (isAr ? 'إزالة من المحفوظات' : 'Remove from saved')
          : (isAr ? 'حفظ' : 'Save')}
        title={saved ? (isAr ? 'محفوظ — انقر للإزالة' : 'Saved — click to remove') : (isAr ? 'حفظ' : 'Save')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          height: h, padding: `0 ${size === 'md' ? 10 : 8}px`,
          borderRadius: 7,
          border: `1px solid ${saved ? 'var(--brand)' : 'var(--border)'}`,
          background: saved ? 'var(--brand-soft)' : 'transparent',
          color: saved ? 'var(--brand)' : 'var(--text-3)',
          fontSize: size === 'md' ? 11.5 : 10.5, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.15s',
          transform: flash ? 'scale(1.12)' : 'scale(1)',
        }}
      >
        <BookmarkIcon size={iconSize} filled={saved} />
        {isAr ? (saved ? 'محفوظ' : 'حفظ') : (saved ? 'Saved' : 'Save')}
      </button>
    )
  }

  // icon variant
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); toggle() }}
      aria-label={saved
        ? (isAr ? 'إزالة من المحفوظات' : 'Remove from saved')
        : (isAr ? 'حفظ' : 'Save')}
      title={saved ? (isAr ? 'محفوظ' : 'Saved') : (isAr ? 'حفظ' : 'Save')}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: h, height: h, borderRadius: 7,
        border: `1px solid ${saved ? 'var(--brand)' : 'var(--border)'}`,
        background: saved ? 'var(--brand-soft)' : 'transparent',
        color: saved ? 'var(--brand)' : 'var(--text-3)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        transform: flash ? 'scale(1.15)' : 'scale(1)',
        flexShrink: 0,
      }}
    >
      <BookmarkIcon size={iconSize} filled={saved} />
    </button>
  )
}

function BookmarkIcon({ size, filled }: { size: number; filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width={size} height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  )
}
