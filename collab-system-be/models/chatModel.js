// backend/models/chatModel.js
import db from "../config/database.js";

/**
 * Save a new message
 */
export async function createMessage(projectId, userId, content) {
  const [result] = await db.query(
    "INSERT INTO messages (project_id, user_id, content) VALUES (?, ?, ?)",
    [projectId, userId, content]
  );
  
  // Fetch the full message details (with username) to return immediately
  const [rows] = await db.query(
    `SELECT m.*, u.username 
     FROM messages m 
     JOIN users u ON m.user_id = u.id 
     WHERE m.id = ?`,
    [result.insertId]
  );
  
  return rows[0];
}

/**
 * Get message history for a project
 */
export async function getProjectMessages(projectId, limit = 50) {
  const [rows] = await db.query(
    `SELECT m.id, m.content, m.created_at, m.user_id, u.username 
     FROM messages m 
     JOIN users u ON m.user_id = u.id 
     WHERE m.project_id = ? 
     ORDER BY m.created_at ASC 
     LIMIT ?`,
    [projectId, limit]
  );
  return rows;
}