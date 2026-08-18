import { useState, useEffect } from 'react'
import { T, Logo, Badge } from './components/ui.jsx'
import AuthGate, { isAuthenticated, clearAuthSession, getAuthSession } from './modules/AuthGate.jsx'
import RevenueDashboard from './modules/RevenueDashboard.jsx'
import ClientTracker from './modules/ClientTracker.jsx'
import AuditTool from './modules/AuditTool.jsx'
import SetupBlueprint from './modules/SetupBlueprint.jsx'
import { ProposalBuilder, PitchScript } from './modules/ProposalBuilder.jsx'
import AITools from './modules/AITools.jsx'
import SuspensionChecker from './modules/SuspensionChecker.jsx'
import Settings from './modules/Settings.jsx'
import { hasPermission, canSeeModule, ROLES, DEFAULT_PERMISSIONS } from './utils/roles.js'

const ALL_MODULES = [
  { id:'dashboard', icon:'💰', label:'Dashboard',        short:'Dashboard', feature:'dashboard_overview' },
  { id:'clients',   icon:'📊', label:'Client Tracker',   short:'Clients',   feature:'clients_view'       },
  { id:'audit',     icon:'🔍', label:'Audit Tool',       short:'Audit',     feature:'audit_basic'        },
  { id:'blueprint', icon:'📋', label:'GBP Blueprint',    short:'Blueprint', feature:'blueprint_view'     },
  { id:'proposal',  icon:'📝', label:'Proposal Builder', short:'Proposal',  feature:'proposal_create'    },
  { id:'pitch',     icon:'🎯', label:'Pitch Script',     short:'Pitch',     feature:'pitch_script'       },
  { id:'ai',        icon:'🤖', label:'AI Tools',         short:'AI',        feature:'ai_review'          },
  { id:'risk',      icon:'🛡️', label:'Risk Checker',     short:'Risk',      feature:'risk_checker'       },
  { id:'settings',  icon:'⚙️', label:'Settings',         short:'Settings',  feature:'settings_general'   },
]

// Track activity every minute
function useActivityTracker(session) {
  useEffect(() => {
    if (!session) return
    const track = () => {
      const key = `fds_activity_${session.id}`
      try {
        const ex = JSON.parse(localStorage.getItem(key) || '{}')
        localStorage.setItem(key, JSON.stringify({
          ...ex, userId: session.id, name: session.name,
          email: session.email, role: session.role,
          lastSeen: Date.now(),
          totalMinutes: (ex.totalMinutes || 0) + (ex.lastSeen ? 1 : 0),
          loginHistory: [
            { at: new Date().toISOString(), action: 'active' },
            ...(ex.loginHistory || [])
          ].slice(0, 50)
        }))
      } catch {}
    }
    track()
    const interval = setInterval(track, 60000)
    return () => clearInterval(interval)
  }, [session?.id])
}

function recordLogin(session) {
  if (!session) return
  const key = `fds_activity_${session.id}`
  try {
    const ex = JSON.parse(localStorage.getItem(key) || '{}')
    localStorage.setItem(key, JSON.stringify({
      ...ex, userId: session.id, name: session.name,
      email: session.email, role: session.role,
      lastSeen: Date.now(), sessionStart: Date.now(),
      totalMinutes: ex.totalMinutes || 0,
      loginHistory: [
        { at: new Date().toISOString(), action: 'login' },
        ...(ex.loginHistory || [])
      ].slice(0, 50)
    }))
  } catch {}
}

// ── UPGRADE PROMPT shown when Basic user tries to access Pro module ───────────
function UpgradePrompt() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', textAlign:'center', minHeight:400 }}>
      <div style={{ width:80, height:80, borderRadius:20, background:'linear-gradient(135deg,#1B4FD8,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:20, boxShadow:'0 8px 24px rgba(27,79,216,0.3)' }}>⭐</div>
      <h2 style={{ fontSize:22, fontWeight:900, color:'#000', marginBottom:10, letterSpacing:'-0.03em' }}>Pro Feature</h2>
      <p style={{ fontSize:15, color:'#444', maxWidth:360, lineHeight:1.75, marginBottom:28 }}>
        This feature is available on the <strong>Pro plan</strong> and above. Upgrade your access to unlock the full power of FDS GBP Pro — AI Tools, Proposal Builder, Pitch Scripts, Risk Checker, and more.
      </p>
      <div style={{ background:'#F8FAFF', border:'1.5px solid #E2E8F0', borderRadius:14, padding:'20px 24px', marginBottom:28, maxWidth:360, width:'100%' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>What Pro Unlocks</div>
        {['🤖 All 6 AI Tools — Review, Posts, Keywords, Q&A, Description, Report', '📝 Proposal Builder with PDF export', '🎯 Pitch Script Generator', '🛡️ Suspension Risk Checker', '📋 GBP Setup Blueprint', '📊 Client Tracker & Revenue Dashboard', '💰 Monthly Revenue Tracking'].map((f,i)=>(
          <div key={i} style={{ fontSize:13, color:'#000', fontWeight:600, padding:'5px 0', borderBottom:i<6?'1px solid #F1F5F9':'none', textAlign:'left', display:'flex', gap:8 }}>{f}</div>
        ))}
      </div>
      <a href="mailto:hispraise01@gmail.com?subject=Upgrade to Pro — FDS GBP Pro" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 28px', background:'linear-gradient(135deg,#1B4FD8,#7C3AED)', color:'#fff', borderRadius:10, fontWeight:800, fontSize:15, textDecoration:'none', marginBottom:12, boxShadow:'0 4px 16px rgba(27,79,216,0.3)' }}>
        📧 Request Pro Upgrade
      </a>
      <a href="https://wa.me/233547141279?text=I want to upgrade to Pro on FDS GBP Pro" target="_blank" rel="noopener" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 28px', background:'#16A34A', color:'#fff', borderRadius:10, fontWeight:800, fontSize:15, textDecoration:'none', boxShadow:'0 4px 16px rgba(22,163,74,0.25)' }}>
        💬 WhatsApp to Upgrade
      </a>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed]   = useState(false)
  const [user, setUser]       = useState(null)
  const [active, setActive]   = useState('audit') // basic users land on audit
  const [prefill, setPrefill] = useState(null)

  useEffect(() => {
    if (isAuthenticated()) {
      const s = getAuthSession()
      setAuthed(true)
      setUser(s)
      recordLogin(s)
      // Set landing page based on role
      if (s.role === 'basic') setActive('audit')
      else setActive('dashboard')
    }

    const handleNav = (e) => {
      setActive(e.detail)
      if (e.detail === 'proposal') {
        try {
          const raw = localStorage.getItem('fds_gbp_audit_prefill')
          if (raw) {
            const d = JSON.parse(raw)
            if (Date.now() - d.timestamp < 60000) setPrefill(d)
            localStorage.removeItem('fds_gbp_audit_prefill')
          }
        } catch {}
      }
    }
    window.addEventListener('fds-navigate', handleNav)
    return () => window.removeEventListener('fds-navigate', handleNav)
  }, [])

  useActivityTracker(user)

  const logout = () => {
    if (user) {
      const key = `fds_activity_${user.id}`
      try {
        const ex = JSON.parse(localStorage.getItem(key) || '{}')
        localStorage.setItem(key, JSON.stringify({ ...ex, lastSeen: Date.now(), loginHistory: [{ at: new Date().toISOString(), action: 'logout' }, ...(ex.loginHistory || [])].slice(0, 50) }))
      } catch {}
    }
    clearAuthSession(); setAuthed(false); setUser(null)
    setActive('audit')
  }

  const nav = (id) => { setActive(id); if (id !== 'proposal') setPrefill(null) }

  // Modules visible in sidebar — basic users only see audit + settings
  const visibleModules = ALL_MODULES.filter(m => canSeeModule(user, m.id))

  if (!authed) {
    return <AuthGate onAuthenticated={u => { setUser(u); setAuthed(true); recordLogin(u); if (u.role === 'basic') setActive('audit'); else setActive('dashboard') }} />
  }

  const roleInfo = ROLES[user?.role] || ROLES.basic
  const isBasic  = user?.role === 'basic'

  const renderModule = () => {
    const mod = ALL_MODULES.find(m => m.id === active)

    // Basic user trying to access a hidden module — show upgrade prompt
    if (isBasic && !canSeeModule(user, active)) {
      return <UpgradePrompt />
    }

    // Check feature permission
    if (mod && !hasPermission(user, mod.feature)) {
      return <UpgradePrompt />
    }

    try {
      switch(active) {
        case 'dashboard': return <RevenueDashboard />
        case 'clients':   return <ClientTracker />
        case 'audit':     return <AuditTool />
        case 'blueprint': return <SetupBlueprint />
        case 'proposal':  return <ProposalBuilder prefill={prefill} />
        case 'pitch':     return <PitchScript />
        case 'ai':        return <AITools />
        case 'risk':      return <SuspensionChecker />
        case 'settings':  return <Settings onLogout={logout} />
        default:          return isBasic ? <AuditTool /> : <RevenueDashboard />
      }
    } catch(e) {
      return (
        <div style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
          <h3 style={{ color:'#DC2626' }}>Something went wrong</h3>
          <p style={{ color:'#555', fontSize:13, margin:'8px 0 20px' }}>{e.message}</p>
          <button onClick={() => setActive(isBasic ? 'audit' : 'dashboard')} style={{ padding:'10px 20px', background:'#1B4FD8', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>← Go Back</button>
        </div>
      )
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFF', fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>

      {/* HEADER */}
      <div style={{ background:'#fff', borderBottom:`1px solid #E2E8F0`, padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:200, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <Logo />
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {user && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#16A34A', boxShadow:'0 0 4px #16A34A' }} />
              <span style={{ fontSize:12, color:'#333', fontWeight:700, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</span>
              <span style={{ fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:10, background:roleInfo.bg, color:roleInfo.color }}>{roleInfo.icon} {roleInfo.label}</span>
            </div>
          )}
          <Badge color="#D4A017" bg="#FDF6E3">GBP Pro</Badge>
          {/* Upgrade button for basic users */}
          {isBasic && (
            <a href="mailto:hispraise01@gmail.com?subject=Upgrade to Pro" style={{ padding:'5px 10px', borderRadius:6, background:'linear-gradient(135deg,#1B4FD8,#7C3AED)', color:'#fff', fontWeight:800, fontSize:11, textDecoration:'none' }}>⭐ Upgrade</a>
          )}
          <button onClick={logout} title="Log out" style={{ padding:'5px 10px', borderRadius:6, border:`1px solid #E2E8F0`, background:'#F1F5F9', color:'#555', fontWeight:600, fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>🚪</button>
        </div>
      </div>

      <div style={{ display:'flex', minHeight:'calc(100vh - 62px)' }}>

        {/* SIDEBAR */}
        <div style={{ width:220, background:'#0F172A', flexShrink:0, display:'flex', flexDirection:'column', paddingTop:20, position:'sticky', top:62, height:'calc(100vh - 62px)', overflowY:'auto' }} className="desktop-sidebar">
          <div style={{ padding:'0 12px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:12 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', marginBottom:8 }}>Navigation</div>

            {/* Only show modules this user can see */}
            {visibleModules.map(m => (
              <button key={m.id} onClick={() => nav(m.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, border:'none', cursor:'pointer', background:active===m.id?`#1B4FD8CC`:'transparent', color:active===m.id?'#fff':'rgba(255,255,255,0.65)', fontWeight:active===m.id?700:500, fontSize:13, marginBottom:2, textAlign:'left', fontFamily:'inherit', transition:'all 0.15s' }}>
                <span style={{ fontSize:16, width:20, textAlign:'center' }}>{m.icon}</span>
                {m.label}
              </button>
            ))}

            {/* Upgrade CTA in sidebar for basic users */}
            {isBasic && (
              <div style={{ marginTop:16, background:'linear-gradient(135deg,rgba(27,79,216,0.4),rgba(124,58,237,0.4))', borderRadius:10, padding:'14px 12px', border:'1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#fff', marginBottom:6 }}>⭐ Unlock Pro Features</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', lineHeight:1.6, marginBottom:10 }}>AI Tools, Proposals, Risk Checker & more</div>
                <a href="mailto:hispraise01@gmail.com?subject=Upgrade to Pro — FDS GBP Pro" style={{ display:'block', textAlign:'center', padding:'8px', background:'#fff', color:'#1B4FD8', borderRadius:7, fontWeight:800, fontSize:12, textDecoration:'none' }}>Request Upgrade →</a>
              </div>
            )}
          </div>

          <div style={{ padding:12, marginTop:'auto' }}>
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'10px 12px', marginBottom:10 }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:700, marginBottom:2 }}>{roleInfo.icon} {roleInfo.label}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', wordBreak:'break-all' }}>{user?.email}</div>
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', lineHeight:1.6 }}>© Frankev Digital Services<br/>hispraise01@gmail.com</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex:1, padding:'24px 20px 100px', maxWidth:800, width:'100%' }}>
          <div key={active} className="animate-fadeIn">{renderModule()}</div>
        </div>
      </div>

      {/* MOBILE NAV — only visible modules */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#0F172A', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', zIndex:200, overflowX:'auto', paddingBottom:'env(safe-area-inset-bottom)' }} className="mobile-nav">
        {visibleModules.map(m => (
          <button key={m.id} onClick={() => nav(m.id)} style={{ flex:'0 0 auto', minWidth:64, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'10px 6px 6px', border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', borderTop:active===m.id?`2px solid #3B6EF8`:'2px solid transparent' }}>
            <span style={{ fontSize:17, lineHeight:1 }}>{m.icon}</span>
            <span style={{ fontSize:9, fontWeight:active===m.id?700:500, color:active===m.id?'#3B6EF8':'rgba(255,255,255,0.5)', marginTop:4 }}>{m.short}</span>
          </button>
        ))}
      </div>

      <style>{`
        .desktop-sidebar{display:flex!important}.mobile-nav{display:none!important}
        @media(max-width:768px){.desktop-sidebar{display:none!important}.mobile-nav{display:flex!important}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .animate-fadeIn{animation:fadeIn 0.25s ease}.animate-spin{animation:spin 0.8s linear infinite}
      `}</style>
    </div>
  )
}
