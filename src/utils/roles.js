// ─── ROLE DEFINITIONS ─────────────────────────────────────────────────────────
// 4 roles: super_admin > admin > pro > basic
// Super Admin: Abiodun — hardcoded, all access always
// Admin: Can manage users and give access, has all features
// Pro: Full app access except Access Control
// Basic: Limited to core features only

export const ROLES = {
  super_admin: { label: 'Super Admin', color: '#7C3AED', bg: '#F5F3FF', icon: '👑' },
  admin:       { label: 'Admin',       color: '#1B4FD8', bg: '#EEF3FF', icon: '🛡️' },
  pro:         { label: 'Pro User',    color: '#D97706', bg: '#FFFBEB', icon: '⭐' },
  basic:       { label: 'Basic User',  color: '#16A34A', bg: '#F0FDF4', icon: '👤' },
}

// ─── ALL APP FEATURES ─────────────────────────────────────────────────────────
export const FEATURES = [
  // Dashboard
  { id: 'dashboard_overview',   label: 'Dashboard — Revenue Overview',       module: 'Dashboard',        category: 'Dashboard' },
  { id: 'dashboard_health',     label: 'Dashboard — Client Health Scores',   module: 'Dashboard',        category: 'Dashboard' },
  { id: 'dashboard_pipeline',   label: 'Dashboard — Sales Pipeline',         module: 'Dashboard',        category: 'Dashboard' },
  { id: 'dashboard_followups',  label: 'Dashboard — Follow-up Alerts',       module: 'Dashboard',        category: 'Dashboard' },

  // Client Tracker
  { id: 'clients_view',         label: 'Client Tracker — View Clients',      module: 'Client Tracker',   category: 'CRM' },
  { id: 'clients_add',          label: 'Client Tracker — Add/Edit Clients',  module: 'Client Tracker',   category: 'CRM' },
  { id: 'clients_delete',       label: 'Client Tracker — Delete Clients',    module: 'Client Tracker',   category: 'CRM' },
  { id: 'clients_revenue',      label: 'Client Tracker — Revenue Tracking',  module: 'Client Tracker',   category: 'CRM' },

  // Audit Tool
  { id: 'audit_basic',          label: 'Audit Tool — Run Basic Audit',       module: 'Audit Tool',       category: 'Audit' },
  { id: 'audit_full',           label: 'Audit Tool — Full 20-Point Audit',   module: 'Audit Tool',       category: 'Audit' },
  { id: 'audit_competitors',    label: 'Audit Tool — Competitor Analysis',   module: 'Audit Tool',       category: 'Audit' },
  { id: 'audit_ai_finder',      label: 'Audit Tool — AI Competitor Finder',  module: 'Audit Tool',       category: 'Audit' },
  { id: 'audit_share',          label: 'Audit Tool — Share/Download Report', module: 'Audit Tool',       category: 'Audit' },
  { id: 'audit_history',        label: 'Audit Tool — Audit History',         module: 'Audit Tool',       category: 'Audit' },
  { id: 'audit_to_proposal',    label: 'Audit Tool — Create Proposal from Audit', module: 'Audit Tool', category: 'Audit' },

  // Blueprint
  { id: 'blueprint_view',       label: 'GBP Blueprint — View & Fill',        module: 'GBP Blueprint',    category: 'Blueprint' },
  { id: 'blueprint_generate',   label: 'GBP Blueprint — Generate Document',  module: 'GBP Blueprint',    category: 'Blueprint' },

  // Proposal Builder
  { id: 'proposal_create',      label: 'Proposal Builder — Create Proposal', module: 'Proposal Builder', category: 'Proposals' },
  { id: 'proposal_share',       label: 'Proposal Builder — Share/Download',  module: 'Proposal Builder', category: 'Proposals' },
  { id: 'pitch_script',         label: 'Pitch Script — Generate Script',     module: 'Pitch Script',     category: 'Proposals' },

  // AI Tools
  { id: 'ai_review',            label: 'AI Tools — Review Responder',        module: 'AI Tools',         category: 'AI Tools' },
  { id: 'ai_keywords',          label: 'AI Tools — Keyword Suggester',       module: 'AI Tools',         category: 'AI Tools' },
  { id: 'ai_posts',             label: 'AI Tools — Google Post Generator',   module: 'AI Tools',         category: 'AI Tools' },
  { id: 'ai_qa',                label: 'AI Tools — Q&A Generator',           module: 'AI Tools',         category: 'AI Tools' },
  { id: 'ai_description',       label: 'AI Tools — Description Writer',      module: 'AI Tools',         category: 'AI Tools' },
  { id: 'ai_report',            label: 'AI Tools — Monthly Report',          module: 'AI Tools',         category: 'AI Tools' },

  // Risk Checker
  { id: 'risk_checker',         label: 'Risk Checker — Suspension Check',    module: 'Risk Checker',     category: 'Risk' },
  { id: 'risk_share',           label: 'Risk Checker — Share Report',        module: 'Risk Checker',     category: 'Risk' },

  // Settings
  { id: 'settings_general',     label: 'Settings — General & Currency',      module: 'Settings',         category: 'Settings' },
  { id: 'settings_ai',          label: 'Settings — AI/Groq Key',             module: 'Settings',         category: 'Settings' },
  { id: 'settings_access',      label: 'Settings — Access Control',          module: 'Settings',         category: 'Settings' },
]

// ─── DEFAULT PERMISSIONS PER ROLE ─────────────────────────────────────────────
export const DEFAULT_PERMISSIONS = {
  super_admin: FEATURES.map(f => f.id), // ALL features
  admin: FEATURES.filter(f => f.id !== 'settings_access').map(f => f.id)
         .concat(['settings_access']), // All including access control
  pro: FEATURES
    .filter(f => !['settings_access', 'clients_delete'].includes(f.id))
    .map(f => f.id),
  basic: [
    'audit_basic',
    'ai_review',
    'ai_posts',
    'risk_checker',
    'settings_general',
  ]
}

// Check if current session user has a specific feature permission
export function hasPermission(session, featureId) {
  if (!session) return false
  // Super admin always has everything
  if (session.role === 'super_admin' || session.email === 'frankevgloballtd@gmail.com') return true
  // Admin has everything
  if (session.role === 'admin') return true
  // Check custom permissions first, then role defaults
  const perms = session.permissions || DEFAULT_PERMISSIONS[session.role] || DEFAULT_PERMISSIONS.basic
  return perms.includes(featureId)
}

// Get permission set for a role
export function getRolePermissions(role, customPerms) {
  if (customPerms && customPerms.length > 0) return customPerms
  return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.basic
}
