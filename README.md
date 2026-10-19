# Karteikarten

Eine ruhige, schöne Karteikarten-App als Progressive Web App für das iPhone.
Alles bleibt lokal auf dem Gerät – kein Konto, kein Server, kein Tracking.

**App öffnen:** https://djc7gwrbnh-cyber.github.io/Karteikartenapp/
In Safari öffnen → Teilen → „Zum Home-Bildschirm“.

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm test         # Unit-Tests (Vitest)
npm run check    # Typprüfung
npm run build    # Produktions-Build nach dist/
```

Jeder Push auf `main` wird per GitHub Actions gebaut, getestet und auf GitHub Pages veröffentlicht
(einmalig: Settings → Pages → Source: „GitHub Actions“).

## Stack

| Teil | Wahl | Warum |
| --- | --- | --- |
| UI | Svelte 5 + TypeScript | Kompiliert zu kleinem, schnellem JavaScript ohne Framework-Laufzeit |
| Build | Vite | Schnell, statischer Output für GitHub Pages |
| Daten | Dexie (IndexedDB) | Robuste lokale Datenbank mit Schema-Migrationen und Live-Abfragen |
| Offline | vite-plugin-pwa (Workbox, nur Build-Zeit) | Erzeugt Service Worker und Manifest zuverlässig |
| Tests | Vitest, fake-indexeddb (nur Entwicklung) | Unit-Tests für Lernalgorithmus, Sitzungslogik, Import |

Laufzeit-Abhängigkeiten: nur `svelte` und `dexie`. Symbole, Diagramme, Bildbearbeitung und
Virtualisierung sind selbst gebaut.

## Projektstruktur

```
src/
  app/        App-Rahmen, Router, Tab Bar, PWA-Registrierung
  design/     Design-Tokens (Farben, Abstände, Typografie) und Grundstil
  lib/        Reine Logik: Datenbank, Spaced Repetition, Sitzung, Statistik, Import/Export, Bilder
  content/    Texte und Symbole: Motivationsnachrichten (messages.ts), Piktogramme, Farbpalette
  ui/         Kleine, wiederverwendbare Bausteine
  features/   Bildschirme: learn, study, history, settings
```

Motivationsnachrichten lassen sich in `src/content/messages.ts` bearbeiten.
Das App-Icon liegt in `public/icon.svg`; die PNG-Varianten erzeugt `scripts/icons.cjs`.
