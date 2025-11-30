import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  listProjects,
  addProject,
  removeProject,
  getTotalProjects,
} from "../controllers/projectController.js";
import {
  listProjectMembers,
  removeMember,
  updateRole,
} from "../controllers/projectMemberController.js";

import documentRoutes from "./documentRoutes.js";
import chatRoutes from "./chatRoutes.js";
import whiteboardRoutes from "./whiteboardRoutes.js";

const router = express.Router({ mergeParams: true });

// All routes require login
router.get("/", verifyToken, listProjects);
router.post("/", verifyToken, addProject);
router.get("/count", verifyToken, getTotalProjects);

router.delete("/:id", verifyToken, removeProject);

router.get("/:projectId/members", verifyToken, listProjectMembers);
router.delete("/:projectId/members/:userId", verifyToken, removeMember);
router.put("/:projectId/members/:userId/role", verifyToken, updateRole);

router.use("/:projectId/documents", documentRoutes);
router.use("/:projectId/messages", chatRoutes);
router.use("/:projectId/whiteboards", whiteboardRoutes);



export default router;
