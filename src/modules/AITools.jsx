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

// ─── PDF / SHARE UTILITIES ────────────────────────────────────────────────────
export function openPrintWindow(text, title) {
  const settings = getSettings()
  const win = window.open('', '_blank')
  if (!win) { alert('Please allow popups for this site to download the PDF.'); return }
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${title}</title><meta charset="UTF-8">
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Arial, Helvetica, sans-serif; color: #1E293B; background: #fff; }
      .page { max-width: 820px; margin: 0 auto; padding: 40px 48px; }
      .print-btn { display:block; background:#1B4FD8; color:white; padding:12px 28px; border:none; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; margin:0 auto 28px; font-family:inherit; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:20px; border-bottom:3px solid #1B4FD8; margin-bottom:28px; }
      .logo-box { width:48px; height:48px; border-radius:10px; background:linear-gradient(135deg,#1B4FD8,#7C3AED,#059669); display:flex; align-items:center; justify-content:center; color:white; font-weight:900; font-size:12px; letter-spacing:0.5px; flex-shrink:0; }
      .brand { margin-left:12px; }
      .brand-name { font-size:18px; font-weight:800; color:#1B4FD8; }
      .brand-sub { font-size:11px; color:#64748B; margin-top:2px; }
      .brand-wrap { display:flex; align-items:center; }
      .doc-title { font-size:16px; font-weight:800; color:#0F1C3F; text-align:right; }
      .doc-date { font-size:11px; color:#64748B; margin-top:4px; text-align:right; }
      pre { white-space:pre-wrap; word-break:break-word; font-family:'Courier New',Courier,monospace; font-size:12px; line-height:1.9; color:#1E293B; }
      .footer { margin-top:36px; padding-top:16px; border-top:2px solid #E2E8F0; display:flex; justify-content:space-between; font-size:12px; color:#64748B; }
      .footer-brand { font-weight:700; color:#1B4FD8; font-size:13px; }
      @media print { .print-btn { display:none !important; } .page { padding:24px 32px; } @page { margin:1.5cm; size:A4; } }
    </style>
  </head><body>
    <div class="page">
      <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF — then attach to your email</button>
      <div class="header">
        <div class="brand-wrap">
          <div class="logo-box">GBP</div>
          <div class="brand">
            <div class="brand-name">Frankev Digital Services</div>
            <div class="brand-sub">${settings.yourEmail || 'hispraise01@gmail.com'}</div>
          </div>
        </div>
        <div>
          <div class="doc-title">${title}</div>
          <div class="doc-date">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
      <pre id="rc"></pre>
      <div class="footer">
        <div><div class="footer-brand">Frankev Digital Services</div><div>${settings.yourEmail || 'hispraise01@gmail.com'}</div></div>
        <div>gbp.frankevdigitalservices.com</div>
      </div>
    </div>
    <script>document.getElementById('rc').textContent=${JSON.stringify(text)};</script>
  </body></html>`)
  win.document.close()
}

// ✅ GMAIL FIX: Open Gmail FIRST (direct click allowed by browser)
// Then open PDF window after delay. Gmail gets key stats + professional email body.
// Full report always available via PDF attachment.
export function sendViaGmail(text, title) {
  const settings = getSettings()
  const subject = encodeURIComponent(title)

  // Extract key lines from report for email preview (stays under Gmail URL limit)
  const lines = text.split('\n').filter(l => l.trim())
  const scoreLines = lines.filter(l =>
    l.includes('OVERALL SCORE') || l.includes('PROFILE SCORE') ||
    l.includes('SCORE:') || l.includes('Risk Score') ||
    l.includes('OPPORTUNITY') || l.includes('GBP Listing') ||
    l.includes('Profile Verified') || l.includes('Map Pack')
  ).slice(0, 6).join('\n')

  const actionLines = lines.filter(l =>
    l.match(/^\s+\d+\./) || l.includes('THIS WEEK') || l.includes('ACTION POINT')
  ).slice(0, 8).join('\n')

  const businessLine = lines.find(l => l.includes('Business') && l.includes(':')) || ''

  const emailBody =
`Dear Client,

Please find your Google Business Profile report from Frankev Digital Services.

The FULL report PDF has opened in a separate window on your screen.
Please SAVE it and ATTACH it to this email before sending.

${businessLine ? `─────────────────────────────
${businessLine}` : ''}

KEY FINDINGS:
${scoreLines || '(See attached PDF for full details)'}

${actionLines ? `TOP PRIORITY ACTIONS:\n${actionLines}` : ''}

─────────────────────────────
The complete report is in the attached PDF.

For any questions about your Google Business Profile, contact us at any time.

Best regards,
${settings.yourName || 'Abiodun'}
Frankev Digital Services
${settings.yourEmail || 'hispraise01@gmail.com'}
gbp.frankevdigitalservices.com`

  const safeBody = emailBody.replace(/[^\x20-\x7E\n]/g, '').substring(0, 1900)
  const body = encodeURIComponent(safeBody)

  // STEP 1: Open Gmail FIRST (browser allows this from direct click)
  window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank')

  // STEP 2: Open PDF 700ms later (browser allows this secondary open)
  setTimeout(() => openPrintWindow(text, title), 700)
}

export function sendViaWhatsApp(text, title) {
  const settings = getSettings()
  const header = `*${title}*\n_Frankev Digital Services_\n_${settings.yourEmail || 'hispraise01@gmail.com'}_\n\n`
  const msg = (header + text).substring(0, 4096)
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
}

function btnStyle(bg) {
  return { padding:'8px 14px', borderRadius:8, border:'none', background:bg, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5 }
}

// ─── SHARE BAR — exported so all modules can use it ──────────────────────────
export function ShareBar({ text, title, businessName = '' }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', padding:'12px 14px', background:T.successLight, border:`1.5px solid #86EFAC`, borderRadius:10, marginBottom:14 }}>
      <span style={{ fontSize:12, fontWeight:700, color:T.success, width:'100%' }}>✅ Ready to share:</span>
      <button onClick={() => openPrintWindow(text, title)} style={btnStyle('#DC2626')}>📄 Download PDF</button>
      <button onClick={() => sendViaWhatsApp(text, title)} style={btnStyle('#16A34A')}>💬 WhatsApp</button>
      <button onClick={() => sendViaGmail(text, title)} style={btnStyle('#1B4FD8')}>📧 Gmail</button>
      <button onClick={() => copyText(text, setCopied)} style={btnStyle(copied ? T.success : '#475569')}>{copied ? '✅ Copied!' : '📋 Copy Text'}</button>
      <p style={{ fontSize:11, color:T.textLight, width:'100%', margin:'4px 0 0' }}>
        💡 Gmail: Compose window opens first with key findings → PDF opens automatically → save PDF → attach to email → send.
      </p>
    </div>
  )
}

function ResultBox({ result, title }) {
  if (!result) return null
  return (
    <div className="animate-fadeIn" style={{ marginTop:16 }}>
      <ShareBar text={result} title={title} />
      <div style={{ background:'#F8FAFF', border:`1.5px solid ${T.grayBorder}`, borderLeft:`4px solid ${T.blue}`, borderRadius:10, padding:16, fontSize:14, color:T.text, lineHeight:1.8, whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:'inherit', maxHeight:400, overflowY:'auto' }}>
        {result}
      </div>
    </div>
  )
}

function AICard({ icon, title, subtitle, children, result, resultTitle }) {
  return (
    <Card style={{ marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        <div>
          <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:T.dark }}>{title}</h3>
          <p style={{ margin:0, fontSize:12, color:T.textLight }}>{subtitle}</p>
        </div>
      </div>
      {children}
      <ResultBox result={result} title={resultTitle || title} />
    </Card>
  )
}

function ReviewResponder() {
  const [f, setF] = useState({ reviewText:'', reviewerName:'', rating:'5', businessName:'', businessType:'', city:'' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [err, setErr] = useState('')
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const run = async () => {
    if (!hasKey()) { setErr('Add your Groq API key in Settings or Vercel environment variables.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateReviewResponse(f)) } catch(e) { setErr(e.message) }
    setLoading(false)
  }
  return (
    <AICard icon="⭐" title="Review Response Generator" subtitle="Paste a customer review — AI writes a clean, copy-paste-ready owner response." result={result} resultTitle={`Review Response — ${f.businessName}`}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
        <Field label="Business Name"><Input value={f.businessName} onChange={v=>set('businessName',v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v=>set('businessType',v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City"><Input value={f.city} onChange={v=>set('city',v)} placeholder="e.g. Accra" /></Field>
        <Field label="Reviewer Name"><Input value={f.reviewerName} onChange={v=>set('reviewerName',v)} placeholder="e.g. Francis Aderemi" /></Field>
        <Field label="Star Rating"><Select value={f.rating} onChange={v=>set('rating',v)} options={['1','2','3','4','5'].map(r=>({value:r,label:`${r} ★`}))} /></Field>
      </div>
      <Field label="Review Text" required><Input value={f.reviewText} onChange={v=>set('reviewText',v)} multiline rows={4} placeholder="Paste the customer's exact review here..." /></Field>
      {err && <div style={{ color:T.danger, fontSize:13, marginBottom:10, padding:'8px 12px', background:T.dangerLight, borderRadius:8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading||!f.reviewText||!f.businessName}>{loading?<><Spinner /> Generating...</>:'✨ Generate Response'}</Btn>
    </AICard>
  )
}

function PostGenerator() {
  const [f, setF] = useState({ postType:'Whats New', businessName:'', businessType:'', city:'', topic:'', offer:'', eventDate:'' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [err, setErr] = useState('')
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const run = async () => {
    if (!hasKey()) { setErr('Add Groq API key in Settings.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateGooglePost(f)) } catch(e) { setErr(e.message) }
    setLoading(false)
  }
  return (
    <AICard icon="📢" title="Google Post Generator" subtitle="Generate weekly Google Posts ready to publish." result={result} resultTitle={`Google Post — ${f.businessName}`}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
        <Field label="Business Name"><Input value={f.businessName} onChange={v=>set('businessName',v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v=>set('businessType',v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City"><Input value={f.city} onChange={v=>set('city',v)} placeholder="e.g. Accra" /></Field>
        <Field label="Post Type"><Select value={f.postType} onChange={v=>set('postType',v)} options={['Whats New','Offer','Event','Product'].map(t=>({value:t,label:t}))} /></Field>
        {f.postType==='Event'&&<Field label="Event Date"><Input value={f.eventDate} onChange={v=>set('eventDate',v)} placeholder="e.g. 15 July 2026" /></Field>}
        {f.postType==='Offer'&&<Field label="Offer Details"><Input value={f.offer} onChange={v=>set('offer',v)} placeholder="e.g. 20% off all items" /></Field>}
      </div>
      <Field label="Topic / Context" required><Input value={f.topic} onChange={v=>set('topic',v)} multiline rows={2} placeholder="What is this post about?" /></Field>
      {err && <div style={{ color:T.danger, fontSize:13, marginBottom:10, padding:'8px 12px', background:T.dangerLight, borderRadius:8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading||!f.topic||!f.businessName}>{loading?<><Spinner /> Generating...</>:'✨ Generate Post'}</Btn>
    </AICard>
  )
}

function QAGenerator() {
  const [f, setF] = useState({ businessName:'', businessType:'', city:'', services:'', targetCustomers:'' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [err, setErr] = useState('')
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const run = async () => {
    if (!hasKey()) { setErr('Add Groq API key in Settings.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateQandAs(f)) } catch(e) { setErr(e.message) }
    setLoading(false)
  }
  return (
    <AICard icon="❓" title="Q&A Generator" subtitle="Generate 10 keyword-rich Q&As for a client's GBP profile." result={result} resultTitle={`GBP Q&As — ${f.businessName}`}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
        <Field label="Business Name"><Input value={f.businessName} onChange={v=>set('businessName',v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v=>set('businessType',v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City"><Input value={f.city} onChange={v=>set('city',v)} placeholder="e.g. Accra" /></Field>
      </div>
      <Field label="Services Offered"><Input value={f.services} onChange={v=>set('services',v)} multiline rows={2} placeholder="e.g. Online shopping, fast delivery, health products" /></Field>
      <Field label="Target Customers"><Input value={f.targetCustomers} onChange={v=>set('targetCustomers',v)} placeholder="e.g. Health-conscious shoppers in Accra" /></Field>
      {err && <div style={{ color:T.danger, fontSize:13, marginBottom:10, padding:'8px 12px', background:T.dangerLight, borderRadius:8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading||!f.businessName||!f.city}>{loading?<><Spinner /> Generating...</>:'✨ Generate 10 Q&As'}</Btn>
    </AICard>
  )
}

function DescriptionWriter() {
  const [f, setF] = useState({ businessName:'', businessType:'', city:'', services:'', uniquePoints:'', targetCustomers:'', founded:'', awards:'', languages:'English' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [err, setErr] = useState('')
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const run = async () => {
    if (!hasKey()) { setErr('Add Groq API key in Settings.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateBusinessDescription(f)) } catch(e) { setErr(e.message) }
    setLoading(false)
  }
  return (
    <AICard icon="✍️" title="Business Description Writer" subtitle="AI writes a Google-compliant, keyword-optimised 750-character description." result={result} resultTitle={`GBP Description — ${f.businessName}`}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
        <Field label="Business Name" required><Input value={f.businessName} onChange={v=>set('businessName',v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type" required><Input value={f.businessType} onChange={v=>set('businessType',v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City" required><Input value={f.city} onChange={v=>set('city',v)} placeholder="e.g. Accra" /></Field>
        <Field label="Founded"><Input value={f.founded} onChange={v=>set('founded',v)} placeholder="e.g. 2020" /></Field>
        <Field label="Languages"><Input value={f.languages} onChange={v=>set('languages',v)} placeholder="e.g. English, Twi" /></Field>
        <Field label="Awards"><Input value={f.awards} onChange={v=>set('awards',v)} placeholder="e.g. Top Rated Seller" /></Field>
      </div>
      <Field label="Services / What You Do"><Input value={f.services} onChange={v=>set('services',v)} multiline rows={2} placeholder="e.g. Health supplements, fast delivery" /></Field>
      <Field label="What Makes You Different"><Input value={f.uniquePoints} onChange={v=>set('uniquePoints',v)} multiline rows={2} placeholder="e.g. Same-day delivery in Accra" /></Field>
      <Field label="Target Customers"><Input value={f.targetCustomers} onChange={v=>set('targetCustomers',v)} placeholder="e.g. Health-conscious shoppers in Accra" /></Field>
      {err && <div style={{ color:T.danger, fontSize:13, marginBottom:10, padding:'8px 12px', background:T.dangerLight, borderRadius:8 }}>❌ {err}</div>}
      {result && <p style={{ fontSize:11, color:result.length>700?T.danger:T.textLight, marginBottom:8 }}>{result.length}/750 characters</p>}
      <Btn onClick={run} disabled={loading||!f.businessName||!f.businessType||!f.city}>{loading?<><Spinner /> Writing...</>:'✨ Write Description'}</Btn>
    </AICard>
  )
}

function MonthlyReport() {
  const [f, setF] = useState({ businessName:'', businessType:'', city:'', month:'', views:'', searches:'', calls:'', directions:'', websiteClicks:'', reviews:'', photosViews:'', topPosts:'', notes:'' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [err, setErr] = useState('')
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'].map(m=>({value:m,label:m}))
  const run = async () => {
    if (!hasKey()) { setErr('Add Groq API key in Settings.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateMonthlyReport(f)) } catch(e) { setErr(e.message) }
    setLoading(false)
  }
  const settings = getSettings()
  const fullReport = result ? `FRANKEV DIGITAL SERVICES\nMONTHLY GBP PERFORMANCE REPORT\n${'═'.repeat(52)}\nBusiness : ${f.businessName}\nLocation : ${f.city}\nMonth    : ${f.month}\nPrepared : ${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}\n${'═'.repeat(52)}\n\nSTATS SUMMARY\n${'─'.repeat(52)}\nProfile Views         : ${f.views||'—'}\nSearch Appearances    : ${f.searches||'—'}\nPhone Calls           : ${f.calls||'—'}\nDirection Requests    : ${f.directions||'—'}\nWebsite Clicks        : ${f.websiteClicks||'—'}\nNew Reviews           : ${f.reviews||'—'}\nPhoto Views           : ${f.photosViews||'—'}\nTop Post              : ${f.topPosts||'—'}\n\n${'─'.repeat(52)}\nPERFORMANCE ANALYSIS & RECOMMENDATIONS\n${'─'.repeat(52)}\n${result}\n${'═'.repeat(52)}\nPrepared by: ${settings.yourName||'Abiodun'}\nFrankev Digital Services\n${settings.yourEmail||'hispraise01@gmail.com'}\ngbp.frankevdigitalservices.com\n${'═'.repeat(52)}` : ''
  return (
    <AICard icon="📈" title="Monthly Report Generator" subtitle="Enter stats — AI writes the analysis. Download PDF or send to client." result={fullReport} resultTitle={`GBP Monthly Report — ${f.businessName} — ${f.month}`}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
        <Field label="Business Name" required><Input value={f.businessName} onChange={v=>set('businessName',v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type"><Input value={f.businessType} onChange={v=>set('businessType',v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City"><Input value={f.city} onChange={v=>set('city',v)} placeholder="e.g. Accra" /></Field>
        <Field label="Report Month" required><Select value={f.month} onChange={v=>set('month',v)} options={months} placeholder="Select month..." /></Field>
        <Field label="Profile Views"><Input value={f.views} onChange={v=>set('views',v)} placeholder="e.g. 1,300" /></Field>
        <Field label="Search Appearances"><Input value={f.searches} onChange={v=>set('searches',v)} placeholder="e.g. 900" /></Field>
        <Field label="Phone Calls"><Input value={f.calls} onChange={v=>set('calls',v)} placeholder="e.g. 34" /></Field>
        <Field label="Direction Requests"><Input value={f.directions} onChange={v=>set('directions',v)} placeholder="e.g. 25" /></Field>
        <Field label="Website Clicks"><Input value={f.websiteClicks} onChange={v=>set('websiteClicks',v)} placeholder="e.g. 98" /></Field>
        <Field label="New Reviews"><Input value={f.reviews} onChange={v=>set('reviews',v)} placeholder="e.g. 17" /></Field>
        <Field label="Photo Views"><Input value={f.photosViews} onChange={v=>set('photosViews',v)} placeholder="e.g. 580" /></Field>
        <Field label="Top Post"><Input value={f.topPosts} onChange={v=>set('topPosts',v)} placeholder="e.g. May sales post" /></Field>
      </div>
      <Field label="Notes for AI"><Input value={f.notes} onChange={v=>set('notes',v)} multiline rows={2} placeholder="e.g. Views were amazing during the holiday period" /></Field>
      {err && <div style={{ color:T.danger, fontSize:13, marginBottom:10, padding:'8px 12px', background:T.dangerLight, borderRadius:8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading||!f.businessName||!f.month}>{loading?<><Spinner /> Writing Report...</>:'✨ Generate Report'}</Btn>
    </AICard>
  )
}

function KeywordSuggester() {
  const [f, setF] = useState({ businessName:'', businessType:'', city:'', area:'', services:'', competitors:'' })
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false); const [err, setErr] = useState('')
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const run = async () => {
    if (!hasKey()) { setErr('Add Groq API key in Settings.'); return }
    setLoading(true); setErr(''); setResult('')
    try { setResult(await generateKeywords(f)) } catch(e) { setErr(e.message) }
    setLoading(false)
  }
  return (
    <AICard icon="🔑" title="Local Keyword Suggester" subtitle="AI generates exact search terms people use to find your business on Google." result={result} resultTitle={`Keyword Strategy — ${f.businessName} — ${f.city}`}>
      <div style={{ background:T.blueLight, borderRadius:10, padding:12, marginBottom:16, fontSize:13, color:'#1E40AF' }}>
        💡 Use these keywords naturally in your GBP description, services, Q&As, and Google Posts.
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <Field label="Business Name" required><Input value={f.businessName} onChange={v=>set('businessName',v)} placeholder="e.g. Frankev Online Store" /></Field>
        <Field label="Business Type" required><Input value={f.businessType} onChange={v=>set('businessType',v)} placeholder="e.g. Ecommerce Store" /></Field>
        <Field label="City" required><Input value={f.city} onChange={v=>set('city',v)} placeholder="e.g. Accra" /></Field>
        <Field label="Other Areas Served"><Input value={f.area} onChange={v=>set('area',v)} placeholder="e.g. Tema, Kumasi" /></Field>
      </div>
      <Field label="Main Services / Products"><Input value={f.services} onChange={v=>set('services',v)} multiline rows={2} placeholder="e.g. Health supplements, vitamins, fast delivery" /></Field>
      <Field label="Known Competitors"><Input value={f.competitors} onChange={v=>set('competitors',v)} placeholder="e.g. Jiji, Jumia Ghana, Tonaton" /></Field>
      {err && <div style={{ color:T.danger, fontSize:13, marginBottom:10, padding:'8px 12px', background:T.dangerLight, borderRadius:8 }}>❌ {err}</div>}
      <Btn onClick={run} disabled={loading||!f.businessName||!f.businessType||!f.city}>{loading?<><Spinner /> Researching...</>:'🔑 Generate Keywords'}</Btn>
    </AICard>
  )
}

export default function AITools() {
  const [tab, setTab] = useState('review')
  const tabs = [
    { id:'review',   icon:'⭐', label:'Reviews'     },
    { id:'keywords', icon:'🔑', label:'Keywords'    },
    { id:'post',     icon:'📢', label:'Posts'       },
    { id:'qa',       icon:'❓', label:'Q&A'         },
    { id:'desc',     icon:'✍️', label:'Description' },
    { id:'report',   icon:'📈', label:'Report'      },
  ]
  return (
    <div>
      <SectionHeader icon="🤖" title="AI Tools" subtitle="Powered by Groq — generate clean, copy-paste-ready content for any client." />
      <NoKeyWarning />
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:22 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit', background:tab===t.id?T.blue:T.grayLight, color:tab===t.id?T.white:T.gray }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="animate-fadeIn" key={tab}>
        {tab==='review'   && <ReviewResponder />}
        {tab==='keywords' && <KeywordSuggester />}
        {tab==='post'     && <PostGenerator />}
        {tab==='qa'       && <QAGenerator />}
        {tab==='desc'     && <DescriptionWriter />}
        {tab==='report'   && <MonthlyReport />}
      </div>
    </div>
  )
}
