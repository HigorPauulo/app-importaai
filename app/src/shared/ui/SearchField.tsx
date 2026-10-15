import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from './Icon';
import { colors, radius, typography } from './theme';

type SearchFieldProps = Omit<TextInputProps, 'style'> & { placeholder: string };

// Campo "busca" das listas (T03, T10). Mesma regra de borda do campo de texto: 2 no foco.
export function SearchField({ placeholder, onFocus, onBlur, ...rest }: SearchFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderWidth = isFocused ? 2 : 1;

  return (
    <View
      style={[
        styles.container,
        { borderWidth, borderColor: isFocused ? colors.primaryBase : colors.borderInput, paddingLeft: 14 - borderWidth },
      ]}>
      <Icon name="search" size={20} color={isFocused ? 'primaryBase' : 'textMuted'} />
      <TextInput
        {...rest}
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceWhite,
  },
  input: { ...typography.body16, flex: 1, color: colors.textStrong, padding: 0 },
});
