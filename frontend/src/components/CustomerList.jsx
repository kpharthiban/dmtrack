export default function CustomerList({ customers }) {
  const initials = (name) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  if (!customers.length) return null

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '-0.01em',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Customers
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-text-muted)',
            fontWeight: 400,
          }}
        >
          {customers.length}
        </span>
      </div>

      {/* Horizontal scrolling row of customer cards */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          overflowX: 'auto',
          padding: '12px 16px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-border) transparent',
        }}
      >
        {customers.map((c, i) => (
          <div
            key={c.id}
            className="customer-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 16px',
              borderRadius: 10,
              flexShrink: 0,
              borderRight: i < customers.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#1A1A18',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                flexShrink: 0,
                letterSpacing: '0.02em',
              }}
            >
              {initials(c.name)}
            </div>

            {/* Info */}
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {c.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.total_orders} order{c.total_orders !== 1 ? 's' : ''}
                </span>
                <span style={{ color: 'var(--color-border)', fontSize: 11 }}>·</span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  RM {c.total_spend.toFixed(2)}
                </span>
                {c.outstanding > 0 && (
                  <>
                    <span style={{ color: 'var(--color-border)', fontSize: 11 }}>·</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 11,
                        color: '#DC2626',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      RM {c.outstanding.toFixed(2)} due
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
