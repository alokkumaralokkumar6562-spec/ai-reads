import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Unified JWT Secret - matches server/.env
export const JWT_SECRET = process.env.JWT_SECRET || 'ai-reads-jwt-production-secret-change-in-prod-2026';

/**
 * Generate a signed JWT token for a user
 * @param {Object} user - User object containing id, email, role, name
 * @param {string|number} expiresIn - Token validity duration (default: '7d')
 * @returns {string} Signed JWT token
 */
export const generateToken = (user, expiresIn = '7d') => {
  if (!user || !user.id || !user.email) {
    throw new Error('User payload with id and email is required to sign token');
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || 'student',
    name: user.name || 'AI Reads Learner'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Express middleware to authenticate Bearer JWT tokens in Authorization headers.
 * Gracefully handles expired, missing, and malformed tokens with standard 401 status.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Authentication required. Authorization header missing.',
      code: 'TOKEN_MISSING'
    });
  }

  // Parse "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      error: 'Invalid Authorization header format. Expected "Bearer <token>".',
      code: 'TOKEN_MALFORMED'
    });
  }

  const token = parts[1].trim();
  if (!token) {
    return res.status(401).json({
      error: 'Authentication token is empty.',
      code: 'TOKEN_EMPTY'
    });
  }

  // Backward compatibility support for initial un-minted demo placeholder tokens
  if (token === 'demo-auth-token-student') {
    req.user = {
      id: 'user-student-1',
      name: 'Alex Sharma',
      email: 'student@aireads.com',
      role: 'student'
    };
    return next();
  }

  if (token === 'demo-auth-token-admin') {
    req.user = {
      id: 'user-admin-1',
      name: 'Alok Kumar',
      email: 'admin@aireads.com',
      role: 'admin'
    };
    return next();
  }

  // Verify JWT against unified JWT_SECRET
  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Your session has expired. Please log in again to continue.',
          code: 'TOKEN_EXPIRED',
          expiredAt: err.expiredAt
        });
      }

      return res.status(401).json({
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID',
        details: err.message
      });
    }

    req.user = decodedUser;
    next();
  });
};

/**
 * Express middleware to verify Admin authorization
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden. Admin privileges required.',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

export default {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  requireAdmin
};
