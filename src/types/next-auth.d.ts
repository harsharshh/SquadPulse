declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      anonymousId?: string;
      anonymousUsername?: string;
      blocked?: boolean;
    };
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    anonymousId?: string;
    anonymousUsername?: string;
    blocked?: boolean;
  }
}
