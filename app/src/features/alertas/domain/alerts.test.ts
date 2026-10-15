import { alertAction, describeAlertTime, describeAlertTitle, groupAlertsByDay, type AlertItem } from './alerts';

const today = '2026-10-12';

const alert = (overrides: Partial<AlertItem>): AlertItem => ({
  id: 1,
  purchaseId: 'fone',
  reason: 'TAX_DUE',
  message: 'Fone Bluetooth QCY T13 · pague até 15/10 para evitar a devolução.',
  createdAt: '2026-10-12T09:00:00',
  readAt: null,
  productDescription: 'Fone Bluetooth QCY T13',
  taxMinor: 4890,
  taxDueDate: '2026-10-15',
  taxPaidAt: null,
  lastEventAt: null,
  ...overrides,
});

describe('describeAlertTitle', () => {
  it('títulos do protótipo (T08)', () => {
    expect(describeAlertTitle(alert({}), today)).toBe('Taxa de R$ 48,90 vence em 3 dias');
    expect(describeAlertTitle(alert({ reason: 'DELAYED', productDescription: 'Teclado Redragon K552' }), today)).toBe(
      'Teclado Redragon K552 está atrasado',
    );
    expect(
      describeAlertTitle(alert({ reason: 'STALLED', productDescription: 'Teclado Redragon K552', lastEventAt: '2026-09-26T10:00:00Z' }), today),
    ).toBe('Teclado Redragon K552 parado há 16 dias');
    expect(describeAlertTitle(alert({ reason: 'TAX_DETECTED' }), today)).toBe('Fone Bluetooth QCY T13 foi taxado');
  });

  it('compra excluída não quebra o título', () => {
    expect(describeAlertTitle(alert({ reason: 'DELAYED', productDescription: null }), today)).toBe('Compra excluída');
  });
});

describe('alertAction', () => {
  it('ação direta por motivo', () => {
    expect(alertAction(alert({}))).toBe('REGISTER_PAYMENT');
    expect(alertAction(alert({ reason: 'STALLED' }))).toBe('SEE_TRACKING');
    expect(alertAction(alert({ reason: 'DELAYED' }))).toBe('HOW_TO_CLAIM');
  });

  it('some quando a compra já resolveu o motivo', () => {
    expect(alertAction(alert({ reason: 'TAX_DETECTED' }))).toBeNull();
    expect(alertAction(alert({ taxPaidAt: '2026-10-13' }))).toBeNull();
    expect(alertAction(alert({ productDescription: null }))).toBeNull();
  });
});

describe('tempo e dias', () => {
  const now = new Date('2026-10-12T09:10:00');

  it('descreve quando o alerta chegou', () => {
    expect(describeAlertTime('2026-10-12T09:00:00', now)).toBe('Há 10 minutos');
    expect(describeAlertTime('2026-10-12T08:00:00', now)).toBe('Hoje, 08:00');
    expect(describeAlertTime('2026-10-11T08:00:00', now)).toBe('Ontem, 08:00');
    expect(describeAlertTime('2026-10-08T08:00:00', now)).toBe('08/10, 08:00');
  });

  it('agrupa por dia, mais recente primeiro', () => {
    const groups = groupAlertsByDay(
      [alert({ id: 1, createdAt: '2026-10-11T08:00:00' }), alert({ id: 2, createdAt: '2026-10-12T08:00:00' })],
      now,
    );
    expect(groups.map((group) => [group.title, group.alerts.map((item) => item.id)])).toEqual([
      ['Hoje', [2]],
      ['Ontem', [1]],
    ]);
  });
});
