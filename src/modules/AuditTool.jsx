import { useState } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, ScoreBadge, ProgressBar, Checkbox, copyText } from '../components/ui.jsx'

const CHECKS = [
  ['Business name correct & matches signage', 'nameCorrect'],
  ['Address correct and complete', 'addressCorrect'],
  ['Phone number listed', 'phoneLinked'],
  ['Website linked and working', 'websiteLinked'],
  ['Hours set for all 7 days', 'hoursSet'],
  ['Business description written', 'descriptionWritten'],
  ['Photos uploaded (10+ recommended)', 'photosUploaded'],
  ['Reviews present on profile', 'reviewsPresent'],
  ['Owner actively responding to reviews', 'ownerResponding'],
  ['Google Posts / updates active', 'postsActive'],
]

export default function AuditTool() {
  const [biz, setBiz] = useState({ name:'', city:'', industry:'', phone:'', website:'', address:'' })
  const [status, setStatus] = useState({ listingExists: null, verified: null })
  const [checks, setChecks] = useState(Object.fromEntries(CHECKS.map(([,k]) => [k, null])))
  const [stats, setStats] = useState({ photoCount:'', reviewCount:'', reviewRating:'', lastReview:'' })
  const [comps, setComps] = useState([{name:'',reviews:'',rating:'',photos:'',inMapPack:false},{name:'',reviews:'',rating:'',photos:'',inMapPack:false},{name:'',reviews:'',rating:'',photos:'',inMapPack:false}])
  const [notes, setNotes] = useState(''); const [opportunity, setOpportunity] = useState('')
  const [generated, setGenerated] = useState(false); const [copied, setCopied] = useState(false)

  const setB = (k,v) => setBiz(p=>({...p,[k]:v}))
  const setC = (k,v) => setChecks(p=>({...p,[k]:v}))
  const setStat = (k,v) => setStats(p=>({...p,[k]:v}))
  const setComp = (i,k,v) => setComps(p=>p.map((c,idx)=>idx===i?{...c,[k]:v}:c))

  const score = CHECKS.filter(([,k])=>checks[k]===true).length

  const auditText = `FRANKEV DIGITAL SERVICES\nGOOGLE BUSINESS PROFILE AUDIT REPORT\n${'═'.repeat(52)}\nBusiness   : ${biz.name||'N/A'}\nCity       : ${biz.city||'N/A'}\nIndustry   : ${biz.industry||'N/A'}\nPhone      : ${biz.phone||'N/A'}\nWebsite    : ${biz.website||'N/A'}\nAddress    : ${biz.address||'N/A'}\nDate       : ${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}\n${'─'.repeat(52)}\nGBP Listing Exists : ${status.listingExists===true?'✅ YES':status.listingExists===false?'❌ NO':'—'}\nProfile Verified   : ${status.verified===true?'✅ YES':status.verified===false?'❌ NO / UNCLAIMED':'—'}\n${'─'.repeat(52)}\nPROFILE SCORE: ${score} / 10\n${'─'.repeat(52)}\n${CHECKS.map(([label,key])=>`${checks[key]===true?'✅':checks[key]===false?'❌':'⬜'} ${label}`).join('\n')}\n${'─'.repeat(52)}\nPHOTO & REVIEW STATS\n${'─'.repeat(52)}\nPhotos Uploaded  : ${stats.photoCount||'—'}\nTotal Reviews    : ${stats.reviewCount||'—'}\nAverage Rating   : ${stats.reviewRating||'—'} ★\nLast Review      : ${stats.lastReview||'—'}\n${'─'.repeat(52)}\nCOMPETITOR ANALYSIS\n${'─'.repeat(52)}\n${comps.filter(c=>c.name).map((c,i)=>`Competitor ${i+1}: ${c.name}\n  Reviews: ${c.reviews||'—'} | Rating: ${c.rating||'—'}★ | Photos: ${c.photos||'—'}\n  In Map Pack: ${c.inMapPack?'✅ YES':'❌ NO'}`).join('\n')}\n${'─'.repeat(52)}\nOPPORTUNITY LEVEL : ${opportunity||'Not assessed'}\nNOTES:\n${notes||'None'}\n${'─'.repeat(52)}\nRECOMMENDED ACTION:\n${score<=4?'CRITICAL — Immediate full GBP setup required. Revenue being lost daily.':score<=7?'HIGH PRIORITY — Incomplete profile. Optimisation needed to compete.':'MAINTENANCE — Good shape. Ongoing management recommended.'}\n${'─'.repeat(52)}\nPrepared by: Frankev Digital Services\nEmail: frankevgloballtd@gmail.com\n${'═'.repeat(52)}`

  return (
    <div>
      <SectionHeader icon="🔍" title="Business Audit Tool" subtitle="Research any local business in 5 minutes. Generate a professional report for your pitch." />

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>Business Details</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['Business Name','name','e.g. Gloria\'s Hair Salon'],['City','city','e.g. Manchester'],['Industry','industry','e.g. Hair Salon'],['Phone','phone','0161 234 5678'],['Website','website','www.example.co.uk'],['Address','address','14 High Street']].map(([label,key,ph])=>(
            <Field key={key} label={label}><Input value={biz[key]} onChange={v=>setB(key,v)} placeholder={ph} /></Field>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom:16, background:T.blueLight, border:`1px solid #C7D8FF` }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>📋 Step 1 — Listing Status</p>
        <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
          {[['listingExists','GBP Listing Exists?'],['verified','Profile Verified?']].map(([k,label])=>(
            <div key={k}>
              <p style={{ fontSize:12, fontWeight:600, color:T.dark, marginBottom:8 }}>{label}</p>
              <div style={{ display:'flex', gap:8 }}>
                {['Yes','No'].map(opt=>(
                  <button key={opt} onClick={()=>setStatus(p=>({...p,[k]:opt==='Yes'}))} style={{
                    padding:'7px 18px', borderRadius:7, border:`1.5px solid`,
                    borderColor: status[k]===(opt==='Yes')?T.blue:T.grayBorder,
                    background: status[k]===(opt==='Yes')?T.blue:T.white,
                    color: status[k]===(opt==='Yes')?T.white:T.text,
                    fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit'
                  }}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>📋 Step 2 — Score the Profile</p>
        {CHECKS.map(([label,key])=>(
          <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', background: checks[key]===true?T.successLight:checks[key]===false?T.dangerLight:T.grayLight, borderRadius:8, marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:500, color:T.dark }}>{label}</span>
            <div style={{ display:'flex', gap:6 }}>
              {[[true,'✅'],[false,'❌']].map(([val,icon])=>(
                <button key={icon} onClick={()=>setC(key,val)} style={{ width:32, height:32, borderRadius:6, border:`1.5px solid`, borderColor:checks[key]===val?T.blue:T.grayBorder, background:checks[key]===val?T.blue:T.white, cursor:'pointer', fontSize:16 }}>{icon}</button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop:14, padding:'12px 16px', background:T.grayLight, borderRadius:10, display:'flex', alignItems:'center', gap:16 }}>
          <ScoreBadge score={score} />
          <div style={{ flex:1 }}>
            <ProgressBar value={score} max={10} color={score>=8?T.success:score>=5?T.warning:T.danger} height={8} />
            <p style={{ fontSize:12, color:T.textLight, margin:'6px 0 0' }}>{score} of 10 checks passed</p>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>📸 Step 3 — Photo & Review Stats</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Photos Uploaded"><Input value={stats.photoCount} onChange={v=>setStat('photoCount',v)} placeholder="e.g. 7" /></Field>
          <Field label="Total Reviews"><Input value={stats.reviewCount} onChange={v=>setStat('reviewCount',v)} placeholder="e.g. 23" /></Field>
          <Field label="Average Rating"><Input value={stats.reviewRating} onChange={v=>setStat('reviewRating',v)} placeholder="e.g. 4.2" /></Field>
          <Field label="Last Review Date"><Input value={stats.lastReview} onChange={v=>setStat('lastReview',v)} placeholder="e.g. 3 months ago" /></Field>
        </div>
      </Card>

      <Card style={{ marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:12 }}>🏆 Step 4 — Competitor Analysis</p>
        <p style={{ fontSize:12, color:T.textLight, marginBottom:14 }}>Search their main keyword on Google and fill in the top 3 Map Pack results.</p>
        {comps.map((c,i)=>(
          <div key={i} style={{ background:T.grayLight, borderRadius:10, padding:14, marginBottom:10 }}>
            <p style={{ margin:'0 0 10px', fontWeight:700, fontSize:13, color:T.dark }}>Competitor {i+1}</p>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:10, alignItems:'end' }}>
              <Field label="Name"><Input value={c.name} onChange={v=>setComp(i,'name',v)} placeholder="Business name" /></Field>
              <Field label="Reviews"><Input value={c.reviews} onChange={v=>setComp(i,'reviews',v)} placeholder="e.g. 87" /></Field>
              <Field label="Rating"><Input value={c.rating} onChange={v=>setComp(i,'rating',v)} placeholder="e.g. 4.8" /></Field>
              <Field label="Photos"><Input value={c.photos} onChange={v=>setComp(i,'photos',v)} placeholder="e.g. 34" /></Field>
            </div>
            <Checkbox label="Appears in Google Map Pack (top 3)" checked={c.inMapPack} onChange={v=>setComp(i,'inMapPack',v)} />
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>📝 Step 5 — Final Assessment</p>
        <Field label="Opportunity Level">
          <Select value={opportunity} onChange={setOpportunity} options={['🔴 Critical — No listing or completely abandoned','🟠 High — Listing exists but severely incomplete','🟡 Medium — Some setup done but gaps remain','🟢 Low — Well managed, pitch ongoing management']} placeholder="Select..." />
        </Field>
        <Field label="Notes & Observations"><Input value={notes} onChange={setNotes} multiline rows={4} placeholder="Key observations, owner comments, competitor notes..." /></Field>
      </Card>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn onClick={()=>setGenerated(true)}>📄 Generate Report</Btn>
        {generated && <Btn variant="outline" onClick={()=>copyText(auditText,setCopied)}>{copied?'✅ Copied!':'📋 Copy Report'}</Btn>}
      </div>

      {generated && (
        <Card style={{ marginTop:20, background:T.dark }} className="animate-fadeIn">
          <pre style={{ color:'#E2E8F0', fontSize:11.5, lineHeight:1.8, margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:"'Courier New', monospace" }}>{auditText}</pre>
        </Card>
      )}
    </div>
  )
}
