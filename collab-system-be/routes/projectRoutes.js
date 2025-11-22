import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { listProjects, addProject, removeProject } from "../controllers/projectController.js";
import { listProjectMembers } from "../controllers/projectMemberController.js";

import documentRoutes from "./documentRoutes.js"
import chatRoutes from "./chatRoutes.js";

const router = express.Router({ mergeParams: true });

// All routes require login
router.get("/", verifyToken, listProjects);
router.post("/", verifyToken, addProject);
router.delete("/:id", verifyToken, removeProject);

router.get("/:projectId/members", verifyToken, listProjectMembers);

router.use("/:projectId/documents", documentRoutes);
router.use("/:projectId/messages", chatRoutes);

export default router;
