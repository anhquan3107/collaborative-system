// backend/models/whiteboardModel.js
import db from "../config/database.js";
import { isProjectMember } from "./projectMemberModel.js";

/**
 * Create whiteboard for project
 */
export async function createWhiteboard(projectId, title, userId) {
  // Access check
  const hasAccess = await isProjectMember(projectId, userId);
  if (!hasAccess) throw new Error("Access denied to project");

  const [result] = await db.query(
    `INSERT INTO whiteboards (project_id, title, data) VALUES (?, ?, ?)`,
    [projectId, title, "[]"] // initial empty strokes
  );
  return result.insertId;
}

/**
 * Get all whiteboards for a project
 */
export async function listWhiteboardsByProject(projectId, userId) {
  // Access check
  const hasAccess = await isProjectMember(projectId, userId);
  if (!hasAccess) throw new Error("Access denied to project");

  const [rows] = await db.query(
    `SELECT id, project_id, title, updated_at 
     FROM whiteboards 
     WHERE project_id = ? 
     ORDER BY updated_at DESC`,
    [projectId]
  );

  return rows;
}

/**
 * Get whiteboard by ID (with access control)
 */
export async function getWhiteboardById(whiteboardId, projectId, userId) {
  // Access check
  const hasAccess = await isProjectMember(projectId, userId);
  if (!hasAccess) throw new Error("Access denied to project");

  const [rows] = await db.query(
    `SELECT * 
     FROM whiteboards 
     WHERE id = ? AND project_id = ?`,
    [whiteboardId, projectId]
  );

  return rows[0] || null;
}

/**
 * Get single whiteboard per project (if using single-board mode)
 */
export async function getWhiteboardByProject(projectId, userId) {
  // Access check
  const hasAccess = await isProjectMember(projectId, userId);
  if (!hasAccess) throw new Error("Access denied to project");

  const [rows] = await db.query(
    `SELECT * FROM whiteboards WHERE project_id = ? LIMIT 1`,
    [projectId]
  );
  return rows[0] || null;
}

/**
 * Save whiteboard data (with access check)
 */
export async function saveWhiteboardData(whiteboardId, projectId, dataJSON, userId) {
  // Ensure the board belongs to the project AND user has access
  const whiteboard = await getWhiteboardById(whiteboardId, projectId, userId);
  if (!whiteboard) throw new Error("Whiteboard not found or access denied");

  await db.query(
    `UPDATE whiteboards 
     SET data = ?, updated_at = NOW() 
     WHERE id = ?`,
    [dataJSON, whiteboardId]
  );
}
