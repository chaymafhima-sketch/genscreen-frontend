import NextAuth, { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role?: string;
      [key: string]: unknown;
    };
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      role?: string;
      [key: string]: unknown;
    };
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    error?: string;
  }
}

