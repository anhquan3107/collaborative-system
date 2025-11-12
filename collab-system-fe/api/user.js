import { apiGet } from "./apiClient.js";
import { paths } from "../constants/paths.js"

// Get current user info
export async function getCurrentUser() {
  return await apiGet(paths.api.user.me);
}
