import type { Card } from './db/types';

export function normalize(s: string): string {
  return s
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss');
}

export function matchesCard(card: Card, query: string): boolean {
  if (!query) return true;
  const q = normalize(query.trim());
  return normalize(card.front.text).includes(q) || normalize(card.back.text).includes(q);
}
