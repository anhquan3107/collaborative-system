import express from "express";
import authRoutes from "./authRoutes.js";
import { verifyToken } from "../middleware/authMiddleware.js"
import { getUserById } from "../models/userModel.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id); // fetch full record (id, username, email)
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// (Optional) Example protected resource placeholder
router.get("/projects", verifyToken, async (req, res) => {
  // later: load projects by req.user.id
  res.json({ projects: [] });
});

router.get("/test", (req, res) => res.json({ message: "API working" }));

export default router;
