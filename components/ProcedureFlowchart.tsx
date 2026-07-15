'use client'

import React from 'react'
import type { ProcedureFlowchart, ProcedureFlowNode, NodeType, NodeStatus } from '@/lib/knowledgeGraph'

interface Props {
  flowchart: ProcedureFlowchart
  isAr: boolean
  compact?: boolean
  currentNodeId?: string
}

const NODE_COLORS: Record<NodeType, string> = {
  start: '#22c55e',
  question: '#6b2737',
  document: '#2D1B0E',
  action: '#8B1A1A',
  authority: '#B8860B',
  risk: '#c2592e',
  draft: '#6B4226',
  human_review: '#9B4444',
  completion: '#22c55e',
  warning: '#DC2626',
}

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  start:        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21"/></svg>,
  question:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="1" fill="white" stroke="none"/></svg>,
  document:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  action:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  authority:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>,
  risk:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>,
  draft:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  human_review: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  completion:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  warning:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 8v4M12 16h.01"/></svg>,
}

const NODE_LABELS_AR: Record<NodeType, string> = {
  start: 'بداية',
  question: 'سؤال',
  document: 'مستند',
  action: 'إجراء',
  authority: 'جهة مختصة',
  risk: 'خطر',
  draft: 'مسودة',
  human_review: 'مراجعة',
  completion: 'اكتمال',
  warning: 'تحذير',
}

const STATUS_COLORS: Record<NonNullable<NodeStatus>, string> = {
  not_started: '#9C8E80',
  current: '#B8860B',
  completed: '#16a34a',
  blocked: '#DC2626',
  needs_review: '#CA8A04',
}

const STATUS_LABELS_AR: Record<NonNullable<NodeStatus>, string> = {
  not_started: 'لم يبدأ',
  current: 'جارٍ',
  completed: 'مكتمل',
  blocked: 'موقوف',
  needs_review: 'يحتاج مراجعة',
}

export default function ProcedureFlowchartComponent({ flowchart, isAr, compact, currentNodeId }: Props) {
  const { nodes, edges } = flowchart

  const completedCount = nodes.filter(n => n.status === 'completed').length
  const progressPct = nodes.length > 0 ? Math.round((completedCount / nodes.length) * 100) : 0

  // Build edge map: from node id -> edge (for connector labels)
  const edgesByFrom: Record<string, typeof edges[0][]> = {}
  for (const edge of edges) {
    if (!edgesByFrom[edge.from]) edgesByFrom[edge.from] = []
    edgesByFrom[edge.from].push(edge)
  }

  return (
    <div style={{ fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(184,134,11,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(184,134,11,0); }
        }
      `}</style>

      {/* Progress bar */}
      {!compact && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#5C4A3A' }}>{isAr ? 'تقدم الإجراء' : 'Procedure Progress'}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: progressPct >= 80 ? '#16a34a' : progressPct >= 50 ? '#B8860B' : '#8B1A1A' }}>{progressPct}%</span>
          </div>
          <div style={{ height: 8, background: '#EAE4D9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 80 ? '#16a34a' : progressPct >= 50 ? '#B8860B' : '#8B1A1A', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#9C8E80' }}>{isAr ? `${completedCount} مكتمل` : `${completedCount} complete`}</span>
            <span style={{ fontSize: 10, color: '#9C8E80' }}>{isAr ? `${nodes.length} خطوة` : `${nodes.length} steps`}</span>
          </div>
        </div>
      )}

      {/* Duration badge */}
      {!compact && flowchart.estimatedDurationAr && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF9E7', border: '1px solid #FEF08A', borderRadius: 20, padding: '4px 12px', marginBottom: 16, fontSize: 11.5, color: '#B8860B', fontWeight: 700 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/></svg>
          {isAr ? flowchart.estimatedDurationAr : flowchart.estimatedDurationEn}
        </div>
      )}

      {/* Node list */}
      <div style={{ position: 'relative' }}>
        {nodes.map((node, idx) => {
          const effectiveStatus: NodeStatus = currentNodeId === node.id ? 'current' : (node.status || 'not_started')
          const isCurrent = effectiveStatus === 'current'
          const nodeColor = NODE_COLORS[node.type] || '#5C4A3A'
          const statusColor = STATUS_COLORS[effectiveStatus]
          const outgoingEdges = edgesByFrom[node.id] || []
          const isLast = idx === nodes.length - 1

          return (
            <div key={node.id}>
              {/* Node card */}
              <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                background: '#fff',
                border: `1.5px solid ${isCurrent ? '#B8860B' : '#EAE4D9'}`,
                borderRadius: 14,
                padding: compact ? '10px 12px' : '14px 16px',
                animation: isCurrent ? 'pulse-border 2s infinite' : 'none',
                position: 'relative',
              }}>
                {/* Circle icon */}
                <div style={{
                  width: compact ? 36 : 44,
                  height: compact ? 36 : 44,
                  borderRadius: '50%',
                  background: nodeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 2px 8px ${nodeColor}40`,
                }}>
                  {NODE_ICONS[node.type]}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Type label + status badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: nodeColor, background: `${nodeColor}18`, borderRadius: 6, padding: '1px 7px' }}>
                      {isAr ? NODE_LABELS_AR[node.type] : node.type.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: statusColor, background: `${statusColor}15`, borderRadius: 6, padding: '1px 7px' }}>
                      {STATUS_LABELS_AR[effectiveStatus]}
                    </span>
                  </div>

                  {/* Title */}
                  <p style={{ fontSize: compact ? 12.5 : 13.5, fontWeight: 800, color: '#1A1208', margin: '0 0 4px', lineHeight: 1.4 }}>
                    {isAr ? node.titleAr : (node.titleEn || node.titleAr)}
                  </p>

                  {/* Description */}
                  {!compact && node.descriptionAr && (
                    <p style={{ fontSize: 11.5, color: '#5C4A3A', margin: '0 0 6px', lineHeight: 1.5 }}>
                      {isAr ? node.descriptionAr : (node.descriptionEn || node.descriptionAr)}
                    </p>
                  )}

                  {/* Required documents as pills */}
                  {!compact && node.requiredDocuments && node.requiredDocuments.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {node.requiredDocuments.map((doc, di) => (
                        <span key={di} style={{ fontSize: 9.5, color: '#8B1A1A', background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)', borderRadius: 6, padding: '1px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          {doc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div style={{ display: 'flex', paddingRight: compact ? 18 : 22, margin: compact ? '3px 0' : '5px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingRight: compact ? 0 : 0 }}>
                    {outgoingEdges.length > 0 && outgoingEdges[0].label && (
                      <span style={{ fontSize: 9.5, color: '#9C8E80', background: '#F4F0EB', padding: '1px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                        {outgoingEdges[0].label}
                      </span>
                    )}
                    <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
                      <path d="M6 0v12M3 10l3 6 3-6" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
