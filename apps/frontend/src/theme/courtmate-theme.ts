export const courtmateColors = {
  // Brand palette from the CourtMate logo: navy, court blue, yellow and white.
  background: '#00102F',
  backgroundSecondary: '#061A3D',
  backgroundElevated: '#0B2450',

  // Glassmorphism surface
  surface: 'rgba(255,255,255,0.05)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  surfaceBorder: 'rgba(255,255,255,0.10)',

  // Accent chính — cam da bóng rổ
  primary: '#0077FF',
  primaryHover: '#248AFF',
  primaryPressed: '#005FD1',
  primaryMuted: 'rgba(0,119,255,0.15)',

  // Accent phụ — teal đậm (Verified / Success)
  secondary: '#FFC400',
  secondaryHover: '#FFD138',
  secondaryPressed: '#D9A700',
  secondaryMuted: 'rgba(255,196,0,0.16)',

  // Semantic states
  warning: '#FFC400',
  warningMuted: 'rgba(255,196,0,0.15)',
  danger: '#E8483B',
  dangerMuted: 'rgba(232,72,59,0.15)',
  success: '#22C55E',
  info: '#0077FF',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B8C7E0',
  textDisabled: '#6F809F',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#00102F',

  // Border / Divider
  border: 'rgba(255,255,255,0.10)',
  divider: 'rgba(255,255,255,0.06)',
};

export const courtmateGradients = {
  courtCTA: ['#0077FF', '#005FD1'] as const,
  verifiedBadge: ['#FFC400', '#E0A900'] as const,
  glassCard: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)'] as const,
};

export const courtmateShadows = {
  primaryGlow: {
    shadowColor: '#0077FF',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8, // Android
  },
  cardElevated: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};
