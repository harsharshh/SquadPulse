import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

import { ensureUserRecord, getUserRecord, type UserRole } from "@/lib/user-service";

const ADMIN_EMAILS = (process.env.NEXTAUTH_ADMIN_EMAILS ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const GUEST_EMAILS = (process.env.NEXTAUTH_GUEST_EMAILS ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

function determineUserRole(email?: string | null): UserRole {
  if (!email) return "GUEST";
  const normalized = email.toLowerCase();
  if (ADMIN_EMAILS.includes(normalized)) {
    return "ADMIN";
  }
  if (GUEST_EMAILS.includes(normalized)) {
    return "GUEST";
  }
  return "MEMBER";
}

type Awaitable<T> = T | Promise<T>;

type ProviderAccount = {
  provider?: string;
  providerAccountId?: string;
};

type AppSessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  anonymousId?: string;
  anonymousUsername?: string;
  blocked?: boolean;
  role?: UserRole;
};

type AppSession = {
  user?: AppSessionUser;
  [key: string]: unknown;
};

type AuthToken = {
  id?: string;
  sub?: string;
  anonymousId?: string;
  anonymousUsername?: string;
  blocked?: boolean;
  role?: UserRole;
  [key: string]: unknown;
};

type SignInArgs = {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
  account: ProviderAccount | null;
};

type SessionArgs = {
  session: AppSession;
  token: AuthToken;
};

type JwtArgs = {
  token: AuthToken;
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  } | null;
  account?: ProviderAccount | null;
};

type AuthConfig = {
  providers: ReturnType<typeof GoogleProvider>[];
  callbacks: {
    signIn: (args: SignInArgs) => Awaitable<boolean>;
    session: (args: SessionArgs) => Awaitable<AppSession>;
    jwt: (args: JwtArgs) => Awaitable<AuthToken>;
  };
  pages: {
    signIn: string;
  };
  session: {
    strategy: "jwt";
  };
};

export const authOptions: AuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: SignInArgs) {
      if (account?.provider !== "google") {
        return true;
      }

      const requireGainsightEmail = process.env.NEXTAUTH_REQUIRE_GAINSIGHT_EMAIL === "true";

      if (!requireGainsightEmail) {
        return true;
      }

      const email = user.email?.toLowerCase() ?? null;

      if (email && email.endsWith("@gainsight.com")) {
        return true;
      }

      console.warn("Rejected sign-in attempt due to non-Gainsight email", {
        providerAccountId: account.providerAccountId,
      });

      return false;
    },
    async session({ session, token }: SessionArgs) {
      if (session.user) {
        session.user.id = (token.sub as string | undefined) ?? (token.id as string | undefined) ?? session.user.id;
        if (typeof token.anonymousId === "string") {
          session.user.anonymousId = token.anonymousId;
        }
        if (typeof token.anonymousUsername === "string") {
          session.user.anonymousUsername = token.anonymousUsername;
        }
        if (typeof token.blocked === "boolean") {
          session.user.blocked = token.blocked;
        }
        if (typeof token.role === "string") {
          session.user.role = token.role as UserRole;
        }
      }
      return session;
    },
    async jwt({ token, user, account }: JwtArgs) {
      if (user?.id) {
        token.id = user.id;
      }

      const providerAccountId = account?.provider === "google"
        ? account.providerAccountId
        : token.sub;

      if (providerAccountId) {
        try {
          if (user && account?.provider === "google" && account.providerAccountId) {
            const derivedRole = determineUserRole(user.email);
            const ensuredRecord = await ensureUserRecord({
              providerAccountId: account.providerAccountId,
              email: user.email,
              name: user.name,
              image: user.image,
              role: derivedRole,
            });

            token.anonymousId = ensuredRecord.anonymousId;
            token.anonymousUsername = ensuredRecord.anonymousUsername;
            token.blocked = ensuredRecord.blocked;
            token.role = ensuredRecord.role;
          } else {
            const record = await getUserRecord(providerAccountId);

            if (record) {
              token.anonymousId = record.anonymousId;
              token.anonymousUsername = record.anonymousUsername;
              token.blocked = record.blocked;
              token.role = record.role;
            }
          }
        } catch (error) {
          console.error("Failed to populate JWT with user metadata", error);
        }
      }
      if (!token.role) {
        token.role = determineUserRole(user?.email);
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

export async function getAuthSession(): Promise<AppSession | null> {
  return getServerSession(authOptions as unknown as Record<string, unknown>) as Promise<AppSession | null>;
}
