// ============================================================
//  BANDEAU DÉFILANT (ticker) — juste sous le header
//  Fond doré, texte bleu nuit, défilement continu en boucle CSS.
//  Icônes traits simples (comme l'ancienne bande de réassurance),
//  pas d'emoji. Le contenu est dupliqué pour que la boucle soit invisible.
// ============================================================

function IconeCamion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 3h13v13H1z" />
      <path d="M14 8h4l4 4v4h-8V8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
function IconeBillet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 6v0M18 6v0M6 18v0M18 18v0" />
    </svg>
  );
}
function IconeBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l2.4 2.1 3.1-.4.6 3.1 2.9 1.4-1.4 2.9 1.4 2.9-2.9 1.4-.6 3.1-3.1-.4L12 21l-2.4-2.1-3.1.4-.6-3.1-2.9-1.4 1.4-2.9-1.4-2.9 2.9-1.4.6-3.1 3.1.4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconeFeu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1 1 2 2.5 2 4.5A5 5 0 0 1 7 15c0-4 3-5 3-9 1 1 2 2 2 4 1-1 0-6 0-8Z" />
    </svg>
  );
}

const MESSAGES = [
  { Icone: IconeFeu, texte: "Bonnes affaires toute la semaine" },
  { Icone: IconeCamion, texte: "Livraison partout en Côte d'Ivoire" },
  { Icone: IconeBillet, texte: "Paiement à la livraison" },
  { Icone: IconeBadge, texte: "Articles vérifiés et de qualité" },
];

function Contenu() {
  return (
    <span className="flex shrink-0 items-center">
      {MESSAGES.map(({ Icone, texte }, i) => (
        <span key={i} className="flex items-center gap-2 whitespace-nowrap px-6 text-xs font-semibold sm:text-sm">
          <Icone className="h-3.5 w-3.5 shrink-0" />
          {texte}
          <span className="ml-6 opacity-40">·</span>
        </span>
      ))}
    </span>
  );
}

export default function Ticker() {
  return (
    <div className="overflow-hidden bg-[#E8C255] text-[#14213D]">
      <div className="limak-marquee-track flex w-max py-1.5">
        <Contenu />
        <Contenu />
      </div>
    </div>
  );
}
