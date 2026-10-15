import type { Href } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';
import { colors } from './theme';

export type Tab = {
  name: string;
  href: Href;
  label: string;
  icon: IconName;
};

type TabItemProps = TabTriggerSlotProps & Pick<Tab, 'label' | 'icon'>;

// "Item de Aba" do Figma: ativa em azul e negrito, inativa em cinza e regular.
function TabItem({ label, icon, isFocused, ...rest }: TabItemProps) {
  return (
    <Pressable {...rest} accessibilityRole="tab" accessibilityLabel={label} style={styles.item}>
      <Icon name={icon} color={isFocused ? 'primaryBase' : 'textMuted'} />
      <Text variant={isFocused ? 'caption12Bold' : 'caption12'} color={isFocused ? 'primaryBase' : 'textMuted'}>
        {label}
      </Text>
    </Pressable>
  );
}

// Layout de abas inteiro: cada perfil só declara a lista das suas abas.
// O asChild do Expo Router recusa estilo em array, daí o flatten.
export function TabBar({ tabs }: { tabs: readonly Tab[] }) {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <View style={StyleSheet.flatten([styles.bar, { height: 72 + bottom, paddingBottom: bottom }])}>
          {tabs.map(({ name, href, label, icon }) => (
            <TabTrigger key={name} name={name} href={href} asChild>
              <TabItem label={label} icon={icon} />
            </TabTrigger>
          ))}
        </View>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    // Itens de 64 de altura a 4 do topo, como no Figma: aqui a borda de 1 conta nesses 4.
    paddingTop: 3,
    backgroundColor: colors.surfaceWhite,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  item: { flex: 1, height: 64, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
