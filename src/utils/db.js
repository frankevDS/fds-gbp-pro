// ─── SUPABASE DATABASE — STRICT CENTRALISED MODE ──────────────────────────────
// ALL user authentication is controlled from Supabase only.
// There is NO default PIN fallback. If you changed the PIN in the admin panel,
// the old PIN (0000) will NOT work on any device anywhere.
// The ONLY exception is the super admin email bypass (logo tap x3).

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const TABLE             = 'fds_auth'
const ROW_ID            = 'config'

// Short cache — so PIN changes reflect within 15 seconds on all devices
let cache    = null
let cacheAge = 0
const CACHE_TTL = 15000

function headers() {
  return {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Prefer':        'return=representation'
  }
}

export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY &&
    SUPABASE_URL !== 'undefined' && SUPABASE_ANON_KEY !== 'undefined')
}

// ─── READ — no silent fallback to defaults ────────────────────────────────────
export async function readDB() {
  // Return cache if fresh
  if (cache && Date.now() - cacheAge < CACHE_TTL) return cache

  if (!isSupabaseConfigured()) {
    throw new Error('NOT_CONFIGURED')
  }

  let res
  try {
    res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=data`,
      { headers: headers() }
    )
  } catch(e) {
    throw new Error('NETWORK_ERROR')
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_ERROR — Check Supabase RLS policies')
  }
  if (!res.ok) {
    throw new Error(`READ_FAILED_${res.status}`)
  }

  const rows = await res.json()
  if (!rows || rows.length === 0) {
    throw new Error('NO_CONFIG — Run the SQL setup in Supabase')
  }

  cache    = rows[0].data
  cacheAge = Date.now()

  // Keep a session-only backup for display purposes (not for auth bypass)
  try { sessionStorage.setItem('fds_config_cache', JSON.stringify({ data: cache, at: cacheAge })) } catch {}

  return cache
}

// ─── WRITE ────────────────────────────────────────────────────────────────────
export async function writeDB(data) {
  if (!isSupabaseConfigured()) {
    throw new Error('NOT_CONFIGURED')
  }

  let res
  try {
    res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}`,
      {
        method:  'PATCH',
        headers: headers(),
        body:    JSON.stringify({ data, updated_at: new Date().toISOString() })
      }
    )
  } catch(e) {
    throw new Error('NETWORK_ERROR')
  }

  if (!res.ok) {
    throw new Error(`WRITE_FAILED_${res.status}`)
  }

  // Immediately invalidate cache so all devices get fresh data on next read
  cache    = null
  cacheAge = 0

  try { sessionStorage.setItem('fds_config_cache', JSON.stringify({ data, at: Date.now() })) } catch {}

  return data
}

export function clearCache() {
  cache    = null
  cacheAge = 0
}

// For display in admin panel only — not used for authentication
export function getCachedConfig() {
  if (cache) return cache
  try {
    const raw = sessionStorage.getItem('fds_config_cache')
    if (raw) return JSON.parse(raw).data
  } catch {}
  return null
}
