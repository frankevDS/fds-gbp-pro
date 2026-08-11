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
import { hasPermission, ROLES, DEFAULT_PERMISSIONS } from './utils/roles.js'

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
    track() // track immediately on login
    const interval = setInterval(track, 60000)
    return () => clearInterval(interval)
  }, [session?.id])
}

// Record login event
function recordLogin(session) {
  if (!session) return
  const key = `fds_activity_${session.id}`
  try {
    const ex = JSON.parse(localStorage.getItem(key) || '{}')
    localStorage.setItem(key, JSON.stringify({
      ...ex, userId: session.id, name: session.name,
      email: session.email, role: session.role,
      lastSeen: Date.now(),
      sessionStart: Date.now(),
      totalMinutes: ex.totalMinutes || 0,
      loginHistory: [
        { at: new Date().toISOString(), action: 'login' },
        ...(ex.loginHistory || [])
      ].slice(0, 50)
    }))
  } catch {}
}

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

// Locked module placeholder
function LockedModule({ module: m }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
      <h3 style={{ fontSize:20, fontWeight:800, color:'#000', marginBottom:8 }}>Access Restricted</h3>
      <p style={{ fontSize:14, color:'#555', maxWidth:340, lineHeight:1.7, marginBottom:24 }}>
        You do not have permission to use <strong>{m.label}</strong>.<br/>
        Contact Abiodun at <a href="mailto:hispraise01@gmail.com" style={{color:T.blue}}>hispraise01@gmail.com</a> to request access.
      </p>
      <div style={{ background:T.blueLight, borderRadius:10, padding:'10px 20px', fontSize:13, color:T.blue, fontWeight:600 }}>
        Your role: {ROLES[getAuthSession()?.role]?.icon} {ROLES[getAuthSession()?.role]?.label || 'Basic User'}
      </div>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed]   = useState(false)
  const [user, setUser]       = useState(null)
  const [active, setActive]   = useState('dashboard')
  const [prefill, setPrefill] = useState(null)

  useEffect(() => {
    if (isAuthenticated()) {
      const s = getAuthSession()
      setAuthed(true)
      setUser(s)
      recordLogin(s)
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
    // Record logout
    if (user) {
      const key = `fds_activity_${user.id}`
      try {
        const ex = JSON.parse(localStorage.getItem(key) || '{}')
        localStorage.setItem(key, JSON.stringify({
          ...ex, lastSeen: Date.now(),
          loginHistory: [{ at: new Date().toISOString(), action: 'logout' }, ...(ex.loginHistory || [])].slice(0, 50)
        }))
      } catch {}
    }
    clearAuthSession()
    setAuthed(false)
    setUser(null)
    setActive('dashboard')
  }

  const nav = (id) => { setActive(id); if (id !== 'proposal') setPrefill(null) }

  // Determine which modules this user can SEE in the nav
  const visibleModules = ALL_MODULES.filter(m => {
    if (!user) return false
    if (user.role === 'super_admin' || user.email === 'frankevgloballtd@gmail.com') return true
    if (user.role === 'admin') return true
    const perms = user.permissions || DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS.basic
    return perms.includes(m.feature)
  })

  if (!authed) {
    return <AuthGate onAuthenticated={(u) => {
      setUser(u)
      setAuthed(true)
      recordLogin(u)
    }} />
  }

  const roleInfo = ROLES[user?.role] || ROLES.basic

  const renderModule = () => {
    const mod = ALL_MODULES.find(m => m.id === active)
    // Check permission
    if (mod && !hasPermission(user, mod.feature)) {
      return <LockedModule module={mod} />
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
        default:          return <RevenueDashboard />
      }
    } catch(e) {
      return (
        <div style={{padding:40,textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
          <h3 style={{color:T.danger}}>Something went wrong</h3>
          <p style={{color:'#555',fontSize:13,margin:'8px 0 20px'}}>{e.message}</p>
          <button onClick={()=>setActive('dashboard')} style={{padding:'10px 20px',background:T.blue,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>← Dashboard</button>
        </div>
      )
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#F8FAFF',fontFamily:"'Inter','Segoe UI',system-ui,sans-serif"}}>

      {/* HEADER */}
      <div style={{background:'#fff',borderBottom:`1px solid ${T.grayBorder}`,padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:200,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
        <Logo />
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          {user && (
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#16A34A',boxShadow:'0 0 4px #16A34A'}} />
              <span style={{fontSize:12,color:'#333',fontWeight:600,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</span>
              <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,background:roleInfo.bg,color:roleInfo.color}}>{roleInfo.icon} {roleInfo.label}</span>
            </div>
          )}
          <Badge color={T.gold} bg={T.goldLight}>GBP Pro</Badge>
          <button onClick={logout} title="Log out" style={{padding:'5px 10px',borderRadius:6,border:`1px solid ${T.grayBorder}`,background:T.grayLight,color:'#555',fontWeight:600,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>🚪</button>
        </div>
      </div>

      <div style={{display:'flex',minHeight:'calc(100vh - 62px)'}}>

        {/* SIDEBAR */}
        <div style={{width:220,background:'#0F172A',flexShrink:0,display:'flex',flexDirection:'column',paddingTop:20,position:'sticky',top:62,height:'calc(100vh - 62px)',overflowY:'auto'}} className="desktop-sidebar">
          <div style={{padding:'0 12px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)',marginBottom:12}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>Navigation</div>
            {ALL_MODULES.map(m => {
              const hasAccess = hasPermission(user, m.feature)
              return (
                <button key={m.id} onClick={() => nav(m.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:9,border:'none',cursor:'pointer',background:active===m.id?`${T.blue}CC`:'transparent',color:active===m.id?'#fff':hasAccess?'rgba(255,255,255,0.65)':'rgba(255,255,255,0.25)',fontWeight:active===m.id?700:500,fontSize:13,marginBottom:2,textAlign:'left',fontFamily:'inherit',transition:'all 0.15s'}}>
                  <span style={{fontSize:16,width:20,textAlign:'center',opacity:hasAccess?1:0.4}}>{m.icon}</span>
                  <span style={{flex:1}}>{m.label}</span>
                  {!hasAccess && <span style={{fontSize:10}}>🔒</span>}
                </button>
              )
            })}
          </div>
          <div style={{padding:12,marginTop:'auto'}}>
            <div style={{background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'10px 12px',marginBottom:10}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',fontWeight:700,marginBottom:2}}>{roleInfo.icon} {roleInfo.label}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',wordBreak:'break-all'}}>{user?.email}</div>
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',lineHeight:1.6}}>© Frankev Digital Services<br/>hispraise01@gmail.com</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{flex:1,padding:'24px 20px 100px',maxWidth:800,width:'100%'}}>
          <div key={active} className="animate-fadeIn">{renderModule()}</div>
        </div>
      </div>

      {/* MOBILE NAV — only show accessible modules */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#0F172A',borderTop:'1px solid rgba(255,255,255,0.1)',display:'flex',zIndex:200,overflowX:'auto',paddingBottom:'env(safe-area-inset-bottom)'}} className="mobile-nav">
        {ALL_MODULES.map(m => {
          const hasAccess = hasPermission(user, m.feature)
          return (
            <button key={m.id} onClick={() => nav(m.id)} style={{flex:'0 0 auto',minWidth:58,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 4px 6px',border:'none',background:'none',cursor:'pointer',fontFamily:'inherit',borderTop:active===m.id?`2px solid #3B6EF8`:'2px solid transparent',opacity:hasAccess?1:0.4}}>
              <span style={{fontSize:16,lineHeight:1}}>{m.icon}</span>
              <span style={{fontSize:9,fontWeight:active===m.id?700:500,color:active===m.id?'#3B6EF8':'rgba(255,255,255,0.5)',marginTop:4}}>{m.short}</span>
            </button>
          )
        })}
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
