// JWT Authentication Middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token and attach authenticated user to request
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token payload and exclude password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      next(); // Proceed to next middleware or controller
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
  }

  // If no token was provided in header
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = protect;
