import db from "../config/database.js";

// Get all projects by user_id
export async function getProjectsByUser(userId) {
  const [rows] = await db.query(
    "SELECT id, name, description, created_at FROM projects WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

// Create new project
export async function createProject(userId, name, description) {
  const [result] = await db.query(
    "INSERT INTO projects (user_id, name, description) VALUES (?, ?, ?)",
    [userId, name, description]
  );
  return { id: result.insertId, name, description };
}

// Delete project
export async function deleteProject(id, userId) {
  const [result] = await db.query(
    "DELETE FROM projects WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
}