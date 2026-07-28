// ============================================================
//  MIDDLEWARE — Clerk (comptes clients) + protection admin maison
//  Clerk ne protège aucune route par défaut : commander sans
//  compte reste possible. On garde notre cookie pour /admin.
// ============================================================

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Les pages d'admin (sauf la page de connexion admin)
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // --- Notre protection admin (cookie), indépendante de Clerk ---
  if (isAdminRoute(req) && pathname !== "/admin/login") {
    const token = req.cookies.get("limak_admin")?.value;
    if (token !== process.env.ADMIN_SESSION_TOKEN) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  // Pour tout le reste : Clerk laisse passer (rien n'est protégé).
});

export const config = {
  matcher: [
    // Toutes les pages sauf les fichiers internes/statesques
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Toujours pour les routes API
    "/(api|trpc)(.*)",
  ],
};
