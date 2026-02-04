// routes/departmentRoutes.js
import express from "express";
import {listDepartments, createDepartment } from "../controllers/departmentController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/" ,listDepartments);
router.post("/", protect, adminOnly, createDepartment);


export default router;
