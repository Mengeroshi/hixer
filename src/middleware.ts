import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getToken } from "next-auth/jwt"

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  )
}

function isStoreManagePath(pathname: string) {
  if (pathname === "/mixes/new") {
    return true
  }
  return /^\/mixes\/[^/]+\/edit$/.test(pathname)
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
    login.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(login)
  }

  if (isStoreManagePath(pathname) && !token.isStore) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
}
