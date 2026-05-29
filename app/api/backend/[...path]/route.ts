import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { AUTH_SECRET } from "@/lib/auth";

const BACKEND = "http://localhost:3001";

type RefreshResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

type TokenPayload = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
};

async function tryRefreshToken(refreshToken: string): Promise<RefreshResponse | null> {
  try {
    const res = await fetch(`${BACKEND}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken,
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RefreshResponse;
    if (!data.access_token) return null;
    return data;
  } catch {
    return null;
  }
}

async function proxy(req: NextRequest, ctx: any) {
  try {
    const params = await ctx.params;
    const pathSegments = params?.path || [];
    const pathStr = Array.isArray(pathSegments) ? pathSegments.join("/") : pathSegments;

    if (!pathStr) return NextResponse.json({ message: "Path missing" }, { status: 400 });

    const url = new URL(req.url);
    const cleanPath = pathStr.replace(/^\/+|\/+$/g, "");
    const upstreamUrl = `${BACKEND}/${cleanPath}${url.search}`;
    const method = req.method;

    // Public routes — no auth needed
    const PUBLIC_PATHS = ["auth/forgot-password", "auth/reset-password", "auth/login", "auth/refresh"];
    const isPublic = PUBLIC_PATHS.some((p) => cleanPath === p || cleanPath.startsWith(p));

    const secret = process.env.NEXTAUTH_SECRET || AUTH_SECRET;
    const token = await getToken({ req, secret }) as TokenPayload | null;

    if (!isPublic && !token?.accessToken) {
      console.error("Proxy: Unauthorized - No valid token found in request");
      return NextResponse.json({ message: "Unauthorized - No session" }, { status: 401 });
    }

    const headers = new Headers(req.headers);
    headers.delete("host");

    // --- First attempt ---
    let accessToken = token?.accessToken as string | undefined;
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    const bodyBuffer = ["GET", "HEAD"].includes(method) ? null : await req.arrayBuffer();

    let res = await fetch(upstreamUrl, {
      method,
      headers,
      body: bodyBuffer ?? null,
      cache: "no-store",
    } as any);

    // --- If backend rejects the token, try a one-shot refresh and retry ---
    if (res.status === 401 && token?.refreshToken) {
      const refreshed = await tryRefreshToken(token.refreshToken as string);
      if (refreshed?.access_token) {
        accessToken = refreshed.access_token;
        headers.set("Authorization", `Bearer ${accessToken}`);
        res = await fetch(upstreamUrl, {
          method,
          headers,
          body: bodyBuffer ?? null,
          cache: "no-store",
        } as any);
      }
    }

    return new NextResponse(res.body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}
export async function POST(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}
export async function PUT(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: any) {
  return proxy(req, ctx);
}
