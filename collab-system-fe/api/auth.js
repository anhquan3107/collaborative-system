import { apiPost } from "./apiClient.js";
import { paths } from "../constants/paths.js";

// Login
export function login(email, password) {
  return apiPost(paths.auth.login, { email, password });
}

// Register
export function register(username, email, password) {
  return apiPost(paths.auth.register, { username, email, password });
}
