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

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const url = new URL(req.url);
  const upstreamUrl = `${BACKEND}/${path.join("/")}${url.search}`;

  const token = (await getToken({ req, secret: AUTH_SECRET })) as TokenPayload | null;
  let accessToken = token?.accessToken;
  const refreshToken = token?.refreshToken;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Copy request body for non-GET/HEAD
  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const makeRequest = (tokenValue: string) => {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${tokenValue}`,
    };
    
    // We must NOT manually set Content-Type for multipart/form-data as it needs the boundary
    const originalContentType = req.headers.get("content-type");
    if (hasBody && originalContentType) {
      headers["Content-Type"] = originalContentType;
    }

    return fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  };

  let res = await makeRequest(accessToken);

  // One-time retry with refreshed access token when backend returns 401.
  if (res.status === 401 && refreshToken) {
    const refreshed = await tryRefreshToken(refreshToken);
    if (refreshed?.access_token) {
      accessToken = refreshed.access_token;
      res = await makeRequest(accessToken);
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const raw = await res.arrayBuffer();

  return new NextResponse(raw, {
    status: res.status,
    headers: {
      "content-type": contentType,
    },
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

