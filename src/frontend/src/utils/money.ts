export function formatGNF(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString('fr-GN');
  return `${formatted} GNF`;
}

export function parseGNF(input: string): number | null {
  const cleaned = input.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed) || parsed < 0) {
    return null;
  }
  
  return Math.round(parsed);
}
