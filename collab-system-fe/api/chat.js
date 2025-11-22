// frontend/api/chat.js
import { apiGet } from "./apiClient.js";
import { paths } from "../constants/paths.js";

export function getChatHistory(projectId) {
    return apiGet(paths.projects.chat(projectId));
}