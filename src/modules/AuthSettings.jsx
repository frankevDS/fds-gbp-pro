import { useState, useEffect } from 'react'
import { T, Btn, Card, Input, Field, SectionHeader } from '../components/ui.jsx'
import { getAuthConfig, addApprovedUser, removeUser, updateMasterPin, clearAuthSession, isAdmin } from './AuthGate.jsx'

const PUBLIC_CONTACT = 'hispraise01@gmail.com'

export default function AuthSettings({ onLogout }) {
  const [config, setConfig] = useState({ masterPin:'', approvedUsers:[] })
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [newUser, setNewUser] = useState({ name:'', email:'', pin:'' })
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const ok  = (m) => { setMsg(m); setErr(''); setTimeout(()=>setMsg(''),3000) }
  const fail = (m) => { setErr(m); setMsg(''); setTimeout(()=>setErr(''),5000) }

  const loadConfig = async () => {
    setLoadingConfig(true)
    try { const c = await getAuthConfig(); setConfig(c) }
    catch(e) { fail('Could not load user list. Check internet connection.') }
    setLoadingConfig(false)
  }

  useEffect(() => { loadConfig() }, [])

  const handleAdd = async () => {
    if (!newUser.name||!newUser.email||newUser.pin.length!==4) { fail('Name, email, and 4-digit PIN are all required.'); return }
    if (!newUser.email.includes('@')) { fail('Enter a valid email address.'); return }
    setSaving(true)
    try {
      await addApprovedUser({...newUser,role:'user'})
      setNewUser({name:'',email:'',pin:''})
      ok('✅ User added and synced to cloud. They can now log in from any device.')
      await loadConfig()
    } catch(e) { fail('Failed to save. Check internet connection.') }
    setSaving(false)
  }

  const handleRemove = async (id) => {
    if (id==='master') return
    if (!confirm('Remove this user? They will be locked out from all devices immediately.')) return
    setSaving(true)
    try { await removeUser(id); await loadConfig(); ok('User removed.') }
    catch(e) { fail('Failed to remove user.') }
    setSaving(false)
  }

  const handleChangePin = async () => {
    if (newPin.length!==4) { fail('PIN must be exactly 4 digits.'); return }
    if (newPin!==confirmPin) { fail('PINs do not match.'); return }
    setSaving(true)
    try {
      await updateMasterPin(newPin)
      setNewPin(''); setConfirmPin('')
      ok('✅ Admin PIN updated and synced to cloud.')
      await loadConfig()
    } catch(e) { fail('Failed to update PIN.') }
    setSaving(false)
  }

  const nonAdmin = config.approvedUsers.filter(u=>u.role!=='admin')

  return (
    <div>
      <SectionHeader icon="🔐" title="Access Control" subtitle="Manage who can access FDS GBP Pro. Changes sync to all devices instantly." />

      {/* SYNC STATUS */}
      <div style={{background:T.blueLight,border:`1px solid #C7D8FF`,borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#1E40AF'}}>
        <strong>☁️ Cloud Sync Active</strong> — User accounts are shared across all browsers and devices. Add a user here and they can log in from their phone, laptop, or any browser immediately.
      </div>

      <div style={{background:T.successLight,border:`1.5px solid #86EFAC`,borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div>
          <p style={{fontWeight:800,fontSize:14,color:T.success,margin:0}}>🔒 Access Control ACTIVE</p>
          <p style={{fontSize:12,color:T.success,margin:'2px 0 0',opacity:0.8}}>All users must enter a PIN. Sessions expire after 8 hours.</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="secondary" size="sm" onClick={loadConfig} disabled={loadingConfig}>{loadingConfig?'Loading...':'🔄 Refresh'}</Btn>
          <Btn variant="danger" size="sm" onClick={()=>{if(confirm('Log out now? You will need your PIN to return.')){clearAuthSession();onLogout()}}}>🚪 Log Out</Btn>
        </div>
      </div>

      {/* SUPER ADMIN NOTE */}
      <Card style={{marginBottom:20,background:'linear-gradient(135deg,#EEF3FF,#F5F3FF)',border:`1px solid #C7D8FF`}}>
        <p style={{fontWeight:800,fontSize:14,color:T.dark,margin:'0 0 6px'}}>👑 Super Admin Bypass</p>
        <p style={{fontSize:13,color:T.textLight,margin:0,lineHeight:1.7}}>
          If locked out from any device, tap the <strong>GBP logo 3 times quickly</strong> on the login screen → enter <strong>{PUBLIC_CONTACT}</strong> → instant entry. Always works.
        </p>
      </Card>

      {/* CHANGE ADMIN PIN */}
      {isAdmin()&&(
        <Card style={{marginBottom:20}}>
          <h3 style={{margin:'0 0 6px',fontSize:15,fontWeight:800,color:T.dark}}>🔑 Change Admin PIN</h3>
          <p style={{fontSize:12,color:T.textLight,marginBottom:16}}>Your master PIN to enter the app. Change syncs to all devices immediately.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <Field label="New 4-Digit PIN">
              <input type="password" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="e.g. 5678" maxLength={4}
                style={{width:'100%',padding:'10px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:20,textAlign:'center',letterSpacing:8,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
            </Field>
            <Field label="Confirm PIN">
              <input type="password" value={confirmPin} onChange={e=>setConfirmPin(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="Repeat" maxLength={4}
                style={{width:'100%',padding:'10px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:20,textAlign:'center',letterSpacing:8,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
            </Field>
          </div>
          {err&&<p style={{color:T.danger,fontSize:12,marginBottom:8}}>❌ {err}</p>}
          {msg&&<p style={{color:T.success,fontSize:12,marginBottom:8}}>{msg}</p>}
          <Btn onClick={handleChangePin} disabled={newPin.length!==4||saving}>{saving?'Saving...':'Update Admin PIN'}</Btn>
        </Card>
      )}

      {/* ADD USER */}
      {isAdmin()&&(
        <Card style={{marginBottom:20}}>
          <h3 style={{margin:'0 0 6px',fontSize:15,fontWeight:800,color:T.dark}}>➕ Add Approved User</h3>
          <p style={{fontSize:12,color:T.textLight,marginBottom:16}}>Add by name, Gmail, and assign a PIN. Share their PIN privately via WhatsApp or phone. They can then log in from any device anywhere.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
            <Field label="Full Name" required><Input value={newUser.name} onChange={v=>setNewUser(p=>({...p,name:v}))} placeholder="e.g. Kunle Francis"/></Field>
            <Field label="Gmail Address" required><Input value={newUser.email} onChange={v=>setNewUser(p=>({...p,email:v}))} placeholder="e.g. kunle@gmail.com" type="email"/></Field>
            <Field label="4-Digit PIN" required hint="You choose — share it with them">
              <input type="text" value={newUser.pin} onChange={e=>setNewUser(p=>({...p,pin:e.target.value.replace(/\D/g,'').slice(0,4)}))} placeholder="e.g. 7291" maxLength={4}
                style={{width:'100%',padding:'10px 13px',border:`1.5px solid ${T.grayBorder}`,borderRadius:8,fontSize:18,textAlign:'center',letterSpacing:6,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
            </Field>
          </div>
          {err&&<p style={{color:T.danger,fontSize:12,marginBottom:8}}>❌ {err}</p>}
          {msg&&<p style={{color:T.success,fontSize:12,marginBottom:8}}>{msg}</p>}
          <Btn onClick={handleAdd} disabled={!newUser.name||!newUser.email||newUser.pin.length!==4||saving}>{saving?'💾 Saving to cloud...':'+ Add User'}</Btn>
        </Card>
      )}

      {/* USER LIST */}
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{margin:0,fontSize:15,fontWeight:800,color:T.dark}}>👥 Approved Users ({nonAdmin.length})</h3>
          {loadingConfig&&<span style={{fontSize:12,color:T.textLight}}>🔄 Loading...</span>}
        </div>
        {nonAdmin.length===0?(
          <p style={{fontSize:13,color:T.textLight}}>No users added yet. Add users above to grant them access.</p>
        ):(
          nonAdmin.map(u=>(
            <div key={u.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:T.grayLight,borderRadius:9,marginBottom:8,gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,color:T.dark}}>{u.name}</div>
                <div style={{fontSize:12,color:T.textLight,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.email}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                {isAdmin()&&<div style={{textAlign:'center'}}><div style={{fontSize:10,color:T.textLight,fontWeight:600}}>PIN</div><div style={{fontSize:16,fontWeight:900,color:T.blue,letterSpacing:4}}>{u.pin}</div></div>}
                {isAdmin()&&<Btn size="sm" variant="danger" onClick={()=>handleRemove(u.id)} disabled={saving}>✕</Btn>}
              </div>
            </div>
          ))
        )}
        {/* ADMIN ROW */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'linear-gradient(135deg,#EEF3FF,#F5F3FF)',borderRadius:9,marginTop:8,border:`1px solid #C7D8FF`}}>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:T.dark}}>Abiodun 👑</div>
            <div style={{fontSize:12,color:T.textLight}}>{PUBLIC_CONTACT}</div>
          </div>
          <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:10,background:T.blue,color:'#fff'}}>SUPER ADMIN</span>
        </div>
      </Card>
    </div>
  )
}
