import { apiPost } from "./apiClient.js";
import { paths } from "../constants/paths.js";

export function verifyOtp(otp) {
  return apiPost(paths.password.verifyOtp, { otp });
}

export function resetPassword(newPassword) {
  return apiPost(paths.password.reset, { newPassword });
}
export function forgotPassword(email) {
  return apiPost(paths.password.forgot, { email });
}