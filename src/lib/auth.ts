import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

import { ensureUserRecord, getUserRecord } from "@/lib/user-service";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const requireGainsightEmail = process.env.NEXTAUTH_REQUIRE_GAINSIGHT_EMAIL === "true";

      if (!requireGainsightEmail) {
        return true;
      }

      const email = user.email?.toLowerCase();

      if (email && email.endsWith("@gainsight.com")) {
        return true;
      }

      console.warn("Rejected sign-in attempt due to non-Gainsight email", {
        providerAccountId: account.providerAccountId,
      });

      return false;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? (token.id as string);
        if (token.anonymousId && typeof token.anonymousId === "string") {
          session.user.anonymousId = token.anonymousId;
        }
        if (token.anonymousUsername && typeof token.anonymousUsername === "string") {
          session.user.anonymousUsername = token.anonymousUsername;
        }
        if (typeof token.blocked === "boolean") {
          session.user.blocked = token.blocked;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      const providerAccountId = account?.provider === "google"
        ? account.providerAccountId
        : token.sub;

      if (providerAccountId) {
        try {
          if (user && account?.provider === "google" && account.providerAccountId) {
            const ensuredRecord = await ensureUserRecord({
              providerAccountId: account.providerAccountId,
              email: user.email,
              name: user.name,
              image: user.image,
            });

            token.anonymousId = ensuredRecord.anonymousId;
            token.anonymousUsername = ensuredRecord.anonymousUsername;
            token.blocked = ensuredRecord.blocked;
          } else {
            const record = await getUserRecord(providerAccountId);

            if (record) {
              token.anonymousId = record.anonymousId;
              token.anonymousUsername = record.anonymousUsername;
              token.blocked = record.blocked;
            }
          }
        } catch (error) {
          console.error("Failed to populate JWT with user metadata", error);
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
  },
};
