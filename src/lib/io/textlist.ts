// Einfache Textlisten: eine Karte pro Zeile, „Vorderseite;Rückseite“ (Tabulator geht auch).

export interface TextCard {
  front: string;
  back: string;
}

export function parseTextList(text: string): { cards: TextCard[]; skipped: number } {
  const cards: TextCard[] = [];
  let skipped = 0;
  for (const raw of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const sep = line.includes('\t') ? '\t' : ';';
    const i = findSeparator(line, sep);
    if (i < 0) {
      skipped++;
      continue;
    }
    const front = unescape(line.slice(0, i).trim());
    const back = unescape(line.slice(i + 1).trim());
    if (!front || !back) {
      skipped++;
      continue;
    }
    cards.push({ front, back });
  }
  return { cards, skipped };
}

/** Erstes Trennzeichen, das nicht mit „\“ maskiert ist. */
function findSeparator(line: string, sep: string): number {
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '\\') i++;
    else if (line[i] === sep) return i;
  }
  return -1;
}

/** Zeilenumbrüche innerhalb einer Seite werden als „\n“ geschrieben. */
function escape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\;');
}

function unescape(s: string) {
  return s.replace(/\\(n|;|\\)/g, (_, c) => (c === 'n' ? '\n' : c));
}

export function toTextList(cards: TextCard[]): string {
  return cards.map((c) => `${escape(c.front)};${escape(c.back)}`).join('\n') + '\n';
}
