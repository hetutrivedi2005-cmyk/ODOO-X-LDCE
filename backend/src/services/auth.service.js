const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user.
 * @param {object} userData - { name, email, password }
 * @returns {object} { user: { id, name, email }, token }
 */
const register = async ({ name, email, password }) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  // Hash the plaintext password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create new user in PostgreSQL
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
  });

  // Generate JWT token
  const token = generateToken({ userId: user.id });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

/**
 * Log in an existing user.
 * @param {object} credentials - { email, password }
 * @returns {object} { user: { id, name, email }, token }
 */
const login = async ({ email, password }) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken({ userId: user.id });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

/**
 * Update user profile details.
 * @param {string} userId
 * @param {object} profileData - { name, currency, language, avatarUrl }
 * @returns {object} { user: { id, name, email, avatarUrl, currency, language } }
 */
const updateProfile = async (userId, { name, currency, language, avatarUrl }) => {
  if (avatarUrl && avatarUrl.length > 7 * 1024 * 1024) {
    const error = new Error('Profile image size exceeds 5MB limit');
    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || undefined,
      currency: currency || undefined,
      language: language || undefined,
      avatarUrl: avatarUrl === '' ? null : avatarUrl,
    },
  });

  return {
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      currency: updatedUser.currency,
      language: updatedUser.language,
      role: updatedUser.role,
      status: updatedUser.status,
    },
  };
};

module.exports = {
  register,
  login,
  updateProfile,
};
