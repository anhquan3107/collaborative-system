import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { updateRole } from "../controllers/projectMemberController.js";

const router = express.Router();

// Update member role - only owners can change roles
router.put("/:projectId/members/:userId/role", verifyToken, updateRole);

export default router;
