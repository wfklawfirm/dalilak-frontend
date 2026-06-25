'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export default function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold
          ${isUser ? 'bg-accent' : 'bg-primary'}`}
      >
        {isUser ? 'أنت' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed
          ${isUser
            ? 'bg-accent text-white rounded-tl-sm'
            : 'bg-white text-gray-800 rounded-tr-sm border border-gray-100'
          }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose-ar">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            {msg.streaming && <span className="cursor" />}
          </div>
        )}
      </div>
    </div>
  )
}
