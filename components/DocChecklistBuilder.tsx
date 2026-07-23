'use client'

/**
 * DocChecklistBuilder — interactive document checklist panel.
 * User picks a procedure, sees required docs with checkboxes.
 * Can print as a clean HTML page.
 * localStorage key: dalilak_checklist_${procedure.code}
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES, type EnrichedProcedure } from '@/lib/enrichedProcedures'

const LS_PREFIX = 'dalilak_checklist_'

function loadChecked(code: string): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LS_PREFIX + code)
    return raw ? new Set<number>(JSON.parse(raw) as number[]) : new Set()
  } catch { return new Set() }
}

function saveChecked(code: string, checked: Set<number>) {
  try { localStorage.setItem(LS_PREFIX + code, JSON.stringify(Array.from(checked))) } catch {}
}

function printChecklist(proc: EnrichedProcedure, docs: string[], checked: Set<number>, isAr: boolean) {
  const title = isAr ? proc.title : (proc.title_en || proc.title)
  const ministry = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
  const rows = docs.map((doc, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 12px;text-align:center;">
        <span style="display:inline-block;width:18px;height:18px;border:2px solid ${checked.has(i) ? '#16a34a' : '#6b7280'};border-radius:4px;background:${checked.has(i) ? '#16a34a' : 'white'};vertical-align:middle;font-size:12px;line-height:16px;color:white;">
          ${checked.has(i) ? '✓' : ''}
        </span>
      </td>
      <td style="padding:10px 12px;font-size:14px;color:${checked.has(i) ? '#6b7280' : '#111827'};text-decoration:${checked.has(i) ? 'line-through' : 'none'};">${doc}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html dir="${isAr ? 'rtl' : 'ltr'}" lang="${isAr ? 'ar' : 'en'}">
<head>
  <meta charset="utf-8">
  <title>${isAr ? 'قائمة المستندات' : 'Document Checklist'} — ${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap');
    body { font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif; margin: 0; padding: 24px 32px; color: #111827; }
    h1 { font-size: 20px; font-weight: 800; color: #8F1D2C; margin: 0 0 4px; }
    .meta { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    th { background: #f9fafb; padding: 10px 12px; font-size: 12px; color: #374151; font-weight: 700; text-align: ${isAr ? 'right' : 'left'}; }
    th:first-child { text-align: center; width: 48px; }
    footer { margin-top: 20px; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>${isAr ? '📋 قائمة المستندات المطلوبة' : '📋 Required Documents Checklist'}</h1>
  <div class="meta">
    ${isAr ? 'المعاملة' : 'Procedure'}: <strong>${title}</strong> &nbsp;|&nbsp;
    ${isAr ? 'الجهة' : 'Authority'}: <strong>${ministry}</strong>
    &nbsp;|&nbsp; ${isAr ? 'المُنجز' : 'Completed'}: <strong>${checked.size}/${docs.length}</strong>
  </div>
  <table>
    <thead><tr>
      <th>✓</th>
      <th>${isAr ? 'المستند' : 'Document'}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <footer>دليلك AI — ${isAr ? 'مساعد المعاملات الحكومية اللبنانية' : 'Lebanese Government Procedures Assistant'} • dalilak.com</footer>
  <script>window.print(); window.onafterprint = () => window.close();</script>
</body>
</html>`

  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) return
  w.document.write(html)
  w.document.close()
}

interface Props {
  onAsk?: (q: string) => void
}

export default function DocChecklistBuilder({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<EnrichedProcedure | null>(null)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    if (!search.trim()) return ENRICHED_PROCEDURES.slice(0, 8)
    const q = search.toLowerCase()
    return ENRICHED_PROCEDURES.filter(p =>
      p.title.includes(q) ||
      (p.title_en || '').toLowerCase().includes(q) ||
      p.ministry.includes(search) ||
      (p.ministry_en || '').toLowerCase().includes(q)
    ).slice(0, 8)
  }, [search])

  const selectProc = useCallback((proc: EnrichedProcedure) => {
    setSelected(proc)
    setChecked(loadChecked(proc.code))
    setSearch('')
    setOpen(false)
  }, [])

  const toggleDoc = useCallback((i: number) => {
    if (!selected) return
    setChecked(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      saveChecked(selected.code, next)
      return next
    })
  }, [selected])

  const docs = selected
    ? (isAr ? selected.requiredDocuments : (selected.requiredDocuments_en?.length ? selected.requiredDocuments_en : selected.requiredDocuments))
    : []

  const doneCount = checked.size
  const total = docs.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        animation: 'fadeUp 0.22s ease both',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📝</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
              {isAr ? 'قائمة الوثائق المطلوبة' : 'Document Checklist'}
            </div>
            {selected && (
              <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 1 }}>
                {isAr ? selected.title : (selected.title_en || selected.title)}
                {' — '}{doneCount}/{total}
              </div>
            )}
          </div>
        </div>
        <span style={{
          fontSize: 10, color: 'var(--text-4)',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.18s', display: 'inline-block',
        }}>▾</span>
      </div>

      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}>

          {/* Procedure picker */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type="text"
              dir={isAr ? 'rtl' : 'ltr'}
              placeholder={isAr ? 'ابحث عن معاملة...' : 'Search for a procedure...'}
              value={search}
              onChange={e => { setSearch(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              style={{
                width: '100%', padding: '9px 12px',
                border: '1px solid var(--border)', borderRadius: 9,
                fontSize: 13, color: 'var(--text-1)',
                background: 'var(--bg)', outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {open && results.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', [isAr ? 'right' : 'left']: 0,
                width: '100%', background: 'var(--bg)',
                border: '1px solid var(--border)', borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                zIndex: 50, maxHeight: 200, overflowY: 'auto',
              }}>
                {results.map(proc => (
                  <button
                    key={proc.code}
                    type="button"
                    onClick={() => selectProc(proc)}
                    style={{
                      display: 'block', width: '100%', textAlign: isAr ? 'right' : 'left',
                      padding: '9px 12px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 12.5, color: 'var(--text-1)',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {isAr ? proc.title : (proc.title_en || proc.title)}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 2 }}>
                      {isAr ? proc.ministry : (proc.ministry_en || proc.ministry)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Checklist */}
          {selected && docs.length > 0 && (
            <>
              {/* Progress */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {isAr ? `جاهز: ${doneCount} من ${total}` : `Ready: ${doneCount} of ${total}`}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? 'var(--success)' : 'var(--brand)' }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: pct === 100 ? 'var(--success)' : 'var(--brand)',
                    borderRadius: 3, transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>

              {/* Document items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {docs.map((doc, i) => (
                  <label
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer',
                      padding: '8px 10px', borderRadius: 9,
                      background: checked.has(i) ? 'rgba(22,163,74,0.06)' : 'var(--bg)',
                      border: `1px solid ${checked.has(i) ? 'rgba(22,163,74,0.25)' : 'var(--border)'}`,
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(i)}
                      onChange={() => toggleDoc(i)}
                      style={{
                        width: 16, height: 16, flexShrink: 0, cursor: 'pointer',
                        accentColor: '#16a34a', marginTop: 1,
                      }}
                    />
                    <span style={{
                      fontSize: 12.5, color: checked.has(i) ? 'var(--text-4)' : 'var(--text-1)',
                      textDecoration: checked.has(i) ? 'line-through' : 'none',
                      lineHeight: 1.5,
                    }}>
                      {doc}
                    </span>
                  </label>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => printChecklist(selected, docs, checked, isAr)}
                  style={{
                    padding: '7px 14px', borderRadius: 8,
                    background: 'var(--brand)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  🖨️ {isAr ? 'طباعة' : 'Print'}
                </button>

                {onAsk && (
                  <button
                    type="button"
                    onClick={() => onAsk(
                      isAr
                        ? `ما هي المستندات المطلوبة لـ "${selected.title}"؟`
                        : `What documents are required for "${selected.title_en || selected.title}"?`
                    )}
                    style={{
                      padding: '7px 14px', borderRadius: 8,
                      background: 'var(--surface)', color: 'var(--brand)',
                      border: '1px solid var(--brand)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    }}
                  >
                    💬 {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setChecked(new Set())
                    try { localStorage.removeItem(LS_PREFIX + selected.code) } catch {}
                  }}
                  style={{
                    padding: '7px 12px', borderRadius: 8,
                    background: 'none', color: 'var(--text-4)',
                    border: '1px solid var(--border)', cursor: 'pointer', fontSize: 11,
                  }}
                >
                  {isAr ? 'إعادة ضبط' : 'Reset'}
                </button>
              </div>
            </>
          )}

          {!selected && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-4)', fontSize: 12.5 }}>
              {isAr ? 'ابحث عن معاملة لعرض وثائقها المطلوبة' : 'Search for a procedure to see its required documents'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
