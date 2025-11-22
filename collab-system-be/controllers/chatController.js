// backend/controllers/chatController.js
import { getProjectMessages } from "../models/chatModel.js";
import { isProjectMember } from "../models/projectMemberModel.js";

export async function getMessages(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    
    // Security Check
    const hasAccess = await isProjectMember(projectId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await getProjectMessages(projectId);
    res.json({ messages });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
}