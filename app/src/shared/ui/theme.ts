// Tokens da coleção "Importa Aí · Tokens" do Figma, com os mesmos nomes em camelCase.
// Mudou no Figma, muda aqui: nenhum componente usa cor ou medida solta.

export const colors = {
  primaryBase: '#0D6EFD',
  primaryDark: '#0A3B8C',
  primaryLight: '#CFE2FF',
  secondary: '#6C757D',
  background: '#F3F4F6',
  surfaceWhite: '#FFFFFF',
  textStrong: '#1A1A1A',
  textMuted: '#4B5563',
  borderDefault: '#E5E7EB',
  borderInput: '#8A94A3',
  success: '#22C55E',
  successBg: '#D1FAE5',
  successDark: '#065F46',
  warning: '#F59E42',
  warningBg: '#FEF3C7',
  warningDark: '#92400E',
  error: '#DC2626',
  errorBg: '#FFE6E6',
  errorDark: '#991B1B',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 5, md: 8, card: 12, full: 999 } as const;

export type ColorName = keyof typeof colors;

// Os pesos do Inter carregados em src/app/_layout.tsx.
const inter = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

const style = (fontFamily: string, fontSize: number, lineHeight: number) => ({ fontFamily, fontSize, lineHeight });

// Estilos de texto do Figma: "Body/16 Medium" vira body16Medium.
export const typography = {
  display34: style(inter.bold, 34, 42),
  title28: style(inter.bold, 28, 36),
  title24: style(inter.bold, 24, 32),
  section20: style(inter.semiBold, 20, 28),
  section18: style(inter.semiBold, 18, 26),
  body16: style(inter.regular, 16, 24),
  body16Medium: style(inter.medium, 16, 24),
  body15: style(inter.regular, 15, 22),
  body14: style(inter.regular, 14, 20),
  body14Medium: style(inter.medium, 14, 20),
  caption13: style(inter.regular, 13, 18),
  caption13SemiBold: style(inter.semiBold, 13, 18),
  caption12: style(inter.regular, 12, 16),
  caption12Bold: style(inter.bold, 12, 16),
  caption11Bold: style(inter.bold, 11, 14),
} as const;

export type TypographyName = keyof typeof typography;

export const shadows = {
  sm: { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)' },
  md: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.10)' },
} as const;
