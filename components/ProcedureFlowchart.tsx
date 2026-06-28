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
  question: '#6366f1',
  document: '#3b82f6',
  action: '#8B1A1A',
  authority: '#B8860B',
  risk: '#f97316',
  draft: '#8b5cf6',
  human_review: '#ec4899',
  completion: '#22c55e',
  warning: '#ef4444',
}

const NODE_ICONS: Record<NodeType, string> = {
  start: '▶',
  question: '❓',
  document: '📄',
  action: '⚡',
  authority: '🏛️',
  risk: '⚠️',
  draft: '✏️',
  human_review: '👤',
  completion: '✅',
  warning: '🔴',
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
  not_started: '#9CA3AF',
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
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>{isAr ? 'تقدم الإجراء' : 'Procedure Progress'}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: progressPct >= 80 ? '#16a34a' : progressPct >= 50 ? '#B8860B' : '#8B1A1A' }}>{progressPct}%</span>
          </div>
          <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 80 ? '#16a34a' : progressPct >= 50 ? '#B8860B' : '#8B1A1A', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>{isAr ? `${completedCount} مكتمل` : `${completedCount} complete`}</span>
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>{isAr ? `${nodes.length} خطوة` : `${nodes.length} steps`}</span>
          </div>
        </div>
      )}

      {/* Duration badge */}
      {!compact && flowchart.estimatedDurationAr && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF9E7', border: '1px solid #FEF08A', borderRadius: 20, padding: '4px 12px', marginBottom: 16, fontSize: 11.5, color: '#B8860B', fontWeight: 700 }}>
          ⏱️ {isAr ? flowchart.estimatedDurationAr : flowchart.estimatedDurationEn}
        </div>
      )}

      {/* Node list */}
      <div style={{ position: 'relative' }}>
        {nodes.map((node, idx) => {
          const effectiveStatus: NodeStatus = currentNodeId === node.id ? 'current' : (node.status || 'not_started')
          const isCurrent = effectiveStatus === 'current'
          const nodeColor = NODE_COLORS[node.type] || '#6B7280'
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
                  fontSize: compact ? 16 : 20,
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
                    <p style={{ fontSize: 11.5, color: '#6B7280', margin: '0 0 6px', lineHeight: 1.5 }}>
                      {isAr ? node.descriptionAr : (node.descriptionEn || node.descriptionAr)}
                    </p>
                  )}

                  {/* Required documents as pills */}
                  {!compact && node.requiredDocuments && node.requiredDocuments.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {node.requiredDocuments.map((doc, di) => (
                        <span key={di} style={{ fontSize: 9.5, color: '#3b82f6', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '1px 7px' }}>
                          📄 {doc}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Risk level */}
                  {node.riskLevel && node.riskLevel !== 'low' && (
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: node.riskLevel === 'critical' ? '#DC2626' : node.riskLevel === 'high' ? '#ea580c' : '#CA8A04', background: node.riskLevel === 'critical' ? '#FEF2F2' : node.riskLevel === 'high' ? '#FFF7ED' : '#FFFBEB', borderRadius: 6, padding: '1px 7px' }}>
                        ⚠️ {node.riskLevel === 'critical' ? 'خطر حرج' : node.riskLevel === 'high' ? 'خطر عالٍ' : 'خطر متوسط'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector between nodes */}
              {!isLast && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
                  <div style={{ width: 2, height: 16, background: '#EAE4D9' }} />
                  {outgoingEdges.length > 0 && outgoingEdges[0].labelAr && (
                    <div style={{ fontSize: 9.5, color: '#9CA3AF', background: '#F9FAFB', border: '1px solid #EAE4D9', borderRadius: 20, padding: '2px 10px', margin: '2px 0', fontWeight: 600 }}>
                      {isAr ? outgoingEdges[0].labelAr : (outgoingEdges[0].labelEn || outgoingEdges[0].labelAr)}
                    </div>
                  )}
                  <div style={{ width: 2, height: 16, background: '#EAE4D9' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Verification status */}
      {!compact && (
        <div style={{ marginTop: 16, padding: '8px 12px', background: '#FAFAF8', border: '1px solid #F0EBE0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9.5, color: flowchart.verificationStatus === 'verified' ? '#16a34a' : '#B8860B', fontWeight: 700 }}>
            {flowchart.verificationStatus === 'verified' ? '✅ موثّق' : flowchart.verificationStatus === 'partially_verified' ? '🔶 موثّق جزئياً' : '📝 مسودة'}
          </span>
          <span style={{ fontSize: 9.5, color: '#9CA3AF' }}>· v{flowchart.version}</span>
        </div>
      )}
    </div>
  )
}
