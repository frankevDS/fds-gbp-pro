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

// ─── CLIENT HEALTH SCORE ──────────────────────────────────────────────────────
function calcHealthScore(client) {
  let score = 0
  const reasons = []
  const warnings = []

  // Positive signals
  if (client.status === 'active') { score += 30; }
  if (client.monthlyValue && parseFloat(client.monthlyValue) > 0) { score += 20; }
  if (client.gbpUrl) { score += 10; reasons.push('GBP profile linked') }
  if (client.website) { score += 5; reasons.push('Website on file') }
  if (client.email) { score += 5; reasons.push('Email contact available') }
  if (client.phone) { score += 5; reasons.push('Phone contact available') }
  if (client.auditScore && parseInt(client.auditScore) >= 7) { score += 10; reasons.push(`Audit score ${client.auditScore}/10`) }
  else if (client.auditScore && parseInt(client.auditScore) >= 4) { score += 5 }

  // Follow-up health
  if (client.followUpDate) {
    const daysUntil = Math.floor((new Date(client.followUpDate) - new Date()) / (1000 * 60 * 60 * 24))
    if (daysUntil >= 0 && daysUntil <= 30) { score += 10; reasons.push('Follow-up scheduled') }
    if (daysUntil < 0) { score -= 15; warnings.push(`Follow-up overdue by ${Math.abs(daysUntil)} days`) }
  } else {
    warnings.push('No follow-up date set')
  }

  // Status penalties
  if (client.status === 'lost') { score -= 40; warnings.push('Client lost') }
  if (client.status === 'paused') { score -= 10; warnings.push('Account paused') }
  if (client.status === 'lead' || client.status === 'audited') { warnings.push('Not yet converted') }

  // Audit score warnings
  if (client.auditScore && parseInt(client.auditScore) < 4) { warnings.push(`Low audit score: ${client.auditScore}/10`) }

  const pct = Math.min(100, Math.max(0, score))
  const health = pct >= 75 ? { label: 'Healthy',  color: T.success, bg: T.successLight }
               : pct >= 50 ? { label: 'Fair',     color: T.warning, bg: T.warningLight }
               : pct >= 25 ? { label: 'At Risk',  color: '#EA580C', bg: '#FFF7ED' }
               :             { label: 'Critical', color: T.danger,  bg: T.dangerLight }

  return { pct, health, reasons, warnings }
}

function ClientHealthCard({ client, cur }) {
  const [expanded, setExpanded] = useState(false)
  const hs = calcHealthScore(client)

  return (
    <div style={{
      background: T.white, border: `1px solid ${T.grayBorder}`,
      borderLeft: `4px solid ${hs.health.color}`,
      borderRadius: 10, padding: '12px 14px', marginBottom: 10,
      boxShadow: '0 1px 4px rgba(15,28,63,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: T.dark }}>{client.businessName}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: hs.health.bg, color: hs.health.color }}>
              {hs.health.label}
            </span>
            {client.package && client.package !== 'None yet' && (
              <Badge color={T.gold} bg={T.goldLight}>{client.package}</Badge>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 6, background: T.grayBorder, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${hs.pct}%`, background: hs.health.color, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: hs.health.color, flexShrink: 0 }}>{hs.pct}%</span>
          </div>
          {client.monthlyValue && (
            <div style={{ fontSize: 12, color: T.success, fontWeight: 700, marginTop: 4 }}>{cur}{client.monthlyValue}/mo</div>
          )}
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{
          width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.grayBorder}`,
          background: T.grayLight, cursor: 'pointer', fontSize: 12, flexShrink: 0
        }}>{expanded ? '▲' : '▼'}</button>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.grayBorder}` }} className="animate-fadeIn">
          {hs.warnings.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.danger, marginBottom: 4 }}>⚠️ WARNINGS</p>
              {hs.warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: T.danger, padding: '3px 0' }}>• {w}</div>
              ))}
            </div>
          )}
          {hs.reasons.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.success, marginBottom: 4 }}>✅ POSITIVE SIGNALS</p>
              {hs.reasons.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: T.success, padding: '3px 0' }}>• {r}</div>
              ))}
            </div>
          )}
          {client.followUpDate && (
            <div style={{ marginTop: 8, fontSize: 12, color: T.textLight }}>
              📅 Follow up: {new Date(client.followUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RevenueDashboard() {
  const [clients, setClients] = useState([])
  const [cur, setCur] = useState('₵')
  const [country, setCountry] = useState('Ghana')
  const [tab, setTab] = useState('overview')

  const loadData = () => {
    setClients(getClients())
    const settings = getSettings()
    setCur(settings.currency || '₵')
    setCountry(settings.country || 'Ghana')
  }

  useEffect(() => {
    loadData()
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
  const winRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0

  const byPackage = { Starter: 0, Growth: 0, Premium: 0 }
  active.forEach(c => { if (byPackage[c.package] !== undefined) byPackage[c.package]++ })

  const dueFollowUps = clients.filter(c =>
    c.followUpDate && new Date(c.followUpDate) <= new Date() &&
    c.status !== 'won' && c.status !== 'lost' && c.status !== 'active'
  )

  // Health score summary
  const healthScores = clients.map(c => ({ client: c, hs: calcHealthScore(c) }))
  const atRisk = healthScores.filter(({ hs }) => hs.pct < 50 && ['active','won'].includes(c.status)).length
  const avgHealth = healthScores.length > 0 ? Math.round(healthScores.reduce((s, { hs }) => s + hs.pct, 0) / healthScores.length) : 0

  const funnel = [
    { label: 'Leads',        count: clients.filter(c => c.status === 'lead').length,    color: T.blue },
    { label: 'Audited',      count: clients.filter(c => c.status === 'audited').length,  color: '#7C3AED' },
    { label: 'Pitched',      count: pitched.length,                                      color: T.warning },
    { label: 'Won / Active', count: won.length,                                          color: T.success },
  ]
  const maxFunnel = Math.max(...funnel.map(f => f.count), 1)

  const tabStyle = (id) => ({
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
    background: tab === id ? T.blue : T.grayLight,
    color: tab === id ? '#fff' : T.textLight,
  })

  return (
    <div>
      <SectionHeader icon="💰" title="Revenue Dashboard" subtitle="Complete business performance overview — revenue, pipeline, and client health." />

      {/* CURRENCY BANNER */}
      {country && (
        <div style={{ background: T.blueLight, border: `1px solid #C7D8FF`, borderRadius: 10, padding: '10px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: T.blue, fontWeight: 600 }}>📍 {country} — All values in <strong>{cur}</strong></span>
          <span style={{ fontSize: 12, color: T.textLight }}>Change in Settings ⚙️</span>
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={tabStyle('overview')} onClick={() => setTab('overview')}>📊 Overview</button>
        <button style={tabStyle('health')} onClick={() => setTab('health')}>❤️ Client Health</button>
      </div>

      {/* ─── OVERVIEW TAB ─────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <StatBox label="Monthly Recurring Revenue" value={`${cur}${mrr.toFixed(0)}`} sub={`${cur}${arr.toFixed(0)} annually`} color={T.success} bg={T.successLight} icon="💷" />
            <StatBox label="Pipeline Value" value={`${cur}${pipeline}/mo`} sub={`${pitched.length} proposals pending`} color={T.warning} bg={T.warningLight} icon="🔮" />
            <StatBox label="Active Clients" value={active.length} sub="On monthly retainer" color={T.blue} bg={T.blueLight} icon="👥" />
            <StatBox label="Win Rate" value={`${winRate}%`} sub={`${won.length} won, ${lost.length} lost`} color={T.gold} bg={T.goldLight} icon="🎯" />
          </div>

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

          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: T.dark }}>📦 Active Packages</h3>
            {['Starter', 'Growth', 'Premium'].map(pkg => {
              const pkgClients = active.filter(c => c.package === pkg)
              const pkgRevenue = pkgClients.reduce((s, c) => s + (parseFloat(c.monthlyValue) || 0), 0)
              return (
                <div key={pkg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: T.grayLight, borderRadius: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.dark }}>{pkg}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {pkgRevenue > 0 && <span style={{ fontSize: 12, color: T.success, fontWeight: 700 }}>{cur}{pkgRevenue}/mo</span>}
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.blue }}>{byPackage[pkg] || 0} client{byPackage[pkg] !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )
            })}
            {mrr > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.grayBorder}` }}>
                <span style={{ color: T.dark }}>Total MRR</span>
                <span style={{ color: T.success }}>{cur}{mrr}/mo</span>
              </div>
            )}
          </Card>

          {dueFollowUps.length > 0 && (
            <Card style={{ background: T.dangerLight, border: `1.5px solid #FCA5A5`, marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: T.danger }}>⏰ Follow-ups Due ({dueFollowUps.length})</h3>
              {dueFollowUps.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: T.white, borderRadius: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>{c.businessName}</div>
                    <div style={{ fontSize: 12, color: T.textLight }}>{c.contactName} · {c.city}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: T.danger, fontWeight: 700 }}>
                      {new Date(c.followUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    {c.phone && <a href={`tel:${c.phone}`} style={{ fontSize: 12, color: T.blue, textDecoration: 'none' }}>📞 Call</a>}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {clients.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: T.textLight }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 6 }}>No data yet</h3>
              <p style={{ fontSize: 13 }}>Add your first client in Client Tracker to see your revenue dashboard.</p>
            </div>
          )}
        </>
      )}

      {/* ─── HEALTH TAB ───────────────────────────────────────────────────── */}
      {tab === 'health' && (
        <>
          {/* HEALTH SUMMARY */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <Card style={{ background: T.successLight, border: 'none', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.success }}>{avgHealth}%</div>
              <div style={{ fontSize: 11, color: T.success, fontWeight: 600, marginTop: 2 }}>Avg Health Score</div>
            </Card>
            <Card style={{ background: active.length > 0 ? T.blueLight : T.grayLight, border: 'none', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.blue }}>{healthScores.filter(({ hs }) => hs.pct >= 75).length}</div>
              <div style={{ fontSize: 11, color: T.blue, fontWeight: 600, marginTop: 2 }}>Healthy Clients</div>
            </Card>
            <Card style={{ background: T.dangerLight, border: 'none', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.danger }}>{healthScores.filter(({ hs }) => hs.pct < 50).length}</div>
              <div style={{ fontSize: 11, color: T.danger, fontWeight: 600, marginTop: 2 }}>Need Attention</div>
            </Card>
          </div>

          <div style={{ background: T.blueLight, border: `1px solid #C7D8FF`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#1E40AF' }}>
            <strong>💡 How Health Score works:</strong> Each client is scored based on profile completeness, active retainer status, follow-up schedule, audit score, and account activity. Expand any card to see specific warnings and positive signals.
          </div>

          {clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: T.textLight }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 6 }}>No clients yet</h3>
              <p style={{ fontSize: 13 }}>Add clients in the Client Tracker to see health scores here.</p>
            </div>
          ) : (
            <>
              {/* Sort by health score — worst first so urgent ones are at the top */}
              {[...healthScores]
                .sort((a, b) => a.hs.pct - b.hs.pct)
                .map(({ client, hs }) => (
                  <ClientHealthCard key={client.id} client={client} cur={cur} />
                ))
              }
            </>
          )}
        </>
      )}
    </div>
  )
}
