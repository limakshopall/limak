<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# LIMAK — Contexte projet pour Claude Code

## Le projet
Boutique e-commerce **mono-vendeur** (LIMAK seul vendeur), en **français**, devise **FCFA (XOF)**, marché **Côte d'Ivoire**. **Paiement à la livraison** uniquement. Architecture pensée pour évoluer plus tard (multi-vendeurs). Boutique déjà complète et en ligne.

## Comment me guider (important)
Je suis autodidacte, sous **Windows**, projet dans `C:\dev\limak`. Réponds-moi **en français**. J'ai déjà construit toute la boutique, je connais les bases → **va vite et fais beaucoup**, groupe plusieurs fichiers par proposition, pas de longues explications. Mais :
- **Montre le diff avant d'appliquer** ; **annonce les commandes** avant de les lancer (migrations Prisma…).
- Fin de fonctionnalité : un **test rapide** + le **message de commit** (je fais Commit → Sync moi-même).
- Sois **honnête** (coûts, prérequis, risques *avant*) ; opinions **tranchées** en une ligne sur les choix de conception.
- Ne touche jamais à mes mots de passe / clés API / infos de paiement.

## Stack
- **Next.js 16.2.12** (App Router, Turbopack) + TypeScript
- **PostgreSQL sur Neon** (Francfort) · **Prisma 7** (client généré dans `app/generated/prisma`, adaptateur `@prisma/adapter-pg` + `pg`, client dans `app/lib/prisma.ts`)
- **Clerk 7.6.2** (`@clerk/nextjs` + `@clerk/localizations` frFR) — comptes clients
- **UploadThing** — images produits · **Africa's Talking** — SMS
- **Déploiement Vercel** : en ligne sur `limak-two.vercel.app` · GitHub privé `limakshopall/limak`, branche `main`

## Modèle de données (Prisma)
User, Address, Vendor, Category (auto-relation parent/enfant), Product, **ProductVariant** (prix + stock + `comparePrice` ici — prix/stock au niveau variante), ProductImage, Order (`clerkUserId`, infos livraison, subtotal/shipping/total, status enum), OrderItem, **Review** (`clerkUserId` + `authorName`, `@@unique([productId, clerkUserId])`). Prix = `Int` en FCFA (pas de centimes).

## Ce qui est construit
- **Catalogue** `/produits` : recherche + filtre catégorie + tri (`ProduitsFiltres.tsx`, via l'URL). Cartes via `app/components/ProductCard.tsx` (partagé accueil + catalogue + similaires : image, prix, promo, étoiles, badge « Épuisé »).
- **Fiche produit** `/produits/[slug]` : galerie `ProductGallery` (next/image), `AddToCartButton` (quantité bridée au stock), avis + note moyenne, **produits similaires**, `ShareButtons` (partage natif), `generateMetadata` (SEO + openGraph par produit).
- **Panier** : `app/lib/cart-context.tsx` (React Context + localStorage, connaît le stock), page `/panier`.
- **Commande** : `/commande` + `app/commande/actions.ts` (`createOrder` : recalcule les prix côté serveur, **transaction anti-survente** qui vérifie+décrémente le stock, rattache `clerkUserId` si connecté, envoie SMS confirmation client + alerte admin), `/commande/merci`. Commande **invité** possible.
- **Comptes clients** : Clerk. `ClerkProvider` frFR dans `layout.tsx`. Header utilise `<Show when="signed-in"/"signed-out">` (⚠️ **PAS** `<SignedIn>`/`<SignedOut>`, supprimés en v7). `/mes-commandes`.
- **Admin** (protégé par cookie `limak_admin`, `/admin/login`) : `/admin` (tableau de bord stats + alerte stock bas), `/admin/commandes` (liste + recherche/filtre + détail `[id]` + changement de statut → SMS de suivi), `/admin/produits` (liste, édition `[id]` avec prix/stock/visibilité/**promo**, upload images UploadThing, suppression, ajout).
- **SMS** `app/lib/sms.ts` (appel REST via `fetch`, formatage numéro CI `+225`) : confirmation client, alerte admin, suivi de statut. **En Sandbox** (`AT_USERNAME`/`AT_API_KEY` dans `.env`). Un envoi SMS ne bloque JAMAIS une commande/action.
- **Stock** : transaction serveur, bridage panier + fiche, badge « Épuisé » sur les cartes, alerte stock bas admin.
- **Avis** : par compte Clerk, **achat vérifié** (l'auteur doit avoir commandé), badge « ✓ Achat vérifié », étoiles partout.
- **Promos** : `comparePrice` → prix barré + badge « -X% » (cartes + fiche), géré depuis l'admin.
- **SEO** : metadata `layout.tsx` (`metadataBase`, template `%s | LIMAK`, openGraph), `sitemap.ts`, `robots.ts`, favicon logo.
- **PWA** : `manifest.ts` (name LIMAK, standalone, `background_color` blanc = fond du splash, `theme_color` marine, icônes `/icon-192.png` + `/icon-512.png` dans `public/`), `apple-icon.png`, `InstallBanner.tsx`.
- **WhatsApp** : bouton flottant `WhatsAppButton.tsx`.
- **Accueil** `app/page.tsx` : `HeroCarousel`, réassurance, catégories, nouveautés, rangée par catégorie, footer (contact email/WhatsApp pour **questions seulement** — commandes uniquement sur le site). Identité : marine `#0f1724` + orange `#e67e22`/`#f39c12`.

## Conventions & pièges
- Après modif de `schema.prisma` → `npx prisma migrate dev --name ...` + **Restart TS Server**.
- ⚠️ **Deux `actions.ts` distincts** : `app/commande/actions.ts` (`createOrder`, chemins `../lib`) et `app/admin/commandes/actions.ts` (`updateOrderStatus`, chemins `../../lib`).
- Types Prisma en Majuscule (`String`, `Int`).
- Sur l'accueil `app/page.tsx`, la variable de boucle produit s'appelle **`p`** (pas `produit`).
- Faux avertissements `globals.css` (`@source`/`@theme`) = à ignorer.
- Base Neon endormie → la réveiller (`SELECT 1;` dans le SQL Editor).
- Variables Vercel : `DATABASE_URL`, `UPLOADTHING_TOKEN`, `ADMIN_PASSWORD`, `ADMIN_SESSION_TOKEN`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (+ `AT_USERNAME`/`AT_API_KEY` quand le SMS passera en Live).
- Déploiement : Source Control → Commit → Sync ; Vercel redéploie tout seul ; le déploiement **le plus récent en haut = le vrai code** (ne pas « Redeploy » un vieux build).

## Décisions prises
- **Pas de paiement en ligne** (Mobile Money abandonné) — paiement à la livraison seulement.
- **SMS** : Sandbox pour l'instant ; passage **Live** (app `limakprod` créée) quand le crédit Africa's Talking arrivera → puis mettre `AT_USERNAME`/`AT_API_KEY` dans Vercel.
- **Clerk** reste en clés `pk_test_` (elles marchent sur vercel.app) ; passer en `pk_live_` seulement avec un vrai domaine.
- **Domaine `limak.ci`** choisi et disponible, à acheter (paiement Mobile Money) → ensuite : l'ajouter dans Vercel, configurer le DNS, mettre à jour `metadataBase` + les `BASE_URL` de `sitemap.ts`/`robots.ts`, puis Clerk en production.
- Mot de passe Neon exposé une fois → pas de réinitialisation voulue pour l'instant.

## Travail en binôme (2 personnes, 2 PC, 1 dépôt GitHub)

Nous sommes **deux** à travailler sur ce projet, sur des PC différents, via le dépôt GitHub `limakshopall/limak` (branche `main`). La synchro passe par **Git/GitHub**, jamais par le compte Claude.

**Règles à me rappeler systématiquement :**
- **Avant de commencer une tâche** : `git pull` (récupérer le travail du binôme).
- **Après chaque fonctionnalité** : `git add` + `git commit` + `git push` tout de suite (petits commits fréquents, ne rien accumuler).
- **Message de commit préfixé par le prénom de l'auteur** : ex. `[Abdallah] Ajout des favoris`. Toujours me proposer le message à la fin d'une tâche.
- **Alerte conflit** : si une modif touche des fichiers centraux (`layout.tsx`, `schema.prisma`, `app/lib/*`, `ProductCard.tsx`, `middleware.ts`), me prévenir que le binôme les édite peut-être aussi, et me conseiller de le prévenir avant.
- **Grosse fonctionnalité** → proposer une **branche dédiée** (`git checkout -b feature/xxx`) puis fusion, pour ne pas se gêner sur `main`.
- Si `git pull` crée un **conflit** : me l'expliquer simplement et me guider pour le résoudre sans rien perdre.
- **Ne jamais committer `.env`** (secrets) — vérifier qu'il est dans `.gitignore`.
- **Tenir ce `CLAUDE.md` à jour** après chaque changement important (mémoire commune aux deux).

**Identité Git (à configurer une fois sur CHAQUE PC) :**
`git config user.name "Prénom"` + `git config user.email "email"` — pour que l'historique GitHub montre qui a fait quoi.