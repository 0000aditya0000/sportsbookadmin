import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { getSessionSecret, verifySessionToken } from "@/lib/auth/session-token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let authenticated = false;
  let expired = false;

  if (token) {
    try {
      const verified = verifySessionToken(token, getSessionSecret());
      authenticated = verified.ok;
      expired = !verified.ok && verified.reason === "expired";
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated && pathname !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = expired ? "reason=expired" : "";
    return NextResponse.redirect(url);
  }

  if (authenticated && (pathname === "/login" || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
