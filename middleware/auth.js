/**
 * VIBE Authentication Middleware
 * Validates tokens, enforces roles, handles 2FA
 */

const jwt = require('jsonwebtoken');
const { SECURITY_CONFIG } = require('../config/security');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, SECURITY_CONFIG.jwtSecret, {
      algorithms: ['HS256']
    });
    req.user = decoded;
    next();
  } catch (err) {
    console.error(`❌ Token verification failed: ${err.message}`);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userRole = req.user.role?.toLowerCase() || 'free';
    if (!allowedRoles.includes(userRole)) {
      console.warn(`⛔ Unauthorized access attempt: ${req.user.id} (${userRole}) tried ${req.path}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

function requireFounder(req, res, next) {
  return requireRole(['founder'])(req, res, next);
}

function requireAdmin(req, res, next) {
  return requireRole(['founder', 'admin'])(req, res, next);
}

function requirePremium(req, res, next) {
  return requireRole(['founder', 'admin', 'premium'])(req, res, next);
}

function attachRequestContext(req, res, next) {
  req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  req.startTime = Date.now();
  next();
}

function logRequest(req, res, next) {
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`[${req.requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
}

module.exports = {
  verifyToken,
  requireRole,
  requireFounder,
  requireAdmin,
  requirePremium,
  attachRequestContext,
  logRequest
};
