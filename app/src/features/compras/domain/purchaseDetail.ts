import { convertToBrl, formatMoney, type ExchangeRate } from '@/features/referencia/domain/currencyConverter';
import { daysBetween, formatDayMonth } from '@/shared/date';

import { describeDeadline as describeConclusion, isConcluded, type PurchaseListItem } from './purchaseList';

export type PurchaseDetail = PurchaseListItem & {
  taxMinor: number | null;
  taxPaidAt: string | null;
  notes: string | null;
};

export type TrackingEvent = { id: number; occurredAt: string; description: string; location: string | null };

export type TaxAction = {
  tone: 'warning' | 'error';
  title: string;
  message: string;
  action: 'REGISTER_TAX' | 'REGISTER_PAYMENT';
};

const CONSEQUENCE = 'Sem pagamento, a encomenda volta ao remetente.';

function describeDaysLeft(days: number): string {
  if (days <= 0) return 'vence hoje';
  return days === 1 ? 'falta 1 dia' : `faltam ${days} dias`;
}

// Card de ação no topo da T04: aparece só quando a taxa pede algo (RN04), com prazo, valor e consequência.
export function describeTaxAction(purchase: PurchaseDetail, today: string): TaxAction | null {
  const amount = purchase.taxMinor === null ? null : formatMoney(purchase.taxMinor);

  if (purchase.flags.includes('TAX_OVERDUE') && purchase.taxDueDate && amount) {
    return {
      tone: 'error',
      title: `Taxa vencida em ${formatDayMonth(purchase.taxDueDate)}`,
      message: `${amount}. ${CONSEQUENCE}`,
      action: 'REGISTER_PAYMENT',
    };
  }
  if (purchase.flags.includes('TAX_PENDING') && purchase.taxDueDate && amount) {
    return {
      tone: 'warning',
      title: `Pague a taxa até ${formatDayMonth(purchase.taxDueDate)}`,
      message: `${amount} · ${describeDaysLeft(daysBetween(today, purchase.taxDueDate))}. ${CONSEQUENCE}`,
      action: 'REGISTER_PAYMENT',
    };
  }
  if (purchase.flags.includes('TAX_TO_REGISTER')) {
    return {
      tone: 'warning',
      title: 'Registre a taxa cobrada',
      message: 'A encomenda aguarda pagamento de taxa. Informe o valor e o vencimento do aviso para receber os lembretes.',
      action: 'REGISTER_TAX',
    };
  }
  return null;
}

// Card de prazo: quanto falta (ou quanto atrasou) e a situação da janela de reclamação (RN02, RN05).
export function describePromise(purchase: PurchaseDetail, today: string): { title: string; caption: string } {
  const title = `Prazo prometido: ${formatDayMonth(purchase.promisedDate)}`;
  if (isConcluded(purchase.status)) return { title, caption: describeConclusion(purchase).replace(/^./, (first) => first.toUpperCase()) };

  const days = daysBetween(today, purchase.promisedDate);
  const remaining =
    days > 1 ? `Faltam ${days} dias` : days === 1 ? 'Falta 1 dia' : days === 0 ? 'Vence hoje' : `Atrasada ${-days} ${days === -1 ? 'dia' : 'dias'}`;
  const window = purchase.flags.includes('CLAIM_WINDOW_CLOSED')
    ? ' · janela de reclamação encerrada'
    : purchase.flags.includes('CLAIM_WINDOW_CLOSING')
      ? ' · janela de reclamação fecha em breve'
      : '';
  return { title, caption: remaining + window };
}

export type CostLineData = { label: string; caption?: string; value: string };

export type CostBreakdown = { lines: CostLineData[]; total: string | null };

// "5.3500" vira "5,35" e "0.7356" fica "0,7356": sem zeros à direita, com pelo menos duas casas.
const formatRate = (rate: string) => rate.replace(/(\.\d\d\d*?)0+$/, '$1').replace('.', ',');

// Valores da T04: o pago na origem, em reais pela cotação da compra (RN07), a taxa e o total.
// O total soma as parcelas exibidas, como na RN10: o que se lê nas linhas fecha com ele.
export function describeCosts(purchase: PurchaseDetail, rates: readonly ExchangeRate[]): CostBreakdown {
  const paidMinor = purchase.amountMinor + purchase.shippingMinor;
  const lines: CostLineData[] = [
    {
      label: 'Pago na loja',
      caption: purchase.shippingMinor > 0 ? `inclui frete de ${formatMoney(purchase.shippingMinor, purchase.currency, purchase.minorUnits)}` : undefined,
      value: formatMoney(paidMinor, purchase.currency, purchase.minorUnits),
    },
  ];

  let totalMinor: number | null = paidMinor;
  if (purchase.currency !== 'BRL') {
    const conversion = convertToBrl(paidMinor, purchase.minorUnits, purchase.currency, purchase.purchaseDate, rates);
    if (conversion.kind === 'converted') {
      const { rate } = conversion;
      lines.push({
        label: 'Em reais',
        caption: `cotação ${conversion.isApproximate ? 'aproximada ' : ''}de ${formatDayMonth(rate.rateDate)} · 1 ${purchase.currency} = R$ ${formatRate(rate.rate)}`,
        value: formatMoney(conversion.brlMinor),
      });
      totalMinor = conversion.brlMinor;
    } else {
      lines.push({ label: 'Em reais', caption: `sem cotação de ${purchase.currency} para ${formatDayMonth(purchase.purchaseDate)}`, value: 'indisponível' });
      totalMinor = null;
    }
  }

  if (purchase.taxMinor !== null) {
    const caption = purchase.taxPaidAt
      ? `paga em ${formatDayMonth(purchase.taxPaidAt)}`
      : purchase.flags.includes('TAX_OVERDUE')
        ? 'vencida'
        : 'pendente';
    lines.push({ label: 'Taxa de importação', caption, value: formatMoney(purchase.taxMinor) });
    if (totalMinor !== null) totalMinor += purchase.taxMinor;
  }

  return { lines, total: totalMinor === null ? null : formatMoney(totalMinor) };
}
