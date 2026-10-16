import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActionSheet, type SheetAction } from './ActionSheet';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';
import { colors, radius } from './theme';

type SelectFieldProps<T extends string> = {
  label: string;
  icon?: IconName;
  value: T | null;
  options: readonly { value: T; label: string }[];
  placeholder?: string;
  error?: string;
  isLocked?: boolean;
  // Ação extra no fim da lista, como "Nova loja".
  extraAction?: SheetAction;
  onChange: (value: T) => void;
};

// "Campo de texto" com seta para baixo: abre a folha com as opções.
export function SelectField<T extends string>({
  label,
  icon,
  value,
  options,
  placeholder = 'Escolher',
  error,
  isLocked = false,
  extraAction,
  onChange,
}: SelectFieldProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const borderWidth = error ? 2 : 1;

  return (
    <View style={styles.container}>
      <Text variant="body14Medium">{label}</Text>
      <Pressable
        onPress={() => setIsOpen(true)}
        disabled={isLocked}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        accessibilityState={{ disabled: isLocked }}
        style={[
          styles.field,
          { borderWidth, borderColor: error ? colors.error : colors.borderInput, paddingHorizontal: 14 - borderWidth },
          isLocked && styles.locked,
        ]}>
        {icon && <Icon name={icon} size={20} />}
        <Text variant="body16" color={selected && !isLocked ? 'textStrong' : 'textMuted'} numberOfLines={1} style={styles.value}>
          {selected?.label ?? placeholder}
        </Text>
        {!isLocked && <Icon name="chevron-down" size={20} color="textStrong" />}
      </Pressable>
      {error && (
        <View style={styles.message}>
          <Icon name="alert" size={14} color="errorDark" />
          <Text variant="caption12" color="errorDark" style={styles.messageText}>
            {error}
          </Text>
        </View>
      )}
      <ActionSheet
        isVisible={isOpen}
        title={label}
        onClose={() => setIsOpen(false)}
        actions={[
          ...options.map((option) => ({
            label: option.label,
            icon: option.value === value ? ('check' as const) : undefined,
            onPress: () => onChange(option.value),
          })),
          ...(extraAction ? [extraAction] : []),
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  field: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceWhite,
  },
  locked: { backgroundColor: colors.background, borderColor: colors.borderDefault },
  value: { flex: 1 },
  message: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  messageText: { flex: 1 },
});
