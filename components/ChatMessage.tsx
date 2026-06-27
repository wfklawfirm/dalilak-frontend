'use client'

import React from 'react'
import AgentResponseRenderer from './AgentResponseRenderer'
import type { AgentSource, ConfidenceLevel } from '@/lib/types'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  /** Sources from SSE meta event */
  sources?: AgentSource[]
  confidence?: ConfidenceLevel
}

export default function ChatMessage({
  msg, isAr, onFollowUp,
}: {
  msg: Message
  isAr?: boolean
  onFollowUp?: (q: string) => void
}) {
  const isUser = msg.role === 'user'
  const ar = isAr !== false

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20,
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      {/* Avatar */}
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: '#fff',
        background: isUser
          ? 'linear-gradient(135deg, #C9982A 0%, #B8860B 100%)'
          : 'linear-gradient(135deg, #8B1A1A 0%, #6B1313 100%)',
        boxShadow: isUser ? '0 2px 6px rgba(201,152,42,0.3)' : '0 2px 6px rgba(139,26,26,0.3)',
      }}>
        {isUser ? (ar ? 'أنت' : 'You') : 'AI'}
      </div>

      {isUser ? (
        <div style={{ maxWidth: '86%', minWidth: 60 }}>
          <div style={{
            padding: '11px 15px', borderRadius: 16,
            borderTopRightRadius: ar ? 4 : 16, borderTopLeftRadius: ar ? 16 : 4,
            background: 'linear-gradient(135deg, #8B1A1A 0%, #6B1313 100%)',
            color: '#fff', fontSize: 13.5, lineHeight: 1.75,
            boxShadow: '0 2px 10px rgba(139,26,26,0.2)',
          }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {msg.content.replace(/^\[.*?\]\n?/, '')}
            </p>
          </div>
        </div>
      ) : (
        <AgentResponseRenderer
          content={msg.content}
          isAr={ar}
          streaming={msg.streaming}
          sources={msg.sources}
          confidence={msg.confidence}
          onFollowUp={onFollowUp}
        />
      )}
    </div>
  )
}
