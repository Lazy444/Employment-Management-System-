// routes/adminRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { upload } from "../middleware/uploadMiddleware.js";

// ✅ Employee CRUD controller
import {
  createEmployee,
  listEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/adminController.js";

// ✅ Leave admin controller
import {
  listLeaves,
  approveLeave,
  rejectLeave,
} from "../controllers/adminLeaveController.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// -------------------------
// EMPLOYEE CRUD
// -------------------------
router.get("/employees", listEmployees);

// ✅ FormData image upload
router.post("/employees", upload.single("image"), createEmployee);

// ✅ FormData image upload
router.put("/employees/:id", upload.single("image"), updateEmployee);

router.delete("/employees/:id", deleteEmployee);

// -------------------------
// LEAVE ADMIN APIs
// -------------------------
router.get("/leaves", listLeaves);
router.patch("/leaves/:id/approve", approveLeave);
router.patch("/leaves/:id/reject", rejectLeave);

export default router;
