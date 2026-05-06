import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

type BackendLoginResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    _id?: string;
    id?: string;
    email?: string;
    name?: string;
    fullname?: string;
    fullName?: string;
    role?: string;
    [key: string]: unknown;
  };
  message?: string;
};

type RefreshResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
export const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-only-insecure-secret-change-me";
const ACCESS_TOKEN_FALLBACK_LIFETIME_MS = 15 * 60 * 1000;
const REFRESH_SKEW_MS = 30 * 1000;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const refreshToken = token.refreshToken as string | undefined;
    if (!refreshToken) {
      return { ...token, error: "NoRefreshToken" };
    }

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const refreshed = (await response.json()) as RefreshResponse;
    if (!refreshed.access_token) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const expiresMs =
      typeof refreshed.expires_in === "number" && refreshed.expires_in > 0
        ? refreshed.expires_in * 1000
        : ACCESS_TOKEN_FALLBACK_LIFETIME_MS;

    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token || refreshToken,
      accessTokenExpiresAt: Date.now() + expiresMs,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString() ?? "";
        const password = credentials?.password?.toString() ?? "";
        if (!email || !password) return null;

        const res = await fetch(`${BACKEND_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = (await res.json()) as BackendLoginResponse;
        
        if (!res.ok) {
          // IMPORTANT: throwing Error here passes the message to result.error in the frontend
          throw new Error(data.message || "Email ou mot de passe incorrect.");
        }

        if (!data?.access_token) return null;

        const expiresMs =
          typeof data.expires_in === "number" && data.expires_in > 0
            ? data.expires_in * 1000
            : ACCESS_TOKEN_FALLBACK_LIFETIME_MS;

        return {
          id: data.user?._id || data.user?.id || data.user?.email || email,
          ...data.user,
          email: data.user?.email || email,
          name:
            data.user?.name ||
            data.user?.fullname ||
            data.user?.fullName ||
            email.split("@")[0],
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpiresAt: Date.now() + expiresMs,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as unknown as { role?: string; [key: string]: unknown };
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.refreshToken = (user as { refreshToken?: string }).refreshToken;
        token.accessTokenExpiresAt = (user as { accessTokenExpiresAt?: number }).accessTokenExpiresAt;
        token.error = undefined;
        return token;
      }

      const expiresAt = (token.accessTokenExpiresAt as number | undefined) ?? 0;
      if (Date.now() < expiresAt - REFRESH_SKEW_MS) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = (token.user as typeof session.user) || session.user;
      (session as { error?: string }).error = token.error as string | undefined;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
