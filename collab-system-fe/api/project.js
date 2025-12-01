import { apiGet, apiPost, apiDelete, apiPut } from "./apiClient.js";
import { paths } from "../constants/paths.js";

// Get project list
export function getProjects() {
  return apiGet(paths.projects.list);
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
export function updateMemberRole(projectId, userId, role) {
  return apiPut(paths.projects.memberRole(projectId, userId), { role });
}
export function leaveProject(projectId) {
  return apiDelete(paths.projects.leave(projectId));
}