// Server component — no 'use client' needed
export default function ProcedureLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAFAF8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cairo','Inter',sans-serif",
      }}
      dir="rtl"
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #EAE4D9',
            borderTopColor: '#8B1A1A',
            borderRadius: '50%',
            margin: '0 auto 14px',
            animation: 'pl-spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes pl-spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: '#9C8E80', fontSize: 13, margin: 0 }}>جارٍ التحميل...</p>
      </div>
    </div>
  )
}
