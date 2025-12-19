import db from "../config/database.js";
import { isProjectMember } from "./projectMemberModel.js";

/**
 * Get all projects that a user is a member of
 */
export async function getProjectsByUser(userId, search = "") {
  const searchSql = `%${search}%`;

  const [rows] = await db.query(
    `SELECT DISTINCT p.*
     FROM projects p
     LEFT JOIN project_members pm ON p.id = pm.project_id
     WHERE (p.user_id = ? OR pm.user_id = ?)
       AND p.name LIKE ?
     ORDER BY p.created_at DESC`,
    [userId, userId, searchSql]
  );

  return rows;
}

/**
 * Create new project and add creator as owner
 */
export async function createProject(userId, name, description) {
  const [result] = await db.query(
    "INSERT INTO projects (user_id, name, description) VALUES (?, ?, ?)",
    [userId, name, description]
  );
  
  const projectId = result.insertId;
  
  // Add creator as project owner
  await db.query(
    "INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'owner')",
    [projectId, userId]
  );
  
  return { 
    id: projectId, 
    user_id: userId, 
    name, 
    description 
  };
}

/**
 * Delete project (only owner can delete)
 */
export async function deleteProject(projectId, userId) {
  // Verify user is project owner
  const [ownerRows] = await db.query(
    "SELECT 1 FROM projects WHERE id = ? AND user_id = ?",
    [projectId, userId]
  );
  
  if (ownerRows.length === 0) {
    throw new Error('Only project owner can delete project');
  }

  const [result] = await db.query(
    "DELETE FROM projects WHERE id = ?",
    [projectId]
  );
  return result.affectedRows > 0;
}

/**
 * Get project by ID with access control
 */
export async function getProjectById(projectId, userId) {
  const hasAccess = await isProjectMember(projectId, userId);
  if (!hasAccess) {
    throw new Error('Access denied to project');
  }

  const [rows] = await db.query(
    "SELECT * FROM projects WHERE id = ?",
    [projectId]
  );
  return rows[0];
}

export async function getProjectCount(userId) {
  const [rows] = await db.query(
    `SELECT COUNT(DISTINCT p.id) as count 
     FROM projects p
     LEFT JOIN project_members pm ON p.id = pm.project_id
     WHERE p.user_id = ? OR pm.user_id = ?`,
    [userId, userId]
  );
  return rows[0].count;
}