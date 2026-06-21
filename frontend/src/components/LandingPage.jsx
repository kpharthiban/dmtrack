import { useNavigate } from 'react-router-dom'

/* ── Small reusable pieces ─────────────────────────────────────────────────── */

function FeatureCard({ icon, title, desc }) {
  return (
    <div
      className="feature-card"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E8E6',
        borderRadius: 16,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: '#FFF8EC',
          border: '1px solid #F0D9A8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 16,
            color: '#1A1A18',
            marginBottom: 6,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: '#6B6B67',
            lineHeight: 1.6,
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  )
}

function StepBubble({ num, text }) {
  return (
    <div className="flex items-start gap-4">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#1A1A18',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {num}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: '#1A1A18',
          lineHeight: 1.6,
          paddingTop: 6,
        }}
      >
        {text}
      </p>
    </div>
  )
}

function TestimonialCard({ name, biz, quote }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2)
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E8E6',
        borderRadius: 16,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: '#1A1A18',
          lineHeight: 1.65,
          fontStyle: 'italic',
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#FFF8EC',
            border: '1px solid #F0D9A8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 13,
            color: '#D97706',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: '#1A1A18' }}>{name}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#A8A8A4' }}>{biz}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Mock dashboard preview ─────────────────────────────────────────────────── */

function MockDashboard() {
  const cards = [
    { name: 'Auntie Rosnah', item: 'Kek lapis sarawak × 2', status: 'pending', amount: 'RM 85' },
    { name: 'Encik Farid', item: 'Baju kurung custom × 1', status: 'confirmed', amount: 'RM 220' },
    { name: 'Kak Yati', item: 'Kuih raya assorted × 5', status: 'delivered', amount: 'RM 130' },
  ]

  const statusStyles = {
    pending:   { bg: '#FFF8EC', border: '#F0D9A8', dot: '#D97706', label: 'Pending' },
    confirmed: { bg: '#EFF5FF', border: '#B8D4F5', dot: '#2563EB', label: 'Confirmed' },
    delivered: { bg: '#F0FBF4', border: '#A8D9B8', dot: '#16A34A', label: 'Delivered' },
  }

  return (
    <div
      style={{
        background: '#FAFAFA',
        border: '1px solid #E8E8E6',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.09)',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Mock header bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E8E8E6',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, letterSpacing: '-0.04em', lineHeight: 1 }}>
          <span style={{ color: '#D97706' }}>DM</span><span style={{ color: '#1A1A18' }}>Track</span>
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 99, padding: '3px 10px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: '#15803D', fontFamily: 'var(--font-body)' }}>Live</span>
        </div>
      </div>

      {/* Mock stat strip */}
      <div style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'Total Orders', value: '12', color: '#2563EB' },
          { label: 'Collected', value: 'RM 980', color: '#16A34A' },
          { label: 'Outstanding', value: 'RM 145', color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#FFF', border: '1px solid #E8E8E6', borderRadius: 10, padding: '10px 12px', borderLeft: `3px solid ${s.color}` }}>
            <p style={{ fontSize: 10, color: '#A8A8A4', fontFamily: 'var(--font-body)', marginBottom: 3 }}>{s.label}</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A18', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Mock kanban cards */}
      <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cards.map(c => {
          const s = statusStyles[c.status]
          return (
            <div
              key={c.name}
              style={{
                background: '#FFF',
                border: `1px solid ${s.border}`,
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#1A1A18' }}>{c.name}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#6B6B67', marginTop: 2 }}>{c.item}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#1A1A18' }}>{c.amount}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 99, padding: '2px 8px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                  <span style={{ fontSize: 10, fontWeight: 500, color: s.dot, fontFamily: 'var(--font-body)' }}>{s.label}</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main Landing Page ─────────────────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E8E8E6',
          padding: '0 40px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            <span style={{ color: '#D97706' }}>DM</span><span style={{ color: '#1A1A18' }}>Track</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <a
            href="#features"
            style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B6B67', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => e.target.style.background = '#F5F5F4'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B6B67', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => e.target.style.background = '#F5F5F4'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            How it works
          </a>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginLeft: 8,
              background: '#1A1A18',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '9px 20px',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.15s, transform 0.12s',
            }}
            onMouseEnter={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
          >
            Open Dashboard →
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '80px 40px 64px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }}
      >
        {/* Left: copy */}
        <div>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFF8EC',
              border: '1px solid #F0D9A8',
              borderRadius: 99,
              padding: '5px 14px',
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 14 }}>💬</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#D97706' }}>
              WhatsApp-native CRM for home businesses
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              lineHeight: 1.1,
              color: '#1A1A18',
              letterSpacing: '-0.035em',
              marginBottom: 20,
            }}
          >
            Orders masuk,<br />
            <span style={{ color: '#D97706' }}>semua teratur.</span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 17,
              color: '#6B6B67',
              lineHeight: 1.65,
              marginBottom: 36,
              maxWidth: 440,
            }}
          >
            DMTrack listens to your WhatsApp DMs and automatically builds your order board, tracks payments, and manages customers — <strong style={{ color: '#1A1A18', fontWeight: 600 }}>tanpa you buat apa-apa</strong>.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#1A1A18',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '14px 28px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'opacity 0.15s, transform 0.12s, box-shadow 0.15s',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => { e.target.style.opacity = '0.88'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)' }}
            >
              Go to Dashboard →
            </button>
            <a
              href="#how-it-works"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                color: '#6B6B67',
                textDecoration: 'none',
                padding: '14px 4px',
                borderBottom: '1px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.target.style.color = '#1A1A18'; e.target.style.borderBottomColor = '#1A1A18' }}
              onMouseLeave={e => { e.target.style.color = '#6B6B67'; e.target.style.borderBottomColor = 'transparent' }}
            >
              See how it works ↓
            </a>
          </div>

          {/* Trust strip */}
          <div
            style={{
              marginTop: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            {[
              { icon: '🧁', label: 'Home bakers' },
              { icon: '🧵', label: 'Tailors & seamstresses' },
              { icon: '🛍️', label: 'Online traders' },
            ].map(t => (
              <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#A8A8A4', fontWeight: 400 }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: mock dashboard */}
        <div style={{ position: 'relative' }}>
          {/* Decorative blob behind the mock */}
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -20,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFF8EC 0%, transparent 70%)',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <MockDashboard />
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E8E8E6',
          borderBottom: '1px solid #E8E8E6',
          padding: '72px 40px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#D97706', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              Semua dalam satu tempat
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(28px, 3vw, 40px)',
                color: '#1A1A18',
                letterSpacing: '-0.03em',
                marginBottom: 16,
              }}
            >
              Built for the way you already work
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#6B6B67', maxWidth: 480, margin: '0 auto' }}>
              No new apps to learn. No forms to fill. Just WhatsApp like you always do — DMTrack handles the rest.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <FeatureCard
              icon="🤖"
              title="AI yang faham Manglish"
              desc="Powered by Google Gemini — understands 'tambah 2 lagi', 'tukar vanilla', 'dah bayar tadi' and even voice notes."
            />
            <FeatureCard
              icon="📋"
              title="Auto Order Board"
              desc="Every DM becomes an order card. Pending, Confirmed, Delivered — moves as you update, all in real-time."
            />
            <FeatureCard
              icon="💰"
              title="Payment Tracker"
              desc="Customers say 'dah transfer'? The app flags it for you to verify. No more lost payments in long message threads."
            />
            <FeatureCard
              icon="👥"
              title="Customer History"
              desc="See each customer's total orders, spend, and outstanding balance at a glance — no spreadsheet needed."
            />
            <FeatureCard
              icon="📡"
              title="Live Feed"
              desc="Watch messages come in and get parsed live. Full audit trail of what the AI picked up from each DM."
            />
            <FeatureCard
              icon="🔒"
              title="Your number, your data"
              desc="Runs on your own machine, linked to your own WhatsApp number. No third-party servers touching your chats."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{ padding: '72px 40px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Left: steps */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#D97706', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              Cara guna
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(26px, 2.8vw, 36px)',
                color: '#1A1A18',
                letterSpacing: '-0.03em',
                marginBottom: 40,
              }}
            >
              3 steps je,<br />lepas tu relax
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <StepBubble num="1" text="Scan QR code dalam tab 'Connect WhatsApp' untuk link your number." />
              <StepBubble num="2" text="Customers DM you macam biasa — for orders, payments, changes, anything." />
              <StepBubble num="3" text="Dashboard auto-updates. Orders sorted, payments tracked, customers remembered." />
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                marginTop: 40,
                background: '#1A1A18',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '13px 26px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'opacity 0.15s, transform 0.12s',
              }}
              onMouseEnter={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
            >
              Cuba sekarang →
            </button>
          </div>

          {/* Right: testimonials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TestimonialCard
              name="Auntie Rosnah"
              biz="Kek Lapis & Kuih Raya, Sarawak"
              quote="Dulu I kena scroll balik semua chat nak tengok mana order dah bayar. Sekarang bukak DMTrack je, semua dah ada."
            />
            <TestimonialCard
              name="Kak Yati"
              biz="Jahit Baju, Klang"
              quote="Customer order through WhatsApp, I tak payah type apa-apa dalam spreadsheet. Terus nampak dalam board. Senang gila."
            />
            <TestimonialCard
              name="Encik Farid"
              biz="Online Trader, Johor Bahru"
              quote="Yang best sekali, dia faham voice note pun. Customer cakap dalam VN, order terus masuk. Magic betul."
            />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#1A1A18',
          padding: '72px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#D97706', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
            Dah ready?
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              color: '#FFFFFF',
              letterSpacing: '-0.035em',
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            Stop managing orders<br />in your head.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: '#A8A8A4',
              marginBottom: 36,
              lineHeight: 1.6,
            }}
          >
            Link your WhatsApp, go to the dashboard, and let DMTrack do the heavy lifting.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#FFFFFF',
              color: '#1A1A18',
              border: 'none',
              borderRadius: 12,
              padding: '15px 32px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.15s, transform 0.12s, box-shadow 0.15s',
              boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
            }}
            onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(255,255,255,0.15)' }}
          >
            Open Dashboard →
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E8E8E6',
          padding: '28px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.04em', lineHeight: 1 }}>
            <span style={{ color: '#D97706' }}>DM</span><span style={{ color: '#1A1A18' }}>Track</span>
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#A8A8A4' }}>
          Built with ❤️ for Malaysian home businesses
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: '1px solid #E8E8E6',
            borderRadius: 8,
            padding: '7px 16px',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: '#6B6B67',
            cursor: 'pointer',
            transition: 'background 0.13s, color 0.13s',
          }}
          onMouseEnter={e => { e.target.style.background = '#F5F5F4'; e.target.style.color = '#1A1A18' }}
          onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#6B6B67' }}
        >
          Dashboard →
        </button>
      </footer>
    </div>
  )
}
