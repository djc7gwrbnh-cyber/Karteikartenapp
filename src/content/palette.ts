// Kuratierte, gedeckte Ordnerfarben. Alle tragen ein helles Symbol mit ausreichendem Kontrast
// und funktionieren im hellen wie im dunklen Modus.
export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}

export const palette: PaletteColor[] = [
  { id: 'terracotta', name: 'Terrakotta', hex: '#B8644C' },
  { id: 'ochre', name: 'Ocker', hex: '#A88035' },
  { id: 'sage', name: 'Salbei', hex: '#6B8C67' },
  { id: 'fir', name: 'Tanne', hex: '#3F6E61' },
  { id: 'dove', name: 'Taubenblau', hex: '#5C7C9B' },
  { id: 'night', name: 'Nachtblau', hex: '#44567E' },
  { id: 'lavender', name: 'Lavendel', hex: '#7C6D9C' },
  { id: 'plum', name: 'Pflaume', hex: '#8A5672' },
  { id: 'rose', name: 'Rosé', hex: '#B07272' },
  { id: 'slate', name: 'Schiefer', hex: '#646A70' }
];

const byId = new Map(palette.map((c) => [c.id, c]));

export function colorHex(id: string | null | undefined): string {
  return (id && byId.get(id)?.hex) || palette[3].hex;
}
