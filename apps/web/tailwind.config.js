/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--cm-primary) / <alpha-value>)',
          dark: 'rgb(var(--cm-primary-hover) / <alpha-value>)',
          light: 'rgb(var(--cm-primary) / <alpha-value>)', soft: 'rgb(var(--cm-primary-light) / <alpha-value>)',
        },
        canvas: 'rgb(var(--cm-background) / <alpha-value>)',
        ink: 'rgb(var(--cm-text) / <alpha-value>)',
        muted: 'rgb(var(--cm-muted) / <alpha-value>)',
        'on-primary': '#ffffff',
        secondary: '#00102F',
        navy: {
          DEFAULT: '#00102F',
          deep: '#000b21',
          light: '#0a1d45',
        },
        surface: {
          DEFAULT: 'rgb(var(--cm-surface) / <alpha-value>)',
          card: 'rgb(var(--cm-surface) / <alpha-value>)',
          dim: 'rgb(var(--cm-surface-muted) / <alpha-value>)',
          border: 'rgb(var(--cm-border) / <alpha-value>)',
        },
        court: {
          green: '#22C55E',
          orange: '#FFC400',
          blue: '#0077FF',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: { lg: 'var(--cm-radius-sm)', xl: 'var(--cm-radius-control)', '2xl': 'var(--cm-radius-card)', '3xl': 'var(--cm-radius-feature)', feature: 'var(--cm-radius-feature)' },
      boxShadow: {
        xs: 'var(--cm-shadow-subtle)', sm: 'var(--cm-shadow-subtle)', md: 'var(--cm-shadow-card)', lg: 'var(--cm-shadow-elevated)', xl: 'var(--cm-shadow-elevated)', '2xl': 'var(--cm-shadow-elevated)', card: 'var(--cm-shadow-card)', interactive: 'var(--cm-shadow-interactive)',
        'soft': 'var(--cm-shadow-card)',
        'elevated': 'var(--cm-shadow-elevated)',
        'glow': 'var(--cm-shadow-interactive)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        },
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }
      })
    }
  ],
};
