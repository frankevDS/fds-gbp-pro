import { useState, useEffect } from 'react'
import { T, Btn, Card, Input, Field, SectionHeader } from '../components/ui.jsx'
import { getSettings, saveSettings } from '../utils/storage.js'

const COUNTRIES = [
  { name: 'Ghana', currency: 'GHS', symbol: '₵', flag: '🇬🇭' },
  { name: 'Nigeria', currency: 'NGN', symbol: '₦', flag: '🇳🇬' },
  { name: 'United Kingdom', currency: 'GBP', symbol: '£', flag: '🇬🇧' },
  { name: 'United States', currency: 'USD', symbol: '$', flag: '🇺🇸' },
  { name: 'European Union', currency: 'EUR', symbol: '€', flag: '🇪🇺' },
  { name: 'South Africa', currency: 'ZAR', symbol: 'R', flag: '🇿🇦' },
  { name: 'Kenya', currency: 'KES', symbol: 'KSh', flag: '🇰🇪' },
  { name: 'Canada', currency: 'CAD', symbol: 'CA$', flag: '🇨🇦' },
  { name: 'Australia', currency: 'AUD', symbol: 'A$', flag: '🇦🇺' },
  { name: 'India', currency: 'INR', symbol: '₹', flag: '🇮🇳' },
  { name: 'UAE', currency: 'AED', symbol: 'AED', flag: '🇦🇪' },
  { name: 'Tanzania', currency: 'TZS', symbol: 'TSh', flag: '🇹🇿' },
  { name: 'Uganda', currency: 'UGX', symbol: 'USh', flag: '🇺🇬' },
  { name: 'Rwanda', currency: 'RWF', symbol: 'RF', flag: '🇷🇼' },
  { name: 'Cameroon', currency: 'XAF', symbol: 'FCFA', flag: '🇨🇲' },
  { name: 'Senegal', currency: 'XOF', symbol: 'CFA', flag: '🇸🇳' },
  { name: 'Other', currency: 'USD', symbol: '$', flag: '🌍' },
]

export default function Settings() {
  const [f, setF] = useState(getSettings())
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  // When country changes, auto-set currency and symbol
  const handleCountryChange = (countryName) => {
    const found = COUNTRIES.find(c => c.name === countryName)
    if (found) {
      setF(p => ({
        ...p,
        country: found.name,
        currency: found.symbol,
        currencyCode: found.currency,
      }))
    }
  }

  const handleSave = () => {
    saveSettings(f)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    // Dispatch event so Dashboard updates immediately without refresh
    window.dispatchEvent(new Event('fds-settings-updated'))
  }

  const selectedCountry = COUNTRIES.find(c => c.name === f.country)

  return (
    <div>
      <SectionHeader icon="⚙️" title="Settings" subtitle="Configure your FDS GBP Pro App — API key, your details, country, and currency." />

      {/* COUNTRY & CURRENCY */}
      <Card style={{ marginBottom: 20, border: `2px solid ${T.blue}` }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: T.dark }}>🌍 Country & Currency</h3>
        <p style={{ fontSize: 12, color: T.textLight, marginBottom: 16 }}>
          This sets the currency symbol shown everywhere in the app — Dashboard, Proposals, Client Tracker.
        </p>

        <Field label="Select Your Country" required>
          <select
            value={f.country || ''}
            onChange={e => handleCountryChange(e.target.value)}
            style={{
              width: '100%', padding: '11px 13px',
              border: `1.5px solid ${T.grayBorder}`, borderRadius: 8,
              fontSize: 14, color: T.text, background: T.grayLight,
              outline: 'none', fontFamily: 'inherit',
            }}
          >
            <option value="">Select your country...</option>
            {COUNTRIES.map(c => (
              <option key={c.name} value={c.name}>
                {c.flag}  {c.name} — {c.currency} ({c.symbol})
              </option>
            ))}
          </select>
        </Field>

        {/* PREVIEW */}
        {selectedCountry && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: T.successLight, border: `1px solid #86EFAC`,
            borderRadius: 10, padding: '12px 16px', marginTop: 4
          }}>
            <span style={{ fontSize: 32 }}>{selectedCountry.flag}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.success }}>
                ✅ Currency set to {selectedCountry.currency}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.dark, marginTop: 2 }}>
                {selectedCountry.symbol}0.00 — {selectedCountry.symbol}500.00
              </div>
              <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>
                This is how prices will appear across the app
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM OVERRIDE */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.grayBorder}` }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: T.textLight, marginBottom: 8 }}>
            OR — Override with a custom symbol (optional)
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={f.currency || ''}
              onChange={e => set('currency', e.target.value)}
              placeholder="e.g. ₵ or GHS or $"
              maxLength={6}
              style={{
                width: 120, padding: '9px 13px',
                border: `1.5px solid ${T.grayBorder}`, borderRadius: 8,
                fontSize: 16, fontFamily: 'inherit', background: T.white,
                outline: 'none', textAlign: 'center', fontWeight: 700,
              }}
            />
            <span style={{ fontSize: 13, color: T.textLight }}>
              Type any symbol or code you prefer
            </span>
          </div>
        </div>
      </Card>

      {/* GROQ API KEY */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: T.dark }}>🤖 Groq AI Configuration</h3>
        <div style={{ background: T.blueLight, borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: '#1E40AF' }}>
          <strong>How to get your free Groq API key:</strong>
          <ol style={{ marginTop: 8, paddingLeft: 18, lineHeight: 2 }}>
            <li>Go to <strong>console.groq.com</strong></li>
            <li>Sign up for a free account</li>
            <li>Click <strong>API Keys</strong> → <strong>Create API Key</strong></li>
            <li>Copy the key and paste it below</li>
          </ol>
          <p style={{ marginTop: 8, fontWeight: 700 }}>
            💡 Tip: If you added VITE_GROQ_API_KEY to Vercel environment variables, you do not need to enter it here — it works automatically.
          </p>
        </div>
        <Field label="Groq API Key" hint="Stored locally on your device only. Never sent anywhere except Groq's servers.">
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={f.groqKey || ''}
              onChange={e => set('groqKey', e.target.value)}
              placeholder="gsk_..."
              style={{
                flex: 1, padding: '10px 13px',
                border: `1.5px solid ${T.grayBorder}`, borderRadius: 8,
                fontSize: 14, fontFamily: 'inherit', background: T.grayLight, outline: 'none',
              }}
            />
            <Btn variant="secondary" size="sm" onClick={() => setShowKey(s => !s)}>
              {showKey ? '🙈 Hide' : '👁 Show'}
            </Btn>
          </div>
        </Field>
        {f.groqKey && (
          <div style={{ background: T.successLight, border: `1px solid #86EFAC`, borderRadius: 8, padding: 10, fontSize: 13, color: T.success }}>
            ✅ API key is set. All AI features are enabled.
          </div>
        )}
      </Card>

      {/* YOUR DETAILS */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: T.dark }}>👤 Your Details</h3>
        <p style={{ fontSize: 12, color: T.textLight, marginBottom: 14 }}>
          These appear on proposals, audit reports, and pitch scripts.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Your Name">
            <input value={f.yourName || ''} onChange={e => set('yourName', e.target.value)} placeholder="e.g. Abiodun"
              style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${T.grayBorder}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: T.grayLight, outline: 'none', boxSizing: 'border-box' }} />
          </Field>
          <Field label="Your Email">
            <input value={f.yourEmail || ''} onChange={e => set('yourEmail', e.target.value)} placeholder="frankevgloballtd@gmail.com"
              style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${T.grayBorder}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: T.grayLight, outline: 'none', boxSizing: 'border-box' }} />
          </Field>
          <Field label="WhatsApp Number">
            <input value={f.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} placeholder="e.g. +233 XX XXX XXXX"
              style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${T.grayBorder}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: T.grayLight, outline: 'none', boxSizing: 'border-box' }} />
          </Field>
          <Field label="Business Location / City">
            <input value={f.baseCity || ''} onChange={e => set('baseCity', e.target.value)} placeholder="e.g. Accra"
              style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${T.grayBorder}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: T.grayLight, outline: 'none', boxSizing: 'border-box' }} />
          </Field>
        </div>
      </Card>

      {/* PWA INSTALL */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: T.dark }}>📱 Install as Mobile App</h3>
        <p style={{ fontSize: 13, color: T.text, marginBottom: 12 }}>
          This app is a <strong>Progressive Web App (PWA)</strong>. Install it on your phone and computer — no App Store needed.
        </p>
        <div style={{ background: T.grayLight, borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 2 }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>📱 Android (Chrome):</p>
          <p style={{ marginBottom: 10 }}>Tap <strong>⋮ menu</strong> → <strong>"Add to Home Screen"</strong> → <strong>"Install"</strong></p>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>🍎 iPhone (Safari only):</p>
          <p style={{ marginBottom: 10 }}>Tap <strong>Share button</strong> → <strong>"Add to Home Screen"</strong></p>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>💻 Desktop (Chrome / Edge):</p>
          <p>Click the <strong>⊕ install icon</strong> in the address bar → <strong>"Install"</strong></p>
        </div>
      </Card>

      {/* APP INFO */}
      <Card style={{ marginBottom: 20, background: T.grayLight, border: 'none' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: T.dark }}>ℹ️ App Information</h3>
        <div style={{ fontSize: 12, color: T.textLight, lineHeight: 2.2 }}>
          <div><strong>App:</strong> FDS GBP Pro v1.0</div>
          <div><strong>Built for:</strong> Frankev Digital Services</div>
          <div><strong>Email:</strong> frankevgloballtd@gmail.com</div>
          <div><strong>Country:</strong> {f.country || 'Not set'}</div>
          <div><strong>Currency:</strong> {f.currency || 'Not set'} ({f.currencyCode || '—'})</div>
          <div><strong>Data storage:</strong> All data saved locally on your device</div>
          <div><strong>AI Provider:</strong> Groq (llama3-70b-8192)</div>
        </div>
      </Card>

      <Btn full onClick={handleSave} size="lg">
        {saved ? '✅ Settings Saved!' : '💾 Save Settings'}
      </Btn>
    </div>
  )
}
