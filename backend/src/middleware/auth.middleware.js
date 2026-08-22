const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

/**
 * Middleware to protect routes and require JWT authentication.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Authorization header with Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Secure user info by removing sensitive fields
    delete user.passwordHash;

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Return generic auth required error on expiry/validation failure
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }
};

module.exports = {
  protect,
};
