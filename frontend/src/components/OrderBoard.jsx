import { useState, useRef, useCallback } from 'react'
import { updateOrder } from '../api/client'

const STATUS_COLS = ['pending', 'confirmed', 'delivered']

const COL_CONFIG = {
  pending:   { bg: '#FFF8EC', border: '#F0D9A8', accent: '#D97706', lightBg: '#FEF3C7', label: 'Pending' },
  confirmed: { bg: '#EFF5FF', border: '#B8D4F5', accent: '#2563EB', lightBg: '#DBEAFE', label: 'Confirmed' },
  delivered: { bg: '#F0FBF4', border: '#A8D9B8', accent: '#16A34A', lightBg: '#DCFCE7', label: 'Delivered' },
}

const TARGET_ACCENT = Object.fromEntries(
  Object.entries(COL_CONFIG).map(([k, v]) => [k, v.accent])
)
const TARGET_LIGHT = Object.fromEntries(
  Object.entries(COL_CONFIG).map(([k, v]) => [k, v.lightBg])
)

// ── Payment Badge ─────────────────────────────────────────────────────────────
// Flow:
//   unpaid            → shows "Unpaid" badge  (customer may say they paid — staff must verify)
//   payment_claimed   → shows "Payment Claimed" badge + "Verify Payment" CTA + "Reject" option
//   paid              → shows "✓ Verified" badge (only set after staff clicks Verify)
function PaymentBadge({ order, onUpdate }) {
  const { paid, payment_claimed, id } = order

  const handleClaim        = () => updateOrder(id, { payment_claimed: true }).then(onUpdate)
  const handleVerifyPaid   = () => updateOrder(id, { paid: true, payment_claimed: false }).then(onUpdate)
  const handleRejectClaim  = () => updateOrder(id, { payment_claimed: false }).then(onUpdate)
  const handleRevertPaid   = () => updateOrder(id, { paid: false }).then(onUpdate)

  // ── State 3: Verified ──
  if (paid) {
    return (
      <button
        className="btn-paid-revert"
        onClick={handleRevertPaid}
        title="Click to revert to unpaid"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 999,
          border: '1.5px solid #86EFAC',
          background: '#F0FDF4',
          color: '#16A34A',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
        }}
      >
        <span style={{ fontSize: 10 }}>✓</span> Verified
      </button>
    )
  }

  // ── State 2: Customer claimed payment — awaiting staff verification ──
  if (payment_claimed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        {/* Status badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 999,
            background: '#FFFBEB',
            color: '#B45309',
            border: '1.5px solid #FDE68A',
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          }}
        >
          <span style={{ fontSize: 10 }}>⏳</span> Payment Claimed
        </span>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            className="btn-verify"
            onClick={handleVerifyPaid}
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              padding: '4px 11px',
              borderRadius: 999,
              border: 'none',
              background: '#16A34A',
              color: 'white',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}
          >
            ✓ Verify Payment
          </button>
          <button
            className="btn-reject"
            onClick={handleRejectClaim}
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 999,
              border: '1.5px solid #FECACA',
              background: 'white',
              color: '#DC2626',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ✕ Reject
          </button>
        </div>
      </div>
    )
  }

  // ── State 1: Unpaid ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 999,
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1.5px solid #FECACA',
          whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
        }}
      >
        <span style={{ fontSize: 10 }}>●</span> Unpaid
      </span>
      <button
        className="btn-pill"
        onClick={handleClaim}
        title="Mark as claimed by customer"
        style={{
          fontSize: 11,
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          padding: '3px 10px',
          borderRadius: 999,
          border: '1.5px solid #FDE68A',
          background: 'white',
          color: '#B45309',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Mark Claimed
      </button>
    </div>
  )
}

// ── Order Card ────────────────────────────────────────────────────────────────
function formatRelativeTime(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}

// ── Inline editable field ─────────────────────────────────────────────────────
function InlineField({ label, value, placeholder, onSave, prefix, inputType = 'text', multiline = false }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  const startEdit = () => {
    setDraft(value != null ? String(value) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const commit = useCallback(async () => {
    if (!editing) return
    setEditing(false)
    const trimmed = draft.trim()
    // Determine the real saved value
    let saveVal
    if (inputType === 'number') {
      saveVal = trimmed === '' ? null : parseFloat(trimmed)
      if (trimmed !== '' && isNaN(saveVal)) return // invalid number — discard
    } else {
      saveVal = trimmed === '' ? null : trimmed
    }
    // Only call API if value actually changed
    const current = value != null ? value : null
    if (saveVal === current) return
    setSaving(true)
    try { await onSave(saveVal) } finally { setSaving(false) }
  }, [editing, draft, inputType, value, onSave])

  const cancel = () => setEditing(false)

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit() }
    if (e.key === 'Escape') cancel()
  }

  const hasValue = value != null && String(value).trim() !== ''

  const labelEl = (
    <span
      style={{
        fontSize: 10,
        color: 'var(--color-text-muted)',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {label}
    </span>
  )

  if (editing) {
    const sharedInputStyle = {
      fontFamily: 'var(--font-body)',
      fontSize: inputType === 'number' ? 14 : 13,
      fontWeight: inputType === 'number' ? 700 : 400,
      color: 'var(--color-text-primary)',
      background: '#F0F7FF',
      border: '1.5px solid #93C5FD',
      borderRadius: 6,
      padding: '3px 7px',
      outline: 'none',
      width: '100%',
      letterSpacing: inputType === 'number' ? '-0.01em' : 'normal',
    }
    return (
      <div style={{ display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 6, marginBottom: 4 }}>
        {labelEl}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          {prefix && inputType === 'number' && (
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', flexShrink: 0 }}>{prefix}</span>
          )}
          {multiline ? (
            <textarea
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={onKeyDown}
              rows={2}
              style={{ ...sharedInputStyle, resize: 'none', lineHeight: 1.4 }}
            />
          ) : (
            <input
              ref={inputRef}
              type={inputType === 'number' ? 'number' : 'text'}
              min={inputType === 'number' ? '0' : undefined}
              step={inputType === 'number' ? '0.01' : undefined}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={onKeyDown}
              style={sharedInputStyle}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="inline-field-row"
      style={{ display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 6, marginBottom: 4 }}
    >
      {labelEl}
      <button
        onClick={startEdit}
        title="Click to edit"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: inputType === 'number' ? 14 : 13,
          fontWeight: inputType === 'number' ? 700 : 400,
          color: hasValue ? (inputType === 'number' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)') : '#A0AEC0',
          fontStyle: hasValue ? 'normal' : 'italic',
          background: 'transparent',
          border: 'none',
          padding: '1px 4px',
          borderRadius: 4,
          cursor: 'text',
          textAlign: 'left',
          letterSpacing: inputType === 'number' ? '-0.01em' : 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: multiline ? 'normal' : 'nowrap',
          maxWidth: '100%',
          opacity: saving ? 0.5 : 1,
          transition: 'background 0.12s',
        }}
      >
        {hasValue
          ? (inputType === 'number' ? `${prefix ?? ''}${Number(value).toFixed(2)}` : value)
          : placeholder}
      </button>
    </div>
  )
}

function OrderCard({ order, onUpdate }) {
  const lastUpdated = order.updated_at || order.created_at
  const relativeTime = formatRelativeTime(lastUpdated)

  const handleStatus = async (newStatus) => {
    await updateOrder(order.id, { status: newStatus })
    onUpdate()
  }

  const saveField = useCallback(async (field, val) => {
    await updateOrder(order.id, { [field]: val })
    onUpdate()
  }, [order.id, onUpdate])

  return (
    <div
      className="order-card"
      style={{
        background: 'white',
        borderRadius: 12,
        border: '1.5px solid var(--color-border)',
        padding: '14px 15px 12px',
        marginBottom: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Top row: customer name + payment badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: 13.5,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {order.customer_name}
          </span>
          {order.customer_phone && (
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: 'var(--color-text-muted)',
                fontWeight: 400,
                marginTop: 1,
                letterSpacing: '0.01em',
              }}
            >
              📞 {order.customer_phone}
            </span>
          )}
        </div>
        <PaymentBadge order={order} onUpdate={onUpdate} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 8, opacity: 0.6 }} />

      {/* Editable fields */}
      <InlineField
        label="Item"
        value={order.item && order.item.trim() !== '' ? order.item : null}
        placeholder="— tap to add item"
        onSave={val => saveField('item', val ?? '')}
      />
      <InlineField
        label="Amt"
        value={order.amount}
        placeholder="— tap to add amount"
        inputType="number"
        prefix="RM "
        onSave={val => saveField('amount', val)}
      />
      <InlineField
        label="Notes"
        value={order.notes || null}
        placeholder="— tap to add notes"
        multiline
        onSave={val => saveField('notes', val)}
      />

      {/* Last updated timestamp */}
      {relativeTime && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)', opacity: 0.7 }}>↻</span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              color: 'var(--color-text-muted)',
              fontWeight: 400,
              opacity: 0.8,
            }}
          >
            Updated {relativeTime}
          </span>
        </div>
      )}

      {/* Move-to buttons */}
      <div style={{ display: 'flex', gap: 6, marginTop: 11, flexWrap: 'wrap' }}>
        {STATUS_COLS.filter((s) => s !== order.status).map((s) => (
          <button
            key={s}
            className="btn-move"
            onClick={() => handleStatus(s)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 500,
              padding: '4px 11px',
              borderRadius: 999,
              border: `1.5px solid ${TARGET_ACCENT[s]}22`,
              color: TARGET_ACCENT[s],
              background: TARGET_LIGHT[s],
              cursor: 'pointer',
              textTransform: 'capitalize',
              letterSpacing: '0.01em',
            }}
          >
            → {COL_CONFIG[s].label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Board ─────────────────────────────────────────────────────────────────────
export default function OrderBoard({ orders, onUpdate }) {
  const grouped = STATUS_COLS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s)
    return acc
  }, {})

  const totalOrders = orders.length

  return (
    <div>
      {/* Board header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Order Board
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-text-muted)',
            fontWeight: 400,
          }}
        >
          {totalOrders} order{totalOrders !== 1 ? 's' : ''}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
        className="sm:grid-cols-3 grid-cols-1"
      >
        {STATUS_COLS.map((col) => {
          const cfg = COL_CONFIG[col]
          const count = grouped[col].length
          return (
            <div
              key={col}
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                border: `1.5px solid ${cfg.border}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                background: cfg.bg,
              }}
            >
              {/* Accent top strip */}
              <div style={{ height: 4, background: cfg.accent }} />

              {/* Column body */}
              <div style={{ background: cfg.bg, padding: '14px 12px 16px' }}>
                {/* Column header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    paddingBottom: 10,
                    borderBottom: `1px solid ${cfg.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {/* Color dot */}
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: cfg.accent,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: cfg.accent,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 9px',
                      borderRadius: 999,
                      background: 'white',
                      color: cfg.accent,
                      border: `1px solid ${cfg.border}`,
                      minWidth: 24,
                      textAlign: 'center',
                    }}
                  >
                    {count}
                  </span>
                </div>

                {count === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '24px 0 16px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6, opacity: 0.4 }}>
                      {col === 'pending' ? '📋' : col === 'confirmed' ? '✅' : '📦'}
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 12,
                        margin: 0,
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      No orders
                    </p>
                  </div>
                ) : (
                  grouped[col].map((o) => (
                    <OrderCard key={o.id} order={o} onUpdate={onUpdate} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
