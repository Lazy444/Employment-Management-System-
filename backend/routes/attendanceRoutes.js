import express from "express";
import { punchIn, punchOut, myToday } from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js"; // your auth middleware

const router = express.Router();

router.post("/punch-in", protect, punchIn);
router.post("/punch-out", protect, punchOut);
router.get("/me/today", protect, myToday);

export default router;
