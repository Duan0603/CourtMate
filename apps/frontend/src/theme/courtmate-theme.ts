export const courtmateColors = {
  // Base — nền tối chủ đạo, ngả nâu-than ấm
  background: '#14100E',
  backgroundSecondary: '#1E1815',
  backgroundElevated: '#241C18',        // card nổi không dùng glass

  // Glassmorphism surface
  surface: 'rgba(255,255,255,0.05)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  surfaceBorder: 'rgba(255,255,255,0.10)',

  // Accent chính — cam da bóng rổ
  primary: '#FF6B35',
  primaryHover: '#FF7F4D',
  primaryPressed: '#E85A2A',
  primaryMuted: 'rgba(255,107,53,0.15)',

  // Accent phụ — teal đậm (Verified / Success)
  secondary: '#1FA598',
  secondaryHover: '#26BAAB',
  secondaryPressed: '#178F84',
  secondaryMuted: 'rgba(31,165,152,0.15)',

  // Semantic states
  warning: '#F2B84B',
  warningMuted: 'rgba(242,184,75,0.15)',
  danger: '#E8483B',
  dangerMuted: 'rgba(232,72,59,0.15)',
  success: '#1FA598',
  info: '#E8A24C',

  // Text
  textPrimary: '#F5F0EB',
  textSecondary: '#A69C93',
  textDisabled: '#5C5550',
  textOnPrimary: '#14100E',   // chữ đặt trên nền cam
  textOnSecondary: '#0A1A18', // chữ đặt trên nền teal

  // Border / Divider
  border: 'rgba(255,255,255,0.10)',
  divider: 'rgba(255,255,255,0.06)',
};

export const courtmateGradients = {
  courtCTA: ['#FF6B35', '#E8483B'] as const,        // dùng với expo-linear-gradient
  verifiedBadge: ['#1FA598', '#14746A'] as const,
  glassCard: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)'] as const,
};

export const courtmateShadows = {
  primaryGlow: {
    shadowColor: '#FF6B35',
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
