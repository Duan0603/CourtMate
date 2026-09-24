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
          DEFAULT: '#0077FF',
          dark: '#005ecc',
          light: '#3392ff',
        },
        'on-primary': '#ffffff',
        secondary: '#00102F',
        navy: {
          DEFAULT: '#00102F',
          deep: '#000b21',
          light: '#0a1d45',
        },
        surface: {
          DEFAULT: '#ffffff',
          card: '#ffffff',
          dim: '#F1F6FD',
          border: '#E2E8F0',
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
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 16, 47, 0.06)',
        'elevated': '0 12px 32px -4px rgba(0, 16, 47, 0.12)',
        'glow': '0 0 25px rgba(0, 119, 255, 0.25)',
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
