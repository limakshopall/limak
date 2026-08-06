// ============================================================
//  PIED DE PAGE — contact, livraison, infos légales, réseaux.
//  Présent sur toutes les pages (rendu global dans layout.tsx).
// ============================================================

import Link from "next/link";

const NUMERO_WHATSAPP = "2250717678784"; // +225 07 17 67 87 84

const LIENS_LEGAUX = [
  { href: "/conditions-generales", label: "Conditions Générales de Vente" },
  { href: "/confidentialite", label: "Politique de Confidentialité" },
  { href: "/retours", label: "Politique de Retour (7 jours)" },
  { href: "/about", label: "À Propos" },
];

function IconeTelephone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function IconeEnveloppe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}

function IconeBoutique({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9 5 3h14l2 6" />
      <path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function IconeHorloge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function IconeCamion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 3h13v13H1z" />
      <path d="M14 8h4l4 4v4h-8V8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function IconeBillet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconeInfo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function IconeInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconeFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 3h-2a5 5 0 0 0-5 5v3H6v4h2v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1h3Z" />
    </svg>
  );
}

function IconeTiktok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 3v11a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3a5 5 0 0 0 5 5" />
    </svg>
  );
}

const RESEAUX = [
  { href: "#", label: "Instagram", Icone: IconeInstagram },
  { href: "#", label: "Facebook", Icone: IconeFacebook },
  { href: "#", label: "TikTok", Icone: IconeTiktok },
];

export default function Footer() {
  return (
    <footer className="border-t-2 border-[#E8C255] bg-[#FBEEDA] dark:border-[#E8C255]/60 dark:bg-[#1c2333]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* --- CONTACT --- */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#14213D] dark:text-[#E8C255]">
              Contact
            </p>
            <ul className="space-y-2.5 text-sm text-neutral-700 dark:text-gray-300">
              <li>
                <a
                  href={`https://wa.me/${NUMERO_WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#14213D] dark:hover:text-[#E8C255]"
                >
                  <IconeTelephone className="h-4 w-4 shrink-0 text-[#E8C255]" />
                  WhatsApp : +225 07 17 67 87 84
                </a>
              </li>
              <li>
                <a
                  href="mailto:limak.shopall@gmail.com"
                  className="flex items-center gap-2 hover:text-[#14213D] dark:hover:text-[#E8C255]"
                >
                  <IconeEnveloppe className="h-4 w-4 shrink-0 text-[#E8C255]" />
                  limak.shopall@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <IconeBoutique className="h-4 w-4 shrink-0 text-[#E8C255]" />
                Abidjan, Côte d&apos;Ivoire
              </li>
              <li className="flex items-center gap-2">
                <IconeHorloge className="h-4 w-4 shrink-0 text-[#E8C255]" />
                Lun-Sam 08h00-18h00
              </li>
            </ul>
          </div>

          {/* --- LIVRAISON --- */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#14213D] dark:text-[#E8C255]">
              Livraison
            </p>
            <ul className="space-y-2.5 text-sm text-neutral-700 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <IconeCamion className="h-4 w-4 shrink-0 text-[#1F7A5C]" />
                Livraison partout en Côte d&apos;Ivoire
              </li>
              <li className="flex items-center gap-2">
                <IconeBillet className="h-4 w-4 shrink-0 text-[#1F7A5C]" />
                Paiement à la livraison (cash ou mobile money)
              </li>
              <li className="flex items-start gap-2">
                <IconeInfo className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 dark:text-gray-400" />
                <span className="text-neutral-500 dark:text-gray-400">
                  Frais : selon le lieu de livraison
                </span>
              </li>
            </ul>
          </div>

          {/* --- INFOS LÉGALES --- */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#14213D] dark:text-[#E8C255]">
              Informations
            </p>
            <ul className="space-y-2.5 text-sm text-neutral-700 dark:text-gray-300">
              {LIENS_LEGAUX.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#14213D] dark:hover:text-[#E8C255]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- RÉSEAUX --- */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#14213D] dark:text-[#E8C255]">
              Suivez-nous
            </p>
            <div className="flex gap-3">
              {RESEAUX.map(({ href, label, Icone }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#14213D]/15 text-[#14213D] transition hover:border-[#E8C255] hover:bg-[#E8C255]/10 hover:text-[#C95900] dark:border-white/15 dark:text-gray-300 dark:hover:border-[#E8C255]"
                >
                  <Icone className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* --- COPYRIGHT --- */}
        <div className="mt-10 border-t border-[#14213D]/10 pt-6 text-center text-xs text-neutral-500 dark:border-white/15 dark:text-gray-400">
          <p>© {new Date().getFullYear()} LIMAK. Tous droits réservés.</p>
          <p className="mt-1">Propulsé par Abdallah Thera &amp; LIMAK</p>
        </div>
      </div>
    </footer>
  );
}
