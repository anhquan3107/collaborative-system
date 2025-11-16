import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { listProjects, addProject, removeProject } from "../controllers/projectController.js";
import documentRoutes from "./documentRoutes.js"

const router = express.Router();

// All routes require login
router.get("/", verifyToken, listProjects);
router.post("/", verifyToken, addProject);
router.delete("/:id", verifyToken, removeProject);

router.use("/:projectId/documents", documentRoutes);

export default router;
