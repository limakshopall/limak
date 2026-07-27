// ============================================================
//  SCRIPT DE SEED — importe TOUS tes produits (extraits de ton ancien site)
//  50 produits, répartis en catégories.
//  Ce script REMET À ZÉRO le catalogue de test puis le recrée proprement.
// ============================================================

import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Code de catégorie -> nom affiché
const CATEGORIES: Record<string, string> = {
  "beauty": "Beauté",
  "lunettes": "Lunettes",
  "montres": "Montres",
  "vetements": "Vêtements",
  "librairie": "Librairie",
  "electromenager": "Électroménager",
  "chaussures": "Chaussures",
  "sacs": "Sacs"
};

// Tes produits, extraits automatiquement de limak-shopall.html
const PRODUCTS = [
  {
    "slug": "serum-curcuma",
    "name": "Sérum au Curcuma",
    "category": "beauty",
    "description": "Pour un teint éclatant et une peau plus lumineuse.",
    "price": 5000,
    "stock": 12,
    "images": [
      "/limak-beauty/serum-au-curcuma/serum-au-curcuma-img-principale.jpg",
      "/limak-beauty/serum-au-curcuma/serum-au-curcuma-image-avant-apres.png",
      "/limak-beauty/serum-au-curcuma/serum-au-curcuma-composition.png",
      "/limak-beauty/serum-au-curcuma/serum-au-curcuma-mode-usage.png"
    ]
  },
  {
    "slug": "beard-growth",
    "name": "Huile Beard Growth",
    "category": "beauty",
    "description": "Stimule la pousse de la barbe et des cheveux, nourrit en profondeur.",
    "price": 3900,
    "stock": 20,
    "images": [
      "/limak-beauty/beard-growth/beard-growth-img-principale.png",
      "/limak-beauty/beard-growth/beard-growth-effets.png",
      "/limak-beauty/beard-growth/beard-growth-mode-usage.png",
      "/limak-beauty/beard-growth/beard-growth-raison-du-choix.png"
    ]
  },
  {
    "slug": "lunette-ambre",
    "name": "Lunette Ambre",
    "category": "lunettes",
    "description": "Monture ambrée aux reflets chauds, look affirmé.",
    "price": 6000,
    "stock": 8,
    "images": [
      "/limak-shop/accesoires/lunettes/lunette-ambre/lunette-ambre1.png",
      "/limak-shop/accesoires/lunettes/lunette-ambre/lunette-ambre2.png",
      "/limak-shop/accesoires/lunettes/lunette-ambre/lunette-ambre3.png",
      "/limak-shop/accesoires/lunettes/lunette-ambre/lunette-ambre4.png",
      "/limak-shop/accesoires/lunettes/lunette-ambre/lunette-ambre5.png",
      "/limak-shop/accesoires/lunettes/lunette-ambre/lunette-ambre6.png",
      "/limak-shop/accesoires/lunettes/lunette-ambre/lunette-ambre7.png",
      "/limak-shop/accesoires/lunettes/lunette-ambre/lunette-ambre8.png"
    ]
  },
  {
    "slug": "lunette-celeste",
    "name": "Lunette Céleste",
    "category": "lunettes",
    "description": "Teinte bleutée légère, élégance discrète au quotidien.",
    "price": 6000,
    "stock": 15,
    "images": [
      "/limak-shop/accesoires/lunettes/lunette-céleste/lunette-celeste1.png",
      "/limak-shop/accesoires/lunettes/lunette-céleste/lunette-celeste2.png",
      "/limak-shop/accesoires/lunettes/lunette-céleste/lunette-celeste3.png",
      "/limak-shop/accesoires/lunettes/lunette-céleste/lunette-celeste4.png",
      "/limak-shop/accesoires/lunettes/lunette-céleste/lunette-celeste5.png",
      "/limak-shop/accesoires/lunettes/lunette-céleste/lunette-celeste6.png",
      "/limak-shop/accesoires/lunettes/lunette-céleste/lunette-celeste7.png",
      "/limak-shop/accesoires/lunettes/lunette-céleste/lunette-celeste8.png"
    ]
  },
  {
    "slug": "lunette-empire",
    "name": "Lunette Empire",
    "category": "lunettes",
    "description": "Monture imposante et raffinée, pour un style qui marque.",
    "price": 6500,
    "stock": 6,
    "images": [
      "/limak-shop/accesoires/lunettes/lunette-empire/lunette-empire1.png",
      "/limak-shop/accesoires/lunettes/lunette-empire/lunette-empire2.png",
      "/limak-shop/accesoires/lunettes/lunette-empire/lunette-empire3.png",
      "/limak-shop/accesoires/lunettes/lunette-empire/lunette-empire4.png",
      "/limak-shop/accesoires/lunettes/lunette-empire/lunette-empire5.png",
      "/limak-shop/accesoires/lunettes/lunette-empire/lunette-empire6.png",
      "/limak-shop/accesoires/lunettes/lunette-empire/lunette-empire7.png",
      "/limak-shop/accesoires/lunettes/lunette-empire/lunette-empire8.png"
    ]
  },
  {
    "slug": "lunette-luna-gold",
    "name": "Lunette Luna Gold",
    "category": "lunettes",
    "description": "Finitions dorées et verres dégradés, allure premium.",
    "price": 7000,
    "stock": 10,
    "images": [
      "/limak-shop/accesoires/lunettes/lunette-luna-gold/lunette-luna-gold1.png",
      "/limak-shop/accesoires/lunettes/lunette-luna-gold/lunette-luna-gold2.png",
      "/limak-shop/accesoires/lunettes/lunette-luna-gold/lunette-luna-gold3.png",
      "/limak-shop/accesoires/lunettes/lunette-luna-gold/lunette-luna-gold4.png",
      "/limak-shop/accesoires/lunettes/lunette-luna-gold/lunette-luna-gold5.png",
      "/limak-shop/accesoires/lunettes/lunette-luna-gold/lunette-luna-gold6.png"
    ]
  },
  {
    "slug": "lunette-orion",
    "name": "Lunette Orion",
    "category": "lunettes",
    "description": "Design sport-chic et polyvalent, pour toutes les journées.",
    "price": 6000,
    "stock": 12,
    "images": [
      "/limak-shop/accesoires/lunettes/lunette-orion/lunette-orion1.png",
      "/limak-shop/accesoires/lunettes/lunette-orion/lunette-orion2.png",
      "/limak-shop/accesoires/lunettes/lunette-orion/lunette-orion3.png",
      "/limak-shop/accesoires/lunettes/lunette-orion/lunette-orion4.png",
      "/limak-shop/accesoires/lunettes/lunette-orion/lunette-orion5.png",
      "/limak-shop/accesoires/lunettes/lunette-orion/lunette-orion6.png",
      "/limak-shop/accesoires/lunettes/lunette-orion/lunette-orion7.png",
      "/limak-shop/accesoires/lunettes/lunette-orion/lunette-orion8.png"
    ]
  },
  {
    "slug": "montre-casio",
    "name": "Montre Casio",
    "category": "montres",
    "description": "Disponible en 8 coloris. Style intemporel, qualité garantie.",
    "price": 14900,
    "stock": 25,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Casio/montre-casio-blanche-argent/montre-casio-blanche-argent-main.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Casio/montre-casio-blanche-gold/montre-casio-blanche-gold-main.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Casio/montre-casio-bleue-argent/montre-casio-bleue-argent-main.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Casio/montre-casio-bleue-ciel-argent/montre-casio-bleue-ciel-argent-main.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Casio/montre-casio-or-gold/montre-casio-or-gold-main.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Casio/montre-casio-rose-argent/montre-casio-rose-argent-main.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Casio/montre-casio-rouge-argent/montre-casio-rouge-argent-main.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Casio/montre-casio-verte-argent/montre-casio-verte-argent-main.png"
    ]
  },
  {
    "slug": "park-aquarius",
    "name": "Pack Montre & Bracelet — Park Aquarius",
    "category": "montres",
    "description": "Duo montre + bracelet ton rosé, élégance discrète.",
    "price": 13000,
    "stock": 8,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-aquarius/montre_rose_1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-aquarius/montre_rose_2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-aquarius/montre_rose_3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-aquarius/montre_rose_4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-aquarius/montre_rose_5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-aquarius/montre_rose_6.png"
    ]
  },
  {
    "slug": "park-empire-gold",
    "name": "Pack Montre & Bracelet — Park Empire Gold",
    "category": "montres",
    "description": "Duo montre + bracelet doré, prestige assuré.",
    "price": 17500,
    "stock": 5,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-empire-gold/montre_or_1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-empire-gold/montre_or_2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-empire-gold/montre_or_3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-empire-gold/montre_or_4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-empire-gold/montre_or_5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Bracelet/montre-bracelet-park-empire-gold/montre_or_6.png"
    ]
  },
  {
    "slug": "bijoux-luxe",
    "name": "Bijoux de Luxe",
    "category": "montres",
    "description": "Parure complète dorée — colliers, bagues et boucles assortis.",
    "price": 15000,
    "stock": 6,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/bijoux de luxe/bijoux_luxe_1.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux de luxe/bijoux_luxe_2.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux de luxe/bijoux_luxe_3.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux de luxe/bijoux_luxe_4.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux de luxe/bijoux_luxe_5.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux de luxe/bijoux_luxe_6.png"
    ]
  },
  {
    "slug": "polo-coton",
    "name": "Polo Coton",
    "category": "vetements",
    "description": "Coupe soignée et tissu respirant, tendance et élégant.",
    "price": 4500,
    "stock": 30,
    "images": [
      "/limak-shop/vetements/polo/polo-bleu.jpeg",
      "/limak-shop/vetements/polo/polo-vert.jpg",
      "/limak-shop/vetements/polo/polo-bleu-ciel.jpg",
      "/limak-shop/vetements/polo/polo-rouge.jpg"
    ]
  },
  {
    "slug": "pullover",
    "name": "Pullover",
    "category": "vetements",
    "description": "Doux et confortable, parfait pour les soirées fraîches.",
    "price": 9000,
    "stock": 10,
    "images": [
      "/limak-shop/vetements/pullover.jpg"
    ]
  },
  {
    "slug": "pere-riche",
    "name": "Père Riche, Père Pauvre",
    "category": "librairie",
    "description": "Le best-seller de Robert Kiyosaki sur l'éducation financière.",
    "price": 6500,
    "stock": 15,
    "images": [
      "/limak librairie/pere-riche-pere-pauvre.jpg"
    ]
  },
  {
    "slug": "reflechissez-riche",
    "name": "Réfléchissez et Devenez Riche",
    "category": "librairie",
    "description": "Un classique du développement personnel qui enseigne les principes de la réussite.",
    "price": 6500,
    "stock": 20,
    "images": [
      "/limak librairie/reflechissez-et-devenez-riche.webp"
    ]
  },
  {
    "slug": "etre-leader",
    "name": "Être Leader dans un Monde Nouveau",
    "category": "librairie",
    "description": "Un guide inspirant pour développer son leadership.",
    "price": 6000,
    "stock": 18,
    "images": [
      "/limak librairie/etre-leader-dans-un-monde-nouveau.jpg"
    ]
  },
  {
    "slug": "art-negocier-harvard",
    "name": "L'Art de Négocier avec la Méthode Harvard",
    "category": "librairie",
    "description": "Les techniques de négociation utilisées par les meilleurs.",
    "price": 7000,
    "stock": 12,
    "images": [
      "/limak librairie/L-art-de-negocier-avec-la-methode-Harvard.jpg"
    ]
  },
  {
    "slug": "comment-se-faire-des-amis",
    "name": "Comment se Faire des Amis",
    "category": "librairie",
    "description": "Dale Carnegie — le classique intemporel des relations humaines.",
    "price": 6000,
    "stock": 14,
    "images": [
      "/limak librairie/comment-se-faire-des-amis.jpg"
    ]
  },
  {
    "slug": "influence-manipulation",
    "name": "Influence et Manipulation",
    "category": "librairie",
    "description": "Comprendre les ressorts psychologiques de la persuasion.",
    "price": 7500,
    "stock": 10,
    "images": [
      "/limak librairie/Influence-et-manipulation.jpg"
    ]
  },
  {
    "slug": "art-avoir-raison",
    "name": "L'Art d'Avoir Toujours Raison",
    "category": "librairie",
    "description": "Arthur Schopenhauer — 38 stratagèmes pour gagner tous les débats.",
    "price": 5000,
    "stock": 16,
    "images": [
      "/limak librairie/l-art-d-avoir-toujours-raison.webp"
    ]
  },
  {
    "slug": "art-de-la-guerre",
    "name": "L'Art de la Guerre",
    "category": "librairie",
    "description": "Sun Tzu — la stratégie millénaire appliquée à la vie et aux affaires.",
    "price": 5500,
    "stock": 18,
    "images": [
      "/limak librairie/l'art de la guerre.webp"
    ]
  },
  {
    "slug": "appareil-dentaire",
    "name": "Appareil Dentaire Nettoyant",
    "category": "electromenager",
    "description": "Nettoyage en profondeur, sourire éclatant à la maison.",
    "price": 11000,
    "stock": 6,
    "images": [
      "/limak-electromenager/appareil-dentaire/dentaire-img-principale-1.png",
      "/limak-electromenager/appareil-dentaire/dentaire-2.png",
      "/limak-electromenager/appareil-dentaire/dentaire-3.png",
      "/limak-electromenager/appareil-dentaire/dentaire-4.png",
      "/limak-electromenager/appareil-dentaire/dentaire-5.png",
      "/limak-electromenager/appareil-dentaire/dentaire-6.png",
      "/limak-electromenager/appareil-dentaire/dentaire-7.png"
    ]
  },
  {
    "slug": "tondeuse",
    "name": "Tondeuse Électrique",
    "category": "electromenager",
    "description": "Coupe précise et confortable, autonomie longue durée.",
    "price": 9500,
    "stock": 8,
    "images": [
      "/limak-electromenager/tondeuse/tondeuse-img-principale-6.png",
      "/limak-electromenager/tondeuse/tondeuse-1.png",
      "/limak-electromenager/tondeuse/tondeuse-2.png",
      "/limak-electromenager/tondeuse/tondeuse-3.png",
      "/limak-electromenager/tondeuse/tondeuse-4.png",
      "/limak-electromenager/tondeuse/tondeuse-5.png"
    ]
  },
  {
    "slug": "nike-air-max-90",
    "name": "Nike Air Max 90",
    "category": "chaussures",
    "description": "Modèle iconique, confort et style pour un usage quotidien.",
    "price": 22000,
    "stock": 10,
    "images": [
      "/limak-shop/chaussures/Nike-Air-Max-90/Nike-Air-Max-90-1.png",
      "/limak-shop/chaussures/Nike-Air-Max-90/Nike-Air-Max-90-2.png",
      "/limak-shop/chaussures/Nike-Air-Max-90/Nike-Air-Max-90-3.png",
      "/limak-shop/chaussures/Nike-Air-Max-90/Nike-Air-Max-90-4.png",
      "/limak-shop/chaussures/Nike-Air-Max-90/Nike-Air-Max-90-5.png",
      "/limak-shop/chaussures/Nike-Air-Max-90/Nike-Air-Max-90-6.png",
      "/limak-shop/chaussures/Nike-Air-Max-90/Nike-Air-Max-90-7.png",
      "/limak-shop/chaussures/Nike-Air-Max-90/Nike-Air-Max-90-8.png",
      "/limak-shop/chaussures/Nike-Air-Max-90/Nike-Air-Max-90-9.png"
    ]
  },
  {
    "slug": "nike-air-max-excee-blanc-noir",
    "name": "Nike Air Max Excee Blanc/Noir",
    "category": "chaussures",
    "description": "Coloris blanc et noir, look sportif polyvalent.",
    "price": 19000,
    "stock": 12,
    "images": [
      "/limak-shop/chaussures/Nike-Air-Max-Excee-blanc-noir/Nike-Air-Max-Excee-blanc-noir1.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-blanc-noir/Nike-Air-Max-Excee-blanc-noir2.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-blanc-noir/Nike-Air-Max-Excee-blanc-noir3.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-blanc-noir/Nike-Air-Max-Excee-blanc-noir4.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-blanc-noir/Nike-Air-Max-Excee-blanc-noir5.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-blanc-noir/Nike-Air-Max-Excee-blanc-noir6.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-blanc-noir/Nike-Air-Max-Excee-blanc-noir7.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-blanc-noir/Nike-Air-Max-Excee-blanc-noir8.png"
    ]
  },
  {
    "slug": "nike-air-max-excee-noir",
    "name": "Nike Air Max Excee Noir",
    "category": "chaussures",
    "description": "Tout noir, discret et facile à assortir au quotidien.",
    "price": 18500,
    "stock": 9,
    "images": [
      "/limak-shop/chaussures/Nike-Air-Max-Excee-noir/Nike-Air-Max-Excee-noir1.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-noir/Nike-Air-Max-Excee-noir3.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-noir/Nike-Air-Max-Excee-noir4.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-noir/Nike-Air-Max-Excee-noir5.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-noir/Nike-Air-Max-Excee-noir6.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-noir/Nike-Air-Max-Excee-noir7.png",
      "/limak-shop/chaussures/Nike-Air-Max-Excee-noir/Nike-Air-Max-Excee-noir8.png"
    ]
  },
  {
    "slug": "nike-air-max-fusion",
    "name": "Nike Air Max Fusion",
    "category": "chaussures",
    "description": "Design fusion moderne, légèreté et amorti optimal.",
    "price": 20000,
    "stock": 7,
    "images": [
      "/limak-shop/chaussures/Nike-Air-Max-Fusion/IMG_20260725_075808.png",
      "/limak-shop/chaussures/Nike-Air-Max-Fusion/Nike-Air-Max-Fusion1.png",
      "/limak-shop/chaussures/Nike-Air-Max-Fusion/Nike-Air-Max-Fusion2.png",
      "/limak-shop/chaussures/Nike-Air-Max-Fusion/Nike-Air-Max-Fusion3.png",
      "/limak-shop/chaussures/Nike-Air-Max-Fusion/Nike-Air-Max-Fusion4.png",
      "/limak-shop/chaussures/Nike-Air-Max-Fusion/Nike-Air-Max-Fusion5.png",
      "/limak-shop/chaussures/Nike-Air-Max-Fusion/Nike-Air-Max-Fusion6.png",
      "/limak-shop/chaussures/Nike-Air-Max-Fusion/Nike-Air-Max-Fusion7.png"
    ]
  },
  {
    "slug": "sac-cabas-mg-dores",
    "name": "Sac Cabas MG Anneaux Dorés",
    "category": "sacs",
    "description": "Grand cabas à anneaux dorés, chic et spacieux.",
    "price": 18000,
    "stock": 8,
    "images": [
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores1.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores2.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores3.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores4.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores/Sac-a-Main-Le-Grand-Cabas-MG-a-Anneaux-Dores5.png"
    ]
  },
  {
    "slug": "sac-cabas-mg-bordeaux",
    "name": "Sac Cabas MG Bordeaux",
    "category": "sacs",
    "description": "Cabas coloris bordeaux, élégance intemporelle.",
    "price": 17000,
    "stock": 9,
    "images": [
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux1.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux2.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux3.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux4.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux/Sac-a-Main-Le-Grand-Cabas-MG-Bordeaux5.png"
    ]
  },
  {
    "slug": "sac-key-charm-camel",
    "name": "Sac Le Key Charm Camel",
    "category": "sacs",
    "description": "Petit sac camel, parfait pour l'essentiel.",
    "price": 9000,
    "stock": 15,
    "images": [
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Key-Charm-Camel/Sac-a-Main-Le-Key-Charm-Camel1.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Key-Charm-Camel/Sac-a-Main-Le-Key-Charm-Camel2.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Key-Charm-Camel/Sac-a-Main-Le-Key-Charm-Camel3.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Key-Charm-Camel/Sac-a-Main-Le-Key-Charm-Camel4.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Key-Charm-Camel/Sac-a-Main-Le-Key-Charm-Camel5.png"
    ]
  },
  {
    "slug": "sac-lock-camel",
    "name": "Sac Le Lock Camel",
    "category": "sacs",
    "description": "Fermoir signature et cuir camel, allure raffinée.",
    "price": 15000,
    "stock": 7,
    "images": [
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Lock-Camel/Sac-a-Main-Le-Lock-Camel1.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Lock-Camel/Sac-a-Main-Le-Lock-Camel2.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Lock-Camel/Sac-a-Main-Le-Lock-Camel3.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Lock-Camel/Sac-a-Main-Le-Lock-Camel4.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Lock-Camel/Sac-a-Main-Le-Lock-Camel5.png"
    ]
  },
  {
    "slug": "sac-tote-monogram-rouge",
    "name": "Sac Tote Monogram Rouge Passion",
    "category": "sacs",
    "description": "Motif monogram et coloris rouge passion, pièce forte.",
    "price": 19500,
    "stock": 5,
    "images": [
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion1.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion2.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion3.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion4.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion/Sac-a-Main-Le-Tote-Monogram-Rouge-Passion5.png"
    ]
  },
  {
    "slug": "sac-tote-pastille-multicolore",
    "name": "Sac Tote Pastille Multicolore",
    "category": "sacs",
    "description": "Motif pastille coloré, touche fantaisie et originale.",
    "price": 16000,
    "stock": 10,
    "images": [
      "/limak-shop/Sac-a-Main/Sac-a-main-Le-Tote-Pastille-Multicolore/Sac-a-main-Le-Tote-Pastille-Multicolore1.png",
      "/limak-shop/Sac-a-Main/Sac-a-main-Le-Tote-Pastille-Multicolore/Sac-a-main-Le-Tote-Pastille-Multicolore2.png",
      "/limak-shop/Sac-a-Main/Sac-a-main-Le-Tote-Pastille-Multicolore/Sac-a-main-Le-Tote-Pastille-Multicolore3.png",
      "/limak-shop/Sac-a-Main/Sac-a-main-Le-Tote-Pastille-Multicolore/Sac-a-main-Le-Tote-Pastille-Multicolore4.png",
      "/limak-shop/Sac-a-Main/Sac-a-main-Le-Tote-Pastille-Multicolore/Sac-a-main-Le-Tote-Pastille-Multicolore5.png",
      "/limak-shop/Sac-a-Main/Sac-a-main-Le-Tote-Pastille-Multicolore/Sac-a-main-Le-Tote-Pastille-Multicolore6.png"
    ]
  },
  {
    "slug": "sac-tote-relief-camel",
    "name": "Sac Tote Relief Blanc et Camel",
    "category": "sacs",
    "description": "Effet relief bicolore blanc et camel, texture travaillée.",
    "price": 17500,
    "stock": 6,
    "images": [
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Tote-Relief-Blanc-et-Camel/Sac-a-Main-Le-Tote-Relief-Blanc-et-Camel1.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Tote-Relief-Blanc-et-Camel/Sac-a-Main-Le-Tote-Relief-Blanc-et-Camel2.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Tote-Relief-Blanc-et-Camel/Sac-a-Main-Le-Tote-Relief-Blanc-et-Camel3.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Le-Tote-Relief-Blanc-et-Camel/Sac-a-Main-Le-Tote-Relief-Blanc-et-Camel4.png"
    ]
  },
  {
    "slug": "sac-vague-oeillets",
    "name": "Sac Vague à Œillets",
    "category": "sacs",
    "description": "Détails œillets et forme vague, style contemporain.",
    "price": 16500,
    "stock": 8,
    "images": [
      "/limak-shop/Sac-a-Main/Sac-a-Main-Vague-a-Œillets/Sac-a-Main-Vague-a-Œillets1.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Vague-a-Œillets/Sac-a-Main-Vague-a-Œillets2.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Vague-a-Œillets/Sac-a-Main-Vague-a-Œillets3.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Vague-a-Œillets/Sac-a-Main-Vague-a-Œillets4.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Vague-a-Œillets/Sac-a-Main-Vague-a-Œillets5.png",
      "/limak-shop/Sac-a-Main/Sac-a-Main-Vague-a-Œillets/Sac-a-Main-Vague-a-Œillets6.png"
    ]
  },
  {
    "slug": "montre-cartier-blanc-argent",
    "name": "Montre Cartier Monarque Blanc/Argent",
    "category": "montres",
    "description": "Cadran blanc et bracelet argenté, élégance classique.",
    "price": 18000,
    "stock": 6,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-blanc-argent/Montre-Cartier-Monarque-blanc-argent1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-blanc-argent/Montre-Cartier-Monarque-blanc-argent2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-blanc-argent/Montre-Cartier-Monarque-blanc-argent3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-blanc-argent/Montre-Cartier-Monarque-blanc-argent4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-blanc-argent/Montre-Cartier-Monarque-blanc-argent5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-blanc-argent/Montre-Cartier-Monarque-blanc-argent6.png"
    ]
  },
  {
    "slug": "montre-cartier-bleu-ciel-argent",
    "name": "Montre Cartier Monarque Bleu Ciel/Argent",
    "category": "montres",
    "description": "Cadran bleu ciel et bracelet argenté, style raffiné.",
    "price": 18000,
    "stock": 6,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-bleu-ciel-argent/Montre-Cartier-Monarque-bleu-ciel-argent1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-bleu-ciel-argent/Montre-Cartier-Monarque-bleu-ciel-argent2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-bleu-ciel-argent/Montre-Cartier-Monarque-bleu-ciel-argent3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-bleu-ciel-argent/Montre-Cartier-Monarque-bleu-ciel-argent4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-bleu-ciel-argent/Montre-Cartier-Monarque-bleu-ciel-argent5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-bleu-ciel-argent/Montre-Cartier-Monarque-bleu-ciel-argent6.png"
    ]
  },
  {
    "slug": "montre-cartier-bleu-nuit-gold",
    "name": "Montre Cartier Monarque Bleu Nuit/Gold",
    "category": "montres",
    "description": "Cadran bleu nuit et finitions dorées, prestige assuré.",
    "price": 19000,
    "stock": 5,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-Bleu-nuit-gold/Montre-Cartier-Monarque-Bleu-nuit-gold1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-Bleu-nuit-gold/Montre-Cartier-Monarque-Bleu-nuit-gold2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-Bleu-nuit-gold/Montre-Cartier-Monarque-Bleu-nuit-gold3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-Bleu-nuit-gold/Montre-Cartier-Monarque-Bleu-nuit-gold4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-Bleu-nuit-gold/Montre-Cartier-Monarque-Bleu-nuit-gold5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Cartier/Montre-Cartier-Monarque-Bleu-nuit-gold/Montre-Cartier-Monarque-Bleu-nuit-gold6.png"
    ]
  },
  {
    "slug": "montre-rolex-emeraude",
    "name": "Montre Rolex Émeraude Prestige Verte/Argent",
    "category": "montres",
    "description": "Cadran vert émeraude, bracelet argenté, allure prestige.",
    "price": 21000,
    "stock": 4,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Emeraude-Prestige-verte-argent/Montre-Rolex-Emeraude-Prestige-verte-argent1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Emeraude-Prestige-verte-argent/Montre-Rolex-Emeraude-Prestige-verte-argent2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Emeraude-Prestige-verte-argent/Montre-Rolex-Emeraude-Prestige-verte-argent3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Emeraude-Prestige-verte-argent/Montre-Rolex-Emeraude-Prestige-verte-argent4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Emeraude-Prestige-verte-argent/Montre-Rolex-Emeraude-Prestige-verte-argent5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Emeraude-Prestige-verte-argent/Montre-Rolex-Emeraude-Prestige-verte-argent7.png"
    ]
  },
  {
    "slug": "montre-rolex-golden-prestige",
    "name": "Montre Rolex Golden Prestige Verte/Gold",
    "category": "montres",
    "description": "Cadran vert et finitions dorées, luxe discret.",
    "price": 22000,
    "stock": 4,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-rolex-Golden-Prestige-verte-gold/Montre-rolex-Golden-Prestige-verte-gold1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-rolex-Golden-Prestige-verte-gold/Montre-rolex-Golden-Prestige-verte-gold2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-rolex-Golden-Prestige-verte-gold/Montre-rolex-Golden-Prestige-verte-gold3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-rolex-Golden-Prestige-verte-gold/Montre-rolex-Golden-Prestige-verte-gold4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-rolex-Golden-Prestige-verte-gold/Montre-rolex-Golden-Prestige-verte-gold5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-rolex-Golden-Prestige-verte-gold/Montre-rolex-Golden-Prestige-verte-gold6.png"
    ]
  },
  {
    "slug": "montre-rolex-golden-signature",
    "name": "Montre Rolex Golden Signature",
    "category": "montres",
    "description": "Modèle signature tout doré, pièce d'exception.",
    "price": 23000,
    "stock": 3,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Golden-Signature/Montre-Rolex-Golden-Signature1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Golden-Signature/Montre-Rolex-Golden-Signature2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Golden-Signature/Montre-Rolex-Golden-Signature3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Golden-Signature/Montre-Rolex-Golden-Signature4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Golden-Signature/Montre-Rolex-Golden-Signature5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Golden-Signature/Montre-Rolex-Golden-Signature6.png"
    ]
  },
  {
    "slug": "montre-rolex-olive",
    "name": "Montre Rolex Olive Prestige Verte/Argent",
    "category": "montres",
    "description": "Cadran vert olive et bracelet argenté, sobriété élégante.",
    "price": 21000,
    "stock": 5,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Olive-Prestige-verte-argent/Montre-Rolex-Olive-Prestige-verte-argent1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Olive-Prestige-verte-argent/Montre-Rolex-Olive-Prestige-verte-argent2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Olive-Prestige-verte-argent/Montre-Rolex-Olive-Prestige-verte-argent3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Olive-Prestige-verte-argent/Montre-Rolex-Olive-Prestige-verte-argent4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Olive-Prestige-verte-argent/Montre-Rolex-Olive-Prestige-verte-argent5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Olive-Prestige-verte-argent/Montre-Rolex-Olive-Prestige-verte-argent6.png"
    ]
  },
  {
    "slug": "montre-rolex-onyx-blanc-gold",
    "name": "Montre Rolex Onyx Prestige Blanc/Argent/Gold",
    "category": "montres",
    "description": "Cadran blanc, mix argent et or, allure premium.",
    "price": 22500,
    "stock": 4,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold/Montre-Rolex-Onyx-Prestige-blanc-mix-argent-gold6.png"
    ]
  },
  {
    "slug": "montre-rolex-onyx-bleu",
    "name": "Montre Rolex Onyx Prestige Bleu/Argent/Bleu",
    "category": "montres",
    "description": "Cadran bleu, bracelet mix argent-bleu, style affirmé.",
    "price": 22000,
    "stock": 5,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu/Montre-Rolex-Onyx-Prestige-bleu-mix-argent-bleu6.png"
    ]
  },
  {
    "slug": "montre-rolex-onyx-noir",
    "name": "Montre Rolex Onyx Prestige Noir/Argent",
    "category": "montres",
    "description": "Cadran noir et bracelet argenté, intemporel et élégant.",
    "price": 21500,
    "stock": 5,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent/Montre-Rolex-Onyx-Prestige-noir-mix-argent1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent/Montre-Rolex-Onyx-Prestige-noir-mix-argent2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent/Montre-Rolex-Onyx-Prestige-noir-mix-argent3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent/Montre-Rolex-Onyx-Prestige-noir-mix-argent4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent/Montre-Rolex-Onyx-Prestige-noir-mix-argent5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent/Montre-Rolex-Onyx-Prestige-noir-mix-argent6.png"
    ]
  },
  {
    "slug": "montre-rolex-onyx-noir-gold",
    "name": "Montre Rolex Onyx Prestige Noir/Argent/Gold",
    "category": "montres",
    "description": "Cadran noir, mix argent-or, prestige absolu.",
    "price": 23500,
    "stock": 3,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Rolex/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold/Montre-Rolex-Onyx-Prestige-noir-mix-argent-gold6.png"
    ]
  },
  {
    "slug": "montre-tissot-blanc-argent",
    "name": "Montre Tissot Onyx Prestige Blanc/Argent",
    "category": "montres",
    "description": "Cadran blanc et bracelet argenté, élégance sobre.",
    "price": 19000,
    "stock": 6,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-blanc-argent/Montre-Tissot-Onyx-Prestige-blanc-argent1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-blanc-argent/Montre-Tissot-Onyx-Prestige-blanc-argent2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-blanc-argent/Montre-Tissot-Onyx-Prestige-blanc-argent3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-blanc-argent/Montre-Tissot-Onyx-Prestige-blanc-argent4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-blanc-argent/Montre-Tissot-Onyx-Prestige-blanc-argent5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-blanc-argent/Montre-Tissot-Onyx-Prestige-blanc-argent6.png"
    ]
  },
  {
    "slug": "montre-tissot-bleu-argent",
    "name": "Montre Tissot Onyx Prestige Bleu/Argent",
    "category": "montres",
    "description": "Cadran bleu et bracelet argenté, allure dynamique.",
    "price": 19000,
    "stock": 6,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-bleu-argent/Montre-Tissot-Onyx-Prestige-bleu-argent1.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-bleu-argent/Montre-Tissot-Onyx-Prestige-bleu-argent2.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-bleu-argent/Montre-Tissot-Onyx-Prestige-bleu-argent3.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-bleu-argent/Montre-Tissot-Onyx-Prestige-bleu-argent4.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-bleu-argent/Montre-Tissot-Onyx-Prestige-bleu-argent5.png",
      "/limak-shop/accesoires/montre-et-consort/Montre-Tissot/Montre-Tissot-Onyx-Prestige-bleu-argent/Montre-Tissot-Onyx-Prestige-bleu-argent6.png"
    ]
  },
  {
    "slug": "bijoux-eclat-royal",
    "name": "Ensemble Éclat Royal — Collier & Bracelet",
    "category": "montres",
    "description": "Ensemble collier et bracelet dorés, parure raffinée pour toutes occasions.",
    "price": 16000,
    "stock": 6,
    "images": [
      "/limak-shop/accesoires/montre-et-consort/bijoux/Eclat-Royal-Ensemble-Collier-et-Bracelet/IMG_20260725_115817.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux/Eclat-Royal-Ensemble-Collier-et-Bracelet/IMG_20260725_115835.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux/Eclat-Royal-Ensemble-Collier-et-Bracelet/IMG_20260725_115859.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux/Eclat-Royal-Ensemble-Collier-et-Bracelet/IMG_20260725_115920.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux/Eclat-Royal-Ensemble-Collier-et-Bracelet/IMG_20260725_115952.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux/Eclat-Royal-Ensemble-Collier-et-Bracelet/IMG_20260725_120040.png",
      "/limak-shop/accesoires/montre-et-consort/bijoux/Eclat-Royal-Ensemble-Collier-et-Bracelet/IMG_20260725_120247.png"
    ]
  },
  {
    "slug": "pull-jaune",
    "name": "Pullover Jaune",
    "category": "vetements",
    "description": "Coloris jaune vif, douceur et confort pour un style affirmé.",
    "price": 9000,
    "stock": 8,
    "images": [
      "/limak-shop/vetements/pull-jaune.png"
    ]
  }
];

async function main() {
  // On repart d'un catalogue propre (ce sont des données de test, aucune
  // commande réelle n'existe encore, donc c'est sans risque).
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 1) Le vendeur unique LIMAK (structure prête pour le multi-vendeurs)
  const vendor = await prisma.vendor.upsert({
    where: { slug: "limak" },
    update: {},
    create: { name: "LIMAK", slug: "limak" },
  });

  // 2) Les catégories
  const categoryIdBySlug: Record<string, string> = {};
  for (const [slug, name] of Object.entries(CATEGORIES)) {
    const cat = await prisma.category.create({ data: { slug, name } });
    categoryIdBySlug[slug] = cat.id;
  }

  // 3) Les produits (avec une variante "Standard" + leurs images)
  let count = 0;
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: "LIMAK",
        vendorId: vendor.id,
        categoryId: p.category ? categoryIdBySlug[p.category] ?? null : null,
        variants: { create: [{ name: "Standard", price: p.price, stock: p.stock }] },
        images: { create: p.images.map((url, i) => ({ url, position: i })) },
      },
    });
    count++;
  }

  console.log(`✅ ${count} produits importés dans la base.`);
  console.log(`   ${Object.keys(CATEGORIES).length} catégories créées.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erreur pendant le seed :", e);
    await prisma.$disconnect();
    process.exit(1);
  });
