import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getToken } from "next-auth/jwt"

export const runtime = "nodejs"

function isPublicPath(pathname: string) {
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/stores/") ||
    pathname.startsWith("/payment/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return true
  }

  // Public mix pages; create/edit stay protected
  if (pathname.startsWith("/mixes/")) {
    return pathname !== "/mixes/new" && !/^\/mixes\/[^/]+\/edit$/.test(pathname)
  }

  return false
}

function safeCallbackPath(pathname: string) {
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return "/profile"
  }
  return pathname
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  })

  if (!token) {
    const login = new URL("/login", request.url)
    login.searchParams.set("callbackUrl", safeCallbackPath(pathname))
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
}
