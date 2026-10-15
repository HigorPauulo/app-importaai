import { Redirect } from 'expo-router';

// Até a sessão existir (US-02), o app abre direto nas abas do comprador.
export default function Index() {
  return <Redirect href="/compras" />;
}
