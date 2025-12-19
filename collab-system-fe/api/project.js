import { apiGet, apiPost, apiDelete, apiPut } from "./apiClient.js";
import { paths } from "../constants/paths.js";

// Get project list
export function getProjects(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query
    ? `${paths.projects.list}?${query}`
    : paths.projects.list;

  return apiGet(url);
}

// Create new project
export function createProject(name, description = "") {
  return apiPost(paths.projects.create, { name, description });
}

export function getProjectCount() {
  return apiGet(paths.projects.count);
}

// Delete a project
export function deleteProject(id) {
  return apiDelete(paths.projects.detail(id));
}

export function getProjectMembers(projectId) {
  return apiGet(paths.projects.members(projectId));
}

export function removeProjectMember(projectId, userId) {
  return apiDelete(paths.projects.memberDetail(projectId, userId));
}

export function leaveProject(projectId) {
  return apiDelete(paths.projects.leave(projectId));
}