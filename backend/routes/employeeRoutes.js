import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMyProfile } from "../controllers/employeeController.js";
import * as leaveCtrl from "../controllers/employee.leave.controller.js";

const router = express.Router();

// ✅ Protect everything below this line
router.use(protect);

// Profile
router.get("/me", getMyProfile);

// Leaves
router.get("/leaves", leaveCtrl.getMyLeaves);
router.post("/leaves", leaveCtrl.createLeave);
router.get("/leaves/:id", leaveCtrl.getMyLeaveById);
router.patch("/leaves/:id/cancel", leaveCtrl.cancelMyLeave);

export default router;
