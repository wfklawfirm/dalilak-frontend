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
          background: 'linear-gradient(135deg, #C9982A 0%, #B8860B 100%)',
          boxShadow: '0 2px 6px rgba(201,152,42,0.3)',
        }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
      ) : (
        <div style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
          background: '#fff',
          border: '1.5px solid rgba(143,29,44,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(143,29,44,0.15)',
          overflow: 'hidden',
        }}>
          <img src="/logo-icon.png" alt="دليلك" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        </div>
      )}

      {isUser ? (
        <div style={{ maxWidth: '86%', minWidth: 60 }}>
          <div style={{
            padding: '11px 15px', borderRadius: 16,
            borderTopRightRadius: ar ? 4 : 16, borderTopLeftRadius: ar ? 16 : 4,
            background: 'linear-gradient(135deg, #8F1D2C 0%, #741622 100%)',
            color: '#fff', fontSize: 13.5, lineHeight: 1.75,
            boxShadow: '0 2px 10px rgba(143,29,44,0.2)',
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
            onSend={onSendMessage ?? onFollowUp ?? (() => {})}
          />
        </div>
      ) : (
        /* ── AI response card ── */
        <div style={{
          flex: 1, minWidth: 0, maxWidth: '100%',
          background: '#fff',
          borderRadius: 18, borderTopLeftRadius: ar ? 4 : 18, borderTopRightRadius: ar ? 18 : 4,
          border: '1px solid rgba(210,195,178,0.5)',
          boxShadow: '0 1px 8px rgba(100,60,20,0.06), 0 0.5px 1px rgba(0,0,0,0.04)',
          padding: '13px 15px 10px',
        }}>
          <AgentResponseRenderer
            content={msg.content}
            isAr={ar}
            streaming={msg.streaming}
            sources={msg.sources}
            confidence={msg.confidence}
            onFollowUp={onFollowUp}
            question={question}
          />
        </div>
      )}
    </div>
  )
}
