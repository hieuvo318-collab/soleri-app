import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Palette, Radius } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  /** 'screen' = app bg (#0F1115) | 'card' = surface (#1A1D23) | 'elevated' = surf2 (#22262E) */
  variant?: 'screen' | 'card' | 'elevated';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant,
  ...otherProps
}: ThemedViewProps) {
  const themeBackground = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const variantStyle =
    variant === 'card'
      ? { backgroundColor: Palette.surface, borderRadius: Radius.card }
      : variant === 'elevated'
      ? { backgroundColor: Palette.surf2, borderRadius: Radius.card }
      : variant === 'screen'
      ? { backgroundColor: Palette.bg }
      : { backgroundColor: themeBackground };

  return <View style={[variantStyle, style]} {...otherProps} />;
}
