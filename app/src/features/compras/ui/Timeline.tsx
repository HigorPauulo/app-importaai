import { StyleSheet, View } from 'react-native';

import { formatEventTime } from '@/shared/date';
import { Text, colors, radius } from '@/shared/ui';

import type { TrackingEvent } from '../domain/purchaseDetail';

type TimelineProps = { events: readonly TrackingEvent[]; today: string };

// "Item de Linha do Tempo": o evento mais recente é a etapa atual (ponto azul maior);
// os anteriores ficam como concluídos (ponto verde).
export function Timeline({ events, today }: TimelineProps) {
  if (events.length === 0) {
    return (
      <Text variant="body14" color="textMuted">
        Aguardando a primeira movimentação.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {events.map((event, index) => {
        const isCurrent = index === 0;
        return (
          <View key={event.id} style={styles.item} accessible>
            <View style={styles.dotColumn}>
              <View style={isCurrent ? styles.currentDot : styles.pastDot} />
            </View>
            <View style={styles.texts}>
              <Text variant="caption12Bold" color="primaryDark">
                {formatEventTime(event.occurredAt, today)}
              </Text>
              <Text variant="body14">{event.description}</Text>
              {event.location && (
                <Text variant="caption12" color="secondary">
                  {event.location}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
  dotColumn: { width: 16, alignItems: 'center', paddingTop: 1 },
  currentDot: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.surfaceWhite,
    backgroundColor: colors.primaryBase,
  },
  pastDot: { width: 13, height: 13, borderRadius: radius.full, backgroundColor: colors.success },
  texts: { flex: 1, gap: 2 },
});
