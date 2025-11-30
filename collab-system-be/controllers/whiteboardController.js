// backend/controllers/whiteboardController.js
import {
  createWhiteboard,
  getWhiteboardById,
  saveWhiteboardData,
  listWhiteboardsByProject
} from "../models/whiteboardModel.js";

/**
 * GET /api/projects/:projectId/whiteboards
 * Return an array of whiteboards
 */
export async function getProjectWhiteboards(req, res) {
  try {
    const projectId = Number(req.params.projectId);

    // pass userId for access check
    const whiteboards = await listWhiteboardsByProject(projectId, req.user.id);

    res.json({ whiteboards: whiteboards });
  } catch (err) {
    console.error("getProjectWhiteboards error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/**
 * GET /api/projects/:projectId/whiteboards/:whiteboardId
 * Return a single whiteboard
 */
export async function getWhiteboard(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const whiteboardId = Number(req.params.whiteboardId);

    // access-controlled fetch
    const whiteboard = await getWhiteboardById(
      whiteboardId,
      projectId,
      req.user.id
    );

    if (!whiteboard) {
      return res.status(404).json({ message: "Whiteboard not found" });
    }

    res.json({ whiteboard });
  } catch (err) {
    console.error("getWhiteboard error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/**
 * POST /api/projects/:projectId/whiteboards
 * Create a new whiteboard
 */
export async function createNewWhiteboard(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const { title } = req.body;

    const whiteboardId = await createWhiteboard(
      projectId,
      title || "Untitled Whiteboard",
      req.user.id
    );

    const whiteboard = await getWhiteboardById(
      whiteboardId,
      projectId,
      req.user.id
    );

    res.status(201).json({ whiteboard });
  } catch (err) {
    console.error("createNewWhiteboard error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

/**
 * PUT /api/projects/:projectId/whiteboards/:whiteboardId
 * Save whiteboard data
 */
export async function saveWhiteboard(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const whiteboardId = Number(req.params.whiteboardId);
    const { content } = req.body;

    await saveWhiteboardData(
      whiteboardId,
      projectId,
      content,
      req.user.id
    );

    res.json({ message: "Saved" });
  } catch (err) {
    console.error("saveWhiteboard error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}
