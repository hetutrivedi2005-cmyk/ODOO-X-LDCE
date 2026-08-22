const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_development_only';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a JWT token containing the payload.
 * @param {object} payload - Identity information to embed in token (e.g., { userId: "..." })
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify a JWT token.
 * @param {string} token - Signed token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
