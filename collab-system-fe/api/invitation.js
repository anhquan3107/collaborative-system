// frontend/api/invitation.js
import { apiGet, apiPost, apiDelete } from "./apiClient.js";
import { paths } from "../constants/paths.js";

/**
 * Send invitation to project
 * POST /api/projects/:projectId/invitations
 */
export function inviteToProject(projectId, email, role) {
  return apiPost(paths.invitations.project(projectId), { email, role });
}

/**
 * Get project invitations
 * GET /api/projects/:projectId/invitations
 */
export function getProjectInvitations(projectId) {
  return apiGet(paths.invitations.project(projectId));
}

/**
 * Cancel invitation
 * DELETE /api/projects/:projectId/invitations/:invitationId
 */
export function cancelInvitation(projectId, invitationId) {
  return apiDelete(paths.invitations.projectDetail(projectId, invitationId));
}

/**
 * Get user's pending invitations
 * GET /api/invitations/pending
 */
export function getPendingInvitations() {
  return apiGet(paths.invitations.pending);
}

/**
 * Accept invitation
 * POST /api/invitations/:token/accept
 */
export function acceptInvitation(token) {
  return apiPost(paths.invitations.accept(token), {});
}

/**
 * Decline invitation
 * POST /api/invitations/:token/decline
 */
export function declineInvitation(token) {
  return apiPost(paths.invitations.decline(token), {});
}
