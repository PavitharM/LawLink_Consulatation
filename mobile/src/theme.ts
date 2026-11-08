/**
 * LawLink mobile design tokens — black, white & gold.
 * Inspired by the editorial brand-guideline look: deep black canvases,
 * light oversized Geist headings, small uppercase meta labels and a
 * single warm gold accent (with a pale champagne tint for soft fills).
 */
export const colors = {
  bg: '#000000',
  surface: '#0E0E0E',
  surface2: '#161616',
  surface3: '#1F1F1F',
  border: '#262626',
  borderStrong: '#3A3A3A',

  text: '#FFFFFF',
  textMuted: '#A1A1A1',
  textDim: '#6B6B6B',

  gold: '#D4AF6A',
  goldLight: '#F3DFB5', // champagne
  goldDim: 'rgba(212,175,106,0.14)',
  goldBorder: 'rgba(212,175,106,0.35)',
  onGold: '#0A0A0A',

  success: '#7FC48A',
  successDim: 'rgba(127,196,138,0.12)',
  warning: '#E9B44C',
  warningDim: 'rgba(233,180,76,0.12)',
  danger: '#F06A6A',
  dangerDim: 'rgba(240,106,106,0.12)',
  info: '#9DB0C8', // slate blue
  infoDim: 'rgba(157,176,200,0.12)',
  neutral: '#A1A1A1',
  neutralDim: 'rgba(161,161,161,0.12)',

  overlay: 'rgba(0,0,0,0.75)',
};

export const fonts = {
  light: 'Geist_300Light',
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export type Tone = 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const toneColors: Record<Tone, { fg: string; bg: string }> = {
  gold: { fg: colors.gold, bg: colors.goldDim },
  success: { fg: colors.success, bg: colors.successDim },
  warning: { fg: colors.warning, bg: colors.warningDim },
  danger: { fg: colors.danger, bg: colors.dangerDim },
  info: { fg: colors.info, bg: colors.infoDim },
  neutral: { fg: colors.neutral, bg: colors.neutralDim },
};

export const type = {
  display: { fontFamily: fonts.light, fontSize: 40, lineHeight: 44, letterSpacing: -1.2, color: colors.text },
  h1: { fontFamily: fonts.light, fontSize: 32, lineHeight: 37, letterSpacing: -0.9, color: colors.text },
  h2: { fontFamily: fonts.regular, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, color: colors.text },
  h3: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 23, letterSpacing: -0.2, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  bodySm: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted },
  label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.text },
  meta: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 15, letterSpacing: 0.6, color: colors.textDim },
};
