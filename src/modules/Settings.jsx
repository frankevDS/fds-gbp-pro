import { useState } from 'react'
import { T, Btn, Card, Input, Field, SectionHeader } from '../components/ui.jsx'
import { getSettings, saveSettings } from '../utils/storage.js'
import AuthSettings from './AuthSettings.jsx'

const COUNTRIES=[
  {name:'Ghana',symbol:'₵',code:'GHS',flag:'🇬🇭'},{name:'Nigeria',symbol:'₦',code:'NGN',flag:'🇳🇬'},
  {name:'United Kingdom',symbol:'£',code:'GBP',flag:'🇬🇧'},{name:'United States',symbol:'$',code:'USD',flag:'🇺🇸'},
  {name:'South Africa',symbol:'R',code:'ZAR',flag:'🇿🇦'},{name:'Kenya',symbol:'KSh',code:'KES',flag:'🇰🇪'},
  {name:'European Union',symbol:'€',code:'EUR',flag:'🇪🇺'},{name:'UAE',symbol:'AED',code:'AED',flag:'🇦🇪'},
  {name:'Canada',symbol:'CA$',code:'CAD',flag:'🇨🇦'},{name:'Australia',symbol:'A$',code:'AUD',flag:'🇦🇺'},
  {name:'Tanzania',symbol:'TSh',code:'TZS',flag:'🇹🇿'},{name:'Rwanda',symbol:'RF',code:'RWF',flag:'🇷🇼'},
  {name:'Other',symbol:'$',code:'USD',flag:'🌍'}
]

export default function Settings({onLogout}){
  const [f,setF]=useState(getSettings())
  const [saved,setSaved]=useState(false)
  const [showKey,setShowKey]=useState(false)
  const [tab,setTab]=useState('general')
  const set=(k,v)=>setF(p=>({...p,[k]:v}))

  const handleCountry=(name)=>{const c=COUNTRIES.find(x=>x.name===name);if(c)setF(p=>({...p,country:c.name,currency:c.symbol,currencyCode:c.code}))}
  const handleSave=()=>{saveSettings(f);setSaved(true);setTimeout(()=>setSaved(false),2500);window.dispatchEvent(new Event('fds-settings-updated'))}
  const selected=COUNTRIES.find(c=>c.name===f.country)
  const ts=(id)=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:700,fontSize:13,background:tab===id?T.blue:T.grayLight,color:tab===id?'#fff':T.textLight})

  return (
    <div>
      <SectionHeader icon="⚙️" title="Settings" subtitle="Configure FDS GBP Pro — currency, AI key, and access control."/>
      <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        <button style={ts('general')} onClick={()=>setTab('general')}>🌍 General</button>
        <button style={ts('ai')} onClick={()=>setTab('ai')}>🤖 AI / Groq</button>
        <button style={ts('access')} onClick={()=>setTab('access')}>🔐 Access Control</button>
        <button style={ts('install')} onClick={()=>setTab('install')}>📱 Install</button>
      </div>

      {tab==='general'&&<>
        <Card style={{marginBottom:20,border:`2px solid ${T.blue}`}}>
          <h3 style={{margin:'0 0 6px',fontSize:15,fontWeight:800,color:T.dark}}>🌍 Country & Currency</h3>
          <p style={{fontSize:12,color:T.textLight,marginBottom:16}}>Sets the currency shown across all modules.</p>
          <Field label="Select Your Country">
            <select value={f.country||''} onChange={e=>handleCountry(e.target.value)} style={{width:'100%',padding:'11px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:14,color:T.text,background:T.grayLight,outline:'none',fontFamily:'inherit'}}>
              <option value="">Select country...</option>
              {COUNTRIES.map(c=><option key={c.name} value={c.name}>{c.flag}  {c.name} — {c.code} ({c.symbol})</option>)}
            </select>
          </Field>
          {selected&&<div style={{background:T.successLight,border:'1px solid #86EFAC',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:16}}><span style={{fontSize:32}}>{selected.flag}</span><div><div style={{fontSize:13,fontWeight:700,color:T.success}}>✅ {selected.code}</div><div style={{fontSize:22,fontWeight:900,color:T.dark}}>{selected.symbol}0.00</div></div></div>}
          <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.grayBorder}`}}>
            <p style={{fontSize:12,fontWeight:600,color:T.textLight,marginBottom:8}}>Custom override (optional):</p>
            <input value={f.currency||''} onChange={e=>set('currency',e.target.value)} placeholder="e.g. ₵" maxLength={6} style={{width:120,padding:'9px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:16,fontFamily:'inherit',background:T.white,outline:'none',textAlign:'center',fontWeight:700}}/>
          </div>
        </Card>
        <Card style={{marginBottom:20}}>
          <h3 style={{margin:'0 0 14px',fontSize:15,fontWeight:800,color:T.dark}}>👤 Your Details</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="Your Name"><input value={f.yourName||''} onChange={e=>set('yourName',e.target.value)} placeholder="e.g. Abiodun" style={{width:'100%',padding:'10px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:14,fontFamily:'inherit',background:T.grayLight,outline:'none',boxSizing:'border-box'}}/></Field>
            <Field label="Your Email"><input value={f.yourEmail||''} onChange={e=>set('yourEmail',e.target.value)} placeholder="e.g. hispraise01@gmail.com" style={{width:'100%',padding:'10px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:14,fontFamily:'inherit',background:T.grayLight,outline:'none',boxSizing:'border-box'}}/></Field>
            <Field label="WhatsApp"><input value={f.whatsapp||''} onChange={e=>set('whatsapp',e.target.value)} placeholder="+233 XX XXX XXXX" style={{width:'100%',padding:'10px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:14,fontFamily:'inherit',background:T.grayLight,outline:'none',boxSizing:'border-box'}}/></Field>
            <Field label="Base City"><input value={f.baseCity||''} onChange={e=>set('baseCity',e.target.value)} placeholder="e.g. Accra" style={{width:'100%',padding:'10px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:14,fontFamily:'inherit',background:T.grayLight,outline:'none',boxSizing:'border-box'}}/></Field>
          </div>
        </Card>
        <Btn full onClick={handleSave} size="lg">{saved?'✅ Settings Saved!':'💾 Save Settings'}</Btn>
      </>}

      {tab==='ai'&&<>
        <Card style={{marginBottom:20}}>
          <h3 style={{margin:'0 0 6px',fontSize:15,fontWeight:800,color:T.dark}}>🤖 Groq AI Key</h3>
          <div style={{background:T.blueLight,borderRadius:10,padding:14,marginBottom:16,fontSize:13,color:'#1E40AF'}}>
            <strong>Get free key:</strong> console.groq.com → API Keys → Create → Copy (starts with gsk_)<br/>
            <strong>💡 Tip:</strong> If VITE_GROQ_API_KEY is set in Vercel environment variables, you don't need to enter it here.
          </div>
          <Field label="Groq API Key">
            <div style={{display:'flex',gap:8}}>
              <input type={showKey?'text':'password'} value={f.groqKey||''} onChange={e=>set('groqKey',e.target.value)} placeholder="gsk_..." style={{flex:1,padding:'10px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:14,fontFamily:'inherit',background:T.grayLight,outline:'none'}}/>
              <Btn variant="secondary" size="sm" onClick={()=>setShowKey(s=>!s)}>{showKey?'🙈':'👁'}</Btn>
            </div>
          </Field>
          {f.groqKey&&<div style={{background:T.successLight,border:'1px solid #86EFAC',borderRadius:8,padding:10,fontSize:13,color:T.success}}>✅ API key set — all AI features enabled.</div>}
        </Card>
        <Btn full onClick={handleSave} size="lg">{saved?'✅ Saved!':'💾 Save Settings'}</Btn>
      </>}

      {tab==='access'&&<AuthSettings onLogout={onLogout}/>}

      {tab==='install'&&<Card>
        <h3 style={{margin:'0 0 14px',fontSize:15,fontWeight:800,color:T.dark}}>📱 Install App</h3>
        <div style={{background:T.grayLight,borderRadius:10,padding:16,fontSize:13,lineHeight:2.2}}>
          <p style={{fontWeight:700,marginBottom:4}}>📱 Android (Chrome):</p>
          <p style={{marginBottom:12}}>Tap <strong>⋮ menu</strong> → <strong>Add to Home Screen</strong> → <strong>Install</strong></p>
          <p style={{fontWeight:700,marginBottom:4}}>🍎 iPhone (Safari):</p>
          <p style={{marginBottom:12}}>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong></p>
          <p style={{fontWeight:700,marginBottom:4}}>💻 Desktop (Chrome/Edge):</p>
          <p>Click <strong>⊕</strong> in address bar → <strong>Install</strong></p>
        </div>
        <div style={{marginTop:16,padding:'12px 16px',background:T.blueLight,borderRadius:10,fontSize:13,color:'#1E40AF'}}>
          <strong>FDS GBP Pro v2.0</strong> · Frankev Digital Services · hispraise01@gmail.com
        </div>
      </Card>}
    </div>
  )
}
