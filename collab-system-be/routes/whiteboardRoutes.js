// backend/routes/whiteboardRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

import {
  getWhiteboard,
  createNewWhiteboard,
  saveWhiteboard,
} from "../controllers/whiteboardController.js";

const router = express.Router({ mergeParams: true });

// GET /api/projects/:projectId/whiteboard
router.get("/", verifyToken, getWhiteboard);

// POST /api/projects/:projectId/whiteboard
router.post("/", verifyToken, createNewWhiteboard);

// PUT /api/projects/:projectId/whiteboard/:whiteboardId
router.put("/:whiteboardId", verifyToken, saveWhiteboard);

export default router;
