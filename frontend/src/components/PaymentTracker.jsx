const CARDS = [
  { key: 'orders',      label: 'Total Orders',   accentColor: '#3B82F6' },
  { key: 'revenue',     label: 'Total Revenue',  accentColor: '#8B5CF6' },
  { key: 'collected',   label: 'Collected',      accentColor: '#22C55E' },
  { key: 'outstanding', label: 'Outstanding',    accentColor: '#EF4444' },
]

export default function PaymentTracker({ orders }) {
  const total       = orders.length
  const revenue     = orders.reduce((s, o) => s + (o.amount || 0), 0)
  const collected   = orders.filter((o) => o.paid).reduce((s, o) => s + (o.amount || 0), 0)
  const outstanding = revenue - collected

  const values = {
    orders:      total,
    revenue:     `RM ${revenue.toFixed(2)}`,
    collected:   `RM ${collected.toFixed(2)}`,
    outstanding: `RM ${outstanding.toFixed(2)}`,
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}
      className="sm:grid-cols-4 grid-cols-2"
    >
      {CARDS.map((c) => (
        <div
          key={c.key}
          className="stat-card"
          style={{
            background: 'white',
            borderRadius: 14,
            border: '1px solid var(--color-border)',
            borderLeft: `3px solid ${c.accentColor}`,
            padding: '18px 20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            {c.label}
          </p>
          <p
            className="display-heading"
            style={{
              fontSize: '1.75rem',
              color: 'var(--color-text-primary)',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {values[c.key]}
          </p>
        </div>
      ))}
    </div>
  )
}
