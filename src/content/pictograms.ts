// Piktogramme für Ordner: Inline-SVG (24×24, Strich), keine Icon-Library, keine Emojis.
export interface Pictogram {
  id: string;
  label: string;
  svg: string;
}

export const pictograms: Pictogram[] = [
  { id: 'book', label: 'Buch', svg: '<path d="M12 6.5C10.4 5.2 8 4.6 4 4.6v13c4 0 6.4.6 8 2 1.6-1.4 4-2 8-2v-13c-4 0-6.4.6-8 1.9z"/><path d="M12 6.5v13"/>' },
  { id: 'sigma', label: 'Formel', svg: '<path d="M17.5 5.5V4.5h-11l6.5 7.5-6.5 7.5h11v-1"/>' },
  { id: 'calculator', label: 'Rechnen', svg: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" stroke-width="2.4"/>' },
  { id: 'triangle', label: 'Geometrie', svg: '<path d="M4.5 19.5v-15l15 15z"/><path d="M8.5 15.5v-4.2l4.2 4.2z"/>' },
  { id: 'chart', label: 'Statistik', svg: '<path d="M4.5 4.5v15h15"/><path d="M9 15.5v-4M13 15.5v-7M17 15.5v-9.5"/>' },
  { id: 'molecule', label: 'Molekül', svg: '<circle cx="12" cy="6" r="2.4"/><circle cx="6" cy="17" r="2.4"/><circle cx="18" cy="17" r="2.4"/><path d="M10.8 8.1l-3.6 6.8M13.2 8.1l3.6 6.8M8.4 17h7.2"/>' },
  { id: 'flask', label: 'Labor', svg: '<path d="M9.5 3.5h5M10.2 3.5V9.5L5 18.2A1.6 1.6 0 0 0 6.4 20.5h11.2a1.6 1.6 0 0 0 1.4-2.3L13.8 9.5v-6"/><path d="M7.3 15h9.4"/>' },
  { id: 'atom', label: 'Atom', svg: '<circle cx="12" cy="12" r="1.3" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>' },
  { id: 'bolt', label: 'Physik', svg: '<path d="M13 3L5.5 13.5h6L10.5 21 18.5 10.5h-6z"/>' },
  { id: 'dna', label: 'Genetik', svg: '<path d="M7.5 3c0 4.5 9 4.5 9 9s-9 4.5-9 9M16.5 3c0 4.5-9 4.5-9 9s9 4.5 9 9"/><path d="M9.3 6h5.4M9.3 18h5.4"/>' },
  { id: 'leaf', label: 'Blatt', svg: '<path d="M5 19.5C5 11 10 5.5 19.5 4.5 19 13.5 14 19 6.5 19.5z"/><path d="M5 19.5c3-4.5 6.5-8 10-10.5"/>' },
  { id: 'sprout', label: 'Pflanze', svg: '<path d="M12 20.5V11"/><path d="M12 11c0-4 2.8-6.5 7-6.5 0 4-2.8 6.5-7 6.5zM12 14c0-3.4-2.4-5.5-6.5-5.5 0 3.4 2.4 5.5 6.5 5.5z"/>' },
  { id: 'heart', label: 'Herz', svg: '<path d="M12 20s-7.5-4.6-7.5-10.1C4.5 7.2 6.4 5.3 8.8 5.3c1.4 0 2.5.7 3.2 1.8.7-1.1 1.8-1.8 3.2-1.8 2.4 0 4.3 1.9 4.3 4.6C19.5 15.4 12 20 12 20z"/>' },
  { id: 'cross', label: 'Medizin', svg: '<path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z"/>' },
  { id: 'lightbulb', label: 'Idee', svg: '<path d="M9.5 17.5h5M10.5 20.5h3"/><path d="M12 3.5a5.8 5.8 0 0 0-3.4 10.5c.6.5.9 1.1.9 1.9v1.6h5v-1.6c0-.8.3-1.4.9-1.9A5.8 5.8 0 0 0 12 3.5z"/>' },
  { id: 'globe', label: 'Globus', svg: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.5 5.4 3.5 8.5s-1.1 6-3.5 8.5c-2.4-2.5-3.5-5.4-3.5-8.5s1.1-6 3.5-8.5z"/>' },
  { id: 'mountain', label: 'Geografie', svg: '<path d="M2.5 19.5l7-11.5 4.2 6.8 2.3-3.3 5.5 8z"/><circle cx="17.5" cy="6" r="1.8"/>' },
  { id: 'compass', label: 'Kompass', svg: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>' },
  { id: 'language', label: 'Sprache', svg: '<path d="M4 4.5h10A1.5 1.5 0 0 1 15.5 6v6a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 3v-3H4A1.5 1.5 0 0 1 2.5 12V6A1.5 1.5 0 0 1 4 4.5z"/><path d="M18.5 9H20a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 20 18h-1.5v2.5L15.5 18H12a1.5 1.5 0 0 1-1.5-1.5v-.5"/>' },
  { id: 'pencil', label: 'Schreiben', svg: '<path d="M4.5 19.5l1-4.2L15.8 5a2 2 0 0 1 2.9 0l.3.3a2 2 0 0 1 0 2.9L8.7 18.5z"/><path d="M14 7l3 3"/>' },
  { id: 'brush', label: 'Kunst', svg: '<path d="M19.5 4.5c-3 1.8-7 5.6-9 8.3l1.7 1.7c2.7-2 6.5-6 8.3-9z"/><path d="M10.2 13.1c-2-.3-3.7 1-4 2.8-.3 1.6-.6 2.8-2.2 3.6 2.8.8 6 .3 7.2-1.5.8-1.2.6-3-1-4.9z"/>' },
  { id: 'music', label: 'Musik', svg: '<path d="M9 18V5.5l10.5-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M9 9.5l10.5-2"/>' },
  { id: 'camera', label: 'Foto', svg: '<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>' },
  { id: 'hourglass', label: 'Geschichte', svg: '<path d="M6 3.5h12M6 20.5h12"/><path d="M7.5 3.5v2c0 3 4.5 4.5 4.5 6.5s-4.5 3.5-4.5 6.5v2M16.5 3.5v2c0 3-4.5 4.5-4.5 6.5s4.5 3.5 4.5 6.5v2"/>' },
  { id: 'columns', label: 'Politik', svg: '<path d="M3.5 9L12 4l8.5 5z"/><path d="M5.5 11v6.5M9.8 11v6.5M14.2 11v6.5M18.5 11v6.5M3.5 20h17"/>' },
  { id: 'scales', label: 'Recht', svg: '<path d="M12 4v16M8 20h8M5 7.5h14M12 4.5v3"/><path d="M5 7.5l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7.5l-2.5 6a2.5 2.5 0 0 0 5 0z"/>' },
  { id: 'briefcase', label: 'Wirtschaft', svg: '<rect x="3" y="7" width="18" height="13" rx="2.2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18"/>' },
  { id: 'code', label: 'Informatik', svg: '<path d="M8.5 7l-5 5 5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>' },
  { id: 'cap', label: 'Studium', svg: '<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4M21.5 9.5v5"/>' },
  { id: 'ball', label: 'Sport', svg: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5v17M6 6c2.6 3.3 2.6 8.7 0 12M18 6c-2.6 3.3-2.6 8.7 0 12"/>' },
  { id: 'star', label: 'Stern', svg: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>' },
  { id: 'sun', label: 'Sonne', svg: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>' },
  { id: 'moon', label: 'Mond', svg: '<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/>' },
  { id: 'cup', label: 'Kaffee', svg: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.6.8-.6 1.7 0 2.5M12 3.5c-.6.8-.6 1.7 0 2.5"/>' },
  { id: 'flag', label: 'Ziel', svg: '<path d="M5.5 21V4M5.5 4.5h11l-2 4 2 4h-11"/>' }
];

const byId = new Map(pictograms.map((p) => [p.id, p]));

export function pictogram(id: string | undefined): Pictogram {
  return (id && byId.get(id)) || pictograms[0];
}
