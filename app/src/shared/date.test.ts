import { daysBetween, formatDayMonth, toLocalDate } from './date';

// 22h30 do dia 12 no fuso de quem roda o teste: em Goiânia, já é dia 13 em UTC.
const lateEvening = new Date(2026, 9, 12, 22, 30).toISOString();

describe('datas no fuso do aparelho', () => {
  it('data-hora da API vira o dia local, e não o dia em UTC', () => {
    expect(toLocalDate(lateEvening)).toBe('2026-10-12');
    expect(formatDayMonth(lateEvening)).toBe('12/10');
  });

  it('a contagem de dias parte do dia local do evento', () => {
    expect(daysBetween(lateEvening, '2026-10-15')).toBe(3);
  });

  it('data pura passa como está', () => {
    expect(toLocalDate('2026-10-28')).toBe('2026-10-28');
  });
});
