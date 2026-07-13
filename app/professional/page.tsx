'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, getUser, authHeaders, type User } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend.onrender.com'

// ── Section tabs ───────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',    iconAr: '🏠', labelAr: 'نظرة عامة',     labelEn: 'Overview'   },
  { id: 'clients',     iconAr: '👥', labelAr: 'الموكّلون',       labelEn: 'Clients'    },
  { id: 'files',       iconAr: '📂', labelAr: 'ملفات المعاملات', labelEn: 'Files'      },
  { id: 'drafts',      iconAr: '✍️', labelAr: 'المسودات',        labelEn: 'Drafts'     },
  { id: 'reviews',     iconAr: '👨‍⚖️', labelAr: 'طلبات المراجعة', labelEn: 'Reviews'   },
  { id: 'intake',      iconAr: '📋', labelAr: 'استمارة العميل',  labelEn: 'Client Intake' },
]

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, value, labelAr, labelEn, color, isAr }: {
  icon: string; value: string | number; labelAr: string; labelEn: string; color: string; isAr: boolean
}) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, fontSize: 20,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#1f2937', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 3 }}>{isAr ? labelAr : labelEn}</div>
      </div>
    </div>
  )
}

// ── Coming Soon Panel ──────────────────────────────────────────────────────────
function ComingSoon({ titleAr, titleEn, descAr, icon, isAr }: {
  titleAr: string; titleEn: string; descAr: string; icon: string; isAr: boolean
}) {
  return (
    <div style={{
      background: '#f9fafb', border: '1.5px dashed #d1d5db', borderRadius: 16,
      padding: '36px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
        {isAr ? titleAr : titleEn}
      </div>
      <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }}>
        {isAr ? descAr : descAr}
      </div>
      <div style={{
        display: 'inline-block', marginTop: 16, padding: '5px 16px',
        background: '#f3f4f6', borderRadius: 99, fontSize: 11, color: '#9ca3af', fontWeight: 600,
      }}>
        {isAr ? 'قريباً' : 'Coming Soon'}
      </div>
    </div>
  )
}

// ── Intake Link Creator ────────────────────────────────────────────────────────
function IntakeLinkCreator({ isAr }: { isAr: boolean }) {
  const [clientName, setClientName]   = useState('')
  const [matter, setMatter]           = useState('')
  const [created, setCreated]         = useState(false)
  const [link, setLink]               = useState('')

  const handleCreate = () => {
    const id = Math.random().toString(36).slice(2, 10)
    setLink(`${window.location.origin}/intake/${id}`)
    setCreated(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(link).catch(() => {})
  }

  if (created) {
    return (
      <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 10 }}>
          ✅ {isAr ? 'تم إنشاء رابط الاستمارة' : 'Intake link created'}
        </div>
        <div style={{
          background: '#fff', border: '1px solid #d1d5db', borderRadius: 8,
          padding: '8px 12px', fontSize: 12, color: '#374151',
          direction: 'ltr', wordBreak: 'break-all', marginBottom: 10,
        }}>{link}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} style={{
            flex: 1, padding: '9px 16px', background: '#8B1A1A', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            📋 {isAr ? 'نسخ الرابط' : 'Copy Link'}
          </button>
          <button onClick={() => { setCreated(false); setClientName(''); setMatter('') }} style={{
            padding: '9px 16px', background: '#f3f4f6', color: '#374151',
            border: '1px solid #d1d5db', borderRadius: 10, fontSize: 12.5,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {isAr ? 'رابط جديد' : 'New Link'}
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>
          ⚠️ {isAr ? 'ميزة قيد التطوير — الرابط للعرض فقط' : 'Feature in development — link is for preview only'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
          {isAr ? 'اسم الموكّل' : 'Client Name'}
        </label>
        <input
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmad Mohammad'}
          style={{
            width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db',
            borderRadius: 10, fontSize: 13, fontFamily: 'inherit',
            background: '#fff', outline: 'none', boxSizing: 'border-box',
            direction: isAr ? 'rtl' : 'ltr',
          }}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
          {isAr ? 'موضوع المعاملة' : 'Matter Subject'}
        </label>
        <input
          value={matter}
          onChange={e => setMatter(e.target.value)}
          placeholder={isAr ? 'مثال: بيع عقار' : 'e.g. Property Sale'}
          style={{
            width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db',
            borderRadius: 10, fontSize: 13, fontFamily: 'inherit',
            background: '#fff', outline: 'none', boxSizing: 'border-box',
            direction: isAr ? 'rtl' : 'ltr',
          }}
        />
      </div>
      <button
        onClick={handleCreate}
        disabled={!clientName.trim()}
        style={{
          padding: '11px 20px', background: clientName.trim() ? '#8B1A1A' : '#d1d5db',
          color: '#fff', border: 'none', borderRadius: 12, fontSize: 13,
          fontWeight: 700, cursor: clientName.trim() ? 'pointer' : 'default',
          fontFamily: 'inherit',
        }}
      >
        🔗 {isAr ? 'إنشاء رابط الاستمارة' : 'Generate Intake Link'}
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfessionalWorkspacePage() {
  const router   = useRouter()
  const [isAr, setIsAr]             = useState(true)
  const [activeSection, setSection] = useState('overview')
  const [user, setUser]             = useState<User | null>(null)
  const [authChecked, setChecked]   = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    const u = getUser()
    setUser(u)
    setChecked(true)
  }, [router])

  if (!authChecked) return null

  return (
    <div style={{
      minHeight: '100vh', background: '#fafaf9',
      fontFamily: 'Cairo, Inter, sans-serif', direction: isAr ? 'rtl' : 'ltr',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 100%)',
        padding: '20px 20px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>
                {isAr ? '⚖️ مساحة العمل المهنية' : '⚖️ Professional Workspace'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>
                {isAr ? 'للمحامين ومكاتب الخدمات' : 'For Lawyers & Service Offices'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setIsAr(!isAr)} style={{
                padding: '6px 12px', background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8,
                color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {isAr ? 'EN' : 'AR'}
              </button>
              <button onClick={() => router.back()} style={{
                padding: '6px 12px', background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8,
                color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {isAr ? '← رجوع' : 'Back →'}
              </button>
            </div>
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 6, marginTop: 20, overflowX: 'auto', paddingBottom: 2 }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)} style={{
                padding: '7px 14px', borderRadius: 20,
                background: activeSection === s.id ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                color: activeSection === s.id ? '#fff' : 'rgba(255,255,255,0.6)',
                fontSize: 11.5, fontWeight: activeSection === s.id ? 700 : 500,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                border: activeSection === s.id ? '1px solid rgba(255,255,255,0.35)' : '1px solid transparent',
              }}>
                {s.iconAr} {isAr ? s.labelAr : s.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 100px' }}>

        {/* Overview */}
        {activeSection === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <StatCard icon="👥" value="0" labelAr="موكّلون نشطون" labelEn="Active Clients" color="#8B1A1A" isAr={isAr} />
              <StatCard icon="📂" value="0" labelAr="ملفات مفتوحة" labelEn="Open Files" color="#B8860B" isAr={isAr} />
              <StatCard icon="✍️" value="0" labelAr="مسودات محفوظة" labelEn="Saved Drafts" color="#6366f1" isAr={isAr} />
              <StatCard icon="👨‍⚖️" value="0" labelAr="طلبات مراجعة" labelEn="Review Requests" color="#22c55e" isAr={isAr} />
            </div>

            {/* Quick actions */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
                {isAr ? '⚡ إجراءات سريعة' : '⚡ Quick Actions'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '🔗', ar: 'إنشاء استمارة عميل', en: 'Create Client Intake', action: () => setSection('intake') },
                  { icon: '✍️', ar: 'إعداد مسودة قانونية', en: 'Prepare Legal Draft', action: () => router.push('/drafting-studio') },
                  { icon: '📂', ar: 'إنشاء ملف معاملة', en: 'Create Transaction File', action: () => router.push('/my-files') },
                  { icon: '🔍', ar: 'تحليل مستند', en: 'Analyze Document', action: () => router.push('/') },
                ].map((item, i) => (
                  <button key={i} onClick={item.action} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', background: '#f9fafb',
                    border: '1px solid #e5e7eb', borderRadius: 10,
                    cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: isAr ? 'right' : 'left',
                  }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>
                      {isAr ? item.ar : item.en}
                    </span>
                    <span style={{ marginInlineStart: 'auto', color: '#9ca3af', fontSize: 12 }}>←</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plan notice */}
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1px solid #fde68a', borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                ✨ {isAr ? 'مساحة العمل المهنية قيد التطوير' : 'Professional Workspace in Development'}
              </div>
              <div style={{ fontSize: 11.5, color: '#78350f', lineHeight: 1.7 }}>
                {isAr
                  ? 'نعمل على بناء تجربة متكاملة للمحامين ومكاتب الخدمات. تشمل: إدارة الموكّلين، ملفات المعاملات، المسودات، ورابط استمارة العميل.'
                  : 'We are building a complete experience for lawyers and service offices including client management, transaction files, drafts, and client intake links.'}
              </div>
            </div>
          </div>
        )}

        {/* Clients */}
        {activeSection === 'clients' && (
          <ComingSoon
            titleAr="إدارة الموكّلين" titleEn="Client Management"
            descAr="ستتمكن قريباً من إضافة موكّليك، متابعة ملفاتهم، وإرسال روابط الاستمارة مباشرة."
            icon="👥" isAr={isAr}
          />
        )}

        {/* Files */}
        {activeSection === 'files' && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                {isAr ? '📂 ملفات المعاملات' : '📂 Transaction Files'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {isAr ? 'يمكنك إدارة ملفاتك من صفحة ملفاتي' : 'Manage your files from My Files page'}
              </div>
            </div>
            <button onClick={() => router.push('/my-files')} style={{
              width: '100%', padding: '12px 20px',
              background: 'linear-gradient(135deg, #8B1A1A 0%, #6b2737 100%)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              📂 {isAr ? 'الذهاب إلى ملفاتي' : 'Go to My Files'}
            </button>
          </div>
        )}

        {/* Drafts */}
        {activeSection === 'drafts' && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                {isAr ? '✍️ استوديو المسودات' : '✍️ Drafting Studio'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {isAr ? 'إعداد مسودات قانونية وإدارية احترافية' : 'Prepare professional legal and administrative drafts'}
              </div>
            </div>
            <button onClick={() => router.push('/drafting-studio')} style={{
              width: '100%', padding: '12px 20px',
              background: 'linear-gradient(135deg, #8B1A1A 0%, #6b2737 100%)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              ✍️ {isAr ? 'فتح استوديو المسودات' : 'Open Drafting Studio'}
            </button>
          </div>
        )}

        {/* Reviews */}
        {activeSection === 'reviews' && (
          <ComingSoon
            titleAr="طلبات المراجعة البشرية" titleEn="Human Review Requests"
            descAr="تتبّع طلبات مراجعة الملفات والمستندات من الخبراء القانونيين."
            icon="👨‍⚖️" isAr={isAr}
          />
        )}

        {/* Client Intake */}
        {activeSection === 'intake' && (
          <div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
                🔗 {isAr ? 'رابط استمارة العميل' : 'Client Intake Link'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16, lineHeight: 1.7 }}>
                {isAr
                  ? 'أرسل للعميل رابطاً يملأ فيه بياناته ويرفع مستنداته. ستصلك ملخصاً منظّماً.'
                  : 'Send the client a link to fill in their details and upload documents. You receive a structured summary.'}
              </div>
              <IntakeLinkCreator isAr={isAr} />
            </div>

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', marginBottom: 6 }}>
                {isAr ? 'ما يصله العميل في الاستمارة:' : 'What the client sees in the intake form:'}
              </div>
              <ul style={{ margin: 0, padding: isAr ? '0 18px 0 0' : '0 0 0 18px', fontSize: 11.5, color: '#374151', lineHeight: 2 }}>
                <li>{isAr ? 'معلومات شخصية أساسية' : 'Basic personal information'}</li>
                <li>{isAr ? 'وصف المشكلة أو الطلب' : 'Description of issue or request'}</li>
                <li>{isAr ? 'رفع المستندات المتوفرة' : 'Upload available documents'}</li>
                <li>{isAr ? 'أسئلة موجّهة حسب نوع المعاملة' : 'Guided questions by procedure type'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
