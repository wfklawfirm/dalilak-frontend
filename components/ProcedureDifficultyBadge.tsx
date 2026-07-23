'use client'

/**
 * ProcedureDifficultyBadge — colored difficulty badge on enriched procedure cards.
 *
 * Complexity score = steps.length + requiredDocuments.length
 *   ≤5   → سهل / Easy      → green
 *   6-10 → متوسط / Medium  → amber
 *   >10  → صعب / Hard      → red
 *
 * Compact pill — no props needed beyond counts.
 */

interface Props {
  stepCount: number
  docCount: number
  isAr: boolean
}

export default function ProcedureDifficultyBadge({ stepCount, docCount, isAr }: Props) {
  const score = stepCount + docCount

  let label: string, bg: string, color: string, border: string, emoji: string

  if (score <= 5) {
    label  = isAr ? 'سهل' : 'Easy'
    bg     = '#D1FAE5'
    color  = '#065F46'
    border = '#A7F3D0'
    emoji  = '🟢'
  } else if (score <= 10) {
    label  = isAr ? 'متوسط' : 'Medium'
    bg     = '#FEF3C7'
    color  = '#92400E'
    border = '#FDE68A'
    emoji  = '🟡'
  } else {
    label  = isAr ? 'صعب' : 'Hard'
    bg     = '#FEE2E2'
    color  = '#991B1B'
    border = '#FECACA'
    emoji  = '🔴'
  }

  return (
    <span
      title={isAr ? `درجة التعقيد: ${score} (خطوات + وثائق)` : `Complexity: ${score} (steps + docs)`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 9.5, fontWeight: 700, padding: '1px 7px', borderRadius: 8,
        background: bg, color, border: `1px solid ${border}`,
        cursor: 'default',
      }}
    >
      {emoji} {label}
    </span>
  )
}
