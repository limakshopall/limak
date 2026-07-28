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
  title: "LIMAK",
  description: "Boutique en ligne LIMAK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ClerkProvider rend l'authentification disponible partout.
    // frFR : les fenêtres de connexion/inscription seront en français.
    <ClerkProvider localization={frFR}>
      <html
        lang="fr"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <CartProvider>
            <Header />
            <div className="flex-1">{children}</div>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
