// frontend/api/whiteboard.js
import { apiGet, apiPost, apiPut } from "./apiClient.js";
import { paths } from "../constants/paths.js";

/**
 * List whiteboards in a project
 * GET /api/projects/:projectId/whiteboards
 */
export function listWhiteboards(projectId) {
  return apiGet(paths.whiteboards.list(projectId));
}

/**
 * Get a single whiteboard
 * GET /api/projects/:projectId/whiteboards/:boardId
 */
export function getWhiteboard(projectId, boardId) {
  return apiGet(paths.whiteboards.detail(projectId, boardId));
}

/**
 * Create a new whiteboard
 * POST /api/projects/:projectId/whiteboards
 */
export function createWhiteboard(projectId, title) {
  return apiPost(paths.whiteboards.list(projectId), { title });
}

/**
 * Save whiteboard (content = entire strokes array)
 * PUT /api/projects/:projectId/whiteboards/:boardId
 */
export function saveWhiteboard(projectId, boardId, content) {
  return apiPut(paths.whiteboards.detail(projectId, boardId), { content });
}
