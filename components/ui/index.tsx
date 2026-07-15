'use client'

import React, { useState } from 'react'

// ── PageHeader ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  icon?: string
  titleAr: string
  titleEn?: string
  subtitleAr?: string
  subtitleEn?: string
  isAr: boolean
  onBack?: () => void
  rightSlot?: React.ReactNode
}

export function PageHeader({ icon: _icon, titleAr, titleEn, subtitleAr, subtitleEn, isAr, onBack, rightSlot }: PageHeaderProps) {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
      padding: '13px 16px',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 4px 24px rgba(80,10,10,0.3)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 9, color: '#fff', cursor: 'pointer',
              padding: '6px 8px', display: 'flex', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}/>
            </svg>
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isAr ? titleAr : (titleEn || titleAr)}
            </h1>
            {(subtitleAr || subtitleEn) && (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0, marginTop: 1 }}>
                {isAr ? subtitleAr : (subtitleEn || subtitleAr)}
              </p>
            )}
          </div>
        </div>
        {rightSlot && <div style={{ flexShrink: 0 }}>{rightSlot}</div>}
      </div>
    </header>
  )
}

// ── SectionCard ─────────────────────────────────────────────────────────────
interface SectionCardProps {
  title: string
  children: React.ReactNode
  bg?: string
  border?: string
  collapsible?: boolean
  defaultOpen?: boolean
  icon?: React.ReactNode
}

export function SectionCard({ title, children, bg = '#fff', border = '#EAE4D9', collapsible = false, defaultOpen = true, icon }: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          cursor: collapsible ? 'pointer' : 'default',
          borderBottom: open ? `1px solid ${border}` : 'none',
        }}
        onClick={() => { if (collapsible) setOpen(o => !o) }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1A1208', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon && <span>{icon}</span>}
          {title}
        </h3>
        {collapsible && (
          <span style={{ display:'inline-flex', alignItems:'center', color: '#9C8E80', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg></span>
        )}
      </div>
      {open && (
        <div style={{ padding: '12px 16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── StatusBadge ─────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: string
  isAr?: boolean
}

const STATUS_MAP: Record<string, { labelAr: string; labelEn: string; color: string; bg: string }> = {
  draft: { labelAr: 'مسودة', labelEn: 'Draft', color: '#5C4A3A', bg: '#EAE4D9' },
  in_progress: { labelAr: 'قيد التنفيذ', labelEn: 'In Progress', color: '#B8860B', bg: '#FFFBEB' },
  ready: { labelAr: 'جاهزة', labelEn: 'Ready', color: '#16a34a', bg: '#F0FDF4' },
  needs_review: { labelAr: 'تحتاج مراجعة', labelEn: 'Needs Review', color: '#CA8A04', bg: '#FFFBEB' },
  completed: { labelAr: 'مكتملة', labelEn: 'Completed', color: '#16a34a', bg: '#F0FDF4' },
  archived: { labelAr: 'محفوظة', labelEn: 'Archived', color: '#9C8E80', bg: '#EAE4D9' },
  pending: { labelAr: 'معلّق', labelEn: 'Pending', color: '#B8860B', bg: '#FFFBEB' },
  verified: { labelAr: 'موثّق', labelEn: 'Verified', color: '#16a34a', bg: '#F0FDF4' },
  partially_verified: { labelAr: 'موثّق جزئياً', labelEn: 'Partially Verified', color: '#B8860B', bg: '#FFFBEB' },
}

export function StatusBadge({ status, isAr = true }: StatusBadgeProps) {
  const info = STATUS_MAP[status] || { labelAr: status, labelEn: status, color: '#5C4A3A', bg: '#EAE4D9' }
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color: info.color, background: info.bg, borderRadius: 8, padding: '2px 9px' }}>
      {isAr ? info.labelAr : info.labelEn}
    </span>
  )
}

// ── ConfidenceBadge ─────────────────────────────────────────────────────────
interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low'
  isAr?: boolean
}

export function ConfidenceBadge({ level, isAr = true }: ConfidenceBadgeProps) {
  const map = {
    high: { ar: 'ثقة عالية', en: 'High Confidence', color: '#16a34a', bg: '#F0FDF4' },
    medium: { ar: 'ثقة متوسطة', en: 'Medium Confidence', color: '#B8860B', bg: '#FFFBEB' },
    low: { ar: 'ثقة منخفضة', en: 'Low Confidence', color: '#DC2626', bg: '#FEF2F2' },
  }
  const info = map[level]
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: info.color, background: info.bg, borderRadius: 8, padding: '2px 8px' }}>
      {isAr ? info.ar : info.en}
    </span>
  )
}

// ── RiskBadge ───────────────────────────────────────────────────────────────
interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical'
  isAr?: boolean
}

export function RiskBadge({ level, isAr = true }: RiskBadgeProps) {
  const map = {
    low:      { ar: 'خطر منخفض', en: 'Low Risk',      color: '#16a34a', bg: '#F0FDF4' },
    medium:   { ar: 'خطر متوسط', en: 'Medium Risk',    color: '#B8860B', bg: '#FFFBEB' },
    high:     { ar: 'خطر عالٍ',  en: 'High Risk',      color: '#ea580c', bg: '#FFF7ED' },
    critical: { ar: 'خطر حرج',  en: 'Critical Risk',  color: '#DC2626', bg: '#FEF2F2' },
  }
  const info = map[level]
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color: info.color, background: info.bg, borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill={info.color}/></svg>
      {isAr ? info.ar : info.en}
    </span>
  )
}

// ── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode
  titleAr: string
  titleEn?: string
  subtitleAr?: string
  subtitleEn?: string
  isAr: boolean
  action?: () => void
  actionLabel?: string
}

const DefaultEmptyIcon = <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>

export function EmptyState({ icon = DefaultEmptyIcon, titleAr, titleEn, subtitleAr, subtitleEn, isAr, action, actionLabel }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', fontFamily: "'Cairo','Inter',sans-serif" }}>
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#4A4035', margin: '0 0 6px' }}>
        {isAr ? titleAr : (titleEn || titleAr)}
      </p>
      {(subtitleAr || subtitleEn) && (
        <p style={{ fontSize: 12, color: '#9C8E80', margin: '0 0 16px' }}>
          {isAr ? subtitleAr : (subtitleEn || subtitleAr)}
        </p>
      )}
      {action && actionLabel && (
        <button
          onClick={action}
          style={{
            padding: '9px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 8px rgba(139,26,26,0.25)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ── LoadingSkeleton ──────────────────────────────────────────────────────────
interface LoadingSkeletonProps {
  lines?: number
  height?: number
  gap?: number
}

export function LoadingSkeleton({ lines = 3, height = 60, gap = 10 }: LoadingSkeletonProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-line {
          border-radius: 10px;
          background: linear-gradient(90deg, #EAE4D9 25%, #F4F0EB 50%, #EAE4D9 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
        }
      `}</style>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line"
          style={{
            height,
            opacity: 1 - i * 0.12,
          }}
        />
      ))}
    </div>
  )
}
