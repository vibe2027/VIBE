/**
 * VIBE Rate Limiter
 * Prevents abuse and DDoS attacks
 */

const { SECURITY_CONFIG } = require('../config/security');

const rateLimitStore = new Map();

function rateLimiter(limitType = 'api') {
  return (req, res, next) => {
    const limit = SECURITY_CONFIG.rateLimits[limitType];
    if (!limit) return next();

    const key = `${limitType}:${req.ip}`;
    const now = Date.now();
    const windowStart = now - limit.window;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    let requests = rateLimitStore.get(key);
    requests = requests.filter(timestamp => timestamp > windowStart);

    if (requests.length >= limit.maxRequests) {
      console.warn(`⚠️ Rate limit exceeded: ${key}`);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((requests[0] + limit.window - now) / 1000)
      });
    }

    requests.push(now);
    rateLimitStore.set(key, requests);

    res.set('X-RateLimit-Limit', limit.maxRequests);
    res.set('X-RateLimit-Remaining', limit.maxRequests - requests.length);
    res.set('X-RateLimit-Reset', new Date(windowStart + limit.window).toISOString());

    next();
  };
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, requests] of rateLimitStore.entries()) {
    const filtered = requests.filter(ts => ts > now - 24 * 60 * 60 * 1000);
    if (filtered.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, filtered);
    }
  }
}

// Clean up every hour
setInterval(cleanupExpiredEntries, 60 * 60 * 1000);

module.exports = {
  rateLimiter,
  cleanupExpiredEntries
};
