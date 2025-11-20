// backend/models/projectMemberModel.js
import db from "../config/database.js";

/**
 * Add a user as a member to a project
 */
export async function addProjectMember(projectId, userId, role = 'editor') {
  const [result] = await db.query(
    "INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)",
    [projectId, userId, role]
  );
  return result.insertId;
}

/**
 * Remove a user from a project
 */
export async function removeProjectMember(projectId, userId) {
  const [result] = await db.query(
    "DELETE FROM project_members WHERE project_id = ? AND user_id = ?",
    [projectId, userId]
  );
  return result.affectedRows > 0;
}

/**
 * Get all members of a project (including project owner)
 */
export async function getProjectMembers(projectId) {
  const [rows] = await db.query(
    `SELECT 
      pm.user_id,
      u.username,
      u.email,
      pm.role,
      pm.joined_at,
      CASE 
        WHEN p.user_id = pm.user_id THEN 'owner'
        ELSE pm.role 
      END as actual_role
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    JOIN projects p ON pm.project_id = p.id
    WHERE pm.project_id = ?
    ORDER BY 
      CASE WHEN p.user_id = pm.user_id THEN 1 ELSE 2 END,
      pm.joined_at ASC`,
    [projectId]
  );
  return rows;
}

/**
 * Check if a user is a member of a project
 */
export async function isProjectMember(projectId, userId) {
  const [rows] = await db.query(
    `SELECT 1 
     FROM (
       -- Check if user is project owner
       SELECT user_id FROM projects WHERE id = ? AND user_id = ?
       UNION
       -- Check if user is project member
       SELECT user_id FROM project_members WHERE project_id = ? AND user_id = ?
     ) AS project_access`,
    [projectId, userId, projectId, userId]
  );
  return rows.length > 0;
}

/**
 * Check if user is project owner
 */
export async function isProjectOwner(projectId, userId) {
  const [rows] = await db.query(
    `SELECT 1 
     FROM projects 
     WHERE id = ? AND user_id = ?`,
    [projectId, userId]
  );
  return rows.length > 0;
}

/**
 * Get user's role in a project
 */
export async function getUserProjectRole(projectId, userId) {
  // First check if user is project owner
  const isOwner = await isProjectOwner(projectId, userId);
  if (isOwner) {
    return 'owner';
  }

  // If not owner, check their member role
  const [rows] = await db.query(
    `SELECT role 
     FROM project_members 
     WHERE project_id = ? AND user_id = ?`,
    [projectId, userId]
  );
  
  return rows[0]?.role || null;
}

/**
 * Update a member's role
 */
export async function updateMemberRole(projectId, userId, role) {
  const [result] = await db.query(
    "UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?",
    [role, projectId, userId]
  );
  return result.affectedRows > 0;
}