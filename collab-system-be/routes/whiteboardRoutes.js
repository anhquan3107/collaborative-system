// backend/routes/whiteboardRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

import {
  getProjectWhiteboards,
  getWhiteboard,
  createNewWhiteboard,
  saveWhiteboard,
} from "../controllers/whiteboardController.js";

const router = express.Router({ mergeParams: true });

// GET /api/projects/:projectId/whiteboard - List all whiteboards
router.get("/", verifyToken, getProjectWhiteboards); // CHANGE THIS

// GET /api/projects/:projectId/whiteboard/:whiteboardId - Get single whiteboard
router.get("/:whiteboardId", verifyToken, getWhiteboard);

// POST /api/projects/:projectId/whiteboard - Create whiteboard
router.post("/", verifyToken, createNewWhiteboard);

// PUT /api/projects/:projectId/whiteboard/:whiteboardId - Save whiteboard
router.put("/:whiteboardId", verifyToken, saveWhiteboard);

export default router;