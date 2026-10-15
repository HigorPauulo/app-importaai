import { Stack } from 'expo-router';

// Pilha dentro da aba: o detalhe e o formulário abrem sobre a lista sem esconder as abas (T04).
export default function PurchasesStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
