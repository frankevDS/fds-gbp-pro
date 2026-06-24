import { useState, useEffect } from 'react'
import { T, Btn, Card, Input, Field, SectionHeader } from '../components/ui.jsx'
import { getSettings, saveSettings } from '../utils/storage.js'

export default function Settings() {
  const [f, setF] = useState(getSettings())
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    saveSettings(f); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <SectionHeader icon="⚙️" title="Settings" subtitle="Configure your FDS GBP Pro App — API key, your details, and preferences." />

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: T.dark }}>🤖 Groq AI Configuration</h3>
        <div style={{ background: T.blueLight, borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: '#1E40AF' }}>
          <strong>How to get your free Groq API key:</strong>
          <ol style={{ marginTop: 8, paddingLeft: 18, lineHeight: 2 }}>
            <li>Go to <strong>console.groq.com</strong></li>
            <li>Sign up for a free account</li>
            <li>Click <strong>API Keys</strong> → <strong>Create API Key</strong></li>
            <li>Copy the key and paste it below</li>
          </ol>
        </div>
        <Field label="Groq API Key" hint="Stored locally on your device only. Never sent anywhere except Groq's servers.">
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={f.groqKey} onChange={v => set('groqKey', v)} type={showKey ? 'text' : 'password'} placeholder="gsk_..." />
            <Btn variant="secondary" size="sm" onClick={() => setShowKey(s => !s)}>{showKey ? '🙈 Hide' : '👁 Show'}</Btn>
          </div>
        </Field>
        {f.groqKey && (
          <div style={{ background: T.successLight, border: `1px solid #86EFAC`, borderRadius: 8, padding: 10, fontSize: 13, color: T.success }}>
            ✅ API key is set. All AI features are enabled.
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: T.dark }}>👤 Your Details</h3>
        <p style={{ fontSize: 12, color: T.textLight, marginBottom: 14 }}>These appear on proposals, audit reports, and pitch scripts.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Your Name"><Input value={f.yourName} onChange={v => set('yourName', v)} placeholder="e.g. Abiodun" /></Field>
          <Field label="Your Email"><Input value={f.yourEmail} onChange={v => set('yourEmail', v)} placeholder="frankevgloballtd@gmail.com" /></Field>
          <Field label="Currency Symbol"><Input value={f.currency} onChange={v => set('currency', v)} placeholder="£" /></Field>
          <Field label="WhatsApp Number (optional)"><Input value={f.whatsapp || ''} onChange={v => set('whatsapp', v)} placeholder="e.g. +447700900123" /></Field>
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: T.dark }}>📱 Install as Mobile App</h3>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 2 }}>
          <p style={{ marginBottom: 12 }}>This app is a <strong>Progressive Web App (PWA)</strong>. Install it on your phone and computer like a native app — no App Store needed.</p>
          <div style={{ background: T.grayLight, borderRadius: 10, padding: 14 }}>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>📱 On Android (Chrome):</p>
            <p>Tap the <strong>⋮ menu</strong> → <strong>"Add to Home Screen"</strong> → <strong>"Install"</strong></p>
            <p style={{ fontWeight: 700, margin: '12px 0 8px' }}>🍎 On iPhone (Safari):</p>
            <p>Tap the <strong>Share button</strong> → <strong>"Add to Home Screen"</strong></p>
            <p style={{ fontWeight: 700, margin: '12px 0 8px' }}>💻 On Desktop (Chrome/Edge):</p>
            <p>Click the <strong>install icon (⊕)</strong> in the address bar → <strong>"Install"</strong></p>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 20, background: T.grayLight, border: 'none' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: T.dark }}>ℹ️ App Information</h3>
        <div style={{ fontSize: 12, color: T.textLight, lineHeight: 2 }}>
          <div><strong>App:</strong> FDS GBP Pro v1.0</div>
          <div><strong>Built by:</strong> Frankev Digital Services</div>
          <div><strong>Email:</strong> frankevgloballtd@gmail.com</div>
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
