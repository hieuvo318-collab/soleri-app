import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Palette } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'muted' | 'lime';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default'         ? styles.default         : undefined,
        type === 'title'           ? styles.title           : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle'        ? styles.subtitle        : undefined,
        type === 'link'            ? styles.link            : undefined,
        type === 'muted'           ? styles.muted           : undefined,
        type === 'lime'            ? styles.lime            : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 15,
    lineHeight: 22,
    color: Palette.text,
  },
  defaultSemiBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: Palette.text,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    color: Palette.text,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
  },
  link: {
    fontSize: 15,
    lineHeight: 22,
    color: Palette.lime,
    textDecorationLine: 'underline',
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
    color: Palette.muted,
  },
  lime: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.lime,
  },
});
