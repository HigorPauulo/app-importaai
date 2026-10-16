import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';
import { colors, radius } from './theme';

export type SheetAction = {
  label: string;
  icon?: IconName;
  isDestructive?: boolean;
  onPress: () => void;
};

type ActionSheetProps = {
  isVisible: boolean;
  title?: string;
  message?: string;
  actions?: readonly SheetAction[];
  // Conteúdo próprio entre o título e as ações, como um campo de texto.
  children?: ReactNode;
  onClose: () => void;
};

// Folha que sobe do rodapé: o menu ⋮, as escolhas de um campo e as confirmações. Confirmação de
// ação destrutiva nomeia o item afetado no título (telas.md, "Ação destrutiva").
export function ActionSheet({ isVisible, title, message, actions = [], children, onClose }: ActionSheetProps) {
  const { height } = useWindowDimensions();

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar" accessibilityRole="button" />
        {/* Em aparelho com navegação por gestos a janela vai até a borda; o SafeAreaView afasta o conteúdo dela. */}
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          {(title || message) && (
            <View style={styles.header}>
              {title && (
                <Text variant="section18" accessibilityRole="header">
                  {title}
                </Text>
              )}
              {message && (
                <Text variant="body14" color="textMuted">
                  {message}
                </Text>
              )}
            </View>
          )}
          {children && <View style={styles.custom}>{children}</View>}
          {/* Lista longa (muitas lojas) rola sem empurrar a folha para fora da tela. */}
          <ScrollView style={{ maxHeight: height * 0.6 }} keyboardShouldPersistTaps="handled">
            {[...actions, { label: 'Cancelar', onPress: onClose }].map(({ label, icon, isDestructive, onPress }: SheetAction) => (
              <Pressable
                key={label}
                onPress={() => {
                  onClose();
                  if (onPress !== onClose) onPress();
                }}
                accessibilityRole="button"
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                {icon && <Icon name={icon} size={20} color={isDestructive ? 'errorDark' : 'textStrong'} />}
                <Text variant="body16" color={isDestructive ? 'errorDark' : 'textStrong'}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    paddingTop: 8,
    paddingBottom: 8,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    backgroundColor: colors.surfaceWhite,
  },
  header: { gap: 4, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  custom: { gap: 12, paddingHorizontal: 20, paddingBottom: 8 },
  action: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  pressed: { backgroundColor: colors.background },
});
