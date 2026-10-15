// Datas de calendário como texto ISO (AAAA-MM-DD), o formato guardado no SQLite.

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Dias de calendário de `from` até `to`; aceita data e data-hora ISO. Meia-noite UTC dos dois lados,
// para o horário de verão nunca tirar ou somar um dia.
export function daysBetween(from: string, to: string): number {
  const toUtc = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

// "2026-10-28" vira "28/10".
export function formatDayMonth(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

// "09:14", no fuso do aparelho.
export function formatTime(moment: Date): string {
  return `${String(moment.getHours()).padStart(2, '0')}:${String(moment.getMinutes()).padStart(2, '0')}`;
}

// Data e hora de um evento no fuso do aparelho: "HOJE · 09:14" ou "10/10 · 18:02".
export function formatEventTime(occurredAt: string, today: string): string {
  const moment = new Date(occurredAt);
  const day = toIsoDate(moment);
  return `${day === today ? 'HOJE' : formatDayMonth(day)} · ${formatTime(moment)}`;
}
