import { useEffect, useRef, useState } from 'react'
import { getMessages } from '../api/client'

const MEDIA_ICONS = {
  text: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3h9M2 6.5h7M2 10h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  audio: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4.5" y="1.5" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 7.5C2 10 3.79 11.5 6.5 11.5C9.21 11.5 11 10 11 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M6.5 11.5V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  image: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="4.5" cy="4.5" r="1" fill="currentColor"/>
      <path d="M1 9l3.5-3.5 2.5 2.5 1.5-1.5L12 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ padding: '56px 24px', gap: 12 }}
    >
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{ width: 48, height: 48, background: '#F5F5F4', color: '#A8A8A4' }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="3" fill="currentColor" opacity="0.5"/>
          <path d="M5 17C3 15 2 13.1 2 11C2 8.9 3 7 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
          <path d="M17 5C19 7 20 8.9 20 11C20 13.1 19 15 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
        </svg>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
        No messages yet
      </p>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textAlign: 'center', maxWidth: 240 }}>
        Messages will appear here as orders come in via WhatsApp or the simulator.
      </p>
    </div>
  )
}

function MessageRow({ m }) {
  const isSimulator = m.source === 'simulator'
  return (
    <div
      className="flex gap-3"
      style={{
        padding: '11px 18px',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background 0.1s',
      }}
    >
      {/* Source dot */}
      <div style={{ paddingTop: 2, flexShrink: 0 }}>
        <span
          className="inline-block rounded-full"
          style={{
            width: 8,
            height: 8,
            background: isSimulator ? '#F59E0B' : '#22C55E',
            marginTop: 4,
            boxShadow: isSimulator ? '0 0 0 3px #FEF3C7' : '0 0 0 3px #DCFCE7',
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0" style={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Media type chip */}
            <span
              className="flex items-center gap-1"
              style={{
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)',
              }}
            >
              {MEDIA_ICONS[m.media_type] || MEDIA_ICONS.text}
              <span style={{ textTransform: 'capitalize' }}>{m.media_type || 'text'}</span>
            </span>

            {/* Source badge */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: 999,
                ...(isSimulator
                  ? { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }
                  : { background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }),
              }}
            >
              {isSimulator ? 'Simulator' : 'WhatsApp'}
            </span>

            {/* Processed badge */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: 999,
                ...(m.processed
                  ? { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }
                  : { background: '#FEFCE8', color: '#854D0E', border: '1px solid #FEF08A' }),
              }}
            >
              {m.processed ? 'Processed' : 'Pending'}
            </span>
          </div>

          {/* Timestamp */}
          <span
            style={{
              fontSize: 11,
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              flexShrink: 0,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Message text */}
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {m.raw_content}
        </p>
      </div>
    </div>
  )
}

export default function LiveFeed({ onNewMessage }) {
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)
  const lastIdRef = useRef(0)

  const fetchMessages = async () => {
    try {
      const res = await getMessages()
      const incoming = res.data
      setMessages(incoming)
      setError(null)

      if (incoming.length > 0) {
        const maxId = Math.max(...incoming.map((m) => m.id))
        if (maxId > lastIdRef.current) {
          lastIdRef.current = maxId
          if (onNewMessage) onNewMessage()
        }
      }
    } catch {
      setError('Could not reach API')
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header card */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px 12px 0 0',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2
            style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 15,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
            }}
          >
            Live Feed
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              marginTop: 3,
            }}
          >
            Incoming WhatsApp &amp; simulator messages
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Message count */}
          {messages.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)',
                background: '#F5F5F4',
                border: '1px solid var(--color-border)',
                borderRadius: 999,
                padding: '3px 10px',
              }}
            >
              {messages.length} msg{messages.length !== 1 ? 's' : ''}
            </span>
          )}

          {/* Live badge */}
          <span
            className="flex items-center gap-1.5"
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: '#15803D',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 999,
              padding: '4px 10px 4px 8px',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            Live · 3s
          </span>
        </div>
      </div>

      {/* Error bar */}
      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderTop: 'none',
            padding: '8px 20px',
            fontSize: 12,
            color: '#DC2626',
            fontFamily: 'var(--font-body)',
          }}
        >
          {error}
        </div>
      )}

      {/* Messages list */}
      <div
        style={{
          background: 'white',
          border: '1px solid var(--color-border)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden',
        }}
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {messages.map((m) => (
              <MessageRow key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
