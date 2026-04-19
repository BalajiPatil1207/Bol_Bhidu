import express from "express";
import { 
  login, 
  logout, 
  signup, 
  updateProfile, 
  checkAuth 
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

router.post("/signup", arcjetProtection, signup);
router.post("/login", arcjetProtection, login);
router.post("/logout", logout);

router.put("/update-profile", authenticateToken, updateProfile);

router.get("/check", authenticateToken, checkAuth);

export default router;