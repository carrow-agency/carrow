import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend } from "resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const rawEmail = typeof params.email === "string" ? params.email : "";
        const rawName = typeof params.name === "string" ? params.name : "";
        const email = rawEmail.trim().toLowerCase();
        const name = rawName.trim();

        return {
          email,
          name,
          role: "user",
          planStatus: "none",
          registered: new Date().toISOString().slice(0, 10),
        };
      },
      reset: Email({
        async sendVerificationRequest(params: any) {
          const { identifier: email, token } = params;
          if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set");
            throw new Error("Email service not configured");
          }
          const resend = new Resend(process.env.RESEND_API_KEY);
          const { error } = await resend.emails.send({
            from: "Carrow <onboarding@resend.dev>",
            to: [email],
            subject: "Reset your Carrow password",
            text: `Your password reset code is: ${token}`,
          });

          if (error) {
            console.error("Failed to send reset email", error);
            throw new Error("Could not send reset email");
          }
        },
      }),
      validatePasswordRequirements(password) {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
      },
    }),
  ],
});
