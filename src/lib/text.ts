export function plural(n: number, one: string, many: string): string {
  return `${n.toLocaleString('de-DE')} ${n === 1 ? one : many}`;
}

export function percent(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}
