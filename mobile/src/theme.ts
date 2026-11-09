/**
 * LawLink mobile design tokens — white, black & gold.
 * White-first editorial look: clean white canvases, black type and
 * primary actions, light oversized Geist headings, small uppercase
 * meta labels and a single antique-gold accent (deep enough to read
 * on white) with a pale champagne tint for soft fills.
 */
export const colors = {
  bg: '#FFFFFF',
  surface: '#FBFAF7', // cards: a whisper of warmth on the white canvas
  surface2: '#F5F3EE',
  surface3: '#ECE9E2',
  border: '#E8E4DA',
  borderStrong: '#CFC8B8',

  white: '#FFFFFF',
  paper: '#F7F3EA', // warm champagne-white for highlight panels
  onWhite: '#0A0A0A',
  onWhiteMuted: '#5C5C5C',
  whiteBorder: '#E6DFCF',

  text: '#0A0A0A',
  textMuted: '#5C5C5C',
  textDim: '#767676',

  gold: '#A67C2E', // antique gold: icons/accents on white, fills under black text
  goldText: '#8A6A2B', // deeper gold for display numbers and prices
  goldLight: '#F3E7C9', // champagne
  goldDim: 'rgba(166,124,46,0.10)',
  goldBorder: 'rgba(166,124,46,0.35)',
  onGold: '#0A0A0A',

  success: '#2E7D4F',
  successDim: 'rgba(46,125,79,0.10)',
  successBorder: 'rgba(46,125,79,0.35)',
  warning: '#A86400',
  warningDim: 'rgba(168,100,0,0.10)',
  danger: '#C62828',
  dangerDim: 'rgba(198,40,40,0.08)',
  dangerBorder: 'rgba(198,40,40,0.35)',
  info: '#4A5D78', // slate
  infoDim: 'rgba(74,93,120,0.10)',
  neutral: '#6B6B6B',
  neutralDim: 'rgba(107,107,107,0.10)',

  overlay: 'rgba(10,10,10,0.45)',
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
