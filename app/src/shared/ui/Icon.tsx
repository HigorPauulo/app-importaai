import Svg, { Path } from 'react-native-svg';

import { icons, type IconName } from './icons';
import { colors, type ColorName } from './theme';

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorName;
};

// Decorativo por padrão: quem dá nome à ação é o botão que contém o ícone.
export function Icon({ name, size = 24, color = 'textMuted' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessible={false}>
      {icons[name].map((d) => (
        <Path key={d} d={d} stroke={colors[color]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}
