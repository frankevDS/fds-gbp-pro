// ─── SUPABASE DATABASE SYNC ───────────────────────────────────────────────────
// Stores all user accounts and PINs in a Supabase table
// All devices read/write the same table — fully synced across browsers/phones
//
// SETUP (one time — 5 minutes):
// 1. Go to supabase.com → sign in → open your project (or create new free one)
// 2. Go to SQL Editor → paste and run this:
//
//    create table if not exists fds_auth (
//      id text primary key default 'config',
//      data jsonb not null,
//      updated_at timestamptz default now()
//    );
//    insert into fds_auth (id, data) values ('config', '{
//      "masterPin": "0000",
//      "approvedUsers": [{
//        "id": "master",
//        "name": "Abiodun",
//        "email": "frankevgloballtd@gmail.com",
//        "pin": "0000",
//        "role": "admin",
//        "approved": true
//      }]
//    }') on conflict (id) do nothing;
//
// 3. Go to Project Settings → API
//    Copy: Project URL  → paste as VITE_SUPABASE_URL in Vercel
//    Copy: anon/public key → paste as VITE_SUPABASE_ANON_KEY in Vercel
//
// 4. Go to Vercel → Settings → Environment Variables → add both → Redeploy

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const TABLE             = 'fds_auth'
const ROW_ID            = 'config'

// Cache to avoid hitting Supabase too often
let cache    = null
let cacheAge = 0
const CACHE_TTL = 30000 // 30 seconds

function headers() {
  return {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Prefer':        'return=representation'
  }
}

// ─── READ ─────────────────────────────────────────────────────────────────────
export async function readDB() {
  // Return cache if still fresh
  if (cache && Date.now() - cacheAge < CACHE_TTL) return cache

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured — using local fallback')
    return localFallback()
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=data`,
      { headers: headers() }
    )
    if (!res.ok) throw new Error(`Supabase read error ${res.status}`)
    const rows = await res.json()
    if (!rows || rows.length === 0) throw new Error('No config row found')
    cache    = rows[0].data
    cacheAge = Date.now()
    // Also save to localStorage as offline backup
    try { localStorage.setItem('fds_gbp_auth_backup', JSON.stringify(cache)) } catch {}
    return cache
  } catch (e) {
    console.warn('Supabase read failed, using local backup:', e.message)
    return localFallback()
  }
}

// ─── WRITE ────────────────────────────────────────────────────────────────────
export async function writeDB(data) {
  // Always write local backup first
  try { localStorage.setItem('fds_gbp_auth_backup', JSON.stringify(data)) } catch {}

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    cache    = data
    cacheAge = Date.now()
    return data
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}`,
      {
        method:  'PATCH',
        headers: headers(),
        body:    JSON.stringify({ data, updated_at: new Date().toISOString() })
      }
    )
    if (!res.ok) throw new Error(`Supabase write error ${res.status}`)
    cache    = data
    cacheAge = Date.now()
    return data
  } catch (e) {
    console.warn('Supabase write failed:', e.message)
    throw e  // Re-throw so UI can show error
  }
}

export function clearCache() {
  cache    = null
  cacheAge = 0
}

// ─── LOCAL FALLBACK ───────────────────────────────────────────────────────────
function localFallback() {
  try {
    const raw = localStorage.getItem('fds_gbp_auth_backup')
    if (raw) return JSON.parse(raw)
  } catch {}
  // Absolute default
  return {
    masterPin: '0000',
    approvedUsers: [
      {
        id:       'master',
        name:     'Abiodun',
        email:    'frankevgloballtd@gmail.com',
        pin:      '0000',
        role:     'admin',
        approved: true
      }
    ]
  }
}
