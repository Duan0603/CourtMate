/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: '#0077FF',
        'on-primary': '#ffffff',
        secondary: '#00102F',
        background: '#F7FAFF',
        surface: {
          DEFAULT: '#ffffff',
          card: '#ffffff',
          dim: '#dcd9db',
        },
        'surface-dim': '#DDE7F5',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#F1F6FD',
        'surface-container': '#EAF1FA',
        'surface-container-high': '#E2EBF7',
        'surface-container-highest': '#D9E5F4',
        outline: '#64748B',
        'outline-variant': '#B7C5D8',
        error: '#b3261e',
        navy: {
          DEFAULT: '#00102F',
          deep: '#00102F',
        },
        blue: {
          DEFAULT: '#0077FF',
          vibrant: '#0077FF',
        },
        green: {
          DEFAULT: '#22C55E',
          success: '#22C55E',
        },
        orange: {
          DEFAULT: '#FFC400',
          highlight: '#E0A900',
        },
        gray: {
          DEFAULT: '#F8FAFC',
          light: '#F8FAFC',
          border: '#7c747a',
          connector: '#CBD5E1',
        },
        'on-surface-variant': '#52627A',
        'on-surface': '#00102F',
        'secondary-container': '#00102F',
        'on-secondary-container': '#ffffff',
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.04em', fontWeight: '800' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'label-xs': ['10px', { lineHeight: '14px', fontWeight: '500' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        'sm': '0.25rem',   // 4px
        DEFAULT: '0.5rem', // 8px
        'md': '0.75rem',   // 12px
        'lg': '1rem',      // 16px
        'xl': '1.5rem',    // 24px
        'full': '9999px',
      },
      boxShadow: {
        'level-1': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'level-2': '0 8px 16px 0 rgba(0, 0, 0, 0.10)',
        'overlay': '0 16px 32px 0 rgba(15, 23, 42, 0.15)',
      }
    },
  },
  plugins: [],
}
