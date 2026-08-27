/**
 * Response Sanitizer
 * Ensures all public-facing API responses hide personal information
 * and display "VIBE" as the brand name instead
 */

/**
 * Sanitize user/author information for public display
 * Replaces personal names with "VIBE" platform branding
 */
function sanitizeAuthor(data) {
  if (!data) return data;

  return {
    ...data,
    author_name: 'VIBE',
    full_name: 'VIBE',
    display_name: 'VIBE'
  };
}

/**
 * Sanitize user objects (from users table)
 */
function sanitizeUser(user) {
  if (!user) return user;

  return {
    id: user.id,
    // Hide personal information, show brand name
    name: 'VIBE',
    brand: 'VIBE'
  };
}

/**
 * Sanitize array of results (search, pubs, etc.)
 */
function sanitizeResults(results) {
  if (!Array.isArray(results)) return results;

  return results.map(result => sanitizeAuthor(result));
}

/**
 * Sanitize nested user relationships
 */
function sanitizeRelations(data) {
  if (!data) return data;

  const sanitized = { ...data };

  // Sanitize direct user references
  if (sanitized.user) {
    sanitized.user = sanitizeUser(sanitized.user);
  }

  // Sanitize author fields
  if (sanitized.author_name) {
    sanitized.author_name = 'VIBE';
  }

  // Sanitize user profile fields
  if (sanitized.profile) {
    sanitized.profile = sanitizeUser(sanitized.profile);
  }

  return sanitized;
}

module.exports = {
  sanitizeAuthor,
  sanitizeUser,
  sanitizeResults,
  sanitizeRelations
};
