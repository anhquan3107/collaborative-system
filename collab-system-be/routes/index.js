import express from "express";
import authRoutes from "./authRoutes.js";
import projectRoutes from "./projectRoutes.js";
import userRoutes from "./userRoutes.js";
import invitationRoutes from "./invitationRoutes.js";
import passwordRoutes from "./passwordRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/password", passwordRoutes);
router.use("/projects", projectRoutes);
router.use("/user", userRoutes);
router.use("/invitations", invitationRoutes);

export default router;
