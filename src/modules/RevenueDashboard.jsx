import { useState, useEffect } from 'react'
import { T, Card, SectionHeader, ProgressBar, Badge } from '../components/ui.jsx'
import { getClients, getSettings } from '../utils/storage.js'

function StatBox({ label, value, sub, color = T.blue, bg = T.blueLight, icon }) {
  return (
    <Card style={{ background: bg, border: 'none', padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color, opacity: 0.75, marginTop: 2 }}>{sub}</div>}
        </div>
        <span style={{ fontSize: 28, opacity: 0.6 }}>{icon}</span>
      </div>
    </Card>
  )
}

export default function RevenueDashboard() {
  const [clients, setClients] = useState([])
  const [cur, setCur] = useState('₵')
  const [country, setCountry] = useState('Ghana')

  const loadData = () => {
    setClients(getClients())
    const settings = getSettings()
    setCur(settings.currency || '₵')
    setCountry(settings.country || 'Ghana')
  }

  useEffect(() => {
    loadData()
    // Listen for settings updates so dashboard refreshes immediately when currency changes
    window.addEventListener('fds-settings-updated', loadData)
    return () => window.removeEventListener('fds-settings-updated', loadData)
  }, [])

  const active = clients.filter(c => c.status === 'active')
  const won = clients.filter(c => c.status === 'won' || c.status === 'active')
  const pitched = clients.filter(c => c.status === 'pitched')
  const lost = clients.filter(c => c.status === 'lost')

  const mrr = active.reduce((s, c) => s + (parseFloat(c.monthlyValue) || 0), 0)
  const arr = mrr * 12
  const pipeline = pitched.reduce((s, c) => s + (parseFloat(c.monthlyValue) || 0), 0)
  const winRate = won.length + lost.length > 0
    ? Math.round((won.length / (won.length + lost.length)) * 100)
    : 0

  const byPackage = { Starter: 0, Growth: 0, Premium: 0 }
  active.forEach(c => {
    if (byPackage[c.package] !== undefined) byPackage[c.package]++
  })

  const dueFollowUps = clients.filter(c =>
    c.followUpDate &&
    new Date(c.followUpDate) <= new Date() &&
    c.status !== 'won' &&
    c.status !== 'lost' &&
    c.status !== 'active'
  )

  const funnel = [
    { label: 'Leads',       count: clients.filter(c => c.status === 'lead').length,    color: T.blue },
    { label: 'Audited',     count: clients.filter(c => c.status === 'audited').length,  color: '#7C3AED' },
    { label: 'Pitched',     count: pitched.length,                                      color: T.warning },
    { label: 'Won / Active',count: won.length,                                          color: T.success },
  ]
  const maxFunnel = Math.max(...funnel.map(f => f.count), 1)

  return (
    <div>
      <SectionHeader icon="💰" title="Revenue Dashboard" subtitle="Your complete business performance overview at a glance." />

      {/* CURRENCY BANNER */}
      {country && (
        <div style={{
          background: T.blueLight, border: `1px solid #C7D8FF`,
          borderRadius: 10, padding: '10px 16px', marginBottom: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 13, color: T.blue, fontWeight: 600 }}>
            📍 {country} — All values shown in <strong>{cur}</strong>
          </span>
          <span style={{ fontSize: 12, color: T.textLight }}>
            Change in Settings ⚙️
          </span>
        </div>
      )}

      {/* KEY METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <StatBox
          label="Monthly Recurring Revenue"
          value={`${cur}${mrr.toFixed(0)}`}
          sub={`${cur}${arr.toFixed(0)} annually`}
          color={T.success} bg={T.successLight} icon="💷"
        />
        <StatBox
          label="Pipeline Value"
          value={`${cur}${pipeline}/mo`}
          sub={`${pitched.length} proposals pending`}
          color={T.warning} bg={T.warningLight} icon="🔮"
        />
        <StatBox
          label="Active Clients"
          value={active.length}
          sub="On monthly retainer"
          color={T.blue} bg={T.blueLight} icon="👥"
        />
        <StatBox
          label="Win Rate"
          value={`${winRate}%`}
          sub={`${won.length} won, ${lost.length} lost`}
          color={T.gold} bg={T.goldLight} icon="🎯"
        />
      </div>

      {/* SALES FUNNEL */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: T.dark }}>📊 Sales Pipeline</h3>
        {funnel.map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.dark }}>{f.label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: f.color }}>{f.count}</span>
            </div>
            <ProgressBar value={f.count} max={maxFunnel} color={f.color} height={8} />
          </div>
        ))}
      </Card>

      {/* PACKAGES BREAKDOWN */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: T.dark }}>📦 Active Packages</h3>
        {['Starter', 'Growth', 'Premium'].map(pkg => (
          <div key={pkg} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', background: T.grayLight, borderRadius: 8, marginBottom: 8
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.dark }}>{pkg}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.blue }}>
                {byPackage[pkg] || 0} client{byPackage[pkg] !== 1 ? 's' : ''}
              </span>
              {byPackage[pkg] > 0 && <Badge>{byPackage[pkg]}</Badge>}
            </div>
          </div>
        ))}

        {/* MRR per package */}
        {active.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.grayBorder}` }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.textLight, marginBottom: 10 }}>REVENUE BY PACKAGE</p>
            {['Starter', 'Growth', 'Premium'].map(pkg => {
              const pkgClients = active.filter(c => c.package === pkg)
              const pkgRevenue = pkgClients.reduce((s, c) => s + (parseFloat(c.monthlyValue) || 0), 0)
              if (pkgRevenue === 0) return null
              return (
                <div key={pkg} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: T.dark }}>{pkg}</span>
                  <span style={{ fontWeight: 700, color: T.success }}>{cur}{pkgRevenue}/mo</span>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.grayBorder}` }}>
              <span style={{ color: T.dark }}>Total MRR</span>
              <span style={{ color: T.success }}>{cur}{mrr}/mo</span>
            </div>
          </div>
        )}
      </Card>

      {/* FOLLOW-UPS DUE */}
      {dueFollowUps.length > 0 && (
        <Card style={{ background: T.dangerLight, border: `1.5px solid #FCA5A5`, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: T.danger }}>
            ⏰ Follow-ups Due ({dueFollowUps.length})
          </h3>
          {dueFollowUps.map(c => (
            <div key={c.id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 12px', background: T.white, borderRadius: 8, marginBottom: 8
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>{c.businessName}</div>
                <div style={{ fontSize: 12, color: T.textLight }}>{c.contactName} · {c.city}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: T.danger, fontWeight: 700 }}>
                  {new Date(c.followUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
                {c.phone && (
                  <a href={`tel:${c.phone}`} style={{ fontSize: 12, color: T.blue, textDecoration: 'none' }}>
                    📞 Call
                  </a>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* EMPTY STATE */}
      {clients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: T.textLight }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 6 }}>No data yet</h3>
          <p style={{ fontSize: 13 }}>Add your first client in Client Tracker to see your revenue dashboard populate.</p>
        </div>
      )}
    </div>
  )
}
