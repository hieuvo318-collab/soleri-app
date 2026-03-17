/**
 * Presentation-layer theme – Soleri
 * Single source of truth cho toàn bộ StyleSheet trong src/presentation/
 * Đồng bộ với constants/theme.ts (Lime neon · Dark mode · Radius 36px)
 */

// ── Colors ────────────────────────────────────────────────────────────────────
export const Colors = {
  // Backgrounds
  bg:      '#0F1115',
  surface: '#1A1D23',
  surf2:   '#22262E',

  // Accents
  lime:    '#D7FF5B',   // primary CTA, highlights
  violet:  '#A78BFA',   // secondary / calorie bar
  alert:   '#FB923C',   // warning / over-budget

  // Text
  text:    '#FFFFFF',
  muted:   '#6B7280',
  onLime:  '#0F1115',   // text placed ON a lime button (dark for contrast)

  // Legacy aliases (giữ để không break import cũ)
  backgroundDark:  '#0F1115',
  surfaceDark:     '#1A1D23',
  primaryGold:     '#D7FF5B',   // remapped → lime
  textLight:       '#FFFFFF',
  trackDark:       '#22262E',
  backgroundLight: '#0F1115',
  surfaceLight:    '#1A1D23',
  textDark:        '#FFFFFF',
  mutedGray:       '#6B7280',
  successGreen:    '#D7FF5B',   // remapped → lime
  trackLight:      '#22262E',
  alertRed:        '#FB923C',   // remapped → alert orange
} as const;

// ── Shape ─────────────────────────────────────────────────────────────────────
export const Radius = {
  card: 36,
  sm:   20,
  xs:   12,
} as const;

// ── Spacing scale ─────────────────────────────────────────────────────────────
export const Space = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

// ── Typography scale ──────────────────────────────────────────────────────────
export const FontSize = {
  xs:    11,
  sm:    13,
  base:  15,
  md:    17,
  lg:    20,
  xl:    24,
  xxl:   32,
  hero:  40,
} as const;
