// backend/routes/documentRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  listDocuments,
  getDocument,
  createNewDocument,
  saveDocument,
} from "../controllers/documentController.js";

const router = express.Router({ mergeParams: true });

// GET /api/projects/:projectId/documents
router.get("/", verifyToken, listDocuments);

// POST /api/projects/:projectId/documents
router.post("/", verifyToken, createNewDocument);

// GET /api/projects/:projectId/documents/:docId
router.get("/:docId", verifyToken, getDocument);

// PUT /api/projects/:projectId/documents/:docId
router.put("/:docId", verifyToken, saveDocument);

export default router;
