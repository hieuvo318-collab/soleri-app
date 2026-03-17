/**
 * Design System – Soleri
 * Dark mode · Lime neon accent · Border radius 36px
 * Ported from soleri_test design tokens
 */

import { Platform } from 'react-native';

// ── Primitive tokens ──────────────────────────────────────────────────────────
export const Palette = {
  bg:      '#0F1115',   // Deep charcoal – app background
  surface: '#1A1D23',   // Card / surface
  surf2:   '#22262E',   // Elevated surface (modals, sheets)
  lime:    '#D7FF5B',   // Lime neon – primary CTA & accent
  violet:  '#A78BFA',   // Violet – secondary accent
  alert:   '#FB923C',   // Orange – warning / over-budget
  text:    '#FFFFFF',   // Primary text
  muted:   '#6B7280',   // Secondary / placeholder text
  black:   '#000000',
} as const;

// ── Semantic tokens ───────────────────────────────────────────────────────────
export const Colors = {
  // Legacy Expo shape kept for useThemeColor() compatibility
  light: {
    text:           Palette.text,
    background:     Palette.bg,
    tint:           Palette.lime,
    icon:           Palette.muted,
    tabIconDefault: Palette.muted,
    tabIconSelected:Palette.lime,
  },
  dark: {
    text:           Palette.text,
    background:     Palette.bg,
    tint:           Palette.lime,
    icon:           Palette.muted,
    tabIconDefault: Palette.muted,
    tabIconSelected:Palette.lime,
  },
} as const;

// ── Spacing / Shape ───────────────────────────────────────────────────────────
export const Radius = {
  card: 36,   // Large cards, FAB
  sm:   20,   // Inputs, chips, badges
  xs:   12,   // Small elements
} as const;

// ── Typography ────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  web: {
    sans:    "'Inter', system-ui, -apple-system, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'Inter', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  ios: {
    sans:    'System',
    serif:   'Georgia',
    rounded: 'System',
    mono:    'Courier New',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
});
