import { apiGet } from "./apiClient.js";
import { paths } from "../constants/paths.js";

export function getCurrentUser() {
  return apiGet(paths.user.me);
}
