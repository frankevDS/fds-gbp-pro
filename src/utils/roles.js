// ─── ROLE DEFINITIONS ─────────────────────────────────────────────────────────
export const ROLES = {
  super_admin: { label: 'Super Admin', color: '#7C3AED', bg: '#F5F3FF', icon: '👑' },
  admin:       { label: 'Admin',       color: '#1B4FD8', bg: '#EEF3FF', icon: '🛡️' },
  pro:         { label: 'Pro User',    color: '#D97706', bg: '#FFFBEB', icon: '⭐' },
  basic:       { label: 'Basic User',  color: '#16A34A', bg: '#F0FDF4', icon: '👤' },
}

// ─── ALL APP FEATURES ─────────────────────────────────────────────────────────
export const FEATURES = [
  { id: 'dashboard_overview',  label: 'Dashboard — Revenue Overview',        module: 'Dashboard',        category: 'Dashboard'  },
  { id: 'dashboard_health',    label: 'Dashboard — Client Health Scores',    module: 'Dashboard',        category: 'Dashboard'  },
  { id: 'dashboard_pipeline',  label: 'Dashboard — Sales Pipeline',          module: 'Dashboard',        category: 'Dashboard'  },
  { id: 'dashboard_followups', label: 'Dashboard — Follow-up Alerts',        module: 'Dashboard',        category: 'Dashboard'  },
  { id: 'clients_view',        label: 'Client Tracker — View Clients',       module: 'Client Tracker',   category: 'CRM'        },
  { id: 'clients_add',         label: 'Client Tracker — Add/Edit Clients',   module: 'Client Tracker',   category: 'CRM'        },
  { id: 'clients_delete',      label: 'Client Tracker — Delete Clients',     module: 'Client Tracker',   category: 'CRM'        },
  { id: 'clients_revenue',     label: 'Client Tracker — Revenue Tracking',   module: 'Client Tracker',   category: 'CRM'        },
  { id: 'audit_basic',         label: 'Audit Tool — Run Basic Audit',        module: 'Audit Tool',       category: 'Audit'      },
  { id: 'audit_full',          label: 'Audit Tool — Full 20-Point Audit',    module: 'Audit Tool',       category: 'Audit'      },
  { id: 'audit_competitors',   label: 'Audit Tool — Competitor Analysis',    module: 'Audit Tool',       category: 'Audit'      },
  { id: 'audit_ai_finder',     label: 'Audit Tool — AI Competitor Finder',   module: 'Audit Tool',       category: 'Audit'      },
  { id: 'audit_share',         label: 'Audit Tool — Share/Download Report',  module: 'Audit Tool',       category: 'Audit'      },
  { id: 'audit_history',       label: 'Audit Tool — Audit History',          module: 'Audit Tool',       category: 'Audit'      },
  { id: 'audit_to_proposal',   label: 'Audit Tool — Create Proposal',        module: 'Audit Tool',       category: 'Audit'      },
  { id: 'blueprint_view',      label: 'GBP Blueprint — View & Fill',         module: 'GBP Blueprint',    category: 'Blueprint'  },
  { id: 'blueprint_generate',  label: 'GBP Blueprint — Generate Document',   module: 'GBP Blueprint',    category: 'Blueprint'  },
  { id: 'proposal_create',     label: 'Proposal Builder — Create Proposal',  module: 'Proposal Builder', category: 'Proposals'  },
  { id: 'proposal_share',      label: 'Proposal Builder — Share/Download',   module: 'Proposal Builder', category: 'Proposals'  },
  { id: 'pitch_script',        label: 'Pitch Script — Generate Script',      module: 'Pitch Script',     category: 'Proposals'  },
  { id: 'ai_review',           label: 'AI Tools — Review Responder',         module: 'AI Tools',         category: 'AI Tools'   },
  { id: 'ai_keywords',         label: 'AI Tools — Keyword Suggester',        module: 'AI Tools',         category: 'AI Tools'   },
  { id: 'ai_posts',            label: 'AI Tools — Google Post Generator',    module: 'AI Tools',         category: 'AI Tools'   },
  { id: 'ai_qa',               label: 'AI Tools — Q&A Generator',            module: 'AI Tools',         category: 'AI Tools'   },
  { id: 'ai_description',      label: 'AI Tools — Description Writer',       module: 'AI Tools',         category: 'AI Tools'   },
  { id: 'ai_report',           label: 'AI Tools — Monthly Report',           module: 'AI Tools',         category: 'AI Tools'   },
  { id: 'risk_checker',        label: 'Risk Checker — Suspension Check',     module: 'Risk Checker',     category: 'Risk'       },
  { id: 'risk_share',          label: 'Risk Checker — Share Report',         module: 'Risk Checker',     category: 'Risk'       },
  { id: 'settings_general',    label: 'Settings — General & Currency',       module: 'Settings',         category: 'Settings'   },
  { id: 'settings_ai',         label: 'Settings — AI/Groq Key',              module: 'Settings',         category: 'Settings'   },
  { id: 'settings_access',     label: 'Settings — Access Control',           module: 'Settings',         category: 'Settings'   },
]

// ─── DEFAULT PERMISSIONS ──────────────────────────────────────────────────────
export const DEFAULT_PERMISSIONS = {
  super_admin: FEATURES.map(f => f.id),
  admin:       FEATURES.map(f => f.id),
  pro: FEATURES.filter(f => f.id !== 'clients_delete' && f.id !== 'settings_access').map(f => f.id),
  // Basic: ONLY audit_basic and settings_general
  // Proposal Builder, Pitch Script, AI Tools, Risk Checker — ALL HIDDEN
  basic: [
    'audit_basic',
    'settings_general',
  ]
}

// ─── MODULES COMPLETELY HIDDEN FROM BASIC USERS ───────────────────────────────
// These module IDs will not appear in the sidebar at all for basic users
// Clicking is impossible — they cannot even see the nav item
export const BASIC_HIDDEN_MODULES = [
  'proposal',   // Proposal Builder
  'pitch',      // Pitch Script
  'ai',         // AI Tools
  'risk',       // Risk Checker
  'blueprint',  // GBP Blueprint
  'clients',    // Client Tracker
  'dashboard',  // Revenue Dashboard
]

// ─── PERMISSION CHECK ─────────────────────────────────────────────────────────
export function hasPermission(session, featureId) {
  if (!session) return false
  if (session.role === 'super_admin' || session.email === 'frankevgloballtd@gmail.com') return true
  if (session.role === 'admin') return true
  const perms = session.permissions || DEFAULT_PERMISSIONS[session.role] || DEFAULT_PERMISSIONS.basic
  return perms.includes(featureId)
}

// Check if a module should be VISIBLE in the sidebar for this user
export function canSeeModule(session, moduleId) {
  if (!session) return false
  if (session.role === 'super_admin' || session.email === 'frankevgloballtd@gmail.com') return true
  if (session.role === 'admin' || session.role === 'pro') return true
  // Basic user — hide these modules entirely
  return !BASIC_HIDDEN_MODULES.includes(moduleId)
}

export function getRolePermissions(role, customPerms) {
  if (customPerms && customPerms.length > 0) return customPerms
  return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.basic
}
