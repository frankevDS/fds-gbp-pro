import { useState } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, Checkbox, Spinner } from '../components/ui.jsx'
import { ShareBar } from './AITools.jsx'
import { getSettings } from '../utils/storage.js'

// ─── WEIGHTED SCORING SYSTEM ──────────────────────────────────────────────────
const CHECKS = [
  ['Business name correct & matches signage',      'nameCorrect',         1, 'content'],
  ['Address correct and complete',                 'addressCorrect',       1, 'content'],
  ['Phone number listed',                          'phoneLinked',          1, 'content'],
  ['Website linked and working',                   'websiteLinked',        1, 'content'],
  ['Hours set for all 7 days',                     'hoursSet',             1, 'content'],
  ['Business description written (750 chars)',     'descriptionWritten',   1, 'content'],
  ['Photos uploaded (10+ recommended)',            'photosUploaded',       2, 'content'],
  ['Reviews present on profile',                   'reviewsPresent',       2, 'trust'],
  ['Owner actively responding to reviews',         'ownerResponding',      2, 'trust'],
  ['Google Posts / updates active',                'postsActive',          1, 'freshness'],
  ['Business appears in Google Map Pack',          'inMapPack',            3, 'visibility'],
  ['Primary category is specific & correct',       'categoryCorrect',      2, 'visibility'],
  ['Services/products listed with descriptions',   'servicesListed',       1, 'content'],
  ['Q&A section has answered questions',           'qaAnswered',           1, 'freshness'],
  ['NAP matches website exactly',                  'napConsistent',        2, 'visibility'],
  ['No duplicate listings found',                  'noDuplicates',         1, 'visibility'],
  ['Business attributes filled in',                'attributesFilled',     1, 'content'],
  ['Messaging / chat enabled & responsive',        'messagingEnabled',     1, 'freshness'],
  ['Photos uploaded within last 90 days',          'recentPhotos',         1, 'freshness'],
  ['Review rating 4.0 or above',                   'ratingGood',           2, 'trust'],
]

const MAX_RAW = CHECKS.reduce((s, [,,w]) => s + w, 0)

const CATEGORIES = {
  visibility: { label: 'Visibility',  icon: '👁️',  desc: 'How well Google finds and ranks this business' },
  trust:      { label: 'Trust',       icon: '⭐',  desc: 'Reviews, ratings and owner engagement' },
  content:    { label: 'Content',     icon: '📋',  desc: 'Profile completeness and accuracy' },
  freshness:  { label: 'Freshness',   icon: '🔄',  desc: 'Recent activity and updates' },
}

function calcScores(checks) {
  let total = 0
  const cats = { visibility:{got:0,max:0}, trust:{got:0,max:0}, content:{got:0,max:0}, freshness:{got:0,max:0} }
  CHECKS.forEach(([,key,weight,cat]) => {
    cats[cat].max += weight
    if (checks[key] === true) { total += weight; cats[cat].got += weight }
  })
  const pct = Math.round((total / MAX_RAW) * 100)
  return { total, max: MAX_RAW, pct, cats }
}

function getVerdict(pct) {
  if (pct >= 80) return { label: 'Well Optimised',      color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' }
  if (pct >= 60) return { label: 'Needs Improvement',   color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' }
  if (pct >= 40) return { label: 'High Priority',       color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' }
  return             { label: 'Critical',               color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' }
}

function generateActionPlan(checks, stats, comps) {
  const thisWeek = [], thisMonth = [], ongoing = []
  if (checks.inMapPack === false)          thisWeek.push('Get into the Google Map Pack — optimise primary category, add 5+ more reviews, ensure NAP consistency')
  if (checks.reviewsPresent === false)     thisWeek.push('Request reviews from first 5 customers immediately — reviews are the #1 ranking signal')
  if (checks.nameCorrect === false)        thisWeek.push('Fix business name to match signage and website exactly — any mismatch risks suspension')
  if (checks.napConsistent === false)      thisWeek.push('Update NAP (Name, Address, Phone) to be identical on GBP, website, Facebook, and all directories')
  if (checks.websiteLinked === false)      thisWeek.push('Add website URL to GBP profile — profiles with websites get 31% more clicks')
  if (checks.hoursSet === false)           thisWeek.push('Set hours for all 7 days — missing hours causes Google to show "hours not available"')
  if (checks.descriptionWritten === false) thisWeek.push('Write a 750-character business description with 2–3 natural keywords for category and city')
  if (checks.photosUploaded === false)     thisMonth.push('Upload minimum 10 photos: logo, cover, exterior, interior, team, and product/work photos')
  if (checks.ownerResponding === false)    thisMonth.push('Respond to every existing review — both positive and negative — within the next 7 days')
  if (checks.postsActive === false)        thisMonth.push('Publish first Google Post this week — What\'s New, Offer, or Event. Post weekly going forward')
  if (checks.servicesListed === false)     thisMonth.push('Add all services with individual descriptions and prices — appear directly in Google Search')
  if (checks.categoryCorrect === false)    thisMonth.push('Review and update primary Google Business Category to the most specific option available')
  if (checks.qaAnswered === false)         thisMonth.push('Seed 5–10 Q&As — ask and answer common customer questions with keyword-rich answers')
  if (checks.attributesFilled === false)   thisMonth.push('Fill in all relevant business attributes (parking, payment methods, delivery, accessibility, etc.)')
  if (checks.noDuplicates === false)       thisMonth.push('Search for duplicate listings and request removal — duplicates split your ranking power')
  if (checks.recentPhotos === false)       ongoing.push('Upload 2–3 fresh photos every month — photo freshness is a local ranking signal')
  if (checks.messagingEnabled === false)   ongoing.push('Enable Google Messaging and respond within 1 hour — response time now affects local ranking')
  if (checks.ratingGood === false)         ongoing.push('Build reviews to get above 4.0 stars — actively request reviews after every positive interaction')
  ongoing.push('Respond to every new review within 24 hours — owner response rate is a trust and ranking signal')
  ongoing.push('Publish Google Posts weekly — activity signals to Google that the business is active and engaged')
  return { thisWeek: thisWeek.slice(0,4), thisMonth: thisMonth.slice(0,4), ongoing: ongoing.slice(0,3) }
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
    if (!groqKey) { setErr('Add your Groq API key in Settings to use this feature.'); return }
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
          messages: [{
            role: 'system',
            content: 'You are a local business research expert. Output ONLY valid JSON. No explanation. No markdown. No think tags.'
          }, {
            role: 'user',
            content: `List the top 3 most well-known ${businessType} businesses in ${city} that likely have Google Business Profiles.
For each, provide realistic estimated data based on your knowledge of the local market.

Output ONLY this JSON array, nothing else:
[
  {
    "name": "Business Name",
    "category": "Their GBP category",
    "estimatedReviews": "estimated number",
    "estimatedRating": "estimated rating like 4.5",
    "estimatedPhotos": "estimated photo count",
    "likelyInMapPack": true,
    "searchUrl": "https://www.google.com/maps/search/${encodeURIComponent(businessType + ' ' + city)}"
  }
]`
          }]
        })
      })
      const data = await res.json()
      let content = data.choices?.[0]?.message?.content?.trim() || ''
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
      content = content.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(content)
      setSuggestions(parsed)
    } catch(e) {
      setErr('Could not find competitors. Try entering business type and city more specifically.')
    }
    setLoading(false)
  }

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent((businessType||'business') + ' ' + (city||''))}`

  return (
    <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: 14, color: '#0369A1', margin: 0 }}>🔍 Auto-Find Top Competitors</p>
          <p style={{ fontSize: 12, color: '#0284C7', margin: '2px 0 0' }}>AI suggests likely top GBP competitors + opens Google Maps for real-time verification</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn onClick={findCompetitors} disabled={loading} size="sm" variant="primary">
            {loading ? <><Spinner /> Finding...</> : '🤖 AI Suggest Competitors'}
          </Btn>
          <a href={mapsUrl} target="_blank" rel="noreferrer" style={{
            padding: '6px 12px', borderRadius: 8, background: '#16A34A', color: '#fff',
            fontWeight: 700, fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5
          }}>📍 Open Google Maps</a>
        </div>
      </div>

      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>❌ {err}</div>}

      {suggestions.length > 0 && (
        <div className="animate-fadeIn">
          <p style={{ fontSize: 12, fontWeight: 700, color: '#0369A1', marginBottom: 10 }}>
            ⚠️ AI estimates — verify on Google Maps before including in report. Click "Use This" to auto-fill.
          </p>
          {suggestions.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #BAE6FD', borderRadius: 8, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: 13, color: T.dark, margin: '0 0 4px' }}>{s.name}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: T.textLight, flexWrap: 'wrap' }}>
                  <span>📋 {s.category}</span>
                  <span>⭐ ~{s.estimatedRating} stars</span>
                  <span>💬 ~{s.estimatedReviews} reviews</span>
                  <span>📸 ~{s.estimatedPhotos} photos</span>
                  {s.likelyInMapPack && <span style={{ background: '#16A34A', color: '#fff', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>Likely in Map Pack</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6', flexShrink: 0, flexDirection: 'column' }}>
                <Btn size="sm" variant="success" onClick={() => onFound(i, s)}>Use This</Btn>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' ' + city)}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: T.blue, textDecoration: 'none', textAlign: 'center', display: 'block', marginTop: 4 }}>
                  Verify ↗
                </a>
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
  const [checks, setChecks] = useState(Object.fromEntries(CHECKS.map(([,k])=>[k,null])))
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

  const setB = (k,v) => setBiz(p=>({...p,[k]:v}))
  const setC = (k,v) => setChecks(p=>({...p,[k]:v}))
  const setStat = (k,v) => setStats(p=>({...p,[k]:v}))
  const setComp = (i,k,v) => setComps(p=>p.map((c,idx)=>idx===i?{...c,[k]:v}:c))

  // Auto-fill competitor from AI suggestion
  const handleCompFound = (idx, suggestion) => {
    setComp(idx, 'name', suggestion.name)
    setComp(idx, 'reviews', suggestion.estimatedReviews)
    setComp(idx, 'rating', suggestion.estimatedRating)
    setComp(idx, 'photos', suggestion.estimatedPhotos)
    setComp(idx, 'inMapPack', suggestion.likelyInMapPack || false)
    setComp(idx, 'category', suggestion.category)
  }

  const scores = calcScores(checks)
  const verdict = getVerdict(scores.pct)
  const actionPlan = generateActionPlan(checks, stats, comps)
  const settings = getSettings()

  const buildReport = () => {
    const passedChecks = CHECKS.filter(([,k])=>checks[k]===true)
    const failedChecks = CHECKS.filter(([,k])=>checks[k]===false)
    const compLines = comps.filter(c=>c.name).map((c,i)=>
      `  ${i+1}. ${c.name}\n     Reviews: ${c.reviews||'—'} | Rating: ${c.rating||'—'} stars | Photos: ${c.photos||'—'}\n     In Map Pack: ${c.inMapPack?'YES — appearing in top 3':'NO'}`
    ).join('\n')

    const relativeRanking = (() => {
      const filled = comps.filter(c=>c.name&&c.reviews)
      if (!filled.length) return '  Enter competitor data to see ranking'
      const myReviews = parseInt(stats.reviewCount)||0
      const ranks = [...filled.map(c=>parseInt(c.reviews)||0), myReviews].sort((a,b)=>b-a)
      const myRank = ranks.indexOf(myReviews)+1
      const avgRating = (filled.reduce((s,c)=>s+(parseFloat(c.rating)||0),0)/filled.length).toFixed(1)
      return `  ${biz.name||'This business'} ranks #${myRank} of ${ranks.length} competitors by review count\n  Competitor average rating: ${avgRating} stars`
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
Appears in Map Pack  : ${checks.inMapPack===true?'YES — Showing in top 3 local results':checks.inMapPack===false?'NO — Not in top 3, losing customers to competitors':'Not checked'}

${'═'.repeat(60)}
OVERALL SCORE: ${scores.pct}% (${scores.total}/${scores.max} weighted points) — ${verdict.label.toUpperCase()}
${'═'.repeat(60)}

SUB-SCORES BY CATEGORY
${'─'.repeat(60)}
Visibility  : ${scores.cats.visibility.max>0?Math.round((scores.cats.visibility.got/scores.cats.visibility.max)*100):0}% — How well Google ranks this business
Trust       : ${scores.cats.trust.max>0?Math.round((scores.cats.trust.got/scores.cats.trust.max)*100):0}% — Reviews, ratings, owner engagement
Content     : ${scores.cats.content.max>0?Math.round((scores.cats.content.got/scores.cats.content.max)*100):0}% — Profile completeness and accuracy
Freshness   : ${scores.cats.freshness.max>0?Math.round((scores.cats.freshness.got/scores.cats.freshness.max)*100):0}% — Recent activity and updates

${'─'.repeat(60)}
CHECKLIST RESULTS (${passedChecks.length} passed / ${failedChecks.length} failed)
${'─'.repeat(60)}
PASSED:
${passedChecks.map(([label,,w])=>`  [PASS] ${label}${w>1?` (weight ×${w})`:''}`).join('\n')||'  None passed'}

FAILED / NOT MET:
${failedChecks.map(([label,,w])=>`  [FAIL] ${label}${w>1?` (weight ×${w})`:''}`).join('\n')||'  None failed'}

${'═'.repeat(60)}
PHOTO & REVIEW STATISTICS
${'─'.repeat(60)}
Photos Uploaded      : ${stats.photoCount||'—'}
Last Photo Added     : ${stats.lastPhoto||'—'}
Total Reviews        : ${stats.reviewCount||'—'}
Average Rating       : ${stats.reviewRating||'—'} stars
Last Review Date     : ${stats.lastReview||'—'}

SEARCH INSIGHT BREAKDOWN
  Direct searches (people searching business name)  : ${stats.directSearches||'—'}
  Discovery searches (people searching category)    : ${stats.discoverySearches||'—'}
  Branded searches                                  : ${stats.brandedSearches||'—'}

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
THIS WEEK (Immediate — highest impact):
${actionPlan.thisWeek.length?actionPlan.thisWeek.map((a,i)=>`  ${i+1}. ${a}`).join('\n'):'  No critical actions — profile is in good shape'}

THIS MONTH:
${actionPlan.thisMonth.length?actionPlan.thisMonth.map((a,i)=>`  ${i+1}. ${a}`).join('\n'):'  All monthly tasks complete'}

ONGOING MANAGEMENT:
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

      {/* SECTION TABS */}
      <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:20 }}>
        {sections.map((s,i)=>(
          <button key={i} onClick={()=>setActiveSection(i+1)} style={{
            padding:'5px 11px', borderRadius:16, border:'none', cursor:'pointer',
            fontSize:11, fontWeight:700, fontFamily:'inherit',
            background:activeSection===i+1?T.blue:T.grayLight,
            color:activeSection===i+1?'#fff':T.textLight,
          }}>{i+1}. {s}</button>
        ))}
      </div>

      {/* SECTION 1 — BUSINESS DETAILS */}
      {activeSection===1&&(
        <Card style={{marginBottom:16}} className="animate-fadeIn">
          <p style={{fontWeight:700,fontSize:14,color:T.dark,marginBottom:14}}>📍 Business Details</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="Business Name" required><Input value={biz.name} onChange={v=>setB('name',v)} placeholder="e.g. Frankev Online Store" /></Field>
            <Field label="City" required><Input value={biz.city} onChange={v=>setB('city',v)} placeholder="e.g. Accra" /></Field>
            <Field label="Industry / Sector"><Input value={biz.industry} onChange={v=>setB('industry',v)} placeholder="e.g. Ecommerce Store" /></Field>
            <Field label="Primary GBP Category"><Input value={biz.category} onChange={v=>setB('category',v)} placeholder="e.g. Online Store" /></Field>
            <Field label="Phone Number"><Input value={biz.phone} onChange={v=>setB('phone',v)} placeholder="e.g. +233 XX XXX XXXX" /></Field>
            <Field label="Website"><Input value={biz.website} onChange={v=>setB('website',v)} placeholder="e.g. www.frankev.com" /></Field>
          </div>
          <Field label="Full Address"><Input value={biz.address} onChange={v=>setB('address',v)} placeholder="e.g. G71 Tackie Yaoboi Street, Accra, Ghana" /></Field>
          <Field label="Map Pack Search Term" hint="The keyword you will search on Google Maps to find competitors">
            <Input value={biz.mapPackSearch} onChange={v=>setB('mapPackSearch',v)} placeholder="e.g. Ecommerce Store Accra" />
          </Field>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}>
            <Btn onClick={()=>setActiveSection(2)}>Next: Listing Status →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 2 — LISTING STATUS */}
      {activeSection===2&&(
        <Card style={{marginBottom:16}} className="animate-fadeIn">
          <p style={{fontWeight:700,fontSize:14,color:T.dark,marginBottom:14}}>📋 Listing Status</p>
          <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:20}}>
            {[['listingExists','GBP Listing Exists?'],['verified','Profile Verified / Claimed?']].map(([k,label])=>(
              <div key={k}>
                <p style={{fontSize:12,fontWeight:600,color:T.dark,marginBottom:8}}>{label}</p>
                <div style={{display:'flex',gap:8}}>
                  {['Yes','No'].map(opt=>(
                    <button key={opt} onClick={()=>setStatus(p=>({...p,[k]:opt==='Yes'}))} style={{
                      padding:'8px 20px',borderRadius:8,border:`1.5px solid`,
                      borderColor:status[k]===(opt==='Yes')?T.blue:T.grayBorder,
                      background:status[k]===(opt==='Yes')?T.blue:'#fff',
                      color:status[k]===(opt==='Yes')?'#fff':T.text,
                      fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <Btn variant="secondary" onClick={()=>setActiveSection(1)}>← Back</Btn>
            <Btn onClick={()=>setActiveSection(3)}>Next: Profile Score →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 3 — PROFILE SCORE */}
      {activeSection===3&&(
        <Card style={{marginBottom:16}} className="animate-fadeIn">
          <p style={{fontWeight:700,fontSize:14,color:T.dark,marginBottom:6}}>📊 Profile Score — {CHECKS.length} Checks</p>
          <p style={{fontSize:12,color:T.textLight,marginBottom:16}}>Tick ✅ or ❌ for each item. Items marked ×2 or ×3 carry more weight toward the final score.</p>
          <div style={{background:verdict.bg,border:`1.5px solid ${verdict.border}`,borderRadius:12,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:64,height:64,borderRadius:'50%',border:`3px solid ${verdict.color}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontSize:20,fontWeight:900,color:verdict.color}}>{scores.pct}%</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15,color:verdict.color,marginBottom:8}}>{verdict.label}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                {Object.entries(CATEGORIES).map(([key,cat])=>(
                  <SubScoreBar key={key} label={cat.label} icon={cat.icon} got={scores.cats[key].got} max={scores.cats[key].max} />
                ))}
              </div>
            </div>
          </div>
          {Object.entries(CATEGORIES).map(([catKey,cat])=>(
            <div key={catKey} style={{marginBottom:20}}>
              <p style={{fontSize:12,fontWeight:800,color:T.dark,marginBottom:10,textTransform:'uppercase',letterSpacing:0.8}}>
                {cat.icon} {cat.label} — {cat.desc}
              </p>
              {CHECKS.filter(([,,,c])=>c===catKey).map(([label,key,weight])=>(
                <div key={key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',marginBottom:6,borderRadius:8,
                  background:checks[key]===true?'#F0FDF4':checks[key]===false?'#FEF2F2':T.grayLight}}>
                  <div>
                    <span style={{fontSize:13,fontWeight:500,color:T.dark}}>{label}</span>
                    {weight>1&&<span style={{fontSize:10,fontWeight:700,color:T.blue,marginLeft:6,background:T.blueLight,padding:'1px 6px',borderRadius:8}}>×{weight}</span>}
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {[[true,'✅'],[false,'❌']].map(([val,icon])=>(
                      <button key={icon} onClick={()=>setC(key,val)} style={{
                        width:34,height:34,borderRadius:6,border:`1.5px solid`,
                        borderColor:checks[key]===val?T.blue:T.grayBorder,
                        background:checks[key]===val?T.blue:'#fff',
                        cursor:'pointer',fontSize:15,flexShrink:0
                      }}>{icon}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <Btn variant="secondary" onClick={()=>setActiveSection(2)}>← Back</Btn>
            <Btn onClick={()=>setActiveSection(4)}>Next: Photos & Reviews →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 4 — PHOTOS & REVIEWS */}
      {activeSection===4&&(
        <Card style={{marginBottom:16}} className="animate-fadeIn">
          <p style={{fontWeight:700,fontSize:14,color:T.dark,marginBottom:14}}>📸 Photo & Review Statistics</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="Total Photos Uploaded"><Input value={stats.photoCount} onChange={v=>setStat('photoCount',v)} placeholder="e.g. 7" /></Field>
            <Field label="Last Photo Added"><Input value={stats.lastPhoto} onChange={v=>setStat('lastPhoto',v)} placeholder="e.g. 3 months ago" /></Field>
            <Field label="Total Reviews"><Input value={stats.reviewCount} onChange={v=>setStat('reviewCount',v)} placeholder="e.g. 23" /></Field>
            <Field label="Average Rating"><Input value={stats.reviewRating} onChange={v=>setStat('reviewRating',v)} placeholder="e.g. 4.2" /></Field>
            <Field label="Last Review Date"><Input value={stats.lastReview} onChange={v=>setStat('lastReview',v)} placeholder="e.g. 2 weeks ago" /></Field>
          </div>
          <p style={{fontWeight:700,fontSize:13,color:T.dark,margin:'16px 0 10px'}}>🔍 Search Insight Breakdown</p>
          <p style={{fontSize:12,color:T.textLight,marginBottom:12}}>Found in GBP Insights dashboard. Shows how people are finding this business.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            <Field label="Direct Searches" hint="People searching the business name"><Input value={stats.directSearches} onChange={v=>setStat('directSearches',v)} placeholder="e.g. 120" /></Field>
            <Field label="Discovery Searches" hint="People searching a category"><Input value={stats.discoverySearches} onChange={v=>setStat('discoverySearches',v)} placeholder="e.g. 890" /></Field>
            <Field label="Branded Searches"><Input value={stats.brandedSearches} onChange={v=>setStat('brandedSearches',v)} placeholder="e.g. 45" /></Field>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <Btn variant="secondary" onClick={()=>setActiveSection(3)}>← Back</Btn>
            <Btn onClick={()=>setActiveSection(5)}>Next: Competitors →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 5 — COMPETITORS */}
      {activeSection===5&&(
        <Card style={{marginBottom:16}} className="animate-fadeIn">
          <p style={{fontWeight:700,fontSize:14,color:T.dark,marginBottom:6}}>🏆 Competitor Analysis</p>
          <p style={{fontSize:12,color:T.textLight,marginBottom:16}}>
            Use AI to suggest competitors instantly, or open Google Maps to find the real ones. Click "Use This" to auto-fill the form below.
          </p>

          {/* ✅ AI COMPETITOR FINDER */}
          <CompetitorFinder
            businessType={biz.industry||biz.category}
            city={biz.city}
            onFound={handleCompFound}
          />

          {/* MANUAL COMPETITOR ENTRY */}
          <p style={{fontWeight:700,fontSize:13,color:T.dark,marginBottom:10}}>📝 Competitor Details (verify and adjust AI suggestions or enter manually):</p>
          {comps.map((c,i)=>(
            <div key={i} style={{background:T.grayLight,borderRadius:10,padding:14,marginBottom:12}}>
              <p style={{margin:'0 0 10px',fontWeight:700,fontSize:13,color:T.dark}}>
                Competitor {i+1} {c.inMapPack&&<span style={{background:'#16A34A',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,marginLeft:6}}>IN MAP PACK</span>}
              </p>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:10,alignItems:'end'}}>
                <Field label="Business Name"><Input value={c.name} onChange={v=>setComp(i,'name',v)} placeholder="Name" /></Field>
                <Field label="Reviews"><Input value={c.reviews} onChange={v=>setComp(i,'reviews',v)} placeholder="e.g. 87" /></Field>
                <Field label="Rating"><Input value={c.rating} onChange={v=>setComp(i,'rating',v)} placeholder="e.g. 4.8" /></Field>
                <Field label="Photos"><Input value={c.photos} onChange={v=>setComp(i,'photos',v)} placeholder="e.g. 34" /></Field>
              </div>
              <Field label="Their GBP Category"><Input value={c.category} onChange={v=>setComp(i,'category',v)} placeholder="e.g. Online Store" /></Field>
              <Checkbox label="Appears in Google Map Pack (top 3 results)" checked={c.inMapPack} onChange={v=>setComp(i,'inMapPack',v)} />
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <Btn variant="secondary" onClick={()=>setActiveSection(4)}>← Back</Btn>
            <Btn onClick={()=>setActiveSection(6)}>Next: Assessment →</Btn>
          </div>
        </Card>
      )}

      {/* SECTION 6 — ASSESSMENT */}
      {activeSection===6&&(
        <Card style={{marginBottom:16}} className="animate-fadeIn">
          <p style={{fontWeight:700,fontSize:14,color:T.dark,marginBottom:14}}>📝 Final Assessment</p>
          <div style={{background:T.blueLight,border:`1px solid #C7D8FF`,borderRadius:10,padding:14,marginBottom:16}}>
            <p style={{fontWeight:800,fontSize:13,color:T.blue,marginBottom:10}}>🎯 Auto-Generated Action Plan</p>
            {actionPlan.thisWeek.length>0&&(
              <div style={{marginBottom:10}}>
                <p style={{fontSize:11,fontWeight:700,color:T.danger,textTransform:'uppercase',marginBottom:6}}>This Week:</p>
                {actionPlan.thisWeek.map((a,i)=><div key={i} style={{fontSize:12,color:T.dark,padding:'4px 0',borderBottom:`1px solid #E2E8F0`,display:'flex',gap:8}}><span style={{color:T.danger,fontWeight:700,flexShrink:0}}>{i+1}.</span>{a}</div>)}
              </div>
            )}
            {actionPlan.thisMonth.length>0&&(
              <div>
                <p style={{fontSize:11,fontWeight:700,color:T.warning,textTransform:'uppercase',marginBottom:6,marginTop:10}}>This Month:</p>
                {actionPlan.thisMonth.map((a,i)=><div key={i} style={{fontSize:12,color:T.dark,padding:'4px 0',borderBottom:`1px solid #E2E8F0`,display:'flex',gap:8}}><span style={{color:T.warning,fontWeight:700,flexShrink:0}}>{i+1}.</span>{a}</div>)}
              </div>
            )}
          </div>
          <Field label="Opportunity Level">
            <Select value={opportunity} onChange={setOpportunity} options={[
              'Critical — No listing or completely abandoned',
              'High — Listing exists but severely incomplete',
              'Medium — Some setup done but gaps remain',
              'Low — Well managed, pitch ongoing management',
            ]} placeholder="Select opportunity level..." />
          </Field>
          <Field label="Notes for Client (included in report)">
            <Input value={notes} onChange={setNotes} multiline rows={3} placeholder="Key observations and recommendations for the client..." />
          </Field>
          <Field label="Internal Notes (NOT included in report)" hint="Your private notes — owner conversation, agreed price, follow-up date.">
            <Input value={internalNotes} onChange={setInternalNotes} multiline rows={2} placeholder="e.g. Spoke with Kojo — interested in Growth package. Follow up 28 June." />
          </Field>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8,flexWrap:'wrap',gap:10}}>
            <Btn variant="secondary" onClick={()=>setActiveSection(5)}>← Back</Btn>
            <Btn size="lg" onClick={()=>{setGenerated(true);setTimeout(()=>{document.getElementById('audit-report')?.scrollIntoView({behavior:'smooth'})},100)}}>
              📄 Generate Full Report
            </Btn>
          </div>
        </Card>
      )}

      {/* GENERATED REPORT */}
      {generated&&(
        <div id="audit-report" style={{marginTop:20}} className="animate-fadeIn">
          <ShareBar text={buildReport()} title={`GBP Audit Report — ${biz.name||'Business'}`} businessName={biz.name} />
          <Card style={{background:T.dark}}>
            <div style={{marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,color:'#64748B',fontWeight:600}}>AUDIT REPORT — {biz.name||'Business'}</span>
              <span style={{fontSize:11,color:'#64748B'}}>Score: {scores.pct}% — {verdict.label}</span>
            </div>
            <pre style={{color:'#E2E8F0',fontSize:12,lineHeight:1.8,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word',fontFamily:"'Courier New',monospace",maxHeight:500,overflowY:'auto'}}>{buildReport()}</pre>
          </Card>
        </div>
      )}
    </div>
  )
}
