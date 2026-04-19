import { verifyToken } from "../helper/authHelper.js";
import { handle401 } from "../helper/errorHandler.js";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  const token = bearerToken || req.cookies?.jwt;

  if (!token) {
    return handle401(res, "No token provided");
  }

  const decoded = verifyToken(token);
  if (!decoded?.userId) {
    return handle401(res, "Invalid or expired token");
  }

  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    return handle401(res, "User not found");
  }

  req.user = user;
  next();
};
