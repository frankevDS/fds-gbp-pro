import { useState } from 'react'
import { T, Card, Btn, Input, Field, SectionHeader, Checkbox } from '../components/ui.jsx'
import { ShareBar } from './AITools.jsx'

// ─── SUSPENSION RISK CHECKS ───────────────────────────────────────────────────
const RISK_CHECKS = [
  // [label, key, riskLevel, explanation]
  // HIGH RISK
  ['Business name contains keywords not in real-world name (e.g. "Plumber Manchester" instead of "Joe\'s Repairs")', 'keywordStuffedName', 'high', 'Google\'s #1 suspension trigger. Business name must match exactly what\'s on your signage, invoices, and website.'],
  ['Business name contains city/location words added to rank higher', 'locationInName', 'high', 'Adding "in Accra" or "Ghana" to your business name violates Google guidelines and causes suspension.'],
  ['Address is a PO Box, virtual office, or UPS Store location', 'virtualOffice', 'high', 'Google requires a real, staffed physical location. Virtual offices are a top suspension cause.'],
  ['Business is using a home address but is a service-area business', 'homeAddressVisible', 'high', 'Service businesses that go to customers should hide their address, not display a home address.'],
  ['Multiple GBP listings exist for the same business location', 'duplicateListing', 'high', 'Duplicate listings cause both to be suspended. Only one listing per physical location is allowed.'],
  ['Business category is mismatched (e.g. using "Restaurant" for a caterer)', 'wrongCategory', 'high', 'Using an incorrect category to rank for more searches is a policy violation.'],
  ['Third-party or agency manages the profile without owner verification', 'noOwnerVerification', 'high', 'The business owner must be listed as a manager. Profiles owned only by agencies are at risk.'],
  // MEDIUM RISK
  ['Phone number is a call tracking number not connected to the business', 'trackingNumber', 'medium', 'Google cross-references your number. Tracking numbers that don\'t ring through to the business are suspicious.'],
  ['Website URL leads to a different business or brand than the GBP name', 'mismatchedWebsite', 'medium', 'NAP (Name, Address, Phone) inconsistency between GBP and website is a trust signal failure.'],
  ['Business hours show 24/7 open but the business is not actually open 24/7', 'fake24hours', 'medium', 'Google uses customer check-ins and reviews to verify hours. Fake hours damage credibility and trigger reviews.'],
  ['Recent spike of many reviews in a short period (review gating or buying)', 'reviewManipulation', 'medium', 'Sudden review spikes are flagged by Google\'s algorithm as manipulation, even if reviews are genuine.'],
  ['GBP profile photo shows a stock image instead of a real photo of the business', 'stockPhotos', 'medium', 'Stock photos or images not matching the actual business are a quality signal failure.'],
  ['Business has moved address but GBP not updated', 'outdatedAddress', 'medium', 'Google verifies addresses. An outdated or wrong address is a suspension trigger and misleads customers.'],
  ['Owner has had a previous GBP suspension on any account', 'previousSuspension', 'medium', 'Prior suspensions increase scrutiny on all associated profiles and email accounts.'],
  // LOW RISK
  ['Profile description contains promotional pricing ("Best prices!", "50% off!")', 'promoInDescription', 'low', 'Google does not allow promotional pricing or offers in the business description field.'],
  ['Profile has not been updated or posted to in over 6 months', 'inactiveProfile', 'low', 'Inactive profiles are more likely to be flagged for review or to drop in rankings.'],
  ['Business is in a sensitive category (locksmith, legal, financial, medical)', 'sensitiveCategory', 'low', 'Certain categories are more heavily scrutinised by Google due to high spam risk in those industries.'],
  ['Website has slow load time or is not mobile-friendly', 'poorWebsite', 'low', 'Google links GBP quality signals to the linked website\'s performance and quality.'],
]

const RISK_WEIGHTS = { high: 30, medium: 15, low: 5 }

function getRiskLevel(score) {
  if (score >= 60) return { label: 'CRITICAL RISK',  color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', icon: '🚨' }
  if (score >= 35) return { label: 'HIGH RISK',      color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', icon: '⚠️' }
  if (score >= 15) return { label: 'MODERATE RISK',  color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', icon: '⚡' }
  return                  { label: 'LOW RISK',       color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', icon: '✅' }
}

export default function SuspensionChecker() {
  const [biz, setBiz] = useState({ name: '', city: '', industry: '' })
  const [checks, setChecks] = useState(Object.fromEntries(RISK_CHECKS.map(([,k]) => [k, false])))
  const [generated, setGenerated] = useState(false)

  const setC = (k, v) => setChecks(p => ({ ...p, [k]: v }))
  const setB = (k, v) => setBiz(p => ({ ...p, [k]: v }))

  const totalScore = RISK_CHECKS.reduce((s, [,key,,]) => checks[key] ? s + RISK_WEIGHTS[RISK_CHECKS.find(([,k]) => k === key)[2]] : s, 0)
  const riskLevel = getRiskLevel(totalScore)

  const highRisks = RISK_CHECKS.filter(([,k,level]) => checks[k] && level === 'high')
  const medRisks  = RISK_CHECKS.filter(([,k,level]) => checks[k] && level === 'medium')
  const lowRisks  = RISK_CHECKS.filter(([,k,level]) => checks[k] && level === 'low')
  const passed    = RISK_CHECKS.filter(([,k]) => !checks[k])

  const reportText = `FRANKEV DIGITAL SERVICES
GBP SUSPENSION RISK REPORT
${'═'.repeat(60)}
Business  : ${biz.name || 'N/A'}
City      : ${biz.city || 'N/A'}
Industry  : ${biz.industry || 'N/A'}
Date      : ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
${'═'.repeat(60)}

SUSPENSION RISK LEVEL: ${riskLevel.icon} ${riskLevel.label}
Risk Score: ${totalScore} points
${'─'.repeat(60)}

${highRisks.length > 0 ? `🚨 CRITICAL RISKS — Fix Immediately (${highRisks.length} found):
${highRisks.map(([label,,, exp], i) => `  ${i+1}. ${label}\n     → ${exp}`).join('\n\n')}

` : ''}${medRisks.length > 0 ? `⚠️ MEDIUM RISKS — Fix Soon (${medRisks.length} found):
${medRisks.map(([label,,, exp], i) => `  ${i+1}. ${label}\n     → ${exp}`).join('\n\n')}

` : ''}${lowRisks.length > 0 ? `⚡ LOW RISKS — Monitor These (${lowRisks.length} found):
${lowRisks.map(([label,,, exp], i) => `  ${i+1}. ${label}\n     → ${exp}`).join('\n\n')}

` : ''}${'─'.repeat(60)}
ITEMS PASSING (${passed.length}/${RISK_CHECKS.length}):
${passed.map(([label]) => `  ✅ ${label}`).join('\n')}

${'═'.repeat(60)}
SUSPENSION RISK SUMMARY:
${totalScore === 0
  ? 'This profile shows no suspension risk factors. Maintain current compliance and monitor regularly.'
  : `This profile has ${highRisks.length} critical, ${medRisks.length} medium, and ${lowRisks.length} low risk factors.\n${highRisks.length > 0 ? 'URGENT: Address all Critical risks immediately to avoid suspension.' : 'Address medium risks within the next 30 days to stay compliant.'}`
}
${'═'.repeat(60)}
Prepared by: Frankev Digital Services
hispraise01@gmail.com | gbp.frankevdigitalservices.com
${'═'.repeat(60)}`

  return (
    <div>
      <SectionHeader icon="🛡️" title="GBP Suspension Risk Checker" subtitle="Check any Google Business Profile for suspension risk factors before they become a problem." />

      <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#7F1D1D' }}>
        <strong>🚨 Why this matters:</strong> Google suspends thousands of GBP listings every month. A suspended listing disappears from Google Maps and Search completely — costing the business all local visibility until reinstated (which can take weeks). This checker flags the exact risk factors Google uses.
      </div>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 14 }}>Business Details</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Business Name"><Input value={biz.name} onChange={v => setB('name', v)} placeholder="e.g. Frankev Online Store" /></Field>
          <Field label="City"><Input value={biz.city} onChange={v => setB('city', v)} placeholder="e.g. Accra" /></Field>
          <Field label="Industry"><Input value={biz.industry} onChange={v => setB('industry', v)} placeholder="e.g. Ecommerce Store" /></Field>
        </div>
      </Card>

      {/* LIVE RISK SCORE */}
      <div style={{ background: riskLevel.bg, border: `1.5px solid ${riskLevel.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 40 }}>{riskLevel.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: riskLevel.color }}>{riskLevel.label}</div>
          <div style={{ fontSize: 13, color: riskLevel.color, opacity: 0.8, marginTop: 2 }}>Risk Score: {totalScore} | {highRisks.length} critical · {medRisks.length} medium · {lowRisks.length} low risks</div>
          <div style={{ height: 8, background: 'rgba(0,0,0,0.1)', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, totalScore)}%`, background: riskLevel.color, borderRadius: 4, transition: 'width 0.5s' }} />
          </div>
        </div>
      </div>

      {/* RISK CHECKS */}
      {[
        ['🚨 Critical Risk Factors', 'high', '#FEF2F2', '#DC2626', '#FCA5A5'],
        ['⚠️ Medium Risk Factors', 'medium', '#FFF7ED', '#EA580C', '#FED7AA'],
        ['⚡ Low Risk Factors', 'low', '#FFFBEB', '#D97706', '#FCD34D'],
      ].map(([heading, level, bg, color, border]) => (
        <Card key={level} style={{ marginBottom: 14, background: bg, border: `1px solid ${border}` }}>
          <p style={{ fontWeight: 800, fontSize: 13, color, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            {heading}
            <span style={{ fontSize: 11, fontWeight: 600, background: color, color: '#fff', padding: '2px 8px', borderRadius: 10 }}>
              {RISK_CHECKS.filter(([,,l]) => l === level).length} checks
            </span>
          </p>
          {RISK_CHECKS.filter(([,,l]) => l === level).map(([label, key,, explanation]) => (
            <div key={key} style={{
              background: checks[key] ? color + '15' : T.white,
              border: `1px solid ${checks[key] ? color + '40' : T.grayBorder}`,
              borderRadius: 9, padding: '12px 14px', marginBottom: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: checks[key] ? 700 : 500, color: checks[key] ? color : T.dark, margin: '0 0 4px' }}>{label}</p>
                  <p style={{ fontSize: 12, color: T.textLight, margin: 0, lineHeight: 1.5 }}>💡 {explanation}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {[['✅ No', false], ['❌ Yes', true]].map(([txt, val]) => (
                    <button key={txt} onClick={() => setC(key, val)} style={{
                      padding: '6px 12px', borderRadius: 7, border: `1.5px solid`,
                      borderColor: checks[key] === val ? (val ? color : T.success) : T.grayBorder,
                      background: checks[key] === val ? (val ? color : T.success) : T.white,
                      color: checks[key] === val ? '#fff' : T.text,
                      fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap'
                    }}>{txt}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Card>
      ))}

      <Btn size="lg" onClick={() => setGenerated(true)} full>🛡️ Generate Suspension Risk Report</Btn>

      {generated && (
        <div style={{ marginTop: 20 }} className="animate-fadeIn">
          <ShareBar text={reportText} title={`GBP Suspension Risk Report — ${biz.name || 'Business'}`} businessName={biz.name} />
          <Card style={{ background: T.dark }}>
            <pre style={{ color: '#E2E8F0', fontSize: 12, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "'Courier New', monospace", maxHeight: 500, overflowY: 'auto' }}>
              {reportText}
            </pre>
          </Card>
        </div>
      )}
    </div>
  )
}
