import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text, colors, radius, type ColorName, type IconName } from '@/shared/ui';

import { ACTION_LABELS, type AlertAction, type AlertReason } from '../domain/alerts';

// Ícone e tom de cada motivo: vermelho para o que já passou do prazo, amarelo para o que pede ação.
const reasonStyles: Record<AlertReason, { icon: IconName; background: ColorName; color: ColorName }> = {
  TAX_DETECTED: { icon: 'dollar', background: 'warningBg', color: 'warningDark' },
  TAX_DUE: { icon: 'alert', background: 'warningBg', color: 'warningDark' },
  TAX_OVERDUE: { icon: 'alert', background: 'errorBg', color: 'errorDark' },
  DELAYED: { icon: 'clock', background: 'errorBg', color: 'errorDark' },
  STALLED: { icon: 'package', background: 'warningBg', color: 'warningDark' },
  CLAIM_WINDOW: { icon: 'clock', background: 'warningBg', color: 'warningDark' },
};

type AlertRowProps = {
  reason: AlertReason;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  action: AlertAction | null;
  onPress: () => void;
};

// "Item de Alerta": não lido tem título em negrito e ponto azul, e não só cor (RF-17);
// lido fica com o ícone em cinza.
export function AlertRow({ reason, title, message, time, isRead, action, onPress }: AlertRowProps) {
  const style = reasonStyles[reason];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[isRead ? undefined : 'Não lido', title, message, time, action && ACTION_LABELS[action]].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.icon, { backgroundColor: colors[isRead ? 'borderDefault' : style.background] }]}>
        <Icon name={style.icon} size={20} color={isRead ? 'textMuted' : style.color} />
      </View>
      <View style={styles.texts}>
        <View style={styles.top}>
          <Text variant={isRead ? 'body16' : 'body16Medium'} color={isRead ? 'textMuted' : 'textStrong'} style={styles.title}>
            {title}
          </Text>
          {!isRead && <View style={styles.unreadDot} />}
        </View>
        <Text variant="caption13" color="textMuted">
          {message}
        </Text>
        <View style={styles.footer}>
          <Text variant="caption12" color="textMuted">
            {time}
          </Text>
          {action && (
            <Text variant="caption13SemiBold" color={isRead ? 'primaryDark' : 'primaryBase'}>
              {ACTION_LABELS[action]}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  pressed: { backgroundColor: colors.background },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full },
  texts: { flex: 1, gap: 4 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.primaryBase },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
});
