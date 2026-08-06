import WhatsAppButton from "./components/WhatsAppButton";
import Ticker from "./components/Ticker";
import InstallBanner from "./components/InstallBanner";
import RouteLoadingOverlay from "./components/RouteLoadingOverlay";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { CartProvider } from "./lib/cart-context";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { prisma } from "./lib/prisma";
import { auth } from "@clerk/nextjs/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Base des URLs (pour que les aperçus de partage fonctionnent).
  metadataBase: new URL("https://limak-two.vercel.app"),

  // Titre : "default" s'affiche sur l'accueil ; "template" ajoute
  // "| LIMAK" derrière le titre des autres pages (ex. "Montre Tissot | LIMAK").
  title: {
    default: "LIMAK — Boutique en ligne en Côte d'Ivoire",
    template: "%s | LIMAK",
  },
  description:
    "LIMAK, votre boutique en ligne en Côte d'Ivoire : montres, sacs, beauté, électroménager, librairie et plus. Paiement à la livraison partout en CI.",
  keywords: [
    "LIMAK",
    "boutique en ligne",
    "Côte d'Ivoire",
    "e-commerce",
    "paiement à la livraison",
  ],

  // Aperçu quand on partage un lien (WhatsApp, Facebook…)
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "LIMAK",
    title: "LIMAK — Boutique en ligne en Côte d'Ivoire",
    description:
      "Montres, sacs, beauté, électroménager, librairie… Paiement à la livraison partout en Côte d'Ivoire.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  // Solde Mak Points affiché dans l'en-tête (juste pour un client connecté).
  const { userId } = await auth();
  const makPoints = userId
    ? (
        await prisma.makPointEntry.aggregate({
          where: { clerkUserId: userId },
          _sum: { points: true },
        })
      )._sum.points ?? 0
    : 0;

  return (
    <ClerkProvider localization={frFR}>
      <html
        lang="fr"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        {/* Applique le thème sauvegardé avant l'affichage, pour éviter un flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              var t = localStorage.getItem('theme');
              var sombre = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.documentElement.classList.toggle('dark', sombre);
            } catch (e) {}`,
          }}
        />
        <body className="min-h-full flex flex-col">
          <WhatsAppButton />
          <Suspense fallback={null}>
            <RouteLoadingOverlay />
          </Suspense>
          <CartProvider>
            <Header categories={categories} makPoints={makPoints} />
            <Ticker />
            <InstallBanner />
            <div className="flex-1">{children}</div>
            <Footer />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}