// backend/routes/invitationRoutes.js - FIXED
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  inviteToProject,
  getInvitations,
  cancelInvitation,
  getMyPendingInvitations,
  acceptInvitation,
  declineInvitation
} from "../controllers/projectInvitationController.js";

const router = express.Router();

// NEW (Cleaner: /api/invitations/project/:projectId)
router.post("/project/:projectId", verifyToken, inviteToProject);
router.get("/project/:projectId", verifyToken, getInvitations);
router.delete("/project/:projectId/:invitationId", verifyToken, cancelInvitation);

// User invitation management - KEEP as is
router.get("/pending", verifyToken, getMyPendingInvitations);
router.post("/:token/accept", verifyToken, acceptInvitation);
router.post("/:token/decline", verifyToken, declineInvitation);

export default router;