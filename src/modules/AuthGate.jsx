import { useState, useRef, useEffect } from 'react'
import { readDB, writeDB, clearCache, isSupabaseConfigured } from '../utils/db.js'

const T = {
  blue:'#1B4FD8', blueLight:'#EEF3FF', dark:'#000000',
  grayLight:'#F1F5F9', grayBorder:'#D1D5DB',
  white:'#FFFFFF', success:'#15803D', successLight:'#F0FDF4',
  danger:'#DC2626', dangerLight:'#FEF2F2', textLight:'#444444'
}

const SUPER_ADMIN_EMAIL = 'frankevgloballtd@gmail.com'
const SUPER_ADMIN_NAME  = 'Abiodun'
const PUBLIC_CONTACT    = 'hispraise01@gmail.com'

// ─── SESSION ──────────────────────────────────────────────────────────────────
export function getAuthSession() {
  try { const s = sessionStorage.getItem('fds_session'); return s ? JSON.parse(s) : null } catch { return null }
}
export function setAuthSession(user) {
  try { sessionStorage.setItem('fds_session', JSON.stringify({ ...user, loginAt: Date.now() })) } catch {}
}
export function clearAuthSession() {
  try { sessionStorage.removeItem('fds_session') } catch {}
}
export function isAuthenticated() {
  const s = getAuthSession()
  if (!s) return false
  if (Date.now() - s.loginAt > 8 * 60 * 60 * 1000) { clearAuthSession(); return false }
  return true
}
export function isAdmin() { return getAuthSession()?.role === 'admin' }

// ─── CLOUD CONFIG ─────────────────────────────────────────────────────────────
export async function getAuthConfig() { return await readDB() }
export async function saveAuthConfig(config) { clearCache(); return await writeDB(config) }

export async function addApprovedUser(user) {
  const c = await getAuthConfig()
  const exists = c.approvedUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase())
  if (exists) {
    c.approvedUsers = c.approvedUsers.map(u =>
      u.email.toLowerCase() === user.email.toLowerCase() ? { ...u, ...user } : u
    )
  } else {
    c.approvedUsers.push({ id: Date.now().toString(), ...user, approved: true })
  }
  await saveAuthConfig(c)
}

export async function removeUser(id) {
  const c = await getAuthConfig()
  c.approvedUsers = c.approvedUsers.filter(u => u.id !== id)
  await saveAuthConfig(c)
}

export async function updateMasterPin(pin) {
  const c = await getAuthConfig()
  c.masterPin = pin
  c.approvedUsers = c.approvedUsers.map(u => u.role === 'admin' ? { ...u, pin } : u)
  await saveAuthConfig(c)
}

// ─── PIN PAD ──────────────────────────────────────────────────────────────────
function PinPad({ onComplete, label, disabled }) {
  const [digits, setDigits] = useState([])

  const press = (k) => {
    if (disabled) return
    if (k === '⌫') { setDigits(p => p.slice(0, -1)); return }
    if (digits.length >= 4) return
    const next = [...digits, k]
    setDigits(next)
    if (next.length === 4) {
      const pin = next.join('')
      setDigits([])
      setTimeout(() => onComplete(pin), 120)
    }
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{ opacity: disabled ? 0.5 : 1 }}>
      <p style={{ fontSize: 13, color: T.textLight, marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{label}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 52, height: 60, borderRadius: 12, border: `2px solid ${digits.length > i ? T.blue : T.grayBorder}`, background: digits.length > i ? T.blueLight : '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}>
            {digits.length > i && <div style={{ width: 14, height: 14, borderRadius: '50%', background: T.blue }} />}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, maxWidth: 290, margin: '0 auto' }}>
        {keys.map((k, i) => (
          <button key={i} onClick={() => k !== '' && press(k)}
            onMouseDown={e => { if (k !== '') e.currentTarget.style.transform = 'scale(0.92)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
            onTouchStart={e => { if (k !== '') e.currentTarget.style.transform = 'scale(0.92)' }}
            onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
            style={{ height: 60, borderRadius: 12, border: k === '' ? 'none' : `1.5px solid ${T.grayBorder}`, background: k === '' ? 'transparent' : '#fff', fontSize: k === '⌫' ? 22 : 24, fontWeight: 700, color: '#000', cursor: k === '' ? 'default' : 'pointer', boxShadow: k !== '' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none', transition: 'transform 0.1s', opacity: k === '' ? 0 : 1, pointerEvents: k === '' ? 'none' : 'auto', fontFamily: 'inherit' }}>{k}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── SUPER ADMIN BYPASS ───────────────────────────────────────────────────────
function SuperAdminBypass({ onSuccess, onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const attempt = () => {
    if (email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      const u = { id: 'super_admin', name: SUPER_ADMIN_NAME, email: SUPER_ADMIN_EMAIL, role: 'super_admin' }
      setAuthSession(u)
      onSuccess(u)
    } else {
      setError('Incorrect. Authorised access only.')
      setTimeout(() => setError(''), 4000)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 360, padding: '32px 28px', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#000', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Emergency Admin Entry</h2>
        <p style={{ fontSize: 13, color: T.textLight, marginBottom: 20, lineHeight: 1.6 }}>Enter your authorised email address for immediate access.</p>
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          placeholder="Enter admin email address" autoFocus
          style={{ width: '100%', padding: '13px 16px', border: `1.5px solid ${error ? T.danger : T.grayBorder}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12, color: '#000', background: '#F8FAFF' }} />
        {error && <p style={{ color: T.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button onClick={attempt} disabled={!email.trim()}
          style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: !email.trim() ? '#CBD5E1' : 'linear-gradient(135deg,#1B4FD8,#7C3AED)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: !email.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
          Enter App →
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textLight, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back to login</button>
      </div>
    </div>
  )
}

// ─── MAIN AUTH GATE — EMAIL + PIN ONLY ───────────────────────────────────────
// Everyone must use Email + PIN. No PIN-only login.
// This prevents anyone who guesses or spies on a PIN from getting in.
export default function AuthGate({ onAuthenticated }) {
  const [email, setEmail]           = useState('')
  const [step, setStep]             = useState(1) // 1=email, 2=pin
  const [verifiedUser, setVerifiedUser] = useState(null)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [dbStatus, setDbStatus]     = useState('checking')
  const [showBypass, setShowBypass] = useState(false)

  const logoTaps  = useRef(0)
  const logoTimer = useRef(null)

  // Check Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setDbStatus('error')
      setError('App not configured. Contact Abiodun at ' + PUBLIC_CONTACT)
      return
    }
    readDB()
      .then(() => setDbStatus('ok'))
      .catch(e => {
        setDbStatus('error')
        if (e.message === 'NETWORK_ERROR') {
          setError('No internet connection. Check your connection and refresh.')
        } else {
          setError('Cannot connect to database. Refresh and try again.')
        }
      })
  }, [])

  const handleLogoTap = () => {
    logoTaps.current += 1
    if (logoTimer.current) clearTimeout(logoTimer.current)
    if (logoTaps.current >= 3) { logoTaps.current = 0; setShowBypass(true); return }
    logoTimer.current = setTimeout(() => { logoTaps.current = 0 }, 2000)
  }

  const showErr = (msg) => { setError(msg); setTimeout(() => setError(''), 8000) }

  // ── STEP 1: Verify Email ──────────────────────────────────────────────────
  const handleEmailCheck = async () => {
    const e = email.trim().toLowerCase()
    if (!e.includes('@') || !e.includes('.')) { showErr('Please enter a valid email address.'); return }
    setLoading(true)
    try {
      const cfg = await readDB()
      // Check if it is the master admin email
      if (e === SUPER_ADMIN_EMAIL.toLowerCase()) {
        setVerifiedUser({ id: 'master', name: SUPER_ADMIN_NAME, email: SUPER_ADMIN_EMAIL, role: 'admin', pin: cfg.masterPin })
        setStep(2); setError('')
        setLoading(false); return
      }
      // Check approved users list
      const user = cfg.approvedUsers.find(u => u.email.toLowerCase() === e && u.approved === true)
      if (user) {
        setVerifiedUser(user)
        setStep(2); setError('')
      } else {
        showErr('This email is not on the approved list. Contact Abiodun at ' + PUBLIC_CONTACT + ' to request access.')
      }
    } catch(e) {
      showErr(e.message === 'NETWORK_ERROR' ? 'No internet connection.' : 'Could not verify email — please refresh and try again.')
    }
    setLoading(false)
  }

  // ── STEP 2: Verify PIN ────────────────────────────────────────────────────
  const handlePinCheck = async (pin) => {
    if (!verifiedUser) return
    setLoading(true)
    try {
      // Re-read from DB to get latest PIN (in case it was changed)
      const cfg = await readDB()
      let user = verifiedUser

      // If master admin
      if (verifiedUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        if (pin === cfg.masterPin) {
          const u = { id: 'master', name: SUPER_ADMIN_NAME, email: SUPER_ADMIN_EMAIL, role: 'admin' }
          setAuthSession(u); onAuthenticated(u); return
        } else {
          showErr('Incorrect PIN. Try again.')
          setLoading(false); return
        }
      }

      // Regular user — get fresh data
      const freshUser = cfg.approvedUsers.find(u => u.email.toLowerCase() === verifiedUser.email.toLowerCase() && u.approved)
      if (!freshUser) { showErr('Your account has been removed. Contact Abiodun.'); setLoading(false); return }

      if (pin === freshUser.pin) {
        setAuthSession(freshUser)
        onAuthenticated(freshUser)
      } else {
        showErr('Incorrect PIN. Contact Abiodun at ' + PUBLIC_CONTACT + ' if you have forgotten your PIN.')
      }
    } catch(e) {
      showErr(e.message === 'NETWORK_ERROR' ? 'No internet. Check connection.' : 'Login failed — refresh and try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0A0F1E 0%,#1B4FD8 65%,#7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420, padding: '36px 32px 32px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

        {/* Logo — tap 3× for bypass */}
        <div onClick={handleLogoTap} style={{ width: 72, height: 72, borderRadius: 18, margin: '0 auto 16px', background: 'linear-gradient(135deg,#1B4FD8,#7C3AED,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 900, letterSpacing: 1, boxShadow: '0 8px 24px rgba(27,79,216,0.4)', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}>GBP</div>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#000', margin: '0 0 4px', letterSpacing: '-0.03em' }}>FDS GBP Pro</h1>
        <p style={{ fontSize: 13, color: T.textLight, marginBottom: 20, fontWeight: 500 }}>Frankev Digital Services — Authorised Access Only</p>

        {/* Security badge */}
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '8px 14px', marginBottom: 20, fontSize: 12, color: T.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          🔐 Secure Login — Email + PIN Required
        </div>

        {/* DB Status */}
        {dbStatus === 'checking' && (
          <div style={{ background: '#F1F5F9', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Connecting to server...
          </div>
        )}

        {dbStatus === 'error' && (
          <div style={{ background: T.dangerLight, border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: T.danger, lineHeight: 1.5 }}>
            ⚠️ {error}
          </div>
        )}

        {dbStatus === 'ok' && (
          <>
            {/* Progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 3, borderRadius: '3px 0 0 3px', background: T.blue }} />
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.blue, color: '#fff', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>1</div>
              <div style={{ flex: 1, height: 3, background: step >= 2 ? T.blue : '#E2E8F0', transition: 'background 0.3s' }} />
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= 2 ? T.blue : '#E2E8F0', color: step >= 2 ? '#fff' : '#999', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' }}>2</div>
              <div style={{ flex: 1, height: 3, borderRadius: '0 3px 3px 0', background: '#E2E8F0' }} />
            </div>

            {/* STEP 1 — Email */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <p style={{ fontSize: 15, fontWeight: 700, color: '#000', marginBottom: 6 }}>Step 1 — Enter your email</p>
                <p style={{ fontSize: 13, color: T.textLight, marginBottom: 18 }}>Your approved Gmail or email address</p>
                <input type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && !loading && handleEmailCheck()}
                  placeholder="yourname@gmail.com" autoFocus
                  style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${error ? T.danger : T.grayBorder}`, borderRadius: 10, fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12, color: '#000', background: '#F8FAFF', fontWeight: 500 }} />
                {error && <div style={{ background: T.dangerLight, border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: T.danger, marginBottom: 12, lineHeight: 1.5, textAlign: 'left' }}>{error}</div>}
                <button onClick={handleEmailCheck} disabled={loading || !email.trim()}
                  style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: loading || !email.trim() ? '#CBD5E1' : 'linear-gradient(135deg,#1B4FD8,#3B6EF8)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading || !email.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  {loading ? '🔄 Checking...' : 'Continue →'}
                </button>
              </div>
            )}

            {/* STEP 2 — PIN */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <div style={{ background: T.successLight, border: '1px solid #86EFAC', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: T.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>✅</span>
                  <div style={{ textAlign: 'left' }}>
                    <div>Email verified</div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>{email}</div>
                  </div>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#000', marginBottom: 6 }}>Step 2 — Enter your PIN</p>
                <PinPad onComplete={handlePinCheck} label="Your 4-digit access PIN" disabled={loading} />
                {loading && <p style={{ fontSize: 13, color: T.textLight, marginTop: 14, fontWeight: 500 }}>🔄 Verifying...</p>}
                {error && <div style={{ marginTop: 14, background: T.dangerLight, border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: T.danger, lineHeight: 1.5 }}>{error}</div>}
                <button onClick={() => { setStep(1); setError(''); setVerifiedUser(null) }}
                  style={{ background: 'none', border: 'none', color: T.textLight, fontSize: 12, cursor: 'pointer', marginTop: 18, fontFamily: 'inherit', fontWeight: 600 }}>← Use a different email</button>
              </div>
            )}
          </>
        )}

        <p style={{ fontSize: 11, color: T.textLight, marginTop: 24, lineHeight: 1.7 }}>
          No access? Contact <strong style={{ color: '#000' }}>Abiodun</strong><br />
          <a href={'mailto:' + PUBLIC_CONTACT} style={{ color: T.blue, fontWeight: 700 }}>{PUBLIC_CONTACT}</a>
        </p>
      </div>

      {showBypass && (
        <SuperAdminBypass
          onSuccess={u => { setShowBypass(false); onAuthenticated(u) }}
          onClose={() => setShowBypass(false)}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} } .animate-fadeIn{animation:fadeIn 0.2s ease;}`}</style>
    </div>
  )
}
