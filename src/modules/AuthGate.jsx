import { useState, useRef, useEffect } from 'react'
import { readDB, writeDB, clearCache } from '../utils/db.js'

const T = {
  blue:'#1B4FD8',blueLight:'#EEF3FF',dark:'#0F1C3F',
  gray:'#64748B',grayLight:'#F1F5F9',grayBorder:'#E2E8F0',
  white:'#FFFFFF',success:'#16A34A',successLight:'#F0FDF4',
  danger:'#DC2626',dangerLight:'#FEF2F2',text:'#1E293B',textLight:'#64748B'
}

const SUPER_ADMIN_EMAIL  = 'frankevgloballtd@gmail.com'  // SECRET — never shown publicly
const SUPER_ADMIN_NAME   = 'Abiodun'
const PUBLIC_CONTACT     = 'hispraise01@gmail.com'          // Shown on login screen

// ─── SESSION (browser tab only — intentional) ────────────────────────────────
export function getAuthSession() {
  try { const s=sessionStorage.getItem('fds_session'); return s?JSON.parse(s):null } catch { return null }
}
export function setAuthSession(user) {
  try { sessionStorage.setItem('fds_session', JSON.stringify({...user,loginAt:Date.now()})) } catch {}
}
export function clearAuthSession() {
  try { sessionStorage.removeItem('fds_session') } catch {}
}
export function isAuthenticated() {
  const s=getAuthSession()
  if (!s) return false
  if (Date.now()-s.loginAt > 8*60*60*1000) { clearAuthSession(); return false }
  return true
}
export function isAdmin() { return getAuthSession()?.role==='admin' }

// ─── CLOUD CONFIG HELPERS ─────────────────────────────────────────────────────
export async function getAuthConfig() {
  return await readDB()
}

export async function saveAuthConfig(config) {
  clearCache()
  return await writeDB(config)
}

export async function addApprovedUser(user) {
  const c = await getAuthConfig()
  const exists = c.approvedUsers.find(u=>u.email.toLowerCase()===user.email.toLowerCase())
  if (exists) {
    c.approvedUsers = c.approvedUsers.map(u=>u.email.toLowerCase()===user.email.toLowerCase()?{...u,...user}:u)
  } else {
    c.approvedUsers.push({id:Date.now().toString(),...user,approved:true})
  }
  await saveAuthConfig(c)
}

export async function removeUser(id) {
  const c = await getAuthConfig()
  c.approvedUsers = c.approvedUsers.filter(u=>u.id!==id)
  await saveAuthConfig(c)
}

export async function updateMasterPin(pin) {
  const c = await getAuthConfig()
  c.masterPin = pin
  c.approvedUsers = c.approvedUsers.map(u=>u.role==='admin'?{...u,pin}:u)
  await saveAuthConfig(c)
}

// ─── PIN PAD ──────────────────────────────────────────────────────────────────
function PinPad({ onComplete, label }) {
  const [digits, setDigits] = useState([])

  const press = (k) => {
    if (k==='⌫') { setDigits(p=>p.slice(0,-1)); return }
    if (digits.length>=4) return
    const next=[...digits,k]
    setDigits(next)
    if (next.length===4) {
      const pin=next.join('')
      setDigits([])
      setTimeout(()=>onComplete(pin),120)
    }
  }

  const keys=['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div>
      <p style={{fontSize:13,color:T.textLight,marginBottom:18,textAlign:'center'}}>{label}</p>
      <div style={{display:'flex',gap:14,justifyContent:'center',marginBottom:26}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:52,height:60,borderRadius:12,border:`2px solid ${digits.length>i?T.blue:T.grayBorder}`,background:digits.length>i?T.blueLight:'#F8FAFF',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.12s'}}>
            {digits.length>i&&<div style={{width:14,height:14,borderRadius:'50%',background:T.blue}}/>}
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,maxWidth:300,margin:'0 auto'}}>
        {keys.map((k,i)=>(
          <button key={i} onClick={()=>k!==''&&press(k)}
            onMouseDown={e=>{if(k!=='')e.currentTarget.style.transform='scale(0.92)'}}
            onMouseUp={e=>{e.currentTarget.style.transform='scale(1)'}}
            onTouchStart={e=>{if(k!=='')e.currentTarget.style.transform='scale(0.92)'}}
            onTouchEnd={e=>{e.currentTarget.style.transform='scale(1)'}}
            style={{height:60,borderRadius:14,border:k===''?'none':`1.5px solid ${T.grayBorder}`,background:k===''?'transparent':'#fff',fontSize:k==='⌫'?22:24,fontWeight:600,color:T.dark,cursor:k===''?'default':'pointer',boxShadow:k!==''?'0 2px 6px rgba(0,0,0,0.07)':'none',transition:'transform 0.1s',opacity:k===''?0:1,pointerEvents:k===''?'none':'auto',fontFamily:'inherit'}}>{k}</button>
        ))}
      </div>
    </div>
  )
}

// ─── SUPER ADMIN BYPASS ───────────────────────────────────────────────────────
function SuperAdminBypass({ onSuccess, onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleBypass = () => {
    if (email.trim().toLowerCase()===SUPER_ADMIN_EMAIL.toLowerCase()) {
      const u={id:'super_admin',name:SUPER_ADMIN_NAME,email:SUPER_ADMIN_EMAIL,role:'admin'}
      setAuthSession(u)
      onSuccess(u)
    } else {
      setError('Only the super admin email works here.')
      setTimeout(()=>setError(''),4000)
    }
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:360,padding:'32px 28px',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.5)'}}>
        <div style={{fontSize:40,marginBottom:12}}>🔑</div>
        <h2 style={{fontSize:18,fontWeight:900,color:T.dark,margin:'0 0 6px'}}>Super Admin Entry</h2>
        <p style={{fontSize:13,color:T.textLight,marginBottom:20,lineHeight:1.6}}>Enter the super admin email to bypass all PIN checks and access the app directly.</p>
        <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&handleBypass()} placeholder="Enter super admin email" autoFocus
          style={{width:'100%',padding:'13px 16px',border:`1.5px solid ${error?T.danger:T.grayBorder}`,borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box',marginBottom:12,color:T.dark,background:'#F8FAFF'}}/>
        {error&&<p style={{color:T.danger,fontSize:13,marginBottom:12}}>{error}</p>}
        <button onClick={handleBypass} disabled={!email.trim()} style={{width:'100%',padding:'13px',borderRadius:12,border:'none',background:!email.trim()?'#CBD5E1':'linear-gradient(135deg,#1B4FD8,#7C3AED)',color:'#fff',fontWeight:800,fontSize:15,cursor:!email.trim()?'not-allowed':'pointer',fontFamily:'inherit',marginBottom:10}}>
          Enter App →
        </button>
        <button onClick={onClose} style={{background:'none',border:'none',color:T.textLight,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>← Back to login</button>
        <p style={{fontSize:11,color:'#CBD5E1',marginTop:16}}>Emergency access only</p>
      </div>
    </div>
  )
}

// ─── MAIN AUTH GATE ───────────────────────────────────────────────────────────
export default function AuthGate({ onAuthenticated }) {
  const [mode, setMode]           = useState('pin')
  const [email, setEmail]         = useState('')
  const [step, setStep]           = useState(1)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showBypass, setShowBypass] = useState(false)
  const [dbReady, setDbReady]     = useState(false)

  // Preload config on mount
  useEffect(() => {
    readDB().then(()=>setDbReady(true)).catch(()=>setDbReady(true))
  }, [])

  const logoTaps = useRef(0)
  const logoTimer = useRef(null)
  const handleLogoTap = () => {
    logoTaps.current+=1
    if (logoTimer.current) clearTimeout(logoTimer.current)
    if (logoTaps.current>=3) { logoTaps.current=0; setShowBypass(true); return }
    logoTimer.current=setTimeout(()=>{logoTaps.current=0},2000)
  }

  const showErr = (msg) => { setError(msg); setTimeout(()=>setError(''),7000) }

  // ── PIN LOGIN ──────────────────────────────────────────────────────────────
  const handlePin = async (pin) => {
    setLoading(true)
    try {
      const cfg = await getAuthConfig()
      if (pin===cfg.masterPin) {
        const u={id:'master',name:SUPER_ADMIN_NAME,email:SUPER_ADMIN_EMAIL,role:'admin'}
        setAuthSession(u); onAuthenticated(u); return
      }
      const user=cfg.approvedUsers.find(u=>u.pin===pin&&u.approved&&u.role!=='admin')
      if (user) { setAuthSession(user); onAuthenticated(user); return }
      showErr('Incorrect PIN. Contact Abiodun at ' + PUBLIC_CONTACT + ' to request access.')
    } catch(e) { showErr('Connection error. Check your internet and try again.') }
    setLoading(false)
  }

  // ── EMAIL CHECK ────────────────────────────────────────────────────────────
  const checkEmail = async () => {
    const e=email.trim().toLowerCase()
    if (!e.includes('@')) { showErr('Enter a valid email address.'); return }
    setLoading(true)
    try {
      const cfg = await getAuthConfig()
      const user=cfg.approvedUsers.find(u=>u.email.toLowerCase()===e&&u.approved)
      if (user) { setStep(2); setError('') }
      else { showErr('Email not on approved list. Contact Abiodun at ' + PUBLIC_CONTACT + ' to request access.') }
    } catch(e) { showErr('Connection error. Check your internet and try again.') }
    setLoading(false)
  }

  // ── EMAIL + PIN ────────────────────────────────────────────────────────────
  const handleEmailPin = async (pin) => {
    setLoading(true)
    const e=email.trim().toLowerCase()
    try {
      const cfg = await getAuthConfig()
      if (e===SUPER_ADMIN_EMAIL.toLowerCase()&&pin===cfg.masterPin) {
        const u={id:'master',name:SUPER_ADMIN_NAME,email:SUPER_ADMIN_EMAIL,role:'admin'}
        setAuthSession(u); onAuthenticated(u); return
      }
      const user=cfg.approvedUsers.find(u=>u.email.toLowerCase()===e&&u.pin===pin&&u.approved)
      if (user) { setAuthSession(user); onAuthenticated(user); return }
      showErr('Incorrect PIN. Contact Abiodun for your correct PIN.')
    } catch(e) { showErr('Connection error. Check your internet and try again.') }
    setLoading(false)
  }

  const switchMode=(m)=>{setMode(m);setError('');setEmail('');setStep(1)}

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0F1C3F 0%,#1B4FD8 65%,#7C3AED 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:'#fff',borderRadius:24,width:'100%',maxWidth:420,padding:'36px 32px 32px',textAlign:'center',boxShadow:'0 32px 80px rgba(0,0,0,0.35)'}}>

        <div onClick={handleLogoTap} style={{width:72,height:72,borderRadius:18,margin:'0 auto 16px',background:'linear-gradient(135deg,#1B4FD8,#7C3AED,#059669)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:20,fontWeight:900,letterSpacing:1,boxShadow:'0 8px 24px rgba(27,79,216,0.4)',cursor:'pointer',userSelect:'none'}}>GBP</div>

        <h1 style={{fontSize:22,fontWeight:900,color:T.dark,margin:'0 0 4px'}}>FDS GBP Pro</h1>
        <p style={{fontSize:13,color:T.textLight,marginBottom:24}}>Frankev Digital Services — Authorised Access Only</p>

        {!dbReady&&<div style={{fontSize:13,color:T.textLight,marginBottom:16}}>🔄 Loading user data...</div>}

        <div style={{display:'flex',background:'#F1F5F9',borderRadius:12,padding:4,marginBottom:28}}>
          {[['pin','🔢 PIN Login'],['email','📧 Email + PIN']].map(([m,label])=>(
            <button key={m} onClick={()=>switchMode(m)} style={{flex:1,padding:'10px 0',borderRadius:9,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13,background:mode===m?'#fff':'transparent',color:mode===m?T.dark:T.textLight,fontWeight:mode===m?700:500,boxShadow:mode===m?'0 2px 8px rgba(0,0,0,0.08)':'none',transition:'all 0.2s'}}>{label}</button>
          ))}
        </div>

        {mode==='pin'&&(
          <div>
            <PinPad onComplete={handlePin} label="Enter your 4-digit access PIN"/>
            {loading&&<p style={{fontSize:13,color:T.textLight,marginTop:12}}>🔄 Verifying...</p>}
            {error&&<div style={{marginTop:16,background:T.dangerLight,border:'1px solid #FCA5A5',borderRadius:10,padding:'10px 14px',fontSize:13,color:T.danger,lineHeight:1.5}}>{error}</div>}
          </div>
        )}

        {mode==='email'&&(
          <div>
            {step===1&&(
              <div>
                <p style={{fontSize:13,color:T.textLight,marginBottom:14}}>Enter your approved Gmail address</p>
                <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&!loading&&checkEmail()} placeholder="yourname@gmail.com" autoFocus
                  style={{width:'100%',padding:'13px 16px',border:`1.5px solid ${error?T.danger:T.grayBorder}`,borderRadius:10,fontSize:15,fontFamily:'inherit',outline:'none',boxSizing:'border-box',marginBottom:12,color:T.dark,background:'#F8FAFF'}}/>
                {error&&<div style={{background:T.dangerLight,border:'1px solid #FCA5A5',borderRadius:10,padding:'10px 14px',fontSize:13,color:T.danger,marginBottom:12,lineHeight:1.5}}>{error}</div>}
                <button onClick={checkEmail} disabled={loading||!email.trim()}
                  style={{width:'100%',padding:14,borderRadius:12,border:'none',background:loading||!email.trim()?'#CBD5E1':'linear-gradient(135deg,#1B4FD8,#3B6EF8)',color:'#fff',fontWeight:800,fontSize:15,cursor:loading||!email.trim()?'not-allowed':'pointer',fontFamily:'inherit'}}>
                  {loading?'Checking...':'Continue →'}
                </button>
              </div>
            )}
            {step===2&&(
              <div>
                <div style={{background:T.successLight,border:'1px solid #86EFAC',borderRadius:10,padding:'10px 14px',marginBottom:20,fontSize:13,color:T.success,fontWeight:600}}>✅ Email verified — enter your PIN</div>
                <PinPad onComplete={handleEmailPin} label="Enter your 4-digit PIN to complete login"/>
                {loading&&<p style={{fontSize:13,color:T.textLight,marginTop:12}}>🔄 Verifying...</p>}
                {error&&<div style={{marginTop:16,background:T.dangerLight,border:'1px solid #FCA5A5',borderRadius:10,padding:'10px 14px',fontSize:13,color:T.danger,lineHeight:1.5}}>{error}</div>}
                <button onClick={()=>{setStep(1);setError('')}} style={{background:'none',border:'none',color:T.textLight,fontSize:12,cursor:'pointer',marginTop:16,fontFamily:'inherit'}}>← Change email</button>
              </div>
            )}
          </div>
        )}

        <p style={{fontSize:11,color:T.textLight,marginTop:24,lineHeight:1.7}}>No access? Contact <strong>Abiodun</strong><br/><a href={'mailto:' + PUBLIC_CONTACT} style={{color:T.blue,textDecoration:'none'}}>{PUBLIC_CONTACT}</a></p>
      </div>

      {showBypass&&<SuperAdminBypass onSuccess={(u)=>{setShowBypass(false);onAuthenticated(u)}} onClose={()=>setShowBypass(false)}/>}
    </div>
  )
}
