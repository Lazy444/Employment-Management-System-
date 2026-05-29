import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getEmployeeSettings,
  updateEmployeeSettings,
  changeEmployeePassword,
} from "../controllers/employeeSettingsController.js";

const router = express.Router();

router.use(protect);

router.get("/", getEmployeeSettings);
router.put("/", updateEmployeeSettings);
router.put("/password", changeEmployeePassword);

export default router;