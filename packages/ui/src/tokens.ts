// Mirrors the CSS custom properties in `styles/globals.css`. Kept in sync by
// hand for now — the two only drift if a color is added to one and not the
// other, which review should catch since they're right next to each other.
export const ademiconPalette = {
  azulInstitucional: "#003B71",
  azulSecundario: "#005DAA",
  branco: "#FFFFFF",
  cinzaFundo: "#F6F8FB",
  cinzaEscuro: "#1F2937",
  verde: "#22C55E",
  amarelo: "#F59E0B",
  vermelho: "#EF4444",
} as const;

export type AdemiconPaletteKey = keyof typeof ademiconPalette;
