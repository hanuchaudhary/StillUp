import { prisma } from "@stillup/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { resetPasswordEmailTemplate, verifyEmailTemplate } from "./email";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url }) => {
      try {
        const emailHtml = resetPasswordEmailTemplate(url);
        await resend.emails
          .send({
            from: "StillUp <alert@stillup.sh>",
            to: user.email,
            subject: "Internal Password Reset Request",
            html: emailHtml,
          })
          .catch((error) => {
            console.error("Resend email error:", error);
          });
      } catch (error) {
        console.error("Failed to send password reset email:", error);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        const frontendOrigin =
          process.env.CLIENT_URL || "https://stillup.sh";
        const verifyUrl = `${frontendOrigin}/verify-email?token=${encodeURIComponent(token)}`;
        const emailHtml = verifyEmailTemplate(verifyUrl);
        await resend.emails
          .send({
            from: "StillUp Verification <alert@system.kushchaudhary.com>",
            to: user.email,
            subject: "Verify your email address",
            html: emailHtml,
          })
          .catch((error) => {
            console.error("Resend email error:", error);
          });
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://stillup.sh",
  ],
  plugins: [openAPI()],
  logger: {
    level: "info",
    format: "pretty",
  },
});
