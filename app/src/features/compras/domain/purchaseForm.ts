import { formatDayMonth } from '@/shared/date';
import { parseMoney } from '@/shared/money';

// O que a pessoa digita, como texto, antes de virar compra.
export type PurchaseDraft = {
  productDescription: string;
  storeId: string | null;
  trackingCode: string;
  currency: string;
  amount: string;
  shipping: string;
  purchaseDate: string;
  promisedDate: string;
  hasTax: boolean;
  taxAmount: string;
  taxDueDate: string;
};

export type PurchaseValues = {
  productDescription: string;
  storeId: string;
  trackingCode: string;
  currency: string;
  amountMinor: number;
  shippingMinor: number;
  purchaseDate: string;
  promisedDate: string;
  taxMinor: number | null;
  taxDueDate: string | null;
};

export type PurchaseDraftErrors = Partial<Record<keyof PurchaseDraft, string>>;

// Campos que a RN09 trava depois que a compra se conclui.
export const PROTECTED_FIELDS: readonly (keyof PurchaseDraft)[] = [
  'storeId',
  'trackingCode',
  'currency',
  'amount',
  'shipping',
  'purchaseDate',
  'promisedDate',
];

// Data digitada com máscara: "02102026" vira "02/10/2026" enquanto a pessoa digita.
export function maskDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

// "02/10/2026" vira "2026-10-02"; data que não existe no calendário (31/02) é recusada.
export function parseDateInput(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCDate() !== Number(day) || date.getUTCMonth() !== Number(month) - 1) return null;
  return `${year}-${month}-${day}`;
}

export function formatDateInput(iso: string): string {
  return `${formatDayMonth(iso)}/${iso.slice(0, 4)}`;
}

// Formato do TrackingCode do modelo de domínio: maiúsculas, sem espaços, 8 a 40 letras e números.
export function normalizeTrackingCode(text: string): string {
  return text.replace(/\s/g, '').toUpperCase();
}

const TRACKING_CODE = /^[A-Z0-9]{8,40}$/;

// Validação do formulário (RF-08): cada erro no seu campo, nada gravado enquanto houver um (CT-16).
// `receivedAt`: recebimento já confirmado; a compra não pode passar a ser depois dele.
export function validatePurchaseDraft(
  draft: PurchaseDraft,
  minorUnits: number,
  today: string,
  receivedAt: string | null = null,
): { errors: PurchaseDraftErrors; values: PurchaseValues | null } {
  const errors: PurchaseDraftErrors = {};
  const trackingCode = normalizeTrackingCode(draft.trackingCode);
  const amountMinor = parseMoney(draft.amount, minorUnits);
  const shippingMinor = draft.shipping.trim() ? parseMoney(draft.shipping, minorUnits) : 0;
  const purchaseDate = parseDateInput(draft.purchaseDate);
  const promisedDate = parseDateInput(draft.promisedDate);
  const taxMinor = draft.hasTax ? parseMoney(draft.taxAmount, 2) : null;
  const taxDueDate = draft.hasTax && draft.taxDueDate.trim() ? parseDateInput(draft.taxDueDate) : null;

  if (!draft.productDescription.trim()) errors.productDescription = 'Descreva o produto.';
  if (!draft.storeId) errors.storeId = 'Escolha a loja.';
  if (!TRACKING_CODE.test(trackingCode)) errors.trackingCode = 'Use de 8 a 40 letras e números, como LP00123456789CN.';
  if (amountMinor === null || amountMinor <= 0) errors.amount = 'Informe um valor maior que zero.';
  if (shippingMinor === null) errors.shipping = 'Informe o frete, ou 0,00 se foi grátis.';
  if (!purchaseDate) errors.purchaseDate = 'Use o formato dd/mm/aaaa.';
  else if (purchaseDate > today) errors.purchaseDate = 'A compra não pode ser no futuro.';
  else if (receivedAt && purchaseDate > receivedAt) errors.purchaseDate = `A compra não pode ser depois do recebimento, em ${formatDayMonth(receivedAt)}.`;
  if (!promisedDate) errors.promisedDate = 'Use o formato dd/mm/aaaa.';
  else if (purchaseDate && promisedDate < purchaseDate) errors.promisedDate = 'O prazo não pode ser antes da compra.';
  if (draft.hasTax) {
    if (taxMinor === null || taxMinor <= 0) errors.taxAmount = 'Informe o valor da taxa.';
    if (draft.taxDueDate.trim() && !taxDueDate) errors.taxDueDate = 'Use o formato dd/mm/aaaa.';
  }

  if (Object.keys(errors).length > 0) return { errors, values: null };
  return {
    errors,
    values: {
      productDescription: draft.productDescription.trim(),
      storeId: draft.storeId as string,
      trackingCode,
      currency: draft.currency,
      amountMinor: amountMinor as number,
      shippingMinor: shippingMinor as number,
      purchaseDate: purchaseDate as string,
      promisedDate: promisedDate as string,
      taxMinor,
      taxDueDate,
    },
  };
}
