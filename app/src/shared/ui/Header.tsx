import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { Text } from './Text';
import { colors, radius } from './theme';

type HeaderProps = {
  title: string;
  subtitle?: string;
  initials?: string;
  hasUnreadAlerts?: boolean;
  onAlertsPress?: () => void;
  onAvatarPress?: () => void;
};

// Cabeçalho das telas de aba (componente "Header" do Figma).
export function Header({ title, subtitle, initials, hasUnreadAlerts, onAlertsPress, onAvatarPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Text variant="title24" accessibilityRole="header">
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption13" color="textMuted">
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        {onAlertsPress && (
          <Pressable
            onPress={onAlertsPress}
            accessibilityRole="button"
            accessibilityLabel={hasUnreadAlerts ? 'Alertas, há não lidos' : 'Alertas'}
            style={styles.alerts}>
            <Icon name="bell" size={22} color="textStrong" />
            {hasUnreadAlerts && <View style={styles.unreadDot} />}
          </Pressable>
        )}
        {initials && (
          <Pressable onPress={onAvatarPress} accessibilityRole="button" accessibilityLabel="Perfil" style={styles.avatar}>
            <Text variant="caption13SemiBold" color="primaryDark">
              {initials}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.surfaceWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  texts: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alerts: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceWhite,
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    left: 27,
    width: 10,
    height: 10,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.surfaceWhite,
    backgroundColor: colors.error,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
});
