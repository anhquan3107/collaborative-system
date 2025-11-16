// backend/controllers/documentController.js
import {
  getDocumentsByProject,
  getDocumentById,
  createDocument,
  updateDocumentContent,
} from "../models/documentModel.js";

/**
 * GET /api/projects/:projectId/documents
 */
export async function listDocuments(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const docs = await getDocumentsByProject(projectId);
    res.json({ documents: docs });
  } catch (err) {
    console.error("listDocuments error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /api/projects/:projectId/documents/:docId
 */
export async function getDocument(req, res) {
  try {
    const docId = Number(req.params.docId);
    const doc = await getDocumentById(docId);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json({ document: doc });
  } catch (err) {
    console.error("getDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/projects/:projectId/documents
 * body: { title }
 */
export async function createNewDocument(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

    const doc = await createDocument(projectId, title);
    res.status(201).json({ document: doc });
  } catch (err) {
    console.error("createNewDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * PUT /api/projects/:projectId/documents/:docId
 * body: { content }
 */
export async function saveDocument(req, res) {
  try {
    const docId = Number(req.params.docId);
    const { content } = req.body;
    await updateDocumentContent(docId, content);
    res.json({ message: "Saved" });
  } catch (err) {
    console.error("saveDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
