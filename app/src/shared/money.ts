// Valor digitado ↔ menor unidade da moeda (centavos), sem ponto flutuante.

// "180,00", "1.234,56" ou "180" viram centavos; aceita só até as casas da moeda.
// O teclado numérico de alguns aparelhos só tem ponto: sem vírgula, "1.5" é decimal, e não milhar.
export function parseMoney(text: string, minorUnits: number): number | null {
  const trimmed = text.trim();
  const decimalDot = new RegExp(`^\\d+\\.\\d{1,${Math.max(minorUnits, 1)}}$`);
  const withComma = minorUnits > 0 && !trimmed.includes(',') && decimalDot.test(trimmed) ? trimmed.replace('.', ',') : trimmed;
  const normalized = withComma.replace(/\./g, '');
  const match = /^(\d+)(?:,(\d*))?$/.exec(normalized);
  if (!match || (match[2] ?? '').length > minorUnits) return null;
  const fraction = (match[2] ?? '').padEnd(minorUnits, '0');
  return Number(match[1]) * 10 ** minorUnits + Number(fraction || '0');
}

export function formatMoneyInput(minor: number, minorUnits: number): string {
  if (minorUnits === 0) return String(minor);
  const digits = String(minor).padStart(minorUnits + 1, '0');
  return `${digits.slice(0, -minorUnits)},${digits.slice(-minorUnits)}`;
}
