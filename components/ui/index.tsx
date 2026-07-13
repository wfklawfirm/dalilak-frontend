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
  icon?: string
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
          <span style={{ fontSize: 12, color: '#9CA3AF', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
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
  draft: { labelAr: 'مسودة', labelEn: 'Draft', color: '#6B7280', bg: '#F5F5F5' },
  in_progress: { labelAr: 'قيد التنفيذ', labelEn: 'In Progress', color: '#B8860B', bg: '#FFFBEB' },
  ready: { labelAr: 'جاهزة', labelEn: 'Ready', color: '#16a34a', bg: '#F0FDF4' },
  needs_review: { labelAr: 'تحتاج مراجعة', labelEn: 'Needs Review', color: '#CA8A04', bg: '#FFFBEB' },
  completed: { labelAr: 'مكتملة', labelEn: 'Completed', color: '#16a34a', bg: '#F0FDF4' },
  archived: { labelAr: 'محفوظة', labelEn: 'Archived', color: '#9CA3AF', bg: '#F5F5F5' },
  pending: { labelAr: 'معلّق', labelEn: 'Pending', color: '#B8860B', bg: '#FFFBEB' },
  verified: { labelAr: 'موثّق', labelEn: 'Verified', color: '#16a34a', bg: '#F0FDF4' },
  partially_verified: { labelAr: 'موثّق جزئياً', labelEn: 'Partially Verified', color: '#B8860B', bg: '#FFFBEB' },
}

export function StatusBadge({ status, isAr = true }: StatusBadgeProps) {
  const info = STATUS_MAP[status] || { labelAr: status, labelEn: status, color: '#6B7280', bg: '#F5F5F5' }
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
    low: { ar: 'خطر منخفض', en: 'Low Risk', color: '#16a34a', bg: '#F0FDF4', icon: '🟢' },
    medium: { ar: 'خطر متوسط', en: 'Medium Risk', color: '#B8860B', bg: '#FFFBEB', icon: '🟡' },
    high: { ar: 'خطر عالٍ', en: 'High Risk', color: '#ea580c', bg: '#FFF7ED', icon: '🟠' },
    critical: { ar: 'خطر حرج', en: 'Critical Risk', color: '#DC2626', bg: '#FEF2F2', icon: '🔴' },
  }
  const info = map[level]
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color: info.color, background: info.bg, borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {info.icon} {isAr ? info.ar : info.en}
    </span>
  )
}

// ── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: string
  titleAr: string
  titleEn?: string
  subtitleAr?: string
  subtitleEn?: string
  isAr: boolean
  action?: () => void
  actionLabel?: string
}

export function EmptyState({ icon = '📭', titleAr, titleEn, subtitleAr, subtitleEn, isAr, action, actionLabel }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', fontFamily: "'Cairo','Inter',sans-serif" }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
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
          style={{ padding: '10px 24px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 14, fontFamily: "'Cairo','Inter',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
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
}

export function LoadingSkeleton({ lines = 3, height = 60 }: LoadingSkeletonProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
            backgroundSize: '200% 100%',
            borderRadius: 12,
            animation: 'shimmer 1.5s infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
