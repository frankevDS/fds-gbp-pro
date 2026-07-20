import { useState, useEffect } from 'react'
import { T, Logo, Badge } from './components/ui.jsx'
import AuthGate, { isAuthenticated, clearAuthSession, getAuthSession } from './modules/AuthGate.jsx'
import RevenueDashboard from './modules/RevenueDashboard.jsx'
import ClientTracker from './modules/ClientTracker.jsx'
import AuditTool from './modules/AuditTool.jsx'
import Settings from './modules/Settings.jsx'
import AITools from './modules/AITools.jsx'
import SuspensionChecker from './modules/SuspensionChecker.jsx'

import SetupBlueprint from './modules/SetupBlueprint.jsx'
import { ProposalBuilder, PitchScript } from './modules/ProposalBuilder.jsx'

const MODULES = [
  { id:'dashboard', icon:'💰', label:'Dashboard',        short:'Dashboard' },
  { id:'clients',   icon:'📊', label:'Client Tracker',   short:'Clients'   },
  { id:'audit',     icon:'🔍', label:'Audit Tool',       short:'Audit'     },
  { id:'blueprint', icon:'📋', label:'GBP Blueprint',    short:'Blueprint' },
  { id:'proposal',  icon:'📝', label:'Proposal Builder', short:'Proposal'  },
  { id:'pitch',     icon:'🎯', label:'Pitch Script',     short:'Pitch'     },
  { id:'ai',        icon:'🤖', label:'AI Tools',         short:'AI'        },
  { id:'risk',      icon:'🛡️', label:'Risk Checker',     short:'Risk'      },
  { id:'settings',  icon:'⚙️', label:'Settings',         short:'Settings'  },
]

function Loading() {
  return <div style={{padding:40,textAlign:'center',color:T.textLight}}><div style={{fontSize:36,marginBottom:12}}>⏳</div><p>Loading...</p></div>
}

export default function App() {
  const [authed, setAuthed]   = useState(false)
  const [user, setUser]       = useState(null)
  const [active, setActive]   = useState('dashboard')
  const [prefill, setPrefill] = useState(null)

  useEffect(() => {
    if (isAuthenticated()) { setAuthed(true); setUser(getAuthSession()) }
    const handleNav = (e) => {
      setActive(e.detail)
      if (e.detail === 'proposal') {
        try {
          const raw = localStorage.getItem('fds_gbp_audit_prefill')
          if (raw) { const d=JSON.parse(raw); if(Date.now()-d.timestamp<60000)setPrefill(d); localStorage.removeItem('fds_gbp_audit_prefill') }
        } catch {}
      }
    }
    window.addEventListener('fds-navigate', handleNav)
    return () => window.removeEventListener('fds-navigate', handleNav)
  }, [])

  const logout = () => { clearAuthSession(); setAuthed(false); setUser(null); setActive('dashboard') }
  const nav = (id) => { setActive(id); if(id!=='proposal')setPrefill(null) }

  if (!authed) return <AuthGate onAuthenticated={(u)=>{setUser(u);setAuthed(true)}}/>

  const renderModule = () => {
    try {
      switch(active) {
        case 'dashboard': return <RevenueDashboard/>
        case 'clients':   return <ClientTracker/>
        case 'audit':     return <AuditTool/>
        case 'blueprint': return <SetupBlueprint/>
        case 'proposal':  return <ProposalBuilder prefill={prefill}/>
        case 'pitch':     return <PitchScript/>
        case 'ai':        return <AITools/>
        case 'risk':      return <SuspensionChecker/>
        case 'settings':  return <Settings onLogout={logout}/>
        default:          return <RevenueDashboard/>
      }
    } catch(e) {
      return <div style={{padding:40,textAlign:'center'}}><div style={{fontSize:48,marginBottom:12}}>⚠️</div><h3 style={{color:T.danger}}>Module Error</h3><p style={{color:T.textLight,fontSize:13,margin:'8px 0 20px'}}>{e.message}</p><button onClick={()=>setActive('dashboard')} style={{padding:'10px 20px',background:T.blue,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>← Dashboard</button></div>
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#F8FAFF',fontFamily:"'Inter','Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:T.white,borderBottom:`1px solid ${T.grayBorder}`,padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:200,boxShadow:'0 2px 8px rgba(15,28,63,0.06)'}}>
        <Logo/>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {user&&<span style={{fontSize:12,color:T.textLight,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>👤 {user.name}{user.role==='admin'?' 👑':''}</span>}
          <Badge color={T.gold} bg={T.goldLight}>GBP Pro</Badge>
          <button onClick={logout} style={{padding:'5px 10px',borderRadius:6,border:`1px solid ${T.grayBorder}`,background:T.grayLight,color:T.textLight,fontWeight:600,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>🚪</button>
        </div>
      </div>

      <div style={{display:'flex',minHeight:'calc(100vh - 62px)'}}>
        <div style={{width:220,background:T.dark,flexShrink:0,display:'flex',flexDirection:'column',paddingTop:20,position:'sticky',top:62,height:'calc(100vh - 62px)',overflowY:'auto'}} className="desktop-sidebar">
          <div style={{padding:'0 12px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)',marginBottom:12}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>Navigation</div>
            {MODULES.map(m=>(
              <button key={m.id} onClick={()=>nav(m.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:9,border:'none',cursor:'pointer',background:active===m.id?`${T.blue}CC`:'transparent',color:active===m.id?T.white:'rgba(255,255,255,0.6)',fontWeight:active===m.id?700:500,fontSize:13,marginBottom:2,textAlign:'left',fontFamily:'inherit',transition:'all 0.15s'}}>
                <span style={{fontSize:16,width:20,textAlign:'center'}}>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
          <div style={{padding:12,marginTop:'auto'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',lineHeight:1.6}}>© Frankev Digital Services<br/>frankevgloballtd@gmail.com</div>
          </div>
        </div>

        <div style={{flex:1,padding:'24px 20px 100px',maxWidth:800,width:'100%'}}>
          <div key={active} className="animate-fadeIn">{renderModule()}</div>
        </div>
      </div>

      <div style={{position:'fixed',bottom:0,left:0,right:0,background:T.dark,borderTop:'1px solid rgba(255,255,255,0.1)',display:'flex',zIndex:200,overflowX:'auto',paddingBottom:'env(safe-area-inset-bottom)'}} className="mobile-nav">
        {MODULES.map(m=>(
          <button key={m.id} onClick={()=>nav(m.id)} style={{flex:'0 0 auto',minWidth:58,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 4px 6px',border:'none',background:'none',cursor:'pointer',fontFamily:'inherit',borderTop:active===m.id?`2px solid #3B6EF8`:'2px solid transparent'}}>
            <span style={{fontSize:16,lineHeight:1}}>{m.icon}</span>
            <span style={{fontSize:9,fontWeight:active===m.id?700:500,color:active===m.id?'#3B6EF8':'rgba(255,255,255,0.5)',marginTop:4}}>{m.short}</span>
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
