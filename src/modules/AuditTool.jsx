import { useState } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, ScoreBadge, ProgressBar, Checkbox } from '../components/ui.jsx'
import { ShareBar } from './AITools.jsx'

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
  const [biz, setBiz] = useState({ name: '', city: '', industry: '', phone: '', website: '', address: '' })
  const [status, setStatus] = useState({ listingExists: null, verified: null })
  const [checks, setChecks] = useState(Object.fromEntries(CHECKS.map(([, k]) => [k, null])))
  const [stats, setStats] = useState({ photoCount: '', reviewCount: '', reviewRating: '', lastReview: '' })
  const [comps, setComps] = useState([
    { name: '', reviews: '', rating: '', photos: '', inMapPack: false },
    { name: '', reviews: '', rating: '', photos: '', inMapPack: false },
    { name: '', reviews: '', rating: '', photos: '', inMapPack: false },
  ])
  const [notes, setNotes] = useState('')
  const [opportunity, setOpportunity] = useState('')
  const [generated, setGenerated] = useState(false)

  const setB = (k, v) => setBiz(p => ({ ...p, [k]: v }))
  const setC = (k, v) => setChecks(p => ({ ...p, [k]: v }))
  const setStat = (k, v) => setStats(p => ({ ...p, [k]: v }))
  const setComp = (i, k, v) => setComps(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c))

  const score = CHECKS.filter(([, k]) => checks[k] === true).length

  const auditText = `FRANKEV DIGITAL SERVICES
GOOGLE BUSINESS PROFILE AUDIT REPORT
${'═'.repeat(52)}
Business   : ${biz.name || 'N/A'}
City       : ${biz.city || 'N/A'}
Industry   : ${biz.industry || 'N/A'}
Phone      : ${biz.phone || 'N/A'}
Website    : ${biz.website || 'N/A'}
Address    : ${biz.address || 'N/A'}
Date       : ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
${'─'.repeat(52)}
GBP Listing Exists : ${status.listingExists === true ? 'YES' : status.listingExists === false ? 'NO' : '—'}
Profile Verified   : ${status.verified === true ? 'YES' : status.verified === false ? 'NO / UNCLAIMED' : '—'}
${'─'.repeat(52)}
PROFILE SCORE: ${score} / 10
${'─'.repeat(52)}
${CHECKS.map(([label, key]) => `${checks[key] === true ? '[PASS]' : checks[key] === false ? '[FAIL]' : '[    ]'} ${label}`).join('\n')}
${'─'.repeat(52)}
PHOTO & REVIEW STATS
${'─'.repeat(52)}
Photos Uploaded  : ${stats.photoCount || '—'}
Total Reviews    : ${stats.reviewCount || '—'}
Average Rating   : ${stats.reviewRating || '—'} stars
Last Review      : ${stats.lastReview || '—'}
${'─'.repeat(52)}
COMPETITOR ANALYSIS
${'─'.repeat(52)}
${comps.filter(c => c.name).map((c, i) =>
`Competitor ${i + 1}: ${c.name}
  Reviews: ${c.reviews || '—'} | Rating: ${c.rating || '—'} stars | Photos: ${c.photos || '—'}
  In Map Pack: ${c.inMapPack ? 'YES' : 'NO'}`
).join('\n') || 'No competitors entered'}
${'─'.repeat(52)}
OPPORTUNITY LEVEL : ${opportunity || 'Not assessed'}
NOTES:
${notes || 'None'}
${'─'.repeat(52)}
RECOMMENDED ACTION:
${score <= 4
  ? 'CRITICAL — Immediate full GBP setup required. Revenue being lost every day.'
  : score <= 7
    ? 'HIGH PRIORITY — Profile is incomplete. Optimisation needed to compete in local search.'
    : 'MAINTENANCE — Profile is in good shape. Ongoing management recommended.'}
${'─'.repeat(52)}
Prepared by: Frankev Digital Services
Email: frankevgloballtd@gmail.com
gbp.frankevdigitalservices.com
${'═'.repeat(52)}`

  return (
    <div>
      <SectionHeader icon="🔍" title="Business Audit Tool" subtitle="Research any local business in 5 minutes. Generate a report to use in your pitch." />

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 14 }}>Business Details</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['Business Name', 'name', "e.g. Gloria's Hair Salon"], ['City', 'city', 'e.g. Accra'], ['Industry', 'industry', 'e.g. Hair Salon'], ['Phone', 'phone', 'e.g. 0508429877'], ['Website', 'website', 'e.g. www.example.com'], ['Address', 'address', 'e.g. 14 High Street']].map(([label, key, ph]) => (
            <Field key={key} label={label}><Input value={biz[key]} onChange={v => setB(key, v)} placeholder={ph} /></Field>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 16, background: T.blueLight, border: `1px solid #C7D8FF` }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 14 }}>Step 1 — Listing Status</p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[['listingExists', 'GBP Listing Exists?'], ['verified', 'Profile Verified?']].map(([k, label]) => (
            <div key={k}>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.dark, marginBottom: 8 }}>{label}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Yes', 'No'].map(opt => (
                  <button key={opt} onClick={() => setStatus(p => ({ ...p, [k]: opt === 'Yes' }))} style={{
                    padding: '7px 18px', borderRadius: 7, border: `1.5px solid`,
                    borderColor: status[k] === (opt === 'Yes') ? T.blue : T.grayBorder,
                    background: status[k] === (opt === 'Yes') ? T.blue : T.white,
                    color: status[k] === (opt === 'Yes') ? T.white : T.text,
                    fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
                  }}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 14 }}>Step 2 — Score the Profile (10 Checks)</p>
        {CHECKS.map(([label, key]) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 12px',
            background: checks[key] === true ? T.successLight : checks[key] === false ? T.dangerLight : T.grayLight,
            borderRadius: 8, marginBottom: 8
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.dark }}>{label}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[[true, '✅'], [false, '❌']].map(([val, icon]) => (
                <button key={icon} onClick={() => setC(key, val)} style={{
                  width: 34, height: 34, borderRadius: 6, border: `1.5px solid`,
                  borderColor: checks[key] === val ? T.blue : T.grayBorder,
                  background: checks[key] === val ? T.blue : T.white,
                  cursor: 'pointer', fontSize: 16
                }}>{icon}</button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 14, padding: '12px 16px', background: T.grayLight, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <ScoreBadge score={score} />
          <div style={{ flex: 1 }}>
            <ProgressBar value={score} max={10} color={score >= 8 ? T.success : score >= 5 ? T.warning : T.danger} height={8} />
            <p style={{ fontSize: 12, color: T.textLight, margin: '6px 0 0' }}>{score} of 10 checks passed</p>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 14 }}>Step 3 — Photo & Review Stats</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Photos Uploaded"><Input value={stats.photoCount} onChange={v => setStat('photoCount', v)} placeholder="e.g. 7" /></Field>
          <Field label="Total Reviews"><Input value={stats.reviewCount} onChange={v => setStat('reviewCount', v)} placeholder="e.g. 23" /></Field>
          <Field label="Average Rating"><Input value={stats.reviewRating} onChange={v => setStat('reviewRating', v)} placeholder="e.g. 4.2" /></Field>
          <Field label="Last Review Date"><Input value={stats.lastReview} onChange={v => setStat('lastReview', v)} placeholder="e.g. 3 months ago" /></Field>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 12 }}>Step 4 — Competitor Analysis</p>
        <p style={{ fontSize: 12, color: T.textLight, marginBottom: 14 }}>Search their main keyword on Google Maps and fill in the top 3 results.</p>
        {comps.map((c, i) => (
          <div key={i} style={{ background: T.grayLight, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13, color: T.dark }}>Competitor {i + 1}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, alignItems: 'end' }}>
              <Field label="Name"><Input value={c.name} onChange={v => setComp(i, 'name', v)} placeholder="Business name" /></Field>
              <Field label="Reviews"><Input value={c.reviews} onChange={v => setComp(i, 'reviews', v)} placeholder="e.g. 87" /></Field>
              <Field label="Rating"><Input value={c.rating} onChange={v => setComp(i, 'rating', v)} placeholder="e.g. 4.8" /></Field>
              <Field label="Photos"><Input value={c.photos} onChange={v => setComp(i, 'photos', v)} placeholder="e.g. 34" /></Field>
            </div>
            <Checkbox label="Appears in Google Map Pack (top 3 results)" checked={c.inMapPack} onChange={v => setComp(i, 'inMapPack', v)} />
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 14 }}>Step 5 — Final Assessment</p>
        <Field label="Opportunity Level">
          <Select value={opportunity} onChange={setOpportunity} options={[
            'Critical — No listing or completely abandoned',
            'High — Listing exists but severely incomplete',
            'Medium — Some setup done but gaps remain',
            'Low — Well managed, pitch ongoing management'
          ]} placeholder="Select opportunity level..." />
        </Field>
        <Field label="Notes & Observations">
          <Input value={notes} onChange={setNotes} multiline rows={4} placeholder="Key observations, owner comments, competitor notes..." />
        </Field>
      </Card>

      {/* GENERATE BUTTON */}
      <Btn onClick={() => setGenerated(true)} size="lg">📄 Generate Report</Btn>

      {/* SHARE BAR + PREVIEW */}
      {generated && (
        <div style={{ marginTop: 20 }} className="animate-fadeIn">
          <ShareBar text={auditText} title={`GBP Audit Report — ${biz.name || 'Business'}`} />
          <Card style={{ background: T.dark }}>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>AUDIT REPORT PREVIEW</span>
            </div>
            <pre style={{
              color: '#E2E8F0', fontSize: 12, lineHeight: 1.8, margin: 0,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              fontFamily: "'Courier New', monospace"
            }}>{auditText}</pre>
          </Card>
        </div>
      )}
    </div>
  )
}
