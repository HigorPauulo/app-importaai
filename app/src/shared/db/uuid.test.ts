import { formatUuidV7 } from './uuid';

describe('formatUuidV7', () => {
  const random = new Uint8Array(16).fill(0xff);
  const instant = Date.UTC(2026, 9, 12, 17, 30);

  it('marca versão 7 e variante RFC 9562', () => {
    expect(formatUuidV7(instant, random)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('começa pelo instante em milissegundos, então ids posteriores ordenam depois', () => {
    const id = formatUuidV7(instant, random);
    expect(id.replace('-', '').slice(0, 12)).toBe(instant.toString(16).padStart(12, '0'));
    expect(formatUuidV7(instant + 1, new Uint8Array(16)) > id).toBe(true);
  });
});
