// backend/models/documentsModel.js
import db from "../config/database.js";

/**
 * Return all documents for a project
 * @param {number} projectId
 */
export async function getDocumentsByProject(projectId) {
  const [rows] = await db.query(
    "SELECT id, project_id, title, updated_at FROM documents WHERE project_id = ? ORDER BY updated_at DESC",
    [projectId]
  );
  return rows;
}

/**
 * Return a single document by id
 * @param {number} docId
 */
export async function getDocumentById(docId) {
  const [rows] = await db.query(
    "SELECT id, project_id, title, content, updated_at FROM documents WHERE id = ?",
    [docId]
  );
  return rows[0];
}

/**
 * Create a new document for a project
 * @param {number} projectId
 * @param {string} title
 */
export async function createDocument(projectId, title) {
  const [result] = await db.query(
    "INSERT INTO documents (project_id, title, content) VALUES (?, ?, '')",
    [projectId, title]
  );
  const insertId = result.insertId;
  return getDocumentById(insertId);
}

/**
 * Update document content (overwrite)
 * @param {number} docId
 * @param {string} content
 */
export async function updateDocumentContent(docId, content) {
  await db.query("UPDATE documents SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
    content,
    docId,
  ]);
  return getDocumentById(docId);
}
