// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const T = {
  blue: '#1B4FD8', blueDark: '#1338A8', blueLight: '#EEF3FF', blueAccent: '#3B6EF8',
  gold: '#D4A017', goldLight: '#FDF6E3',
  dark: '#0F1C3F', gray: '#64748B', grayLight: '#F1F5F9', grayBorder: '#E2E8F0',
  white: '#FFFFFF',
  success: '#16A34A', successLight: '#F0FDF4',
  danger: '#DC2626', dangerLight: '#FEF2F2',
  warning: '#D97706', warningLight: '#FFFBEB',
  text: '#1E293B', textLight: '#64748B',
}

// ─── REUSABLE UI COMPONENTS ───────────────────────────────────────────────────
export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 9,
        background: `linear-gradient(135deg, ${T.blue}, ${T.blueAccent})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, color: T.white, fontSize: 13, letterSpacing: -0.5, flexShrink: 0
      }}>FDS</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.dark, lineHeight: 1.1 }}>Frankev Digital</div>
        <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Services · GBP Pro</div>
      </div>
    </div>
  )
}

export function Badge({ color = T.blue, bg = T.blueLight, children }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

export function Btn({ onClick, children, variant = 'primary', size = 'md', disabled, full, type = 'button' }) {
  const base = {
    border: 'none', borderRadius: 8, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center',
    gap: 6, justifyContent: 'center', width: full ? '100%' : 'auto',
    fontSize: size === 'sm' ? 12 : size === 'lg' ? 15 : 14,
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '13px 26px' : '10px 20px',
    opacity: disabled ? 0.5 : 1, flexShrink: 0,
  }
  const variants = {
    primary: { background: `linear-gradient(135deg, ${T.blue}, ${T.blueAccent})`, color: T.white },
    secondary: { background: T.grayLight, color: T.dark },
    success: { background: T.success, color: T.white },
    danger: { background: T.danger, color: T.white },
    outline: { background: T.white, color: T.blue, border: `1.5px solid ${T.blue}` },
    ghost: { background: 'transparent', color: T.textLight },
    gold: { background: `linear-gradient(135deg, ${T.gold}, #E8B520)`, color: T.white },
  }
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>
}

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: T.white, borderRadius: 14, border: `1px solid ${T.grayBorder}`,
      boxShadow: '0 2px 12px rgba(15,28,63,0.06)', padding: 20,
      cursor: onClick ? 'pointer' : 'default', ...style
    }}>{children}</div>
  )
}

export function Input({ value, onChange, placeholder, multiline, rows = 3, type = 'text', disabled }) {
  const s = {
    width: '100%', padding: '10px 13px', border: `1.5px solid ${T.grayBorder}`,
    borderRadius: 8, fontSize: 14, color: T.text, background: disabled ? '#F8FAFC' : T.grayLight,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    resize: multiline ? 'vertical' : 'none', transition: 'border 0.2s',
  }
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s} disabled={disabled} />
    : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} disabled={disabled} />
}

export function Select({ value, onChange, options, placeholder, disabled }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} style={{
      width: '100%', padding: '10px 13px', border: `1.5px solid ${T.grayBorder}`,
      borderRadius: 8, fontSize: 14, color: value ? T.text : T.textLight,
      background: T.grayLight, outline: 'none', fontFamily: 'inherit',
    }}>
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  )
}

export function Field({ label, hint, required, children, style = {} }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: T.dark, marginBottom: 5 }}>
          {label} {required && <span style={{ color: T.danger }}>*</span>}
        </label>
      )}
      {hint && <p style={{ fontSize: 12, color: T.textLight, margin: '0 0 6px' }}>{hint}</p>}
      {children}
    </div>
  )
}

export function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 13, color: T.text, marginBottom: 8, lineHeight: 1.4 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 15, height: 15, accentColor: T.blue, marginTop: 2, flexShrink: 0 }} />
      {label}
    </label>
  )
}

export function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.dark }}>{title}</h2>
      </div>
      {subtitle && <p style={{ margin: 0, color: T.textLight, fontSize: 13, paddingLeft: 34 }}>{subtitle}</p>}
    </div>
  )
}

export function ScoreBadge({ score, max = 10 }) {
  const pct = score / max
  const color = pct >= 0.8 ? T.success : pct >= 0.5 ? T.warning : T.danger
  const bg = pct >= 0.8 ? T.successLight : pct >= 0.5 ? T.warningLight : T.dangerLight
  const label = pct >= 0.8 ? 'Well Optimised' : pct >= 0.5 ? 'Needs Work' : 'Critical'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 54, height: 54, borderRadius: '50%', border: `3px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 20, color, background: bg, flexShrink: 0
      }}>{score}</div>
      <div>
        <div style={{ fontSize: 10, color: T.textLight, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Score / {max}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{label}</div>
      </div>
    </div>
  )
}

export function ProgressBar({ value, max = 10, color = T.blue, height = 6 }) {
  return (
    <div style={{ height, background: T.grayBorder, borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, border: `3px solid ${T.blueLight}`,
      borderTopColor: T.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite'
    }} />
  )
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, color: T.textLight }}>{subtitle}</p>
    </div>
  )
}

export function StatusPill({ status }) {
  const map = {
    lead:      { label: 'Lead',      bg: '#EEF3FF', color: T.blue },
    audited:   { label: 'Audited',   bg: T.warningLight, color: T.warning },
    pitched:   { label: 'Pitched',   bg: '#FDF4FF', color: '#7C3AED' },
    won:       { label: 'Won ✓',    bg: T.successLight, color: T.success },
    lost:      { label: 'Lost',      bg: T.dangerLight, color: T.danger },
    active:    { label: 'Active',    bg: T.successLight, color: T.success },
    paused:    { label: 'Paused',    bg: T.warningLight, color: T.warning },
  }
  const s = map[status] || map.lead
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
}

export function copyText(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  })
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const INDUSTRIES = [
  'Automotive', 'Beauty & Personal Care', 'Construction & Trades',
  'Education & Tutoring', 'Event Planning & Entertainment', 'Financial Services',
  'Food & Hospitality', 'Health & Medical', 'Home Services', 'Legal Services',
  'Marketing & Creative Agency', 'Real Estate', 'Retail', 'Technology & IT Services',
  'Wellness & Fitness', 'Other'
]
