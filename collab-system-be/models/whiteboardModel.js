// backend/models/whiteboardModel.js
import db from "../config/database.js";

/**
 * Create whiteboard for project
 */
export async function createWhiteboard(projectId, title) {
  const [result] = await db.query(
    `
    INSERT INTO whiteboards (project_id, title, data)
    VALUES (?, ?, ?)
  `,
    [projectId, title, "{}"]
  );

  return result.insertId;
}

/**
 * Get whiteboard by project
 */
export async function getWhiteboardByProject(projectId) {
  const [rows] = await db.query(
    `
    SELECT * FROM whiteboards
    WHERE project_id = ?
    LIMIT 1
  `,
    [projectId]
  );

  return rows[0] || null;
}

/**
 * Save full JSON snapshot
 */
export async function saveWhiteboardData(whiteboardId, dataJSON) {
  await db.query(
    `
    UPDATE whiteboards
    SET data = ?, updated_at = NOW()
    WHERE id = ?
  `,
    [dataJSON, whiteboardId]
  );
}
