import { StyleSheet, View } from 'react-native';

import { Icon, Text, colors, type ColorName } from '@/shared/ui';

import { PASSWORD_REQUIREMENTS, measurePasswordStrength } from '../domain/signUp';

// Cor do nível: barra no tom base e rótulo no tom escuro, para o texto passar no contraste AA.
const levelColors: Record<number, { bar: ColorName; label: ColorName }> = {
  1: { bar: 'error', label: 'errorDark' },
  2: { bar: 'warning', label: 'warningDark' },
  3: { bar: 'success', label: 'successDark' },
  4: { bar: 'success', label: 'successDark' },
};

// Medidor de força e requisitos marcados enquanto a pessoa digita (T02, RF-01).
export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = measurePasswordStrength(password);
  const color = levelColors[strength.level];

  return (
    <View style={styles.container}>
      <View style={styles.strength} accessible accessibilityLabel={strength.label && `Força da senha: ${strength.label}`}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[styles.bar, { backgroundColor: color && level <= strength.level ? colors[color.bar] : colors.borderDefault }]}
          />
        ))}
        {color && (
          <Text variant="caption12Bold" color={color.label}>
            {strength.label}
          </Text>
        )}
      </View>
      <View style={styles.requirements}>
        {PASSWORD_REQUIREMENTS.map(({ label, isMet }) => {
          const met = isMet(password);
          return (
            <View
              key={label}
              style={styles.requirement}
              accessible
              accessibilityLabel={`${label}: ${met ? 'cumprido' : 'pendente'}`}>
              <Icon name="check" size={14} color={met ? 'successDark' : 'textMuted'} />
              <Text variant="caption12" color={met ? 'successDark' : 'textMuted'}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  strength: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 16 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  requirements: { flexDirection: 'row', gap: 16 },
  requirement: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
