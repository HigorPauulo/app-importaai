import { daysBetween, formatDayMonth, toLocalDate } from '@/shared/date';
import { plural } from '@/shared/text';

// Situação e sinalizações chegam prontas da API (RN01 a RN05 têm dono no servidor, ADR-004);
// aqui só se decide como agrupar, filtrar e escrever.
export type PurchaseStatus = 'AWAITING_POSTING' | 'INTERNATIONAL_TRANSIT' | 'IN_BRAZIL' | 'DELIVERED' | 'RETURNED';

export type PurchaseFlag =
  | 'TAX_TO_REGISTER'
  | 'TAX_PENDING'
  | 'TAX_OVERDUE'
  | 'DELAYED'
  | 'STALLED'
  | 'CLAIM_WINDOW_CLOSING'
  | 'CLAIM_WINDOW_CLOSED';

export type PurchaseListItem = {
  id: string;
  productDescription: string;
  storeId: string;
  storeName: string;
  trackingCode: string;
  purchaseDate: string;
  promisedDate: string;
  amountMinor: number;
  shippingMinor: number;
  currency: string;
  minorUnits: number;
  taxDueDate: string | null;
  receivedAt: string | null;
  archivedAt: string | null;
  status: PurchaseStatus;
  flags: PurchaseFlag[];
  lastEventAt: string | null;
};

export type PurchaseFilter = 'ALL' | 'ATTENTION' | 'IN_TRANSIT' | 'DELIVERED' | 'ARCHIVED';

export const PURCHASE_FILTERS: readonly { value: PurchaseFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'ATTENTION', label: 'Com atenção' },
  { value: 'IN_TRANSIT', label: 'Em trânsito' },
  { value: 'DELIVERED', label: 'Entregues' },
  { value: 'ARCHIVED', label: 'Arquivadas' },
];

export type PurchaseSection = { key: 'ATTENTION' | 'ON_THE_WAY' | 'CONCLUDED'; title: string; purchases: PurchaseListItem[] };

export const isConcluded = (status: PurchaseStatus): boolean => status === 'DELIVERED' || status === 'RETURNED';

// As sinalizações são as da última sincronização. Se o pagamento da taxa já foi registrado no
// aparelho, cobrar de novo até o próximo envio seria mostrar algo que a pessoa já resolveu.
export function withoutResolvedFlags<T extends Pick<PurchaseListItem, 'flags'> & { taxPaidAt: string | null }>(purchase: T): T {
  if (!purchase.taxPaidAt) return purchase;
  return { ...purchase, flags: purchase.flags.filter((flag) => flag !== 'TAX_PENDING' && flag !== 'TAX_OVERDUE') };
}

const matchesFilter: Record<PurchaseFilter, (purchase: PurchaseListItem) => boolean> = {
  ALL: (purchase) => !purchase.archivedAt,
  ATTENTION: (purchase) => !purchase.archivedAt && purchase.flags.length > 0,
  IN_TRANSIT: (purchase) => !purchase.archivedAt && (purchase.status === 'INTERNATIONAL_TRANSIT' || purchase.status === 'IN_BRAZIL'),
  DELIVERED: (purchase) => !purchase.archivedAt && purchase.status === 'DELIVERED',
  ARCHIVED: (purchase) => purchase.archivedAt !== null,
};

// Busca por produto, loja ou código (RF-14), sem diferenciar maiúsculas nem acentos.
const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function filterPurchases(purchases: readonly PurchaseListItem[], filter: PurchaseFilter, query: string): PurchaseListItem[] {
  const terms = normalize(query.trim());
  return purchases.filter(
    (purchase) =>
      matchesFilter[filter](purchase) &&
      normalize(`${purchase.productDescription} ${purchase.storeName} ${purchase.trackingCode}`).includes(terms),
  );
}

// Data em que a compra se concluiu: a confirmação manual vale sobre o último evento (RN01).
const concludedOn = (purchase: PurchaseListItem) => toLocalDate(purchase.receivedAt ?? purchase.lastEventAt ?? purchase.promisedDate);

// Lista agrupada por prioridade (T03). Dentro do grupo, o prazo mais próximo primeiro (CT-29);
// nas concluídas, a mais recente primeiro. Grupo vazio não aparece.
export function groupPurchases(purchases: readonly PurchaseListItem[]): PurchaseSection[] {
  const byPromisedDate = (a: PurchaseListItem, b: PurchaseListItem) => a.promisedDate.localeCompare(b.promisedDate);
  const open = purchases.filter((purchase) => !isConcluded(purchase.status));
  const sections: PurchaseSection[] = [
    { key: 'ATTENTION', title: 'Precisa de atenção', purchases: open.filter((p) => p.flags.length > 0).sort(byPromisedDate) },
    { key: 'ON_THE_WAY', title: 'A caminho', purchases: open.filter((p) => p.flags.length === 0).sort(byPromisedDate) },
    {
      key: 'CONCLUDED',
      title: 'Entregues recentemente',
      purchases: purchases.filter((p) => isConcluded(p.status)).sort((a, b) => concludedOn(b).localeCompare(concludedOn(a))),
    },
  ];
  return sections.filter((section) => section.purchases.length > 0);
}

export function countOnTheWay(purchases: readonly PurchaseListItem[]): number {
  return purchases.filter((purchase) => !purchase.archivedAt && !isConcluded(purchase.status)).length;
}

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  AWAITING_POSTING: 'AGUARDANDO POSTAGEM',
  INTERNATIONAL_TRANSIT: 'TRÂNSITO INTERNACIONAL',
  IN_BRAZIL: 'NO BRASIL',
  DELIVERED: 'ENTREGUE',
  RETURNED: 'DEVOLVIDA',
};

// Linha ao lado da situação: o prazo, enquanto a compra está aberta; a data de conclusão, depois.
export function describeDeadline(purchase: PurchaseListItem): string {
  if (purchase.status === 'DELIVERED') return `entregue em ${formatDayMonth(concludedOn(purchase))}`;
  if (purchase.status === 'RETURNED') return `devolvida em ${formatDayMonth(concludedOn(purchase))}`;
  return `prometido para ${formatDayMonth(purchase.promisedDate)}`;
}

// Rótulo da sinalização com a contagem que ajuda a decidir ("Atrasada 8 dias", CT-30).
export function describeFlag(flag: PurchaseFlag, purchase: PurchaseListItem, today: string): string {
  switch (flag) {
    case 'TAX_TO_REGISTER':
      return 'Registrar taxa';
    case 'TAX_PENDING': {
      if (!purchase.taxDueDate) return 'Taxa pendente';
      const days = daysBetween(today, purchase.taxDueDate);
      return days <= 0 ? 'Taxa vence hoje' : days === 1 ? 'Taxa vence amanhã' : `Taxa vence em ${days} dias`;
    }
    case 'TAX_OVERDUE':
      return 'Taxa vencida';
    case 'DELAYED':
      return `Atrasada ${plural(daysBetween(purchase.promisedDate, today), 'dia', 'dias')}`;
    case 'STALLED':
      return purchase.lastEventAt ? `Parada há ${plural(daysBetween(purchase.lastEventAt, today), 'dia', 'dias')}` : 'Parada';
    case 'CLAIM_WINDOW_CLOSING':
      return 'Janela fecha em breve';
    case 'CLAIM_WINDOW_CLOSED':
      return 'Janela encerrada';
  }
}
