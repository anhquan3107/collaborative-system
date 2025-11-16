import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getMe } from "../controllers/userController.js";

const router = express.Router();

// /api/user/me
router.get("/me", verifyToken, getMe);

export default router;