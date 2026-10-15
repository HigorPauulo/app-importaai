import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { migrateDatabase } from '@/shared/db/migrate';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isFontLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const isReady = isFontLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <SQLiteProvider databaseName="importa-ai.db" onInit={migrateDatabase}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SQLiteProvider>
  );
}
