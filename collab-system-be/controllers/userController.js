import { getUserById } from "../models/userModel.js";

// GET /api/user/me
export async function getMe(req, res) {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error in getMe():", err);
    res.status(500).json({ message: "Server error" });
  }
}
