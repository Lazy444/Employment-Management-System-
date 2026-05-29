import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMySalary,
  getMySalaryHistory,
  downloadSalaryReportPdf,
} from "../controllers/employeeSalaryController.js";

const router = express.Router();

router.get("/salary", protect, getMySalary);
router.get("/salary/history", protect, getMySalaryHistory);
router.get("/salary/report.pdf", protect, downloadSalaryReportPdf);

export default router;