import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getCustomers } from './api/client'
import OrderBoard from './components/OrderBoard'
import CustomerList from './components/CustomerList'
import PaymentTracker from './components/PaymentTracker'
import LiveFeed from './components/LiveFeed'
import WhatsAppConnect from './components/WhatsAppConnect'

const TABS = ['Dashboard', 'Live Feed', 'Connect WhatsApp']

export default function App() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  // useCallback so the stable reference can safely be passed to LiveFeed
  const fetchData = useCallback(async () => {
    try {
      const [ordRes, custRes] = await Promise.all([getOrders(), getCustomers()])
      setOrders(ordRes.data)
      setCustomers(custRes.data)
      setLastUpdated(new Date())
    } catch (_) {
      // backend not yet started — fail silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  const TAB_ICONS = {
    'Dashboard': (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/>
      </svg>
    ),
    'Live Feed': (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7.5" cy="7.5" r="2" fill="currentColor"/>
        <path d="M3.5 11.5C2.3 10.3 1.5 8.7 1.5 7.5C1.5 6.3 2.3 4.7 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M11.5 3.5C12.7 4.7 13.5 6.3 13.5 7.5C13.5 8.7 12.7 10.3 11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M1.5 13.5C-0.1 11.9 -1 9.8 -1 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    'Connect WhatsApp': (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 1C3.91 1 1 3.91 1 7.5C1 8.78 1.37 9.97 2 10.97L1 14L4.2 13.04C5.17 13.64 6.3 14 7.5 14C11.09 14 14 11.09 14 7.5C14 3.91 11.09 1 7.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.5 6C5.5 6 5.5 9.5 9.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <header
        className="bg-white flex items-center justify-between"
        style={{
          borderBottom: '1px solid var(--color-border)',
          padding: '0 32px',
          height: '64px',
        }}
      >
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          {/* Back to Home */}
          <button
            onClick={() => navigate('/')}
            title="Back to Home"
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '5px 10px',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'background 0.13s, color 0.13s',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginRight: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F4'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
          >
            ← Home
          </button>
          <div>
            <h1 style={{ margin: 0, lineHeight: 1 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}>
                <span style={{ color: '#D97706' }}>DM</span><span style={{ color: 'var(--color-text-primary)' }}>Track</span>
              </span>
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'var(--color-text-muted)',
                marginTop: 3,
                fontWeight: 400,
                letterSpacing: '0.005em',
              }}
            >
              WhatsApp Order Brain
            </p>
          </div>
        </div>

        {/* Right status row */}
        <div className="flex items-center gap-3">
          {/* Live badge */}
          <div
            className="flex items-center gap-1.5 rounded-full"
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              padding: '5px 12px 5px 9px',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#15803D', fontFamily: 'var(--font-body)' }}>Live</span>
          </div>

          {/* Counts pill */}
          <div
            className="flex items-center gap-1 rounded-full"
            style={{
              background: '#F5F5F4',
              border: '1px solid var(--color-border)',
              padding: '5px 14px',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
              {orders.length}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>&nbsp;orders</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 5px', opacity: 0.4 }}>·</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
              {customers.length}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>&nbsp;customers</span>
          </div>

          {lastUpdated && (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </header>

      {/* Tab Nav */}
      <nav
        className="bg-white flex items-end"
        style={{ borderBottom: '1px solid var(--color-border)', padding: '0 32px', gap: 4 }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 tab-btn${active ? ' tab-btn-active' : ''}`}
              style={{
                padding: '11px 18px',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                fontFamily: 'var(--font-body)',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                borderBottom: active ? '2px solid #1A1A18' : '2px solid transparent',
                marginBottom: -1,
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid #1A1A18' : '2px solid transparent',
                cursor: 'pointer',
                letterSpacing: '-0.005em',
                transition: 'color 0.12s, border-color 0.12s',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ opacity: active ? 0.85 : 0.4, display: 'flex' }}>
                {TAB_ICONS[tab]}
              </span>
              {tab}
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '28px 40px 48px' }}>
        {loading && orders.length === 0 ? (
          <div className="text-center" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div
              className="animate-spin"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '2px solid var(--color-border)',
                borderTopColor: '#1A1A18',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
              DMTrack is connecting…
            </p>
            <p style={{ fontSize: 13, marginTop: 6, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              Make sure the FastAPI server is running on port 8000
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'Dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <PaymentTracker orders={orders} />
                <OrderBoard orders={orders} onUpdate={fetchData} />
                <CustomerList customers={customers} />
              </div>
            )}
            {activeTab === 'Live Feed' && (
              <div style={{ maxWidth: 720 }}>
                <LiveFeed onNewMessage={fetchData} />
              </div>
            )}
            {activeTab === 'Connect WhatsApp' && (
              <WhatsAppConnect />
            )}
          </>
        )}
      </main>
    </div>
  )
}
