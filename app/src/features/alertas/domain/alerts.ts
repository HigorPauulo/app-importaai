import { formatMoney } from '@/features/referencia/domain/currencyConverter';
import { daysBetween, formatDayMonth, formatTime, toIsoDate } from '@/shared/date';
import { plural } from '@/shared/text';

// Motivos de alerta da API (modelo-de-dominio.md, NotificationReason).
export type AlertReason = 'TAX_DETECTED' | 'TAX_DUE' | 'TAX_OVERDUE' | 'DELAYED' | 'STALLED' | 'CLAIM_WINDOW';

// O alerta e o que o app sabe hoje da compra dele. A compra pode ter sido excluída (campos nulos).
export type AlertItem = {
  id: number;
  purchaseId: string;
  reason: AlertReason;
  message: string;
  createdAt: string;
  readAt: string | null;
  productDescription: string | null;
  taxMinor: number | null;
  taxDueDate: string | null;
  taxPaidAt: string | null;
  lastEventAt: string | null;
};

export type AlertAction = 'REGISTER_TAX' | 'REGISTER_PAYMENT' | 'HOW_TO_CLAIM' | 'SEE_TRACKING';

export const ACTION_LABELS: Record<AlertAction, string> = {
  REGISTER_TAX: 'Registrar taxa',
  REGISTER_PAYMENT: 'Registrar pagamento',
  HOW_TO_CLAIM: 'Ver como reclamar',
  SEE_TRACKING: 'Ver rastreio',
};

const ACTIONS: Record<AlertReason, AlertAction> = {
  TAX_DETECTED: 'REGISTER_TAX',
  TAX_DUE: 'REGISTER_PAYMENT',
  TAX_OVERDUE: 'REGISTER_PAYMENT',
  DELAYED: 'HOW_TO_CLAIM',
  STALLED: 'SEE_TRACKING',
  CLAIM_WINDOW: 'HOW_TO_CLAIM',
};

// Título do alerta: o que aconteceu, com o produto e o número que importa. O texto que a API manda
// (message) vem embaixo, com a consequência.
export function describeAlertTitle(alert: AlertItem, today: string): string {
  // Compra excluída: o texto da API, logo abaixo, ainda diz qual era.
  if (alert.productDescription === null) return 'Compra excluída';
  const product = alert.productDescription;
  switch (alert.reason) {
    case 'TAX_DETECTED':
      return `${product} foi taxado`;
    case 'TAX_DUE': {
      if (alert.taxMinor === null || !alert.taxDueDate) return `Taxa de ${product} perto do vencimento`;
      const days = daysBetween(today, alert.taxDueDate);
      const when = days < 0 ? 'venceu' : days === 0 ? 'vence hoje' : days === 1 ? 'vence amanhã' : `vence em ${days} dias`;
      return `Taxa de ${formatMoney(alert.taxMinor)} ${when}`;
    }
    case 'TAX_OVERDUE':
      return `Taxa de ${product} venceu`;
    case 'DELAYED':
      return `${product} está atrasado`;
    case 'STALLED':
      return alert.lastEventAt
        ? `${product} parado há ${plural(daysBetween(alert.lastEventAt, today), 'dia', 'dias')}`
        : `${product} está parado`;
    case 'CLAIM_WINDOW':
      return `Janela de reclamação de ${product} fecha em breve`;
  }
}

// Ação direta do alerta. Some quando a compra já resolveu o motivo (taxa registrada ou paga),
// ou quando a compra foi excluída.
export function alertAction(alert: AlertItem): AlertAction | null {
  if (alert.productDescription === null) return null;
  if (alert.reason === 'TAX_DETECTED' && alert.taxMinor !== null) return null;
  if ((alert.reason === 'TAX_DUE' || alert.reason === 'TAX_OVERDUE') && alert.taxPaidAt) return null;
  return ACTIONS[alert.reason];
}

// "Há 10 minutos", "Hoje, 08:00", "Ontem, 08:00" ou "10/10, 08:00", no fuso do aparelho.
export function describeAlertTime(createdAt: string, now: Date): string {
  const moment = new Date(createdAt);
  const minutes = Math.floor((now.getTime() - moment.getTime()) / 60_000);
  if (minutes >= 0 && minutes < 60) return minutes <= 1 ? 'Agora' : `Há ${minutes} minutos`;
  const days = daysBetween(toIsoDate(moment), toIsoDate(now));
  if (days === 0) return `Hoje, ${formatTime(moment)}`;
  if (days === 1) return `Ontem, ${formatTime(moment)}`;
  return `${formatDayMonth(toIsoDate(moment))}, ${formatTime(moment)}`;
}

// Alertas por dia, do mais recente para o mais antigo (T08).
export function groupAlertsByDay(alerts: readonly AlertItem[], now: Date): { title: string; alerts: AlertItem[] }[] {
  const today = toIsoDate(now);
  const groups = new Map<string, AlertItem[]>();
  for (const alert of [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const day = toIsoDate(new Date(alert.createdAt));
    groups.set(day, [...(groups.get(day) ?? []), alert]);
  }
  return [...groups.entries()].map(([day, dayAlerts]) => {
    const days = daysBetween(day, today);
    return { title: days === 0 ? 'Hoje' : days === 1 ? 'Ontem' : formatDayMonth(day), alerts: dayAlerts };
  });
}
