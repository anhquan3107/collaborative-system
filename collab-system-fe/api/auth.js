import { apiPost } from "./apiClient.js";
import { paths } from "../constants/paths.js";

// Login API call
export async function login(email, password) {
  return await apiPost(paths.api.auth.login, { email, password });
}

// Register API call
export async function register(username, email, password) {
  return await apiPost(paths.api.auth.register, { username, email, password });
}