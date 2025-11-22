// backend/routes/chatRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getMessages } from "../controllers/chatController.js";

const router = express.Router({ mergeParams: true });

// GET /api/projects/:projectId/messages
router.get("/", verifyToken, getMessages);

export default router;