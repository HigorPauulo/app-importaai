import { router } from 'expo-router';

import { StoresScreen } from '@/features/compras/ui/StoresScreen';

export default function StoresRoute() {
  return (
    <StoresScreen
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/compras'))}
      onShowPurchases={(storeName) => router.navigate({ pathname: '/compras', params: { busca: storeName } })}
    />
  );
}
