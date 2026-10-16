import { getRandomBytes } from 'expo-crypto';

// UUID v7 (RFC 9562): os 48 bits iniciais são o instante em milissegundos, então ids gerados
// em sequência ficam em ordem. É o formato do mutation_id e do id criado no aparelho (sincronizacao.md).
export function formatUuidV7(timestampMs: number, random: Uint8Array): string {
  const bytes = Uint8Array.from(random.slice(0, 16));
  let remaining = timestampMs;
  for (let index = 5; index >= 0; index--) {
    bytes[index] = remaining % 256;
    remaining = Math.floor(remaining / 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function uuidV7(): string {
  return formatUuidV7(Date.now(), getRandomBytes(16));
}
