// middleware/authMiddleware.js
const { verifyToken } = require('../helper/authHelper');
const { handle401 } = require('../helper/errorHandler');

/**
 * Authentication Middleware
 * Checks for JWT token in Authorization header
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return handle401(res, "No token provided");
  }

  const token = authHeader.split(" ")[1];// Bearer <token>

  if (!token) {
    return handle401(res, "No token provided, access denied");
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return handle401(res, "Invalid or expired token");
  }

  // Attach user data to request object
  req.user = decoded;
  next();
};



module.exports = {
  authenticateToken,
  
};
