import express from "express";
import {
  createTask,
  getMyTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👨‍💼 ADMIN
router.post("/", protect, adminOnly, createTask);

// 👨‍💻 EMPLOYEE
router.get("/my", protect, getMyTasks);

// COMMON
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;