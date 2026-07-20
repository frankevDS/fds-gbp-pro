import { useState } from 'react'
import { T, Btn, Card, Input, Select, Field, SectionHeader, Checkbox, copyText, DAYS, INDUSTRIES } from '../components/ui.jsx'

export default function SetupBlueprint() {
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [form, setForm] = useState({
    businessName:'', businessType:'', industry:'', primaryCategory:'', additionalCategories:'', openingDate:'',
    locationType:'', address:'', city:'', stateRegion:'', country:'', postalCode:'', hideAddress:false, serviceAreas:'',
    phone:'', altPhone:'', website:'', bookingUrl:'', socialFacebook:'', socialInstagram:'',
    hoursType:'',
    hours:Object.fromEntries(DAYS.map(d=>[d,{open:'09:00',close:'17:00',closed:d==='Sunday'}])),
    specialHours:'', servicesOffered:'', productsOffered:'', priceRange:'', bookingAvailable:'',
    businessDescription:'', uniqueSellingPoints:'', targetCustomers:'', foundingStory:'', awardsAccreditations:'', languages:'English',
    attributes:{womenOwned:false,blackOwned:false,veteranOwned:false,lgbtqFriendly:false,wheelchairAccessible:false,freeParking:false,freeWifi:false,outdoorSeating:false,kidsWelcome:false,petFriendly:false,appointmentsRequired:false,walkinWelcome:false,onlineAppointments:false,deliveryAvailable:false,takeawayAvailable:false},
    hasLogo:'',hasCoverPhoto:'',hasStorefront:'',hasInterior:'',hasTeamPhotos:'',hasWorkPhotos:'',imageBrandColor:'',imageStyle:'',
  })
  const set=(k,v)=>setForm(p=>({...p,[k]:v}))
  const setHour=(day,field,val)=>setForm(p=>({...p,hours:{...p.hours,[day]:{...p.hours[day],[field]:val}}}))
  const setAttr=(k,v)=>setForm(p=>({...p,attributes:{...p.attributes,[k]:v}}))
  const STEPS=['Business Identity','Location','Contact','Hours','Services','Description','Attributes','Images']

  const blueprint = `FRANKEV DIGITAL SERVICES
GBP SETUP BLUEPRINT
${'═'.repeat(60)}
Business : ${form.businessName||'—'}
Industry : ${form.industry||'—'}
Location : ${form.city||'—'}, ${form.country||'—'}
Date     : ${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}
${'═'.repeat(60)}

SECTION 1 — BUSINESS IDENTITY
Business Name       : ${form.businessName} ⚠ Must match signage exactly. No keywords.
Business Type       : ${form.businessType}
Industry            : ${form.industry}
Primary Category    : ${form.primaryCategory}
Additional Categories: ${form.additionalCategories||'Not set'}
Opening Date        : ${form.openingDate||'Not set'}

SECTION 2 — LOCATION
Location Type       : ${form.locationType}
Address             : ${form.address||'—'}
City                : ${form.city||'—'}
State/Region        : ${form.stateRegion||'—'}
Country             : ${form.country||'—'}
Postal Code         : ${form.postalCode||'—'}
Hide Address        : ${form.hideAddress?'YES':'NO'}
Service Areas       : ${form.serviceAreas||'Not applicable'}

SECTION 3 — CONTACT
Primary Phone       : ${form.phone||'—'}
Alt Phone           : ${form.altPhone||'—'}
Website             : ${form.website||'—'}
Booking URL         : ${form.bookingUrl||'—'}
Facebook            : ${form.socialFacebook||'—'}
Instagram           : ${form.socialInstagram||'—'}

SECTION 4 — HOURS
${DAYS.map(d=>`${d.padEnd(12)}: ${form.hours[d].closed?'CLOSED':`${form.hours[d].open} – ${form.hours[d].close}`}`).join('\n')}
Special Hours : ${form.specialHours||'Update before holidays'}

SECTION 5 — SERVICES
${form.servicesOffered?form.servicesOffered.split('\n').map(s=>`  • ${s}`).join('\n'):'  [Not set]'}

Products:
${form.productsOffered?form.productsOffered.split('\n').map(s=>`  • ${s}`).join('\n'):'  [Not applicable]'}
Price Range : ${form.priceRange||'Not set'}
Booking     : ${form.bookingAvailable||'Not set'}

SECTION 6 — DESCRIPTION (${form.businessDescription.length}/750)
${form.businessDescription||'[Not written]'}

USPs: ${form.uniqueSellingPoints||'[Not set]'}
Target Customers: ${form.targetCustomers||'[Not set]'}
Founding Story: ${form.foundingStory||'[Not set]'}
Awards: ${form.awardsAccreditations||'None'}
Languages: ${form.languages}

SECTION 7 — ATTRIBUTES
${Object.entries(form.attributes).filter(([,v])=>v).map(([k])=>({womenOwned:'Women-owned',blackOwned:'Black-owned',veteranOwned:'Veteran-owned',lgbtqFriendly:'LGBTQ+ friendly',wheelchairAccessible:'Wheelchair accessible',freeParking:'Free parking',freeWifi:'Free Wi-Fi',outdoorSeating:'Outdoor seating',kidsWelcome:'Kids welcome',petFriendly:'Pet-friendly',appointmentsRequired:'Appointments required',walkinWelcome:'Walk-ins welcome',onlineAppointments:'Online appointments',deliveryAvailable:'Delivery available',takeawayAvailable:'Takeaway/Collection'}[k]||k)).map(a=>`  ✔ ${a}`).join('\n')||'  None selected'}

SECTION 8 — IMAGES
Brand Colour : ${form.imageBrandColor||'Not specified'}
Style        : ${form.imageStyle||'Not specified'}
Logo         : ${form.hasLogo==='yes'?'✅ Ready':'❌ Needed'}
Cover Photo  : ${form.hasCoverPhoto==='yes'?'✅ Ready':'❌ Needed — 1332×750px'}
Storefront   : ${form.hasStorefront==='yes'?'✅ Ready':'❌ Needed'}
Interior     : ${form.hasInterior==='yes'?'✅ Ready':'❌ Needed'}
Team Photos  : ${form.hasTeamPhotos==='yes'?'✅ Ready':'❌ Needed'}
Portfolio    : ${form.hasWorkPhotos==='yes'?'✅ Ready':'❌ Needed'}

SECTION 9 — POST-SETUP ACTIONS
□ Enable Google Messaging
□ Publish first Google Post
□ Seed 5-10 Q&As
□ Request reviews from first 5-10 customers
□ Respond to every review within 24 hours
□ Upload all images listed above

SECTION 10 — NAP CONSISTENCY
Name    : ${form.businessName||'—'}
Address : ${[form.address,form.city,form.postalCode,form.country].filter(Boolean).join(', ')||'—'}
Phone   : ${form.phone||'—'}
Website : ${form.website||'—'}
Check: Website • Facebook • Instagram • Apple Maps • Bing
${'═'.repeat(60)}
Prepared by Frankev Digital Services
frankevgloballtd@gmail.com | gbp.frankevdigitalservices.com`

  const stepContent = () => {
    const g2={display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}
    if(step===1) return <>
      <Field label="Business Name" required hint="Exact legal name. No keywords."><Input value={form.businessName} onChange={v=>set('businessName',v)} placeholder="e.g. Bright Star Electrical Ltd"/></Field>
      <div style={g2}>
        <Field label="Business Type" required><Select value={form.businessType} onChange={v=>set('businessType',v)} options={['Physical storefront','Service-area business','Hybrid','Online only']} placeholder="Select..."/></Field>
        <Field label="Industry" required><Select value={form.industry} onChange={v=>set('industry',v)} options={INDUSTRIES} placeholder="Select industry..."/></Field>
      </div>
      <Field label="Primary Google Category" required><Input value={form.primaryCategory} onChange={v=>set('primaryCategory',v)} placeholder="e.g. Electrician"/></Field>
      <Field label="Additional Categories"><Input value={form.additionalCategories} onChange={v=>set('additionalCategories',v)} placeholder="e.g. Emergency Electrician, EV Charger Installer"/></Field>
      <Field label="Opening Date"><Input value={form.openingDate} onChange={v=>set('openingDate',v)} placeholder="e.g. March 2019"/></Field>
    </>
    if(step===2) return <>
      <Field label="Location Type" required><Select value={form.locationType} onChange={v=>set('locationType',v)} options={['Physical storefront — address shown','Service-area — no storefront','Hybrid']} placeholder="Select..."/></Field>
      <div style={g2}>
        <Field label="Street Address"><Input value={form.address} onChange={v=>set('address',v)} placeholder="e.g. 14 High Street"/></Field>
        <Field label="City" required><Input value={form.city} onChange={v=>set('city',v)} placeholder="e.g. Accra"/></Field>
        <Field label="State/Region"><Input value={form.stateRegion} onChange={v=>set('stateRegion',v)} placeholder="e.g. Greater Accra"/></Field>
        <Field label="Country"><Input value={form.country} onChange={v=>set('country',v)} placeholder="e.g. Ghana"/></Field>
        <Field label="Postal Code"><Input value={form.postalCode} onChange={v=>set('postalCode',v)} placeholder="e.g. GA-123"/></Field>
      </div>
      <Checkbox label="Hide address from public" checked={form.hideAddress} onChange={v=>set('hideAddress',v)}/>
      <Field label="Service Areas"><Input value={form.serviceAreas} onChange={v=>set('serviceAreas',v)} multiline rows={3} placeholder={"Accra\nTema\nKumasi"}/></Field>
    </>
    if(step===3) return <>
      <div style={g2}>
        <Field label="Primary Phone" required><Input value={form.phone} onChange={v=>set('phone',v)} placeholder="+233 XX XXX XXXX"/></Field>
        <Field label="Alt/WhatsApp"><Input value={form.altPhone} onChange={v=>set('altPhone',v)} placeholder="+233 XX XXX XXXX"/></Field>
        <Field label="Website" required><Input value={form.website} onChange={v=>set('website',v)} placeholder="https://www.yourbusiness.com"/></Field>
        <Field label="Booking URL"><Input value={form.bookingUrl} onChange={v=>set('bookingUrl',v)} placeholder="https://calendly.com/..."/></Field>
        <Field label="Facebook"><Input value={form.socialFacebook} onChange={v=>set('socialFacebook',v)} placeholder="https://facebook.com/..."/></Field>
        <Field label="Instagram"><Input value={form.socialInstagram} onChange={v=>set('socialInstagram',v)} placeholder="https://instagram.com/..."/></Field>
      </div>
    </>
    if(step===4) return <>
      <Field label="Hours Type"><Select value={form.hoursType} onChange={v=>set('hoursType',v)} options={['Fixed hours','Varies by day','By appointment only','24/7 open']} placeholder="Select..."/></Field>
      <div style={{background:T.grayLight,borderRadius:10,padding:16,marginBottom:14}}>
        {DAYS.map(day=>(
          <div key={day} style={{display:'grid',gridTemplateColumns:'100px 1fr 1fr 100px',gap:8,alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600,color:T.dark}}>{day}</span>
            <input type="time" value={form.hours[day].open} onChange={e=>setHour(day,'open',e.target.value)} disabled={form.hours[day].closed} style={{padding:'8px 10px',border:`1.5px solid ${T.grayBorder}`,borderRadius:7,fontSize:13,fontFamily:'inherit',background:form.hours[day].closed?'#eee':T.white}}/>
            <input type="time" value={form.hours[day].close} onChange={e=>setHour(day,'close',e.target.value)} disabled={form.hours[day].closed} style={{padding:'8px 10px',border:`1.5px solid ${T.grayBorder}`,borderRadius:7,fontSize:13,fontFamily:'inherit',background:form.hours[day].closed?'#eee':T.white}}/>
            <Checkbox label="Closed" checked={form.hours[day].closed} onChange={v=>setHour(day,'closed',v)}/>
          </div>
        ))}
      </div>
      <Field label="Special/Holiday Hours"><Input value={form.specialHours} onChange={v=>set('specialHours',v)} multiline rows={2} placeholder="e.g. Closed public holidays. Extended hours Dec 1-24."/></Field>
    </>
    if(step===5) return <>
      <Field label="Services" required><Input value={form.servicesOffered} onChange={v=>set('servicesOffered',v)} multiline rows={5} placeholder={"Haircut & Blow-dry — from ₵35\nColour & Highlights — from ₵75"}/></Field>
      <Field label="Products"><Input value={form.productsOffered} onChange={v=>set('productsOffered',v)} multiline rows={3} placeholder="Product name — ₵price"/></Field>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field label="Price Range"><Select value={form.priceRange} onChange={v=>set('priceRange',v)} options={['$ — Budget','$$ — Moderate','$$$ — Premium','$$$$ — Luxury']} placeholder="Select..."/></Field>
        <Field label="Booking Policy"><Select value={form.bookingAvailable} onChange={v=>set('bookingAvailable',v)} options={['Appointments required','Walk-ins welcome','Both','Online booking','Not applicable']} placeholder="Select..."/></Field>
      </div>
    </>
    if(step===6) return <>
      <Field label="Business Description" required hint="Max 750 chars. No links. No prices.">
        <Input value={form.businessDescription} onChange={v=>set('businessDescription',v.slice(0,750))} multiline rows={5} placeholder="Describe what you do, who you serve, what makes you different..."/>
        <p style={{fontSize:11,color:form.businessDescription.length>700?T.danger:T.textLight,textAlign:'right',margin:'4px 0 0'}}>{form.businessDescription.length}/750</p>
      </Field>
      <Field label="Unique Selling Points" required><Input value={form.uniqueSellingPoints} onChange={v=>set('uniqueSellingPoints',v)} multiline rows={2} placeholder="What genuinely makes this business different?"/></Field>
      <Field label="Target Customers" required><Input value={form.targetCustomers} onChange={v=>set('targetCustomers',v)} multiline rows={2} placeholder="Who is the ideal customer?"/></Field>
      <Field label="Founding Story"><Input value={form.foundingStory} onChange={v=>set('foundingStory',v)} multiline rows={2} placeholder="Why was this business started?"/></Field>
      <Field label="Awards & Certifications"><Input value={form.awardsAccreditations} onChange={v=>set('awardsAccreditations',v)} placeholder="e.g. Top Rated on Google"/></Field>
      <Field label="Languages Spoken"><Input value={form.languages} onChange={v=>set('languages',v)} placeholder="e.g. English, Twi, Yoruba"/></Field>
    </>
    if(step===7) return <>
      {[['🏷️ Identity',[['womenOwned','Women-owned'],['blackOwned','Black-owned'],['veteranOwned','Veteran-owned'],['lgbtqFriendly','LGBTQ+ friendly']]],['♿ Access',[['wheelchairAccessible','Wheelchair accessible'],['freeParking','Free parking'],['freeWifi','Free Wi-Fi']]],['☕ Amenities',[['outdoorSeating','Outdoor seating'],['kidsWelcome','Kids welcome'],['petFriendly','Pet-friendly']]],['📅 Service',[['appointmentsRequired','Appointments required'],['walkinWelcome','Walk-ins welcome'],['onlineAppointments','Online appointments'],['deliveryAvailable','Delivery available'],['takeawayAvailable','Takeaway/Collection']]]].map(([h,attrs])=>(
        <div key={h} style={{marginBottom:16}}>
          <p style={{fontWeight:700,fontSize:13,color:T.dark,marginBottom:8}}>{h}</p>
          {attrs.map(([k,label])=><Checkbox key={k} label={label} checked={form.attributes[k]} onChange={v=>setAttr(k,v)}/>)}
        </div>
      ))}
    </>
    if(step===8) return <>
      {[['hasLogo','Logo'],['hasCoverPhoto','Cover Photo (1332×750px)'],['hasStorefront','Exterior / Storefront'],['hasInterior','Interior Photos'],['hasTeamPhotos','Team / Staff Photos'],['hasWorkPhotos','Before & After / Portfolio']].map(([key,label])=>(
        <Field key={key} label={label}><Select value={form[key]} onChange={v=>set(key,v)} options={[{value:'yes',label:'✅ Ready'},{value:'no',label:'❌ Needed'},{value:'partial',label:'⚠️ Partial'}]} placeholder="Select status..."/></Field>
      ))}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field label="Brand Colour"><Input value={form.imageBrandColor} onChange={v=>set('imageBrandColor',v)} placeholder="e.g. #1B4FD8 Royal Blue"/></Field>
        <Field label="Image Style"><Select value={form.imageStyle} onChange={v=>set('imageStyle',v)} options={['Professional and corporate','Warm and friendly','Modern and minimalist','Bold and energetic','Luxury and premium','Natural and authentic']} placeholder="Select..."/></Field>
      </div>
    </>
  }

  return (
    <div>
      <SectionHeader icon="📋" title="GBP Setup Blueprint" subtitle="Fill in 8 sections for any client. Generate the complete setup document."/>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
        {STEPS.map((s,i)=>(
          <button key={i} onClick={()=>setStep(i+1)} style={{padding:'5px 11px',borderRadius:16,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit',background:step===i+1?T.blue:step>i+1?T.successLight:T.grayLight,color:step===i+1?'#fff':step>i+1?T.success:T.textLight}}>
            {step>i+1?'✓ ':''}{s}
          </button>
        ))}
      </div>
      <Card style={{marginBottom:20}}>
        <h3 style={{margin:'0 0 16px',fontSize:15,fontWeight:800,color:T.dark}}>{STEPS[step-1]}</h3>
        {stepContent()}
      </Card>
      <div style={{display:'flex',gap:10,justifyContent:'space-between'}}>
        <Btn variant="secondary" onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1}>← Back</Btn>
        <div style={{display:'flex',gap:10}}>
          {step<8&&<Btn onClick={()=>setStep(s=>s+1)}>Continue →</Btn>}
          {step===8&&<Btn variant="success" onClick={()=>setGenerated(true)}>🚀 Generate Blueprint</Btn>}
          {generated&&<Btn variant="outline" onClick={()=>copyText(blueprint,setCopied)}>{copied?'✅ Copied!':'📋 Copy'}</Btn>}
        </div>
      </div>
      {generated&&(
        <Card style={{marginTop:20,background:T.dark}}>
          <pre style={{color:'#E2E8F0',fontSize:11.5,lineHeight:1.8,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word',fontFamily:"'Courier New',monospace"}}>{blueprint}</pre>
        </Card>
      )}
    </div>
  )
}
