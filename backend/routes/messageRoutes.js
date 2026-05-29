import express from "express";
import {
  getEmployeeList,
  createOrGetConversation,
  getMyConversations,
  getMessagesByConversation,
  sendMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/employees", protect, getEmployeeList);
router.post("/conversation", protect, createOrGetConversation);
router.get("/conversation", protect, getMyConversations);
router.get("/conversation/:conversationId", protect, getMessagesByConversation);
router.post("/send", protect, sendMessage);

export default router;
