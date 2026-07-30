import InstallBanner from "./components/InstallBanner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { CartProvider } from "./lib/cart-context";
import Header from "./components/Header";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html
        lang="fr"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <CartProvider>
            <Header />
            <InstallBanner />
            <div className="flex-1">{children}</div>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}