import { useState } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, Spinner, copyText } from '../components/ui.jsx'
import { generateReviewResponse, generateGooglePost, generateQandAs, generateBusinessDescription, generateMonthlyReport, generateKeywords } from '../utils/groq.js'
import { getSettings } from '../utils/storage.js'

// ─── KEY CHECK ────────────────────────────────────────────────────────────────
function hasKey() {
  return !!(import.meta.env.VITE_GROQ_API_KEY || getSettings().groqKey)
}

function NoKeyWarning() {
  if (hasKey()) return null
  return (
    <div style={{ background: T.warningLight, border: `1.5px solid ${T.warning}`, borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: '#92400E' }}>
      <strong>⚠️ Groq API key not found.</strong><br /><br />
      Go to <strong>Vercel → Settings → Environment Variables</strong> → confirm <strong>VITE_GROQ_API_KEY</strong> is saved → <strong>Redeploy</strong>.<br />
      Or go to <strong>Settings</strong> in this app → paste your key → Save.
    </div>
  )
}

// ─── SHARE UTILITIES ─────────────────────────────────────────────────────────
function downloadPDF(text, filename) {
  const win = window.open('', '_blank')
  if (!win) { alert('Please allow popups for this site to download PDF.'); return }
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${filename}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 13px; line-height: 1.8; color: #000; padding: 40px; max-width: 800px; margin: 0 auto; }
      pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; }
      h2 { color: #1B4FD8; border-bottom: 2px solid #1B4FD8; padding-bottom: 8px; }
      @media print { body { padding: 20px; } @page { margin: 1.5cm; size: A4; } }
    </style></head><body>
    <h2>Frankev Digital Services</h2>
    <pre>${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    <script>window.onload=function(){ setTimeout(function(){ window.print(); }, 400); }</script>
    </body></html>`)
  win.document.close()
}

// ✅ FIXED: Use Gmail compose URL instead of mailto — works without an email client installed
function sendViaGmail(text, title) {
  const subject = encodeURIComponent(title)
  // Gmail has a body limit — send first 1800 chars with note to see full content
  const bodyPreview = text.length > 1800
    ? text.substring(0, 1800) + '\n\n[Content truncated — see full document attached or in the app]'
    : text
  const body = encodeURIComponent(bodyPreview)
  window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank')
}

function sendViaWhatsApp(text, title) {
  const message = `*${title}*\n\n${text.substring(0, 3000)}`
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
}

// ─── SHARE BAR ────────────────────────────────────────────────────────────────
export function ShareBar({ text, title }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null
  return (
    <div style={{
      display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
      padding: '12px 14px', background: T.successLight,
      border: `1.5px solid #86EFAC`, borderRadius: 10, marginBottom: 14
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: T.success, marginRight: 4 }}>✅ Ready to share:</span>
      <button onClick={() => downloadPDF(text, title)} style={btnStyle('#DC2626')}>📄 Download PDF</button>
      <button onClick={() => sendViaWhatsApp(text, title)} style={btnStyle('#16A34A')}>💬 WhatsApp</button>
      <button onClick={() => sendViaGmail(text, title)} style={btnStyle(T.blue)}>📧 Gmail</button>
      <button onClick={() => copyText(text, setCopied)} style={btnStyle(copied ? T.success : '#475569')}>
        {copied ? '✅ Copied!' : '📋 Copy Text'}
      </button>
    </div>
  )
}

function btnStyle(bg) {
  return {
    padding: '8px 14px', borderRadius: 8, border: 'none',
    background: bg, color: '#fff', fontWeight: 700,
    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: 5
  }
}

// ─── RESULT BOX ───────────────────────────────────────────────────────────────
function ResultBox({ result, title }) {
  if (!result) return null
  return (
    <div className="animate-fadeIn" style={{ marginTop: 16 }}>
      <ShareBar text={result} title={title} />
      <div style={{
        background: '#F8FAFF', border: `1.5px solid ${T.grayBorder}`,
        borderLeft: `4px solid ${T.blue}`, borderRadius: 10,
        padding: 16, fontSize: 14, color: T.text,
        lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        fontFamily: 'inherit'
      }}>
        {result}
      </div>
    </div>
  )
}

// ─── AI CARD ─────────────────────────────────────────────────────────────────
function AICard({ icon, title, subtitle, children, result, resultTitle }) {
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
      <ResultBox result={result} title={resultTitle || title} />
    </Card>
  )
}

// ─── REVIEW RESPONDER ─────────────────────────────────────────────────────────
function ReviewResponder() {
  const [f, setF] = useState({ reviewText: '', reviewerName: '', rating: '5', businessName: '', businessType: '', city: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const run = async () => {
    if (!hasKey()) { setErr('Add your Groq API key in Settings or Vercel environment variables.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateReviewResponse(f)) }
    catch (e) { setErr(e.message) }
    setLoading(false)
  }

  return (
    <AICard icon="⭐" title="Review Response Generator"
      subtitle="Paste a customer review — AI writes a clean, copy-paste-ready owner response."
      result={result} resultTitle={`Review Response — ${f.businessName}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name"><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City"><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Accra" /></Field>
        <Field label="Reviewer Name"><Input value={f.reviewerName} onChange={v => set('reviewerName', v)} placeholder="e.g. Francis Aderemi" /></Field>
        <Field label="Star Rating">
          <Select value={f.rating} onChange={v => set('rating', v)} options={['1','2','3','4','5'].map(r => ({ value: r, label: `${r} ★` }))} />
        </Field>
      </div>
      <Field label="Review Text" required>
        <Input value={f.reviewText} onChange={v => set('reviewText', v)} multiline rows={4} placeholder="Paste the customer's exact review here..." />
      </Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10, padding: '8px 12px', background: T.dangerLight, borderRadius: 8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading || !f.reviewText || !f.businessName}>
        {loading ? <><Spinner /> Generating...</> : '✨ Generate Response'}
      </Btn>
    </AICard>
  )
}

// ─── GOOGLE POST GENERATOR ────────────────────────────────────────────────────
function PostGenerator() {
  const [f, setF] = useState({ postType: 'Whats New', businessName: '', businessType: '', city: '', topic: '', offer: '', eventDate: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const run = async () => {
    if (!hasKey()) { setErr('Add your Groq API key in Settings or Vercel environment variables.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateGooglePost(f)) }
    catch (e) { setErr(e.message) }
    setLoading(false)
  }

  return (
    <AICard icon="📢" title="Google Post Generator"
      subtitle="Generate weekly Google Posts ready to publish."
      result={result} resultTitle={`Google Post — ${f.businessName}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name"><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City"><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Accra" /></Field>
        <Field label="Post Type">
          <Select value={f.postType} onChange={v => set('postType', v)} options={['Whats New','Offer','Event','Product'].map(t => ({ value: t, label: t }))} />
        </Field>
        {f.postType === 'Event' && <Field label="Event Date"><Input value={f.eventDate} onChange={v => set('eventDate', v)} placeholder="e.g. 15 July 2026" /></Field>}
        {f.postType === 'Offer' && <Field label="Offer Details"><Input value={f.offer} onChange={v => set('offer', v)} placeholder="e.g. 20% off all items" /></Field>}
      </div>
      <Field label="Topic / Context" required>
        <Input value={f.topic} onChange={v => set('topic', v)} multiline rows={2} placeholder="What is this post about?" />
      </Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10, padding: '8px 12px', background: T.dangerLight, borderRadius: 8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading || !f.topic || !f.businessName}>
        {loading ? <><Spinner /> Generating...</> : '✨ Generate Post'}
      </Btn>
    </AICard>
  )
}

// ─── Q&A GENERATOR ────────────────────────────────────────────────────────────
function QAGenerator() {
  const [f, setF] = useState({ businessName: '', businessType: '', city: '', services: '', targetCustomers: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const run = async () => {
    if (!hasKey()) { setErr('Add your Groq API key in Settings or Vercel environment variables.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateQandAs(f)) }
    catch (e) { setErr(e.message) }
    setLoading(false)
  }

  return (
    <AICard icon="❓" title="Q&A Generator"
      subtitle="Generate 10 keyword-rich Q&As to seed into a client's GBP profile."
      result={result} resultTitle={`GBP Q&As — ${f.businessName}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name"><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City"><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Accra" /></Field>
      </div>
      <Field label="Services Offered"><Input value={f.services} onChange={v => set('services', v)} multiline rows={2} placeholder="e.g. Online shopping, fast delivery, health products" /></Field>
      <Field label="Target Customers"><Input value={f.targetCustomers} onChange={v => set('targetCustomers', v)} placeholder="e.g. Health-conscious shoppers in Accra" /></Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10, padding: '8px 12px', background: T.dangerLight, borderRadius: 8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading || !f.businessName || !f.city}>
        {loading ? <><Spinner /> Generating...</> : '✨ Generate 10 Q&As'}
      </Btn>
    </AICard>
  )
}

// ─── DESCRIPTION WRITER ───────────────────────────────────────────────────────
function DescriptionWriter() {
  const [f, setF] = useState({ businessName: '', businessType: '', city: '', services: '', uniquePoints: '', targetCustomers: '', founded: '', awards: '', languages: 'English' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const run = async () => {
    if (!hasKey()) { setErr('Add your Groq API key in Settings or Vercel environment variables.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateBusinessDescription(f)) }
    catch (e) { setErr(e.message) }
    setLoading(false)
  }

  return (
    <AICard icon="✍️" title="Business Description Writer"
      subtitle="AI writes a Google-compliant, keyword-optimised 750-character description."
      result={result} resultTitle={`GBP Description — ${f.businessName}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name" required><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type" required><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City" required><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Accra" /></Field>
        <Field label="Founded"><Input value={f.founded} onChange={v => set('founded', v)} placeholder="e.g. 2020" /></Field>
        <Field label="Languages"><Input value={f.languages} onChange={v => set('languages', v)} placeholder="e.g. English, Twi" /></Field>
        <Field label="Awards / Certifications"><Input value={f.awards} onChange={v => set('awards', v)} placeholder="e.g. Top Rated Seller" /></Field>
      </div>
      <Field label="Services / What You Do"><Input value={f.services} onChange={v => set('services', v)} multiline rows={2} placeholder="e.g. Health supplements, fast delivery, free shipping" /></Field>
      <Field label="What Makes You Different"><Input value={f.uniquePoints} onChange={v => set('uniquePoints', v)} multiline rows={2} placeholder="e.g. Same-day delivery in Accra, 100% authentic products" /></Field>
      <Field label="Target Customers"><Input value={f.targetCustomers} onChange={v => set('targetCustomers', v)} placeholder="e.g. Health-conscious shoppers in Accra and Greater Accra" /></Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10, padding: '8px 12px', background: T.dangerLight, borderRadius: 8 }}>❌ {err}</div>}
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
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => ({ value: m, label: m }))

  const run = async () => {
    if (!hasKey()) { setErr('Add your Groq API key in Settings or Vercel environment variables.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateMonthlyReport(f)) }
    catch (e) { setErr(e.message) }
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
PERFORMANCE ANALYSIS & RECOMMENDATIONS
${'─'.repeat(52)}
${result}
${'═'.repeat(52)}
Prepared by Frankev Digital Services
frankevgloballtd@gmail.com
${'═'.repeat(52)}` : ''

  return (
    <AICard icon="📈" title="Monthly Report Generator"
      subtitle="Enter stats — AI writes the analysis. Download as PDF or send to client."
      result={fullReport} resultTitle={`GBP Monthly Report — ${f.businessName} — ${f.month}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name" required><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City"><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Accra" /></Field>
        <Field label="Report Month" required><Select value={f.month} onChange={v => set('month', v)} options={months} placeholder="Select month..." /></Field>
        <Field label="Profile Views"><Input value={f.views} onChange={v => set('views', v)} placeholder="e.g. 1,300" /></Field>
        <Field label="Search Appearances"><Input value={f.searches} onChange={v => set('searches', v)} placeholder="e.g. 900" /></Field>
        <Field label="Phone Calls"><Input value={f.calls} onChange={v => set('calls', v)} placeholder="e.g. 34" /></Field>
        <Field label="Direction Requests"><Input value={f.directions} onChange={v => set('directions', v)} placeholder="e.g. 25" /></Field>
        <Field label="Website Clicks"><Input value={f.websiteClicks} onChange={v => set('websiteClicks', v)} placeholder="e.g. 98" /></Field>
        <Field label="New Reviews"><Input value={f.reviews} onChange={v => set('reviews', v)} placeholder="e.g. 17" /></Field>
        <Field label="Photo Views"><Input value={f.photosViews} onChange={v => set('photosViews', v)} placeholder="e.g. 580" /></Field>
        <Field label="Top Post"><Input value={f.topPosts} onChange={v => set('topPosts', v)} placeholder="e.g. May sales post" /></Field>
      </div>
      <Field label="Notes for AI"><Input value={f.notes} onChange={v => set('notes', v)} multiline rows={2} placeholder="e.g. Views were amazing during the holiday period" /></Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10, padding: '8px 12px', background: T.dangerLight, borderRadius: 8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading || !f.businessName || !f.month}>
        {loading ? <><Spinner /> Writing Report...</> : '✨ Generate Report'}
      </Btn>
    </AICard>
  )
}

// ─── KEYWORD SUGGESTER ────────────────────────────────────────────────────────
function KeywordSuggester() {
  const [f, setF] = useState({ businessName: '', businessType: '', city: '', area: '', services: '', competitors: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const run = async () => {
    if (!hasKey()) { setErr('Add your Groq API key in Settings or Vercel environment variables.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateKeywords(f)) }
    catch (e) { setErr(e.message) }
    setLoading(false)
  }

  return (
    <AICard icon="🔑" title="Local Keyword Suggester"
      subtitle="AI generates the exact terms people use to find your business on Google — including competitor keywords."
      result={result} resultTitle={`Keyword Strategy — ${f.businessName} — ${f.city}`}>
      <div style={{ background: T.blueLight, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: '#1E40AF' }}>
        💡 Use these keywords naturally in your GBP description, services, Q&As, and Google Posts.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Business Name" required><Input value={f.businessName} onChange={v => set('businessName', v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type" required><Input value={f.businessType} onChange={v => set('businessType', v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City" required><Input value={f.city} onChange={v => set('city', v)} placeholder="e.g. Accra" /></Field>
        <Field label="Other Areas Served"><Input value={f.area} onChange={v => set('area', v)} placeholder="e.g. Tema, Kumasi, Takoradi" /></Field>
      </div>
      <Field label="Main Services / Products"><Input value={f.services} onChange={v => set('services', v)} multiline rows={2} placeholder="e.g. Health supplements, vitamins, fast delivery" /></Field>
      <Field label="Known Competitors (optional)">
        <Input value={f.competitors} onChange={v => set('competitors', v)} placeholder="e.g. Jiji, Jumia Ghana, Tonaton" />
      </Field>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10, padding: '8px 12px', background: T.dangerLight, borderRadius: 8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading || !f.businessName || !f.businessType || !f.city}>
        {loading ? <><Spinner /> Researching...</> : '🔑 Generate Keywords'}
      </Btn>
    </AICard>
  )
}

// ─── MAIN MODULE ──────────────────────────────────────────────────────────────
export default function AITools() {
  const [tab, setTab] = useState('review')
  const tabs = [
    { id: 'review',   icon: '⭐', label: 'Reviews' },
    { id: 'keywords', icon: '🔑', label: 'Keywords' },
    { id: 'post',     icon: '📢', label: 'Posts' },
    { id: 'qa',       icon: '❓', label: 'Q&A' },
    { id: 'desc',     icon: '✍️', label: 'Description' },
    { id: 'report',   icon: '📈', label: 'Report' },
  ]

  return (
    <div>
      <SectionHeader icon="🤖" title="AI Tools" subtitle="Powered by Groq — generate clean, copy-paste-ready content for any client." />
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
        {tab === 'review'   && <ReviewResponder />}
        {tab === 'keywords' && <KeywordSuggester />}
        {tab === 'post'     && <PostGenerator />}
        {tab === 'qa'       && <QAGenerator />}
        {tab === 'desc'     && <DescriptionWriter />}
        {tab === 'report'   && <MonthlyReport />}
      </div>
    </div>
  )
}
