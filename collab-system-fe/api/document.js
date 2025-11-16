// frontend/api/documents.js
import { apiGet, apiPost, apiPut } from "./apiClient.js";
import { paths } from "../constants/paths.js";

/**
 * list documents for project
 * GET /api/projects/:projectId/documents
 */
export function listDocuments(projectId) {
  return apiGet(paths.documents.list(projectId));
}

/**
 * get single document
 * GET /api/projects/:projectId/documents/:docId
 */
export function getDocument(projectId, docId) {
  return apiGet(paths.documents.detail(projectId, docId));
}

/**
 * create document
 * POST /api/projects/:projectId/documents
 */
export function createDocument(projectId, title) {
  return apiPost(paths.documents.list(projectId), { title });
}

/**
 * save document
 * PUT /api/projects/:projectId/documents/:docId
 */
export function saveDocument(projectId, docId, content) {
  return apiPut(paths.documents.detail(projectId, docId), { content });
}