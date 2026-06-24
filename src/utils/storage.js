// ─── STORAGE UTILITY ─────────────────────────────────────────────────────────
// Wraps localStorage with JSON serialization and error handling

const PREFIX = 'fds_gbp_'

export const storage = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(PREFIX + key)
      return val ? JSON.parse(val) : fallback
    } catch { return fallback }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key) } catch {}
  }
}

// ─── CLIENT STORE ─────────────────────────────────────────────────────────────
export function getClients() {
  return storage.get('clients', [])
}

export function saveClients(clients) {
  storage.set('clients', clients)
}

export function addClient(client) {
  const clients = getClients()
  const newClient = { ...client, id: Date.now().toString(), createdAt: new Date().toISOString() }
  saveClients([newClient, ...clients])
  return newClient
}

export function updateClient(id, updates) {
  const clients = getClients().map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
  saveClients(clients)
}

export function deleteClient(id) {
  saveClients(getClients().filter(c => c.id !== id))
}

// ─── SETTINGS STORE ───────────────────────────────────────────────────────────
export function getSettings() {
  return storage.get('settings', { groqKey: '', yourName: 'Abiodun', yourEmail: 'frankevgloballtd@gmail.com', currency: '£' })
}

export function saveSettings(settings) {
  storage.set('settings', settings)
}
