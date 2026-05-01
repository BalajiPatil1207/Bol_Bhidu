import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { createGroup, getMyGroups, getGroupMessages, sendGroupMessage } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", authenticateToken, createGroup);
router.get("/my-groups", authenticateToken, getMyGroups);
router.get("/:groupId/messages", authenticateToken, getGroupMessages);
router.post("/:groupId/send", authenticateToken, sendGroupMessage);

export default router;
