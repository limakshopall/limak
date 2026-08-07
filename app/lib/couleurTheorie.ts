// ============================================================
//  ADBUILDER — théorie des couleurs (complémentaire/analogues/tons)
//  Calculs simples en HSL, sans dépendance externe.
// ============================================================

function hexVersHsl(hex: string): { h: number; s: number; l: number } {
  const h = hex.replace("#", "");
  const r = (parseInt(h.substring(0, 2), 16) || 0) / 255;
  const g = (parseInt(h.substring(2, 4), 16) || 0) / 255;
  const b = (parseInt(h.substring(4, 6), 16) || 0) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let teinte: number;
  switch (max) {
    case r:
      teinte = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      teinte = (b - r) / d + 2;
      break;
    default:
      teinte = (r - g) / d + 4;
  }
  return { h: teinte * 60, s, l };
}

function hslVersHex({ h, s, l }: { h: number; s: number; l: number }): string {
  const teinte = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((teinte / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (teinte < 60) [r, g, b] = [c, x, 0];
  else if (teinte < 120) [r, g, b] = [x, c, 0];
  else if (teinte < 180) [r, g, b] = [0, c, x];
  else if (teinte < 240) [r, g, b] = [0, x, c];
  else if (teinte < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const versHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${versHex(r)}${versHex(g)}${versHex(b)}`.toUpperCase();
}

export type ComboCouleurs = {
  base: string;
  complementaire: string;
  analogue1: string;
  analogue2: string;
  clair: string;
  fonce: string;
};

// Génère un combo de couleurs harmonieuses à partir d'une couleur de base.
export function genererComboCouleurs(hexBase: string): ComboCouleurs {
  const hsl = hexVersHsl(hexBase);
  return {
    base: hexBase.toUpperCase(),
    complementaire: hslVersHex({ ...hsl, h: hsl.h + 180 }),
    analogue1: hslVersHex({ ...hsl, h: hsl.h + 30 }),
    analogue2: hslVersHex({ ...hsl, h: hsl.h - 30 }),
    clair: hslVersHex({ ...hsl, l: Math.min(0.92, hsl.l + 0.25) }),
    fonce: hslVersHex({ ...hsl, l: Math.max(0.08, hsl.l - 0.25) }),
  };
}
