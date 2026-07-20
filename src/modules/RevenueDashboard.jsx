import { useState, useEffect } from 'react'
import { T, Card, SectionHeader, ProgressBar, Badge } from '../components/ui.jsx'
import { getClients, getSettings } from '../utils/storage.js'

function StatBox({label,value,sub,color=T.blue,bg=T.blueLight,icon}){return <Card style={{background:bg,border:'none',padding:18}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><div style={{fontSize:11,fontWeight:700,color,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{label}</div><div style={{fontSize:26,fontWeight:900,color}}>{value}</div>{sub&&<div style={{fontSize:12,color,opacity:0.75,marginTop:2}}>{sub}</div>}</div><span style={{fontSize:28,opacity:0.6}}>{icon}</span></div></Card>}

function calcHealth(c){
  let s=0,reasons=[],warnings=[]
  if(c.status==='active')s+=30
  if(c.monthlyValue&&parseFloat(c.monthlyValue)>0)s+=20
  if(c.gbpUrl){s+=10;reasons.push('GBP linked')}
  if(c.website){s+=5;reasons.push('Website on file')}
  if(c.email){s+=5;reasons.push('Email available')}
  if(c.phone){s+=5;reasons.push('Phone available')}
  if(c.auditScore&&parseInt(c.auditScore)>=7){s+=10;reasons.push('Good audit score')}
  else if(c.auditScore&&parseInt(c.auditScore)>=4)s+=5
  if(c.followUpDate){
    const d=Math.floor((new Date(c.followUpDate)-new Date())/(1000*60*60*24))
    if(d>=0&&d<=30){s+=10;reasons.push('Follow-up scheduled')}
    if(d<0){s-=15;warnings.push(`Follow-up overdue ${Math.abs(d)} days`)}
  } else warnings.push('No follow-up date')
  if(c.status==='lost'){s-=40;warnings.push('Client lost')}
  if(c.status==='paused'){s-=10;warnings.push('Account paused')}
  if(c.status==='lead'||c.status==='audited')warnings.push('Not yet converted')
  const pct=Math.min(100,Math.max(0,s))
  const h=pct>=75?{label:'Healthy',color:T.success,bg:T.successLight}:pct>=50?{label:'Fair',color:T.warning,bg:T.warningLight}:pct>=25?{label:'At Risk',color:'#EA580C',bg:'#FFF7ED'}:{label:'Critical',color:T.danger,bg:T.dangerLight}
  return {pct,h,reasons,warnings}
}

function HealthCard({client,cur}){
  const [open,setOpen]=useState(false)
  const {pct,h,reasons,warnings}=calcHealth(client)
  return (
    <div style={{background:T.white,border:`1px solid ${T.grayBorder}`,borderLeft:`4px solid ${h.color}`,borderRadius:10,padding:'12px 14px',marginBottom:10}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
            <span style={{fontWeight:800,fontSize:14,color:T.dark}}>{client.businessName}</span>
            <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,background:h.bg,color:h.color}}>{h.label}</span>
            {client.package&&client.package!=='None yet'&&<Badge color={T.gold} bg={T.goldLight}>{client.package}</Badge>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{flex:1,height:6,background:T.grayBorder,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:h.color,borderRadius:3,transition:'width 0.5s'}}/></div>
            <span style={{fontSize:12,fontWeight:800,color:h.color,flexShrink:0}}>{pct}%</span>
          </div>
          {client.monthlyValue&&<div style={{fontSize:12,color:T.success,fontWeight:700,marginTop:4}}>{cur}{client.monthlyValue}/mo</div>}
        </div>
        <button onClick={()=>setOpen(o=>!o)} style={{width:28,height:28,borderRadius:6,border:`1px solid ${T.grayBorder}`,background:T.grayLight,cursor:'pointer',fontSize:12,flexShrink:0}}>{open?'▲':'▼'}</button>
      </div>
      {open&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.grayBorder}`}}>
        {warnings.length>0&&<div style={{marginBottom:8}}><p style={{fontSize:11,fontWeight:700,color:T.danger,marginBottom:4}}>⚠️ WARNINGS</p>{warnings.map((w,i)=><div key={i} style={{fontSize:12,color:T.danger,padding:'3px 0'}}>• {w}</div>)}</div>}
        {reasons.length>0&&<div><p style={{fontSize:11,fontWeight:700,color:T.success,marginBottom:4}}>✅ POSITIVE</p>{reasons.map((r,i)=><div key={i} style={{fontSize:12,color:T.success,padding:'3px 0'}}>• {r}</div>)}</div>}
        {client.followUpDate&&<div style={{marginTop:8,fontSize:12,color:T.textLight}}>📅 Follow up: {new Date(client.followUpDate).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>}
      </div>}
    </div>
  )
}

export default function RevenueDashboard(){
  const [clients,setClients]=useState([])
  const [cur,setCur]=useState('₵')
  const [country,setCountry]=useState('Ghana')
  const [tab,setTab]=useState('overview')

  const load=()=>{setClients(getClients());const s=getSettings();setCur(s.currency||'₵');setCountry(s.country||'Ghana')}
  useEffect(()=>{load();window.addEventListener('fds-settings-updated',load);return()=>window.removeEventListener('fds-settings-updated',load)},[])

  const active=clients.filter(c=>c.status==='active')
  const won=clients.filter(c=>c.status==='won'||c.status==='active')
  const pitched=clients.filter(c=>c.status==='pitched')
  const lost=clients.filter(c=>c.status==='lost')
  const mrr=active.reduce((s,c)=>s+(parseFloat(c.monthlyValue)||0),0)
  const pipeline=pitched.reduce((s,c)=>s+(parseFloat(c.monthlyValue)||0),0)
  const winRate=won.length+lost.length>0?Math.round((won.length/(won.length+lost.length))*100):0
  const byPkg={Starter:0,Growth:0,Premium:0}
  active.forEach(c=>{if(byPkg[c.package]!==undefined)byPkg[c.package]++})
  const due=clients.filter(c=>c.followUpDate&&new Date(c.followUpDate)<=new Date()&&c.status!=='won'&&c.status!=='lost'&&c.status!=='active')
  const scores=clients.map(c=>({client:c,hs:calcHealth(c)}))
  const avgH=scores.length>0?Math.round(scores.reduce((s,h)=>s+h.hs.pct,0)/scores.length):0
  const funnel=[{label:'Leads',count:clients.filter(c=>c.status==='lead').length,color:T.blue},{label:'Audited',count:clients.filter(c=>c.status==='audited').length,color:'#7C3AED'},{label:'Pitched',count:pitched.length,color:T.warning},{label:'Won/Active',count:won.length,color:T.success}]
  const maxF=Math.max(...funnel.map(f=>f.count),1)
  const ts=(id)=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:700,fontSize:13,background:tab===id?T.blue:T.grayLight,color:tab===id?'#fff':T.textLight})

  return (
    <div>
      <SectionHeader icon="💰" title="Revenue Dashboard" subtitle="Complete business performance — revenue, pipeline, and client health."/>
      {country&&<div style={{background:T.blueLight,border:`1px solid #C7D8FF`,borderRadius:10,padding:'10px 16px',marginBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,color:T.blue,fontWeight:600}}>📍 {country} — All values in <strong>{cur}</strong></span><span style={{fontSize:12,color:T.textLight}}>Change in Settings ⚙️</span></div>}
      <div style={{display:'flex',gap:8,marginBottom:20}}><button style={ts('overview')} onClick={()=>setTab('overview')}>📊 Overview</button><button style={ts('health')} onClick={()=>setTab('health')}>❤️ Client Health</button></div>

      {tab==='overview'&&<>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
          <StatBox label="Monthly Revenue" value={`${cur}${mrr.toFixed(0)}`} sub={`${cur}${(mrr*12).toFixed(0)} annually`} color={T.success} bg={T.successLight} icon="💷"/>
          <StatBox label="Pipeline" value={`${cur}${pipeline}/mo`} sub={`${pitched.length} pending`} color={T.warning} bg={T.warningLight} icon="🔮"/>
          <StatBox label="Active Clients" value={active.length} sub="On retainer" color={T.blue} bg={T.blueLight} icon="👥"/>
          <StatBox label="Win Rate" value={`${winRate}%`} sub={`${won.length} won, ${lost.length} lost`} color={T.gold} bg={T.goldLight} icon="🎯"/>
        </div>
        <Card style={{marginBottom:20}}>
          <h3 style={{margin:'0 0 16px',fontSize:15,fontWeight:800,color:T.dark}}>📊 Sales Pipeline</h3>
          {funnel.map(f=><div key={f.label} style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:T.dark}}>{f.label}</span><span style={{fontSize:13,fontWeight:800,color:f.color}}>{f.count}</span></div><ProgressBar value={f.count} max={maxF} color={f.color} height={8}/></div>)}
        </Card>
        <Card style={{marginBottom:20}}>
          <h3 style={{margin:'0 0 16px',fontSize:15,fontWeight:800,color:T.dark}}>📦 Active Packages</h3>
          {['Starter','Growth','Premium'].map(pkg=>{const r=active.filter(c=>c.package===pkg).reduce((s,c)=>s+(parseFloat(c.monthlyValue)||0),0);return <div key={pkg} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:T.grayLight,borderRadius:8,marginBottom:8}}><span style={{fontSize:13,fontWeight:600,color:T.dark}}>{pkg}</span><div style={{display:'flex',alignItems:'center',gap:12}}>{r>0&&<span style={{fontSize:12,color:T.success,fontWeight:700}}>{cur}{r}/mo</span>}<span style={{fontSize:13,fontWeight:800,color:T.blue}}>{byPkg[pkg]||0} clients</span></div></div>})}
          {mrr>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:800,marginTop:10,paddingTop:10,borderTop:`1px solid ${T.grayBorder}`}}><span>Total MRR</span><span style={{color:T.success}}>{cur}{mrr}/mo</span></div>}
        </Card>
        {due.length>0&&<Card style={{background:T.dangerLight,border:`1.5px solid #FCA5A5`,marginBottom:20}}>
          <h3 style={{margin:'0 0 12px',fontSize:15,fontWeight:800,color:T.danger}}>⏰ Follow-ups Due ({due.length})</h3>
          {due.map(c=><div key={c.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 12px',background:T.white,borderRadius:8,marginBottom:8}}><div><div style={{fontSize:13,fontWeight:700,color:T.dark}}>{c.businessName}</div><div style={{fontSize:12,color:T.textLight}}>{c.contactName} · {c.city}</div></div><div style={{textAlign:'right'}}><div style={{fontSize:12,color:T.danger,fontWeight:700}}>{new Date(c.followUpDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>{c.phone&&<a href={`tel:${c.phone}`} style={{fontSize:12,color:T.blue,textDecoration:'none'}}>📞</a>}</div></div>)}
        </Card>}
        {clients.length===0&&<div style={{textAlign:'center',padding:'40px 20px',color:T.textLight}}><div style={{fontSize:48,marginBottom:12}}>📊</div><p style={{fontSize:13}}>Add your first client in Client Tracker.</p></div>}
      </>}

      {tab==='health'&&<>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:20}}>
          <Card style={{background:T.successLight,border:'none',padding:14,textAlign:'center'}}><div style={{fontSize:24,fontWeight:900,color:T.success}}>{avgH}%</div><div style={{fontSize:11,color:T.success,fontWeight:600,marginTop:2}}>Avg Health</div></Card>
          <Card style={{background:T.blueLight,border:'none',padding:14,textAlign:'center'}}><div style={{fontSize:24,fontWeight:900,color:T.blue}}>{scores.filter(h=>h.hs.pct>=75).length}</div><div style={{fontSize:11,color:T.blue,fontWeight:600,marginTop:2}}>Healthy</div></Card>
          <Card style={{background:T.dangerLight,border:'none',padding:14,textAlign:'center'}}><div style={{fontSize:24,fontWeight:900,color:T.danger}}>{scores.filter(h=>h.hs.pct<50).length}</div><div style={{fontSize:11,color:T.danger,fontWeight:600,marginTop:2}}>Need Attention</div></Card>
        </div>
        {clients.length===0?<div style={{textAlign:'center',padding:'40px 20px',color:T.textLight}}><div style={{fontSize:48,marginBottom:12}}>❤️</div><p style={{fontSize:13}}>Add clients in Client Tracker to see health scores.</p></div>:[...scores].sort((a,b)=>a.hs.pct-b.hs.pct).map(({client})=><HealthCard key={client.id} client={client} cur={cur}/>)}
      </>}
    </div>
  )
}
