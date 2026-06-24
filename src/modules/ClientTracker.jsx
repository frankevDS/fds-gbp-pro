import { useState, useEffect } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, EmptyState, StatusPill, Badge } from '../components/ui.jsx'
import { getClients, addClient, updateClient, deleteClient } from '../utils/storage.js'

const STATUS_OPTIONS = ['lead', 'audited', 'pitched', 'won', 'lost', 'active', 'paused']
const PACKAGE_OPTIONS = ['None yet', 'Starter', 'Growth', 'Premium']

function ClientForm({ initial = {}, onSave, onCancel }) {
  const [f, setF] = useState({
    businessName: '', contactName: '', phone: '', email: '', industry: '',
    city: '', status: 'lead', package: 'None yet', monthlyValue: '',
    auditScore: '', followUpDate: '', notes: '', gbpUrl: '', website: '',
    ...initial
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

  return (
    <div className="animate-fadeIn">
      <div style={grid2}>
        <Field label="Business Name" required><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Gloria's Hair Studio" /></Field>
        <Field label="Contact Person"><Input value={f.contactName} onChange={v => set('contactName', v)} placeholder="e.g. Gloria Osei" /></Field>
        <Field label="Phone"><Input value={f.phone} onChange={v => set('phone', v)} placeholder="e.g. 07700 900123" /></Field>
        <Field label="Email"><Input value={f.email} onChange={v => set('email', v)} placeholder="e.g. gloria@example.com" type="email" /></Field>
        <Field label="Industry"><Input value={f.industry} onChange={v => set('industry', v)} placeholder="e.g. Hair Salon" /></Field>
        <Field label="City"><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Manchester" /></Field>
        <Field label="Status">
          <Select value={f.status} onChange={v => set('status', v)} options={STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
        </Field>
        <Field label="Package">
          <Select value={f.package} onChange={v => set('package', v)} options={PACKAGE_OPTIONS} />
        </Field>
        <Field label="Monthly Value (£)"><Input value={f.monthlyValue} onChange={v => set('monthlyValue', v)} placeholder="e.g. 100" type="number" /></Field>
        <Field label="GBP Audit Score (/ 10)"><Input value={f.auditScore} onChange={v => set('auditScore', v)} placeholder="e.g. 4" type="number" /></Field>
        <Field label="Follow-Up Date"><Input value={f.followUpDate} onChange={v => set('followUpDate', v)} type="date" /></Field>
        <Field label="Website"><Input value={f.website} onChange={v => set('website', v)} placeholder="https://..." /></Field>
      </div>
      <Field label="GBP Profile URL (once set up)"><Input value={f.gbpUrl} onChange={v => set('gbpUrl', v)} placeholder="https://g.page/..." /></Field>
      <Field label="Notes"><Input value={f.notes} onChange={v => set('notes', v)} multiline rows={3} placeholder="Key conversation points, objections, agreed actions..." /></Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Btn onClick={() => onSave(f)} disabled={!f.businessName}>💾 Save Client</Btn>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  )
}

function ClientCard({ client, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const isFollowUpDue = client.followUpDate && new Date(client.followUpDate) <= new Date()

  return (
    <Card style={{ marginBottom: 12, borderLeft: `4px solid ${client.status === 'active' || client.status === 'won' ? T.success : client.status === 'lost' ? T.danger : T.blue}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: T.dark }}>{client.businessName}</span>
            <StatusPill status={client.status} />
            {client.package !== 'None yet' && <Badge color={T.gold} bg={T.goldLight}>{client.package}</Badge>}
            {isFollowUpDue && <Badge color={T.danger} bg={T.dangerLight}>⏰ Follow-up due</Badge>}
          </div>
          <div style={{ fontSize: 12, color: T.textLight, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {client.contactName && <span>👤 {client.contactName}</span>}
            {client.city && <span>📍 {client.city}</span>}
            {client.industry && <span>🏢 {client.industry}</span>}
            {client.monthlyValue && <span style={{ color: T.success, fontWeight: 700 }}>£{client.monthlyValue}/mo</span>}
            {client.auditScore && <span>📊 Score: {client.auditScore}/10</span>}
          </div>
          {client.followUpDate && (
            <div style={{ fontSize: 12, color: isFollowUpDue ? T.danger : T.textLight, marginTop: 4, fontWeight: isFollowUpDue ? 700 : 400 }}>
              📅 Follow up: {new Date(client.followUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <Btn size="sm" variant="outline" onClick={() => setExpanded(e => !e)}>{expanded ? '▲' : '▼'}</Btn>
          <Btn size="sm" variant="secondary" onClick={() => onEdit(client)}>✏️</Btn>
          <Btn size="sm" variant="danger" onClick={() => { if (confirm(`Delete ${client.businessName}?`)) onDelete(client.id) }}>🗑</Btn>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.grayBorder}` }} className="animate-fadeIn">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {client.phone && <div><span style={{ fontSize: 11, color: T.textLight, fontWeight: 600 }}>PHONE</span><div style={{ fontSize: 13 }}><a href={`tel:${client.phone}`} style={{ color: T.blue }}>{client.phone}</a></div></div>}
            {client.email && <div><span style={{ fontSize: 11, color: T.textLight, fontWeight: 600 }}>EMAIL</span><div style={{ fontSize: 13 }}><a href={`mailto:${client.email}`} style={{ color: T.blue }}>{client.email}</a></div></div>}
            {client.website && <div><span style={{ fontSize: 11, color: T.textLight, fontWeight: 600 }}>WEBSITE</span><div style={{ fontSize: 13 }}><a href={client.website} target="_blank" rel="noreferrer" style={{ color: T.blue }}>Visit site ↗</a></div></div>}
            {client.gbpUrl && <div><span style={{ fontSize: 11, color: T.textLight, fontWeight: 600 }}>GBP PROFILE</span><div style={{ fontSize: 13 }}><a href={client.gbpUrl} target="_blank" rel="noreferrer" style={{ color: T.blue }}>View on Google ↗</a></div></div>}
          </div>
          {client.notes && (
            <div style={{ background: T.grayLight, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: T.textLight, fontWeight: 600, marginBottom: 4 }}>NOTES</div>
              <div style={{ fontSize: 13, color: T.text, whiteSpace: 'pre-wrap' }}>{client.notes}</div>
            </div>
          )}
          {client.createdAt && <div style={{ fontSize: 11, color: T.textLight, marginTop: 10 }}>Added {new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
        </div>
      )}
    </Card>
  )
}

export default function ClientTracker() {
  const [clients, setClients] = useState([])
  const [view, setView] = useState('list') // list | add | edit
  const [editTarget, setEditTarget] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { setClients(getClients()) }, [])
  const refresh = () => setClients(getClients())

  const handleSave = (data) => {
    if (editTarget) { updateClient(editTarget.id, data) }
    else { addClient(data) }
    refresh(); setView('list'); setEditTarget(null)
  }

  const handleEdit = (client) => { setEditTarget(client); setView('edit') }
  const handleDelete = (id) => { deleteClient(id); refresh() }

  const filtered = clients
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .filter(c => !search || c.businessName?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase()) || c.contactName?.toLowerCase().includes(search.toLowerCase()))

  const totalMRR = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + (parseFloat(c.monthlyValue) || 0), 0)
  const activeCount = clients.filter(c => c.status === 'active').length
  const dueFollowUps = clients.filter(c => c.followUpDate && new Date(c.followUpDate) <= new Date() && c.status !== 'won' && c.status !== 'lost').length

  return (
    <div>
      <SectionHeader icon="📊" title="Client Tracker" subtitle="Track every prospect and client from first audit to active retainer." />

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total Clients', value: clients.length, color: T.blue, bg: T.blueLight },
          { label: 'Active Retainers', value: activeCount, color: T.success, bg: T.successLight },
          { label: 'Monthly Revenue', value: `£${totalMRR}`, color: T.gold, bg: T.goldLight },
          { label: 'Follow-ups Due', value: dueFollowUps, color: dueFollowUps > 0 ? T.danger : T.gray, bg: dueFollowUps > 0 ? T.dangerLight : T.grayLight },
        ].map(s => (
          <Card key={s.label} style={{ padding: 14, textAlign: 'center', background: s.bg, border: 'none' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* TOOLBAR */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <Input value={search} onChange={setSearch} placeholder="🔍  Search clients..." />
        </div>
        <Select value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'All Statuses' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]} />
        <Btn onClick={() => { setEditTarget(null); setView('add') }}>+ Add Client</Btn>
      </div>

      {/* FORM */}
      {(view === 'add' || view === 'edit') && (
        <Card style={{ marginBottom: 20, border: `1.5px solid ${T.blue}` }} className="animate-fadeIn">
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: T.dark }}>
            {view === 'edit' ? `✏️ Edit — ${editTarget?.businessName}` : '+ New Client'}
          </h3>
          <ClientForm initial={editTarget || {}} onSave={handleSave} onCancel={() => { setView('list'); setEditTarget(null) }} />
        </Card>
      )}

      {/* CLIENT LIST */}
      {filtered.length === 0
        ? <EmptyState icon="📋" title={clients.length === 0 ? 'No clients yet' : 'No results'} subtitle={clients.length === 0 ? 'Add your first client or prospect above to start tracking.' : 'Try adjusting your search or filter.'} />
        : filtered.map(c => <ClientCard key={c.id} client={c} onEdit={handleEdit} onDelete={handleDelete} />)
      }
    </div>
  )
}
