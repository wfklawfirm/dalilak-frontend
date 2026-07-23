'use client'

/**
 * ChatEmojiReactions — emoji reaction bar on assistant messages.
 *
 * LS key: dalilak_reaction_{msgId}  → emoji string
 * Props: { msgId: string; isAr: boolean }
 *
 * Shows 4 reaction buttons. Selected one is highlighted.
 * Selecting the same emoji again clears it.
 */

import React, { useState, useEffect, useCallback } from 'react'

const EMOJIS = ['👍', '❤️', '💡', '🙏']

interface Props {
  msgId: string
  isAr: boolean
}

function lsKey(id: string) { return `dalilak_reaction_${id}` }

export default function ChatEmojiReactions({ msgId, isAr }: Props) {
  const [mounted, setMounted]     = useState(false)
  const [selected, setSelected]   = useState<string>('')
  const [flash, setFlash]         = useState<string>('')

  useEffect(() => {
    setMounted(true)
    try { setSelected(localStorage.getItem(lsKey(msgId)) ?? '') } catch {}
  }, [msgId])

  const pick = useCallback((emoji: string) => {
    const next = selected === emoji ? '' : emoji
    setSelected(next)
    try { next ? localStorage.setItem(lsKey(msgId), next) : localStorage.removeItem(lsKey(msgId)) } catch {}
    if (next) { setFlash(emoji); setTimeout(() => setFlash(''), 400) }
  }, [selected, msgId])

  if (!mounted) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ display: 'flex', gap: 2, alignItems: 'center' }}
      title={isAr ? 'أضف تفاعلاً' : 'React'}
    >
      {EMOJIS.map(e => (
        <button
          key={e}
          type="button"
          onClick={() => pick(e)}
          style={{
            background: selected === e ? '#FEF3C7' : 'transparent',
            border: selected === e ? '1px solid #F59E0B' : '1px solid transparent',
            borderRadius: 8,
            padding: '2px 5px',
            fontSize: 14,
            cursor: 'pointer',
            lineHeight: 1,
            transition: 'all 0.15s',
            transform: flash === e ? 'scale(1.4)' : 'scale(1)',
            outline: 'none',
          }}
          aria-pressed={selected === e}
          aria-label={e}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
