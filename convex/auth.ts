import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@carrow.com").toLowerCase();

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
          role: email === ADMIN_EMAIL ? "admin" : "user",
          planStatus: "none",
          registered: new Date().toISOString().slice(0, 10),
        };
      },
      validatePasswordRequirements(password) {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
      },
    }),
  ],
});
