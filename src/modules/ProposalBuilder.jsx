import { useState } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, copyText } from '../components/ui.jsx'
import { getSettings } from '../utils/storage.js'

// ─── PROPOSAL BUILDER ─────────────────────────────────────────────────────────
export function ProposalBuilder() {
  const { yourName, yourEmail, currency } = getSettings()
  const cur = currency || '£'
  const [f, setF] = useState({
    clientName:'', clientBusiness:'', clientAddress:'', clientIndustry:'',
    auditScore:'', competitorName:'', competitorReviews:'', competitorRating:'',
    starterPrice:'', growthPrice:'', premiumPrice:'',
    yourName: yourName || 'Abiodun', yourEmail: yourEmail || 'frankevgloballtd@gmail.com',
    proposalDate: new Date().toISOString().split('T')[0], painPoints:'', customNote:'',
  })
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)
  const set = (k,v) => setF(p=>({...p,[k]:v}))

  const proposal = `FRANKEV DIGITAL SERVICES
GOOGLE BUSINESS PROFILE PROPOSAL
${'═'.repeat(60)}
Prepared For : ${f.clientName||'[Client Name]'} — ${f.clientBusiness||'[Business]'}
Address      : ${f.clientAddress||'[Address]'}
Industry     : ${f.clientIndustry||'[Industry]'}
Prepared By  : ${f.yourName}, Frankev Digital Services
Email        : ${f.yourEmail}
Date         : ${f.proposalDate}
${'═'.repeat(60)}

SECTION 1 — YOUR CURRENT GOOGLE PRESENCE
${'─'.repeat(60)}
We conducted a professional audit of ${f.clientBusiness||'your business'}'s Google
presence before preparing this proposal.

Your GBP Profile Score : ${f.auditScore||'—'} / 10
${f.painPoints?`\nKey Issues Found:\n${f.painPoints.split('\n').map(p=>`  ❌ ${p}`).join('\n')}`:''}
${f.competitorName?`\nLeading Competitor : ${f.competitorName}
Their Reviews      : ${f.competitorReviews||'—'} reviews at ${f.competitorRating||'—'}★
Their Visibility   : Ranking in Google Map Pack (top 3 results)

Every time a potential customer searches for ${f.clientIndustry||'your service'}
in your area, they are finding ${f.competitorName} — not you.`:''}

SECTION 2 — THE OPPORTUNITY
${'─'.repeat(60)}
97% of consumers search online before visiting a local business.
Businesses with complete Google profiles get 7x more clicks than
those with incomplete listings.

46% of all Google searches have local intent — people looking
for businesses exactly like yours, right now, in your area.

A professionally managed Google Business Profile means:
  ✅ You appear when nearby customers search for what you offer
  ✅ You show up in Google Maps before competitors
  ✅ Customers can call, get directions, or book directly from Google
  ✅ Reviews build trust before they even reach your website

SECTION 3 — WHAT FRANKEV DIGITAL SERVICES WILL DO
${'─'.repeat(60)}
We handle everything. You focus on running your business.

SETUP (Week 1 — included in all packages):
  ✔ Full GBP profile creation or takeover of existing listing
  ✔ Google-compliant business name and category setup
  ✔ Keyword-optimised business description (750 chars)
  ✔ All services and products listed with descriptions
  ✔ Complete hours, contact details, and website linking
  ✔ Business attributes configured
  ✔ NAP (Name, Address, Phone) consistency audit
  ✔ Verification management
  ✔ Photo upload and organisation
  ✔ Seeding 5–10 Q&As with keyword-rich answers

ONGOING MANAGEMENT (Monthly retainer):
  ✔ Weekly Google Posts (offers, news, events)
  ✔ Review monitoring and professional response drafting
  ✔ Monthly performance report (views, calls, directions)
  ✔ Photo refresh and updates
  ✔ Category and attribute optimisation
  ✔ Special hours updates (holidays, seasonal changes)
  ✔ Competitor tracking report

SECTION 4 — OUR PROCESS
${'─'.repeat(60)}
WEEK 1 — INTAKE & SETUP
  We collect your business details via the FDS intake form.
  Full profile created, optimised, submitted for verification.

WEEK 2 — VERIFICATION & LAUNCH
  We guide you through verification. Profile goes live on
  Google Search and Maps, fully optimised.

MONTH 1 ONWARDS — ONGOING MANAGEMENT
  Monthly retainer begins. Weekly posts, review responses,
  and monthly reporting keep your profile active and ranking.

SECTION 5 — INVESTMENT
${'─'.repeat(60)}
All packages include initial setup at no extra charge.

┌─────────────┬──────────────────────────────────┬─────────────┐
│ PACKAGE     │ WHAT'S INCLUDED                  │ PER MONTH   │
├─────────────┼──────────────────────────────────┼─────────────┤
│ Starter     │ Setup + Basic optimisation       │ ${cur}${(f.starterPrice||'XX').toString().padEnd(10)} │
│             │ + Quarterly review               │             │
├─────────────┼──────────────────────────────────┼─────────────┤
│ Growth ★   │ Setup + Weekly posts             │ ${cur}${(f.growthPrice||'XX').toString().padEnd(10)} │
│             │ + Review management              │             │
│             │ + Monthly report                 │             │
├─────────────┼──────────────────────────────────┼─────────────┤
│ Premium     │ Full management + Competitor     │ ${cur}${(f.premiumPrice||'XX').toString().padEnd(10)} │
│             │ tracking + Priority support      │             │
│             │ + Bi-weekly posts                │             │
└─────────────┴──────────────────────────────────┴─────────────┘
★ Recommended for most local businesses.
No long-term contracts. Cancel anytime with 30 days notice.

SECTION 6 — WHY FRANKEV DIGITAL SERVICES
${'─'.repeat(60)}
  ✔ Specialists in local Google search optimisation
  ✔ Every profile built using our proprietary FDS GBP system
  ✔ We follow Google's guidelines strictly — zero suspension risk
  ✔ Real, human-written content — never AI spam
  ✔ Transparent monthly reporting on every metric
  ✔ You own your profile — always
${f.customNote?`\nPERSONAL NOTE\n${'─'.repeat(60)}\n${f.customNote}\n`:''}
SECTION 7 — NEXT STEPS
${'─'.repeat(60)}
  STEP 1 → Choose your package (Starter / Growth / Premium)
  STEP 2 → Complete the FDS business intake form (5 minutes)
  STEP 3 → We begin setup within 24 hours of confirmation

To accept this proposal or ask any questions:

  ${f.yourName} — Frankev Digital Services
  📧 ${f.yourEmail}

This proposal is valid for 14 days from ${f.proposalDate}.
${'═'.repeat(60)}
Frankev Digital Services — Helping local businesses get found.
${'═'.repeat(60)}`

  return (
    <div>
      <SectionHeader icon="📝" title="Proposal Builder" subtitle="Build a client-specific winning proposal in minutes." />

      <Card style={{ marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>Client Details</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Client Full Name" required><Input value={f.clientName} onChange={v=>set('clientName',v)} placeholder="e.g. Gloria Osei" /></Field>
          <Field label="Business Name" required><Input value={f.clientBusiness} onChange={v=>set('clientBusiness',v)} placeholder="e.g. Gloria's Hair Studio" /></Field>
          <Field label="Business Address"><Input value={f.clientAddress} onChange={v=>set('clientAddress',v)} placeholder="e.g. 14 High Street, Manchester" /></Field>
          <Field label="Industry"><Input value={f.clientIndustry} onChange={v=>set('clientIndustry',v)} placeholder="e.g. Hair Salon" /></Field>
        </div>
      </Card>

      <Card style={{ marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>Audit Findings</p>
        <Field label="Their GBP Score (out of 10)"><Input value={f.auditScore} onChange={v=>set('auditScore',v)} placeholder="e.g. 3" /></Field>
        <Field label="Key Problems Found — one per line" hint="These appear as ❌ bullet points in the proposal — very powerful.">
          <Input value={f.painPoints} onChange={v=>set('painPoints',v)} multiline rows={4} placeholder={"No business description written\nOnly 2 photos uploaded\nNot responding to reviews\nNot in Google Map Pack"} />
        </Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <Field label="Top Competitor Name"><Input value={f.competitorName} onChange={v=>set('competitorName',v)} placeholder="e.g. Star Salon" /></Field>
          <Field label="Their Reviews"><Input value={f.competitorReviews} onChange={v=>set('competitorReviews',v)} placeholder="e.g. 143" /></Field>
          <Field label="Their Rating"><Input value={f.competitorRating} onChange={v=>set('competitorRating',v)} placeholder="e.g. 4.8" /></Field>
        </div>
      </Card>

      <Card style={{ marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:14 }}>Pricing ({cur} per month)</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <Field label="Starter Package"><Input value={f.starterPrice} onChange={v=>set('starterPrice',v)} placeholder="e.g. 50" /></Field>
          <Field label="Growth Package ★"><Input value={f.growthPrice} onChange={v=>set('growthPrice',v)} placeholder="e.g. 100" /></Field>
          <Field label="Premium Package"><Input value={f.premiumPrice} onChange={v=>set('premiumPrice',v)} placeholder="e.g. 150" /></Field>
        </div>
      </Card>

      <Card style={{ marginBottom:16 }}>
        <Field label="Personal Note (optional)" hint="A personal closing message referencing your specific conversation.">
          <Input value={f.customNote} onChange={v=>set('customNote',v)} multiline rows={3} placeholder="e.g. As discussed when we met on Tuesday, I believe the Growth package is the right fit for where Gloria's Hair Studio is right now..." />
        </Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Your Name"><Input value={f.yourName} onChange={v=>set('yourName',v)} /></Field>
          <Field label="Proposal Date"><Input type="date" value={f.proposalDate} onChange={v=>set('proposalDate',v)} /></Field>
        </div>
      </Card>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn onClick={()=>setGenerated(true)} disabled={!f.clientBusiness}>📄 Generate Proposal</Btn>
        {generated && <Btn variant="outline" onClick={()=>copyText(proposal,setCopied)}>{copied?'✅ Copied!':'📋 Copy Proposal'}</Btn>}
      </div>

      {generated && (
        <Card style={{ marginTop:20, background:T.dark }} className="animate-fadeIn">
          <pre style={{ color:'#E2E8F0', fontSize:11.5, lineHeight:1.8, margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:"'Courier New', monospace" }}>{proposal}</pre>
        </Card>
      )}
    </div>
  )
}

// ─── PITCH SCRIPT ─────────────────────────────────────────────────────────────
export function PitchScript() {
  const [f, setF] = useState({ name:'', type:'', city:'', score:'', competitor:'', competitorReviews:'', competitorRating:'' })
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)
  const set = (k,v) => setF(p=>({...p,[k]:v}))

  const script = `FRANKEV DIGITAL SERVICES
CLIENT PITCH SCRIPT — ${f.name||'[BUSINESS NAME]'}
${'═'.repeat(60)}
Tailored for: ${f.name||'[Business]'} | ${f.type||'[Type]'} | ${f.city||'[City]'}
Use as a guide — adapt naturally in conversation.
${'═'.repeat(60)}

STAGE 1 — THE OPENING (At the door — under 20 seconds)
${'─'.repeat(60)}
"Hi, good [morning/afternoon]. My name is Abiodun from
Frankev Digital Services. We help local ${f.type||'businesses'} here
in ${f.city||'the area'} get more customers through Google.

I took a quick look at your Google listing this morning and
noticed a few things that could be quietly costing you
customers. Would you have 5 minutes this week to take a
look together? Absolutely no obligation at all."

IF THEY SAY YES:
  "Perfect. When's a good time? I can come back or we
  can do it now if you have a moment."

IF THEY SAY "we're busy":
  "Of course — no problem. Could I leave my card and
  pop back on [day]?"

IF THEY SAY "not interested":
  "Completely understand. Can I ask — are you happy with
  how many customers are finding you on Google right now?"
  [Let them talk. Listen. Then respond to what they say.]

${'─'.repeat(60)}
STAGE 2 — THE REVEAL (Sit down with them)
${'─'.repeat(60)}
"So I ran a quick audit this morning on your Google profile.
You scored ${f.score||'__'} out of 10.
${f.competitor?`
Your top competitor — ${f.competitor} — has ${f.competitorReviews||'__'} reviews
at ${f.competitorRating||'__'}★ and is showing up in the top 3 results on
Google Maps every time someone searches for ${f.type||'your service'}
in ${f.city||'the area'}.

Every customer searching right now is calling them, not you.`:`
Right now, when someone searches for ${f.type||'your service'}
in ${f.city||'the area'}, your profile isn't giving Google enough
information to rank you in the top results.`}

The good news? This is completely fixable. And once it's
fixed, it works for you 24 hours a day, 7 days a week —
without you doing anything."

${'─'.repeat(60)}
STAGE 3 — THE OFFER
${'─'.repeat(60)}
"What we do at Frankev Digital is handle everything.

We set up your profile properly — write a professional
description, upload your photos, add all your services,
and manage it every month. Weekly posts, review responses,
and a monthly report so you can see exactly how many people
are finding you.

We have packages starting from [your starter price] a month.
No long contract. Just results.

Would that be worth exploring?"

${'─'.repeat(60)}
STAGE 4 — HANDLING OBJECTIONS
${'─'.repeat(60)}
"I already have a Google listing."
→ "Great — the question is whether it's fully optimised to
   rank above competitors. Yours scored ${f.score||'__'}/10 — there's
   real room to grow and get you more customers."

"I don't have time for this."
→ "That's exactly why we exist — you do nothing. We handle
   everything. It takes about 10 minutes of your time total."

"I can't afford it right now."
→ "I understand. Think of it this way — if one extra customer
   finds you through Google each month, does that cover the
   cost? For most businesses it more than does."

"I need to think about it."
→ "Of course. Can I send you the written proposal with exact
   numbers so you have everything in front of you?
   What's the best email for you?"

"I already do social media."
→ "Social media is great — but Google is different. People
   on Google are actively searching right now for what you
   offer. Social media is interruption; Google is intent."

${'─'.repeat(60)}
STAGE 5 — THE CLOSE
${'─'.repeat(60)}
"So which package feels right for where you are now —
Starter, Growth, or Premium?

I can get everything started within 24 hours of the
go-ahead from you."

[If they're not ready today:]
"No problem at all. I'll send over the proposal today
and follow up on [day] — does that work for you?"

[Always leave with a next action agreed — date to follow up,
email to send proposal to, or signed agreement.]

${'═'.repeat(60)}
REMEMBER:
You are not selling. You are showing them a problem
they didn't know they had, and offering to solve it.
Confidence comes from knowing their numbers before you walk in.
${'═'.repeat(60)}
Frankev Digital Services — frankevgloballtd@gmail.com
${'═'.repeat(60)}`

  return (
    <div>
      <SectionHeader icon="🎯" title="Pitch Script Generator" subtitle="Generate a tailored word-for-word sales script before any client visit." />
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Business Name" required><Input value={f.name} onChange={v=>set('name',v)} placeholder="e.g. Gloria's Hair Studio" /></Field>
          <Field label="Business Type / Industry"><Input value={f.type} onChange={v=>set('type',v)} placeholder="e.g. hair salons" /></Field>
          <Field label="City" required><Input value={f.city} onChange={v=>set('city',v)} placeholder="e.g. Manchester" /></Field>
          <Field label="Their GBP Score (from audit)"><Input value={f.score} onChange={v=>set('score',v)} placeholder="e.g. 3" /></Field>
          <Field label="Top Competitor Name"><Input value={f.competitor} onChange={v=>set('competitor',v)} placeholder="e.g. Star Salon" /></Field>
          <Field label="Competitor Reviews"><Input value={f.competitorReviews} onChange={v=>set('competitorReviews',v)} placeholder="e.g. 143" /></Field>
          <Field label="Competitor Rating"><Input value={f.competitorRating} onChange={v=>set('competitorRating',v)} placeholder="e.g. 4.8" /></Field>
        </div>
      </Card>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn onClick={()=>setGenerated(true)} disabled={!f.name||!f.city}>🎯 Generate Script</Btn>
        {generated && <Btn variant="outline" onClick={()=>copyText(script,setCopied)}>{copied?'✅ Copied!':'📋 Copy Script'}</Btn>}
      </div>
      {generated && (
        <Card style={{ marginTop:20, background:T.dark }} className="animate-fadeIn">
          <pre style={{ color:'#E2E8F0', fontSize:11.5, lineHeight:1.8, margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:"'Courier New', monospace" }}>{script}</pre>
        </Card>
      )}
    </div>
  )
}

export default ProposalBuilder
