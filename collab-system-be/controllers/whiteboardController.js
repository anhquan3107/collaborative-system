// backend/controllers/whiteboardController.js
import {
  createWhiteboard,
  getWhiteboardByProject,
  saveWhiteboardData,
} from "../models/whiteboardModel.js";

/**
 * GET /api/projects/:projectId/whiteboard
 */
export async function getWhiteboard(req, res) {
  try {
    const projectId = Number(req.params.projectId);

    const wb = await getWhiteboardByProject(projectId, req.user.id);
    if (!wb) {
      return res.json({ whiteboard: null }); // not an error, just none created
    }

    res.json({ whiteboard: wb });
  } catch (err) {
    console.error("getWhiteboard error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/**
 * POST /api/projects/:projectId/whiteboard
 * body: { title }
 */
export async function createNewWhiteboard(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const { title } = req.body;

    const whiteboardId = await createWhiteboard(projectId, title || "Untitled Whiteboard");
    res.status(201).json({ whiteboardId });
  } catch (err) {
    console.error("createNewWhiteboard error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/**
 * PUT /api/projects/:projectId/whiteboard/:whiteboardId
 * body: { data }
 */
export async function saveWhiteboard(req, res) {
  try {
    const whiteboardId = Number(req.params.whiteboardId);
    const { data } = req.body;

    await saveWhiteboardData(whiteboardId, JSON.stringify(data));
    res.json({ message: "Saved" });
  } catch (err) {
    console.error("saveWhiteboard error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}
