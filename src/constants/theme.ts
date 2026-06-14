export const colors = {
  bg:          '#0f0f13',
  surface:     '#18181f',
  surface2:    '#21212b',
  border:      'rgba(255,255,255,0.08)',
  border2:     'rgba(255,255,255,0.14)',
  text:        '#f0eeff',
  muted:       '#8b8aa0',
  accent:      '#7c6cf5',
  accentGlow:  'rgba(124,108,245,0.25)',
  accent2:     '#b06cf5',

  red:         '#f5534a',
  redBg:       'rgba(245,83,74,0.12)',
  redBorder:   'rgba(245,83,74,0.2)',

  yellow:      '#f5c23a',
  yellowBg:    'rgba(245,194,58,0.12)',
  yellowBorder:'rgba(245,194,58,0.2)',

  green:       '#4af59b',
  greenBg:     'rgba(74,245,155,0.12)',
  greenBorder: 'rgba(74,245,155,0.25)',

  blue:        '#4ab4f5',
  blueBg:      'rgba(74,180,245,0.12)',
  blueBorder:  'rgba(74,180,245,0.2)',
} as const;

export const radius = {
  sm: 8,
  md: 14,
  full: 999,
} as const;

export const fonts = {
  regular: 'Manrope_400Regular',
  medium:  'Manrope_500Medium',
  semibold:'Manrope_600SemiBold',
  display: 'Unbounded_700Bold',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
} as const;
