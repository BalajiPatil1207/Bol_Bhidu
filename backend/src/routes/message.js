import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { 
  getAllContacts, 
  getChatPartners, 
  getMessagesByUserId, 
  sendMessage,
  markMessagesAsSeen,
  toggleReaction,
  editMessage,
  deleteMessage
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", authenticateToken, getAllContacts);
router.get("/partners", authenticateToken, getChatPartners);
router.get("/:id", authenticateToken, getMessagesByUserId);

router.post("/send/:id", authenticateToken, sendMessage);
router.put("/seen/:id", authenticateToken, markMessagesAsSeen);
router.post("/react/:messageId", authenticateToken, toggleReaction);
router.put("/edit/:messageId", authenticateToken, editMessage);
router.delete("/delete/:messageId", authenticateToken, deleteMessage);

export default router;