// backend/models/projectInvitationModel.js
import db from "../config/database.js";
import crypto from 'crypto';

/**
 * Create a new project invitation
 */
export async function createProjectInvitation(invitationData) {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const [result] = await db.query(
    "INSERT INTO project_invitations (project_id, inviter_id, invitee_email, token, role, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
    [
      invitationData.projectId,
      invitationData.inviterId,
      invitationData.inviteeEmail,
      token,
      invitationData.role || 'editor',
      expiresAt
    ]
  );
  
  return {
    id: result.insertId,
    token: token,
    expiresAt: expiresAt
  };
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token) {
  const [rows] = await db.query(
    `SELECT 
      pi.*,
      p.name as project_name,
      u.username as inviter_name,
      u.email as inviter_email
    FROM project_invitations pi
    JOIN projects p ON pi.project_id = p.id
    JOIN users u ON pi.inviter_id = u.id
    WHERE pi.token = ? AND pi.status = 'pending' AND pi.expires_at > NOW()`,
    [token]
  );
  return rows[0];
}

/**
 * Get all pending invitations for a project
 */
export async function getProjectInvitations(projectId) {
  const [rows] = await db.query(
    `SELECT 
      pi.*,
      u.username as inviter_name
    FROM project_invitations pi
    JOIN users u ON pi.inviter_id = u.id
    WHERE pi.project_id = ? AND pi.status = 'pending'
    ORDER BY pi.created_at DESC`,
    [projectId]
  );
  return rows;
}

export async function setInvitationStatusByToken(token, status) {
  const [result] = await db.query(
    "UPDATE project_invitations SET status = ? WHERE token = ?",
    [status, token]
  );
  return result.affectedRows > 0;
}

export async function setInvitationStatusById(invitationId, status, inviterId) {
  const [result] = await db.query(
    "UPDATE project_invitations SET status = ? WHERE id = ? AND inviter_id = ?",
    [status, invitationId, inviterId]
  );
  return result.affectedRows > 0;
}

/**
 * Find user by email
 */
export async function getUserByEmail(email) {
  const [rows] = await db.query(
    "SELECT id, username, email FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
}

/**
 * Get user's pending invitations by email
 */
export async function getPendingInvitationsByEmail(email) {
  const [rows] = await db.query(
    `SELECT 
      pi.*,
      p.name as project_name,
      u.username as inviter_name
    FROM project_invitations pi
    JOIN projects p ON pi.project_id = p.id
    JOIN users u ON pi.inviter_id = u.id
    WHERE pi.invitee_email = ? AND pi.status = 'pending' AND pi.expires_at > NOW()
    ORDER BY pi.created_at DESC`,
    [email]
  );
  return rows;
}