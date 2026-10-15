import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from './Button';
import { EmptyState, type EmptyStateProps } from './EmptyState';
import { OfflineBanner } from './OfflineBanner';
import { colors, radius } from './theme';

export type ScreenStatus = 'loading' | 'empty' | 'error' | 'content';

type ScreenProps = {
  header: ReactNode;
  status: ScreenStatus;
  empty: EmptyStateProps;
  onRetry?: () => void;
  offlineSince?: string;
  children?: ReactNode;
};

// Moldura de toda tela: os quatro estados obrigatórios moram aqui, e não em cada tela.
export function Screen({ header, status, empty, onRetry, offlineSince, children }: ScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {header}
      {offlineSince && <OfflineBanner lastSyncLabel={offlineSince} />}
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {status === 'loading' && <Skeleton />}
        {status === 'empty' && <EmptyState {...empty} />}
        {status === 'error' && (
          <EmptyState
            icon="alert"
            title="Não foi possível carregar"
            description="Os dados salvos no aparelho continuam aqui. Tente de novo em instantes."
            action={onRetry && <Button label="Tentar de novo" variant="secondary" onPress={onRetry} style={styles.retry} />}
          />
        )}
        {status === 'content' && children}
      </ScrollView>
    </SafeAreaView>
  );
}

// Esqueleto com a forma de uma lista de cards, para o layout não pular quando o conteúdo chega.
function Skeleton() {
  return (
    <View accessibilityLabel="Carregando" accessibilityRole="progressbar" style={styles.skeleton}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={styles.skeletonCard} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceWhite },
  body: { backgroundColor: colors.background },
  content: { flexGrow: 1, gap: 12, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 },
  retry: { alignSelf: 'stretch' },
  skeleton: { gap: 12 },
  skeletonCard: { height: 142, borderRadius: radius.card, backgroundColor: colors.borderDefault },
});
