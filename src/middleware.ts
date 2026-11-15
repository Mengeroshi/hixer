import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getToken } from "next-auth/jwt"

function isProtectedPath(pathname: string) {
  if (pathname === "/mixes/new") {
    return true
  }
  return /^\/mixes\/[^/]+\/edit$/.test(pathname)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!isProtectedPath(pathname)) {
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

  if (!token.isStore) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/mixes/new", "/mixes/:slug/edit"],
}
