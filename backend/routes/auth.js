// routes/authRoutes.js
import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

// final URL = /api/auth/login
router.post("/login", login); // 👈 do NOT put /auth/login here

export default router;
