import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { listProjects, addProject, removeProject, getTotalProjects } from "../controllers/projectController.js";
import { listProjectMembers, removeMember } from "../controllers/projectMemberController.js";

import documentRoutes from "./documentRoutes.js";
import chatRoutes from "./chatRoutes.js";

const router = express.Router({ mergeParams: true });

// All routes require login
router.get("/", verifyToken, listProjects);
router.post("/", verifyToken, addProject);
router.get("/count", verifyToken, getTotalProjects);

router.delete("/:id", verifyToken, removeProject);

router.get("/:projectId/members", verifyToken, listProjectMembers);
router.delete("/:projectId/members/:userId", verifyToken, removeMember);

router.use("/:projectId/documents", documentRoutes);
router.use("/:projectId/messages", chatRoutes);

export default router;
