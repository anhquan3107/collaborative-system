import { apiGet, apiPost, apiDelete } from "./apiClient.js";
import { paths } from "../constants/paths.js";

// Get project list
export function getProjects() {
  return apiGet(paths.projects.list);
}

// Create new project
export function createProject(name, description = "") {
  return apiPost(paths.projects.create, { name, description });
}

// Delete a project
export function deleteProject(id) {
  return apiDelete(paths.projects.detail(id));
}

export function getProjectMembers(projectId) {
  return apiGet(paths.projects.members(projectId));
}