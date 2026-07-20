import { useState, useEffect } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, Checkbox, Spinner } from '../components/ui.jsx'
import { ShareBar } from './AITools.jsx'
import { getSettings, getAuditHistory, saveAuditToHistory, deleteAuditHistory } from '../utils/storage.js'

// ─── WEIGHTED SCORING SYSTEM ──────────────────────────────────────────────────
const CHECKS = [
  ['Business name correct & matches signage',      'nameCorrect',        1, 'content'],
  ['Address correct and complete',                 'addressCorrect',      1, 'content'],
  ['Phone number listed',                          'phoneLinked',         1, 'content'],
  ['Website linked and working',                   'websiteLinked',       1, 'content'],
  ['Hours set for all 7 days',                     'hoursSet',            1, 'content'],
  ['Business description written (750 chars)',     'descriptionWritten',  1, 'content'],
  ['Photos uploaded (10+ recommended)',            'photosUploaded',      2, 'content'],
  ['Reviews present on profile',                   'reviewsPresent',      2, 'trust'],
  ['Owner actively responding to reviews',         'ownerResponding',     2, 'trust'],
  ['Google Posts / updates active',                'postsActive',         1, 'freshness'],
  ['Business appears in Google Map Pack',          'inMapPack',           3, 'visibility'],
  ['Primary category is specific & correct',       'categoryCorrect',     2, 'visibility'],
  ['Services/products listed with descriptions',   'servicesListed',      1, 'content'],
  ['Q&A section has answered questions',           'qaAnswered',          1, 'freshness'],
  ['NAP matches website exactly',                  'napConsistent',       2, 'visibility'],
  ['No duplicate listings found',                  'noDuplicates',        1, 'visibility'],
  ['Business attributes filled in',               'attributesFilled',    1, 'content'],
  ['Messaging / chat enabled & responsive',       'messagingEnabled',    1, 'freshness'],
  ['Photos uploaded within last 90 days',         'recentPhotos',        1, 'freshness'],
  ['Review rating 4.0 or above',                  'ratingGood',          2, 'trust'],
]

const MAX_RAW = CHECKS.reduce((s, [,,w]) => s + w, 0)

const CATEGORIES = {
  visibility: { label: 'Visibility', icon: '👁️', desc: 'How well Google finds and ranks this business' },
  trust:      { label: 'Trust',      icon: '⭐', desc: 'Reviews, ratings and owner engagement' },
  content:    { label: 'Content',    icon: '📋', desc: 'Profile completeness and accuracy' },
  freshness:  { label: 'Freshness',  icon: '🔄', desc: 'Recent activity and updates' },
}

function calcScores(checks) {
  let total = 0
  const cats = { visibility:{got:0,max:0}, trust:{got:0,max:0}, content:{got:0,max:0}, freshness:{got:0,max:0} }
  CHECKS.forEach(([,key,weight,cat]) => {
    cats[cat].max += weight
    if (checks[key] === true) { total += weight; cats[cat].got += weight }
  })
  return { total, max: MAX_RAW, pct: Math.round((total / MAX_RAW) * 100), cats }
}

function getVerdict(pct) {
  if (pct >= 80) return { label: 'Well Optimised',    color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' }
  if (pct >= 60) return { label: 'Needs Improvement', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' }
  if (pct >= 40) return { label: 'High Priority',     color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' }
  return             { label: 'Critical',             color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' }
}

function generateActionPlan(checks) {
  const w = [], m = [], o = []
  if (checks.inMapPack === false)          w.push('Get into Google Map Pack — optimise primary category, add 5+ reviews, fix NAP consistency')
  if (checks.reviewsPresent === false)     w.push('Request reviews from first 5 customers immediately — reviews are the #1 ranking signal')
  if (checks.nameCorrect === false)        w.push('Fix business name to match signage & website exactly — mismatch risks suspension')
  if (checks.napConsistent === false)      w.push('Update NAP to be identical on GBP, website, Facebook, and all directories')
  if (checks.websiteLinked === false)      w.push('Add website URL — profiles with websites get 31% more clicks')
  if (checks.hoursSet === false)           w.push('Set hours for all 7 days — missing hours shows "hours not available" to customers')
  if (checks.descriptionWritten === false) w.push('Write 750-character business description with 2-3 natural local keywords')
  if (checks.photosUploaded === false)     m.push('Upload minimum 10 photos: logo, cover, exterior, interior, team, product/work photos')
  if (checks.ownerResponding === false)    m.push('Respond to every existing review — positive and negative — within 7 days')
  if (checks.postsActive === false)        m.push('Publish first Google Post this week — What\'s New, Offer, or Event. Post weekly ongoing')
  if (checks.servicesListed === false)     m.push('Add all services with individual descriptions and prices')
  if (checks.categoryCorrect === false)    m.push('Update primary GBP category to the most specific option available')
  if (checks.qaAnswered === false)         m.push('Seed 5-10 Q&As with keyword-rich answers')
  if (checks.attributesFilled === false)   m.push('Fill in all business attributes (parking, payment methods, delivery, accessibility)')
  if (checks.noDuplicates === false)       m.push('Search for duplicate listings and request removal')
  if (checks.recentPhotos === false)       o.push('Upload 2-3 fresh photos every month — photo freshness is a ranking signal')
  if (checks.messagingEnabled === false)   o.push('Enable Google Messaging — respond within 1 hour, affects local ranking')
  if (checks.ratingGood === false)         o.push('Build reviews toward 4.0+ stars — request reviews after every positive interaction')
  o.push('Respond to every new review within 24 hours')
  o.push('Publish Google Posts weekly — signals active business to Google')
  return { thisWeek: w.slice(0,4), thisMonth: m.slice(0,4), ongoing: o.slice(0,3) }
}

function SubScoreBar({ label, icon, got, max }) {
  const pct = max > 0 ? Math.round((got/max)*100) : 0
  const color = pct>=75?'#16A34A':pct>=50?'#D97706':'#DC2626'
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ fontSize:12, fontWeight:700, color:T.dark }}>{icon} {label}</span>
        <span style={{ fontSize:12, fontWeight:800, color }}>{pct}%</span>
      </div>
      <div style={{ height:7, background:T.grayBorder, borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:4, transition:'width 0.5s' }} />
      </div>
    </div>
  )
}

// ─── COMPETITOR FINDER ────────────────────────────────────────────────────────
function CompetitorFinder({ businessType, city, onFound }) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [err, setErr] = useState('')

  const findCompetitors = async () => {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY || getSettings().groqKey
    if (!groqKey) { setErr('Add Groq API key in Settings to use this feature.'); return }
    if (!businessType || !city) { setErr('Enter Business Type and City in Section 1 first.'); return }
    setLoading(true); setErr(''); setSuggestions([])
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen/qwen3.6-27b',
          max_tokens: 600,
          temperature: 0.3,
          reasoning_effort: 'none',
          messages: [
            { role: 'system', content: 'You are a local business research expert. Output ONLY valid JSON array. No explanation. No markdown. No think tags.' },
            { role: 'user', content: `List top 3 most well-known ${businessType} businesses in ${city} likely to have Google Business Profiles. Output ONLY this JSON: [{"name":"Business Name","category":"GBP category","estimatedReviews":"number","estimatedRating":"4.5","estimatedPhotos":"number","likelyInMapPack":true}]` }
          ]
        })
      })
      const data = await res.json()
      let content = data.choices?.[0]?.message?.content?.trim() || '[]'
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```json|```/g, '').trim()
      setSuggestions(JSON.parse(content))
    } catch(e) {
      setErr('Could not find competitors. Try a more specific business type and city.')
    }
    setLoading(false)
  }

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent((businessType||'business') + ' ' + (city||''))}`

  return (
    <div style={{ background:'#F0F9FF', border:'1.5px solid #BAE6FD', borderRadius:12, padding:16, marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:12 }}>
        <div>
          <p style={{ fontWeight:800, fontSize:14, color:'#0369A1', margin:'0 0 2px' }}>🔍 Auto-Find Top Competitors</p>
          <p style={{ fontSize:12, color:'#0284C7', margin:0 }}>AI suggests likely top competitors + opens Google Maps to verify</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Btn onClick={findCompetitors} disabled={loading} size="sm">
            {loading ? <><Spinner /> Finding...</> : '🤖 AI Suggest'}
          </Btn>
          <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ padding:'6px 12px', borderRadius:8, background:'#16A34A', color:'#fff', fontWeight:700, fontSize:12, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5 }}>📍 Google Maps</a>
        </div>
      </div>
      {err && <div style={{ color:T.danger, fontSize:13, marginBottom:10 }}>❌ {err}</div>}
      {suggestions.length > 0 && (
        <div className="animate-fadeIn">
          <p style={{ fontSize:12, fontWeight:700, color:'#0369A1', marginBottom:10 }}>⚠️ AI estimates — verify on Google Maps. Click "Use" to auto-fill.</p>
          {suggestions.map((s, i) => (
            <div key={i} style={{ background:'#fff', border:'1px solid #BAE6FD', borderRadius:8, padding:12, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:800, fontSize:13, color:T.dark, margin:'0 0 4px' }}>{s.name}</p>
                <div style={{ display:'flex', gap:10, fontSize:12, color:T.textLight, flexWrap:'wrap' }}>
                  <span>⭐ ~{s.estimatedRating}</span>
                  <span>💬 ~{s.estimatedReviews} reviews</span>
                  <span>📸 ~{s.estimatedPhotos} photos</span>
                  {s.likelyInMapPack && <span style={{ background:'#16A34A', color:'#fff', padding:'1px 7px', borderRadius:10, fontWeight:700 }}>Map Pack</span>}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                <Btn size="sm" variant="success" onClick={() => onFound(i, s)}>Use</Btn>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' ' + city)}`} target="_blank" rel="noreferrer" style={{ fontSize:11, color:T.blue, textDecoration:'none', textAlign:'center' }}>Verify ↗</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MAIN AUDIT TOOL ─────────────────────────────────────────────────────────
export default function AuditTool() {
  const [biz, setBiz] = useState({ name:'', city:'', industry:'', phone:'', website:'', address:'', category:'', mapPackSearch:'' })
  const [status, setStatus] = useState({ listingExists:null, verified:null })
  const [checks, setChecks] = useState(Object.fromEntries(CHECKS.map(([,k]) => [k, null])))
  const [stats, setStats] = useState({ photoCount:'', reviewCount:'', reviewRating:'', lastReview:'', lastPhoto:'', directSearches:'', discoverySearches:'', brandedSearches:'' })
  const [comps, setComps] = useState([
    {name:'',reviews:'',rating:'',photos:'',inMapPack:false,category:''},
    {name:'',reviews:'',rating:'',photos:'',inMapPack:false,category:''},
    {name:'',reviews:'',rating:'',photos:'',inMapPack:false,category:''},
  ])
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [opportunity, setOpportunity] = useState('')
  const [generated, setGenerated] = useState(false)
  const [activeSection, setActiveSection] = useState(1)
  const [auditHistory, setAuditHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => { setAuditHistory(getAuditHistory()) }, [])

  const setB = (k,v) => setBiz(p=>({...p,[k]:v}))
  const setC = (k,v) => setChecks(p=>({...p,[k]:v}))
  const setStat = (k,v) => setStats(p=>({...p,[k]:v}))
  const setComp = (i,k,v) => setComps(p=>p.map((c,idx)=>idx===i?{...c,[k]:v}:c))

  const handleCompFound = (idx, s) => {
    setComp(idx,'name',s.name)
    setComp(idx,'reviews',s.estimatedReviews)
    setComp(idx,'rating',s.estimatedRating)
    setComp(idx,'photos',s.estimatedPhotos)
    setComp(idx,'inMapPack',s.likelyInMapPack||false)
    setComp(idx,'category',s.category||'')
  }

  const reloadHistory = (h) => {
    setBiz({...h.biz})
    setShowHistory(false)
    setActiveSection(1)
    setGenerated(false)
  }

  const scores = calcScores(checks)
  const verdict = getVerdict(scores.pct)
  const actionPlan = generateActionPlan(checks)
  const settings = getSettings()

  const handleGenerate = () => {
    setGenerated(true)
    saveAuditToHistory({
      bizName: biz.name, city: biz.city, industry: biz.industry,
      score: scores.pct, verdict: verdict.label, opportunity,
      biz: {...biz}
    })
    setAuditHistory(getAuditHistory())
    setTimeout(() => { document.getElementById('audit-report')?.scrollIntoView({ behavior:'smooth' }) }, 100)
  }

  const buildReport = () => {
    const passed = CHECKS.filter(([,k]) => checks[k] === true)
    const failed = CHECKS.filter(([,k]) => checks[k] === false)
    const compLines = comps.filter(c=>c.name).map((c,i) =>
      `  ${i+1}. ${c.name}\n     Reviews: ${c.reviews||'—'} | Rating: ${c.rating||'—'} stars | Photos: ${c.photos||'—'}\n     In Map Pack: ${c.inMapPack?'YES':'NO'}`
    ).join('\n')
    const relativeRanking = (() => {
      const filled = comps.filter(c=>c.name&&c.reviews)
      if (!filled.length) return '  Enter competitor data to see ranking'
      const myReviews = parseInt(stats.reviewCount)||0
      const all = [...filled.map(c=>parseInt(c.reviews)||0), myReviews].sort((a,b)=>b-a)
      const myRank = all.indexOf(myReviews)+1
      const avgRating = (filled.reduce((s,c)=>s+(parseFloat(c.rating)||0),0)/filled.length).toFixed(1)
      return `  ${biz.name||'This business'} ranks #${myRank} of ${all.length} by review count\n  Competitor average rating: ${avgRating} stars`
    })()

    return `FRANKEV DIGITAL SERVICES
GOOGLE BUSINESS PROFILE AUDIT REPORT
${'═'.repeat(60)}
Business    : ${biz.name||'N/A'}
City        : ${biz.city||'N/A'}
Industry    : ${biz.industry||'N/A'}
Category    : ${biz.category||'N/A'}
Phone       : ${biz.phone||'N/A'}
Website     : ${biz.website||'N/A'}
Address     : ${biz.address||'N/A'}
Date        : ${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}
${'═'.repeat(60)}

PROFILE STATUS
${'─'.repeat(60)}
GBP Listing Exists   : ${status.listingExists===true?'YES':status.listingExists===false?'NO — Must be created immediately':'Not checked'}
Profile Verified     : ${status.verified===true?'YES — Verified':status.verified===false?'NO / UNCLAIMED — Must be claimed':'Not checked'}
Appears in Map Pack  : ${checks.inMapPack===true?'YES — Showing in top 3 local results':checks.inMapPack===false?'NO — Not in top 3, losing customers':'Not checked'}

${'═'.repeat(60)}
OVERALL SCORE: ${scores.pct}% (${scores.total}/${scores.max} weighted points) — ${verdict.label.toUpperCase()}
${'═'.repeat(60)}

SUB-SCORES BY CATEGORY
${'─'.repeat(60)}
Visibility  : ${scores.cats.visibility.max>0?Math.round((scores.cats.visibility.got/scores.cats.visibility.max)*100):0}%
Trust       : ${scores.cats.trust.max>0?Math.round((scores.cats.trust.got/scores.cats.trust.max)*100):0}%
Content     : ${scores.cats.content.max>0?Math.round((scores.cats.content.got/scores.cats.content.max)*100):0}%
Freshness   : ${scores.cats.freshness.max>0?Math.round((scores.cats.freshness.got/scores.cats.freshness.max)*100):0}%

${'─'.repeat(60)}
CHECKLIST (${passed.length} passed / ${failed.length} failed)
${'─'.repeat(60)}
PASSED:
${passed.map(([label,,w])=>`  [PASS] ${label}${w>1?` (x${w})`:''}`).join('\n')||'  None passed'}

FAILED:
${failed.map(([label,,w])=>`  [FAIL] ${label}${w>1?` (x${w})`:''}`).join('\n')||'  None failed — excellent!'}

${'═'.repeat(60)}
PHOTO & REVIEW STATISTICS
${'─'.repeat(60)}
Photos Uploaded   : ${stats.photoCount||'—'}
Last Photo Added  : ${stats.lastPhoto||'—'}
Total Reviews     : ${stats.reviewCount||'—'}
Average Rating    : ${stats.reviewRating||'—'} stars
Last Review Date  : ${stats.lastReview||'—'}
Direct Searches   : ${stats.directSearches||'—'}
Discovery Searches: ${stats.discoverySearches||'—'}
Branded Searches  : ${stats.brandedSearches||'—'}

${'═'.repeat(60)}
COMPETITOR ANALYSIS
${'─'.repeat(60)}
Search term: "${biz.mapPackSearch||(biz.industry+' in '+biz.city)}"
${compLines||'  No competitors entered'}

RELATIVE STANDING:
${relativeRanking}

${'═'.repeat(60)}
OPPORTUNITY LEVEL: ${opportunity||'Not assessed'}
${'═'.repeat(60)}

PRIORITISED ACTION PLAN
${'─'.repeat(60)}
THIS WEEK:
${actionPlan.thisWeek.length?actionPlan.thisWeek.map((a,i)=>`  ${i+1}. ${a}`).join('\n'):'  No critical actions'}

THIS MONTH:
${actionPlan.thisMonth.length?actionPlan.thisMonth.map((a,i)=>`  ${i+1}. ${a}`).join('\n'):'  All monthly tasks complete'}

ONGOING:
${actionPlan.ongoing.map((a,i)=>`  ${i+1}. ${a}`).join('\n')}

${'─'.repeat(60)}
NOTES FOR CLIENT:
${notes||'None'}
${'═'.repeat(60)}
Prepared by: ${settings.yourName||'Abiodun'}
Frankev Digital Services
${settings.yourEmail||'frankevgloballtd@gmail.com'}
gbp.frankevdigitalservices.com
${'═'.repeat(60)}`
  }

  const sections = ['Business Details','Listing Status','Profile Score','Photos & Reviews','Competitors','Assessment']

  return (
    <div>
      <SectionHeader icon="🔍" title="Business Audit Tool" subtitle="Professional GBP audit with weighted scoring, AI competitor finder, and auto-generated action plan." />

      {/* AUDIT HISTORY */}
      {auditHistory.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <button onClick={() => setShowHistory(h=>!h)} style={{ background:T.blueLight, border:`1px solid #C7D8FF`, borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:700, color:T.blue, cursor:'pointer', fontFamily:'inherit' }}>
            🕐 Recent Audits ({Math.min(auditHistory.length, 3)}) {showHistory ? '▲' : '▼'}
          </button>
          {showHistory && (
            <div style={{ marginTop:10 }} className="animate-fadeIn">
              {auditHistory.slice(0,3).map(h => (
                <div key={h.id} style={{ background:T.white, border:`1px solid ${T.grayBorder}`, borderRadius:9, padding:'12px 14px', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:T.dark }}>{h.bizName||'Unnamed'} <span style={{ fontSize:11, color:T.textLight }}>· {h.city}</span></div>
                    <div style={{ fontSize:12, color:T.textLight }}>{new Date(h.savedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} · Score: {h.score}% · {h.verdict}</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => reloadHistory(h)} style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${T.blue}`, background:T.blueLight, color:T.blue, fontWeight:700, fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Reload</button>
                    <button onClick={() => { deleteAuditHistory(h.id); setAuditHistory(getAuditHistory()) }} style={{ padding:'5px 10px', borderRadius:7, border:`1px solid ${T.grayBorder}`, background:T.grayLight, color:T.danger, fontWeight:700, fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION TABS */}
      <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:20 }}>
        {sections.map((s,i) => (
          <button key={i} onClick={() => setActiveSection(i+1)} style={{ padding:'5px 11px', borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'inherit', background:activeSection===i+1?T.blue:T.grayLight, color:activeSection===i+1?'#fff':T.textLight }}>
            {i+1}. {s}
          </button>
        ))}
      </div>

      {/* SECTION 1 — BUSINESS DETAILS */}
      {activeSection===1 && (
        <Card style={{ marginBottom:16 }} className="animate-fadeIn">
          <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>📍 Business Details</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Business Name" required><Input value={biz.name} onChange={v=>setB('name',v)} placeholder="e.g. Frankev Online Store" /></Field>
            <Field label="City" required><Input value={biz.city} onChange={v=>setB('city',v)} placeholder="e.g. Accra" /></Field>
            <Field label="Industry / Sector"><Input value={biz.industry} onChange={v=>setB('industry',v)} placeholder="e.g. Ecommerce Store" /></Field>
            <Field label="Primary GBP Category"><Input value={biz.category} onChange={v=>setB('category',v)} placeholder="e.g. Online Store" /></Field>
            <Field label="Phone Number"><Input value={biz.phone} onChange={v=>setB('phone',v)} placeholder="e.g. +233 XX XXX XXXX" /></Field>
            <Field label="Website"><Input value={biz.website} onChange={v=>setB('website',v)} placeholder="e.g. www.frankev.com" /></Field>
          </div>
          <Field label="Full Address"><Input value={biz.address} onChange={v=>setB('address',v)} placeholder="e.g. G71 Tackie Yaoboi Street, Accra, Ghana" /></Field>
          <Field label="Map Pack Search Term" hint="Keyword you will search on Google Maps to find competitors">
            <Input value={biz.mapPackSearch} onChange={v=>setB('mapPackSearch',v)} placeholder="e.g. Ecommerce Store Accra" />
          </Field>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
            <Btn onClick={() => setActiveSection(2)}>Next: Listing Status →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 2 — LISTING STATUS */}
      {activeSection===2 && (
        <Card style={{ marginBottom:16 }} className="animate-fadeIn">
          <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>📋 Listing Status</p>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap', marginBottom:20 }}>
            {[['listingExists','GBP Listing Exists?'],['verified','Profile Verified / Claimed?']].map(([k,label]) => (
              <div key={k}>
                <p style={{ fontSize:12, fontWeight:600, color:T.dark, marginBottom:8 }}>{label}</p>
                <div style={{ display:'flex', gap:8 }}>
                  {['Yes','No'].map(opt => (
                    <button key={opt} onClick={() => setStatus(p=>({...p,[k]:opt==='Yes'}))} style={{ padding:'8px 20px', borderRadius:8, border:`1.5px solid`, borderColor:status[k]===(opt==='Yes')?T.blue:T.grayBorder, background:status[k]===(opt==='Yes')?T.blue:'#fff', color:status[k]===(opt==='Yes')?'#fff':T.text, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Btn variant="secondary" onClick={() => setActiveSection(1)}>← Back</Btn>
            <Btn onClick={() => setActiveSection(3)}>Next: Profile Score →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 3 — PROFILE SCORE */}
      {activeSection===3 && (
        <Card style={{ marginBottom:16 }} className="animate-fadeIn">
          <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:6 }}>📊 Profile Score — {CHECKS.length} Checks</p>
          <p style={{ fontSize:12, color:T.textLight, marginBottom:16 }}>Tick ✅ or ❌. Items marked ×2 or ×3 carry more weight.</p>
          <div style={{ background:verdict.bg, border:`1.5px solid ${verdict.border}`, borderRadius:12, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', border:`3px solid ${verdict.color}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:20, fontWeight:900, color:verdict.color }}>{scores.pct}%</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:15, color:verdict.color, marginBottom:8 }}>{verdict.label}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {Object.entries(CATEGORIES).map(([key,cat]) => (
                  <SubScoreBar key={key} label={cat.label} icon={cat.icon} got={scores.cats[key].got} max={scores.cats[key].max} />
                ))}
              </div>
            </div>
          </div>
          {Object.entries(CATEGORIES).map(([catKey,cat]) => (
            <div key={catKey} style={{ marginBottom:20 }}>
              <p style={{ fontSize:12, fontWeight:800, color:T.dark, marginBottom:10, textTransform:'uppercase', letterSpacing:0.8 }}>{cat.icon} {cat.label} — {cat.desc}</p>
              {CHECKS.filter(([,,,c]) => c===catKey).map(([label,key,weight]) => (
                <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', marginBottom:6, borderRadius:8, background:checks[key]===true?'#F0FDF4':checks[key]===false?'#FEF2F2':T.grayLight }}>
                  <div>
                    <span style={{ fontSize:13, fontWeight:500, color:T.dark }}>{label}</span>
                    {weight>1 && <span style={{ fontSize:10, fontWeight:700, color:T.blue, marginLeft:6, background:T.blueLight, padding:'1px 6px', borderRadius:8 }}>×{weight}</span>}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[[true,'✅'],[false,'❌']].map(([val,icon]) => (
                      <button key={icon} onClick={() => setC(key,val)} style={{ width:34, height:34, borderRadius:6, border:`1.5px solid`, borderColor:checks[key]===val?T.blue:T.grayBorder, background:checks[key]===val?T.blue:'#fff', cursor:'pointer', fontSize:15 }}>{icon}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Btn variant="secondary" onClick={() => setActiveSection(2)}>← Back</Btn>
            <Btn onClick={() => setActiveSection(4)}>Next: Photos & Reviews →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 4 — PHOTOS & REVIEWS */}
      {activeSection===4 && (
        <Card style={{ marginBottom:16 }} className="animate-fadeIn">
          <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>📸 Photo & Review Statistics</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Total Photos Uploaded"><Input value={stats.photoCount} onChange={v=>setStat('photoCount',v)} placeholder="e.g. 7" /></Field>
            <Field label="Last Photo Added"><Input value={stats.lastPhoto} onChange={v=>setStat('lastPhoto',v)} placeholder="e.g. 3 months ago" /></Field>
            <Field label="Total Reviews"><Input value={stats.reviewCount} onChange={v=>setStat('reviewCount',v)} placeholder="e.g. 23" /></Field>
            <Field label="Average Rating"><Input value={stats.reviewRating} onChange={v=>setStat('reviewRating',v)} placeholder="e.g. 4.2" /></Field>
            <Field label="Last Review Date"><Input value={stats.lastReview} onChange={v=>setStat('lastReview',v)} placeholder="e.g. 2 weeks ago" /></Field>
          </div>
          <p style={{ fontWeight:700, fontSize:13, color:T.dark, margin:'16px 0 10px' }}>🔍 Search Insight Breakdown</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <Field label="Direct Searches" hint="People searching business name"><Input value={stats.directSearches} onChange={v=>setStat('directSearches',v)} placeholder="e.g. 120" /></Field>
            <Field label="Discovery Searches" hint="People searching category"><Input value={stats.discoverySearches} onChange={v=>setStat('discoverySearches',v)} placeholder="e.g. 890" /></Field>
            <Field label="Branded Searches"><Input value={stats.brandedSearches} onChange={v=>setStat('brandedSearches',v)} placeholder="e.g. 45" /></Field>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <Btn variant="secondary" onClick={() => setActiveSection(3)}>← Back</Btn>
            <Btn onClick={() => setActiveSection(5)}>Next: Competitors →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 5 — COMPETITORS */}
      {activeSection===5 && (
        <Card style={{ marginBottom:16 }} className="animate-fadeIn">
          <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:6 }}>🏆 Competitor Analysis</p>
          <p style={{ fontSize:12, color:T.textLight, marginBottom:16 }}>Use AI to suggest competitors or open Google Maps to find real ones. Click "Use" to auto-fill.</p>
          <CompetitorFinder businessType={biz.industry||biz.category} city={biz.city} onFound={handleCompFound} />
          <p style={{ fontWeight:700, fontSize:13, color:T.dark, marginBottom:10 }}>📝 Competitor Details:</p>
          {comps.map((c,i) => (
            <div key={i} style={{ background:T.grayLight, borderRadius:10, padding:14, marginBottom:12 }}>
              <p style={{ margin:'0 0 10px', fontWeight:700, fontSize:13, color:T.dark }}>
                Competitor {i+1} {c.inMapPack && <span style={{ background:'#16A34A', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, marginLeft:6 }}>IN MAP PACK</span>}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:10, alignItems:'end' }}>
                <Field label="Name"><Input value={c.name} onChange={v=>setComp(i,'name',v)} placeholder="Business name" /></Field>
                <Field label="Reviews"><Input value={c.reviews} onChange={v=>setComp(i,'reviews',v)} placeholder="e.g. 87" /></Field>
                <Field label="Rating"><Input value={c.rating} onChange={v=>setComp(i,'rating',v)} placeholder="e.g. 4.8" /></Field>
                <Field label="Photos"><Input value={c.photos} onChange={v=>setComp(i,'photos',v)} placeholder="e.g. 34" /></Field>
              </div>
              <Field label="Their GBP Category"><Input value={c.category} onChange={v=>setComp(i,'category',v)} placeholder="e.g. Online Store" /></Field>
              <Checkbox label="Appears in Google Map Pack (top 3 results)" checked={c.inMapPack} onChange={v=>setComp(i,'inMapPack',v)} />
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Btn variant="secondary" onClick={() => setActiveSection(4)}>← Back</Btn>
            <Btn onClick={() => setActiveSection(6)}>Next: Assessment →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 6 — ASSESSMENT */}
      {activeSection===6 && (
        <Card style={{ marginBottom:16 }} className="animate-fadeIn">
          <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>📝 Final Assessment</p>
          <div style={{ background:T.blueLight, border:`1px solid #C7D8FF`, borderRadius:10, padding:14, marginBottom:16 }}>
            <p style={{ fontWeight:800, fontSize:13, color:T.blue, marginBottom:10 }}>🎯 Auto-Generated Action Plan</p>
            {actionPlan.thisWeek.length > 0 && (
              <div style={{ marginBottom:10 }}>
                <p style={{ fontSize:11, fontWeight:700, color:T.danger, textTransform:'uppercase', marginBottom:6 }}>This Week:</p>
                {actionPlan.thisWeek.map((a,i) => <div key={i} style={{ fontSize:12, color:T.dark, padding:'4px 0', borderBottom:`1px solid #E2E8F0`, display:'flex', gap:8 }}><span style={{ color:T.danger, fontWeight:700, flexShrink:0 }}>{i+1}.</span>{a}</div>)}
              </div>
            )}
            {actionPlan.thisMonth.length > 0 && (
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:T.warning, textTransform:'uppercase', marginBottom:6, marginTop:10 }}>This Month:</p>
                {actionPlan.thisMonth.map((a,i) => <div key={i} style={{ fontSize:12, color:T.dark, padding:'4px 0', borderBottom:`1px solid #E2E8F0`, display:'flex', gap:8 }}><span style={{ color:T.warning, fontWeight:700, flexShrink:0 }}>{i+1}.</span>{a}</div>)}
              </div>
            )}
          </div>
          <Field label="Opportunity Level">
            <Select value={opportunity} onChange={setOpportunity} options={['Critical — No listing or completely abandoned','High — Listing exists but severely incomplete','Medium — Some setup done but gaps remain','Low — Well managed, pitch ongoing management']} placeholder="Select opportunity level..." />
          </Field>
          <Field label="Notes for Client (included in report)">
            <Input value={notes} onChange={setNotes} multiline rows={3} placeholder="Key observations and recommendations..." />
          </Field>
          <Field label="Internal Notes (NOT in report)" hint="Your private notes — price agreed, follow-up date, owner conversation.">
            <Input value={internalNotes} onChange={setInternalNotes} multiline rows={2} placeholder="e.g. Spoke with Kojo — interested in Growth package. Follow up 28 June." />
          </Field>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <Btn variant="secondary" onClick={() => setActiveSection(5)}>← Back</Btn>
            <Btn size="lg" onClick={handleGenerate}>📄 Generate Full Report</Btn>
          </div>
        </Card>
      )}

      {/* GENERATED REPORT */}
      {generated && (
        <div id="audit-report" style={{ marginTop:20 }} className="animate-fadeIn">
          <ShareBar text={buildReport()} title={`GBP Audit Report — ${biz.name||'Business'}`} businessName={biz.name} />

          {/* AUDIT TO PROPOSAL PIPELINE */}
          <div style={{ background:'linear-gradient(135deg,#1B4FD8,#7C3AED)', borderRadius:12, padding:18, marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div>
              <p style={{ fontWeight:800, fontSize:15, color:'#fff', margin:'0 0 4px' }}>🚀 Turn This Audit Into a Proposal</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.8)', margin:0 }}>Client name, score, failed checks, and top competitor pre-filled automatically.</p>
            </div>
            <button onClick={() => {
              const data = {
                clientBusiness: biz.name, clientAddress: biz.address,
                clientIndustry: biz.industry, clientCity: biz.city,
                auditScore: String(scores.pct),
                painPoints: CHECKS.filter(([,k]) => checks[k]===false).slice(0,5).map(([label]) => label).join('\n'),
                competitorName: comps.find(c=>c.name)?.name||'',
                competitorReviews: comps.find(c=>c.name)?.reviews||'',
                competitorRating: comps.find(c=>c.name)?.rating||'',
                fromAudit: true, timestamp: Date.now()
              }
              localStorage.setItem('fds_gbp_audit_prefill', JSON.stringify(data))
              window.dispatchEvent(new CustomEvent('fds-navigate', { detail:'proposal' }))
            }} style={{ padding:'12px 24px', background:'#fff', color:'#1B4FD8', border:'none', borderRadius:9, fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>
              📝 Create Proposal →
            </button>
          </div>

          <Card style={{ background:T.dark }}>
            <div style={{ marginBottom:10, display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, color:'#64748B', fontWeight:600 }}>AUDIT REPORT — {biz.name||'Business'}</span>
              <span style={{ fontSize:11, color:'#64748B' }}>Score: {scores.pct}% — {verdict.label}</span>
            </div>
            <pre style={{ color:'#E2E8F0', fontSize:12, lineHeight:1.8, margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:"'Courier New',monospace", maxHeight:500, overflowY:'auto' }}>{buildReport()}</pre>
          </Card>
        </div>
      )}
    </div>
  )
}
