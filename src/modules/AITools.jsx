import { useState } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, Spinner, copyText } from '../components/ui.jsx'
import { generateReviewResponse, generateGooglePost, generateQandAs, generateBusinessDescription, generateMonthlyReport } from '../utils/groq.js'
import { getSettings } from '../utils/storage.js'

function AICard({ icon, title, subtitle, children, result, onCopy, copied }) {
  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.dark }}>{title}</h3>
          <p style={{ margin: 0, fontSize: 12, color: T.textLight }}>{subtitle}</p>
        </div>
      </div>
      {children}
      {result && (
        <div style={{ marginTop: 16 }} className="animate-fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>✅ AI Result</span>
            <Btn size="sm" variant="outline" onClick={onCopy}>{copied ? '✅ Copied!' : '📋 Copy'}</Btn>
          </div>
          <div style={{ background: T.grayLight, borderRadius: 10, padding: 14, fontSize: 13, color: T.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', borderLeft: `4px solid ${T.blue}` }}>
            {result}
          </div>
        </div>
      )}
    </Card>
  )
}

function NoKeyWarning() {
  const { groqKey } = getSettings()
  if (groqKey) return null
  return (
    <div style={{ background: T.warningLight, border: `1.5px solid ${T.warning}`, borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: '#92400E' }}>
      ⚠️ <strong>Groq API key not set.</strong> Go to <strong>Settings</strong> (bottom nav) and enter your Groq API key to use AI features.
    </div>
  )
}

// ─── REVIEW RESPONDER ─────────────────────────────────────────────────────────
function ReviewResponder() {
  const [f, setF] = useState({ reviewText: '', reviewerName: '', rating: '5', businessName: '', businessType: '', city: '' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [copied, setCopied] = useState(false); const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const run = async () => {
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateReviewResponse(f)) }
    catch (e) { setErr(e.message === 'NO_KEY' ? 'Add your Groq API key in Settings first.' : e.message) }
    setLoading(false)
  }

  return (
    <AICard icon="⭐" title="Review Response Generator" subtitle="Paste any customer review — AI writes a professional, keyword-rich owner response." result={result} onCopy={() => copyText(result, setCopied)} copied={copied}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name"><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Gloria's Salon" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Hair Salon" /></Field>
        <Field label="City"><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Manchester" /></Field>
        <Field label="Reviewer Name"><Input value={f.reviewerName} onChange={v => set('reviewerName', v)} placeholder="e.g. Sarah" /></Field>
        <Field label="Star Rating">
          <Select value={f.rating} onChange={v => set('rating', v)} options={['1','2','3','4','5'].map(r => ({ value: r, label: `${r} ★` }))} />
        </Field>
      </div>
      <Field label="Review Text" required>
        <Input value={f.reviewText} onChange={v => set('reviewText', v)} multiline rows={4} placeholder="Paste the customer's review here..." />
      </Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading || !f.reviewText || !f.businessName}>
        {loading ? <><Spinner /> Generating...</> : '✨ Generate Response'}
      </Btn>
    </AICard>
  )
}

// ─── GOOGLE POST GENERATOR ────────────────────────────────────────────────────
function PostGenerator() {
  const [f, setF] = useState({ postType: "Whats New", businessName: '', businessType: '', city: '', topic: '', offer: '', eventDate: '' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [copied, setCopied] = useState(false); const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const run = async () => {
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateGooglePost(f)) }
    catch (e) { setErr(e.message === 'NO_KEY' ? 'Add your Groq API key in Settings first.' : e.message) }
    setLoading(false)
  }

  return (
    <AICard icon="📢" title="Google Post Generator" subtitle="Generate weekly Google Posts — offers, events, updates — ready to publish instantly." result={result} onCopy={() => copyText(result, setCopied)} copied={copied}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name"><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Gloria's Salon" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Hair Salon" /></Field>
        <Field label="City"><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Manchester" /></Field>
        <Field label="Post Type">
          <Select value={f.postType} onChange={v => set('postType', v)} options={["Whats New","Offer","Event","Product"].map(t => ({ value: t, label: t }))} />
        </Field>
        {f.postType === 'Event' && <Field label="Event Date"><Input value={f.eventDate} onChange={v => set('eventDate', v)} placeholder="e.g. 15 July 2026" /></Field>}
        {f.postType === 'Offer' && <Field label="Offer Details"><Input value={f.offer} onChange={v => set('offer', v)} placeholder="e.g. 20% off all cuts in July" /></Field>}
      </div>
      <Field label="Topic / Context" required>
        <Input value={f.topic} onChange={v => set('topic', v)} multiline rows={2} placeholder="What is this post about? e.g. We now offer keratin treatments, summer sale, charity event..." />
      </Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading || !f.topic || !f.businessName}>
        {loading ? <><Spinner /> Generating...</> : '✨ Generate Post'}
      </Btn>
    </AICard>
  )
}

// ─── Q&A GENERATOR ────────────────────────────────────────────────────────────
function QAGenerator() {
  const [f, setF] = useState({ businessName: '', businessType: '', city: '', services: '', targetCustomers: '' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [copied, setCopied] = useState(false); const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const run = async () => {
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateQandAs(f)) }
    catch (e) { setErr(e.message === 'NO_KEY' ? 'Add your Groq API key in Settings first.' : e.message) }
    setLoading(false)
  }

  return (
    <AICard icon="❓" title="Q&A Generator" subtitle="Generate 10 keyword-rich Q&As to seed directly into a client's GBP profile." result={result} onCopy={() => copyText(result, setCopied)} copied={copied}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name"><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Gloria's Salon" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Hair Salon" /></Field>
        <Field label="City"><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Manchester" /></Field>
      </div>
      <Field label="Services Offered"><Input value={f.services} onChange={v => set('services', v)} multiline rows={2} placeholder="e.g. Haircuts, colouring, keratin treatments, bridal hair" /></Field>
      <Field label="Target Customers"><Input value={f.targetCustomers} onChange={v => set('targetCustomers', v)} placeholder="e.g. Women aged 25–55 seeking premium hair care" /></Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading || !f.businessName || !f.city}>
        {loading ? <><Spinner /> Generating...</> : '✨ Generate 10 Q&As'}
      </Btn>
    </AICard>
  )
}

// ─── DESCRIPTION WRITER ───────────────────────────────────────────────────────
function DescriptionWriter() {
  const [f, setF] = useState({ businessName: '', businessType: '', city: '', services: '', uniquePoints: '', targetCustomers: '', founded: '', awards: '', languages: 'English' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [copied, setCopied] = useState(false); const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const run = async () => {
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateBusinessDescription(f)) }
    catch (e) { setErr(e.message === 'NO_KEY' ? 'Add your Groq API key in Settings first.' : e.message) }
    setLoading(false)
  }

  return (
    <AICard icon="✍️" title="Business Description Writer" subtitle="AI writes a Google-compliant, keyword-optimised 750-character description." result={result} onCopy={() => copyText(result, setCopied)} copied={copied}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name" required><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Gloria's Salon" /></Field>
        <Field label="Business Type" required><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Hair Salon" /></Field>
        <Field label="City" required><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Manchester" /></Field>
        <Field label="Founded / Since"><Input value={f.founded} onChange={v => set('founded', v)} placeholder="e.g. 2015" /></Field>
        <Field label="Languages Spoken"><Input value={f.languages} onChange={v => set('languages', v)} placeholder="e.g. English, Yoruba" /></Field>
        <Field label="Awards / Certifications"><Input value={f.awards} onChange={v => set('awards', v)} placeholder="e.g. NICEIC Approved" /></Field>
      </div>
      <Field label="Services / What You Do"><Input value={f.services} onChange={v => set('services', v)} multiline rows={2} placeholder="e.g. Haircuts, colouring, keratin treatments, bridal styling" /></Field>
      <Field label="What Makes You Different"><Input value={f.uniquePoints} onChange={v => set('uniquePoints', v)} multiline rows={2} placeholder="e.g. Only salon in the area using organic products, walk-in friendly" /></Field>
      <Field label="Target Customers"><Input value={f.targetCustomers} onChange={v => set('targetCustomers', v)} placeholder="e.g. Women 25–55 wanting premium hair care" /></Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>❌ {err}</div>}
      {result && <p style={{ fontSize: 11, color: result.length > 700 ? T.danger : T.textLight, marginBottom: 8 }}>{result.length}/750 characters</p>}
      <Btn onClick={run} disabled={loading || !f.businessName || !f.businessType || !f.city}>
        {loading ? <><Spinner /> Writing...</> : '✨ Write Description'}
      </Btn>
    </AICard>
  )
}

// ─── MONTHLY REPORT ───────────────────────────────────────────────────────────
function MonthlyReport() {
  const [f, setF] = useState({ businessName: '', businessType: '', city: '', month: '', views: '', searches: '', calls: '', directions: '', websiteClicks: '', reviews: '', photosViews: '', topPosts: '', notes: '' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [copied, setCopied] = useState(false); const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => ({ value: m, label: m }))

  const run = async () => {
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateMonthlyReport(f)) }
    catch (e) { setErr(e.message === 'NO_KEY' ? 'Add your Groq API key in Settings first.' : e.message) }
    setLoading(false)
  }

  const fullReport = result ? `FRANKEV DIGITAL SERVICES
MONTHLY GBP PERFORMANCE REPORT
${'═'.repeat(52)}
Business : ${f.businessName}
Location : ${f.city}
Month    : ${f.month}
Prepared : ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
${'═'.repeat(52)}

STATS SUMMARY
${'─'.repeat(52)}
Profile Views         : ${f.views || '—'}
Search Appearances    : ${f.searches || '—'}
Phone Calls           : ${f.calls || '—'}
Direction Requests    : ${f.directions || '—'}
Website Clicks        : ${f.websiteClicks || '—'}
New Reviews           : ${f.reviews || '—'}
Photo Views           : ${f.photosViews || '—'}
Top Post              : ${f.topPosts || '—'}

${'─'.repeat(52)}
AI PERFORMANCE ANALYSIS
${'─'.repeat(52)}
${result}
${'═'.repeat(52)}
Prepared by Frankev Digital Services
frankevgloballtd@gmail.com
${'═'.repeat(52)}` : ''

  return (
    <AICard icon="📈" title="Monthly Report Generator" subtitle="Enter the month's GBP stats — AI writes a professional client report." result={fullReport} onCopy={() => copyText(fullReport, setCopied)} copied={copied}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name" required><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Gloria's Salon" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Hair Salon" /></Field>
        <Field label="City"><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Manchester" /></Field>
        <Field label="Report Month" required><Select value={f.month} onChange={v => set('month', v)} options={months} placeholder="Select month..." /></Field>
        <Field label="Profile Views"><Input value={f.views} onChange={v => set('views', v)} placeholder="e.g. 1,240" /></Field>
        <Field label="Search Appearances"><Input value={f.searches} onChange={v => set('searches', v)} placeholder="e.g. 890" /></Field>
        <Field label="Phone Calls"><Input value={f.calls} onChange={v => set('calls', v)} placeholder="e.g. 34" /></Field>
        <Field label="Direction Requests"><Input value={f.directions} onChange={v => set('directions', v)} placeholder="e.g. 18" /></Field>
        <Field label="Website Clicks"><Input value={f.websiteClicks} onChange={v => set('websiteClicks', v)} placeholder="e.g. 72" /></Field>
        <Field label="New Reviews"><Input value={f.reviews} onChange={v => set('reviews', v)} placeholder="e.g. 6" /></Field>
        <Field label="Photo Views"><Input value={f.photosViews} onChange={v => set('photosViews', v)} placeholder="e.g. 340" /></Field>
        <Field label="Top Performing Post"><Input value={f.topPosts} onChange={v => set('topPosts', v)} placeholder="e.g. July sale offer post" /></Field>
      </div>
      <Field label="Additional Notes for AI"><Input value={f.notes} onChange={v => set('notes', v)} multiline rows={2} placeholder="e.g. Views dropped in week 2 due to bank holiday. Client mentioned getting more calls than usual." /></Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading || !f.businessName || !f.month}>
        {loading ? <><Spinner /> Writing Report...</> : '✨ Generate Report'}
      </Btn>
    </AICard>
  )
}

// ─── MAIN AI MODULE ───────────────────────────────────────────────────────────
export default function AITools() {
  const [tab, setTab] = useState('review')
  const tabs = [
    { id: 'review', icon: '⭐', label: 'Review Responder' },
    { id: 'post', icon: '📢', label: 'Post Generator' },
    { id: 'qa', icon: '❓', label: 'Q&A Generator' },
    { id: 'desc', icon: '✍️', label: 'Description Writer' },
    { id: 'report', icon: '📈', label: 'Monthly Report' },
  ]

  return (
    <div>
      <SectionHeader icon="🤖" title="AI Tools" subtitle="Powered by Groq — generate professional content for any client in seconds." />
      <NoKeyWarning />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            background: tab === t.id ? T.blue : T.grayLight,
            color: tab === t.id ? T.white : T.gray,
          }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div className="animate-fadeIn" key={tab}>
        {tab === 'review' && <ReviewResponder />}
        {tab === 'post' && <PostGenerator />}
        {tab === 'qa' && <QAGenerator />}
        {tab === 'desc' && <DescriptionWriter />}
        {tab === 'report' && <MonthlyReport />}
      </div>
    </div>
  )
}
