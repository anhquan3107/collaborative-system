// backend/models/documentModel.js
import db from "../config/database.js";
import { isProjectMember } from "./projectMemberModel.js";

/**
 * Return all documents for a project
 */
export async function getDocumentsByProject(projectId, userId) {
  console.log(`🔍 Checking access for project ${projectId}, user ${userId}`);
  
  const hasAccess = await isProjectMember(projectId, userId);
  if (!hasAccess) {
    throw new Error('Access denied to project');
  }

  const [rows] = await db.query(
    "SELECT id, project_id, title, updated_at FROM documents WHERE project_id = ? ORDER BY updated_at DESC",
    [projectId]
  );
  return rows;
}

/**
 * Return a single document by id (with access control)
 */
export async function getDocumentById(docId, userId) {
  console.log(`🔍 Checking document access: doc ${docId}, user ${userId}`);
  
  const [rows] = await db.query(
    `SELECT d.* 
     FROM documents d
     WHERE d.id = ? AND EXISTS (
       SELECT 1 FROM (
         SELECT p.user_id FROM projects p WHERE p.id = d.project_id AND p.user_id = ?
         UNION
         SELECT pm.user_id FROM project_members pm WHERE pm.project_id = d.project_id AND pm.user_id = ?
       ) AS access
     )`,
    [docId, userId, userId]
  );
  
  if (rows.length === 0) {
    throw new Error('Document not found or access denied');
  }
  
  return rows[0];
}

export async function createDocument(projectId, title, userId) {
  console.log(`📝 Creating document: project ${projectId}, user ${userId}, title "${title}"`);
  
  // Check if user has access to this project
  const hasAccess = await isProjectMember(projectId, userId);
  if (!hasAccess) {
    console.log(`❌ Access denied: user ${userId} cannot access project ${projectId}`);
    throw new Error('Access denied to project');
  }

  const [result] = await db.query(
    "INSERT INTO documents (project_id, title, content) VALUES (?, ?, '')",
    [projectId, title]
  );
  const insertId = result.insertId;
  
  // Return the created document
  const [docRows] = await db.query(
    "SELECT * FROM documents WHERE id = ?",
    [insertId]
  );
  
  console.log(`✅ Document created successfully: ID ${insertId}`);
  return docRows[0];
}

/**
 * Update document content (with access control)
 */
export async function updateDocumentContent(docId, content, userId) {
  // First verify user has access to this document
  const document = await getDocumentById(docId, userId);
  if (!document) {
    throw new Error('Document not found or access denied');
  }

  await db.query(
    "UPDATE documents SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [content, docId]
  );
  
  // Return updated document
  const [docRows] = await db.query(
    "SELECT * FROM documents WHERE id = ?",
    [docId]
  );
  return docRows[0];
}