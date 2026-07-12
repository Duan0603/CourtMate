/** @type {import('tailwindcss').Config} */
module.exports = {
  // Path to all components and screens for styling parsing
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
        primary: '#1d4ed8',
        'on-primary': '#ffffff',
        secondary: '#1e293b',
        background: '#fcf8fa',
        surface: {
          DEFAULT: '#ffffff',
          card: '#ffffff',
          dim: '#dcd9db',
        },
        'surface-dim': '#dcd9db',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f6f3f5',
        'surface-container': '#f0edef',
        'surface-container-high': '#eae7e9',
        'surface-container-highest': '#e4e2e4',
        outline: '#7c747a',
        'outline-variant': '#7c747a',
        error: '#b3261e',
        navy: {
          DEFAULT: '#1e293b',
          deep: '#1e293b',
        },
        blue: {
          DEFAULT: '#1d4ed8',
          vibrant: '#1d4ed8',
        },
        green: {
          DEFAULT: '#22C55E',
          success: '#22C55E',
        },
        orange: {
          DEFAULT: '#F97316',
          highlight: '#F97316',
        },
        gray: {
          DEFAULT: '#F8FAFC',
          light: '#F8FAFC',
          border: '#7c747a',
          connector: '#CBD5E1',
        },
        'on-surface-variant': '#45464d',
        'on-surface': '#1e293b',
        'secondary-container': '#1d4ed8',
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
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],
      },
      spacing: {
        'base': '4px',
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
