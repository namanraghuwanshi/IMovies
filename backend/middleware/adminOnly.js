// Admin Authorization Middleware
// Must be used AFTER protect middleware so req.user is populated

const adminOnly = (req, res, next) => {
  // Check if user is authenticated and has the admin role
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

module.exports = adminOnly;
