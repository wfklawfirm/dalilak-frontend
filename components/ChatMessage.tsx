'use client'

import React from 'react'
import AgentResponseRenderer from './AgentResponseRenderer'
import UniversalDocumentAnalysisView from './DocumentIntelligenceView'
import type { AgentSource, ConfidenceLevel } from '@/lib/types'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  /** Sources from SSE meta event */
  sources?: AgentSource[]
  confidence?: ConfidenceLevel
  /** Universal document analysis result */
  documentAnalysis?: import('@/lib/documentIntelligence').UniversalDocumentAnalysis
}

export default function ChatMessage({
  msg, isAr, onFollowUp, onSendMessage, onUploadFile, onStartFlow, question,
}: {
  msg: Message
  isAr?: boolean
  onFollowUp?: (q: string) => void
  onSendMessage?: (q: string) => void
  onUploadFile?: () => void
  onStartFlow?: (slug: string) => void
  question?: string
}) {
  const isUser = msg.role === 'user'
  const ar = isAr !== false

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20,
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      {/* Avatar */}
      {isUser ? (
        <div style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
          background: 'linear-gradient(135deg, #C9982A 0%, #B8860B 100%)',
          boxShadow: '0 2px 6px rgba(201,152,42,0.3)',
        }}>
          {ar ? 'أنت' : 'You'}
        </div>
      ) : (
        <div style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
          background: '#fff',
          border: '1.5px solid rgba(139,26,26,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(139,26,26,0.15)',
          overflow: 'hidden',
        }}>
          <img src="/logo.PNG" alt="دليلك" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        </div>
      )}

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
      ) : msg.documentAnalysis ? (
        /* ── Document Intelligence View ── */
        <div style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
          <UniversalDocumentAnalysisView
            analysis={msg.documentAnalysis}
            isAr={ar}
            onSendMessage={onSendMessage ?? onFollowUp ?? (() => {})}
            onStartFlow={onStartFlow}
            onUploadFile={onUploadFile}
          />
        </div>
      ) : (
        <AgentResponseRenderer
          content={msg.content}
          isAr={ar}
          streaming={msg.streaming}
          sources={msg.sources}
          confidence={msg.confidence}
          onFollowUp={onFollowUp}
          question={question}
        />
      )}
    </div>
  )
}
