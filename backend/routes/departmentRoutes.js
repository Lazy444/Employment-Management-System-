import express from "express";
import {
  listDepartments,
  createDepartment,
  updateDepartment,
} from "../controllers/departmentController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listDepartments);
router.post("/", protect, adminOnly, createDepartment);
router.put("/:id", protect, adminOnly, updateDepartment);

export default router;