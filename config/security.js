/**
 * VIBE Security Configuration
 * Role-based access control, encryption, rate limiting
 */

const crypto = require('crypto');

const SECURITY_CONFIG = {
  // JWT / Session
  jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  jwtExpiry: '7d',
  refreshTokenExpiry: '30d',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes

  // Encryption
  encryptionAlgorithm: 'aes-256-gcm',
  encryptionKey: process.env.ENCRYPTION_KEY || crypto.randomBytes(32),
  hashAlgorithm: 'sha256',

  // Rate Limiting
  rateLimits: {
    auth: { window: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 min
    api: { window: 60 * 1000, maxRequests: 100 }, // 100 per minute
    search: { window: 60 * 1000, maxRequests: 30 }, // 30 per minute
    tribunal: { window: 24 * 60 * 60 * 1000, maxRequests: 3 } // 3 per day
  },

  // CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://vibegay.ca', 'https://app.vibegay.ca'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  },

  // IP Whitelist (for admin)
  ipWhitelist: process.env.ADMIN_IP_WHITELIST?.split(',') || [],

  // Password Policy
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    historyCount: 5 // Can't reuse last 5 passwords
  },

  // 2FA
  twoFactorAuth: {
    enabled: true,
    totp: {
      issuer: 'VIBE',
      window: 1 // Allow 1 time step window
    },
    backup: {
      codes: 10,
      format: 'XXXX-XXXX' // 4-4 format
    }
  },

  // Data Retention
  dataRetention: {
    auditLogs: 365 * 2, // 2 years
    userMessages: 90, // 90 days
    guardianAudioRecordings: 7, // 7 days
    deletedUserData: 30, // 30 days soft delete before permanent
    failedLoginAttempts: 30 // 30 days
  },

  // Compliance
  compliance: {
    gdprEnabled: true,
    pipedaEnabled: true, // Canada's privacy law
    pciDssCompliant: true,
    encryptionRequired: ['email', 'phone', 'location', 'messages']
  }
};

const ROLE_PERMISSIONS = {
  founder: {
    // Full admin access
    users: ['create', 'read', 'update', 'delete', 'suspend', 'ban'],
    tribunal: ['create', 'read', 'update', 'resolve', 'override'],
    moderation: ['approve', 'reject', 'warn', 'ban'],
    analytics: ['view_all', 'export'],
    finance: ['view_all', 'refund', 'adjust'],
    support: ['escalate', 'manage_tickets'],
    immunityTribunal: true,
    canAccessFounderDashboard: true
  },

  admin: {
    users: ['read', 'update', 'suspend', 'ban'],
    tribunal: ['create', 'read', 'update', 'resolve'],
    moderation: ['approve', 'reject', 'warn', 'ban'],
    analytics: ['view_all'],
    finance: ['view_all'],
    support: ['manage_tickets'],
    immunityTribunal: true,
    canAccessFounderDashboard: false
  },

  operations: {
    users: ['read', 'update'],
    tribunal: ['create', 'read', 'update'],
    moderation: ['approve', 'reject', 'warn'],
    analytics: ['view_limited'],
    support: ['manage_tickets'],
    immunityTribunal: false,
    canAccessFounderDashboard: false
  },

  premium: {
    users: ['read_self', 'update_self'],
    tribunal: ['create_complaint'],
    moderation: [],
    analytics: [],
    finance: ['view_own'],
    support: ['submit_ticket'],
    immunityTribunal: false,
    canAccessFounderDashboard: false
  },

  free: {
    users: ['read_self', 'update_self'],
    tribunal: ['create_complaint'],
    moderation: [],
    analytics: [],
    finance: [],
    support: ['submit_ticket'],
    immunityTribunal: false,
    canAccessFounderDashboard: false
  }
};

function hasPermission(role, resource, action) {
  const permissions = ROLE_PERMISSIONS[role.toLowerCase()];
  if (!permissions) return false;
  const actions = permissions[resource] || [];
  return actions.includes(action);
}

function encrypt(text, key = SECURITY_CONFIG.encryptionKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(SECURITY_CONFIG.encryptionAlgorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText, key = SECURITY_CONFIG.encryptionKey) {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(SECURITY_CONFIG.encryptionAlgorithm, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function hashPassword(password) {
  return crypto.createHash(SECURITY_CONFIG.hashAlgorithm).update(password).digest('hex');
}

module.exports = {
  SECURITY_CONFIG,
  ROLE_PERMISSIONS,
  hasPermission,
  encrypt,
  decrypt,
  hashPassword
};
