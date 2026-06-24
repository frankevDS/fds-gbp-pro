// ─── SETUP BLUEPRINT ──────────────────────────────────────────────────────────
import { useState } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, Checkbox, copyText, DAYS, INDUSTRIES } from '../components/ui.jsx'

export function SetupBlueprint() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    businessName:'', businessType:'', industry:'', primaryCategory:'', additionalCategories:'', openingDate:'',
    locationType:'', address:'', city:'', stateRegion:'', country:'', postalCode:'', hideAddress:false, serviceAreas:'',
    phone:'', altPhone:'', website:'', bookingUrl:'', socialFacebook:'', socialInstagram:'',
    hoursType:'', hours:Object.fromEntries(DAYS.map(d=>[d,{open:'09:00',close:'17:00',closed:d==='Sunday'}])), specialHours:'',
    servicesOffered:'', productsOffered:'', priceRange:'', bookingAvailable:'',
    businessDescription:'', uniqueSellingPoints:'', targetCustomers:'', foundingStory:'', awardsAccreditations:'', languages:'English',
    attributes:{womenOwned:false,blackOwned:false,veteranOwned:false,lgbtqFriendly:false,wheelchairAccessible:false,freeParking:false,freeWifi:false,outdoorSeating:false,kidsWelcome:false,petFriendly:false,appointmentsRequired:false,walkinWelcome:false,onlineAppointments:false,deliveryAvailable:false,takeawayAvailable:false},
    hasLogo:'',hasCoverPhoto:'',hasStorefront:'',hasInterior:'',hasTeamPhotos:'',hasWorkPhotos:'',imageBrandColor:'',imageStyle:'',
  })
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const setHour = (day,field,val) => setForm(p=>({...p,hours:{...p.hours,[day]:{...p.hours[day],[field]:val}}}))
  const setAttr = (k,v) => setForm(p=>({...p,attributes:{...p.attributes,[k]:v}}))

  const STEPS = ['Business Identity','Location','Contact','Hours','Services','Description','Attributes','Images']

  const blueprint = `FRANKEV DIGITAL SERVICES\nGOOGLE BUSINESS PROFILE SETUP BLUEPRINT\n${'═'.repeat(60)}\nBusiness : ${form.businessName||'—'}\nIndustry : ${form.industry||'—'}\nLocation : ${form.city||'—'}, ${form.country||'—'}\nDate     : ${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}\n${'═'.repeat(60)}\n\nSECTION 1 — BUSINESS IDENTITY\n${'─'.repeat(60)}\nBusiness Name       : ${form.businessName}\n  ⚠ Exact legal name. No keywords. No location. No slogans.\nBusiness Type       : ${form.businessType}\nIndustry            : ${form.industry}\nPrimary Category    : ${form.primaryCategory}\n  ⚠ Most important ranking factor. Must be the most specific option.\nAdditional Categories: ${form.additionalCategories||'Not set'}\nOpening Date        : ${form.openingDate||'Not set'}\n\nSECTION 2 — LOCATION & SERVICE AREA\n${'─'.repeat(60)}\nLocation Type       : ${form.locationType}\nStreet Address      : ${form.address||'—'}\nCity                : ${form.city||'—'}\nState / Region      : ${form.stateRegion||'—'}\nCountry             : ${form.country||'—'}\nPostal Code         : ${form.postalCode||'—'}\nHide Address        : ${form.hideAddress?'YES':'NO'}\nService Areas:\n${form.serviceAreas?form.serviceAreas.split('\n').map(s=>`  • ${s}`).join('\n'):'  Not applicable'}\n\nSECTION 3 — CONTACT INFORMATION\n${'─'.repeat(60)}\nPrimary Phone       : ${form.phone||'—'}\nAdditional Phone    : ${form.altPhone||'—'}\nWebsite URL         : ${form.website||'—'}\nBooking URL         : ${form.bookingUrl||'—'}\nFacebook            : ${form.socialFacebook||'—'}\nInstagram           : ${form.socialInstagram||'—'}\n  ⚠ NAP must be IDENTICAL across all platforms.\n\nSECTION 4 — BUSINESS HOURS\n${'─'.repeat(60)}\n${DAYS.map(d=>`${d.padEnd(12)}: ${form.hours[d].closed?'CLOSED':`${form.hours[d].open} – ${form.hours[d].close}`}`).join('\n')}\nSpecial Hours: ${form.specialHours||'Update before public holidays.'}\n\nSECTION 5 — SERVICES & PRODUCTS\n${'─'.repeat(60)}\nServices:\n${form.servicesOffered?form.servicesOffered.split('\n').map(s=>`  • ${s}`).join('\n'):'  [Not set]'}\nProducts:\n${form.productsOffered?form.productsOffered.split('\n').map(s=>`  • ${s}`).join('\n'):'  [Not applicable]'}\nPrice Range         : ${form.priceRange||'Not set'}\nBooking Policy      : ${form.bookingAvailable||'Not set'}\n\nSECTION 6 — BUSINESS DESCRIPTION (${form.businessDescription.length}/750)\n${'─'.repeat(60)}\n${form.businessDescription||'[Not written]'}\n\nUnique Selling Points:\n${form.uniqueSellingPoints||'[Not set]'}\nTarget Customers    : ${form.targetCustomers||'[Not set]'}\nFounding Story      : ${form.foundingStory||'[Not set]'}\nAwards              : ${form.awardsAccreditations||'None listed'}\nLanguages           : ${form.languages}\n\nSECTION 7 — ATTRIBUTES\n${'─'.repeat(60)}\n${Object.entries(form.attributes).filter(([,v])=>v).map(([k])=>({womenOwned:'Women-owned',blackOwned:'Black-owned',veteranOwned:'Veteran-owned',lgbtqFriendly:'LGBTQ+ friendly',wheelchairAccessible:'Wheelchair accessible',freeParking:'Free parking',freeWifi:'Free Wi-Fi',outdoorSeating:'Outdoor seating',kidsWelcome:'Kids welcome',petFriendly:'Pet-friendly',appointmentsRequired:'Appointments required',walkinWelcome:'Walk-ins welcome',onlineAppointments:'Online appointments',deliveryAvailable:'Delivery available',takeawayAvailable:'Takeaway/Collection'}[k]||k)).map(a=>`  ✔ ${a}`).join('\n')||'  No attributes selected'}\n\nSECTION 8 — VERIFICATION CHECKLIST\n${'─'.repeat(60)}\n□ Business name matches signage & website exactly\n□ Address matches website Contact page exactly\n□ Phone matches website header/footer exactly\n□ Website is live and mobile-friendly\n□ Choose: Phone/SMS → Email → Video → Postcard\n\nSECTION 9 — IMAGE BRIEF\n${'─'.repeat(60)}\nBrand Colour  : ${form.imageBrandColor||'Not specified'}\nVisual Style  : ${form.imageStyle||'Not specified'}\nLogo          : ${form.hasLogo==='yes'?'✅ Ready':'❌ Needs creating'}\nCover Photo   : ${form.hasCoverPhoto==='yes'?'✅ Ready':'❌ Needs creating — 1332×750px'}\nStorefront    : ${form.hasStorefront==='yes'?'✅ Ready':'❌ Needs creating'}\nInterior      : ${form.hasInterior==='yes'?'✅ Ready':'❌ Needs creating'}\nTeam Photos   : ${form.hasTeamPhotos==='yes'?'✅ Ready':'❌ Needs creating'}\nPortfolio     : ${form.hasWorkPhotos==='yes'?'✅ Ready':'❌ Needs creating'}\n\nIMAGE PROMPTS:\nLogo    : "Professional logo for ${form.businessName}, ${form.industry} business. ${form.imageStyle||'Clean and professional'}. Brand colour: ${form.imageBrandColor||'[brand colour]'}. Square, white background."\nCover   : "High quality 16:9 cover photo for ${form.businessName}. ${form.industry} in ${form.city||'[city]'}. ${form.imageStyle||'Professional'}. Natural lighting."\nTeam    : "Professional team photos for ${form.businessName}. Staff in uniform. Friendly, approachable. ${form.industry} environment."\n\nSECTION 10 — SEO KEYWORDS\n${'─'.repeat(60)}\n• ${form.industry} in ${form.city||'[city]'}\n• Best ${form.industry} in ${form.city||'[city]'}\n• ${form.industry} near me\n• Affordable ${form.industry} ${form.city||'[city]'}\n• ${form.primaryCategory} ${form.city||'[city]'} reviews\n\nApply in: Description • Services • Q&As • Google Posts • Review responses\n\nSECTION 11 — POST-SETUP ACTIONS\n${'─'.repeat(60)}\n□ Enable Google Messaging\n□ Publish first Google Post\n□ Seed 5 Q&As with keyword-rich answers\n□ Request reviews from first 5–10 customers\n□ Respond to every review within 24 hours\n□ Upload all photos from Section 9\n□ Connect booking URL\n\nSECTION 12 — NAP AUDIT\n${'─'.repeat(60)}\nName    : ${form.businessName||'—'}\nAddress : ${[form.address,form.city,form.postalCode,form.country].filter(Boolean).join(', ')||'—'}\nPhone   : ${form.phone||'—'}\nWebsite : ${form.website||'—'}\nCheck: Website • Facebook • Instagram • Apple Maps • Bing\n${'═'.repeat(60)}\nPrepared by Frankev Digital Services — frankevgloballtd@gmail.com\n${'═'.repeat(60)}`

  const stepContent = () => {
    const g2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }
    if (step===1) return <>
      <Field label="Business Name" required hint="Exact legal name. No keywords."><Input value={form.businessName} onChange={v=>set('businessName',v)} placeholder="e.g. Bright Star Electrical Ltd" /></Field>
      <div style={g2}>
        <Field label="Business Type" required><Select value={form.businessType} onChange={v=>set('businessType',v)} options={['Physical storefront','Service-area business','Hybrid','Online only']} placeholder="Select..." /></Field>
        <Field label="Industry" required><Select value={form.industry} onChange={v=>set('industry',v)} options={INDUSTRIES} placeholder="Select industry..." /></Field>
      </div>
      <Field label="Primary Google Category" required hint="Most specific category available."><Input value={form.primaryCategory} onChange={v=>set('primaryCategory',v)} placeholder="e.g. Electrician" /></Field>
      <Field label="Additional Categories"><Input value={form.additionalCategories} onChange={v=>set('additionalCategories',v)} placeholder="e.g. Emergency Electrician, EV Charger Installer" /></Field>
      <Field label="Opening Date"><Input value={form.openingDate} onChange={v=>set('openingDate',v)} placeholder="e.g. March 2019" /></Field>
    </>
    if (step===2) return <>
      <Field label="Location Type" required><Select value={form.locationType} onChange={v=>set('locationType',v)} options={['Physical storefront — address shown','Service-area — no storefront','Hybrid']} placeholder="Select..." /></Field>
      <div style={g2}>
        <Field label="Street Address"><Input value={form.address} onChange={v=>set('address',v)} placeholder="e.g. 14 High Street" /></Field>
        <Field label="City" required><Input value={form.city} onChange={v=>set('city',v)} placeholder="e.g. Manchester" /></Field>
        <Field label="State / Region"><Input value={form.stateRegion} onChange={v=>set('stateRegion',v)} placeholder="e.g. Greater Manchester" /></Field>
        <Field label="Country"><Input value={form.country} onChange={v=>set('country',v)} placeholder="e.g. United Kingdom" /></Field>
        <Field label="Postal Code"><Input value={form.postalCode} onChange={v=>set('postalCode',v)} placeholder="e.g. M1 1AA" /></Field>
      </div>
      <Checkbox label="Hide address (service-area businesses)" checked={form.hideAddress} onChange={v=>set('hideAddress',v)} />
      <Field label="Service Areas (one per line)"><Input value={form.serviceAreas} onChange={v=>set('serviceAreas',v)} multiline rows={4} placeholder={"Manchester\nSalford\nTrafford"} /></Field>
    </>
    if (step===3) return <>
      <div style={g2}>
        <Field label="Primary Phone" required><Input value={form.phone} onChange={v=>set('phone',v)} placeholder="+44 161 234 5678" /></Field>
        <Field label="WhatsApp / Alt Number"><Input value={form.altPhone} onChange={v=>set('altPhone',v)} placeholder="+44 7700 900123" /></Field>
        <Field label="Website URL" required><Input value={form.website} onChange={v=>set('website',v)} placeholder="https://www.yourbusiness.co.uk" /></Field>
        <Field label="Booking URL"><Input value={form.bookingUrl} onChange={v=>set('bookingUrl',v)} placeholder="https://calendly.com/..." /></Field>
        <Field label="Facebook URL"><Input value={form.socialFacebook} onChange={v=>set('socialFacebook',v)} placeholder="https://facebook.com/..." /></Field>
        <Field label="Instagram URL"><Input value={form.socialInstagram} onChange={v=>set('socialInstagram',v)} placeholder="https://instagram.com/..." /></Field>
      </div>
    </>
    if (step===4) return <>
      <Field label="Hours Type"><Select value={form.hoursType} onChange={v=>set('hoursType',v)} options={['Fixed hours','Varies by day','By appointment only','24/7 open']} placeholder="Select..." /></Field>
      <div style={{ background:T.grayLight, borderRadius:10, padding:16, marginBottom:14 }}>
        {DAYS.map(day=>(
          <div key={day} style={{ display:'grid', gridTemplateColumns:'100px 1fr 1fr 100px', gap:8, alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:600, color:T.dark }}>{day}</span>
            <input type="time" value={form.hours[day].open} onChange={e=>setHour(day,'open',e.target.value)} disabled={form.hours[day].closed} style={{ padding:'8px 10px', border:`1.5px solid ${T.grayBorder}`, borderRadius:7, fontSize:13, fontFamily:'inherit', background:form.hours[day].closed?'#eee':T.white }} />
            <input type="time" value={form.hours[day].close} onChange={e=>setHour(day,'close',e.target.value)} disabled={form.hours[day].closed} style={{ padding:'8px 10px', border:`1.5px solid ${T.grayBorder}`, borderRadius:7, fontSize:13, fontFamily:'inherit', background:form.hours[day].closed?'#eee':T.white }} />
            <Checkbox label="Closed" checked={form.hours[day].closed} onChange={v=>setHour(day,'closed',v)} />
          </div>
        ))}
      </div>
      <Field label="Special / Holiday Hours"><Input value={form.specialHours} onChange={v=>set('specialHours',v)} multiline rows={2} placeholder="e.g. Closed bank holidays. Extended Dec 1–24." /></Field>
    </>
    if (step===5) return <>
      <Field label="Services (one per line)" required><Input value={form.servicesOffered} onChange={v=>set('servicesOffered',v)} multiline rows={5} placeholder={"Haircut & Blow-dry — from £35\nColour & Highlights — from £75"} /></Field>
      <Field label="Products (if applicable)"><Input value={form.productsOffered} onChange={v=>set('productsOffered',v)} multiline rows={3} placeholder="Product name — £price" /></Field>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="Price Range"><Select value={form.priceRange} onChange={v=>set('priceRange',v)} options={['$ — Budget','$$ — Moderate','$$$ — Premium','$$$$ — Luxury']} placeholder="Select..." /></Field>
        <Field label="Booking Policy"><Select value={form.bookingAvailable} onChange={v=>set('bookingAvailable',v)} options={['Appointments required','Walk-ins welcome','Both','Online booking','Not applicable']} placeholder="Select..." /></Field>
      </div>
    </>
    if (step===6) return <>
      <Field label="Business Description (max 750 chars)" required hint="No links, no prices. Human, warm, keyword-rich.">
        <Input value={form.businessDescription} onChange={v=>set('businessDescription',v.slice(0,750))} multiline rows={5} placeholder="Describe what you do, who you serve, what makes you different..." />
        <p style={{ fontSize:11, color:form.businessDescription.length>700?T.danger:T.textLight, textAlign:'right', margin:'4px 0 0' }}>{form.businessDescription.length}/750</p>
      </Field>
      <Field label="Unique Selling Points" required><Input value={form.uniqueSellingPoints} onChange={v=>set('uniqueSellingPoints',v)} multiline rows={2} placeholder="What genuinely makes this business different?" /></Field>
      <Field label="Target Customers" required><Input value={form.targetCustomers} onChange={v=>set('targetCustomers',v)} multiline rows={2} placeholder="Who is the ideal customer?" /></Field>
      <Field label="Founding Story"><Input value={form.foundingStory} onChange={v=>set('foundingStory',v)} multiline rows={2} placeholder="Why was this business started?" /></Field>
      <Field label="Awards & Certifications"><Input value={form.awardsAccreditations} onChange={v=>set('awardsAccreditations',v)} placeholder="e.g. NICEIC Approved, Which? Trusted Trader" /></Field>
      <Field label="Languages Spoken"><Input value={form.languages} onChange={v=>set('languages',v)} placeholder="e.g. English, Yoruba, French" /></Field>
    </>
    if (step===7) return <>
      {[['🏷️ Identity',[['womenOwned','Women-owned'],['blackOwned','Black-owned'],['veteranOwned','Veteran-owned'],['lgbtqFriendly','LGBTQ+ friendly']]],['♿ Access',[['wheelchairAccessible','Wheelchair accessible'],['freeParking','Free parking'],['freeWifi','Free Wi-Fi']]],['☕ Amenities',[['outdoorSeating','Outdoor seating'],['kidsWelcome','Kids welcome'],['petFriendly','Pet-friendly']]],['📅 Service',[['appointmentsRequired','Appointments required'],['walkinWelcome','Walk-ins welcome'],['onlineAppointments','Online appointments'],['deliveryAvailable','Delivery available'],['takeawayAvailable','Takeaway/Collection']]]].map(([heading,attrs])=>(
        <div key={heading} style={{ marginBottom:16 }}>
          <p style={{ fontWeight:700, fontSize:13, color:T.dark, marginBottom:8 }}>{heading}</p>
          {attrs.map(([k,label])=><Checkbox key={k} label={label} checked={form.attributes[k]} onChange={v=>setAttr(k,v)} />)}
        </div>
      ))}
    </>
    if (step===8) return <>
      {[['hasLogo','Logo'],['hasCoverPhoto','Cover Photo (1332×750px)'],['hasStorefront','Exterior / Storefront'],['hasInterior','Interior Photos'],['hasTeamPhotos','Team / Staff Photos'],['hasWorkPhotos','Before & After / Portfolio']].map(([key,label])=>(
        <Field key={key} label={label}><Select value={form[key]} onChange={v=>set(key,v)} options={[{value:'yes',label:'✅ Ready'},{value:'no',label:'❌ Need to create'},{value:'partial',label:'⚠️ Partial'}]} placeholder="Select status..." /></Field>
      ))}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="Brand Colour"><Input value={form.imageBrandColor} onChange={v=>set('imageBrandColor',v)} placeholder="e.g. #1B4FD8 Royal Blue" /></Field>
        <Field label="Image Style"><Select value={form.imageStyle} onChange={v=>set('imageStyle',v)} options={['Professional and corporate','Warm and friendly','Modern and minimalist','Bold and energetic','Luxury and premium','Natural and authentic']} placeholder="Select..." /></Field>
      </div>
    </>
  }

  return (
    <div>
      <SectionHeader icon="📋" title="GBP Setup Blueprint" subtitle="Fill in 8 sections for any client and generate the complete setup document." />
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
        {STEPS.map((s,i)=>(
          <button key={i} onClick={()=>setStep(i+1)} style={{ padding:'6px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'inherit', background:step===i+1?T.blue:step>i+1?T.successLight:T.grayLight, color:step===i+1?T.white:step>i+1?T.success:T.textLight }}>
            {step>i+1?'✓ ':''}{s}
          </button>
        ))}
      </div>
      <Card style={{ marginBottom:20 }}>
        <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:800, color:T.dark }}>{STEPS[step-1]}</h3>
        {stepContent()}
      </Card>
      <div style={{ display:'flex', gap:10, justifyContent:'space-between' }}>
        <Btn variant="secondary" onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1}>← Back</Btn>
        <div style={{ display:'flex', gap:10 }}>
          {step<8 && <Btn onClick={()=>setStep(s=>s+1)}>Continue →</Btn>}
          {step===8 && <Btn variant="success" onClick={()=>setGenerated(true)}>🚀 Generate Blueprint</Btn>}
          {generated && <Btn variant="outline" onClick={()=>copyText(blueprint,setCopied)}>{copied?'✅ Copied!':'📋 Copy'}</Btn>}
        </div>
      </div>
      {generated && (
        <Card style={{ marginTop:20, background:T.dark }} className="animate-fadeIn">
          <pre style={{ color:'#E2E8F0', fontSize:11.5, lineHeight:1.8, margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:"'Courier New', monospace" }}>{blueprint}</pre>
        </Card>
      )}
    </div>
  )
}

export default SetupBlueprint
