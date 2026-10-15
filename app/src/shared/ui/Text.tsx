import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

import { colors, typography, type ColorName, type TypographyName } from './theme';

export type TextProps = NativeTextProps & {
  variant?: TypographyName;
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body16', color = 'textStrong', align, style, ...rest }: TextProps) {
  return <NativeText {...rest} style={[typography[variant], { color: colors[color], textAlign: align }, style]} />;
}
