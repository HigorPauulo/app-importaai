import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { countUnreadAlerts } from '../data/alertRepository';

// Ponto vermelho do sino no cabeçalho das abas: recontado a cada vez que a aba ganha foco.
export function useHasUnreadAlerts(): boolean {
  const db = useSQLiteContext();
  const [hasUnread, setHasUnread] = useState(false);

  useFocusEffect(
    useCallback(() => {
      countUnreadAlerts(db)
        .then((count) => setHasUnread(count > 0))
        .catch(() => setHasUnread(false));
    }, [db]),
  );

  return hasUnread;
}
