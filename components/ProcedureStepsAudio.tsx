'use client'

/**
 * ProcedureStepsAudio — "listen to the steps" row for a procedure,
 * reusing the existing ChatVoicePlayback TTS engine (Web Speech API)
 * with a labeled wrapper so it reads clearly outside the chat context.
 *
 * Props: { steps: string[]; isAr: boolean }
 */

import React from 'react'
import ChatVoicePlayback from '@/components/ChatVoicePlayback'

interface Props {
  steps: string[]
  isAr: boolean
}

export default function ProcedureStepsAudio({ steps, isAr }: Props) {
  if (!steps || steps.length === 0) return null

  const spoken = steps
    .map((s, i) => `${isAr ? `الخطوة ${i + 1}` : `Step ${i + 1}`}: ${s}`)
    .join('. ')

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px',
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: 10,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: '#4B5563' }}>
        {isAr ? 'استمع للخطوات' : 'Listen to steps'}
      </span>
      <ChatVoicePlayback text={spoken} isAr={isAr} />
    </div>
  )
}
