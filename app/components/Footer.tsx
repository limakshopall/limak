// ============================================================
//  PIED DE PAGE RICHE — fond bleu nuit, accents dorés
// ============================================================

import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const LIENS_BOUTIQUE = [
  { href: "/produits", label: "Tous les articles" },
  { href: "/panier", label: "Panier" },
  { href: "/mes-commandes", label: "Mes commandes" },
];

const RESEAUX = [
  { href: "https://wa.me/2250717678784", label: "WhatsApp" },
  { href: "mailto:limak.shopall@gmail.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="bg-[#14213D] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-extrabold text-[#E8C255]">LIMAK</p>
            <p className="mt-2 max-w-xs text-sm text-white/60">
              Votre boutique en ligne en Côte d&apos;Ivoire. Paiement à la livraison.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#E8C255]">Boutique</p>
            <ul className="space-y-2 text-sm text-white/70">
              {LIENS_BOUTIQUE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#E8C255]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#E8C255]">Une question ?</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Email : limak.shopall@gmail.com</li>
              <li>WhatsApp : +225 07 17 67 87 84</li>
              <li className="flex gap-3 pt-1">
                {RESEAUX.map((r) => (
                  <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#E8C255]">
                    {r.label}
                  </a>
                ))}
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#E8C255]">Newsletter</p>
            <p className="mb-3 text-sm text-white/60">Nos meilleures offres, directement par email.</p>
            <NewsletterForm />
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} LIMAK. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
