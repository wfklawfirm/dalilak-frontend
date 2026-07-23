'use client'

import React from 'react'
import type { ProcedureFlowchart, ProcedureFlowNode, NodeType, NodeStatus } from '@/lib/knowledgeGraph'

interface Props {
  flowchart: ProcedureFlowchart
  isAr: boolean
  compact?: boolean
  currentNodeId?: string
  // تفاعلية اختيارية: تمرير هذين معاً يجعل كل عقدة قابلة للنقر لتعليمها "منجزة"،
  // ويُحسَب شريط التقدم من completedNodeIds بدل node.status الثابت (lib/useFlowchartProgress.ts)
  completedNodeIds?: string[]
  onToggleNode?: (nodeId: string) => void
}

const NODE_COLORS: Record<NodeType, string> = {
  start: '#8F1D2C',
  question: '#741622',
  document: '#2D1B0E',
  action: '#8F1D2C',
  authority: '#B8860B',
  risk: '#8F1D2C',
  draft: '#6B4226',
  human_review: '#9B4444',
  completion: '#B45309',
  warning: '#8F1D2C',
}

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  start:        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21"/></svg>,
  question:     <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="1" fill="white" stroke="none"/></svg>,
  document:     <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  action:       <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  authority:    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>,
  risk:         <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>,
  draft:        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  human_review: <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  completion:   <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  warning:      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 8v4M12 16h.01"/></svg>,
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

const NODE_LABELS_EN: Record<NodeType, string> = {
  start: 'Start',
  question: 'Question',
  document: 'Document',
  action: 'Action',
  authority: 'Authority',
  risk: 'Risk',
  draft: 'Draft',
  human_review: 'Review',
  completion: 'Complete',
  warning: 'Warning',
}

const STATUS_COLORS: Record<NonNullable<NodeStatus>, string> = {
  not_started: '#918B82',
  current: '#B8860B',
  completed: '#B45309',
  blocked: '#8F1D2C',
  needs_review: '#CA8A04',
}

const STATUS_LABELS_AR: Record<NonNullable<NodeStatus>, string> = {
  not_started: 'لم يبدأ',
  current: 'جارٍ',
  completed: 'مكتمل',
  blocked: 'موقوف',
  needs_review: 'يحتاج مراجعة',
}

const STATUS_LABELS_EN: Record<NonNullable<NodeStatus>, string> = {
  not_started: 'Not started',
  current: 'In progress',
  completed: 'Completed',
  blocked: 'Blocked',
  needs_review: 'Needs review',
}

const CONFIDENCE_COLORS: Record<'low' | 'medium' | 'high', string> = {
  high: '#065F46',
  medium: '#B8860B',
  low: '#8F1D2C',
}

const CONFIDENCE_LABELS_AR: Record<'low' | 'medium' | 'high', string> = {
  high: 'مؤكّد من مصدر',
  medium: 'استنتاج منطقي',
  low: 'غير مؤكّد',
}

const CONFIDENCE_LABELS_EN: Record<'low' | 'medium' | 'high', string> = {
  high: 'Source-verified',
  medium: 'Inferred',
  low: 'Unverified',
}

export default function ProcedureFlowchartComponent({ flowchart, isAr, compact, currentNodeId, completedNodeIds, onToggleNode }: Props) {
  const { nodes, edges } = flowchart
  const interactive = Boolean(onToggleNode)
  const doneSet = interactive ? new Set(completedNodeIds || []) : null
  // أول عقدة غير منجزة تصبح "الحالية" تلقائياً عند تفعيل وضع التتبّع التفاعلي
  const nextActionableId = doneSet ? nodes.find(n => !doneSet.has(n.id))?.id : undefined

  const completedCount = doneSet ? doneSet.size : nodes.filter(n => n.status === 'completed').length
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
        @keyframes pfcNode { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Progress bar */}
      {!compact && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#69645C' }}>{isAr ? 'تقدم الإجراء' : 'Procedure Progress'}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: progressPct >= 80 ? '#78350F' : progressPct >= 50 ? '#B8860B' : '#8F1D2C' }}>{progressPct}%</span>
          </div>
          <div style={{ height: 8, background: '#E6E2DC', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 80 ? 'linear-gradient(90deg, #78350F, #B45309)' : progressPct >= 50 ? 'linear-gradient(90deg, #B8860B, #CA8A04)' : 'linear-gradient(90deg, #741622, #8F1D2C)', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#918B82' }}>{isAr ? `${completedCount} مكتمل` : `${completedCount} complete`}</span>
            <span style={{ fontSize: 10, color: '#918B82' }}>{isAr ? `${nodes.length} خطوة` : `${nodes.length} steps`}</span>
          </div>
        </div>
      )}

      {/* Ungrounded warning — AI-generated map found no matching sources in the knowledge base */}
      {!compact && flowchart.generatedBy === 'ai' && flowchart.groundedInSources === false && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.25)', borderRadius: 12, padding: '10px 13px', marginBottom: 16 }}>
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <p style={{ margin: 0, fontSize: 11.5, color: '#8F1D2C', lineHeight: 1.6 }}>
            {isAr
              ? 'لم يتم العثور على مصادر موثوقة لهذه الخارطة في قاعدة المعرفة — الخطوات تقديرية وغير مؤكّدة. يُنصح بالتحقق من الجهة الرسمية مباشرة.'
              : 'No verified sources were found in the knowledge base for this map — steps are estimates and unverified. Please confirm with the official authority directly.'}
          </p>
        </div>
      )}

      {/* Duration badge */}
      {!compact && flowchart.estimatedDurationAr && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 20, padding: '4px 12px', marginBottom: 16, fontSize: 11.5, color: '#B8860B', fontWeight: 700 }}>
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/></svg>
          {isAr ? flowchart.estimatedDurationAr : flowchart.estimatedDurationEn}
        </div>
      )}

      {/* Node list */}
      <div style={{ position: 'relative' }}>
        {nodes.map((node, idx) => {
          const nodeDone = doneSet?.has(node.id) ?? false
          const effectiveStatus: NodeStatus = doneSet
            ? (nodeDone ? 'completed' : (nextActionableId === node.id ? 'current' : 'not_started'))
            : (currentNodeId === node.id ? 'current' : (node.status || 'not_started'))
          const isCurrent = effectiveStatus === 'current'
          const nodeColor = nodeDone ? '#065F46' : (NODE_COLORS[node.type] || '#69645C')
          const statusColor = STATUS_COLORS[effectiveStatus]
          const outgoingEdges = edgesByFrom[node.id] || []
          const isLast = idx === nodes.length - 1

          const circleIcon = nodeDone
            ? <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            : NODE_ICONS[node.type]

          return (
            <div key={node.id}>
              {/* Node card */}
              <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                background: nodeDone ? '#F5FBF8' : '#fff',
                border: `1.5px solid ${isCurrent ? '#B8860B' : nodeDone ? 'rgba(6,95,70,0.25)' : '#E6E2DC'}`,
                borderRadius: 14,
                padding: compact ? '10px 12px' : '14px 16px',
                animation: isCurrent ? `pulse-border 2s infinite, pfcNode 0.22s cubic-bezier(0.22,1,0.36,1) ${Math.min(idx, 10) * 0.06}s both` : `pfcNode 0.22s cubic-bezier(0.22,1,0.36,1) ${Math.min(idx, 10) * 0.06}s both`,
                position: 'relative',
              }}>
                {/* Circle icon — becomes a toggle button in interactive mode */}
                {interactive ? (
                  <button
                    type="button"
                    onClick={() => onToggleNode!(node.id)}
                    aria-pressed={nodeDone}
                    aria-label={isAr ? (nodeDone ? 'إلغاء تعليم الخطوة كمنجزة' : 'تعليم الخطوة كمنجزة') : (nodeDone ? 'Mark step as not done' : 'Mark step as done')}
                    style={{
                      width: compact ? 36 : 44,
                      height: compact ? 36 : 44,
                      borderRadius: '50%',
                      background: nodeColor,
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 2px 8px ${nodeColor}40`,
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'background 0.15s, transform 0.1s',
                    }}
                    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.92)' }}
                    onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    {circleIcon}
                  </button>
                ) : (
                  <div style={{
                    width: compact ? 36 : 44,
                    height: compact ? 36 : 44,
                    borderRadius: '50%',
                    background: nodeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 2px 8px ${nodeColor}40`,
                  }}>
                    {circleIcon}
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Type label + status badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: nodeColor, background: `${nodeColor}18`, borderRadius: 6, padding: '1px 7px' }}>
                      {isAr ? NODE_LABELS_AR[node.type] : NODE_LABELS_EN[node.type]}
                    </span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: statusColor, background: `${statusColor}15`, borderRadius: 6, padding: '1px 7px' }}>
                      {isAr ? STATUS_LABELS_AR[effectiveStatus] : STATUS_LABELS_EN[effectiveStatus]}
                    </span>
                    {node.confidence && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: CONFIDENCE_COLORS[node.confidence], background: `${CONFIDENCE_COLORS[node.confidence]}15`, borderRadius: 6, padding: '1px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <svg aria-hidden="true" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {isAr ? CONFIDENCE_LABELS_AR[node.confidence] : CONFIDENCE_LABELS_EN[node.confidence]}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p style={{ fontSize: compact ? 12.5 : 13.5, fontWeight: 800, color: '#191713', margin: '0 0 4px', lineHeight: 1.4 }}>
                    {isAr ? node.titleAr : (node.titleEn || node.titleAr)}
                  </p>

                  {/* Description */}
                  {!compact && node.descriptionAr && (
                    <p style={{ fontSize: 11.5, color: '#69645C', margin: '0 0 6px', lineHeight: 1.5 }}>
                      {isAr ? node.descriptionAr : (node.descriptionEn || node.descriptionAr)}
                    </p>
                  )}

                  {/* Required documents as pills */}
                  {!compact && node.requiredDocuments && node.requiredDocuments.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {node.requiredDocuments.map((doc, di) => (
                        <span key={di} style={{ fontSize: 9.5, color: '#8F1D2C', background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.2)', borderRadius: 6, padding: '1px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          {doc}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Evidence — real sources resolved server-side for AI-generated maps */}
                  {!compact && node.sourceRefs && node.sourceRefs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6, paddingTop: 6, borderTop: '1px dashed #E6E2DC' }}>
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#918B82' }}>{isAr ? 'المصادر:' : 'Sources:'}</span>
                      {node.sourceRefs.map((s, si) => (
                        s.website ? (
                          <a key={si} href={s.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10.5, color: '#8F1D2C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            <span style={{ textDecoration: 'underline' }}>{s.title}</span>
                          </a>
                        ) : (
                          <span key={si} style={{ fontSize: 10.5, color: '#69645C' }}>{s.title}</span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div style={{ display: 'flex', paddingRight: compact ? 18 : 22, margin: compact ? '3px 0' : '5px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingRight: compact ? 0 : 0 }}>
                    {outgoingEdges.length > 0 && (outgoingEdges[0].labelAr ?? outgoingEdges[0].labelEn) && (
                      <span style={{ fontSize: 9.5, color: '#918B82', background: '#E6E2DC', padding: '1px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                        {outgoingEdges[0].labelAr ?? outgoingEdges[0].labelEn}
                      </span>
                    )}
                    <svg aria-hidden="true" width="12" height="18" viewBox="0 0 12 18" fill="none">
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
