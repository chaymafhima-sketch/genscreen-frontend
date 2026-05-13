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

    const secret = process.env.NEXTAUTH_SECRET || AUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token?.accessToken) {
      console.error("Proxy: Unauthorized - No valid token found in request");
      return NextResponse.json({ message: "Unauthorized - No session" }, { status: 401 });
    }

    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${token.accessToken}`);
    headers.delete("host"); // Let fetch set the correct host

    const res = await fetch(upstreamUrl, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? null : req.body,
      duplex: "half",
      cache: "no-store",
    } as any);

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

