import { getProjectsByUser, createProject, deleteProject, getProjectCount } from "../models/projectModel.js";

// GET /api/projects
export async function listProjects(req, res) {
  try {
    const search = req.query.search || "";
    const projects = await getProjectsByUser(req.user.id, search);
    res.json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load projects" });
  }
}


// POST /api/projects
export async function addProject(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Project name required" });

  try {
    const project = await createProject(req.user.id, name, description || "");
    res.status(201).json({ message: "Project created", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create project" });
  }
}

// DELETE /api/projects/:id
export async function removeProject(req, res) {
  const { id } = req.params;
  try {
    const success = await deleteProject(id, req.user.id);
    if (!success) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete project" });
  }
}

// GET /api/projects/count
export async function getTotalProjects(req, res) {
  try {
    const count = await getProjectCount(req.user.id);
    res.json({ count });
  } catch (err) {
    console.error("Count Error:", err);
    res.status(500).json({ message: "Failed to load project count" });
  }
}
