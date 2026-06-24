import { useState } from 'react'
import { T, Logo, Badge } from './components/ui.jsx'
import AuditTool from './modules/AuditTool.jsx'
import SetupBlueprint from './modules/SetupBlueprint.jsx'
import ProposalBuilder from './modules/ProposalBuilder.jsx'
import PitchScript from './modules/PitchScript.jsx'
import ClientTracker from './modules/ClientTracker.jsx'
import AITools from './modules/AITools.jsx'
import RevenueDashboard from './modules/RevenueDashboard.jsx'
import Settings from './modules/Settings.jsx'

const MODULES = [
  { id: 'dashboard', icon: '💰', label: 'Dashboard', short: 'Dashboard' },
  { id: 'clients', icon: '📊', label: 'Client Tracker', short: 'Clients' },
  { id: 'audit', icon: '🔍', label: 'Audit Tool', short: 'Audit' },
  { id: 'blueprint', icon: '📋', label: 'GBP Blueprint', short: 'Blueprint' },
  { id: 'proposal', icon: '📝', label: 'Proposal Builder', short: 'Proposal' },
  { id: 'pitch', icon: '🎯', label: 'Pitch Script', short: 'Pitch' },
  { id: 'ai', icon: '🤖', label: 'AI Tools', short: 'AI Tools' },
  { id: 'settings', icon: '⚙️', label: 'Settings', short: 'Settings' },
]

export default function App() {
  const [active, setActive] = useState('dashboard')

  const renderModule = () => {
    switch(active) {
      case 'dashboard': return <RevenueDashboard />
      case 'clients':   return <ClientTracker />
      case 'audit':     return <AuditTool />
      case 'blueprint': return <SetupBlueprint />
      case 'proposal':  return <ProposalBuilder />
      case 'pitch':     return <PitchScript />
      case 'ai':        return <AITools />
      case 'settings':  return <Settings />
      default:          return <RevenueDashboard />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* TOP HEADER */}
      <div style={{
        background: T.white, borderBottom: `1px solid ${T.grayBorder}`,
        padding: '12px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 8px rgba(15,28,63,0.06)'
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge color={T.gold} bg={T.goldLight}>GBP Pro</Badge>
          <span style={{ fontSize: 11, color: T.textLight, display: 'none' }}>v1.0</span>
        </div>
      </div>

      {/* DESKTOP SIDEBAR + CONTENT */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 62px)' }}>

        {/* SIDEBAR — desktop only */}
        <div style={{
          width: 220, background: T.dark, flexShrink: 0,
          display: 'flex', flexDirection: 'column', paddingTop: 20,
          position: 'sticky', top: 62, height: 'calc(100vh - 62px)', overflowY: 'auto',
        }} className="desktop-sidebar">
          <div style={{ padding: '0 12px 20px', borderBottom: `1px solid rgba(255,255,255,0.08)`, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Navigation</div>
            {MODULES.map(m => (
              <button key={m.id} onClick={() => setActive(m.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: active === m.id ? `${T.blue}CC` : 'transparent',
                color: active === m.id ? T.white : 'rgba(255,255,255,0.6)',
                fontWeight: active === m.id ? 700 : 500, fontSize: 13,
                marginBottom: 2, textAlign: 'left', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '12px 12px', marginTop: 'auto' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              © Frankev Digital Services<br />
              frankevgloballtd@gmail.com
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: '24px 20px 100px', maxWidth: 800, width: '100%' }}>
          <div key={active} className="animate-fadeIn">
            {renderModule()}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV — mobile */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: T.dark, borderTop: `1px solid rgba(255,255,255,0.1)`,
        display: 'flex', zIndex: 200, overflowX: 'auto',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }} className="mobile-nav">
        {MODULES.map(m => (
          <button key={m.id} onClick={() => setActive(m.id)} style={{
            flex: '0 0 auto', minWidth: 64, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '10px 8px 6px',
            border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
            borderTop: active === m.id ? `2px solid ${T.blueAccent}` : '2px solid transparent',
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{m.icon}</span>
            <span style={{ fontSize: 10, fontWeight: active === m.id ? 700 : 500, color: active === m.id ? T.blueAccent : 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              {m.short}
            </span>
          </button>
        ))}
      </div>

      {/* RESPONSIVE STYLES */}
      <style>{`
        .desktop-sidebar { display: flex !important; }
        .mobile-nav { display: none !important; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease; }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  )
}
