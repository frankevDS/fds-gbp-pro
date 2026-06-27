import { useState } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, Spinner, copyText } from '../components/ui.jsx'
import { generateReviewResponse, generateGooglePost, generateQandAs, generateBusinessDescription, generateMonthlyReport, generateKeywords } from '../utils/groq.js'
import { getSettings } from '../utils/storage.js'

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

// Opens a beautiful HTML version of the report for printing/saving as PDF
function openPrintWindow(text, title, businessName) {
  const win = window.open('', '_blank')
  if (!win) { alert('Please allow popups for this site.'); return }
  const settings = getSettings()
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${title}</title>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; color: #1E293B; background: #fff; }
      .page { max-width: 800px; margin: 0 auto; padding: 48px 52px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #1B4FD8; margin-bottom: 32px; }
      .brand-logo { background: #1B4FD8; color: white; font-weight: 900; font-size: 18px; padding: 10px 14px; border-radius: 8px; letter-spacing: -0.5px; }
      .brand-name { font-size: 20px; font-weight: 800; color: #1B4FD8; margin-top: 6px; }
      .brand-sub { font-size: 12px; color: #64748B; margin-top: 2px; }
      .doc-title { text-align: right; }
      .doc-title h1 { font-size: 18px; font-weight: 800; color: #0F1C3F; }
      .doc-title p { font-size: 12px; color: #64748B; margin-top: 4px; }
      .section { margin-bottom: 28px; }
      .section-title { font-size: 13px; font-weight: 800; color: #1B4FD8; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 14px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
      .info-row { display: flex; gap: 8px; font-size: 13px; }
      .info-label { color: #64748B; font-weight: 600; min-width: 100px; flex-shrink: 0; }
      .info-value { color: #1E293B; }
      .score-box { background: #EEF3FF; border: 2px solid #1B4FD8; border-radius: 12px; padding: 20px 24px; display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
      .score-circle { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; flex-shrink: 0; }
      .score-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
      .score-verdict { font-size: 16px; font-weight: 800; }
      .check-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; }
      .check-pass { background: #F0FDF4; color: #15803D; }
      .check-fail { background: #FEF2F2; color: #DC2626; }
      .check-icon { font-size: 15px; flex-shrink: 0; }
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
      .stat-box { background: #F8FAFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; text-align: center; }
      .stat-value { font-size: 22px; font-weight: 900; color: #1B4FD8; }
      .stat-label { font-size: 11px; color: #64748B; margin-top: 2px; font-weight: 600; }
      .competitor-box { background: #F8FAFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
      .competitor-name { font-size: 14px; font-weight: 700; color: #0F1C3F; margin-bottom: 6px; }
      .competitor-stats { display: flex; gap: 16px; font-size: 12px; color: #64748B; }
      .map-pack-badge { background: #16A34A; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
      .opportunity { padding: 14px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
      .opp-critical { background: #FEF2F2; color: #DC2626; border: 1.5px solid #FCA5A5; }
      .opp-high { background: #FFFBEB; color: #D97706; border: 1.5px solid #FCD34D; }
      .opp-medium { background: #FFFFF0; color: #854D0E; border: 1.5px solid #FDE68A; }
      .opp-low { background: #F0FDF4; color: #16A34A; border: 1.5px solid #86EFAC; }
      .action-item { display: flex; gap: 10px; padding: 10px 14px; background: #EEF3FF; border-radius: 8px; margin-bottom: 8px; font-size: 13px; }
      .action-num { background: #1B4FD8; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
      .notes-box { background: #F8FAFF; border-left: 4px solid #1B4FD8; border-radius: 0 8px 8px 0; padding: 14px 16px; font-size: 13px; line-height: 1.7; color: #1E293B; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #E2E8F0; display: flex; justify-content: space-between; align-items: flex-end; }
      .footer-brand { font-size: 13px; font-weight: 700; color: #1B4FD8; }
      .footer-contact { font-size: 12px; color: #64748B; line-height: 1.8; }
      .footer-date { font-size: 11px; color: #94A3B8; }
      .no-print { display: block; background: #1B4FD8; color: white; padding: 12px 28px; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; margin: 0 auto 24px; font-family: inherit; }
      @media print {
        .no-print { display: none !important; }
        .page { padding: 24px 32px; }
        @page { margin: 1.5cm; size: A4; }
      }
    </style>
  </head><body>
    <div class="page">
      <button class="no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <div class="header">
        <div>
          <div class="brand-logo">FDS</div>
          <div class="brand-name">Frankev Digital Services</div>
          <div class="brand-sub">${settings.yourEmail || 'frankevgloballtd@gmail.com'}</div>
        </div>
        <div class="doc-title">
          <h1>${title}</h1>
          <p>Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p style="margin-top:4px;font-size:11px;color:#94A3B8;">gbp.frankevdigitalservices.com</p>
        </div>
      </div>
      <div id="content"></div>
      <div class="footer">
        <div>
          <div class="footer-brand">Frankev Digital Services</div>
          <div class="footer-contact">${settings.yourEmail || 'frankevgloballtd@gmail.com'}<br>gbp.frankevdigitalservices.com</div>
        </div>
        <div class="footer-date">Report generated ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
    <script>
      var rawText = ${JSON.stringify(text)};
      document.getElementById('content').innerHTML = '<pre style="white-space:pre-wrap;word-break:break-word;font-family:Arial,sans-serif;font-size:13px;line-height:1.8;color:#1E293B;">' + rawText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>';
    </script>
  </body></html>`)
  win.document.close()
}

// ✅ FIXED: Gmail opens FIRST (direct from user click = browser allows it)
// PDF opens in setTimeout AFTER — browser allows secondary opens after a short delay
function sendViaGmail(text, title, businessName) {
  const settings = getSettings()

  const subject = encodeURIComponent(title)
  const preview = text.substring(0, 500).replace(/[^\x20-\x7E\n]/g, '')

  const emailBody = `Dear Client,

Please find attached your Google Business Profile report prepared by Frankev Digital Services.

The full PDF report will open in a separate window on your screen — please save it and attach it to this email before sending to your client.

------- REPORT PREVIEW -------

${preview}...

[Continued in the attached PDF]

------- END OF PREVIEW -------

For any questions about this report or your Google Business Profile management, please contact us at any time.

Best regards,
${settings.yourName || 'Abiodun'}
Frankev Digital Services
${settings.yourEmail || 'frankevgloballtd@gmail.com'}
gbp.frankevdigitalservices.com`

  const body = encodeURIComponent(emailBody)

  // STEP 1 — Open Gmail FIRST (must be direct from user click — browsers block delayed popups)
  window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank')

  // STEP 2 — Open PDF window after short delay (browsers allow this after the first popup)
  setTimeout(() => {
    openPrintWindow(text, title, businessName)
  }, 600)
}

function sendViaWhatsApp(text, title) {
  const settings = getSettings()
  // WhatsApp has a higher limit — send full text in chunks
  const header = `*${title}*\n_Prepared by Frankev Digital Services_\n_${settings.yourEmail || 'frankevgloballtd@gmail.com'}_\n\n`
  const fullMessage = header + text
  // WhatsApp web supports up to ~65,000 chars
  window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage.substring(0, 4096))}`, '_blank')
}

function btnStyle(bg) {
  return {
    padding: '8px 14px', borderRadius: 8, border: 'none',
    background: bg, color: '#fff', fontWeight: 700,
    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
    display: 'inline-flex', alignItems: 'center', gap: 5
  }
}

// ─── SHARE BAR — exported so AuditTool can use it ────────────────────────────
export function ShareBar({ text, title, businessName = '' }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null
  return (
    <div style={{
      display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
      padding: '12px 14px', background: T.successLight,
      border: `1.5px solid #86EFAC`, borderRadius: 10, marginBottom: 14
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: T.success, marginRight: 4, width: '100%' }}>
        ✅ Ready to share:
      </span>
      <button onClick={() => openPrintWindow(text, title, businessName)} style={btnStyle('#DC2626')}>
        📄 Download PDF
      </button>
      <button onClick={() => sendViaWhatsApp(text, title)} style={btnStyle('#16A34A')}>
        💬 WhatsApp
      </button>
      <button onClick={() => sendViaGmail(text, title, businessName)} style={btnStyle('#1B4FD8')}>
        📧 Gmail (opens PDF + email)
      </button>
      <button onClick={() => copyText(text, setCopied)} style={btnStyle(copied ? T.success : '#475569')}>
        {copied ? '✅ Copied!' : '📋 Copy Text'}
      </button>
      <p style={{ fontSize: 11, color: T.textLight, width: '100%', margin: '4px 0 0' }}>
        💡 For Gmail: Gmail compose opens first, then the PDF opens automatically — save the PDF and attach it to the email before sending.
      </p>
    </div>
  )
}

// ─── RESULT BOX ───────────────────────────────────────────────────────────────
function ResultBox({ result, title, businessName }) {
  if (!result) return null
  return (
    <div className="animate-fadeIn" style={{ marginTop: 16 }}>
      <ShareBar text={result} title={title} businessName={businessName} />
      <div style={{
        background: '#F8FAFF', border: `1.5px solid ${T.grayBorder}`,
        borderLeft: `4px solid ${T.blue}`, borderRadius: 10,
        padding: 16, fontSize: 14, color: T.text,
        lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        fontFamily: 'inherit', maxHeight: 400, overflowY: 'auto'
      }}>
        {result}
      </div>
    </div>
  )
}

function AICard({ icon, title, subtitle, children, result, resultTitle, businessName }) {
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
      <ResultBox result={result} title={resultTitle || title} businessName={businessName} />
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
      result={result} resultTitle={`Review Response — ${f.businessName}`} businessName={f.businessName}>
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
    <AICard icon="📢" title="Google Post Generator" subtitle="Generate weekly Google Posts ready to publish." result={result} resultTitle={`Google Post — ${f.businessName}`} businessName={f.businessName}>
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
    <AICard icon="❓" title="Q&A Generator" subtitle="Generate 10 keyword-rich Q&As to seed into a client's GBP profile." result={result} resultTitle={`GBP Q&As — ${f.businessName}`} businessName={f.businessName}>
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
    <AICard icon="✍️" title="Business Description Writer" subtitle="AI writes a Google-compliant, keyword-optimised 750-character description." result={result} resultTitle={`GBP Description — ${f.businessName}`} businessName={f.businessName}>
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
      <Field label="Target Customers"><Input value={f.targetCustomers} onChange={v => set('targetCustomers', v)} placeholder="e.g. Health-conscious shoppers in Accra" /></Field>
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

  const settings = getSettings()
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
Prepared by: ${settings.yourName || 'Abiodun'}
Frankev Digital Services
${settings.yourEmail || 'frankevgloballtd@gmail.com'}
gbp.frankevdigitalservices.com
${'═'.repeat(52)}` : ''

  return (
    <AICard icon="📈" title="Monthly Report Generator"
      subtitle="Enter stats — AI writes the analysis. Download PDF or send to client via Gmail/WhatsApp."
      result={fullReport} resultTitle={`GBP Monthly Report — ${f.businessName} — ${f.month}`} businessName={f.businessName}>
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
      result={result} resultTitle={`Keyword Strategy — ${f.businessName} — ${f.city}`} businessName={f.businessName}>
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
