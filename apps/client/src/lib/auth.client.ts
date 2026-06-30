import { BACKEND_URL } from "@stillup/shared/constants";
import { createAuthClient } from "better-auth/react";

export const {
  useSession,
  signIn,
  signOut,
  signUp,
  updateUser,
  requestPasswordReset,
  verifyEmail,
  resetPassword,
} = createAuthClient({
  baseURL: BACKEND_URL,
});
