import { useState, useEffect, useRef } from 'react'
import { T, Btn, Card, Input, Field, SectionHeader, Select } from '../components/ui.jsx'
import { getAuthConfig, addApprovedUser, removeUser, updateMasterPin, clearAuthSession, isAdmin, getAuthSession } from './AuthGate.jsx'
import { ROLES, FEATURES, DEFAULT_PERMISSIONS } from '../utils/roles.js'

const PUBLIC_CONTACT = 'hispraise01@gmail.com'

// ─── USER ACTIVITY TRACKING ───────────────────────────────────────────────────
// Each user's activity is tracked in sessionStorage on their device
// and synced to Supabase on each login/action
export function trackActivity() {
  const session = getAuthSession()
  if (!session) return
  const key = `fds_activity_${session.id}`
  const now = Date.now()
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '{}')
    const updated = {
      userId: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      lastSeen: now,
      sessionStart: existing.sessionStart || now,
      totalMinutes: (existing.totalMinutes || 0) + (existing.lastSeen ? Math.round((now - existing.lastSeen) / 60000) : 0),
      loginHistory: [
        { at: new Date(now).toISOString(), action: 'active' },
        ...(existing.loginHistory || [])
      ].slice(0, 50) // keep last 50 events
    }
    localStorage.setItem(key, JSON.stringify(updated))
  } catch {}
}

export function getUserActivity(userId) {
  try {
    const raw = localStorage.getItem(`fds_activity_${userId}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function formatRelTime(ts) {
  if (!ts) return 'Never'
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOnline(lastSeen) {
  if (!lastSeen) return false
  return Date.now() - lastSeen < 5 * 60 * 1000 // online if active within 5 minutes
}

// ─── PERMISSION EDITOR ────────────────────────────────────────────────────────
function PermissionEditor({ userId, role, currentPerms, onSave, onClose }) {
  const defaultPerms = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.basic
  const [perms, setPerms] = useState(currentPerms || defaultPerms)
  const [saving, setSaving] = useState(false)

  const toggle = (id) => setPerms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const setAll = (cat) => {
    const catIds = FEATURES.filter(f => f.category === cat).map(f => f.id)
    const allOn = catIds.every(id => perms.includes(id))
    setPerms(p => allOn ? p.filter(id => !catIds.includes(id)) : [...new Set([...p, ...catIds])])
  }

  const categories = [...new Set(FEATURES.map(f => f.category))]
  const roleInfo = ROLES[role] || ROLES.basic

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: T.white, borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.grayBorder}`, position: 'sticky', top: 0, background: T.white, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#000' }}>Feature Permissions</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 18 }}>{roleInfo.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: roleInfo.color, background: roleInfo.bg, padding: '2px 10px', borderRadius: 10 }}>{roleInfo.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.grayBorder}`, background: T.grayLight, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ background: T.blueLight, borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#1E40AF' }}>
            💡 Toggle features ON (✅) or OFF (❌) for this user. Changes only apply to this user — not their whole role.
          </div>
          {categories.map(cat => {
            const catFeatures = FEATURES.filter(f => f.category === cat)
            const allOn = catFeatures.every(f => perms.includes(f.id))
            return (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontWeight: 800, fontSize: 13, color: '#000', textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</p>
                  <button onClick={() => setAll(cat)} style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, background: allOn ? T.successLight : T.grayLight, color: allOn ? T.success : T.textLight, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {allOn ? '✅ All On' : '☐ All Off'}
                  </button>
                </div>
                {catFeatures.map(f => (
                  <div key={f.id} onClick={() => toggle(f.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', marginBottom: 6, borderRadius: 8, cursor: 'pointer', background: perms.includes(f.id) ? '#F0FDF4' : T.grayLight, border: `1px solid ${perms.includes(f.id) ? '#86EFAC' : T.grayBorder}`, transition: 'all 0.15s' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>{f.label}</span>
                    <div style={{ width: 44, height: 24, borderRadius: 12, background: perms.includes(f.id) ? T.success : '#CBD5E1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 2, left: perms.includes(f.id) ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
          <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: `1px solid ${T.grayBorder}` }}>
            <Btn variant="secondary" full onClick={onClose}>Cancel</Btn>
            <Btn full onClick={async () => { setSaving(true); await onSave(perms); setSaving(false); onClose() }} disabled={saving}>
              {saving ? '💾 Saving...' : '✅ Save Permissions'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── USER CARD ────────────────────────────────────────────────────────────────
function UserCard({ user, onRemove, onChangeRole, onEditPerms, canEdit }) {
  const [expanded, setExpanded] = useState(false)
  const activity = getUserActivity(user.id)
  const online = isOnline(activity?.lastSeen)
  const roleInfo = ROLES[user.role] || ROLES.basic
  const loginHistory = activity?.loginHistory || []

  return (
    <div style={{ background: T.white, border: `1.5px solid ${T.grayBorder}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      {/* MAIN ROW */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Online indicator */}
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: online ? '#16A34A' : '#DC2626', flexShrink: 0, boxShadow: online ? '0 0 6px #16A34A' : 'none' }} title={online ? 'Online' : 'Offline'} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#000' }}>{user.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: roleInfo.bg, color: roleInfo.color }}>{roleInfo.icon} {roleInfo.label}</span>
            {online && <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '1px 7px', borderRadius: 8 }}>● ONLINE</span>}
          </div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{user.email}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
            {activity ? `Last seen: ${formatRelTime(activity.lastSeen)} · Total: ${activity.totalMinutes || 0} min` : 'Never logged in'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {canEdit && (
            <>
              <Btn size="sm" variant="outline" onClick={() => onEditPerms(user)}>🔧 Permissions</Btn>
              <Btn size="sm" variant="secondary" onClick={() => setExpanded(e => !e)}>{expanded ? '▲' : '▼'}</Btn>
              {user.role !== 'super_admin' && <Btn size="sm" variant="danger" onClick={() => onRemove(user.id)}>✕</Btn>}
            </>
          )}
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${T.grayBorder}`, padding: '14px 16px', background: '#FAFAFA' }} className="animate-fadeIn">
          {/* Role selector */}
          {canEdit && user.role !== 'super_admin' && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 8 }}>Change Role:</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(ROLES).filter(([k]) => k !== 'super_admin').map(([key, r]) => (
                  <button key={key} onClick={() => onChangeRole(user.id, key)} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${user.role === key ? r.color : T.grayBorder}`, background: user.role === key ? r.bg : T.white, color: user.role === key ? r.color : '#555', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {r.icon} {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              ['⏱️ Total Time', `${activity?.totalMinutes || 0} min`],
              ['📅 Last Active', activity ? formatRelTime(activity.lastSeen) : 'Never'],
              ['🔢 PIN', canEdit ? user.pin : '••••'],
            ].map(([label, val]) => (
              <div key={label} style={{ background: T.white, border: `1px solid ${T.grayBorder}`, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Login history */}
          {loginHistory.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 8 }}>📋 Recent Activity:</p>
              <div style={{ maxHeight: 140, overflowY: 'auto', background: T.white, border: `1px solid ${T.grayBorder}`, borderRadius: 8 }}>
                {loginHistory.slice(0, 10).map((h, i) => (
                  <div key={i} style={{ padding: '6px 12px', borderBottom: i < 9 ? `1px solid ${T.grayBorder}` : 'none', fontSize: 12, color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{h.action}</span>
                    <span style={{ color: '#888' }}>{new Date(h.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ROLE OVERVIEW TABLE ──────────────────────────────────────────────────────
function RoleOverviewTable() {
  const categories = [...new Set(FEATURES.map(f => f.category))]
  const roles = ['super_admin', 'admin', 'pro', 'basic']

  return (
    <Card style={{ marginBottom: 20, overflowX: 'auto' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#000' }}>📋 Role Permission Overview</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#F8FAFF' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#000', borderBottom: `2px solid ${T.grayBorder}` }}>Feature</th>
            {roles.map(r => (
              <th key={r} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: ROLES[r].color, borderBottom: `2px solid ${T.grayBorder}`, whiteSpace: 'nowrap' }}>
                {ROLES[r].icon} {ROLES[r].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <>
              <tr key={`cat-${cat}`}>
                <td colSpan={5} style={{ padding: '8px 12px', background: '#F1F5F9', fontWeight: 800, fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</td>
              </tr>
              {FEATURES.filter(f => f.category === cat).map(f => (
                <tr key={f.id} style={{ borderBottom: `1px solid ${T.grayBorder}` }}>
                  <td style={{ padding: '8px 12px', color: '#000', fontWeight: 500 }}>{f.label.split('—')[1]?.trim() || f.label}</td>
                  {roles.map(r => {
                    const hasIt = DEFAULT_PERMISSIONS[r]?.includes(f.id)
                    return (
                      <td key={r} style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {hasIt ? <span style={{ color: '#16A34A', fontWeight: 700 }}>✅</span> : <span style={{ color: '#CBD5E1' }}>—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ─── MAIN AUTH SETTINGS ───────────────────────────────────────────────────────
export default function AuthSettings({ onLogout }) {
  const [config, setConfig] = useState({ masterPin: '', approvedUsers: [] })
  const [loading, setLoading] = useState(true)
  const [newUser, setNewUser] = useState({ name: '', email: '', pin: '', role: 'basic' })
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [editPermsUser, setEditPermsUser] = useState(null)
  const [activeTab, setActiveTab] = useState('users')
  const session = getAuthSession()
  const isSuperAdmin = session?.role === 'super_admin' || session?.email === 'frankevgloballtd@gmail.com'
  const canManage = isSuperAdmin || session?.role === 'admin'

  const ok   = (m) => { setMsg(m);  setErr('');  setTimeout(() => setMsg(''), 3000) }
  const fail = (m) => { setErr(m);  setMsg('');  setTimeout(() => setErr(''), 5000) }

  // Dynamic import to avoid circular
  const loadConfig = async () => {
    setLoading(true)
    try {
      const { getAuthConfig } = await import('./AuthGate.jsx')
      const c = await getAuthConfig()
      setConfig(c)
    } catch { fail('Could not load users. Check internet connection.') }
    setLoading(false)
  }

  useEffect(() => { loadConfig() }, [])

  // Track activity for current user
  useEffect(() => {
    const { trackActivity: ta } = { trackActivity: () => {} }
    const interval = setInterval(() => {
      const session = getAuthSession()
      if (!session) return
      const key = `fds_activity_${session.id}`
      try {
        const ex = JSON.parse(localStorage.getItem(key) || '{}')
        localStorage.setItem(key, JSON.stringify({
          ...ex, userId: session.id, name: session.name, email: session.email,
          role: session.role, lastSeen: Date.now(),
          totalMinutes: (ex.totalMinutes || 0) + 1,
          loginHistory: [{ at: new Date().toISOString(), action: 'active' }, ...(ex.loginHistory || [])].slice(0, 50)
        }))
      } catch {}
    }, 60000) // update every minute
    return () => clearInterval(interval)
  }, [])

  const handleAdd = async () => {
    if (!newUser.name || !newUser.email || newUser.pin.length !== 4) { fail('Name, email, and 4-digit PIN are required.'); return }
    if (!newUser.email.includes('@')) { fail('Enter a valid email address.'); return }
    setSaving(true)
    try {
      const { addApprovedUser } = await import('./AuthGate.jsx')
      await addApprovedUser({ ...newUser, permissions: DEFAULT_PERMISSIONS[newUser.role] || DEFAULT_PERMISSIONS.basic })
      setNewUser({ name: '', email: '', pin: '', role: 'basic' })
      ok(`✅ User added as ${ROLES[newUser.role].label}. Share their PIN privately.`)
      await loadConfig()
    } catch { fail('Failed to save. Check internet connection.') }
    setSaving(false)
  }

  const handleRemove = async (id) => {
    if (!confirm('Remove this user? They will be locked out immediately.')) return
    setSaving(true)
    try {
      const { removeUser } = await import('./AuthGate.jsx')
      await removeUser(id)
      await loadConfig()
      ok('User removed.')
    } catch { fail('Failed to remove user.') }
    setSaving(false)
  }

  const handleChangeRole = async (id, newRole) => {
    setSaving(true)
    try {
      const { getAuthConfig, saveAuthConfig } = await import('./AuthGate.jsx')
      const c = await getAuthConfig()
      c.approvedUsers = c.approvedUsers.map(u =>
        u.id === id ? { ...u, role: newRole, permissions: DEFAULT_PERMISSIONS[newRole] } : u
      )
      await saveAuthConfig(c)
      await loadConfig()
      ok(`Role updated to ${ROLES[newRole].label}.`)
    } catch { fail('Failed to update role.') }
    setSaving(false)
  }

  const handleSavePerms = async (userId, perms) => {
    const { getAuthConfig, saveAuthConfig } = await import('./AuthGate.jsx')
    const c = await getAuthConfig()
    c.approvedUsers = c.approvedUsers.map(u => u.id === userId ? { ...u, permissions: perms } : u)
    await saveAuthConfig(c)
    await loadConfig()
    ok('Permissions saved.')
  }

  const handleChangePin = async () => {
    if (newPin.length !== 4) { fail('PIN must be 4 digits.'); return }
    if (newPin !== confirmPin) { fail('PINs do not match.'); return }
    setSaving(true)
    try {
      const { updateMasterPin } = await import('./AuthGate.jsx')
      await updateMasterPin(newPin)
      setNewPin(''); setConfirmPin('')
      ok('✅ Admin PIN updated and synced to all devices.')
      await loadConfig()
    } catch { fail('Failed to update PIN.') }
    setSaving(false)
  }

  const nonAdmin = config.approvedUsers?.filter(u => u.role !== 'super_admin') || []
  const tabStyle = (id) => ({ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, background: activeTab === id ? T.blue : T.grayLight, color: activeTab === id ? '#fff' : '#555' })

  return (
    <div>
      <SectionHeader icon="🔐" title="Access Control" subtitle="Manage roles, permissions, and user activity across all devices." />

      {/* STATUS */}
      <div style={{ background: T.successLight, border: `1.5px solid #86EFAC`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: 14, color: T.success, margin: 0 }}>🔒 Centralised Access Control ACTIVE</p>
          <p style={{ fontSize: 12, color: T.success, margin: '2px 0 0', opacity: 0.9 }}>All logins verified via Supabase cloud. Changes sync to all devices instantly.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" onClick={loadConfig} disabled={loading}>{loading ? '...' : '🔄 Refresh'}</Btn>
          <Btn variant="danger" size="sm" onClick={() => { if (confirm('Log out?')) { clearAuthSession(); onLogout() } }}>🚪 Log Out</Btn>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>👥 Users & Activity</button>
        <button style={tabStyle('add')} onClick={() => setActiveTab('add')}>➕ Add User</button>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>📋 Role Overview</button>
        {canManage && <button style={tabStyle('pin')} onClick={() => setActiveTab('pin')}>🔑 Change PIN</button>}
      </div>

      {msg && <div style={{ background: T.successLight, border: '1px solid #86EFAC', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: T.success, fontWeight: 700 }}>✅ {msg}</div>}
      {err && <div style={{ background: T.dangerLight, border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: T.danger }}>❌ {err}</div>}

      {/* USERS & ACTIVITY TAB */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
            {Object.entries(ROLES).map(([key, r]) => {
              const count = key === 'super_admin' ? 1 : nonAdmin.filter(u => u.role === key).length
              return (
                <Card key={key} style={{ background: r.bg, border: `1.5px solid ${r.color}20`, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: r.color }}>{count}</div>
                  <div style={{ fontSize: 11, color: r.color, fontWeight: 700 }}>{r.label}</div>
                </Card>
              )
            })}
          </div>

          {loading && <p style={{ textAlign: 'center', color: '#888', padding: 20 }}>🔄 Loading users...</p>}

          {/* SUPER ADMIN ROW */}
          <div style={{ background: 'linear-gradient(135deg,#F5F3FF,#EEF3FF)', border: `1.5px solid #C4B5FD`, borderRadius: 12, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 6px #16A34A', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#000' }}>Abiodun</span>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 10, background: '#7C3AED', color: '#fff' }}>👑 SUPER ADMIN</span>
              </div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>hispraise01@gmail.com · All permissions · Cannot be removed</div>
            </div>
          </div>

          {nonAdmin.map(u => (
            <UserCard key={u.id} user={u} canEdit={canManage}
              onRemove={handleRemove}
              onChangeRole={handleChangeRole}
              onEditPerms={setEditPermsUser}
            />
          ))}

          {nonAdmin.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
              <p>No users yet. Go to "Add User" tab to add your first user.</p>
            </div>
          )}
        </div>
      )}

      {/* ADD USER TAB */}
      {activeTab === 'add' && canManage && (
        <Card>
          <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: '#000' }}>➕ Add New User</h3>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>Every new user starts as Basic by default. You can change their role and permissions after adding them.</p>

          {/* ROLE SELECTOR */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 10 }}>Select Role:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {Object.entries(ROLES).filter(([k]) => k !== 'super_admin').map(([key, r]) => (
                <button key={key} onClick={() => setNewUser(p => ({ ...p, role: key }))} style={{ padding: '12px 14px', borderRadius: 10, border: `2px solid ${newUser.role === key ? r.color : T.grayBorder}`, background: newUser.role === key ? r.bg : T.white, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: newUser.role === key ? r.color : '#000' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                    {key === 'admin' ? 'All features + user management' : key === 'pro' ? 'All features except access control' : 'Basic features only'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Field label="Full Name" required><Input value={newUser.name} onChange={v => setNewUser(p => ({ ...p, name: v }))} placeholder="e.g. Kunle Francis" /></Field>
            <Field label="Gmail Address" required><Input value={newUser.email} onChange={v => setNewUser(p => ({ ...p, email: v }))} placeholder="e.g. kunle@gmail.com" type="email" /></Field>
          </div>
          <Field label="4-Digit PIN" required hint="You choose — share with user privately via WhatsApp">
            <input type="text" value={newUser.pin} onChange={e => setNewUser(p => ({ ...p, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="e.g. 7291" maxLength={4}
              style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${T.grayBorder}`, borderRadius: 8, fontSize: 22, textAlign: 'center', letterSpacing: 8, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
          </Field>
          <Btn full onClick={handleAdd} disabled={!newUser.name || !newUser.email || newUser.pin.length !== 4 || saving}>
            {saving ? '💾 Adding...' : `+ Add ${ROLES[newUser.role]?.label}`}
          </Btn>
        </Card>
      )}

      {/* ROLE OVERVIEW TAB */}
      {activeTab === 'overview' && <RoleOverviewTable />}

      {/* CHANGE PIN TAB */}
      {activeTab === 'pin' && canManage && (
        <Card>
          <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: '#000' }}>🔑 Change Admin PIN</h3>
          <p style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>Your master PIN syncs to all devices immediately.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Field label="New 4-Digit PIN">
              <input type="password" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="New PIN" maxLength={4}
                style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${T.grayBorder}`, borderRadius: 8, fontSize: 22, textAlign: 'center', letterSpacing: 8, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </Field>
            <Field label="Confirm PIN">
              <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Repeat" maxLength={4}
                style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${T.grayBorder}`, borderRadius: 8, fontSize: 22, textAlign: 'center', letterSpacing: 8, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </Field>
          </div>
          <Btn onClick={handleChangePin} disabled={newPin.length !== 4 || saving}>{saving ? 'Saving...' : 'Update PIN'}</Btn>
        </Card>
      )}

      {/* PERMISSION EDITOR MODAL */}
      {editPermsUser && (
        <PermissionEditor
          userId={editPermsUser.id}
          role={editPermsUser.role}
          currentPerms={editPermsUser.permissions}
          onSave={(perms) => handleSavePerms(editPermsUser.id, perms)}
          onClose={() => setEditPermsUser(null)}
        />
      )}
    </div>
  )
}
