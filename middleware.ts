// ============================================================
//  MIDDLEWARE — garde l'entrée de l'espace admin
//  S'exécute avant chaque page /admin. Si l'utilisateur n'est pas
//  connecté en admin, il est renvoyé vers la page de connexion.
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("limak_admin")?.value;
  const isLoggedIn = token === process.env.ADMIN_SESSION_TOKEN;
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  // Pas connecté et pas sur la page de connexion -> vers la connexion
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  // Déjà connecté mais sur la page de connexion -> vers l'admin
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

// Ce middleware ne s'applique qu'aux adresses /admin...
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
