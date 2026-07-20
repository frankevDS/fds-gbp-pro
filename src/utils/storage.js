const PREFIX = 'fds_gbp_'
export const storage = {
  get(key, fallback=null){try{const v=localStorage.getItem(PREFIX+key);return v?JSON.parse(v):fallback}catch{return fallback}},
  set(key,value){try{localStorage.setItem(PREFIX+key,JSON.stringify(value))}catch{}},
  remove(key){try{localStorage.removeItem(PREFIX+key)}catch{}}
}
export function getClients(){return storage.get('clients',[])}
export function saveClients(c){storage.set('clients',c)}
export function addClient(client){const clients=getClients();const n={...client,id:Date.now().toString(),createdAt:new Date().toISOString()};saveClients([n,...clients]);return n}
export function updateClient(id,updates){saveClients(getClients().map(c=>c.id===id?{...c,...updates,updatedAt:new Date().toISOString()}:c))}
export function deleteClient(id){saveClients(getClients().filter(c=>c.id!==id))}
export function getSettings(){return storage.get('settings',{groqKey:'',yourName:'Abiodun',yourEmail:'frankevgloballtd@gmail.com',currency:'₵',country:'Ghana'})}
export function saveSettings(s){storage.set('settings',s)}
export function getAuditHistory(){return storage.get('audit_history',[])}
export function saveAuditToHistory(data){const h=getAuditHistory();const e={id:Date.now().toString(),savedAt:new Date().toISOString(),...data};storage.set('audit_history',[e,...h].slice(0,10));return e}
export function deleteAuditHistory(id){storage.set('audit_history',getAuditHistory().filter(a=>a.id!==id))}
