import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { AUTH_SECRET } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow NextAuth routes and public pages
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: AUTH_SECRET });
    const typedToken = token as { user?: { role?: string }; error?: string } | null;
    const user = typedToken?.user;

    if (!typedToken || !user || typedToken.error === "RefreshAccessTokenError") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Simple role-based guards
    if (pathname.startsWith("/dashboard/admin") && user?.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/chef";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/dashboard/chef") && user?.role === "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/backend/:path*"],
};

