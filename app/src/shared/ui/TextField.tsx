import { useState, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';
import { colors, radius, typography } from './theme';

type TextFieldProps = TextInputProps & {
  ref?: Ref<TextInput>;
  label: string;
  icon?: IconName;
  action?: ReactNode;
  hint?: string;
  error?: string;
  // Erro que oferece uma saída (ex.: e-mail já cadastrado leva a entrar com ele).
  onErrorPress?: () => void;
};

// Estados do "Campo de texto" do Figma: vazio e preenchido mudam só a cor do valor;
// foco e erro engrossam a borda para 2 e trocam a cor.
export function TextField({ label, icon, action, hint, error, onErrorPress, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderWidth = isFocused || error ? 2 : 1;
  const borderColor = error ? colors.error : isFocused ? colors.primaryBase : colors.borderInput;
  const isLocked = rest.editable === false;
  const message = error ?? hint;

  return (
    <View style={styles.container}>
      <Text variant="body14Medium">{label}</Text>
      {/* No Figma a borda é interna e não empurra o conteúdo; aqui ela ocupa espaço, então o recuo compensa. */}
      <View
        style={[
          styles.field,
          { borderWidth, borderColor, paddingHorizontal: 14 - borderWidth },
          isLocked && styles.locked,
        ]}>
        {icon && <Icon name={icon} size={20} color={isFocused && !error ? 'primaryBase' : 'textMuted'} />}
        <TextInput
          {...rest}
          accessibilityLabel={label}
          accessibilityHint={message}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, isLocked && styles.lockedInput]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />
        {action}
      </View>
      {message && (
        <Pressable
          disabled={!onErrorPress}
          onPress={onErrorPress}
          accessibilityRole={onErrorPress ? 'link' : undefined}
          hitSlop={{ top: 16, bottom: 16 }}
          style={styles.message}>
          {error && <Icon name="alert" size={14} color="errorDark" />}
          <Text variant="caption12" color={error ? 'errorDark' : 'textMuted'} style={styles.messageText}>
            {message}
          </Text>
        </Pressable>
      )}
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
  input: { ...typography.body16, flex: 1, color: colors.textStrong, padding: 0 },
  // Campo travado (RN09): fundo cinza e texto apagado, para não parecer editável.
  locked: { backgroundColor: colors.background, borderColor: colors.borderDefault },
  lockedInput: { color: colors.textMuted },
  message: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  messageText: { flex: 1 },
});
