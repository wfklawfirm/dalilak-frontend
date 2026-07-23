'use client'

/**
 * ChatTypingIndicator — animated three-dot "typing" indicator shown
 * while the AI is generating a response.
 *
 * Shows the Dalilak logo icon + "دليلك يفكر..." / "Dalilak is thinking..."
 * with three bouncing dots animation via CSS keyframes.
 *
 * Usage:
 *   {loading && <ChatTypingIndicator isAr={isAr} />}
 */

import React from 'react'

interface Props {
  isAr: boolean
}

export default function ChatTypingIndicator({ isAr }: Props) {
  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      role="status"
      aria-live="polite"
      aria-label={isAr ? 'دليلك يفكر...' : 'Dalilak is thinking...'}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        marginBottom: 6,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      <style>{`
        @keyframes dalilak-bounce {
          0%, 60%, 100% { transform: translateY(0);  opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'linear-gradient(135deg, #8F1D2C, #B22234)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(143,29,44,0.25)',
      }}>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
      </div>

      {/* Bubble with dots */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: '#F8F8F6', border: '1px solid #E6E2DC',
        borderRadius: 14,
        padding: '8px 14px',
      }}>
        {/* Three bouncing dots */}
        {[0, 1, 2].map(i => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#8F1D2C',
              animation: `dalilak-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
        <span style={{
          fontSize: 10.5, fontWeight: 600, color: '#918B82',
          marginInlineStart: 6,
        }}>
          {isAr ? 'دليلك يفكر...' : 'Dalilak is thinking...'}
        </span>
      </div>
    </div>
  )
}
