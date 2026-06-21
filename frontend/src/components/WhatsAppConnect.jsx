import { useEffect, useRef, useState } from 'react'
import { getWhatsappStatus, getQrCode } from '../api/client'

const POLL_INTERVAL_MS = 3000
const QR_REFRESH_MS = 15000

// ── Small reusable status dot ──────────────────────────────────────────────
function StatusDot({ color, pulse = false }) {
  return (
    <span
      className={pulse ? 'animate-pulse' : ''}
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }}
    />
  )
}

// ── Step indicator for QR instructions ────────────────────────────────────
function Step({ number, children }) {
  return (
    <li className="flex gap-3 items-start">
      <span
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#1A1A18',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
        }}
      >
        {number}
      </span>
      <span
        style={{
          paddingTop: 3,
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.5,
        }}
      >
        {children}
      </span>
    </li>
  )
}

// ── Section wrapper card ───────────────────────────────────────────────────
function Card({ children, accent }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        ...(accent ? { borderLeft: `3px solid ${accent}` } : {}),
      }}
    >
      {children}
    </div>
  )
}

// ── Bridge offline state ───────────────────────────────────────────────────
function BridgeOffline() {
  return (
    <div className="max-w-lg mx-auto" style={{ paddingTop: 32 }}>
      <Card accent="#EF4444">
        <div style={{ padding: '18px 18px 8px' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
            <StatusDot color="#EF4444" />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 15,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Bridge Offline
            </h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.6, marginBottom: 16 }}>
            The WhatsApp bridge is not running. Start it with:
          </p>
        </div>

        <pre
          style={{
            margin: '0 18px',
            padding: '12px 16px',
            background: '#F8F8F7',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            fontSize: 12,
            fontFamily: 'ui-monospace, Menlo, monospace',
            color: 'var(--color-text-primary)',
            overflowX: 'auto',
            lineHeight: 1.6,
          }}
        >{`cd invisible-crm/whatsapp-bridge\nnode index.js`}</pre>

        <div style={{ padding: '14px 18px 18px' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            Or run{' '}
            <code
              style={{
                background: '#F0F0EE',
                border: '1px solid var(--color-border)',
                borderRadius: 5,
                padding: '1px 6px',
                fontSize: 12,
                fontFamily: 'ui-monospace, Menlo, monospace',
                color: 'var(--color-text-primary)',
              }}
            >
              start-bridge.ps1
            </code>{' '}
            from the project root.
          </p>
        </div>
      </Card>
    </div>
  )
}

// ── Connected state ────────────────────────────────────────────────────────
function Connected({ phone }) {
  return (
    <div className="max-w-lg mx-auto" style={{ paddingTop: 32 }}>
      <Card accent="#22C55E">
        {/* Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <StatusDot color="#22C55E" pulse />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 15,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            WhatsApp Connected
          </h2>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '3px 10px',
              borderRadius: 999,
              background: '#DCFCE7',
              color: '#15803D',
              border: '1px solid #BBF7D0',
            }}
          >
            Active
          </span>
        </div>

        {/* Phone row */}
        <div style={{ padding: '16px 18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              background: '#F0FDF4',
              borderRadius: 12,
              border: '1px solid #BBF7D0',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#16A34A',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                flexShrink: 0,
              }}
            >
              W
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                {phone ? `+${phone}` : 'Your WhatsApp'}
              </p>
              <p style={{ fontSize: 12, color: '#16A34A', fontFamily: 'var(--font-body)', marginTop: 2 }}>
                Active — receiving messages
              </p>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
            Incoming WhatsApp messages are automatically forwarded to the CRM and processed by Gemini.
            Check the <strong>Live Feed</strong> and <strong>Dashboard</strong> tabs to see extracted orders.
          </p>
        </div>

        {/* Footer note */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--color-border)',
            background: '#FAFAFA',
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
            To disconnect, open WhatsApp → Linked Devices → remove this device.
            The bridge will restart and show a new QR code.
          </p>
        </div>
      </Card>
    </div>
  )
}

// ── QR / waiting state ─────────────────────────────────────────────────────
function QRScan({ qrDataUrl, qrError }) {
  return (
    <div className="max-w-lg mx-auto" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header card */}
      <Card>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusDot color="#F59E0B" pulse />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 15,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Connect WhatsApp
          </h2>
        </div>
        <div style={{ padding: '14px 18px' }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
            Link your WhatsApp number to start receiving real orders automatically.
            No Meta Business account needed — just scan the QR code below.
          </p>
        </div>
      </Card>

      {/* QR code card */}
      <Card>
        <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* QR frame */}
          <div
            style={{
              width: 216,
              height: 216,
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="WhatsApp QR Code"
                style={{ width: 200, height: 200, display: 'block' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                {qrError ? (
                  <>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: '#FEF2F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 4v5M8 11.5v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="8" cy="8" r="6.5" stroke="#EF4444" strokeWidth="1.2"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 12, color: '#DC2626', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{qrError}</p>
                  </>
                ) : (
                  <>
                    <div
                      className="animate-spin"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: '2.5px solid #F0D9A8',
                        borderTopColor: '#D97706',
                        margin: '0 auto 10px',
                      }}
                    />
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Generating QR…</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Refresh note */}
          <p
            style={{
              fontSize: 11,
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              textAlign: 'center',
            }}
          >
            Refreshes every 15 s · session saved after scan
          </p>
        </div>
      </Card>

      {/* Instructions card */}
      <Card>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            How to scan
          </h3>
        </div>
        <ol style={{ padding: '14px 18px 18px', margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Step number={1}>Open <strong>WhatsApp</strong> on your phone</Step>
          <Step number={2}>Tap <strong>⋮ Menu</strong> (Android) or <strong>Settings</strong> (iPhone)</Step>
          <Step number={3}>Tap <strong>Linked Devices</strong> → <strong>Link a Device</strong></Step>
          <Step number={4}>Point your camera at the QR code above</Step>
        </ol>
      </Card>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function WhatsAppConnect() {
  const [status, setStatus] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [qrError, setQrError] = useState(null)
  const [bridgeDown, setBridgeDown] = useState(false)

  const qrTimerRef = useRef(null)

  const fetchStatus = async () => {
    try {
      const res = await getWhatsappStatus()
      setStatus(res.data)
      setBridgeDown(false)
      if (res.data.connected) {
        setQrDataUrl(null)
        setQrError(null)
        clearTimeout(qrTimerRef.current)
      }
    } catch {
      setBridgeDown(true)
      setStatus(null)
    }
  }

  const fetchQr = async () => {
    try {
      const res = await getQrCode()
      if (res.data.connected) {
        setQrDataUrl(null)
        setQrError(null)
        return
      }
      if (res.data.qr) {
        setQrDataUrl(res.data.qr)
        setQrError(null)
        qrTimerRef.current = setTimeout(fetchQr, QR_REFRESH_MS)
      } else {
        setQrError('QR code not ready yet — bridge is starting up…')
        qrTimerRef.current = setTimeout(fetchQr, 2000)
      }
    } catch {
      setQrError('Could not reach the WhatsApp bridge on port 3001.')
      qrTimerRef.current = setTimeout(fetchQr, 3000)
    }
  }

  useEffect(() => {
    fetchStatus()
    const statusInterval = setInterval(fetchStatus, POLL_INTERVAL_MS)
    return () => {
      clearInterval(statusInterval)
      clearTimeout(qrTimerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status && !status.connected) {
      fetchQr()
    }
    return () => clearTimeout(qrTimerRef.current)
  }, [status?.connected]) // eslint-disable-line react-hooks/exhaustive-deps

  if (bridgeDown) return <BridgeOffline />
  if (status?.connected) return <Connected phone={status.phone} />
  return <QRScan qrDataUrl={qrDataUrl} qrError={qrError} />
}
